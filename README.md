# Frontend Interview Handbook

Посібник для підготовки до співбесіди Middle Frontend Developer. Десять розділів охоплюють 122 питання та 8 практичних вправ. Пояснення українською, короткі відповіді англійською, приклади коду та чекліст із 30 тем.

На головній сторінці відкрий «Схеми й демонстрації», щоб перейти до діаграм та інтерактивних прикладів. Схеми також є у відповідних розділах Markdown.

Відкрий [index.html](index.html) у браузері для офлайн-навчання. HTML містить увесь потрібний код і стилі. Пошук індексує назви, пояснення й приклади. У режимі співбесіди відповіді закриті, а режим повторення показує закладки й питання зі статусом «Потрібно повторити». Прогрес зберігається у браузері окремо для кожної адреси, якщо браузер дозволяє локальне сховище.

## Зміст

1. [JavaScript](content/01-javascript/README.md)
2. [TypeScript](content/02-typescript/README.md)
3. [React](content/03-react/README.md)
4. [Redux Toolkit та RTK Query](content/04-redux-toolkit/README.md)
5. [HTML та CSS](content/05-html-css/README.md)
6. [Браузер, мережа та веббезпека](content/06-browser-network/README.md)
7. [Тестування](content/07-testing/README.md)
8. [Архітектура та продуктивність](content/08-architecture/README.md)
9. [Практичні завдання](content/09-live-coding/README.md)
10. [Професійний досвід](content/10-professional-experience/README.md)

[Чекліст](content/checklist.md) · [План підготовки](content/preparation.md) · [Історія змін](CHANGELOG.md)

## Редагування та перевірка

Зміни вносяться у файли `content/`. HTML генерується з Markdown. Для збірки потрібен Node.js 20 або новіший.

```sh
npm ci
npm run build
npm test
```

Тести звіряють кількість та ідентифікатори матеріалів, чекліст, посилання і відтворюваність збірки. Приклади з вихідного чату перенесені як навчальні фрагменти. Фактчек відповідей і компіляція кожного фрагмента не входили до цього видання.

GitHub Pages може публікувати готовий `index.html` із кореня гілки `main`. [Документація GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
