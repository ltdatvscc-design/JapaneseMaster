"""Optional build-time asset preparation; requires Pillow, not used by Vite runtime."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
output = root / 'src' / 'assets'
output.mkdir(exist_ok=True)
for name, quality in [('city-desktop', 82), ('city-mobile', 78), ('city-foreground', 84)]:
    with Image.open(root / 'design' / 'forgotten-kana-city' / f'{name}.png') as image:
        image.save(output / f'{name}.webp', 'WEBP', quality=quality, method=6)
