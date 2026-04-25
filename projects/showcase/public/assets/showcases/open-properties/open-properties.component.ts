
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

const selSignal = ObjectEditor.signal('selSignal');
@Component({
  selector: 'showcases-optional-properties',
  templateUrl: './open-properties.component.html',
  styleUrls: ['./open-properties.component.scss'],
  imports: [FormsModule, ObjectEditorModule],
})

export class ShowcaseOpenPropertiesComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any, label?: string) {
    const scheme: ObjectEditor.Scheme = { uibase: 'none', default: value, label, readonly: true };
    return scheme;
  }

  mycontext: ObjectEditor.Context = {
    value: {
      simpleNumber: 3,
      simpleColor: '#0000ff',
      simpleBoolean: false,
      simpleRadio: undefined
    },
    scheme: {
      uibase: 'object',
      label: 'showcase optional properties',
      properties: {
        simpleText: {
          uibase: 'text',
          optional: true,
          default: 'test'
        },
        simpleNumber: {
          uibase: 'number',
          default: 5
        },
        simpleColor: {
          uibase: 'color',
          optional: true,
          default: '#008000'
        },
        simpleBoolean: {
          uibase: 'boolean',
          default: true
        },
        simpleRadio: {
          uibase: 'select',
          optional: true,
          uiEffects: {
            radio: true,
            horizontal: true
          },
          selectionList: {
            sel1: this.value2scheme('coucou'),
            sel2: this.value2scheme(0),
            sel3: this.value2scheme({ a: 1, b: 'zebu' })
          },
          fireSignals: (context?: ObjectEditor.Context) => [
            { signal: selSignal, data: context?.value }
          ]
        },
        subjectToSel2: (context?: ObjectEditor.Context): ObjectEditor.Scheme => {
          if (context?.pcontext?.value['simpleRadio'] == 0) {
            return {
              uibase: 'text', label: 'url', onSignals: [{
                signals: [selSignal],
                call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                  if (signal.data == 0) {
                  }
                }
              }]
            }
          }
          return { uibase: 'none', default: undefined, readonly: true, onSignals: [{
                signals: [selSignal],
                call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                  if (signal.data == 0) {
                  }
                }
              }]
           }
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
    }
  }
}

