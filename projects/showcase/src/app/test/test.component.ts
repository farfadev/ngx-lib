import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-object-editor-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  imports: [RouterModule, ObjectEditorModule],
})
export class TestComponent implements OnInit {

  mycontext1: ObjectEditor.Context = {
    value: {
      p1: 'coucou',
      p3: '#ffffff',
      p4: false,
      p6: [32,67]
    },
    scheme: {
      uibase: 'object',
      label: 'test-object-editor',
      uiEffects: {
        toggle: true,
      },
      restricted: false,
      innerSchemeSelectionList: {
        'test-object': {
          uibase: 'object',
        },
        'test-object-2': {
          uibase: 'object',
          label: 'rantanplan',
          restricted: true,
          innerSchemeSelectionList: () => {
            return {
              'sub-test-boolean': {
                uibase: 'boolean'
              }
            }
          }
        },
        'test-array': {
          uibase: 'array'
        }
      },
      properties: {
        p1: {
          uibase: 'text',
          default: 'test',
          style: (context: ObjectEditor.Context) => context.value == "red" ?  "color: red;font-weight: bold":"color: green;font-weight: bold",
          description: (context: ObjectEditor.Context) => "<p><b>property p1</b></br></p<p>this is to test a text property</br></p>" +
            "<p>value=" + (typeof context.value) + " " + context.value + "</p>"
        },
        p2: {
          uibase: 'number',
          label: 'super p2',
          optional: true,
          default: 5
        },
        p3: {
          uibase: 'color'
        },
        p4: {
          uibase: 'boolean',
          label: 'test-ui-label p4',
          styleClass: ".mycheckbox",
          designToken: {background: 'lightgrey',icon: {color: 'red',checked: {color: 'red',hover:{color: 'red'}}},checked: {hover: {background: 'yellow'},background: 'yellow',color: 'blue',border: {color: 'yellow'}},width: '150px'},
          style: "color: red",
          default: true
        },
        p5: {
          uibase: 'select',
          optional: true,
          restricted: true,
          schemeSelectionList: {
            color: {
              uibase: 'color',
              label: 'mycolor',
              default: '#ff004e'
            },
            boolean: {
              uibase: 'boolean',
              label: 'myboolean'
            },
            number: {
              uibase: 'number',
              default: 3,
              min: 0,
              max: 10,
              decimals: 0
            }
          }
        },
        p6: {
          uibase: 'object',
          restricted: true,
          properties: {
            lat: {
              uibase: 'number'
            },
            lon: {
              uibase: 'number'
            }
          },
          transform: {
            forward: (value: number[]) => ({ lat: value[0], lon: value[1] }),
            backward: (value: Coordinates) => [value.lat, value.lon]
          } 
        } as ObjectEditor.Scheme<number[],Coordinates>,
        p7: {
          uibase: 'radio',
          enum: {
            sel1: 'coucou',
            sel2: 0,
            sel3: {a: 1, b: 'zebu'}
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

  ngOnInit() { }

}
