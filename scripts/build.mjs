import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {Marked, Renderer} from 'marked';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

loadLanguages(['typescript', 'jsx', 'tsx', 'bash', 'json', 'css', 'markup']);
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const escape = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const renderer = new Renderer();
renderer.html = ({text}) => escape(text);
renderer.link = function ({href, tokens}) {
  const label = this.parser.parseInline(tokens);
  const question = href.match(/^(?:\.\.\/\d\d-[a-z-]+\/README\.md)?(#q-\d+-\d+)$/);
  if (question) href = question[1];
  return /^(https:\/\/|#[a-z0-9-]+$)/.test(href) ? `<a href="${escape(href)}">${label}</a>` : label;
};
renderer.code = ({text,lang=''}) => {
  const grammar = Object.hasOwn(Prism.languages, lang) ? Prism.languages[lang] : null;
  return `<figure class="code"><figcaption><span>${escape(lang || 'text')}</span><button type="button" data-copy-code>Копіювати код</button></figcaption><pre tabindex="0"><code>${grammar ? Prism.highlight(text,grammar,lang) : escape(text)}</code></pre></figure>`;
};
const markdown = new Marked({renderer, gfm:true});
const sections = readdirSync(new URL('content/',root)).filter(dir => /^\d\d-/.test(dir)).sort();
const chapters = sections.map(section => {
  const source = read(`content/${section}/README.md`);
  const [intro, ...entries] = source.split(/^## /m);
  const title = intro.match(/^# (.+)/m)[1];
  const items = entries.map(entry => {
    const [heading,...body] = entry.trimEnd().split('\n');
    const [,number,name] = heading.match(/^(\d+\.\d+)\. (.+)$/);
    const [prompt,answer] = body.join('\n').replace(/^<a id="q-\d+-\d+"><\/a>$/m,'').split(/^### (?:Пояснення|Розв’язок)$/m);
    if (!answer) throw Error(`Missing answer for ${number}`);
    return {id:'q-'+number.replace('.','-'),heading:name, prompt:markdown.parse(prompt), answer:markdown.parse(answer)};
  });
  return {section,title,items};
});
const index = chapters.flatMap(({title,items})=>items.map(({id,heading})=>({id,heading,chapter:title})));
const toc = chapters.map(({section,title,items})=>`<details id="${section}"><summary>${escape(title)} <span>${items.length}</span></summary><ol>${items.map(({id,heading})=>`<li><a href="#${id}">${escape(heading.replaceAll('`',''))}</a></li>`).join('')}</ol></details>`).join('\n');
const card = ({id,heading,prompt,answer}) => `<article id="${id}" class="question"><h2 tabindex="-1">${markdown.parseInline(heading)}</h2><div class="prompt">${prompt}</div><details class="answer"><summary>Показати відповідь</summary>${answer}</details>${id==='q-9-3'?read('scripts/batching.html'):''}</article>`;
const cards = chapters.flatMap(chapter=>chapter.items.map(card)).join('\n');
const checklist = markdown.parse(read('content/checklist.md').replace(/^# .+\n/, '')).replace(/<input disabled="" type="checkbox">/g,'<input type="checkbox" data-check>');
const guide = markdown.parse(read('content/preparation.md'));
const metadata = JSON.stringify(index).replaceAll('<','\\u003c');
const html = read('scripts/template.html')
  .replace('/* STYLE */',()=>read('scripts/style.css'))
  .replace('<!-- TOC -->',()=>toc)
  .replace('<!-- QUESTIONS -->',()=>cards)
  .replace('<!-- CHECKLIST -->',()=>checklist)
  .replace('<!-- GUIDE -->',()=>guide)
  .replace('/* DATA */',()=>metadata)
  .replace('/* CLIENT */',()=>read('scripts/client.js'));
writeFileSync(new URL('index.html',root),html);
console.log(`Built ${index.length} entries in ${chapters.length} chapters.`);
