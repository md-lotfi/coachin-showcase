#!/usr/bin/env python3
"""Optional maintenance renderer. GitHub Pages serves the checked-in output directly."""
import argparse
import base64
import html
import json
import pathlib
import re
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'content/site.json').read_text())
DICT = json.loads((ROOT / 'content/translations.json').read_text())
ORIGIN = CONFIG['origin'].rstrip('/')
PLAY = CONFIG['storeUrl']
LANGS = {'en': '', 'fr': 'fr/', 'ar': 'ar/'}
SECTIONS = ['features', 'how', 'screens', 'premium', 'faq']
DATE = CONFIG['documentDate']
YEAR = DATE[:4]

def e(s):
    return html.escape(str(s), quote=True)

def page_path(lang, doc=''):
    return LANGS[lang] + (doc + '/' if doc else '')

def local(root, path):
    return root + path

def icon(name, root, cls=''):
    return f'<svg class="icon {cls}" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><use href="{root}assets/icons.svg#{name}"></use></svg>'

def lang_switch(lang, root, doc=''):
    labels = {'en': 'EN', 'fr': 'FR', 'ar': 'العربية'}
    links = ''.join(f'<a data-language="{l}" href="{root}{page_path(l, doc)}" lang="{l}" hreflang="{l}"'+(' aria-current="page"' if l == lang else '')+f'>{labels[l]}</a>' for l in LANGS)
    return f'<nav class="language-switch" aria-label="{e(DICT[lang]["menu"]["language"])}">{links}</nav>'

def theme(lang, root):
    return f'<button class="theme-toggle" type="button" data-theme-toggle aria-label="{e(DICT[lang]["menu"]["theme"])}" aria-pressed="false">{icon("sun",root,"sun")}{icon("moon",root,"moon")}</button>'

def play(lang, root, badge=False, label=None, cls=''):
    t = DICT[lang]
    content = f'<img src="{root}assets/gplay_{lang}.png" alt="{e(t["cta"]["badgeAlt"])}" width="646" height="250">' if badge else icon('download', root) + e(label or t['cta']['short'])
    return f'<a class="{"play-badge" if badge else "button button-primary"} {cls}" href="{e(PLAY)}&amp;hl={lang}" target="_blank" rel="noopener noreferrer">{content}</a>'

def logo(lang, root):
    return f'<span class="logo-plate"><img src="{root}assets/coachin-logo.png" alt="{e(DICT[lang]["logoAlt"])}" width="640" height="376"></span>'

def header(lang, root, doc='', away=False):
    t = DICT[lang]
    home = root + page_path(lang)
    nav = ''.join(f'<a href="{home if doc or away else ""}#{s}">{e(t["nav"][s])}</a>' for s in SECTIONS)
    return f'''<a class="skip-link" href="#main">{e(t['skip'])}</a>
<header class="site-header"><div class="container header-inner">
<a class="brand" href="{home if doc or away else '#top'}" aria-label="{e(t['menu']['home'])}">{logo(lang,root)}</a>
<nav class="desktop-nav" aria-label="{e(t['footer']['sections'])}">{nav}</nav>
<div class="header-actions"><div class="desktop-language">{lang_switch(lang,root,doc)}</div>{theme(lang,root)}{play(lang,root,cls='header-download')}</div>
<details class="mobile-menu"><summary aria-label="{e(t['menu']['open'])}">{icon('menu',root)}</summary><div class="mobile-panel"><nav aria-label="{e(t['footer']['sections'])}">{nav}</nav>{lang_switch(lang,root,doc)}{play(lang,root,label=t['cta']['download'])}</div></details>
</div></header>'''

