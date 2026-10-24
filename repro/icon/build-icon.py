"""Turn the chosen render into the tab icon asset.

The mark keeps its own colours now (§9.47, the layered workbench cards), so the
stored pixels matter and the alpha only decides where the artwork ends: drop the
generator's faint halo by thresholding alpha at 8, map 8..255 back to 0..255 so
antialiasing survives, trim to the ink, and downscale to a lossless WebP.

The frame is 1:1: the trimmed ink is padded out to a square rather than
stretched.
"""
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent
SOURCE = HERE / "image2_out" / "gpt-image2-20261024-234945-vvg417.png"
TARGET = (
    HERE.parent.parent
    / "packages"
    / "workbench"
    / "src"
    / "client"
    / "assets"
    / "tab-icon.webp"
)

SIZE = (128, 128)


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    alpha = source.getchannel("A")
    solid = alpha.point(lambda v: 255 if v >= 8 else 0)
    box = solid.getbbox()
    if box is None:
        raise SystemExit("no ink in the source render")
    print(f"ink box {box} ({box[2] - box[0]}x{box[3] - box[1]})")

    # The colours now travel with the artwork (§9.47), so the RGB stays and only
    # the alpha is cleaned: drop the generator's faint halo at 8 and remap
    # 8..255 back to 0..255 so the antialiasing survives.
    art = source.crop(box)
    art.putalpha(alpha.crop(box).point(lambda v: 0 if v < 8 else min(255, round((v - 8) * 255 / 247))))

    # Pad out to a square without stretching: the ink keeps its own proportions
    # and the extra room becomes the frame's air.
    width, height = art.size
    side = max(width, height)
    frame = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    frame.paste(art, ((side - width) // 2, (side - height) // 2), art)
    print(f"square frame {side}x{side}")

    # The artwork is drawn to its own edges, but the chip's box has to hold a
    # little air: the glyph it replaced kept its ink to 11/16 of the viewBox, so
    # the mark is inset to ~80% and the rest of the box stays empty.
    padded = round(side / 0.8)
    canvas = Image.new("RGBA", (padded, padded), (0, 0, 0, 0))
    canvas.paste(frame, ((padded - side) // 2, (padded - side) // 2), frame)

    art = canvas.resize(SIZE, Image.LANCZOS)
    # Shipped compressed, not lossless: for a colour artwork the quality is
    # audible in the gradient, and 92 keeps every band invisible while costing
    # a fraction of the lossless size.
    art.save(TARGET, format="WEBP", quality=92, method=6)
    print(f"wrote {TARGET} ({TARGET.stat().st_size} bytes), {SIZE[0]}x{SIZE[1]}, ink inset to 80%")


if __name__ == "__main__":
    sys.exit(main())
