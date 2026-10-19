from research import fetch, ROOT, plain
import re, json

# Independent references; only factual, manually curated records enter the app.
for n in range(1,7):
    url='https://www.gamesradar.com/batman-arkham-knight-riddler-guide/' + (f'{n}/' if n>1 else '')
    html=fetch(url,ROOT/f'gamesradar-{n}.html').decode()
    content=html.split('id="article-body"')[-1]
    lines=re.findall(r'<(?:p|h[2-6])\b[^>]*>(.*?)</(?:p|h[2-6])>',content,re.S)
    (ROOT/f'gamesradar-{n}.txt').write_text('\n'.join(plain(s) for s in lines))
    print('gamesradar',n,flush=True)
trials=['part-1-mental-blocked','part-2-balancing-act','part-3-numeracy-101','part-4-crushonator','part-5-flight-school','part-6-intro-to-physics','part-7-drain-pain','part-8-advanced-deathtraps','part-9-condamned','part-10-final-exam']
for i,slug in enumerate(trials):
    url='https://www.gamerguides.com/batman-arkham-knight/guide/most-wanted-mission-walkthroughs/riddlers-revenge/'+slug
    html=fetch(url,ROOT/f'trial-{i+1}.html').decode()
    content=html.split('guide-page-content-body markup">')[1]
    lines=re.findall(r'<(?:p|h[2-6]|li)\b[^>]*>(.*?)</(?:p|h[2-6]|li)>',content,re.S)
    (ROOT/f'trial-{i+1}.txt').write_text('\n'.join(plain(s) for s in lines).split('No Comments')[0])
    print('trial',i+1,flush=True)