def footer(lang, root, doc='', away=False):
    t = DICT[lang]; home = root + page_path(lang)
    sections = ''.join(f'<li><a href="{home if doc or away else ""}#{s}">{e(t["nav"][s])}</a></li>' for s in SECTIONS)
    return f'''<footer class="site-footer"><div class="container footer-grid"><div>{logo(lang,root)}<p class="footer-brand"><bdi>CoachIn</bdi> <span>{e(t['footer']['by'])}</span> <bdi>RayState</bdi></p><p class="muted">{e(t['footer']['desc'])}</p>{lang_switch(lang,root,doc)}</div>
<nav aria-label="{e(t['footer']['sections'])}"><h2>{e(t['footer']['sections'])}</h2><ul>{sections}</ul></nav>
<nav aria-label="{e(t['legal']['legal'])}"><h2>{e(t['legal']['legal'])}</h2><ul><li><a href="{root}{page_path(lang,'privacy-policy')}">{e(t['footer']['privacy'])}</a></li><li><a href="{root}{page_path(lang,'terms-of-use')}">{e(t['legal']['terms'])}</a></li><li><a href="mailto:{CONFIG['contact']}">{e(t['legal']['contact'])}</a></li><li><a href="https://raystate.com" target="_blank" rel="noopener noreferrer">{e(t['footer']['site'])}</a></li><li><a href="{e(PLAY)}&amp;hl={lang}" target="_blank" rel="noopener noreferrer">Google Play</a></li></ul></nav></div>
<div class="container footer-bottom"><span>© <span data-current-year>{YEAR}</span> <bdi>RayState</bdi>. {e(t['footer']['rights'])}</span><span><bdi>{e(CONFIG['publisher'])}</bdi> · {e(CONFIG['country'][lang])} · <a href="mailto:{CONFIG['contact']}"><bdi>{CONFIG['contact']}</bdi></a></span></div></footer>'''

def document(lang, root, body, doc='', title=None, description=None, noindex=False):
    t = DICT[lang]; title = title or t['meta']['title']; description = description or t['meta']['description']; path = page_path(lang,doc)
    head = f'''<!doctype html>
<html lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}" class="dark" data-site-root="{root}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="author" content="RayState"><meta name="theme-color" content="#151210"><meta name="color-scheme" content="dark light">
<title>{e(title)}</title><meta name="description" content="{e(description)}">
<link rel="canonical" href="{ORIGIN}/{path}">
'''
    for l in LANGS:
        head += f'<link rel="alternate" hreflang="{l}" href="{ORIGIN}/{page_path(l,doc)}">\n'
    head += f'<link rel="alternate" hreflang="x-default" href="{ORIGIN}/{page_path("en",doc)}">\n'
    head += f'''<meta property="og:type" content="website"><meta property="og:site_name" content="CoachIn by RayState"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{ORIGIN}/{path}"><meta property="og:locale" content="{dict(en='en_US',fr='fr_FR',ar='ar_DZ')[lang]}"><meta property="og:image" content="{ORIGIN}/assets/social-preview.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(description)}"><meta name="twitter:image" content="{ORIGIN}/assets/social-preview.png">
<link rel="icon" href="{root}assets/favicon.png" type="image/png"><link rel="apple-touch-icon" href="{root}assets/apple-touch-icon.png">
<link rel="preload" href="{root}assets/fonts/{'cairo-arabic' if lang=='ar' else 'manrope-latin'}-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>try{{if(localStorage.getItem('coachin-theme')==='light')document.documentElement.classList.remove('dark')}}catch(e){{}}</script>
<link rel="stylesheet" href="{root}assets/styles.css"><script src="{root}assets/script.js" defer></script>'''
    if noindex: head += '<meta name="robots" content="noindex">'
    if not doc and not noindex:
        ld = {'@context':'https://schema.org','@type':'SoftwareApplication','name':'CoachIn','operatingSystem':'Android','applicationCategory':'BusinessApplication','description':description,'inLanguage':list(LANGS),'url':ORIGIN+'/'+path,'downloadUrl':PLAY,'installUrl':PLAY,'image':ORIGIN+'/assets/social-preview.png','publisher':{'@type':'Organization','name':'RayState','url':'https://raystate.com'}}
    else:
        ld = {'@context':'https://schema.org','@type':'WebPage','name':title,'description':description,'inLanguage':lang,'url':ORIGIN+'/'+path}
    head += '<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False).replace('<','\\u003c')+'</script></head><body>'
    return head+header(lang,root,doc,away=noindex)+body+footer(lang,root,doc,away=noindex)+'</body></html>\n'

