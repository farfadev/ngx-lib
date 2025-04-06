import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdjustSocket, ObjectEditor, adjustDMS } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule, adjustNumber, dmsMask } from "@farfadev/ngx-object-editor";

// https://github.com/nerdstep/react-coordinate-input/blob/master/README.md
// https://imask.js.org/guide.html#getting-started

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'object-editor-tuto1',
  templateUrl: './tuto1.component.html',
  styleUrls: ['./tuto1.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class Tuto1Component implements OnInit {

  _debug: boolean = false;
  @Input()
  set debug(v: boolean) {
    this._debug = v;
    this.mycontext.debug = v;
  };
  get debug(): boolean {
    return this._debug;
  }

  mycontext: ObjectEditor.Context = {
    value: {
      simpleText: 'hello',
      simpleNumber: 3,
      simpleColor: '#ffffff',
      simpleBoolean: false,
      simpleRadio: undefined,
      p6: [32, 67]
    },
    scheme: {
      uibase: 'object',
      label: 'tuto1',
      properties: {
        simpleText: {
          uibase: 'text',
          default: 'test'
        },
        simpleNumber: {
          uibase: 'number',
          default: 5
        },
        simpleColor: {
          uibase: 'color',
          default: 'red'
        },
        simpleBoolean: {
          uibase: 'boolean',
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
            }
          }
        },
        '5a-array': {
          uibase: 'array',
          uiEffects: {
            innerStyle: (context: ObjectEditor.Context) => {
              return context.value.length > 4 ? 'overflow:scroll; height:100px;' : '';
            }
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
        } as ObjectEditor.Scheme<number[], Coordinates>,
        '7-radio': {
          uibase: 'radio',
          uiEffects: {
            horizontal: true
          },
          enum: {
            sel1: 'coucou',
            sel2: 0,
            sel3: { a: 1, b: 'zebu' }
          }
        },
        '8-date': {
          uibase: 'date'
        },
        '9-datetime': {
          uibase: 'datetime'
        },
        '10-file': {
          uibase: 'file',
          maskOptions: {
            //            multiple: true,
            accept: '.png,.jpg,.jpeg'
          }
        },
        '11-image': {
          uibase: 'image'
        },
        '12-password': {
          uibase: 'password',
          uiEffects: {
            inputAttributes: {
              pattern: '[\u0021-\u007E]'
            }
          }
        },
        '13-range': {
          uibase: 'range',
          uiEffects: {
            inputAttributes: {
              min: '0',
              max: '100',
              step: '10'
            }
          }
        },
        '14-custom-frontend-coords': {
          uibase: 'custom',
          default: [12.5542, 15.87122],
          transform: {
            forward: (value: number[]) => ({ lat: value[0], lon: value[1] }),
            backward: (value: Coordinates) => [value.lat, value.lon]
          },
          customFrontEnd: {
            html: (context: ObjectEditor.Context) =>
              "<label style='color:red;'>latitude&nbsp;&nbsp;&nbsp;  </label><input id='lat'></input><br>"
              + "<label style='color:blue;'>longitude </label><input id='lon'></input><br>",
            init: (context: ObjectEditor.Context, element: HTMLElement, err: (err_msg: string) => void) => {
              for (const c of element.children) {
                if (c.tagName == 'INPUT') {
                  const subContext = ObjectEditor.getSubContext(context, c.id);
                  if (subContext) {
                    new AdjustSocket(c as HTMLInputElement, adjustDMS({}), subContext, (context: ObjectEditor.Context, err_msg: string) => {
                      err(err_msg);
                      context.editUpdate?.();
                    });
                  }
                }
              }
            }
          }
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

