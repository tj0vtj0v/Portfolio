"""Create bounded transparent RGB and NDVI previews from the completed TIFF."""

from pathlib import Path

import numpy as np
import tifffile
from PIL import Image, ImageDraw


SOURCE = Path("docs/design/reference/Full_Orthophoto-Testflights-CompletePipelinetest.tif")
TARGET = Path("public/images/portfolio/drone-map.png")
NDVI_TARGET = Path("public/images/portfolio/drone-ndvi.png")
COMPARISON_TARGET = Path("public/images/portfolio/drone-comparison.png")
MAX_EDGE = 1200
RESPONSIVE_WIDTHS = (320, 640, 960)


def alpha_bounds(data: np.memmap) -> tuple[int, int, int, int]:
    """Return the smallest source rectangle containing non-transparent pixels."""
    top = data.shape[0]
    left = data.shape[1]
    bottom = right = -1

    for row in range(0, data.shape[0], 512):
        alpha = np.asarray(data[row:row + 512, :, 7])
        rows, columns = np.nonzero(alpha > 0)
        if rows.size == 0:
            continue
        top = min(top, row + int(rows.min()))
        bottom = max(bottom, row + int(rows.max()))
        left = min(left, int(columns.min()))
        right = max(right, int(columns.max()))

    if bottom < top or right < left:
        raise ValueError("The TIFF does not contain any opaque pixels.")
    return top, left, bottom + 1, right + 1


