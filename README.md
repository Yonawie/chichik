# Чичик

Веб-приложение для подготовки к ОГЭ и ЕГЭ: теория, практика, диагностика слабых тем, банк ошибок, пробники и админка контента.

## Документация

- [Архитектура](docs/architecture.md)
- [План реализации](docs/implementation-plan.md)
- [Запуск и деплой](chichik/README.md)

## Приложение

Код в [`chichik/`](chichik/).

```bash
cd chichik
npm install
copy .env.example .env.local
# заполните NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAILS
# SQL: supabase/setup-all.sql затем supabase/content-full.sql
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Статус MVP

| Этап | Статус |
|------|--------|
| 0–1 — env, auth, роли, онбординг | готово |
| 1b — админка CRUD + seed | готово |
| 2–5 — практика, диагностика, ошибки, пробники | готово |
| 6 — деплой Vercel + приёмка | в процессе |

Деплой: см. раздел **«Деплой на Vercel»** в [`chichik/README.md`](chichik/README.md).
