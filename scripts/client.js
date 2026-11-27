const $ = id => document.getElementById(id);
const topics = new Map(handbook.map(item => [item.id, item]));
const articles = new Map(handbook.map(({id}) => [id, $(id)]));
const stateKey = 'frontend-interview-handbook:v1';
let state = {};
try { state = JSON.parse(localStorage.getItem(stateKey)) || {}; } catch {}
state.questions ??= {};
state.checks ??= {};
const save = () => {
  updateProgress();
  try { localStorage.setItem(stateKey, JSON.stringify(state)); }
  catch { $('toast').textContent = 'Браузер не дозволив зберегти зміни.'; }
};
const questions = () => state.questions;
const record = id => questions()[id] ?? {};
const links = [...$('toc').querySelectorAll('a[href^="#q-"]')];
const normalize = text => text.toLocaleLowerCase('uk').normalize('NFKC');
const searchIndex = new Map(handbook.map(({id,chapter}) => [id, normalize(chapter+' '+articles.get(id).textContent)]));
const getId = () => location.hash.slice(1);
const current = () => topics.get(getId());
const allChecks = [...$('checklist').querySelectorAll('[data-check]')];
for (const box of allChecks) {
  const text = box.parentElement;
  const label = document.createElement('label');
  label.append(...text.childNodes);
  text.append(label);
  const key = label.textContent.trim();
  box.checked = Boolean(state.checks[key]);
  box.addEventListener('change', () => { state.checks[key] = box.checked; save(); });
}

function updateProgress() {
  const done = handbook.filter(({id}) => record(id).status === 'done').length;
  const count = allChecks.filter(box => box.checked).length;
  $('progress').textContent = `Вивчено ${done} із ${handbook.length}`;
  $('check-progress').textContent = `Відмічено ${count} із ${allChecks.length}`;
}

function visibleTopics() {
  const query = normalize($('search').value.trim()).split(/\s+/).filter(Boolean);
  const isRevision = $('mode').value === 'revision';
  return handbook.filter(({id}) => (!isRevision || record(id).status === 'review' || record(id).bookmark)
    && query.every(term => searchIndex.get(id).includes(term)));
}

function updateList() {
  const filtered = visibleTopics();
  const ids = new Set(filtered.map(({id}) => id));
  for (const link of links) link.parentElement.hidden = !ids.has(link.hash.slice(1));
  for (const group of $('toc').querySelectorAll('details')) {
    group.hidden = !group.querySelector('li:not([hidden])');
    if ($('search').value.trim() || $('mode').value === 'revision') group.open = true;
  }
  const active = current();
  const i = filtered.findIndex(item => item.id === active?.id);
  for (const [name, item] of [['prev', i > 0 && filtered[i-1]], ['next', i >= 0 && filtered[i+1]]]) {
    const link = $(name);
    link.hidden = !item;
    if (item) link.href = '#' + item.id;
    else link.removeAttribute('href');
  }
  $('random').disabled = !filtered.length;
  $('results').textContent = filtered.length ? `Питань у добірці: ${filtered.length}`
    : ($('mode').value === 'revision' && !$('search').value.trim() ? 'Додай закладку або статус «Потрібно повторити».' : 'Нічого не знайдено.');
}

function render(focus = false) {
  const id = getId();
  const active = current();
  $('home').hidden = id === 'checklist' || Boolean(active);
  $('checklist').hidden = id !== 'checklist';
  $('reader').hidden = !active;
  for (const [key, article] of articles) article.hidden = key !== id;
  for (const link of links) {
    if (link.hash === location.hash) {
      link.setAttribute('aria-current','location');
      link.closest('details').open = true;
    } else link.removeAttribute('aria-current');
  }
  if (active) {
    $('chapter').textContent = active.chapter;
    const article = articles.get(id);
    article.querySelector('.answer').open = $('mode').value !== 'interview' && !id.startsWith('q-9-');
    $('status').value = record(id).status || '';
    $('bookmark').setAttribute('aria-pressed', String(Boolean(record(id).bookmark)));
  }
  updateList();
  if (focus) {
    (active ? articles.get(id).querySelector('h2') : $(id === 'checklist' ? 'checklist' : 'home').querySelector('h1')).focus({preventScroll:true});
    window.scrollTo(0,0);
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    $('toast').textContent = 'Скопійовано.';
  } catch { window.prompt('Скопіюй текст',text); }
}

$('status').addEventListener('change', () => {
  const id = getId();
  questions()[id] = {...record(id),status:$('status').value};
  save();
  updateList();
});
$('bookmark').addEventListener('click', () => {
  const id = getId();
  questions()[id] = {...record(id),bookmark:!record(id).bookmark};
  $('bookmark').setAttribute('aria-pressed', String(record(id).bookmark));
  save();
  updateList();
});
$('search').addEventListener('input',updateList);
$('search').addEventListener('keydown',event => {
  if (event.key === 'Enter' && visibleTopics()[0]) location.hash = visibleTopics()[0].id;
});
$('mode').addEventListener('change',() => { state.mode = $('mode').value; save(); render(); });
$('random').addEventListener('click',() => {
  const filtered = visibleTopics();
  const alternatives = filtered.filter(item => item.id !== getId());
  const pool = alternatives.length ? alternatives : filtered;
  if (pool.length) location.hash = pool[Math.floor(Math.random() * pool.length)].id;
});
$('share').addEventListener('click',() => copy(location.href));
$('copy-progress').addEventListener('click',() => copy(allChecks.map(box => (box.checked?'[x] ':'[ ] ')+box.parentElement.textContent.trim()).join('\n')));
$('theme').addEventListener('click',() => {
  const dark = document.documentElement.dataset.theme === 'dark';
  state.theme = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  save();
});
document.addEventListener('click',event => {
  const copyButton = event.target.closest('[data-copy-code]');
  if (copyButton) copy(copyButton.closest('figure').querySelector('code').textContent);
  const step = event.target.closest('[data-step]')?.dataset.step;
  if (step) {
    const output = document.querySelector(`[data-count="${step}"]`);
    output.value = Number(output.value) + (step === 'value' ? 1 : 3);
  }
  if (event.target.closest('[data-reset-demo]')) {
    for (const output of document.querySelectorAll('[data-count]')) output.value = 0;
  }
  if (event.target.closest('#toc a') && matchMedia('(max-width: 780px)').matches) $('sidebar').open = false;
});
window.addEventListener('hashchange',() => { if (getId() !== 'main') render(true); });
if (matchMedia('(max-width: 780px)').matches) $('sidebar').open = false;
document.documentElement.dataset.theme = state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
$('mode').value = ['interview','revision'].includes(state.mode) ? state.mode : 'study';
document.documentElement.classList.add('enhanced');
updateProgress();
render();
