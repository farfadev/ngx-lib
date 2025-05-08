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
          default: 'test',
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleText')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                context.value = signal.data;
              }
            }
          ]
        },
        simpleNumber: {
          uibase: 'number',
          default: 5,
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleNumber')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                context.value = signal.data;
              }
            }
          ]
        },
        simpleColor: {
          uibase: 'color',
          default: 'blue',
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleColor')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal; data?: any }) => {
                context.value = signal.data;
              }
            },
          ]
        },
        simpleBoolean: {
          uibase: 'boolean',
          default: true,
          onSignals: [
            {
              signals: [ObjectEditor.signal('simpleBoolean')],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal; data?: any }) => {
                context.value = signal.data;
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
                { signal: ObjectEditor.signal("simpleBoolean"), data: true },
                { signal: ObjectEditor.signal('simpleColor'), data: 'green' },
                { signal: ObjectEditor.signal('simpleNumber'), data: 12 },
                { signal: ObjectEditor.signal('simpleText'), data: 'Selection 1 selected' },
              ]
            }
            else if (context.value == 0) {
              return [
                { signal: ObjectEditor.signal("simpleBoolean"), data: false },
                { signal: ObjectEditor.signal('simpleColor'), data: 'red' },
                { signal: ObjectEditor.signal('simpleNumber'), data: -1 },
                { signal: ObjectEditor.signal('simpleText'), data: 'Selection 2 selected' },
              ]
            }
            else if (isEqual(context.value, { a: 1, b: 'zebu' })) {
              return [
                { signal: ObjectEditor.signal("simpleBoolean"), data: false },
                { signal: ObjectEditor.signal('simpleColor'), data: 'yellow' },
                { signal: ObjectEditor.signal('simpleNumber'), data: 6 },
                { signal: ObjectEditor.signal('simpleText'), data: 'Selection 3 selected' },
              ]
            }
            return [];
          }
        },
      }
    }
  }
}

