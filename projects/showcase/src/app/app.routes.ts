import { Routes } from '@angular/router';

const getSources = (v: string) => {
  return {
    TS: 'assets/' + v.substring(2) + '.ts',
    HTML: 'assets/' + v.substring(2) + '.html',
    SCSS: 'assets/' + v.substring(2) + '.scss'
  }
}

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
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: import('./showcases/icons-tooltip/icons-tooltip.component'),
      sources: getSources('./showcases/icons-tooltip/icons-tooltip.component'),
    }
  },
  {
    path: 'simple-object',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: import('./showcases/simple-object/simple-object.component'),
      sources: getSources('./showcases/simple-object/simple-object.component'),
    }
  },
  {
    path: 'custom-frontend',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: import('./showcases/custom-frontend/custom-frontend.component'),
      sources: getSources('./showcases/custom-frontend/custom-frontend.component'),
    }
  },
  {
    path: 'dynamic-styling',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: import('./showcases/dynamic-styling/dynamic-styling.component'),
      sources: getSources('./showcases/dynamic-styling/dynamic-styling.component'),
    }
  }
];
