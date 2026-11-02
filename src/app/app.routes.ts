import { Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { Home } from './pages/home/home';
import { Tasks } from './pages/tasks/tasks';
import { NotFound } from './pages/not-found/not-found';

// `data.breadcrumb` feeds the breadcrumb bar under the top bar.
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home, pathMatch: 'full', data: { breadcrumb: ['Home'] } },
      { path: 'tasks', component: Tasks, data: { breadcrumb: ['Tasks'] } },
      // Lazy-loaded pages: each one is split into its own bundle.
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((m) => m.About),
        data: { breadcrumb: ['Support', 'About'] },
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/help/help').then((m) => m.Help),
        data: { breadcrumb: ['Support', 'Help'] },
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
        data: { breadcrumb: ['Support', 'Contact Us'] },
      },
      { path: '**', component: NotFound, data: { breadcrumb: ['Page Not Found'] } },
    ],
  },
];
