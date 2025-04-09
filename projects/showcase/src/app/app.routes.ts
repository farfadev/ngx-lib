import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'test',
        loadComponent: () => import('./test/test.component').then((m) => m.TestComponent),
      },
      {
        path: 'icons-tooltip',
        loadComponent: () => import('./tutorials/icons-tooltip/icons-tooltip.component').then((m) => m.ShowcaseIconsTooltipComponent),
      },
      {
        path: 'simple-object',
        loadComponent: () => import('./tutorials/simple-object/simple-object.component').then((m) => m.ShowcaseSimpleObjectComponent),
      },
      {
        path: 'custom-frontend',
        loadComponent: () => import('./tutorials/custom-frontend/custom-frontend.component').then((m) => m.ShowcasesCustomFrontendComponent),
      },
      {
        path: 'dynamic-styling',
        loadComponent: () => import('./tutorials/dynamic-styling/dynamic-styling.component').then((m) => m.ShowcaseDynamicStylingComponent),
      },
];
