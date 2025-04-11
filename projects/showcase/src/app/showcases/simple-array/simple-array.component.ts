import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-simple-array',
  templateUrl: './simple-array.component.html',
  styleUrls: ['./simple-array.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseSimpleArrayComponent {

  @Input()
  debug: boolean = false;

  mycontext: ObjectEditor.Context = {
    value: {
      simpleArray: [3, true, 9]
    },
    scheme: {
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
          innerSchemeSelectionList: {
            'boolean': {
              uibase: 'boolean'
            },
            'number': {
              uibase: 'number'
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
  }
}

