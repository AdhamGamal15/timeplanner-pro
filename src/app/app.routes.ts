import { Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { Home } from './pages/home/home';
import { Tasks } from './pages/tasks/tasks';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      { path: 'tasks', component: Tasks },
      // Lazy-loaded: the About page is split into its own bundle.
      { path: 'about', loadComponent: () => import('./pages/about/about').then((m) => m.About) },
      { path: '**', component: NotFound },
    ],
  },
];
