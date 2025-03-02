import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { PopoverModule } from 'primeng/popover'

@NgModule({
  declarations: [
    ObjectEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    FieldsetModule,
    Select,
    PopoverModule
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { }
