import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'app-object-editor-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  imports: [RouterModule, ObjectEditorModule],
})
export class TestComponent  implements OnInit {

  mycontext1: ObjectEditor.Context = {
    value: {
     p1: 'coucou',
     p3: '#ffffff',
     p4: false
    } ,
    scheme: {
      uibase: 'object',
      label: 'test-object-editor',
      restricted: false,
      innerSelectionList: {
        'test-object': {
          uibase: 'object',
        },
        'test-object-2': {
          uibase: 'object',
          label: 'rantanplan',
          restricted: true,
          innerSelectionList: {
            'sub-test-boolean': {
              uibase: 'boolean'
            }
          }
        },
        'test-array': {
          uibase: 'array'
        }
      },
     properties: {
       p1: {
         uibase: 'text'
       },
       p2: {
         uibase: 'number',
         optional: true,
         default: 5
       },
       p3: {
         uibase: 'color'
       },
       p4: {
        uibase: 'boolean',
        label: 'test-ui-label p4',
        default: true
      },
      p5: {
        uibase: 'select',
        optional: true,
        selectionList: {
          color: {
            uibase: 'color',
            default: '#ff004ef0'
          },
          boolean: {
            uibase: 'boolean'
          },
          number: {
            uibase: 'number',
            default: 3,
            min: 0,
            max: 10,
            decimals: 0
          }
        }
      }
    }
    }
   }

   mycontext2: ObjectEditor.Context = {
    value: false,
    scheme: {
      uibase: 'boolean',
      label: 'test-object-editor2',
      restricted: true,
      }
   }

  constructor() { }

  ngOnInit() {}

}
