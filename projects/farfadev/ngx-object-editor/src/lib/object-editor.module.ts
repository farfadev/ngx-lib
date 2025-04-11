import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { FarfaTooltipModule } from '@farfadev/ngx-a-tooltip';
import { OENumberComponent } from './component/number/number.component';
import { OERadioComponent } from './component/radio/radio.component';
import { OEMaskedComponent } from './component/masked/masked.component';
import { OEFileComponent } from './component/file/file.component';
import { OECustomComponent } from './component/custom/custom.component';
import { OEAngularComponent } from './component/angular/angular.component';
import { OECheckboxComponent } from './component/checkbox/checkbox.component';
import { OEDefaultComponent } from './component/default/default.component';
import { FarfaIconModule } from './farfa-icon/farfa-icon.module';
import { FarfaIconService } from './farfa-icon/farfa-icon.service';

@NgModule({
  declarations: [
    OEMaskedComponent,
    OECheckboxComponent,
    OENumberComponent,
    OERadioComponent,
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
    FarfaIconModule
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { 
    constructor(private iconService: FarfaIconService) {
      const iconCircleMinus = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>'
      const iconCirclePlus = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>'
      const iconInfo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
      const iconMoveUp = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 6L12 2L16 6"/><path d="M12 2V22"/></svg>'
      const iconMoveDown = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 18L12 22L16 18"/><path d="M12 2V22"/></svg>'
      const iconTrash2 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
      iconService.setSVG('circle-minus',iconCircleMinus);
      iconService.setSVG('circle-plus',iconCirclePlus);
      iconService.setSVG('info',iconInfo);
      iconService.setSVG('move-up',iconMoveUp);
      iconService.setSVG('move-down',iconMoveDown);
      iconService.setSVG('trash-2',iconTrash2);
    }
}
