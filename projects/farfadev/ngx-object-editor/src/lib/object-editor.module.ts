import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { PopoverModule } from 'primeng/popover'
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ATooltipModule } from '@farfadev/ngx-a-tooltip';
import { OERadioComponent } from './component/radio/radio.component';

@NgModule({
  declarations: [
    OERadioComponent,
    ObjectEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    FieldsetModule,
    Select,
    PopoverModule,
    FloatLabelModule,
    IftaLabelModule,
    ATooltipModule
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { }
