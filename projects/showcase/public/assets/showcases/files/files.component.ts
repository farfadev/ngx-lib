import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseFilesComponent {

  @Input()
  debug: boolean = false;

  mycontext: ObjectEditor.Context = {
    scheme: {
      uibase: 'object',
      label: 'showcase files',
      properties: {
        files: {
          uibase: 'file',
        },
      }
    }
  }
}

