# TimePlanner Pro (Angular)

Angular port of the React **TimePlanner Pro** app, with the same features, same Bootstrap look, and
same `localStorage` format. Built with Angular 21 (standalone components, signals, new control flow).

## Getting Started

```bash
npm install
npm start          # ng serve, then open http://localhost:4200
```

> If `npm install` fails with `Cannot read properties of null (reading 'edgesOut')`
> (a known npm 10 bug), run `npm install --legacy-peer-deps` instead.

## Build

```bash
npm run build      # output in dist/timeplanner-pro-angular/browser
```

## React -> Angular mapping

| React version                              | Angular version                                              |
| ------------------------------------------ | ------------------------------------------------------------ |
| `BrowserRouter` + `<Routes>`               | `provideRouter(routes)` in `app.config.ts` / `app.routes.ts` |
| `Layout` + `<Outlet />`                    | `Layout` + `<router-outlet />`                               |
| `React.lazy` + `Suspense` (About)          | `loadComponent: () => import(...)` + spinner in `Layout`     |
| `NavLink` (active class)                   | `routerLink` + `routerLinkActive`                            |
| `useState` / `useMemo`-style derived data  | `signal()` / `computed()`                                    |
| `useEffect` (auto-save)                    | `effect()` in `TaskService`                                  |
| `useEffect` + `window.addEventListener`    | `host: { '(window:resize)': ... }`, `storage` listener in service |
| `setInterval` reminder + cleanup           | `setInterval` + `DestroyRef.onDestroy`                       |
| `useRef` auto-focus                        | `viewChild()` + `afterNextRender()`                          |
| `React.memo` / `useCallback`               | `ChangeDetectionStrategy.OnPush`                             |
| Controlled inputs (`value` + `onChange`)   | `[ngModel]` + `(ngModelChange)` bound to signals             |
| `Task` constructor + prototype methods     | `Task` class (`getFormattedDate`, `setTitle`)                |

## Project Structure

```
src/app/
  models/task.ts               Task class
  utils/                       constants, validators, task-status, storage (join/split)
  services/task.service.ts     tasks signal, auto-save, cross-tab sync
  components/
    layout/, navbar/, footer/
    task-form/, task-card/, task-list/, toast-notification/
  pages/
    home/, tasks/, about/ (lazy), not-found/
  app.routes.ts                routes configuration
  app.config.ts                app providers
```
