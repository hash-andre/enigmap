"""English translations of the original Italian notes; stable point IDs are unchanged."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
def notes(path):
 out={}
 for line in path.read_text().splitlines():
  if line.startswith('['):key=line[1:-1];out[key]=[]
  elif line.strip():out[key].append(line.split('|',1))
 return out
trophies=notes(ROOT/'scripts/trophies.en.txt');other=notes(ROOT/'scripts/other-points.en.txt')
result={}
for p in json.loads((ROOT/'src/data/catalog.json').read_text()):
 title,step=(trophies[p['area']] if p['category']=='trophy' else other[p['area']+'-'+p['category']])[p['number']-1]
 # Explicit boundaries preserve the original list; never infer them from English
 # sentence punctuation or merge several original steps into a paragraph.
 steps=[part.strip() for part in step.split(' || ')]
 if p['category']=='breakable':
  steps.append('Destroy it with the Batmobile cannon.' if p['area'] in ['bleake','miagani','founders','subway'] else 'Grab the ring with the Batclaw and pull it down.' if p['area']=='stagg' else 'Destroy the jack-in-the-box with a Batarang.' if p['area']=='panessa' else 'Destroy the spider drone with a Batarang.')
 elif p['category']=='bomb':
  steps.extend(['Fly a Remote Controlled Batarang close to the rioters until you identify the target highlighted in red.','Disarm the bomb by hitting the target with the Remote Electrical Charge. Alternatively, fly a Batarang through nearby sparks to electrify it and guide it into the target.'])
 assert len(steps)==len(p['steps']), f"{p['id']}: expected {len(p['steps'])} steps, got {len(steps)}; add explicit ' || ' boundaries"
 assert all(steps), f"{p['id']}: empty translated step"
 result[p['id']]={'title':title,'steps':steps}
assert len(result)==315
(ROOT/'src/data/catalog.en.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('315 English point translations generated.')
