"""Build a contact sheet of the icon candidates at real chip sizes.

Each candidate is trimmed to its ink, squared, and drawn at 14px (the chip's
actual size), 28px, and 56px, on both the light and the dark pane fill, so the
question "is this legible in the tab" can be answered by looking rather than by
guessing from a 1254px render.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).parent
OUT = HERE / "image2_out"

CANDIDATES = [
    ("A-clipboard", "gpt-image2-20261024-222330-h8gslv.png"),
    ("B-checklist", "gpt-image2-20261024-222846-djasa3.png"),
    ("C-board", "gpt-image2-20261024-222830-wsbbha.png"),
    ("D-notebook", "gpt-image2-20261024-222804-hsme3m.png"),
    ("E-seal-filled", "gpt-image2-20261024-223247-bnwudo.png"),
    ("F-seal-line", "gpt-image2-20261024-223311-pbfqit.png"),
    ("G-square-check", "gpt-image2-20261024-223914-q6u3a2.png"),
    ("H-clipboard-hollow", "gpt-image2-20261024-224207-di2o8t.png"),
    ("I-list-bold", "gpt-image2-20261024-223933-9vhskj.png"),
    ("J-clipboard-bold", "gpt-image2-20261024-224756-1lgzbk.png"),
    ("K-list-check-bold", "gpt-image2-20261024-224739-ofqc7a.png"),
    ("L-square-check-bold", "gpt-image2-20261024-224839-ymrbf2.png"),
]

SIZES = [14, 28, 56]
LIGHT = (255, 255, 255, 255)
DARK = (28, 28, 30, 255)
INK_LIGHT = (28, 28, 30, 255)
INK_DARK = (240, 240, 245, 255)


def prepare(path: Path) -> Image.Image:
    """Trim to ink, square it, and return a white-ink alpha mask."""
    source = Image.open(path).convert("RGBA")
    alpha = source.getchannel("A")
    # The generator leaves a faint halo; ignore it when measuring the ink box.
    solid = alpha.point(lambda v: 255 if v >= 8 else 0)
    box = solid.getbbox()
    if box is None:
        raise SystemExit(f"no ink in {path.name}")
    alpha = alpha.crop(box)
    # Re-map 8..255 back to 0..255 so antialiasing survives the crop.
    alpha = alpha.point(lambda v: 0 if v < 8 else min(255, round((v - 8) * 255 / 247)))
    side = max(alpha.size)
    square = Image.new("L", (side, side), 0)
    square.paste(alpha, ((side - alpha.width) // 2, (side - alpha.height) // 2))
    return square.resize((256, 256), Image.LANCZOS)


def tint(mask: Image.Image, size: int, ink: tuple[int, int, int, int]) -> Image.Image:
    small = mask.resize((size, size), Image.LANCZOS)
    layer = Image.new("RGBA", (size, size), ink)
    layer.putalpha(small)
    return layer


def main() -> None:
    cell_w, cell_h = 150, 130
    rows = len(CANDIDATES)
    sheet = Image.new("RGBA", (cell_w * len(SIZES) + 120, cell_h * rows + 40), (245, 245, 247, 255))
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 12), "candidate", fill=(20, 20, 20, 255))
    for column, size in enumerate(SIZES):
        draw.text((120 + column * cell_w + 10, 12), f"{size}px", fill=(20, 20, 20, 255))

    for row, (name, filename) in enumerate(CANDIDATES):
        mask = prepare(OUT / filename)
        y = 40 + row * cell_h
        draw.text((10, y + 40), name, fill=(20, 20, 20, 255))
        for column, size in enumerate(SIZES):
            x = 120 + column * cell_w
            # Light pane half, dark pane half, so both themes are judged.
            draw.rectangle([x, y, x + 70, y + 100], fill=LIGHT)
            draw.rectangle([x + 70, y, x + 140, y + 100], fill=DARK)
            for half, ink in ((0, INK_LIGHT), (70, INK_DARK)):
                art = tint(mask, size, ink)
                sheet.alpha_composite(art, (x + half + (70 - size) // 2, y + (100 - size) // 2))

    target = HERE / "contact-sheet.png"
    sheet.save(target)
    print(f"wrote {target}")


if __name__ == "__main__":
    sys.exit(main())
