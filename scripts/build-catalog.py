"""Build factual catalog from temporary references and original Italian notes.

The app ships neither scraped prose nor editorial images. Run research.py first.
Marker positions indoors are digitized from the numbered reference maps.
"""
import json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RESEARCH=Path('/tmp/enigmap-research')
areas={'bleake':'bleake-island','miagani':'miagani-island','founders':'founders-island','subway':'port-adams-subway','stagg':'stagg-airships','panessa':'panessa-studios','hq':'arkham-knight-hq'}
kinds={'trophy':'riddler-trophy-locations','riddle':'riddle-locations-and-solutions','breakable':'breakable-object-locations','bomb':'bomb-rioter-locations'}
labels={'bleake':'Bleake Island','miagani':'Miagani Island','founders':'Founders’ Island','subway':'Metropolitana di Port Adams','stagg':'Dirigibili Stagg','panessa':'Panessa Studios','hq':'Quartier generale Arkham Knight'}

def notes(path):
    result={}
    for line in path.read_text().splitlines():
        if line.startswith('['): key=line[1:-1]; result[key]=[]
        elif line.strip(): result[key].append(line.split('|'))
    return result

trophies=notes(ROOT/'scripts/trophies.txt')
other=notes(ROOT/'scripts/other-points.txt')

# [x,y] measured on the reference image, rather than fabricated world coordinates.
indoor={
 'panessa':{
  'trophy':[(964,710),(947,784),(807,768),(697,630),(710,585),(530,552),(526,806),(311,803),(352,880),(284,200),(125,18),(5,73),(96,254),(161,375),(307,372),(581,389),(832,516),(766,455),(942,365),(925,216),(969,182)],
  'breakable':[(930,779),(696,719),(699,635),(540,724),(448,700),(506,802),(565,374),(413,230),(128,302),(145,375),(304,367),(642,377),(851,474),(878,341),(824,235)],
  'riddle':[(1105,805),(642,707),(415,695)]},
 'stagg':{
  'trophy':[(984,548),(1073,635),(984,531),(957,594),(901,567),(787,605),(526,624),(608,537),(608,632),(565,579),(286,469),(73,619),(911,135),(882,68),(741,244),(598,244),(698,57),(468,43),(76,141),(425,119),(351,261)],
  'breakable':[(945,687),(938,543),(776,495),(590,672),(530,518),(608,536),(380,486),(226,685),(116,552),(1100,69),(878,242),(689,180),(688,33),(158,110),(383,168)],
  'riddle':[(421,584),(730,65),(492,190)]},
 'subway':{
  'trophy':[(251,877),(421,483),(743,120),(874,128),(802,173),(825,176),(940,207),(938,62)],
  'breakable':[(306,861),(527,466),(697,496),(1010,170)]},
 'hq':{
  'trophy':[(107,693),(111,460),(63,65),(136,97),(168,622),(608,126),(558,13),(550,400),(526,331),(298,597),(332,50),(394,681),(1093,539),(1037,604),(935,622),(1018,681),(734,503),(746,471),(890,388),(860,332),(778,612)],
  'breakable':[(43,274),(172,357),(96,276),(21,630),(53,737),(526,119),(571,361),(413,457),(299,98),(1031,509),(936,623),(908,695),(739,517),(737,556),(881,443)],
  'riddle':[(449,250),(875,671),(785,547)]}
}

gadget_words={'Power Winch':'Verricello della Batmobile','Batmobile':'Batmobile','Voice Synthesizer':'Sintetizzatore vocale','Remote Hacking Device':'Dispositivo di hacking remoto','Remote Electrical Charge':'Carica elettrica remota','Freeze Blast':'Granata congelante','Disruptor':'Disturbatore','Line Launcher':'Lancia-cavo','Batclaw':'Bat-artiglio','Explosive Gel':'Gel esplosivo','Remote Control Batarang':'Batarang telecomandato','Remote Controlled Batarang':'Batarang telecomandato','Batarang':'Batarang','Forensics Scanner':'Scanner forense della Batmobile','Fear Multi-Takedown':'Eliminazione multipla per paura','Missile Barrage':'Missili multipli','EMP':'Impulso EMP'}

