
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-simple-array',
  templateUrl: './simple-array.component.html',
  styleUrls: ['./simple-array.component.scss'],
  imports: [FormsModule, ObjectEditorModule],
})
export class ShowcaseSimpleArrayComponent {

  @Input()
  debug: boolean = false;

  myvalue = {
    simpleArray: [3, true, 9]
  }
  myscheme: ObjectEditor.Scheme = {
    uibase: 'object',
    label: 'showcase simple array',
    properties: {
      simpleArray: {
        uibase: 'array',
        uiEffects: {
          toggle: true,
          innerStyle: (context: ObjectEditor.Context) => {
            return context.value.length > 4 ? 'overflow:scroll; height:300px;' : '';
          }
        },
        selectionList: {
          'boolean': {
            uibase: 'boolean'
          },
          'number': {
            uibase: 'number'
          },
          'text': {
            uibase: 'text'
          }
        },
        properties: {
          0: {
            uibase: 'number'
          },
          1: {
            uibase: 'boolean'
          },
          2: {
            uibase: 'number'
          }
        }
      }
    }
  }
  mycontext: ObjectEditor.Context = ObjectEditor.createContext(this.myscheme, this.myvalue);
}


