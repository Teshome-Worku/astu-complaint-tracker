# Smart Complaint System

A React + Vite frontend for a complaint management platform with role-aware flows for students, staff, and administrators.

## Tech Stack

- React 19
- React Router
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Vite
- JSON Server (mock API)

## Scripts

- `npm run dev`: start frontend dev server
- `npm run build`: production build
- `npm run preview`: preview build locally
- `npm run lint`: run ESLint
- `npm run server`: start mock backend on `http://localhost:5000`

## Tailwind Notes

Tailwind is loaded from `src/index.css` using:

```css
@import "tailwindcss";
```

If styles are not appearing, verify:

1. `src/main.jsx` imports `./index.css`
2. `postcss.config.cjs` includes `@tailwindcss/postcss`
3. the app is started from this folder (`smart-complaint-system`)
