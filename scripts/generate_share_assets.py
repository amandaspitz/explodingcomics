from __future__ import annotations

import html
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://explodingcomics.com"
PREVIEW_SIZE = (1200, 630)
ENTRY_PATTERN = re.compile(
    r'issueNumber:\s*(\d+),\s*issueTitle:\s*"((?:\\"|[^"])*)",\s*url:\s*"([^"]+)"',
    re.S,
)

LANG_CONFIG = {
    "eng": {
        "catalog_path": ROOT / "js" / "localEng.js",
        "comic_dir": ROOT / "assets" / "comics" / "eng",
        "share_dir": ROOT / "share" / "eng",
        "image_dir": ROOT / "assets" / "share" / "eng",
        "locale": "en_US",
        "lang": "en",
        "redirect_lang": "eng",
    },
    "pt": {
        "catalog_path": ROOT / "js" / "localPt.js",
        "comic_dir": ROOT / "assets" / "comics" / "pt",
        "share_dir": ROOT / "share" / "pt",
        "image_dir": ROOT / "assets" / "share" / "pt",
        "locale": "pt_BR",
        "lang": "pt",
        "redirect_lang": "pt",
    },
}


def parse_entries(catalog_path: Path) -> list[dict[str, str]]:
    catalog_text = catalog_path.read_text(encoding="utf-8")
    entries: list[dict[str, str]] = []

    for match in ENTRY_PATTERN.finditer(catalog_text):
        issue_number, issue_title, url = match.groups()
        entries.append(
            {
                "issue_number": int(issue_number),
                "issue_title": repair_mojibake(issue_title.replace('\\"', '"')),
                "url": url,
            }
        )

    return entries


def ensure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def repair_mojibake(text: str) -> str:
    if "Ã" not in text and "â" not in text:
        return text

    try:
        return text.encode("latin1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text


def build_default_share_image() -> Path:
    target_path = ROOT / "assets" / "share" / "site-default.jpg"
    ensure_directory(target_path.parent)

    canvas = Image.new("RGB", PREVIEW_SIZE, "#3d2d28")
    logo = Image.open(ROOT / "assets" / "images" / "logodarkmode4x.png").convert("RGBA")
    logo.thumbnail((650, 300), Image.LANCZOS)

    logo_x = (canvas.width - logo.width) // 2
    logo_y = (canvas.height - logo.height) // 2
    canvas.paste(logo, (logo_x, logo_y), logo)
    canvas.save(target_path, format="JPEG", quality=90, optimize=True)

    return target_path


def create_share_crop(source_image: Path, target_path: Path) -> None:
    ensure_directory(target_path.parent)

    image = Image.open(source_image).convert("RGB")
    target_ratio = PREVIEW_SIZE[0] / PREVIEW_SIZE[1]
    crop_width = image.width
    crop_height = round(crop_width / target_ratio)

    if crop_height > image.height:
        crop_height = image.height
        crop_width = round(crop_height * target_ratio)

    max_top = max(image.height - crop_height, 0)
    top = round(max_top * 0.22)
    left = max((image.width - crop_width) // 2, 0)

    cropped = image.crop((left, top, left + crop_width, top + crop_height))
    resized = cropped.resize(PREVIEW_SIZE, Image.LANCZOS)
    resized.save(target_path, format="JPEG", quality=88, optimize=True)


def build_description(issue_title: str, issue_number: int, lang_code: str) -> str:
    if lang_code == "pt":
        return f"Quadrinho #{issue_number}: {issue_title}, no Exploding Comics."

    return f'Comic #{issue_number}: {issue_title}, from Exploding Comics.'


def build_share_page(
    *,
    issue_number: int,
    issue_title: str,
    image_url: str,
    locale: str,
    lang: str,
    redirect_lang: str,
) -> str:
    page_title = f"{issue_title} | Exploding Comics"
    description = build_description(issue_title, issue_number, redirect_lang)
    redirect_url = f"{BASE_URL}/?lang={redirect_lang}#{issue_number}"
    share_url = f"{BASE_URL}/share/{redirect_lang}/{issue_number}.html"
    image_alt = f'Preview image for "{issue_title}" on Exploding Comics'

    return f"""<!DOCTYPE html>
<html lang="{lang}" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="utf-8" />
    <title>{html.escape(page_title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{html.escape(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="{html.escape(redirect_url)}" />

    <meta property="og:title" content="{html.escape(page_title)}" />
    <meta property="og:description" content="{html.escape(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{html.escape(share_url)}" />
    <meta property="og:site_name" content="Exploding Comics" />
    <meta property="og:locale" content="{locale}" />
    <meta property="og:image" content="{html.escape(image_url)}" />
    <meta property="og:image:secure_url" content="{html.escape(image_url)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="{PREVIEW_SIZE[0]}" />
    <meta property="og:image:height" content="{PREVIEW_SIZE[1]}" />
    <meta property="og:image:alt" content="{html.escape(image_alt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{html.escape(page_title)}" />
    <meta name="twitter:description" content="{html.escape(description)}" />
    <meta name="twitter:image" content="{html.escape(image_url)}" />

    <meta http-equiv="refresh" content="0; url={html.escape(redirect_url)}" />
    <script>
      window.location.replace("{html.escape(redirect_url)}");
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="{html.escape(redirect_url)}">{html.escape(page_title)}</a>...</p>
  </body>
</html>
"""


def main() -> None:
    default_share_image = build_default_share_image()

    for lang_code, config in LANG_CONFIG.items():
        entries = parse_entries(config["catalog_path"])
        ensure_directory(config["share_dir"])
        ensure_directory(config["image_dir"])

        for entry in entries:
            issue_number = entry["issue_number"]
            issue_title = entry["issue_title"]
            comic_path = config["comic_dir"] / entry["url"]
            share_image_path = config["image_dir"] / f"{issue_number}.jpg"

            if comic_path.exists():
                create_share_crop(comic_path, share_image_path)
            else:
                share_image_path.write_bytes(default_share_image.read_bytes())

            image_url = f"{BASE_URL}/assets/share/{lang_code}/{issue_number}.jpg"
            share_page = build_share_page(
                issue_number=issue_number,
                issue_title=issue_title,
                image_url=image_url,
                locale=config["locale"],
                lang=config["lang"],
                redirect_lang=config["redirect_lang"],
            )

            share_page_path = config["share_dir"] / f"{issue_number}.html"
            share_page_path.write_text(share_page, encoding="utf-8")


if __name__ == "__main__":
    main()
