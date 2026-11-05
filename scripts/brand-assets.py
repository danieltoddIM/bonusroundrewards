"""Regenerate precise brand/metadata PNGs. Optional authoring tool; requires Pillow.
These generated assets are committed. No Python dependency is needed to build/deploy.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'site/assets/brand'
OUT.mkdir(parents=True, exist_ok=True)
NAVY, LIME, PAPER = '#102E50', '#D5F477', '#F7F9F4'

for size, filename in [(32,'favicon-32.png'),(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:
    scale = 4
    im = Image.new('RGB', (size*scale,size*scale), NAVY)
    draw = ImageDraw.Draw(im)
    s = size*scale
    draw.ellipse((s*.19,s*.19,s*.81,s*.81),outline=LIME,width=round(s*.125))
    draw.polygon([(s*.45,s*.33),(s*.67,s*.5),(s*.45,s*.67)],fill=LIME)
    im.resize((size,size),Image.Resampling.LANCZOS).save(OUT/filename,optimize=True)

im = Image.new('RGB',(1200,630),NAVY)
d = ImageDraw.Draw(im)
regular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
if not Path(bold).exists():
    raise SystemExit('Install DejaVu Sans or update the authoring font paths in brand-assets.py.')
d.ellipse((835,-150,1335,350),fill=LIME)
d.ellipse((920,245,1330,655),outline='#54718D',width=2)
d.ellipse((70,61,118,109),outline=LIME,width=8)
d.polygon([(91,77),(103,85),(91,93)],fill=LIME)
d.text((134,63),'BONUS ROUND',font=ImageFont.truetype(bold,31),fill=PAPER)
d.text((70,200),'Play games.',font=ImageFont.truetype(bold,83),fill=PAPER)
d.text((70,309),'Earn gift cards.',font=ImageFont.truetype(bold,83),fill=LIME)
d.text((74,508),'A little play. A little more to look forward to.',font=ImageFont.truetype(regular,25),fill=PAPER)
d.text((74,560),'bonusroundrewards.com',font=ImageFont.truetype(regular,20),fill='#CFDCE6')
im.save(OUT/'social-card.png',optimize=True)
print('Created favicon, application icons, and 1200 × 630 social card.')
