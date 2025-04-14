import { Routes } from '@angular/router';

const getSources = (v: string, key: string = '') => {
  const o: Record<string, any> = {};
  o['TS' + key] = {url: 'assets/' + v.substring(2) + '.ts'};
  o['HTML' + key] = {url: 'assets/' + v.substring(2) + '.html'};
  o['SCSS' + key] = {url: 'assets/' + v.substring(2) + '.scss'};
  return o;
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
      component: () => import('./showcases/icons-tooltip/icons-tooltip.component').then((m) => m.ShowcaseIconsTooltipComponent),
      sources: {...getSources('./showcases/icons-tooltip/icons-tooltip.component'), },
    }
  },
  {
    path: 'simple-object',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/simple-object/simple-object.component').then((m) => m.ShowcaseSimpleObjectComponent),
      sources: getSources('./showcases/simple-object/simple-object.component'),
    }
  },
  {
    path: 'optional-properties',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/optional-properties/optional-properties.component').then((m) => m.ShowcaseOptionalPropertiesComponent),
      sources: getSources('./showcases/optional-properties/optional-properties.component'),
    }
  },
  {
    path: 'simple-array',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/simple-array/simple-array.component').then((m) => m.ShowcaseSimpleArrayComponent),
      sources: getSources('./showcases/simple-array/simple-array.component'),
    }
  },
  {
    path: 'files',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/files/files.component').then((m) => m.ShowcaseFilesComponent),
      sources: getSources('./showcases/files/files.component'),
    }
  },
  {
    path: 'scheme-selection',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/scheme-selection/scheme-selection.component').then((m) => m.ShowcaseSchemeSelectionComponent),
      sources: getSources('./showcases/scheme-selection/scheme-selection.component'),
    }
  },
  {
    path: 'custom-frontend',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/custom-frontend/custom-frontend.component').then((m) => m.ShowcasesCustomFrontendComponent),
      sources: getSources('./showcases/custom-frontend/custom-frontend.component'),
    }
  },
  {
    path: 'angular-frontend',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/angular-frontend/angular-frontend.component').then((m) => m.ShowcasesCustomFrontendComponent),
      sources: {
        ...getSources('./showcases/angular-frontend/angular-frontend.component'),
        ...getSources('./showcases/angular-frontend/mycomponent/my.component', ' -custom'),
      }
    }
  },
  {
    path: 'dynamic-styling',
    loadComponent: () => import('./showcases/container/container.component').then((m) => m.ShowcasesContainerComponent),
    data: {
      component: () => import('./showcases/dynamic-styling/dynamic-styling.component').then((m) => m.ShowcaseDynamicStylingComponent),
      sources: getSources('./showcases/dynamic-styling/dynamic-styling.component'),
    }
  }
];
