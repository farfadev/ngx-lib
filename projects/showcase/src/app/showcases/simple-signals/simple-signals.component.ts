import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";
import { isEqual } from 'lodash-es';

@Component({
  selector: 'showcases-simple-signals',
  templateUrl: './simple-signals.component.html',
  styleUrls: ['./simple-signals.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseSimpleSignalsComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any, label?: string) {
    const scheme: ObjectEditor.Scheme = { uibase: 'none', default: value, label, readonly: true };
    return scheme;
  }

  mycontext: ObjectEditor.Context = {
    value: {
      simpleText: 'hello',
      simpleNumber: 3,
      simpleColor: 'green',
      simpleBoolean: false,
      simpleRadio: undefined
    },
    scheme: {
      uibase: 'object',
      label: 'showcase simple object',
      properties: {
        simpleText: {
          uibase: 'text',
          default: 'test'
        },
        simpleNumber: {
          uibase: 'number',
          default: 5,
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleNumber:12'), ObjectEditor.signal('simpleNumber:-1'), ObjectEditor.signal('simpleNumber:6')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: ObjectEditor.Signal) => {
                switch (signal) {
                  case ObjectEditor.signal('simpleNumber:12'):
                    context.value = 12;
                    break;
                  case ObjectEditor.signal('simpleNumber:-1'):
                    context.value = -1;
                    break;
                  case ObjectEditor.signal('simpleNumber:6'):
                    context.value = 6;
                    break;
                }
              }
            },
          ]
        },
        simpleColor: {
          uibase: 'color',
          default: 'blue',
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleColor:red'), ObjectEditor.signal('simpleColor:green'), ObjectEditor.signal('simpleColor:yellow')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: ObjectEditor.Signal) => {
                switch (signal) {
                  case ObjectEditor.signal('simpleColor:red'):
                    context.value = 'red';
                    break;
                  case ObjectEditor.signal('simpleColor:green'):
                    context.value = 'green';
                    break;
                  case ObjectEditor.signal('simpleColor:yellow'):
                    context.value = 'yellow';
                    break;
                }
              }
            },
          ]
        },
        simpleBoolean: {
          uibase: 'boolean',
          default: true,
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleBoolean:true'), ObjectEditor.signal('simpleBoolean:false')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: ObjectEditor.Signal) => {
                context.value = signal === ObjectEditor.signal('simpleBoolean:true') ? true : false;
              }
            }
          ]
        },
        simpleSignals: {
          uibase: 'select',
          uiEffects: {
            radio: true,
            horizontal: true
          },
          selectionList: {
            sel1: this.value2scheme('coucou'),
            sel2: this.value2scheme(0),
            sel3: this.value2scheme({ a: 1, b: 'zebu' })
          },
          defaultSelectionKey: 'sel2',
          fireSignals: (context: ObjectEditor.Context) => {
            if (context.value == 'coucou') {
              return [
                ObjectEditor.signal("simpleBoolean:true"),
                ObjectEditor.signal('simpleColor:green'),
                ObjectEditor.signal('simpleNumber:12'),
              ]
            }
            else if (context.value == 0) {
              return [
                ObjectEditor.signal("simpleBoolean:false"),
                ObjectEditor.signal('simpleColor:red'),
                ObjectEditor.signal('simpleNumber:-1'),
              ]
            }
            else if (isEqual(context.value, { a: 1, b: 'zebu' })) {
              return [
                ObjectEditor.signal("simpleBoolean:false"),
                ObjectEditor.signal('simpleColor:yellow'),
                ObjectEditor.signal('simpleNumber:6'),
              ]
            }
            return [];
          }
        },
      }
    }
  }
}

