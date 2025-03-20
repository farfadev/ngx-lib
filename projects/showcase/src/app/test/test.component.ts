import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule, checkNumber } from "@farfadev/ngx-object-editor";

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
        toggle: true
      },
      unrestricted: true,
      innerSchemeSelectionList: {
        'test-object': {
          uibase: 'object',
        },
        'test-object-2': {
          uibase: 'object',
          label: 'rantanplan',
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
        '1-text': {
          uibase: 'text',
          default: 'test',
          style: (context: ObjectEditor.Context) => context.value == "red" ?  "color: red;font-weight: bold":"color: green;font-weight: bold",
          description: (context: ObjectEditor.Context) => "<p><b>property p1</b></br></p<p>this is to test a text property</br></p>" +
            "<p>value=" + (typeof context.value) + " " + context.value + "</p>"
        },
        '2-number': {
          uibase: 'number',
          default: 5,
          check: (context: ObjectEditor.Context,cursorPosition?: number) => checkNumber(context.value,{
            min: -1,
            max: 17,
            significants: 4  
          },cursorPosition),
        },
        '2a-number': {
          uibase: 'number',
          default: 5,
          min: -1,
          max: 1789,
          significants: 8,
          maskOptions: {
            mask: Number,
            thousandsSeparator: ' ',
            radix: '.',
            expose: true
          }
        },
        '2b-dms': {
          uibase: 'number',
          default: 5,
          min: -1,
          max: 1789,
          significants: 4,
          maskOptions: {
            mask: Number,
            thousandsSeparator: 'z',
            radix: '.',

          }
        },
        '2-opt number': {
          uibase: 'number',
          optional: true,
          default: 5,
          min: -1,
          max: 17,
          significants: 4
        },
        '3-color': {
          uibase: 'color'
        },
        '4-boolean': {
          uibase: 'boolean',
          label: '4-boolean test-ui-label',
          styleClass: ".mycheckbox",
          designToken: {background: 'lightgrey',icon: {color: 'red',checked: {color: 'red',hover:{color: 'red'}}},checked: {hover: {background: 'yellow'},background: 'yellow',color: 'blue',border: {color: 'yellow'}},width: '150px'},
          style: "color: red",
          default: true
        },
        '5-select': {
          uibase: 'select',
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
        '5a-array': {
          uibase: 'array',
          innerStyle: (context: ObjectEditor.Context) => {
            return context.value.length > 4 ?'overflow:scroll; height:100px;' :'';
          },
          innerSchemeSelectionList: {
            'boolean': {
              uibase: 'boolean'
            },
            'number': {
              uibase: 'number'
            }
          }
        },
        '5-opt-select': {
          uibase: 'select',
          optional: true,
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
        '6-object': {
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
        '7-radio': {
          uibase: 'radio',
          enum: {
            sel1: 'coucou',
            sel2: 0,
            sel3: {a: 1, b: 'zebu'}
          }
        },
        '8-date': {
          uibase: 'date'
        },
        '9-datetime': {
          uibase: 'datetime'
        },
        '10-file': {
          uibase: 'file'
        },
        '11-image': {
          uibase: 'image'
        },
        '12-password': {
          uibase: 'password'
        },
        '13-range': {
          uibase: 'range'
        },

      }
    }
  }

  mycontext2: ObjectEditor.Context = {
    value: false,
    scheme: {
      uibase: 'boolean',
      label: 'test-object-editor2',
    }
  }


  constructor() { 
  }

  ngOnInit() { }

}
function numberCheck(context: ObjectEditor.Context, arg1: { min: number; max: number; significants: number; }): ObjectEditor.Checked | null {
  throw new Error('Function not implemented.');
}