def eyebrow(s):return f'<p class="eyebrow">{e(s)}</p>'
def heading(s):return f'<h2>{e(s)}</h2>'
def phone(src,alt,root,priority=False,cls=''):
    return f'<div class="phone {cls}"><img src="{root}assets/{src}" alt="{e(alt)}" width="902" height="1920" loading="{"eager" if priority else "lazy"}"'+(' fetchpriority="high"' if priority else '')+' decoding="async"></div>'
def bullet(items,root):return '<ul class="bullets">'+''.join(f'<li>{icon("check",root)}<span>{e(p)}</span></li>' for p in items)+'</ul>'
def cards(items,icons,root,cls=''):
    return f'<ul class="card-grid {cls}">'+''.join(f'<li class="feature-card">{icon(icons[i%len(icons)],root)}<h3>{e(h)}</h3><p class="muted">{e(p)}</p></li>' for i,(h,p) in enumerate(items))+'</ul>'

def homepage(lang):
    t=DICT[lang];root='./' if lang=='en' else '../';shots=[f'{s}_{lang}.webp' for s in ['checkin','pin','subscribe']]
    lines=''.join(f'<span{" class=\"accent\"" if i==2 else ""}>{e(s)}</span>' for i,s in enumerate(t['hero']['title']))
    chips=''.join(f'<li>{icon(n,root)}<span dir="auto">{e(s)}</span></li>' for n,s in zip(['wifi-off','nfc','languages'],t['hero']['chips']))
    body=f'''<main id="main"><section id="top" class="hero"><div class="hero-glow" aria-hidden="true"></div><div class="container hero-grid"><div class="hero-copy"><div class="hero-eyebrow"><img src="{root}assets/coachin-icon.png" alt="{e(t['iconAlt'])}" width="48" height="48"><span>{e(t['hero']['eyebrow'])}</span></div><h1>{lines}</h1><p class="hero-lead">{e(t['hero']['lead'])}</p><div class="hero-actions">{play(lang,root,True)}<a class="button button-outline" href="#features">{e(t['cta']['explore'])}{icon('arrow-right',root,'directional')}</a></div><ul class="chips">{chips}</ul></div>
<div class="hero-art"><div class="hero-main-phone">{phone(shots[0],t['hero']['mainAlt'],root,True)}<div class="tap-card" aria-hidden="true"><span class="tap-ring"></span>{icon('nfc',root)}<span></span></div><div class="check-toast" aria-hidden="true">{icon('check',root)}<span><strong>{e(t['hero']['tapLabel'])}</strong><small>{e(t['hero']['tapSub'])}</small></span></div></div><div class="hero-side-phone">{phone(shots[1],t['hero']['sideAlt'],root)}</div></div></div></section>'''
    problem=''.join(f'<li>{icon(n,root)}<span class="step-index">0{i+1}</span><h3>{e(h)}</h3><p class="muted">{e(p)}</p></li>' for i,(n,(h,p)) in enumerate(zip(['notebook','ticket','calendar','receipt'],t['problem']['items'])))
    body+=f'''<section id="problem" class="section section-tint"><div class="container problem-grid"><div>{eyebrow(t['problem']['eyebrow'])}{heading(t['problem']['title'])}<p class="lead">{e(t['problem']['answer'])}</p></div><ol class="problem-cards">{problem}</ol></div></section>'''
    f=t['features'];a=f['attendance'];m=f['membership']
    body+=f'''<section id="features" class="section"><div class="container"><div class="section-heading">{eyebrow(f['eyebrow'])}{heading(f['title'])}</div><article class="feature-story tinted"><div><p class="pill">{icon('nfc',root)}{e(a['tag'])}</p><h3>{e(a['title'])}</h3>{bullet(a['points'],root)}<p class="hardware-note">{icon('smartphone',root)}{e(a['note'])}</p></div>{phone(shots[0],t['hero']['mainAlt'],root)}</article><article class="feature-story reverse"><div><p class="pill">{icon('users',root)}{e(m['tag'])}</p><h3>{e(m['title'])}</h3>{bullet(m['points'],root)}</div>{phone(shots[2],t['screens']['items'][2][1],root)}</article>{cards(f['grid'],['dashboard','wallet','card','qr','activity','timer','database','languages'],root)}</div></section>'''
    x=t['how']['example'];steps=''.join(f'<li><span class="step-number">{i+1}</span>{icon(n,root)}<h3>{e(h)}</h3><p class="muted">{e(p)}</p></li>' for i,(n,(h,p)) in enumerate(zip(['ticket','users','nfc'],t['how']['steps'])))
    body+=f'''<section id="how" class="section section-tint"><div class="container"><div class="how-heading"><div class="section-heading">{eyebrow(t['how']['eyebrow'])}{heading(t['how']['title'])}</div><div class="example-pack" aria-hidden="true"><strong>{e(x['pack'])}</strong>{icon('check',root)}<p>{e(x['detail'])}</p><div class="session-bars" dir="ltr">{''.join('<span'+(' class="used"' if i<5 else '')+'></span>' for i in range(8))}</div><p><bdi>5</bdi> {e(x['of'])} <bdi>8</bdi> · {e(x['left'])}</p></div></div><ol class="steps">{steps}</ol></div></section>'''
    galleries=''.join(f'''<li><a class="gallery-trigger" href="{root}assets/{s}" data-gallery-index="{i}" aria-label="{e(t['screens']['open'])}: {e(t['screens']['items'][i][0])}">{phone(s,t['screens']['items'][i][1],root)}<h3>{e(t['screens']['items'][i][0])}</h3><p class="muted">{e(t['screens']['items'][i][1])}</p></a></li>''' for i,s in enumerate(shots))
    body+=f'''<section id="screens" class="section"><div class="container"><div class="section-heading">{eyebrow(t['screens']['eyebrow'])}{heading(t['screens']['title'])}<p class="muted">{e(t['screens']['hint'])}</p></div><ul class="gallery-grid">{galleries}</ul></div></section>
<dialog class="lightbox" id="gallery-dialog" aria-labelledby="gallery-caption"><button type="button" class="lightbox-close" data-gallery-close aria-label="{e(t['screens']['close'])}">{icon('x',root)}</button><button type="button" class="gallery-prev" data-gallery-step="-1" aria-label="{e(t['screens']['prev'])}">{icon('chevron-left',root,'directional')}</button><figure><img id="gallery-image" alt="" width="902" height="1920"><figcaption id="gallery-caption"></figcaption><p class="gallery-counter" aria-live="polite" data-counter-word="{e(t['screens']['counter'])}"></p></figure><button type="button" class="gallery-next" data-gallery-step="1" aria-label="{e(t['screens']['next'])}">{icon('chevron-right',root,'directional')}</button></dialog>'''
    body+=f'''<section id="offline" class="section section-tint"><div class="container offline-grid"><div>{eyebrow(t['offline']['eyebrow'])}{heading(t['offline']['title'])}<p class="lead">{e(t['offline']['lead'])}</p><p class="fine-print">* {e(t['offline']['note'])}</p></div>{cards(t['offline']['points'],['database','wifi-off','database','download'],root,'two-columns')}</div></section>'''
    body+=f'''<section id="premium" class="section premium"><div class="container"><div class="section-heading centered">{eyebrow(t['premium']['eyebrow'])}{heading(t['premium']['title'])}<p class="lead">{e(t['premium']['lead'])}</p></div>{cards(t['premium']['perks'],['check','nfc','coins'],root,'premium-cards')}<p class="fine-print centered">{e(t['premium']['plans'])}</p><div class="centered"><a class="button button-outline" href="{e(PLAY)}&amp;hl={lang}" target="_blank" rel="noopener noreferrer">{e(t['premium']['cta'])}{icon('arrow-right',root,'directional')}</a></div></div></section>'''
    faq=''.join(f'<details class="faq-item"'+(' open' if i==0 else '')+f'><summary>{e(q)}{icon("plus",root)}</summary><div><p>{e(a)}</p></div></details>' for i,(q,a) in enumerate(t['faq']['items']))
    body+=f'''<section id="faq" class="section"><div class="container faq-grid"><div>{eyebrow(t['faq']['eyebrow'])}{heading(t['faq']['title'])}</div><div class="faq-list">{faq}</div></div></section>
<section id="download" class="download-section"><div class="container"><div class="download-card"><div class="download-copy"><img class="app-icon" src="{root}assets/coachin-icon.png" alt="{e(t['iconAlt'])}" width="96" height="96" loading="lazy"><div>{heading(t['final']['title'])}<p>{e(t['final']['lead'])}</p>{play(lang,root,True)}</div></div><figure class="download-qr"><img src="{root}assets/download-qr.svg" alt="{e(t['final']['qrAlt'])}" width="180" height="180" loading="lazy"><figcaption>{e(t['final']['scan'])}</figcaption></figure></div></div></section></main><div class="mobile-download">{play(lang,root,label=t['cta']['download'])}</div>'''
    return document(lang,root,body)

