import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { FarfaTooltipModule } from '@farfadev/ngx-a-tooltip';
import { OENumberComponent } from './component/number/number.component';
import { OEMaskedComponent } from './component/masked/masked.component';
import { OEFileComponent } from './component/file/file.component';
import { OECustomComponent } from './component/custom/custom.component';
import { OEAngularComponent } from './component/angular/angular.component';
import { OECheckboxComponent } from './component/checkbox/checkbox.component';
import { OEDefaultComponent } from './component/default/default.component';
import { FarfaSvgModule, FarfaSvgService } from '@farfadev/ngx-svg';
import { OEColorComponent } from './component/color/color.component';
@NgModule({
  declarations: [
    OEMaskedComponent,
    OECheckboxComponent,
    OENumberComponent,
    OEColorComponent,
    OEFileComponent,
    OECustomComponent,
    OEAngularComponent,
    ObjectEditorComponent,
    OEDefaultComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FarfaTooltipModule,
    FarfaSvgModule
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { 
    constructor(private svgService: FarfaSvgService) {
      const iconCircleMinus = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>'
      const iconCirclePlus = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>'
      const iconInfo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
      const iconMoveUp = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 6L12 2L16 6"/><path d="M12 2V22"/></svg>'
      const iconMoveDown = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 18L12 22L16 18"/><path d="M12 2V22"/></svg>'
      const iconTrash2 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
      const iconReset = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 118.66" style="enable-background:new 0 0 122.88 118.66"><g><path d="M106.2,22.2c1.78,2.21,3.43,4.55,5.06,7.46c5.99,10.64,8.52,22.73,7.49,34.54c-1.01,11.54-5.43,22.83-13.37,32.27 c-2.85,3.39-5.91,6.38-9.13,8.97c-11.11,8.93-24.28,13.34-37.41,13.22c-13.13-0.13-26.21-4.78-37.14-13.98 c-3.19-2.68-6.18-5.73-8.91-9.13C6.38,87.59,2.26,78.26,0.71,68.41c-1.53-9.67-0.59-19.83,3.07-29.66 c3.49-9.35,8.82-17.68,15.78-24.21C26.18,8.33,34.29,3.76,43.68,1.48c2.94-0.71,5.94-1.18,8.99-1.37c3.06-0.2,6.19-0.13,9.4,0.22 c2.01,0.22,3.46,2.03,3.24,4.04c-0.22,2.01-2.03,3.46-4.04,3.24c-2.78-0.31-5.49-0.37-8.14-0.2c-2.65,0.17-5.23,0.57-7.73,1.17 c-8.11,1.96-15.1,5.91-20.84,11.29C18.43,25.63,13.72,33,10.62,41.3c-3.21,8.61-4.04,17.51-2.7,25.96 c1.36,8.59,4.96,16.74,10.55,23.7c2.47,3.07,5.12,5.78,7.91,8.13c9.59,8.07,21.03,12.15,32.5,12.26c11.47,0.11,23-3.76,32.76-11.61 c2.9-2.33,5.62-4.98,8.13-7.97c6.92-8.22,10.77-18.09,11.66-28.2c0.91-10.37-1.32-20.99-6.57-30.33c-1.59-2.82-3.21-5.07-5.01-7.24 l-0.53,14.7c-0.07,2.02-1.76,3.6-3.78,3.52c-2.02-0.07-3.6-1.76-3.52-3.78l0.85-23.42c0.07-2.02,1.76-3.6,3.78-3.52 c0.13,0,0.25,0.02,0.37,0.03l0,0l22.7,3.19c2,0.28,3.4,2.12,3.12,4.13c-0.28,2-2.12,3.4-4.13,3.12L106.2,22.2L106.2,22.2z"/></g></svg>';
      svgService.setSVG('circle-minus',iconCircleMinus);
      svgService.setSVG('circle-plus',iconCirclePlus);
      svgService.setSVG('info',iconInfo);
      svgService.setSVG('move-up',iconMoveUp);
      svgService.setSVG('move-down',iconMoveDown);
      svgService.setSVG('trash-2',iconTrash2);
      svgService.setSVG('reset',iconReset);
    }
}
