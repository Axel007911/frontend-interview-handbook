# Архітектура та продуктивність

## 8.1. Як би ти організував структуру великого React-проєкту?

<a id="q-8-1"></a>

### Пояснення

#### Interview answer (EN)

Organize by feature, define dependency boundaries, and promote genuinely shared code to a shared layer.

Для великих застосунків зручно використовувати feature-based architecture, де код групується за функціональністю, а не лише за типом файлів.

```text
src/
├── app/
│   ├── providers/
│   ├── store/
│   └── router/
├── features/
│   ├── authentication/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   └── products/
│       ├── api/
│       ├── components/
│       └── state/
├── pages/
└── shared/
    ├── ui/
    ├── hooks/
    ├── utils/
    └── types/
```

Це дозволяє зменшити зв'язність модулів, локалізувати зміни та спростити роботу декількох команд.

Не існує єдиної правильної структури. Вона має відповідати складності проєкту та потребам команди.

## 8.2. Як визначити, що компонент необхідно розділити на декілька?

<a id="q-8-2"></a>

### Пояснення

#### Interview answer (EN)

Split a component when its responsibilities or change patterns diverge enough that separate parts are easier to reason about.

Основні сигнали: компонент має декілька незалежних відповідальностей, містить складну бізнес-логіку разом із UI, його частини повторно використовуються або його складно тестувати й підтримувати.

Наприклад:

```typescript
function ProductsPage() {
  return (
    <>
      <ProductsFilters />
      <ProductsTable />
      <ProductsPagination />
    </>
  );
}
```

Логіку можна винести в custom hook:

```typescript
const {
  products,
  filters,
  setFilters
} = useProducts();
```

Не потрібно розділяти компоненти лише через кількість рядків. Важливіше, щоб кожна частина мала зрозумілу відповідальність.

## 8.3. Що таке separation of concerns?

<a id="q-8-3"></a>

### Пояснення

#### Interview answer (EN)

Give different concerns clear boundaries so UI, data access and domain behavior can change independently.

Принцип розділення різних відповідальностей між частинами системи.

Наприклад, React-компонент відповідає за UI, custom hook — за логіку взаємодії, API layer — за комунікацію із сервером, selectors — за отримання та трансформацію даних.

Це спрощує підтримку, тестування, повторне використання та рефакторинг.

При цьому надмірне розділення також може ускладнювати навігацію кодом.

## 8.4. Як принципи SOLID застосовуються у frontend?

<a id="q-8-4"></a>

### Пояснення

#### Interview answer (EN)

Use SOLID as a design vocabulary for cohesive responsibilities and stable boundaries rather than a rigid checklist.

| Принцип | Значення | Приклад |
| --- | --- | --- |
| S — Single Responsibility | Одна основна відповідальність | Компонент не містить усю бізнес-логіку |
| O — Open/Closed | Розширення без зайвих змін існуючого коду | Composition, slots |
| L — Liskov Substitution | Сумісні реалізації можна замінювати | Компоненти зі спільним контрактом |
| I — Interface Segregation | Маленькі цільові контракти | Передавати лише необхідні props |
| D — Dependency Inversion | Залежність від абстракцій | Передавати сервіс замість жорсткої прив'язки до реалізації |

SOLID — це принципи проєктування, а не набір обов'язкових React-патернів. Використовувати їх потрібно прагматично.

## 8.5. Що таке code splitting та tree shaking?

<a id="q-8-5"></a>

### Пояснення

#### Interview answer (EN)

Code splitting creates separately loaded chunks. Tree shaking removes code that a build can prove is unused.

Code splitting — розділення JavaScript bundle на менші частини, які можна завантажувати за потребою.

```typescript
const AdminPage = lazy(() => import("./AdminPage"));
```

Tree shaking — видалення невикористаного коду під час збірки, коли bundler може безпечно визначити, що він не потрібен.

```typescript
import { debounce } from "./utils";
```

Якщо інші exports модуля не використовуються і не мають необхідних side effects, bundler може видалити їх із production bundle.

Code splitting

Розділяємо код на частини.

Tree shaking

Видаляємо невикористаний код.

## 8.6. Як працює bundler?

<a id="q-8-6"></a>

### Пояснення

#### Interview answer (EN)

A bundler resolves a dependency graph, transforms modules and generates optimized deployable output.

Bundler аналізує залежності між модулями, трансформує код і формує файли для запуску застосунку.

Основні задачі: dependency graph, обробка imports, інтеграція транспіляції TypeScript та JSX, minification, code splitting, tree shaking, обробка CSS та assets.

Vite є прикладом сучасного build tool, який забезпечує development server та production build. TypeScript type checking при цьому може виконуватися окремим процесом, наприклад через `tsc --noEmit`.

## 8.7. Що таке CSR, SSR та SSG?

<a id="q-8-7"></a>

### Пояснення

#### Interview answer (EN)

