# JavaScript

## 1.1. У чому різниця між `var`, `let` та `const`?

<a id="q-1-1"></a>

### Пояснення

#### Interview answer (EN)

var is function-scoped inside functions. let and const are block-scoped, and const prevents reassignment.

| Характеристика | var | let | const |
| --- | --- | --- | --- |
| Область видимості | Функціональна | Блокова | Блокова |
| Повторне оголошення в тій самій області | Так | Ні | Ні |
| Переприсвоєння | Так | Так | Ні |
| Hoisting | Так | Так | Так |
| Temporal Dead Zone | Ні | Так | Так |

`const` забороняє переприсвоєння змінної, але не зміну вмісту об'єкта.

```javascript
const user = { name: "Alex" };

user.name = "John"; // OK
user = {}; // TypeError
```

У сучасному JavaScript зазвичай використовують `const` за замовчуванням, а `let` — коли значення потрібно переприсвоювати. `var` переважно зустрічається в legacy-коді.

## 1.2. Що таке hoisting та Temporal Dead Zone?

<a id="q-1-2"></a>

### Пояснення

#### Interview answer (EN)

Hoisting describes bindings being set up before execution. The temporal dead zone lasts until a lexical binding is initialized.

**Hoisting** — поведінка JavaScript, за якої bindings для оголошень створюються до виконання коду в відповідній області видимості.

```javascript
console.log(a); // undefined
var a = 10;
```

Але з `let`:

```javascript
console.log(b); // ReferenceError
let b = 10;
```

**Temporal Dead Zone (TDZ)** — проміжок від початку області видимості до моменту ініціалізації змінної `let`, `const` або `class`. У цей період звертатися до змінної не можна.

Function declarations також підтримують hoisting:

```javascript
sayHello(); // Hello

function sayHello() {
  console.log("Hello");
}
```

Важливо: казати, що `let` і `const` не підлягають hoisting, не зовсім правильно.

## 1.3. Що таке closure (замикання)? Наведи практичний приклад.

<a id="q-1-3"></a>

### Пояснення

#### Interview answer (EN)

A closure keeps access to the lexical bindings where the function was created, even after the surrounding call returns.

Замикання — це здатність функції зберігати доступ до лексичного оточення, у якому вона була створена, навіть після завершення виконання зовнішньої функції.

```javascript
function createCounter() {
  let count = 0;

  return function () {
    return ++count;
  };
}

const counter = createCounter();

counter(); // 1
counter(); // 2
counter(); // 3
```

Зовнішня функція вже завершила виконання, але внутрішня досі має доступ до `count`.

Практичне застосування: debounce, throttle, інкапсуляція даних, callbacks, фабрики функцій та React hooks.

#### Пов’язані питання

