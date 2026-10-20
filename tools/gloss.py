import pymupdf, re, json, sys
S='/tmp/claude-0/-home-claude/c2eea17c-2872-5dc5-bcbe-b0a8c19f56fb/scratchpad'
d=pymupdf.open(sys.argv[1])
gl=json.load(open(S+'/idx/gl.json'))
def txt(l): return ''.join(s['text'] for s in l['spans']).replace('\xa0',' ')
entries=[]; cur=None
for p in range(173,210):
    pg=d[p-1]
    lines=[l for b in pg.get_text('dict')['blocks'] if b['type']==0 for l in b['lines']]
    for l in lines:
        sp=l['spans']; size=round(sp[0]['size'],1); full=txt(l).strip()
        if not full or full.startswith('©') or full.startswith('Illustration'): continue
        if size==10.2 and 'Bo' in sp[0]['font']:
            name=sp[0]['text'].strip()
            hes=[s['text'] for s in sp if round(s['size'],1)==9.2]
            cat=''.join(s['text'] for s in sp if round(s['size'],1)==6.3).strip()
            if cur and not cur['body'] and not cur['he'] and not cur['cat']:
                cur['name']+=' '+name; cur['he']=' '.join(hes).strip(); cur['cat']=cat; continue
            cur={'name':name,'he':' '.join(hes).strip(),'cat':cat,'body':'','see':'','app':'','pg':p,'_m':'body'}
            entries.append(cur)
        elif cur is None: continue
        elif size==6.3: cur['cat']=(cur['cat']+' '+full).strip()
        elif size==8.7:
            if 'Bo' in sp[0]['font'] and full.startswith('cf.'): cur['body']=full
            else: cur['body']=(cur['body']+' '+full).strip()
            cur['_m']='body'
        elif size==7.3:
            if full.startswith('See also'): cur['see']=full[8:].strip(); cur['_m']='see'
            elif full.startswith('Appears in'): cur['app']=full[10:].strip(); cur['_m']='app'
            elif size==7.3 and cur.get('_m') in ('see','app'): cur[cur['_m']]=(cur[cur['_m']]+' '+full).strip()
        elif size==9.2 and not cur['he']: cur['he']=full
for e in entries: e.pop('_m',None)
print(len(entries),len(gl),file=sys.stderr)
for a,b in zip(entries,gl):
    if a['pg']!=b['pg']: print('MISMATCH',a['name'],b['name'],a['pg'],b['pg'],file=sys.stderr);break
json.dump(entries,open(sys.argv[2],'w'),ensure_ascii=False,indent=0)
