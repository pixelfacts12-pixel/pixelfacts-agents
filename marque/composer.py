"""Compose la photo de profil et la bannière YouTube de Pixel Facts à partir des images générées."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

D = Path(__file__).parent
POLICE = "C:/Windows/Fonts/ariblk.ttf"  # Arial Black : gros, lisible sur téléphone


def texte_contour(draw, xy, txt, taille, couleur, contour=(40, 20, 80), ep=None, anchor="mm"):
    f = ImageFont.truetype(POLICE, taille)
    draw.text(xy, txt, font=f, fill=couleur, anchor=anchor, stroke_width=ep or max(4, taille // 12), stroke_fill=contour)


def ombre(img, decal=(0, 18), flou=18, opacite=110):
    a = img.split()[-1].point(lambda v: v * opacite // 255)
    o = Image.new("RGBA", img.size, (30, 20, 60, 0))
    o.putalpha(a)
    return o.filter(ImageFilter.GaussianBlur(flou)), decal


# Photo de profil 1024x1024 : mascotte qui salue sur fond bleu ciel dégradé (lisible en petit rond)
fond = Image.new("RGBA", (1024, 1024))
g = ImageDraw.Draw(fond)
for y in range(1024):
    t = y / 1023
    g.line([(0, y), (1024, y)], fill=(int(90 + 60 * t), int(205 - 40 * t), 255))
m = Image.open(D / "mascotte_coucou_transparent.png").convert("RGBA")
m = m.crop(m.getbbox())
m.thumbnail((800, 800))
o, (dx, dy) = ombre(m)
x, y = (1024 - m.width) // 2, (1024 - m.height) // 2 + 20
fond.alpha_composite(o, (x + dx, y + dy))
fond.alpha_composite(m, (x, y))
fond.convert("RGB").save(D / "photo_profil.png")

# Bannière YouTube 2560x1440 ; zone visible partout (téléphone) = 1546x423 au centre
b = Image.open(D / "fond_banniere.png").convert("RGBA").resize((2560, 1440), Image.LANCZOS)
voile = Image.new("RGBA", b.size, (0, 0, 0, 0))
ImageDraw.Draw(voile).rounded_rectangle((507, 520, 2053, 920), radius=60, fill=(255, 255, 255, 120))
b.alpha_composite(voile.filter(ImageFilter.GaussianBlur(8)))
m2 = Image.open(D / "mascotte_montre_transparent.png").convert("RGBA")
m2 = m2.crop(m2.getbbox())
m2.thumbnail((420, 420))
o, (dx, dy) = ombre(m2, (0, 12), 12)
b.alpha_composite(o, (560 + dx, 505 + dy))
b.alpha_composite(m2, (560, 505))
d = ImageDraw.Draw(b)
texte_contour(d, (1560, 670), "PIXEL FACTS", 140, (255, 214, 40), ep=12)
texte_contour(d, (1560, 810), "Les faits gaming qui te font dire « QUOI ?! »", 46, (255, 255, 255), ep=6)
b.convert("RGB").save(D / "banniere_youtube.png")
print("ok")
