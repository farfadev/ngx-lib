import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { Select } from 'primeng/select';

@NgModule({
  declarations: [
    ObjectEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    FieldsetModule,
    Select
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { }
