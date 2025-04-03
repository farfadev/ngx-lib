import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { ATooltipModule } from '@farfadev/ngx-a-tooltip';
import { OENumberComponent } from './component/number/number.component';
import { OERadioComponent } from './component/radio/radio.component';
import { OEMaskedComponent } from './component/masked/masked.component';
import { OEFileComponent } from './component/file/file.component';
import { OECustomComponent } from './component/custom/custom.component';
import { OECheckboxComponent } from './component/checkbox/checkbox.component';
import { OEDefaultComponent } from './component/default/default.component';

@NgModule({
  declarations: [
    OEMaskedComponent,
    OECheckboxComponent,
    OENumberComponent,
    OERadioComponent,
    OEFileComponent,
    OECustomComponent,
    ObjectEditorComponent,
    OEDefaultComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ATooltipModule
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { }
