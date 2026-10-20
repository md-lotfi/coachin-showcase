#!/usr/bin/env python3
"""Check the complete publish tree without third-party Python packages."""
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import render_pages as renderer
ERRORS=[]
def check(ok,message):
    if not ok:ERRORS.append(message)
class Page(HTMLParser):
    def __init__(self,path):
        super().__init__(convert_charrefs=True);self.path=path;self.ids=set();self.links=[];self.meta=[];self.html={};self.h1=0;self.h2=0;self.images=[];self.scripts=[];self.script_type=None;self.scripting=False
        self.feed(path.read_text())
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html':self.html=a
        if 'id' in a:check(a['id'] not in self.ids,f'{self.path}: duplicate ID {a["id"]}');self.ids.add(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='h2':self.h2+=1
        if tag=='meta':self.meta.append(a)
        if tag=='img':self.images.append(a)
        if tag=='script':self.scripting=True;self.script_type=a.get('type');self.scripts.append((a,''))
        for key in ('href','src'):
            if key in a:self.links.append((tag,key,a[key],a))
        if tag=='a' and a.get('target')=='_blank':check('noopener' in a.get('rel',''),f'{self.path}: missing noopener')
    def handle_endtag(self,tag):
        if tag=='script':self.scripting=False
    def handle_data(self,data):
        if self.scripting:
            a,s=self.scripts[-1];self.scripts[-1]=(a,s+data)
paths={name:Page(ROOT/name) for name in renderer.outputs() if name.endswith('.html') and (ROOT/name).exists()}
for name,output in renderer.outputs().items():
    p=ROOT/name;check(p.exists(),f'Missing {name}')
    if p.exists():check(p.read_text()==output,f'Stale generated file: {name}; run python3 tools/render_pages.py')
for name,page in paths.items():
    is404=name=='404.html';parts=Path(name).parts;lang=parts[0] if parts[0] in ('ar','fr') else 'en'
    check(page.html.get('lang')==lang,f'{name}: language')
    check(page.html.get('dir')==('rtl' if lang=='ar' else 'ltr'),f'{name}: direction')
    check(page.h1==1,f'{name}: expected exactly one h1')
    for image in page.images:
        check('alt' in image,f'{name}: image without alt')
        check('width' in image and 'height' in image,f'{name}: missing image dimensions')
        check(bool(image.get('src')) or image.get('id')=='gallery-image',f'{name}: image has no source')
    canon=[];alts=[]
    for tag,key,value,a in page.links:
        if tag=='link' and a.get('rel')=='canonical':canon.append(value)
        if tag=='link' and a.get('rel')=='alternate':alts.append(a)
        check(not any(bad in value for bad in ('/__l5e/','.asset.json','lovableproject.com')),f'{name}: external asset pointer')
        url=urlsplit(value)
        if url.scheme or url.netloc:
            if tag=='link' and a.get('rel')=='icon' and value.startswith('data:image/png;base64,'):continue
            check(url.scheme in ('https','mailto'),f'{name}: unexpected external protocol {value}')
            if url.hostname=='play.google.com' and url.path=='/store/apps/details':check('id=com.raystate.coachin' in url.query,f'{name}: wrong app link')
            continue
        if not value:continue
        check(not value.startswith('/'),f'{name}: root-relative local URL {value}')
        target=(page.path.parent/unquote(url.path)).resolve() if url.path else page.path
        if target.is_dir():target/= 'index.html'
        check(target.is_relative_to(ROOT),f'{name}: URL escapes site root {value}')
        check(target.exists(),f'{name}: missing local URL {value}')
        if url.fragment and target.exists():
            if target.suffix=='.html':
                target_page=paths.get(str(target.relative_to(ROOT)))
                check(target_page is not None and url.fragment in target_page.ids,f'{name}: missing anchor {value}')
            elif target.suffix=='.svg':
                check(any(x.attrib.get('id')==url.fragment for x in ET.parse(target).iter()),f'{name}: missing SVG symbol {value}')
    check(len(canon)==1 and canon[0].startswith(renderer.ORIGIN+'/'),f'{name}: canonical')
    check({a.get('hreflang') for a in alts}=={'en','fr','ar','x-default'},f'{name}: language alternates')
    for a in page.meta:
        if a.get('property') in ('og:url','og:image') or a.get('name')=='twitter:image':check(a.get('content','').startswith(renderer.ORIGIN+'/'),f'{name}: wrong social origin')
    for a,text in page.scripts:
        if a.get('type')=='application/ld+json':
            try:json.loads(text)
            except ValueError:check(False,f'{name}: invalid structured data')
    if not is404:
        text=page.path.read_text()
        for marker in ['privacy-policy/','terms-of-use/','mailto:contact@raystate.com']:
            check(marker in text,f'{name}: missing legal/support navigation {marker}')
        if 'privacy-policy' in name or 'terms-of-use' in name:
            doc='privacy-policy' if 'privacy-policy' in name else 'terms-of-use'
            source=ROOT/'legal-source'/lang/(doc+'.md')
            check(source.exists(),f'{name}: missing legal source')
            check(page.h2>=11 if doc=='privacy-policy' else page.h2>=10,f'{name}: incomplete legal document')
            check('Staffly' not in text and 'staffly.' not in text,f'{name}: Staffly text leaked')
        else:
            check(len([i for i in page.images if i.get('src','').endswith(f'_{lang}.webp')])>=5,f'{name}: localized screenshots missing')
            check(len([v for _,_,v,_ in page.links if 'play.google.com/store/apps/details?' in v])>=4,f'{name}: download links missing')
# Translation shapes must remain aligned, including list counts.
def shape(x):
    if isinstance(x,dict):return {k:shape(v) for k,v in sorted(x.items())}
    if isinstance(x,list):return [shape(v) for v in x]
    return type(x).__name__
for lang in ['fr','ar']:check(shape(renderer.DICT[lang])==shape(renderer.DICT['en']),f'Translation structure differs: {lang}')
for item in json.loads((ROOT/'tools/asset_sources.json').read_text()):
    p=ROOT/'assets'/item['original_filename'];check(p.exists(),f'Missing original asset: {p.name}')
    if p.exists():
        data=p.read_bytes();check(len(data)==item['size'],f'Original asset size changed: {p.name}')
        check(data.startswith(b'\x89PNG') if p.suffix=='.png' else data.startswith(b'RIFF') and data[8:12]==b'WEBP',f'Invalid image type: {p.name}')
for name,item in json.loads((ROOT/'tools/asset_checksums.json').read_text()).items():
    check(hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest()==item['sha256'],f'Asset checksum changed: {name}')
for font in (ROOT/'assets/fonts').glob('*.woff2'):check(font.read_bytes()[:4]==b'wOF2',f'Invalid WOFF2 font: {font.name}')
css=(ROOT/'assets/styles.css').read_text()
for path in re.findall(r"url\(['\"]?([^)'\"]+)",css):check((ROOT/'assets'/path).exists(),f'Missing CSS asset: {path}')
check('prefers-reduced-motion' in css,'Missing reduced-motion support')
# Contrast of the actual shared theme tokens for ordinary-size text and buttons.
def luminance(color):
    if len(color)==4:color='#'+''.join(c*2 for c in color[1:])
    rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
    return sum(v*w for v,w in zip([x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb],[.2126,.7152,.0722]))
for selector in [r':root',r':root\.dark']:
    rule=re.search(selector+r'\{([^}]+)',css).group(1)
    tokens=dict(re.findall(r'--([\w-]+):(#[0-9a-f]{3,6})(?=;|$)',rule))
    for fg,bg in [('text','bg'),('muted','bg'),('primary','bg'),('on-primary','primary')]:
        a,b=sorted([luminance(tokens[fg]),luminance(tokens[bg])])
        check((b+.05)/(a+.05)>=4.5,f'Insufficient theme contrast: {selector} {fg}/{bg}')

check((ROOT/'CNAME').read_text().strip()=='coachin.raystate.com','Wrong CNAME')
check((ROOT/'.nojekyll').exists(),'Missing .nojekyll')
site=ET.parse(ROOT/'sitemap.xml');ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
check(len(site.findall('s:url',ns))==9,'Sitemap must have 9 pages')
for loc in site.findall('.//s:loc',ns):
    check(loc.text.startswith(renderer.ORIGIN+'/'),'Wrong sitemap origin')
    p=ROOT/loc.text[len(renderer.ORIGIN)+1:]/'index.html';check(p.exists(),f'Sitemap page absent: {loc.text}')
for obsolete in ['src','node_modules','package.json','bun.lock','bunfig.toml','components.json','vite.config.ts','vitest.config.ts','tsconfig.json','eslint.config.js']:
    check(not (ROOT/obsolete).exists(),f'Obsolete build-stack file remains: {obsolete}')
if ERRORS:
    print('\n'.join('FAIL '+error for error in ERRORS));raise SystemExit(1)
print(f'PASS: {len(paths)} HTML pages, 6 legal sources, 14 original images, translations, metadata, links, fonts and publish-tree checks.')