- [Що таке stale closure?](../03-react/README.md#q-3-12)
- [Closure](../09-live-coding/README.md#q-9-2)
- [Реалізуй debounce](../09-live-coding/README.md#q-9-7)

## 1.4. Як працює Event Loop?

<a id="q-1-4"></a>

### Пояснення

#### Interview answer (EN)

A browser runs a task, drains microtasks at a checkpoint, and may render before taking another task.

JavaScript виконує код в одному основному потоці в межах відповідного execution context. Асинхронні операції можуть оброблятися середовищем виконання, наприклад браузером.

Спрощена схема Event Loop у браузері.

```text
Browser APIs (таймери, fetch, події)
             ↓
Task → стек викликів → microtask checkpoint
                              ↓
                 можлива фаза рендерингу → наступне завдання
```


Загальний порядок виконання:

1. Виконується синхронний код поточного завдання.
2. Коли стек звільняється, виконуються всі доступні microtasks.
3. Браузер може оновити відображення сторінки.
4. Виконується наступне завдання з черги tasks.
5. Цикл повторюється.

Саме тому асинхронний JavaScript не обов'язково означає багатопотоковий JavaScript.

#### Пов’язані питання

- [У чому різниця між microtasks та macrotasks?](#q-1-5)
- [Event Loop](../09-live-coding/README.md#q-9-1)

## 1.5. У чому різниця між microtasks та macrotasks?

<a id="q-1-5"></a>

### Пояснення

#### Interview answer (EN)

Promise reactions and queueMicrotask callbacks are microtasks. Timer callbacks are tasks.

Microtasks мають пріоритет над наступним звичайним завданням.

| Microtasks | Macrotasks (tasks) |
| --- | --- |
| `Promise.then()` | `setTimeout()` |
| `Promise.catch()` | `setInterval()` |
| `queueMicrotask()` | DOM events |
| `MutationObserver` | Message events |

```javascript
console.log("Start");

setTimeout(() => console.log("Timeout"), 0);

Promise.resolve().then(() => console.log("Promise"));

console.log("End");
```

Результат:

```text
Start
End
Promise
Timeout
```

Навіть якщо `setTimeout` має затримку 0, він не виконається раніше за microtasks.

## 1.6. Як працює `this` у звичайних та стрілкових функціях?

<a id="q-1-6"></a>

### Пояснення

#### Interview answer (EN)

A normal function gets this from its call. An arrow function captures it from the enclosing scope.

У звичайній функції значення `this` залежить від способу її виклику. Стрілкова функція не має власного `this`, а отримує його з лексичного оточення.

```javascript
const user = {
  name: "Alex",

  regular() {
    console.log(this.name);
  },

  arrow: () => {
    console.log(this.name);
  }
};

user.regular(); // Alex
user.arrow();   // не використовує user як this
```

Для звичайної функції можна явно встановити `this`:

- `call()` — викликає функцію з аргументами через кому.
- `apply()` — викликає функцію з масивом аргументів.
- `bind()` — повертає нову прив'язану функцію.

Для стрілкової функції змінити `this` цими методами не можна.

## 1.7. У чому різниця між `==` та `===`?

<a id="q-1-7"></a>

### Пояснення

#### Interview answer (EN)

Strict equality does not convert types. Loose equality uses type-dependent coercion rules.

`==` допускає неявне приведення типів. `===` порівнює без приведення типів.

```javascript
5 == "5";          // true
5 === "5";         // false
null == undefined; // true
null === undefined;// false
0 == false;        // true
```

Зазвичай використовують `===`, щоб уникнути неочікуваної поведінки.

## 1.8. Чим відрізняються `null`, `undefined` та `NaN`?

<a id="q-1-8"></a>

### Пояснення

#### Interview answer (EN)

Undefined can indicate a missing value, null represents an explicit absence, and NaN is a Number value.

| Значення | Значення терміна | typeof |
| --- | --- | --- |
| `undefined` | Значення не визначене | undefined |
| `null` | Явна відсутність значення | object |
| `NaN` | Некоректний числовий результат | number |

```javascript
let a; // undefined

const user = null;

Number("hello"); // NaN
```

`NaN` має цікаву особливість:

```javascript
NaN === NaN;       // false
Number.isNaN(NaN); // true
```

А `typeof null === "object"` — історична особливість JavaScript.

## 1.9. Що таке shallow copy та deep copy?

<a id="q-1-9"></a>

### Пояснення

#### Interview answer (EN)

A shallow copy shares nested references. A deep copy recursively copies supported nested data.

Shallow copy створює копію лише верхнього рівня об'єкта. Вкладені об'єкти залишаються спільними.

```javascript
const original = {
  user: { name: "Alex" }
};

const copy = { ...original };

copy.user.name = "John";

console.log(original.user.name); // John
```

Deep copy створює незалежну копію вкладених структур.

```javascript
const copy = structuredClone(original);
```

`structuredClone` підтримує Date, Map, Set та циклічні посилання, але не функції.

Старий спосіб `JSON.parse(JSON.stringify(obj))` має обмеження: втрачає деякі типи даних, не підтримує циклічні посилання та `BigInt`.

#### Пов’язані питання

- [Що таке іммутабельність і навіщо вона потрібна?](#q-1-16)
- [Reference vs Value](../09-live-coding/README.md#q-9-5)

## 1.10. Як працює прототипне наслідування?

<a id="q-1-10"></a>

### Пояснення

#### Interview answer (EN)

Property lookup can follow an object's prototype chain until it finds the property or reaches null.

Кожен звичайний JavaScript-об'єкт має внутрішнє посилання на прототип або `null`. Якщо властивість відсутня в самому об'єкті, JavaScript шукає її в ланцюжку прототипів.

```javascript
const animal = {
  speak() {
    console.log("Sound");
  }
};

const dog = Object.create(animal);

dog.speak(); // Sound
```

Класи `class` та `extends` використовують цей самий прототипний механізм.

```javascript
class Animal {
  speak() {
    console.log("Sound");
  }
}

class Dog extends Animal {}

new Dog().speak();
```

## 1.11. У чому різниця між `map`, `forEach`, `filter` та `reduce`?

<a id="q-1-11"></a>

### Пояснення

#### Interview answer (EN)

Map transforms, filter selects, reduce accumulates, and forEach runs a callback for its effects.

| Метод | Призначення | Повертає |
| --- | --- | --- |
| `map` | Трансформувати елементи | Новий масив |
| `forEach` | Виконати дію для кожного | undefined |
| `filter` | Відфільтрувати елементи | Новий масив |
| `reduce` | Накопичити результат | Будь-який тип |

```javascript
const numbers = [1, 2, 3, 4];

numbers.map(n => n * 2);
// [2, 4, 6, 8]

numbers.filter(n => n > 2);
// [3, 4]

numbers.reduce((sum, n) => sum + n, 0);
// 10

numbers.forEach(n => console.log(n));
```

Самі ці методи не мутують початковий масив, але callback всередині них може це зробити.

## 1.12. Чим відрізняються `Promise.all`, `Promise.allSettled`, `Promise.race` та `Promise.any`?

<a id="q-1-12"></a>

### Пояснення

#### Interview answer (EN)

All needs every fulfillment, allSettled reports every outcome, race uses the first settlement, and any uses the first fulfillment.

| Метод | Поведінка |
| --- | --- |
| `Promise.all` | Очікує успіху всіх; відхиляється при першій помилці |
| `Promise.allSettled` | Очікує завершення всіх незалежно від результату |
| `Promise.race` | Повертає результат першого завершеного Promise |
| `Promise.any` | Повертає результат першого успішного Promise |

```javascript
const [users, products] = await Promise.all([
  fetchUsers(),
  fetchProducts()
]);
```

`Promise.allSettled` корисний, коли декілька незалежних запитів можуть завершитися помилками, але потрібно отримати всі доступні результати.

Важливий нюанс: якщо `Promise.all` відхиляється, інші запущені операції автоматично не скасовуються.

## 1.13. Що таке debounce та throttle? Коли їх використовувати?

<a id="q-1-13"></a>

### Пояснення

#### Interview answer (EN)

Debounce waits for calls to settle. Throttle limits how often a callback runs.

**Debounce** — виконання функції після того, як виклики припинилися на заданий час.

**Throttle** — обмеження частоти виконання функції.

Debounce чекає паузи між подіями. Throttle дозволяє виконання з обмеженою частотою.

Debounce використовують для пошуку, валідації поля, автозбереження.

Throttle використовують для scroll, resize, mousemove та інших частих подій.

#### Пов’язані питання

- [Реалізуй debounce](../09-live-coding/README.md#q-9-7)
- [Race Condition](../09-live-coding/README.md#q-9-8)

## 1.14. Як працює Garbage Collector? Через що виникають memory leaks?

<a id="q-1-14"></a>

### Пояснення

#### Interview answer (EN)

A tracing garbage collector identifies reachable objects. Long-lived references can retain data that the application no longer needs.

Garbage Collector автоматично звільняє пам'ять, зайняту об'єктами, які більше недоступні з кореневих посилань програми.

Основний принцип — reachability: якщо до об'єкта більше неможливо дістатися, він може бути видалений.

Типові причини memory leaks:

- Незняті event listeners.
- Незупинені timers.
- Неочищені subscriptions.
- Кеші, які необмежено ростуть.
- Замикання, що утримують непотрібні об'єкти.

Приклад очищення у React:

```typescript
useEffect(() => {
  const timer = setInterval(doSomething, 1000);

  return () => clearInterval(timer);
}, []);
```

## 1.15. Що таке currying?

<a id="q-1-15"></a>

### Пояснення

#### Interview answer (EN)

Currying turns a multi-argument function into a series of single-argument functions.

Currying — перетворення функції з декількома аргументами на послідовність функцій, кожна з яких приймає один аргумент.

```javascript
const add = a => b => a + b;

const addFive = add(5);

addFive(10); // 15
addFive(20); // 25
```

Практичне застосування — повторне використання функцій із заздалегідь заданими параметрами, функціональне програмування, конфігурація обробників.

## 1.16. Що таке іммутабельність і навіщо вона потрібна?

<a id="q-1-16"></a>

### Пояснення

#### Interview answer (EN)

An immutable update creates new references along the changed path and can reuse unchanged parts.

Іммутабельність — принцип, за яким існуючі дані не змінюються напряму. Натомість створюється нова версія даних.

```javascript
const user = { name: "Alex", age: 30 };

// Mutation
user.age = 31;

// Immutable update
const updatedUser = {
  ...user,
  age: 31
};
```

У React та Redux це важливо, оскільки порівняння посилань дозволяє ефективно визначати зміни, мемоізувати результати та передбачувано керувати станом.
