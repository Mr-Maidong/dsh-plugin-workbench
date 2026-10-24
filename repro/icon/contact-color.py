"""Colour contact sheet: candidates rendered at the chip's own 4:3 box.

The artwork is no longer a mask - it keeps its own colours, so it is judged as
rendered on both sidebar fills rather than through a currentColor silhouette.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).parent
OUT = HERE / "image2_out"

CANDIDATES = [
    ("P-check", "gpt-image2-20261024-234506-6r7ejy.png"),
    ("Q-list", "gpt-image2-20261024-234350-2qah0q.png"),
    ("S-stack", "gpt-image2-20261024-234447-inf6oc.png"),
    ("R-tray", "gpt-image2-20261024-234414-ndj3sg.png"),
]

SIZES = [(19, 14), (28, 21), (38, 28)]
LIGHT = (255, 255, 255, 255)
DARK = (28, 28, 30, 255)


def main() -> None:
    cell_w, cell_h = 120, 72
    sheet = Image.new("RGBA", (130 + cell_w * len(CANDIDATES) + 10, 30 + cell_h * len(SIZES)), (245, 245, 247, 255))
    draw = ImageDraw.Draw(sheet)
    for row, (w, h) in enumerate(SIZES):
        draw.text((12, 30 + row * cell_h + 24), f"{w}x{h}", fill=(20, 20, 20, 255))
    for column, (name, _) in enumerate(CANDIDATES):
        draw.text((130 + column * cell_w + 6, 10), name, fill=(20, 20, 20, 255))

    for row, (w, h) in enumerate(SIZES):
        y = 30 + row * cell_h
        for column, (name, filename) in enumerate(CANDIDATES):
            x = 130 + column * cell_w
            source = Image.open(OUT / filename).convert("RGBA")
            alpha = source.getchannel("A")
            if alpha.getextrema() == (255, 255):
                draw.text((x, y), "opaque", fill=(180, 30, 30, 255))
                continue
            solid = alpha.point(lambda v: 255 if v >= 8 else 0)
            box = solid.getbbox()
            art = source.crop(box)
            for half, fill in ((0, LIGHT), (56, DARK)):
                draw.rectangle([x + half, y, x + half + 56, y + 68], fill=fill)
                small = art.resize((w, h), Image.LANCZOS)
                sheet.alpha_composite(small, (x + half + (56 - w) // 2, y + (68 - h) // 2))

    target = HERE / "contact-color.png"
    sheet.save(target)
    print(f"wrote {target}")


if __name__ == "__main__":
    sys.exit(main())
