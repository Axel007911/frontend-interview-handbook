# Тестування

## 7.1. Чим відрізняються Unit, Integration та E2E tests?

<a id="q-7-1"></a>

### Пояснення

#### Interview answer (EN)

Unit tests target a small behavior, integration tests exercise collaborating parts, and end-to-end tests check a user flow.

Класична піраміда тестування. Не є обов'язковою пропорцією для кожного frontend-проєкту.

| Тип | Що перевіряє | Інструменти |
| --- | --- | --- |
| Unit | Окрему функцію або модуль | Vitest, Jest |
| Integration | Взаємодію декількох частин | RTL, MSW |
| E2E | Повний сценарій користувача | Playwright, Cypress |

Unit tests швидкі та ізольовані. Integration tests перевіряють реальну взаємодію частин застосунку. E2E дають впевненість у повному сценарії, але зазвичай дорожчі в підтримці.

## 7.2. Що варто тестувати в React-компоненті?

<a id="q-7-2"></a>

### Пояснення

#### Interview answer (EN)

Test what a user can observe, including actions, results, accessibility and failure states.

Насамперед поведінку, яку бачить користувач: відображення даних, кліки, введення тексту, валідацію, loading, error та empty states.

```typescript
render(<LoginForm />);

await user.type(
  screen.getByRole("textbox", { name: /email/i }),
  "user@example.com"
);

await user.click(
  screen.getByRole("button", { name: /login/i })
);

expect(onSubmit).toHaveBeenCalled();
```

Не потрібно без необхідності тестувати внутрішній state або те, який конкретно hook використовується.

## 7.3. Що таке mock, stub та spy?

<a id="q-7-3"></a>

### Пояснення

#### Interview answer (EN)

A stub supplies controlled behavior. A spy records interactions. A mock commonly replaces a dependency and can assert interactions.

| Термін | Призначення |
| --- | --- |
| Stub | Повертає заздалегідь визначені дані |
| Mock | Замінює залежність та дозволяє перевіряти взаємодію |
| Spy | Відстежує виклики існуючої функції |

```typescript
const mockFetch = vi.fn().mockResolvedValue({
  data: []
});
```

```typescript
const spy = vi.spyOn(console, "error");

expect(spy).toHaveBeenCalled();
```

Spy може залишати оригінальну реалізацію або замінювати її, залежно від налаштування.

Термінологія дещо відрізняється між testing frameworks.

## 7.4. Як тестувати асинхронний код?

<a id="q-7-4"></a>

### Пояснення

#### Interview answer (EN)

Await the thing that signals completion and assert observable output for success and error cases.

Використовувати `async/await`, перевіряти завершення Promise та очікувати зміни UI.

```typescript
it("returns users", async () => {
  const result = await fetchUsers();

  expect(result).toEqual(expectedUsers);
});
```

Для помилок:

```typescript
await expect(fetchUsers()).rejects.toThrow();
```

Для React:

```typescript
expect(
  await screen.findByText("Success")
).toBeInTheDocument();
```

Не потрібно використовувати довільні `setTimeout` у тестах для очікування результату, коли є відповідні async testing utilities.

#### Пов’язані питання

- [Як тестувати компонент, який виконує API-запит?](#q-7-5)
- [Що таке fake timers?](#q-7-7)

## 7.5. Як тестувати компонент, який виконує API-запит?

<a id="q-7-5"></a>

### Пояснення

#### Interview answer (EN)

Control network responses and verify loading, success, empty and failure states through the UI.

Зручний варіант — Mock Service Worker (MSW), який перехоплює HTTP-запити на мережевому рівні.

```typescript
http.get("/api/users", () => {
  return HttpResponse.json([
    { id: 1, name: "Alex" }
  ]);
});
```

```typescript
render(<UsersList />);

expect(
  await screen.findByText("Alex")
).toBeInTheDocument();
```

Для RTK Query можна використовувати реальний Redux store з API middleware, а відповіді сервера підміняти через MSW.

Це дозволяє перевірити більше реальної логіки, ніж повне мокання query hook.

## 7.6. Чим відрізняються `getBy`, `findBy` та `queryBy` у React Testing Library?

<a id="q-7-6"></a>

### Пояснення

#### Interview answer (EN)

GetBy throws if absent, queryBy returns null if absent, and findBy waits for a match.

| Метод | Якщо елемента немає | Асинхронний |
| --- | --- | --- |
| `getBy` | Кидає помилку | Ні |
| `queryBy` | Повертає null | Ні |
| `findBy` | Очікує появу, потім кидає помилку | Так |

```typescript
screen.getByText("Hello");
```

```typescript
expect(
  screen.queryByText("Error")
).not.toBeInTheDocument();
```

```typescript
await screen.findByText("Loaded");
```

`queryBy` зручний для перевірки відсутності елемента, `findBy` — для асинхронної появи.

## 7.7. Що таке fake timers?

<a id="q-7-7"></a>

### Пояснення

#### Interview answer (EN)

Fake timers give tests control over time-based work without waiting in real time.

Fake timers дозволяють контролювати віртуальний час у тестах без реального очікування.

```typescript
vi.useFakeTimers();

const callback = vi.fn();

setTimeout(callback, 5000);

vi.advanceTimersByTime(5000);

expect(callback).toHaveBeenCalled();

vi.useRealTimers();
```

Корисно для debounce, throttle, setTimeout та setInterval.

При асинхронних callbacks можуть знадобитися async-варіанти методів керування timers.

## 7.8. Чи означає 100% test coverage відсутність багів?

<a id="q-7-8"></a>

### Пояснення

#### Interview answer (EN)

Coverage shows what executed. It does not measure whether assertions catch the right failures.

Ні. Coverage показує, яка частина коду виконувалася під час тестування, але не гарантує правильності перевірок.

Можна виконати всі рядки коду, не перевіривши важливі edge cases або навіть не зробивши змістовних assertions.

Потрібно оцінювати не лише line coverage, а й branch coverage, якість тестів та покриття критичних бізнес-сценаріїв.

## 7.9. Чому краще тестувати поведінку компонента, а не деталі його реалізації?

<a id="q-7-9"></a>

### Пояснення

#### Interview answer (EN)

Behavior tests let implementation change without breaking tests that still describe correct user outcomes.

Тести, прив'язані до внутрішньої реалізації, часто ламаються після рефакторингу, навіть якщо поведінка застосунку не змінилася.

Наприклад, користувач не знає, чи компонент використовує `useState`, Redux або Context. Його цікавить, чи працює кнопка.

Тестування через DOM та user interactions робить тести стійкішими до рефакторингу та ближчими до реальних сценаріїв.
