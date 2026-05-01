
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";
import { isEqual } from 'lodash-es';

const selSignal = ObjectEditor.signal('selSignal');
@Component({
  selector: 'showcases-simple-signals',
  templateUrl: './simple-signals.component.html',
  styleUrls: ['./simple-signals.component.scss'],
  imports: [FormsModule, ObjectEditorModule],
})
export class ShowcaseSimpleSignalsComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any, label?: string) {
    const scheme: ObjectEditor.Scheme = { uibase: 'none', default: value, label, readonly: true };
    return scheme;
  }

  // define the signals
  simpleBoolean = ObjectEditor.signal("simpleBoolean");
  simpleColor = ObjectEditor.signal('simpleColor');
  simpleNumber = ObjectEditor.signal('simpleNumber');
  simpleText = ObjectEditor.signal('simpleText');
  addOptionalText = ObjectEditor.signal('addOptionalText');
  deleteOptionalText = ObjectEditor.signal('deleteOptionalText');

  // define the context (value and scheme)
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
      label: 'showcase simple signals',
      onSignals: [
        {
          signals: [this.addOptionalText], call: (context: ObjectEditor.Context) => {
            context.add?.('optionalText');
          }
        },
        {
          signals: [this.deleteOptionalText], call: (context: ObjectEditor.Context) => {
            context.delete?.('optionalText');
          }
        }
      ],
      properties: {
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
                { signal: this.simpleBoolean, data: true },
                { signal: this.simpleColor, data: 'green' },
                { signal: this.simpleNumber, data: 12 },
                { signal: this.simpleText, data: 'Selection 1 selected' },
                { signal: this.addOptionalText}
              ]
            }
            else if (context.value == 0) {
              return [
                { signal: this.simpleBoolean, data: false },
                { signal: this.simpleColor, data: 'red' },
                { signal: this.simpleNumber, data: -1 },
                { signal: this.simpleText, data: 'Selection 2 selected' },
                { signal: this.deleteOptionalText}
              ]
            }
            else if (isEqual(context.value, { a: 1, b: 'zebu' })) {
              return [
                { signal: this.simpleBoolean, data: false },
                { signal: this.simpleColor, data: 'yellow' },
                { signal: this.simpleNumber, data: 6 },
                { signal: this.simpleText, data: 'Selection 3 selected' },
                { signal: this.deleteOptionalText}
              ]
            }
            return [];
          }
        },
        simpleText: {
          uibase: 'text',
          default: 'test',
          onSignals: [
            {
              signals: [this.simpleText],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                context.setUIValue?.(signal.data);
              }
            }
          ]
        },
        simpleNumber: {
          uibase: 'number',
          default: 5,
          onSignals: [
            {
              signals: [this.simpleNumber],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                context.setUIValue?.(signal.data);
              }
            }
          ]
        },
        simpleColor: {
          uibase: 'color',
          default: 'blue',
          onSignals: [
            {
              signals: [this.simpleColor],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal; data?: any }) => {
                context.setUIValue?.(signal.data);
              }
            },
          ]
        },
        simpleBoolean: {
          uibase: 'boolean',
          default: true,
          onSignals: [
            {
              signals: [this.simpleBoolean],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal; data?: any }) => {
                context.setUIValue?.(signal.data);
              }
            }
          ]
        },
        optionalText: {
          uibase: 'text',
          optional: 'signal',
          default: 'optional text that can be added/ removed by signals on the containing object',
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
        // the subjectToSel2 property depend on the value of the simpleRadio property
        // the simpleRadio shall be defined before the subjectToSel2 property
        // when the simpleRadio value changes, a signal is fired and received by the subject2Sel2 scheme, 
        // which then update its scheme and value in accordance with the signal received.
        subjectToSel2: (pcontext?: ObjectEditor.Context): ObjectEditor.Scheme => {
          let scheme1Value: any, scheme2Value: any;
          const scheme1: ObjectEditor.Scheme = {
            uibase: 'text',
            label: 'url',
            onSignals: [{
              signals: [selSignal],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                if (signal.data != 0) {
                  scheme1Value = context.getUIValue!();
                  context.setUIValue!(scheme2Value, scheme2);
                }
              }
            }]
          }
          const scheme2: ObjectEditor.Scheme = {
            uibase: 'none',
            default: undefined,
            readonly: true,
            onSignals: [{
              signals: [selSignal],
              call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: ObjectEditor.Signal, data?: any }) => {
                if (signal.data == 0) {
                  scheme2Value = context.getUIValue!();
                  context.setUIValue!(scheme1Value, scheme1);
                }
              }
            }]
          }
          if (pcontext?.value['simpleRadio'] == 0) {
            return (scheme1);
          }
          return (scheme2);
        }
      }
    }
  }
}

