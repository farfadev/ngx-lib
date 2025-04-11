import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputSocket, FarfaIconModule, FarfaIconService, ObjectEditor, adjustDMS } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule, adjustNumber, dmsMask } from "@farfadev/ngx-object-editor";

// https://github.com/nerdstep/react-coordinate-input/blob/master/README.md
// https://imask.js.org/guide.html#getting-started

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-object-editor-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule, ObjectEditorModule, FarfaIconModule],
})
export class TestComponent implements OnInit {

  err_msg: string = '';
  @Input()
  debug: boolean = false;

  testicon = { name: 'test' };

  constructor(private iconService: FarfaIconService) {
  }

  mycontext: ObjectEditor.Context = {
    value: {
      p1: 'coucou',
      p3: '#ffffff',
      p4: false,
      p6: [32, 67]
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
          uiEffects: { style: (context: ObjectEditor.Context) => context.value == "red" ? "color: red;font-weight: bold" : "color: green;font-weight: bold" },
          description: (context: ObjectEditor.Context) => '<p><b>property ' + context.key + '</b></br></p<p>this is to test a text input, style <span style=\'font-weight:bold;color:red;\'>bold red</span> when value is \'red\' </br></p>' +
            "<p>value=" + (typeof context.value) + " " + context.value + "</p>"
        },
        '2-number': {
          uibase: 'number',
          default: 5,
          adjust: adjustNumber({ min: -1, max: 17, decimals: 12, significants: 4 })
        },
        '2a-number': {
          uibase: 'number',
          default: 5,
          maskOptions: {
            mask: Number,
            thousandsSeparator: '!',
            radix: '.',
            scale: 20,
            expose: true
          }
        },
        '2b-dms': {
          uibase: 'number',
          default: 5,
          adjust: adjustDMS({})
          //          maskOptions: dmsMask
        },
        '2-opt number': {
          uibase: 'number',
          optional: true,
          default: 5,
        },
        '3-color': {
          uibase: 'color'
        },
        '4-boolean': {
          uibase: 'boolean',
          label: '4-boolean test-ui-label',
          uiEffects: {
            styleClass: ".mycheckbox",
            designToken: { background: 'lightgrey', icon: { color: 'red', checked: { color: 'red', hover: { color: 'red' } } }, checked: { hover: { background: 'yellow' }, background: 'yellow', color: 'blue', border: { color: 'yellow' } }, width: '150px' },
            style: "color: red"
          },
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
                    new InputSocket(c as HTMLInputElement, adjustDMS({}), subContext, (context: ObjectEditor.Context, err_msg: string) => {
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


  ngOnInit() {
    let i = true;
    this.iconService.fetchSVGIcon('world-losange', 'assets/world-in-losange.svg')
      .catch((error) => {
        this.err_msg = 'Error importing SVG Icon \'assets/world-in-losange.svg\' : ' + error;
      });
    this.iconService.fetchSVGIcon('microphone', 'assets/microphone.svg')
      .catch((error) => {
        this.err_msg = 'Error importing SVG Icon \'assets/microphone.svg\' : ' + error;
      });

    setInterval(() => {
      if (i) {
        this.iconService.fetchSVGIcon('changing-icon', 'assets/world-in-losange.svg')
          .catch((error) => {
            this.err_msg = 'Error importing SVG Icon \'assets/world-in-losange.svg\' : ' + error;
          });
        this.testicon = { name: 'world-losange' };
      }
      else {
        this.iconService.fetchSVGIcon('changing-icon', 'assets/microphone.svg')
          .catch((error) => {
            this.err_msg = 'Error importing SVG Icon \'assets/microphone.svg\' : ' + error;
          });
        this.testicon = { name: 'microphone' };
      }
      i = !i;
    }, 5000);
  }

}

