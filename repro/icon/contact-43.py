"""Contact sheet for the 4:3 round.

Unlike the square round, the ink is not squared off: the trimmed artwork is
padded out to a 4:3 frame so the landscape composition survives. Each candidate
is drawn at three chip-sized 4:3 boxes on both pane fills.

A render whose alpha is opaque everywhere (the generator ignored the transparent
background) is reported as unusable rather than silently becoming a solid block.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).parent
OUT = HERE / "image2_out"

CANDIDATES = [
    ("M-board-43", "gpt-image2-20261024-232939-76hihb.png"),
    ("N-clip-43", "gpt-image2-20261024-232843-ta2m7x.png"),
    ("O-list-43", "gpt-image2-20261024-232859-3h5bp2.png"),
]

# 4:3 boxes, the largest being 4x the chip's.
SIZES = [(18, 14), (24, 18), (36, 27)]
RATIO = 4 / 3
LIGHT = (255, 255, 255, 255)
DARK = (28, 28, 30, 255)
INK_LIGHT = (28, 28, 30, 255)
INK_DARK = (240, 240, 245, 255)


def prepare(path: Path) -> Image.Image | None:
    """Trim to ink, pad to 4:3, and return the alpha mask."""
    source = Image.open(path).convert("RGBA")
    alpha = source.getchannel("A")
    if alpha.getextrema() == (255, 255):
        print(f"  {path.name}: alpha is opaque everywhere - no transparent background")
        return None
    solid = alpha.point(lambda v: 255 if v >= 8 else 0)
    box = solid.getbbox()
    if box is None:
        print(f"  {path.name}: no ink")
        return None
    alpha = alpha.crop(box)
    alpha = alpha.point(lambda v: 0 if v < 8 else min(255, round((v - 8) * 255 / 247)))

    # Pad out to 4:3 without stretching: the ink keeps its proportions.
    width, height = alpha.size
    if width / height < RATIO:
        width = round(height * RATIO)
    else:
        height = round(width / RATIO)
    frame = Image.new("L", (width, height), 0)
    frame.paste(alpha, ((width - alpha.width) // 2, (height - alpha.height) // 2))
    return frame.resize((256, 192), Image.LANCZOS)


def main() -> None:
    cell_w, cell_h = 170, 110
    sheet = Image.new("RGBA", (cell_w * len(SIZES) + 130, cell_h * len(CANDIDATES) + 40), (245, 245, 247, 255))
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 12), "candidate", fill=(20, 20, 20, 255))
    for column, (w, h) in enumerate(SIZES):
        draw.text((130 + column * cell_w + 10, 12), f"{w}x{h}", fill=(20, 20, 20, 255))

    for row, (name, filename) in enumerate(CANDIDATES):
        print(f"{name}:")
        mask = prepare(OUT / filename)
        y = 40 + row * cell_h
        draw.text((10, y + 30), name, fill=(20, 20, 20, 255))
        if mask is None:
            draw.text((130, y + 30), "unusable", fill=(180, 30, 30, 255))
            continue
        for column, (w, h) in enumerate(SIZES):
            x = 130 + column * cell_w
            draw.rectangle([x, y, x + 75, y + 80], fill=LIGHT)
            draw.rectangle([x + 75, y, x + 150, y + 80], fill=DARK)
            for half, ink in ((0, INK_LIGHT), (75, INK_DARK)):
                small = mask.resize((w, h), Image.LANCZOS)
                layer = Image.new("RGBA", (w, h), ink)
                layer.putalpha(small)
                sheet.alpha_composite(layer, (x + half + (75 - w) // 2, y + (80 - h) // 2))

    target = HERE / "contact-43.png"
    sheet.save(target)
    print(f"wrote {target}")


if __name__ == "__main__":
    sys.exit(main())
