
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  imports: [FormsModule, ObjectEditorModule],
})
export class ShowcaseFilesComponent {

  @Input()
  debug: boolean = false;

  myscheme: ObjectEditor.Scheme = {
    uibase: 'object',
    label: 'showcase files',
    properties: {
      files: {
        uibase: 'file',
      },
    }
  }
  mycontext: ObjectEditor.Context = ObjectEditor.createContext(this.myscheme);
}


