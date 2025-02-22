import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';

import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
      importProvidersFrom(BrowserAnimationsModule),
      provideRouter(routes,withDebugTracing()),
      provideAnimationsAsync(),
      provideHttpClient(),
      providePrimeNG({
          theme: {
              preset: Aura,
              options: {
                  cssLayer: {
                      name: 'primeng',
                      order: 'app-styles, primeng'
                  }
              }
              },
      })
  ]
};
