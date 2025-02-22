import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectEditorComponent } from './component/object-editor.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';


@NgModule({
  declarations: [
    ObjectEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    FieldsetModule
  ],
  exports: [
    ObjectEditorComponent,
  ]
})
export class ObjectEditorModule { }