# A deliberately small Markdown subset: headings, paragraphs, lists, bold and links.
# Content is escaped; raw HTML is never passed through.
def inline(s,lang,root):
    out=e(s)
    out=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',out)
    def link(m):
        label,url=m.groups();url=html.unescape(url)
        if url in ['privacy-policy.md','terms-of-use.md']:
            url=root+page_path(lang,url[:-3])
        if not url.startswith(('https://','mailto:',root)):
            raise ValueError('Unsupported legal link '+url)
        return f'<a href="{e(url)}">{label}</a>'
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)',link,out)

def legal_body(text,lang,root):
    blocks=[];paragraph=[];listing=[];toc=[];title='';i=0
    def flush():
        if paragraph:blocks.append('<p>'+inline(' '.join(paragraph),lang,root)+'</p>');paragraph.clear()
        if listing:blocks.append('<ul>'+''.join('<li>'+inline(s,lang,root)+'</li>' for s in listing)+'</ul>');listing.clear()
    for line in text.splitlines()+['']:
        if line.startswith('# '):title=line[2:];continue
        if line.startswith('## '):
            flush();i+=1;ident=f'section-{i}';label=line[3:];toc.append((ident,label));blocks.append(f'<h2 id="{ident}">{e(label)}</h2>')
        elif line.startswith('### '):flush();blocks.append('<h3>'+e(line[4:])+'</h3>')
        elif line.startswith('- '):
            if paragraph:flush()
            listing.append(line[2:])
        elif not line.strip():flush()
        else:
            if listing:flush()
            paragraph.append(line.strip())
    return title,''.join(blocks),toc