result=[]
for area,slug in areas.items():
 for category,kind in kinds.items():
  path=RESEARCH/f'{slug}-{kind}.txt'
  if not path.exists(): continue
  text=path.read_text()
  text=re.split(r'\n(?:\d+ Comments?|No Comments)\n',text)[0]
  heading={'trophy':'Riddler Trophy','riddle':'Riddle','breakable':'Breakable Object','bomb':'Bomb Rioter'}[category]
  # HQ's last breakable is mislabeled "Riddler Trophy 15" in the source.
  if area=='hq' and category=='breakable': text=text.replace('Riddler Trophy 15','Breakable Object 15')
  sections=re.split(r'\n'+heading+r' \d+\n', '\n'+text)[1:]
  entries=trophies[area] if category=='trophy' else other[area+'-'+category]
  assert len(sections)==len(entries),(area,category,len(sections),len(entries))
  for i,(raw,(title,solution)) in enumerate(zip(sections,entries),1):
   p={'id':f'{area}-{category}-{i:02}','number':i,'category':category,'area':area,'map':'gotham','title':title,'location':labels[area],'requirements':[], 'steps':[], 'sources':[{'label':'Gamer Guides · '+heading+f' {i:02}', 'url':f'https://www.gamerguides.com/batman-arkham-knight/guide/collectibles-guide/{slug}-collectible-locations/{kind}'}]}
   coords=re.search(r'Map Co-ordinates:\s*(\d{4})\s*,\s*(\d{4})',raw)
   if coords:
    p['gameCoordinates']=[int(coords[1]),int(coords[2])]
    p['position']=list(reversed(p['gameCoordinates']))
   elif area in indoor:
    p['position']=list(indoor[area][category][i-1])
   for word,label in gadget_words.items():
    if word in raw and label not in p['requirements']: p['requirements'].append(label)
   if area in ['bleake','miagani','founders'] and category=='trophy':
    gr={'bleake':1,'miagani':2,'founders':3}[area]
    p['sources'].append({'label':'GamesRadar · confronto', 'url':'https://www.gamesradar.com/batman-arkham-knight-riddler-guide/'+(str(gr)+'/' if gr>1 else '')})
   if area in ['stagg','panessa','hq'] and category=='trophy':
    gr={'stagg':4,'panessa':5,'hq':6}[area]
    p['sources'].append({'label':'GamesRadar · confronto','url':f'https://www.gamesradar.com/batman-arkham-knight-riddler-guide/{gr}/'})
   if area=='bleake' and category=='trophy' and i==10: p['requirements'].append('Quarta fase della missione Contrabbando completata')
   if area=='bleake' and category=='riddle' and i==2: p['requirements'].append('Prima fase di Creatura della notte completata')
   if area=='founders' and ((category=='trophy' and i==17) or (category=='riddle' and i==6)): p['requirements'].append('Accesso al Pretty Dolls Parlour: Il crimine perfetto')
   if area=='miagani' and category=='riddle' and i==7: p['requirements'].append('Eventi finali della storia completati')
   if area=='panessa':
    p['map']='panessa'
    p['requirements'].append('Accesso agli studi durante la storia')
    if category=='riddle' and i==1:p['requirements'].append('Ultima visita a Panessa nella storia')
    if category=='trophy' and i==12:p['requirements'].append('Potenziamento Disturbatore: mine')
    p['location']='Panessa · '+('Set B' if (category=='trophy' and 10<=i<=15) or (category=='breakable' and 7<=i<=11) else 'Set A' if (category=='trophy' and 7<=i<=9) or (category=='breakable' and 5<=i<=6) or (category=='riddle' and i==3) else 'Set C' if (category=='trophy' and i>=19) or (category=='breakable' and i>=14) else 'Backstage / quarantena')
   if area=='stagg':
    beta=(category=='trophy' and i>=13) or (category=='breakable' and i>=10) or (category=='riddle' and i>=2)
    p['map']='stagg-beta' if beta else 'stagg-alpha'
    p['location']='Dirigibile '+('Beta' if beta else 'Alpha')
    p['requirements'].append('Accesso ai dirigibili durante la storia')
    if category=='trophy' and i>=6:p['requirements'].append('Ripristina i controlli di stabilità dietro la serratura vocale su Alpha')
    if category=='trophy' and i==20:p['locationNote']='Il marker indica la cassa da spostare; il trofeo si raccoglie all’esterno, sulla piattaforma sotto Beta.'
   if area=='subway':
    p['map']='subway';p['requirements'].append('Accesso alla metropolitana dalla storia')
   if area=='hq':
    p['requirements'].append('Accesso al quartier generale durante la storia')
    if category=='trophy': floor={1:3,2:2,3:1,4:1,5:3,6:4,7:4,8:5,9:5,10:5,11:4,12:5}.get(i)
    elif category=='breakable':floor={1:2,2:2,3:2,4:3,5:3,6:4,7:5,8:5,9:4}.get(i)
    else:floor=4 if i==1 else None
    p['map']=f'hq-{floor}' if floor else 'hq-south'
    p['location']='Quartier generale · '+('ingresso nord / livello '+str(floor) if floor else 'ingresso sud')
   if category=='riddle':p['requirements'].append('Scansione in modalità Detective')
   if category=='breakable':
    action='Distruggilo con il cannone della Batmobile.' if area in ['bleake','miagani','founders','subway'] else 'Aggancia l’anello con il Bat-artiglio e tira.' if area=='stagg' else 'Distruggi il jack-in-the-box con un Batarang.' if area=='panessa' else 'Distruggi il drone ragno con un Batarang.'
    p['steps']=[solution,action]
    p['requirements']=['Batmobile' if area in ['bleake','miagani','founders','subway'] else 'Bat-artiglio' if area=='stagg' else 'Batarang']
   elif category=='bomb':
    p['steps']=[solution,'Pilota un Batarang telecomandato vicino ai rivoltosi finché individui quello evidenziato in rosso.','Disinnesca la bomba colpendolo con la carica elettrica remota. In alternativa, elettrifica un Batarang attraverso le scintille vicine e guidalo sul bersaglio.']
    p['requirements']=['Batarang telecomandato','Carica elettrica remota oppure Batarang elettrificato']
    p['locationNote']='Il marker indica la pedana di attivazione; il rivoltoso si muove nelle vicinanze. Le prove successive appaiono avanzando nelle sfide.'
   else:p['steps']=[s.strip() for s in re.split(r'(?<=[.!])\s+',solution) if s.strip()]
   if category=='trophy' and area in ['bleake','miagani','founders']:
    starts={'bleake':{12:[1665,3171],19:[3496,2540]},'miagani':{6:[2887,2171]},'founders':{6:[2147,1492],23:[2456,2663],31:[3253,2136]}}
    if i in starts.get(area,{}):p['start']=list(reversed(starts[area][i]))
   if area=='bleake' and category=='trophy' and i in [35,36]:
    p['title']='Piattaforma sotto Merchant Bridge' if i==35 else 'Chiosco del faro'
    p['steps']=['Scendi alla piattaforma sull’acqua a sudest di Merchant Bridge.'] if i==35 else ['Cerca nel chiosco di legno alla base del faro.']
    if i==36:p.pop('gameCoordinates',None);p.pop('position',None);p['locationNote']='La guida ripete le coordinate del trofeo 35: posizione sulla mappa ricostruita dal marker 36 del riferimento visivo.'
   if area=='bleake' and category=='riddle' and i==4:
    p.pop('gameCoordinates',None);p['position']=[2250,2096];p['locationNote']='Marker sull’edificio della torre; il bersaglio è nella stanza di Oracle. Le coordinate testuali della fonte sono discordanti.'
   if area=='bleake' and ((category=='trophy' and i==37) or (category=='riddle' and i>=9)):
    p['position']=[2633,2399];p['locationNote']='Marker sull’edificio GCPD; entra nella centrale e segui la descrizione della stanza.';p['location']='GCPD · interno'
   if area=='miagani' and category=='trophy' and i==38:p['position']=[2285,2483];p['locationNote']='Marker della statua; il trofeo si trova nelle impalcature sottostanti.'
   if area=='miagani' and category=='riddle' and i>=9:p['locationNote']='Marker dell’orfanotrofio; il bersaglio è all’interno.'
   if area=='founders' and category=='riddle' and i==10:p.pop('position',None);p['location']='Ovunque · Batmobile';p['locationNote']='Nessuna posizione fissa: apri questa sfida dal pulsante Enigma della Batmobile sulla mappa.'
   result.append(p)

# Trophy 36 has an erroneous duplicate coordinate in the written guide; fitted to
# the actual numbered marker in its map, using the same transform as the coast.
# Linear calibration is recorded by build-maps.py, keeping the correction reproducible.
calibration=json.loads((ROOT/'scripts/calibration.json').read_text())
p=next(p for p in result if p['id']=='bleake-trophy-36')
a,b,c,d,e,f=calibration['bleake'];x,y=1013,433
p['position']=[round(a*x+c*y+e,1),round(b*x+d*y+f,1)]

counts={c:sum(p['category']==c for p in result) for c in ['trophy','riddle','breakable','bomb']}
assert counts=={'trophy':179,'riddle':40,'breakable':90,'bomb':6},counts
assert len({p['id'] for p in result})==315
assert all(p['steps'] and p['sources'] for p in result)
(ROOT/'src/data/catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(counts)
