import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const root = new URL('../',import.meta.url);
const read = name => readFileSync(new URL(name,root),'utf8');
const html = read('index.html');
const articles = [...html.matchAll(/<article id="([^"]+)" class="question">([\s\S]*?)<\/article>/g)];
const checklistCount = (html.match(/<input type="checkbox" data-check>/g) || []).length;
const ids = [...html.matchAll(/\bid="([a-z0-9-]+)"/g)].map(match=>match[1]);

test('all source questions, exercises and checklist items are rendered',()=>{
  const counts = [16,12,24,15,11,13,9,12,8,10];
  const expected = counts.flatMap((n,i) => Array.from({length:n},(_,j)=>`q-${i+1}-${j+1}`));
  assert.deepEqual(articles.map(match=>match[1]),expected);
  assert.equal(checklistCount,30);
  for (const [,id,body] of articles) assert.ok(body.includes('class="answer"'), id);
  assert.equal(articles.filter(match=>match[2].includes('Interview answer (EN)')).length,130);
  for (const [,id,body] of articles.filter(match=>match[1].startsWith('q-9-'))) {
    assert.ok(body.indexOf('class="prompt"') < body.indexOf('class="answer"'),id);
    assert.ok(body.split('class="answer"')[1].includes('Interview answer (EN)'),id);
  }
});

test('anchors and README paths resolve',()=>{
  assert.equal(new Set(ids).size,ids.length);
  for (const [,target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target),target);
  for (const [,path] of read('README.md').matchAll(/\]\(((?:content\/)[^\s)]+)\)/g)) {
    assert.ok(existsSync(new URL(path,root)),path);
  }
  assert.ok((html.match(/href="#q-[0-9]+-[0-9]+"/g)||[]).length>130);
});

test('compiled reader is self-contained, script parses and code is highlighted',()=>{
  assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+rel="stylesheet"/i);
  assert.match(html,/<span class="token keyword">/);
  assert.match(html,/class="code"/);
  assert.doesNotThrow(()=>new Script(html.match(/<script>([\s\S]+)<\/script>/)[1]));
});

test('build is deterministic and index.html is current',()=>{
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:fileURLToPath(root)});
  assert.equal(read('index.html'),html);
});

test('original diagrams are embedded offline and linked from the visual index',()=>{
  const illustrated = articles.filter(([, , body])=>body.includes('class="diagram"'));
  const images = [...html.matchAll(/<figure class="diagram"><img src="data:image\/svg\+xml;base64,([^"]+)" alt="([^"]+)"/g)];
  assert.equal(illustrated.length,22);
  assert.equal(images.length,26);
  for (const [,encoded,alt] of images) {
    const svg = Buffer.from(encoded,'base64').toString('utf8');
    assert.match(svg,/^<svg /,alt);
    assert.doesNotMatch(svg,/<(?:script|foreignObject)\b|\b(?:href|on\w+)=/i);
  }
  const visualIndex = html.match(/<details class="visual-index">([\s\S]*?)<\/details>/)[1];
  for (const [,id] of illustrated) assert.ok(visualIndex.includes(`href="#${id}"`),id);
  assert.ok(visualIndex.includes('href="#q-5-4"'));
  assert.equal((html.match(/class="visual-flow"/g) || []).length,3);
  assert.equal((html.match(/<meter /g) || []).length,6);
  assert.match(html,/id="box-model-form"/);
});