def legalpage(lang,doc):
    root='../' if lang=='en' else '../../';t=DICT[lang]
    text=(ROOT/f'legal-source/{lang}/{doc}.md').read_text()
    title,body,toc=legal_body(text,lang,root)
    links=''.join(f'<li><a href="#{ident}">{e(label)}</a></li>' for ident,label in toc)
    content=f'''<main id="main" class="legal-main container"><div class="legal-intro"><a class="back-link" href="{root}{page_path(lang)}">{icon('arrow-left',root,'directional')}{e(t['legal']['back'])}</a>{eyebrow(t['legal']['legal'])}<h1>{e(title)}</h1></div><div class="legal-grid"><aside class="legal-toc"><nav aria-label="{e(t['legal']['contents'])}"><h2>{e(t['legal']['contents'])}</h2><ol>{links}</ol></nav></aside><article class="legal-content">{body}</article></div></main>'''
    desc=t['legal']['privacyDescription' if doc=='privacy-policy' else 'termsDescription']
    return document(lang,root,content,doc,title=title+' · CoachIn',description=desc)

def outputs():
    result={}
    for lang in LANGS:
        result[page_path(lang)+'index.html']=homepage(lang)
        for doc in ['privacy-policy','terms-of-use']:result[page_path(lang,doc)+'index.html']=legalpage(lang,doc)
    ns='http://www.sitemaps.org/schemas/sitemap/0.9';xh='http://www.w3.org/1999/xhtml'
    ET.register_namespace('',ns);ET.register_namespace('xhtml',xh);tree=ET.Element('{'+ns+'}urlset')
    for doc in ['', 'privacy-policy','terms-of-use']:
        for lang in LANGS:
            node=ET.SubElement(tree,'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=ORIGIN+'/'+page_path(lang,doc)
            for alt in [*LANGS,'x-default']:ET.SubElement(node,'{'+xh+'}link',{'rel':'alternate','hreflang':alt,'href':ORIGIN+'/'+page_path('en' if alt=='x-default' else alt,doc)})
    ET.indent(tree);result['sitemap.xml']='<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(tree,encoding='unicode')+'\n'
    result['robots.txt']=f'User-agent: *\nAllow: /\n\nSitemap: {ORIGIN}/sitemap.xml\n'
    result['CNAME']=ORIGIN.split('://',1)[1]+'\n';result['.nojekyll']=''
    t=DICT['en'];choices=''.join(f'<a class="button button-outline" href="{ORIGIN}/{path}">{label}</a>' for path,label in [('', 'English'),('fr/','Français'),('ar/','العربية')])
    # Self-contained so Pages can serve it for arbitrarily deep missing URLs.
    result['404.html']=f'''<!doctype html>
<html lang="en" dir="ltr" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>404 · CoachIn</title><link rel="icon" type="image/png" href="data:image/png;base64,{base64.b64encode((ROOT / 'assets/favicon.png').read_bytes()).decode('ascii')}"><meta name="description" content="Page not found — return to CoachIn in English, French or Arabic."><link rel="canonical" href="{ORIGIN}/404.html">
<link rel="alternate" hreflang="en" href="{ORIGIN}/"><link rel="alternate" hreflang="fr" href="{ORIGIN}/fr/"><link rel="alternate" hreflang="ar" href="{ORIGIN}/ar/"><link rel="alternate" hreflang="x-default" href="{ORIGIN}/">
<style>:root{{color-scheme:light;--bg:#fff;--fg:#211d19;--accent:#008538;--muted:#625e58;--line:#e2e3de}}:root.dark{{color-scheme:dark;--bg:#151210;--fg:#efebe9;--accent:#ccff00;--muted:#b8afa7;--line:#332a24}}*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:1rem/1.7 system-ui,sans-serif}}main{{width:min(100% - 3rem,750px);margin:12vh auto}}a{{color:inherit;text-decoration:none}}a:focus-visible{{outline:3px solid var(--accent);outline-offset:5px}}.eyebrow{{color:var(--accent);font-weight:700;letter-spacing:.1em}}h1{{font-size:clamp(2.5rem,8vw,4.5rem);line-height:1.1;margin:1rem 0}}p{{color:var(--muted)}}.hero-actions{{display:flex;gap:.75rem;flex-wrap:wrap;margin:2rem 0}}.button{{border:1px solid var(--line);padding:.65rem 1.2rem;border-radius:30px;min-height:44px}}a:hover{{color:var(--accent);border-color:var(--accent)}}footer{{border-top:1px solid var(--line);padding-top:1rem;font-size:.875rem}}footer a{{text-decoration:underline}}.brand{{font-size:1.2rem;font-weight:800}}</style>
<script>try{{if(localStorage.getItem('coachin-theme')==='light')document.documentElement.classList.remove('dark')}}catch(e){{}}</script></head><body><main id="main"><a class="brand" href="{ORIGIN}/">CoachIn</a><p class="eyebrow">404</p><h1>{e(t['legal']['notFound'])}</h1><p>{e(t['legal']['notFoundText'])}</p><p lang="fr">{e(DICT['fr']['legal']['notFoundText'])}</p><p lang="ar" dir="rtl">{e(DICT['ar']['legal']['notFoundText'])}</p><div class="hero-actions">{choices}</div><footer><a href="{ORIGIN}/privacy-policy/">Privacy Policy</a> · <a href="{ORIGIN}/terms-of-use/">Terms of Use</a> · <a href="mailto:{CONFIG['contact']}">{CONFIG['contact']}</a></footer></main></body></html>\n'''

    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args();stale=[]
    for name,data in outputs().items():
        path=ROOT/name
        if args.check:
            if not path.exists() or path.read_text()!=data:stale.append(name)
        else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(data)
    if stale:raise SystemExit('Stale generated pages: '+', '.join(stale))
    print('Static pages are current.' if args.check else 'Rendered 3 homepages, 6 legal pages and hosting files.')
if __name__=='__main__':main()