CSR renders in a browser, SSR renders per request, and SSG renders ahead of time.

| Підхід | Де та коли генерується HTML | Приклад застосування |
| --- | --- | --- |
| CSR | У браузері | Dashboard |
| SSR | На сервері під час запиту | Динамічні публічні сторінки |
| SSG | Заздалегідь під час збірки | Документація, статті |

CSR — Client-Side Rendering. Браузер завантажує JavaScript, який формує UI.

SSR — Server-Side Rendering. Сервер повертає готовий HTML, після чого клієнтський JavaScript може додати інтерактивність.

SSG — Static Site Generation. HTML генерується заздалегідь і може віддаватися через CDN.

SSR та SSG можуть покращувати початкове відображення і доступність контенту для пошукових систем, але результат залежить від реалізації.

#### Пов’язані питання

- [Що таке hydration?](#q-8-8)

## 8.8. Що таке hydration?

<a id="q-8-8"></a>

### Пояснення

#### Interview answer (EN)

Hydration attaches app behavior to existing server-rendered HTML and expects compatible initial output.

Hydration — процес підключення React до вже згенерованого сервером HTML, щоб зробити його інтерактивним.

Server

HTML

Browser

Видимий UI

Hydration

React підключає логіку та event handlers

Інтерактивний застосунок

```typescript
hydrateRoot(
  document.getElementById("root"),
  <App />
);
```

Hydration mismatch виникає, коли HTML, згенерований сервером, не відповідає тому, що React очікує отримати під час першого клієнтського рендера.

Причинами можуть бути `Math.random()`, локальний час або використання browser-only APIs під час SSR.

## 8.9. Як знайти причину повільної роботи React-застосунку?

<a id="q-8-9"></a>

### Пояснення

#### Interview answer (EN)

Reproduce the slowdown, record a profile, identify the expensive work, and measure the result of a targeted change.

Почати потрібно з вимірювання, а не з мемоізації всього коду.

React DevTools Profiler допоможе визначити, які компоненти рендеряться часто або довго.

Chrome Performance дозволяє досліджувати long tasks, JavaScript execution, layout, paint.

Network tab — повільні API, великі bundles та зайві запити.

Memory tools — витоки пам'яті.

Після визначення проблеми можна застосовувати конкретне рішення: virtualization, мемоізацію, code splitting, оптимізацію запитів або перенесення важких обчислень у Web Worker.

## 8.10. Що таке Core Web Vitals — LCP, INP та CLS?

<a id="q-8-10"></a>

### Пояснення

#### Interview answer (EN)

LCP measures loading experience, INP responsiveness, and CLS unexpected layout movement.

Core Web Vitals — метрики користувацького досвіду.

LCP

Largest Contentful Paint — швидкість появи основного контенту

≤ 2,5 с

2,5–4 с

> 4 с

INP

Interaction to Next Paint — швидкість реакції на взаємодію

≤ 200 мс

200–500 мс

> 500 мс

CLS

Cumulative Layout Shift — візуальна стабільність

≤ 0,1

0,1–0,25

> 0,25

Хороший показник
Потребує покращення
Поганий

LCP оптимізують через швидке завантаження основних ресурсів, INP — через зменшення блокування main thread, CLS — через резервування місця для контенту.

Для польових метрик зазвичай оцінюють 75-й перцентиль відвідувань.

## 8.11. Як би ти організував централізовану обробку помилок?

<a id="q-8-11"></a>

### Пояснення

#### Interview answer (EN)

Separate expected failures from unexpected exceptions, show useful UI states, and centralize reporting and recovery policies.

Розділити помилки за їхнім походженням та відповідальністю.

UI rendering errors

React Error Boundary

API errors

RTK Query baseQuery / Axios interceptor

Business errors

Локальна обробка та зрозуміле повідомлення

Monitoring

New Relic, Sentry та структуровані логи

Наприклад, 401 можна обробляти централізовано через refresh flow, 403 — через повідомлення про відсутність доступу, а помилки валідації форми — локально біля відповідного поля.

У monitoring важливо не передавати паролі, токени та інші конфіденційні дані.

## 8.12. Що таке microfrontend? Які його переваги та недоліки?

<a id="q-8-12"></a>

### Пояснення

#### Interview answer (EN)

Microfrontends split a UI into independently owned parts, with coordination costs around integration and consistency.

Microfrontend — архітектурний підхід, за якого великий frontend-застосунок розділяється на менші відносно незалежні застосунки.

Переваги: незалежні команди, окремі deployments, можливість поступової міграції технологій та розділення великих систем.

Недоліки: складніша інтеграція, routing, shared dependencies, синхронізація стану, потенційне дублювання коду та складніше тестування.

Приклади технологій: Module Federation, single-spa, Qiankun.

Microfrontends мають сенс переважно тоді, коли організаційні та технічні переваги виправдовують додаткову складність.
