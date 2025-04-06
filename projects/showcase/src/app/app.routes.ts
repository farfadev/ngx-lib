import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'test',
        pathMatch: 'full'
      },
      {
        path: 'test',
        loadComponent: () => import('./test/test.component').then((m) => m.TestComponent),
      },
      {
        path: 'tuto1',
        loadComponent: () => import('./tutorials/tuto1/tuto1.component').then((m) => m.Tuto1Component),
      },
];
