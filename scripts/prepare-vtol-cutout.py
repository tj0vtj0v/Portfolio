"""Remove only near-white connected regions exceeding 10% of the image."""
from pathlib import Path
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1]
source = cv2.imread(str(root / 'docs/materials/vtol-neutral.png'))
assert source is not None
mask = np.all(source >= 240, axis=2).astype(np.uint8)
count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
alpha = np.full(mask.shape, 255, dtype=np.uint8)
removed = 0
for label in range(1, count):
    if stats[label, cv2.CC_STAT_AREA] > mask.size * .1:
        alpha[labels == label] = 0
        removed += 1
assert removed, 'No qualifying background region found'
output = cv2.cvtColor(source, cv2.COLOR_BGR2BGRA)
output[:, :, 3] = alpha
assert cv2.imwrite(str(root / 'public/images/portfolio/vtol-cutout.png'), output)
print(f'Removed {removed} regions; {np.mean(alpha == 0):.1%} transparent; remaining RGB pixels unchanged.')
