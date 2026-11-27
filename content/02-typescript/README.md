# TypeScript

## 2.1. У чому різниця між `type` та `interface`?

<a id="q-2-1"></a>

### Пояснення

#### Interview answer (EN)

Both can model object shapes. Interfaces support declaration merging, while aliases can express unions and other type forms.

Обидва дозволяють описувати структуру даних.

```typescript
interface User {
  name: string;
  age: number;
}

type User = {
  name: string;
  age: number;
};
```

| Можливість | interface | type |
| --- | --- | --- |
| Опис об'єктів | Так | Так |
| Generics | Так | Так |
| Union types | Ні | Так |
| Intersection types | Через extends для сумісних об'єктів | Так |
| Declaration merging | Так | Ні |
| Опис примітивів | Ні | Так |
| Mapped types | Ні | Так |

Наприклад, `interface` можна доповнювати:

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// User містить name та age
```

А `type` дозволяє описувати union:

```typescript
type Status = "loading" | "success" | "error";
```

У більшості React-проєктів для опису об'єктів можна використовувати обидва варіанти, дотримуючись єдиного стилю команди.

## 2.2. Чим відрізняються `any`, `unknown`, `never` та `void`?

<a id="q-2-2"></a>

### Пояснення

#### Interview answer (EN)

Any opts out of many checks. Unknown requires narrowing. Never has no values, and void describes an absent or ignored result.

| Тип | Призначення |
| --- | --- |
| `any` | Вимикає більшість перевірок типів |
| `unknown` | Невідомий тип, який необхідно перевірити |
| `never` | Значення, яке не може існувати |
| `void` | Результат функції, значення якого не використовується |

```typescript
let a: any = 10;
a.toUpperCase(); // TS дозволить, runtime error
```

```typescript
let b: unknown = 10;

if (typeof b === "string") {
  b.toUpperCase();
}
```

```typescript
function throwError(): never {
  throw new Error("Error");
}

function logMessage(): void {
  console.log("Hello");
}
```

`unknown` безпечніший за `any`, тому що змушує розробника перевірити тип перед використанням.

## 2.3. Що таке generics? Наведи практичний приклад.

<a id="q-2-3"></a>

### Пояснення

#### Interview answer (EN)

Generics let one implementation preserve relationships between input and output types.

Generics дозволяють створювати універсальний код, зберігаючи інформацію про конкретний тип.

```typescript
function identity<T>(value: T): T {
  return value;
}

const a = identity("Hello"); // string
const b = identity(123);     // number
```

Практичний приклад для API:

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
};

type UsersResponse = ApiResponse<User[]>;
type ProductResponse = ApiResponse<Product>;
```

На відміну від `any`, generics зберігають зв'язок між вхідними та вихідними типами.

#### Пов’язані питання

