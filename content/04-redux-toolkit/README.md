# Redux Toolkit та RTK Query

## 4.1. Коли варто використовувати локальний state, Context API або Redux?

<a id="q-4-1"></a>

### Пояснення

#### Interview answer (EN)

Keep state local by default. Use context for shared values and Redux when coordinated application state justifies a store.

| Інструмент | Коли використовувати |
| --- | --- |
| `useState` | Локальний стан компонента |
| `useReducer` | Складніша локальна логіка |
| Context API | Спільні дані в дереві компонентів |
| Redux Toolkit | Складний глобальний client state |
| RTK Query | Server state, API-запити та кешування |

Наприклад, відкриття модального вікна можна зберігати в локальному state, тему застосунку — у Context, глобальні бізнес-налаштування — у Redux, а список продуктів із сервера — у RTK Query.

Не потрібно зберігати всі дані в Redux лише тому, що він уже використовується у проєкті.

## 4.2. Як працює односпрямований потік даних у Redux?

<a id="q-4-2"></a>

### Пояснення

#### Interview answer (EN)

Dispatch an action, let reducers derive the next state, then let subscribed UI read the result.

UI відправляє action через `dispatch`. Middleware може обробити action, після чого reducer обчислює новий state. Store повідомляє підписників про оновлення, а UI отримує потрібні дані через selectors.

Це робить зміни стану передбачуваними та зручними для налагодження.

```text
dispatch(action) → reducer → store → selectors → UI
```

## 4.3. Що таке reducer і чому він має бути чистою функцією?

<a id="q-4-3"></a>

### Пояснення

#### Interview answer (EN)

A reducer computes the next state from the current state and an action without side effects.

Reducer — функція, яка отримує попередній state та action і повертає новий state.

```typescript
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return {
        ...state,
        count: state.count + 1
      };

    default:
      return state;
  }
}
```

Чиста функція повинна бути передбачуваною: однакові вхідні дані дають однаковий результат. Вона не повинна виконувати API-запити, змінювати зовнішні змінні або генерувати випадкові значення.

Це важливо для тестування, Redux DevTools та відтворення змін стану.

## 4.4. Як працює Immer у Redux Toolkit?

<a id="q-4-4"></a>

### Пояснення

#### Interview answer (EN)

Immer records changes to a draft and produces an immutable result with structural sharing.

Immer дозволяє писати код, який виглядає як мутація, але фактично створює immutable updates.

```typescript
const counterSlice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      state.count++;
    }
  }
});
```

Immer створює draft за допомогою Proxy, відстежує зміни та формує новий state, зберігаючи посилання на незмінені частини.

Важливо: це не означає, що можна мутувати Redux state поза reducers, які обробляються Immer.

## 4.5. Що таке middleware?

<a id="q-4-5"></a>

### Пояснення

#### Interview answer (EN)

Middleware wraps dispatch and can handle cross-cutting concerns or asynchronous logic.

Middleware — проміжний шар між `dispatch` та reducer.

Він може перехоплювати actions, логувати їх, виконувати асинхронні операції або відправляти додаткові actions.

```typescript
const logger = store => next => action => {
  console.log("Action:", action);

  const result = next(action);

  console.log("State:", store.getState());

  return result;
};
```

Приклади: Redux Thunk, RTK Query middleware, logging middleware.

## 4.6. У чому різниця між `createAsyncThunk` та RTK Query?

<a id="q-4-6"></a>

### Пояснення

#### Interview answer (EN)

CreateAsyncThunk models an async operation. RTK Query manages data fetching, caching and invalidation.

| Можливість | createAsyncThunk | RTK Query |
| --- | --- | --- |
| Асинхронні операції | Так | Так |
| Кешування API | Вручну | Автоматично |
| Loading та error states | Потрібно обробляти | Вбудовані |
| Deduplication | Вручну | Вбудована для однакових queries |
| Cache invalidation | Вручну | Tags |
| React hooks | Вручну | Генеруються |
| Refetching | Вручну | Вбудований |

`createAsyncThunk` підходить для складних асинхронних бізнес-процесів, які не обов'язково є отриманням server state.

RTK Query спеціалізується на взаємодії з API та керуванні серверними даними.

#### Пов’язані питання

