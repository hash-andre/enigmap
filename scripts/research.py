"""Download public research references to /tmp only; never publish editorial images/text."""
from pathlib import Path
from urllib.request import urlopen, Request
from html import unescape
import re, json, time

ROOT = Path('/tmp/enigmap-research')
ROOT.mkdir(exist_ok=True)
BASE = 'https://www.gamerguides.com'
areas = ['bleake-island', 'miagani-island', 'founders-island', 'port-adams-subway', 'stagg-airships', 'panessa-studios', 'arkham-knight-hq']
kinds = ['riddler-trophy-locations', 'riddle-locations-and-solutions', 'breakable-object-locations', 'bomb-rioter-locations']

def fetch(url, path):
    if path.exists(): return path.read_bytes()
    for attempt in range(4):
        try:
            data = urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read()
            path.write_bytes(data)
            return data
        except Exception:
            if attempt == 3: raise
            time.sleep(1)

def plain(s):
    s = re.sub(r'<(?:script|style)\b[^>]*>.*?</(?:script|style)>', '', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', unescape(s)).strip()

result = []
for area in areas:
    for kind in kinds:
        if kind == 'bomb-rioter-locations' and area not in areas[:2]: continue
        if kind == 'riddle-locations-and-solutions' and area == 'port-adams-subway': continue
        slug = area + '-' + kind
        url = f'{BASE}/batman-arkham-knight/guide/collectibles-guide/{area}-collectible-locations/{kind}'
        try:
            html = fetch(url, ROOT / (slug + '.html')).decode()
            content = html.split('guide-page-content-body markup">')[1].split('id="comments"')[0]
            content = content.split('guide-page-content-footer')[0]
            paragraphs = re.findall(r'<(?:p|h[2-6]|li)\b[^>]*>(.*?)</(?:p|h[2-6]|li)>', content, re.S)
            text = '\n'.join(plain(p) for p in paragraphs)
            (ROOT / (slug+'.txt')).write_text(text)
            images = list(dict.fromkeys(re.findall(r'data-orig-src="([^"]+)"', content)))
            for i, src in enumerate(images[:3]):
                fetch(BASE + src, ROOT / (slug+f'-{i}.jpg'))
            result.append({'area':area, 'kind':kind, 'url':url, 'text':text, 'images':images})
            print(slug, len(text), len(images), flush=True)
        except Exception as e: print(slug, 'ERROR', str(e), flush=True)
(ROOT/'references.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