def area_average(
    data: np.memmap,
    top: int,
    left: int,
    bottom: int,
    right: int,
    output_height: int,
    output_width: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Downsample with area averaging while preserving transparent no-data pixels."""
    y_edges = np.rint(np.linspace(top, bottom, output_height + 1)).astype(np.int64)
    x_edges = np.rint(np.linspace(left, right, output_width + 1)).astype(np.int64)
    x_starts = x_edges[:-1] - left
    output = np.zeros((output_height, output_width, 5), dtype=np.float32)
    alpha = np.zeros((output_height, output_width), dtype=np.uint8)

    # Keep RGB, multispectral Red, and multispectral NIR. The other source bands
    # are not needed by either preview and would only increase memory pressure.
    band_indices = [0, 1, 2, 3, 6]
    for row_index, (y_start, y_end) in enumerate(zip(y_edges[:-1], y_edges[1:])):
        block = np.asarray(data[y_start:y_end, left:right, :])
        source_alpha = np.clip(block[..., 7], 0, 255).astype(np.float32)
        weights = source_alpha / 255
        spectral = block[..., band_indices].astype(np.float32)
        weighted_spectral = spectral * weights[..., None]

        spectral_sums = np.add.reduceat(weighted_spectral, x_starts, axis=1).sum(axis=0)
        weight_sums = np.add.reduceat(weights, x_starts, axis=1).sum(axis=0)
        output[row_index] = spectral_sums / np.maximum(weight_sums[:, None], 1e-6)

        alpha_sums = np.add.reduceat(source_alpha, x_starts, axis=1).sum(axis=0)
        block_area = block.shape[0] * np.diff(x_edges)
        alpha[row_index] = np.clip(alpha_sums / block_area, 0, 255).astype(np.uint8)

    return output, alpha


def save_responsive(image: Image.Image, target: Path) -> None:
    """Write transparent-aware Lanczos derivatives for responsive image loading."""
    responsive_directory = target.parent / "responsive"
    responsive_directory.mkdir(parents=True, exist_ok=True)
    source = np.asarray(image).astype(np.float32)
    source_alpha = source[..., 3:4] / 255
    premultiplied = np.rint(source[..., :3] * source_alpha).astype(np.uint8)
    premultiplied_image = Image.fromarray(premultiplied, mode="RGB")
    alpha_image = Image.fromarray(np.rint(source_alpha[..., 0] * 255).astype(np.uint8), mode="L")

    for width in RESPONSIVE_WIDTHS:
        height = max(1, round(image.height * width / image.width))
        resized_rgb = np.asarray(
            premultiplied_image.resize((width, height), Image.Resampling.LANCZOS),
            dtype=np.float32,
        )
        resized_alpha = np.asarray(
            alpha_image.resize((width, height), Image.Resampling.LANCZOS),
            dtype=np.uint8,
        )
        rgb = np.divide(
            resized_rgb * 255,
            resized_alpha[..., None],
            out=np.zeros_like(resized_rgb),
            where=resized_alpha[..., None] > 0,
        )
        output = np.concatenate((np.clip(np.rint(rgb), 0, 255).astype(np.uint8), resized_alpha[..., None]), axis=2)
        Image.fromarray(output, mode="RGBA").save(
            responsive_directory / f"{target.stem}-{width}.png",
            format="PNG",
            optimize=True,
        )


def save_comparison(left: Image.Image, right: Image.Image, target: Path) -> None:
    """Create a static half-and-half preview for the Home gallery tile."""
    left_rgba = np.asarray(left)
    right_rgba = np.asarray(right)
    split = left.width // 2
    comparison = left_rgba.copy()
    comparison[:, split:, :3] = right_rgba[:, split:, :3]
    comparison[..., 3] = np.minimum(left_rgba[..., 3], right_rgba[..., 3])
    comparison[comparison[..., 3] == 0, :3] = 0
    image = Image.fromarray(comparison, mode="RGBA")
    ImageDraw.Draw(image).line(
        [(split, 0), (split, image.height)],
        fill=(255, 255, 255, 220),
        width=max(2, round(image.width / 600)),
    )
    image.save(target, format="PNG", optimize=True)
    save_responsive(image, target)


def main() -> None:
    data = tifffile.memmap(SOURCE)
    top, left, bottom, right = alpha_bounds(data)
    height, width = bottom - top, right - left
    scale = min(1, MAX_EDGE / max(height, width))
    output_height = max(1, round(height * scale))
    output_width = max(1, round(width * scale))

    averaged, alpha = area_average(
        data,
        top,
        left,
        bottom,
        right,
        output_height,
        output_width,
    )

    rgb = np.clip(np.rint(averaged[..., :3]), 0, 255).astype(np.uint8)
    rgb[alpha == 0] = 0
    image = Image.fromarray(rgb, mode="RGB")
    image.putalpha(Image.fromarray(alpha, mode="L"))
    image.save(TARGET, format="PNG", optimize=True)
    save_responsive(image, TARGET)

    # NDVI uses the multispectral Red and NIR bands, not the RGB camera's red band.
    red = averaged[..., 3]
    nir = averaged[..., 4]
    denominator = nir + red
    ndvi = np.divide(nir - red, denominator, out=np.zeros_like(nir), where=denominator != 0)
    ndvi = np.clip(ndvi, -1, 1)
    valid_ndvi = ndvi[alpha > 0]
    low, high = np.percentile(valid_ndvi, [2, 98]) if valid_ndvi.size else (-1, 1)
    if high - low < 1e-6:
        low, high = -1, 1
    normalized = np.clip((ndvi - low) / (high - low), 0, 1)
    stops = np.array([0.0, 0.25, 0.5, 0.75, 1.0], dtype=np.float32)
    colors = np.array([
        [190, 35, 55],
        [239, 125, 55],
        [248, 215, 75],
        [150, 205, 70],
        [25, 145, 80],
    ], dtype=np.float32)
    ndvi_rgb = np.empty((*ndvi.shape, 3), dtype=np.uint8)
    for channel in range(3):
        ndvi_rgb[..., channel] = np.interp(normalized, stops, colors[:, channel]).astype(np.uint8)
    ndvi_rgb[alpha == 0] = 0
    ndvi_image = Image.fromarray(ndvi_rgb, mode="RGB")
    ndvi_image.putalpha(Image.fromarray(alpha, mode="L"))
    ndvi_image.save(NDVI_TARGET, format="PNG", optimize=True)
    save_responsive(ndvi_image, NDVI_TARGET)
    save_comparison(image, ndvi_image, COMPARISON_TARGET)
    print(f"{SOURCE} -> {TARGET}, {NDVI_TARGET}, {COMPARISON_TARGET}: {output_width}x{output_height}, NDVI range={low:.3f}..{high:.3f}, crop={left},{top},{right},{bottom}")


if __name__ == "__main__":
    main()