- [Як працює кешування в RTK Query?](#q-4-7)
- [Як працюють `providesTags` та `invalidatesTags`?](#q-4-8)

## 4.7. Як працює кешування в RTK Query?

<a id="q-4-7"></a>

### Пояснення

#### Interview answer (EN)

RTK Query caches by endpoint and serialized arguments. Subscription lifetimes affect when cache entries are removed.

RTK Query формує cache key на основі endpoint та серіалізованих аргументів.

```typescript
useGetUsersQuery({ page: 1 });
useGetUsersQuery({ page: 2 });
```

Це два окремих записи кешу.

Коли інший компонент запитує той самий endpoint із тими самими аргументами, RTK Query може використати наявний кеш.

RTK Query також відстежує кількість активних subscriptions. Після видалення останньої підписки кеш за замовчуванням зберігається ще 60 секунд. Цей час налаштовується через `keepUnusedDataFor`.

#### Пов’язані питання

- [Як працюють `providesTags` та `invalidatesTags`?](#q-4-8)
- [Як реалізувати optimistic update та rollback?](#q-4-10)

## 4.8. Як працюють `providesTags` та `invalidatesTags`?

<a id="q-4-8"></a>

### Пояснення

#### Interview answer (EN)

A query provides tags. A mutation can invalidate matching tags so active subscriptions refresh.

Tags дозволяють автоматично оновлювати пов'язані серверні дані після мутацій.

```typescript
getUsers: builder.query<User[], void>({
  query: () => "/users",
  providesTags: ["Users"]
}),

addUser: builder.mutation<User, NewUser>({
  query: body => ({
    url: "/users",
    method: "POST",
    body
  }),
  invalidatesTags: ["Users"]
})
```

getUsers

Provides: Users

Cached data

Users list
Invalidation

addUser

POST /users

Invalidate Users

Active query refetch

Після успішної мутації відповідний активний query автоматично перезапитується. Якщо активних subscriptions немає, відповідний кеш може бути видалено.

Для більш точного оновлення можна використовувати tags з `id` конкретних сутностей.

## 4.9. Що станеться, якщо два компоненти викличуть один query з однаковими параметрами?

<a id="q-4-9"></a>

### Пояснення

#### Interview answer (EN)

Matching endpoint arguments share a cache entry and can share an in-flight request.

RTK Query використовуватиме спільний cache entry.

```typescript
// Component A
useGetUserQuery(42);

// Component B
useGetUserQuery(42);
```

Якщо запит уже виконується, RTK Query зазвичай не створюватиме другий ідентичний запит. Якщо дані закешовані, компоненти можуть отримати їх із кешу.

При цьому можуть існувати окремі subscriptions на один cache entry.

## 4.10. Як реалізувати optimistic update та rollback?

<a id="q-4-10"></a>

### Пояснення

#### Interview answer (EN)

Apply a cache patch before the response and undo the patch or invalidate cached data if the mutation fails.

Optimistic update — зміна UI ще до отримання підтвердження від сервера.

```typescript
async onQueryStarted(
  { id, ...patch },
  { dispatch, queryFulfilled }
) {
  const patchResult = dispatch(
    api.util.updateQueryData(
      "getUser",
      id,
      draft => {
        Object.assign(draft, patch);
      }
    )
  );

  try {
    await queryFulfilled;
  } catch {
    patchResult.undo();
  }
}
```

Якщо API-запит успішний, зміни залишаються. Якщо виникла помилка, виконується rollback.

При декількох одночасних мутаціях rollback може спричинити race conditions. У таких випадках надійніше інвалідувати кеш і отримати актуальні дані.

## 4.11. Що таке selectors та навіщо потрібен `createSelector`?

<a id="q-4-11"></a>

### Пояснення

#### Interview answer (EN)

A selector reads or derives data from state. CreateSelector memoizes derived results based on its inputs.

Selector — функція, яка отримує дані з Redux state.

```typescript
const selectUsers = state => state.users.items;
```

`createSelector` дозволяє створювати мемоізовані похідні значення.

```typescript
const selectActiveUsers = createSelector(
  [selectUsers],
  users => users.filter(user => user.active)
);
```

Поки вхідні значення не змінюються, selector може повернути попередній результат без повторного обчислення.

Це корисно для продуктивності та уникнення зайвих рендерів.

## 4.12. Як уникнути зайвих ререндерів при використанні `useSelector`?

<a id="q-4-12"></a>

### Пояснення

#### Interview answer (EN)

Select the smallest relevant value and avoid producing unstable object references from a selector.

`useSelector` за замовчуванням порівнює попередній та новий результат через строгу рівність `===`.

Проблемний приклад:

```typescript
const data = useSelector(state => ({
  name: state.user.name,
  age: state.user.age
}));
```

Тут щоразу створюється новий об'єкт.

Варіанти вирішення:

```typescript
const name = useSelector(state => state.user.name);
const age = useSelector(state => state.user.age);
```

Або:

```typescript
const data = useSelector(selectUserData, shallowEqual);
```

Також можна використати мемоізований `createSelector`, а в RTK Query — `selectFromResult`.

## 4.13. Чим відрізняється server state від client state?

<a id="q-4-13"></a>

### Пояснення

#### Interview answer (EN)

Server state is remote data with freshness and cache concerns. Client state models local interaction.

| Client state | Server state |
| --- | --- |
| Належить клієнту | Зберігається на сервері |
| Відкриття модального вікна | Список продуктів |
| Тема UI | Дані користувача |
| Обраний tab | Результати API |
| Локальні фільтри | Список замовлень |

Server state може застарівати, змінюватися іншими користувачами та потребує кешування, refetching і синхронізації.

RTK Query або TanStack Query краще вирішують ці задачі, ніж звичайне ручне зберігання API responses у глобальному state.

## 4.14. Як реалізувати пагінацію та infinite scrolling?

<a id="q-4-14"></a>

### Пояснення

#### Interview answer (EN)

Use page or cursor parameters, decide how to combine pages, and handle duplicates and errors.

Для звичайної пагінації передаємо номер сторінки в query.

```typescript
const [page, setPage] = useState(1);

const { data, isFetching } = useGetUsersQuery({
  page,
  limit: 20
});
```

Для infinite scrolling використовуємо cursor або page-based pagination, накопичуємо сторінки та завантажуємо наступну, коли користувач наближається до кінця списку.

Для визначення цього моменту можна використати `IntersectionObserver`.

Сучасний RTK Query також має спеціальний `build.infiniteQuery` для infinite queries.

## 4.15. Як скасувати або пропустити непотрібний API-запит?

<a id="q-4-15"></a>

### Пояснення

#### Interview answer (EN)

Use skip or skipToken for a query that should not start, and abort a request when the API exposes cancellation.

Для умовного виконання використовуємо `skip`:

```typescript
useGetUserQuery(userId, {
  skip: !userId
});
```

Або `skipToken`, що зручно для типізації:

```typescript
useGetUserQuery(userId ?? skipToken);
```

Для ручного запуску:

```typescript
const [trigger] = useLazyGetUsersQuery();

const request = trigger(params);

request.abort();
```

Важливо розрізняти пропуск запиту, відписку від кешу та фактичне скасування запущеної операції. Демонтування компонента не обов'язково автоматично скасовує мережевий запит.
