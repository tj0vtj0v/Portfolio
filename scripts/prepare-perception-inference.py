"""Run the trained detector on the real stacked input and export thin boxes."""
import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('YOLO_CONFIG_DIR', str(ROOT / '.angular' / 'yolo'))
Path(os.environ['YOLO_CONFIG_DIR']).mkdir(parents=True, exist_ok=True)
import cv2
from ultralytics import YOLO

parser = argparse.ArgumentParser()
parser.add_argument('--weights', type=Path, default=Path('D:/Git/FFD/0_new_approach/runs/fast-detection_26s_960-2/weights/best.pt'))
args = parser.parse_args()
source = ROOT / 'docs/materials/perception-model.png'
frame = cv2.imread(str(source))
assert frame is not None and frame.shape == (960, 960, 3)
layout_text = (ROOT / 'src/app/features/portfolio/perception-layout.ts').read_text(encoding='utf-8')
layout = json.loads(layout_text[layout_text.index('{'):layout_text.rindex('}') + 1])
original = cv2.imread(str(ROOT / 'docs/design/reference/train_1061.jpg'))
assert original is not None
result = YOLO(str(args.weights)).predict(frame, imgsz=960, conf=0.3, iou=0.7, device='cpu', save=False, verbose=False)[0]
records = []
for box in result.boxes:
    xyxy = box.xyxy[0].cpu().tolist()
    name = result.names[int(box.cls.item())]
    color = (255, 150, 50) if 'blue' in name.lower() else (30, 220, 255) if 'yellow' in name.lower() else (0, 140, 255)
    x1, y1, x2, y2 = [round(v) for v in xyxy]
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 4, cv2.LINE_AA)
    split = layout['model']['split']
    region = layout['overview'] if (xyxy[1] + xyxy[3]) / 2 < split else layout['crop']
    offset = 0 if region is layout['overview'] else split
    scale_x = region['width'] / layout['model']['width']
    scale_y = region['height'] / split
    mapped = [xyxy[0] * scale_x + region['x'],
              (max(offset, xyxy[1]) - offset) * scale_y + region['y'],
              xyxy[2] * scale_x + region['x'],
              (min(offset + split, xyxy[3]) - offset) * scale_y + region['y']]
    mx1, my1, mx2, my2 = [round(v) for v in mapped]
    cv2.rectangle(original, (mx1, my1), (mx2, my2), color, 4, cv2.LINE_AA)
    records.append(dict(label=name, confidence=float(box.conf.item()), xyxy=xyxy, sourceXyxy=mapped))
output = ROOT / 'public/images/portfolio/perception-inference.png'
assert cv2.imwrite(str(output), frame)
assert cv2.imwrite(str(ROOT / 'public/images/portfolio/perception-projected.png'), original)
metadata = dict(model=args.weights.parent.parent.name, weightsSha256=hashlib.sha256(args.weights.read_bytes()).hexdigest(), inputSha256=hashlib.sha256(source.read_bytes()).hexdigest(), size=960, confidence=0.3, iou=0.7, lineWidth=4, detections=records)
(ROOT / 'docs/materials/perception-inference.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
print(f'{output}: {len(records)} detections')