- [Як працюють `keyof` та `typeof` у TypeScript?](#q-2-10)
- [TypeScript Generics](../09-live-coding/README.md#q-9-6)

## 2.4. Як працюють `Partial`, `Required`, `Pick`, `Omit`, `Record`?

<a id="q-2-4"></a>

### Пояснення

#### Interview answer (EN)

Utility types derive a new type by changing optionality or selecting, excluding, or mapping properties.

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};
```

| Utility Type | Результат |
| --- | --- |
| `Partial<User>` | Усі поля необов'язкові |
| `Required<User>` | Усі поля обов'язкові |
| `Pick<User, "id">` | Лише поле id |
| `Omit<User, "id">` | Усі поля, крім id |
| `Readonly<User>` | Забороняє переприсвоєння полів на рівні TS |
| `Record<string, User>` | Об'єкт із рядковими ключами та значеннями User |

Практичний приклад:

```typescript
type CreateUser = Omit<User, "id">;

type UpdateUser = Partial<CreateUser>;
```

Це дозволяє не дублювати типи для створення та редагування сутностей.

## 2.5. Що таке Union та Intersection types?

<a id="q-2-5"></a>

### Пояснення

#### Interview answer (EN)

A union accepts values from any constituent type. An intersection requires all constituent constraints.

Union (`|`) означає один із можливих типів.

```typescript
type ID = string | number;
```

Intersection (`&`) означає поєднання вимог декількох типів.

```typescript
type User = {
  name: string;
};

type Employee = {
  salary: number;
};

type Worker = User & Employee;

const worker: Worker = {
  name: "Alex",
  salary: 5000
};
```

Несумісні intersection types можуть призводити до `never`.

## 2.6. Що таке Type Narrowing?

<a id="q-2-6"></a>

### Пояснення

#### Interview answer (EN)

TypeScript narrows a type by following control flow and evaluating the implications of checks.

Type Narrowing — звуження загального типу до конкретнішого за допомогою перевірок.

```typescript
function print(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value.toFixed(2));
  }
}
```

TypeScript аналізує виконані перевірки та визначає, який тип доступний у конкретній гілці коду.

## 2.7. Як працюють Type Guards?

<a id="q-2-7"></a>

### Пояснення

#### Interview answer (EN)

A type guard helps the compiler narrow a value after a runtime check. A custom predicate depends on the correctness of that check.

Type Guard — перевірка, яка дозволяє TypeScript звузити тип значення.

Вбудовані перевірки: `typeof`, `instanceof`, `in`, перевірка на рівність.

Також можна створювати власні:

```typescript
type User = {
  name: string;
};

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  );
}
```

```typescript
if (isUser(data)) {
  console.log(data.name);
}
```

Важливо, що TypeScript довіряє результату custom type guard, тому його реалізація має справді перевіряти необхідні властивості.

## 2.8. Що таке discriminated union?

<a id="q-2-8"></a>

### Пояснення

#### Interview answer (EN)

A discriminated union gives each variant a shared property with a distinct literal value.

Union об'єктів, які мають спільне поле-дискримінатор для визначення конкретного типу.

```typescript
type State =
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
```

```typescript
function render(state: State) {
  switch (state.status) {
    case "loading":
      return "Loading";

    case "success":
      return state.data;

    case "error":
      return state.error;
  }
}
```

Особливо корисний для API responses, Redux state, UI states та state machines. Він дозволяє уникнути неможливих комбінацій стану.

## 2.9. У чому різниця між `as` та `satisfies`?

<a id="q-2-9"></a>

### Пояснення

#### Interview answer (EN)

An assertion tells the compiler how to treat a value. Satisfies checks compatibility while retaining the inferred expression type.

`as` — type assertion. Дозволяє повідомити TypeScript, що значення потрібно розглядати як певний тип.

`satisfies` перевіряє відповідність типу, зберігаючи точнішу інформацію про тип самого виразу.

```typescript
type Config = {
  theme: "dark" | "light";
};

const config = {
  theme: "dark"
} satisfies Config;
```

Тут TypeScript знає, що `config.theme` має конкретний тип `"dark"`, а не просто `"dark" | "light"`.

`as` може приховати помилки типізації, тоді як `satisfies` допомагає їх виявити. Жоден із них не виконує runtime validation.

## 2.10. Як працюють `keyof` та `typeof` у TypeScript?

<a id="q-2-10"></a>

### Пояснення

#### Interview answer (EN)

Keyof gets the keys of a type. Type-position typeof gets the static type of a value.

`keyof` отримує union ключів типу.

```typescript
type User = {
  name: string;
  age: number;
};

type UserKey = keyof User;
// "name" | "age"
```

`typeof` у контексті типізації отримує тип існуючого значення.

```typescript
const config = {
  timeout: 1000,
  enabled: true
};

type Config = typeof config;
```

Їх можна комбінувати:

```typescript
type ConfigKey = keyof typeof config;
// "timeout" | "enabled"
```

## 2.11. Що таке conditional types?

<a id="q-2-11"></a>

### Пояснення

#### Interview answer (EN)

Conditional types choose a result based on assignability and may use infer to extract a component type.

Типи, результат яких залежить від виконання певної умови на рівні типізації.

```typescript
type IsString<T> =
  T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

Практичний приклад із `infer`:

```typescript
type ArrayItem<T> =
  T extends (infer U)[] ? U : never;

type Item = ArrayItem<string[]>;
// string
```

Багато вбудованих utility types реалізовано за допомогою conditional types.

## 2.12. Чи перевіряє TypeScript типи даних, отриманих від API, під час виконання програми?

<a id="q-2-12"></a>

### Пояснення

#### Interview answer (EN)

TypeScript annotations do not validate API data at runtime. Parse or check the payload before relying on its shape.

Ні. TypeScript працює на етапі статичного аналізу. Після компіляції інформація про типи видаляється.

```typescript
const user: User = await response.json();
```

Цей запис не гарантує, що сервер справді повернув `User`.

Для runtime validation можна використовувати Zod, Valibot або власні перевірки.

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number()
});

const user = UserSchema.parse(data);
```

Це важливе питання для Middle: типізація API не дорівнює валідації API.
