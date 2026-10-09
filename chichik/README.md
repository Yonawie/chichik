# Чичик (приложение)

Next.js App Router + TypeScript + Tailwind + Supabase.

## Локальный запуск

1. Установите зависимости:

```bash
npm install
```

2. Создайте проект на [Supabase](https://supabase.com) (Free).

3. Скопируйте env:

```bash
copy .env.example .env.local
```

Заполните:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...` или anon key)
- `ADMIN_EMAILS` — email админов через запятую (например `taisiaryzkova24@gmail.com`)

**Не** кладите Secret key (`sb_secret_...`) в env приложения.

4. В Supabase SQL Editor выполните по порядку:

| Файл | Когда |
|------|--------|
| `supabase/setup-all.sql` | новая БД (схема + RLS + минимальный seed) |
| `supabase/content-full.sql` | полное наполнение: 4 предмета × 5 тем × 5 заданий + пробники |
| `supabase/chemistry-ege-only.sql` | только если `content-full` уже гоняли **до** правки «химия только ЕГЭ» |

Либо вместо `setup-all.sql` можно выполнить `supabase/migrations/20260324120000_init.sql`, затем `content-full.sql`.

5. Authentication → Providers / Signups: отключите **Confirm email** (для MVP).

6. Запуск:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

| Кто | URL |
|-----|-----|
| Ученик | `/login` → `/app` |
| Админ | email из `ADMIN_EMAILS` → `/admin` |

## Перед деплоем (чеклист)

- [ ] В облачном Supabase выполнены `setup-all.sql` + `content-full.sql`
- [ ] Confirm email выключен
- [ ] Локально `npm run build` проходит без ошибок
- [ ] В `.env.local` три переменные заполнены; файл **не** в git
- [ ] Репозиторий на GitHub (или готовность к `npx vercel` без GitHub)

## Деплой на Vercel

### Вариант A — через GitHub

1. Создайте репозиторий на GitHub и загрузите проект (корень репо = папка с `chichik/` и `docs/`).
2. [vercel.com](https://vercel.com) → **Add New → Project** → выберите репозиторий.
3. **Root Directory** = `chichik` (важно).
4. **Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | как в `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | как в `.env.local` |
| `ADMIN_EMAILS` | как в `.env.local` |

5. **Deploy**. Скопируйте URL вида `https://….vercel.app`.
6. Supabase → Authentication → URL Configuration:
   - **Site URL**: `https://….vercel.app`
   - **Redirect URLs**: `https://….vercel.app/**`

### Вариант B — без GitHub (CLI)

В папке `chichik`:

```bash
npx vercel
npx vercel --prod
```

Те же три env-переменные задайте в CLI или в дашборде Vercel. Root directory — сама папка `chichik`.

## Smoke-тест после деплоя

1. Регистрация нового ученика → онбординг → `/app`
2. Тема → теория → задание → верный/неверный ответ
3. Диагностика по предмету → карта mastery
4. Банк ошибок: после ошибки есть запись; после верного повтора — resolved
5. Пробник: таймер, финиш, разбор
6. Админ: вход с email из `ADMIN_EMAILS` → правка темы → видно ученику
7. Обычный ученик не открывает `/admin`
8. Mobile: узкий экран кабинета

## Роли

| Роль | Как получить | Куда |
|------|--------------|------|
| Ученик | обычная регистрация | `/app` |
| Админ | email в `ADMIN_EMAILS` | `/admin` |

## Статус этапов

- [x] Этап 0 — Supabase clients, env, миграции
- [x] Этап 1 — Auth, profiles, роли, proxy, онбординг
- [x] Этап 1b — Админка CRUD + seed
- [x] Этап 2 — каталог и практика из БД
- [x] Этапы 3–5 — диагностика, банк ошибок, пробники
- [ ] Этап 6 — деплой на Vercel + smoke-тест

Документация продукта: [../docs/architecture.md](../docs/architecture.md), [../docs/implementation-plan.md](../docs/implementation-plan.md).
