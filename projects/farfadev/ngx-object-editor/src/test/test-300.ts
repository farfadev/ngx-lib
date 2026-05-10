
import * as ObjectEditor from "../lib/object-editor";
import { ActionSequenceType } from "./object-editor-test-util";

const value2scheme = (value: any, label?: string) => {
  const scheme: ObjectEditor.Scheme = { uibase: 'none', default: value, label, readonly: true };
  return scheme;
}


const scheme001: ObjectEditor.Scheme = {
  uibase: 'select',
  defaultSelectionKey: 'value',
  selectionList: {
    color: {
      uibase: 'color',
      label: 'mycolor',
      default: '#ff004e'
    },
    value: {
      uibase: 'none',
      label: 'default value',
      readonly: true,
      default: 'default value'
    },
    boolean: {
      uibase: 'boolean',
      label: 'myboolean'
    },

    number: {
      uibase: 'number',
      default: 3,
    },

    simpleRadio: {
      uibase: 'select',
      uiEffects: {
        radio: true,
        horizontal: true
      },
      defaultSelectionKey: 'sel3',
      selectionList: {
        sel1: value2scheme('coucou'),
        sel2: value2scheme(0),
        sel3: value2scheme({ a: 1, b: 'zebu' })
      }
    },
  }
}

export const actionSequence300: ActionSequenceType = {
  name: 'Action Sequence 300',
  scheme: scheme001,
  value: undefined,
  sequence: [
    {
      action: 'checkValue',
      item: [],
      value: (scheme001.selectionList as any)?.['value']['default'],
      preCallBack: () => {
        const i = 0;
      }
    }
  ]
};
