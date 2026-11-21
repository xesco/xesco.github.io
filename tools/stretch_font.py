"""Stretch a pixel font vertically so it shows at a VGA monitor's 4:3 shape.

VGA text mode drew 9x16 character cells on a 4:3 screen, so its pixels were 1.35 times taller than wide.
Used at its native 16px the stretched font keeps every stroke exactly one pixel wide and gains height.

    python3 stretch_font.py PxPlus_IBM_VGA_9x16.ttf ../fonts/IBM_VGA_9x16_4x3.woff

Needs fontTools (pip install fonttools). Source font: The Ultimate Oldschool PC Font Pack by VileR,
https://int10h.org/oldschool-pc-fonts/, CC BY-SA 4.0. The stretched font is shared under the same licence.
"""
import sys
from fontTools.ttLib import TTFont

FACTOR = 1.35


def stretch(src, dst, factor=FACTOR):
    font = TTFont(src)
    glyf = font["glyf"]
    for name in font.getGlyphOrder():
        glyph = glyf[name]
        if glyph.isComposite():
            for part in glyph.components:
                part.y = round(part.y * factor)
        elif glyph.numberOfContours > 0:
            glyph.coordinates.scale((1, factor))
            glyph.coordinates.toInt()
    for name in font.getGlyphOrder():
        glyf[name].recalcBounds(glyf)

    def up(value):
        return round(value * factor)

    hhea, os2, post = font["hhea"], font["OS/2"], font["post"]
    hhea.ascent, hhea.descent, hhea.lineGap = up(hhea.ascent), up(hhea.descent), up(hhea.lineGap)
    os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap = up(os2.sTypoAscender), up(os2.sTypoDescender), up(os2.sTypoLineGap)
    os2.usWinAscent, os2.usWinDescent = up(os2.usWinAscent), up(os2.usWinDescent)
    for field in ("sxHeight", "sCapHeight", "yStrikeoutPosition", "yStrikeoutSize"):
        if hasattr(os2, field):
            setattr(os2, field, up(getattr(os2, field)))
    post.underlinePosition, post.underlineThickness = up(post.underlinePosition), up(post.underlineThickness)

    font.flavor = "woff" if dst.endswith(".woff") else None
    font.save(dst)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    stretch(sys.argv[1], sys.argv[2])
