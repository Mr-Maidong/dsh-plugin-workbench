"""Check the shipped asset at the size the chip actually draws it.

The mark keeps its own colours, so this renders `tab-icon.webp` the way the
component does - as a plain image inside the chip's 14px box - on both sidebar
fills, at the chip's own box first and then multiples.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).parent
ASSET = HERE.parent.parent / "packages" / "workbench" / "src" / "client" / "assets" / "tab-icon.webp"

LIGHT = (255, 255, 255, 255)
DARK = (28, 28, 30, 255)

# The chip's own box first, then multiples of it.
SIZES = [14, 20, 28, 42]


def main() -> None:
    art = Image.open(ASSET).convert("RGBA")
    alpha = art.getchannel("A")
    print(f"asset {art.size[0]}x{art.size[1]}, opaque box {alpha.getbbox()}")

    sheet = Image.new("RGBA", (len(SIZES) * 100 + 20, 200), (245, 245, 247, 255))
    draw = ImageDraw.Draw(sheet)
    for column, size in enumerate(SIZES):
        x = 20 + column * 100
        draw.text((x, 10), f"{size}px", fill=(20, 20, 20, 255))
        draw.rectangle([x, 30, x + 45, 140], fill=LIGHT)
        draw.rectangle([x + 45, 30, x + 90, 140], fill=DARK)
        for half in (0, 45):
            small = art.resize((size, size), Image.LANCZOS)
            sheet.alpha_composite(small, (x + half + (45 - size) // 2, 30 + (110 - size) // 2))

    target = HERE / "final-check.png"
    sheet.save(target)
    print(f"wrote {target}")


if __name__ == "__main__":
    sys.exit(main())
