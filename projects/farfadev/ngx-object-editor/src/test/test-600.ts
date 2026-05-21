
import { functions, isEqual, isMatch, isMatchWith, omit } from "lodash-es";
import * as ObjectEditor from "../lib/object-editor";
import { IntScheme, signal, Signal } from "../lib/object-editor-decl";
import { ActionSequenceType } from "./object-editor-test-util";

// convenient function to build constant value schemes
const value2scheme = (value: any, label?: string) => {
  const scheme: ObjectEditor.Scheme = { uibase: 'none', default: value, label, readonly: true };
  return scheme;
}

// define the signals
const selSignal = signal('selSignal');
const simpleBoolean = signal("simpleBoolean");
const simpleColor = signal('simpleColor');
const simpleNumber = signal('simpleNumber');
const simpleText = signal('simpleText');
const addOptionalText = signal('addOptionalText');
const deleteOptionalText = signal('deleteOptionalText');

const scheme001: ObjectEditor.Scheme = {
  uibase: 'object',
  label: 'showcase simple signals',
  onSignals: [
    {
      signals: [addOptionalText], call: (context: ObjectEditor.Context) => {
        context.addProperty?.('optionalText');
      }
    },
    {
      signals: [deleteOptionalText], call: (context: ObjectEditor.Context) => {
        context.deleteProperty?.('optionalText');
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
        sel1: value2scheme('coucou'),
        sel2: value2scheme(0),
        sel3: value2scheme({ a: 1, b: 'zebu' })
      },
      defaultSelectionKey: 'sel2',
      fireSignals: (context: ObjectEditor.Context) => {
        if (context.value == 'coucou') {
          return [
            { signal: simpleBoolean, data: true },
            { signal: simpleColor, data: 'green' },
            { signal: simpleNumber, data: 12 },
            { signal: simpleText, data: 'Selection 1 selected' },
            { signal: addOptionalText }
          ]
        }
        else if (context.value == 0) {
          return [
            { signal: simpleBoolean, data: false },
            { signal: simpleColor, data: 'red' },
            { signal: simpleNumber, data: -1 },
            { signal: simpleText, data: 'Selection 2 selected' },
            { signal: deleteOptionalText }
          ]
        }
        else if (isEqual(context.value, { a: 1, b: 'zebu' })) {
          return [
            { signal: simpleBoolean, data: false },
            { signal: simpleColor, data: 'yellow' },
            { signal: simpleNumber, data: 6 },
            { signal: simpleText, data: 'Selection 3 selected' },
            { signal: deleteOptionalText }
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
          signals: [simpleText],
          call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: Signal, data?: any }) => {
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
          signals: [simpleNumber],
          call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: Signal, data?: any }) => {
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
          signals: [simpleColor],
          call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: Signal; data?: any }) => {
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
          signals: [simpleBoolean],
          call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: Signal; data?: any }) => {
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
        sel1: value2scheme('coucou'),
        sel2: value2scheme(0),
        sel3: value2scheme({ a: 1, b: 'zebu' })
      },
      fireSignals: (context?: ObjectEditor.Context) => [
        { signal: selSignal, data: context?.value }
      ]
    },
    // the subjectToSel2 property depend on the value of the simpleRadio property
    // the simpleRadio shall be defined before the subjectToSel2 property
    // when the simpleRadio value changes, a signal is fired and received by the subject2Sel2 scheme, 
    // which then update its scheme and value in accordance with the signal received.
    subjectToSel2: (pcontext?: ObjectEditor.BaseContext): ObjectEditor.Scheme => {
      let scheme1Value: any, scheme2Value: any;
      const scheme1: ObjectEditor.Scheme = {
        uibase: 'text',
        label: 'url',
        onSignals: [{
          signals: [selSignal],
          call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: Signal, data?: any }) => {
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
          call: (context: ObjectEditor.Context, source: ObjectEditor.Context, signal: { signal: Signal, data?: any }) => {
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

// define the initial value
const value001 = {
  simpleText: 'hello',
  simpleNumber: 3,
  simpleColor: 'green',
  simpleBoolean: false,
  simpleRadio: undefined
}

export const actionSequence600: ActionSequenceType = {
  name: 'Action Sequence 600',
  scheme: scheme001,
  value: value001,
  sequence: [
    {
      action: 'checkValue',
      item: [],
      value: {...value001, simpleSignals: 0},
    },
    {
      action: 'select',
      item: ['simpleSignals'],
      key: 'sel1'
    },
    {
      action: 'checkValueSubSet',
      item: [],
      value: {
        simpleSignals: 'coucou',
        simpleBoolean: true,
        simpleColor: 'green',
        simpleNumber: 12,
        simpleText: 'Selection 1 selected',
        optionalText: (scheme001.properties!['optionalText']! as ObjectEditor.Scheme).default
      },
    },
  ]
};

