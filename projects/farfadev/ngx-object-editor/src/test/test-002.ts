
import * as ObjectEditor from "../lib/object-editor";
import { ActionSequenceType } from "./object-editor-test-util";

const scheme002: ObjectEditor.Scheme = {
  uibase: 'array',
  selectionList: {
    p1: {
      uibase: 'boolean',
      default: true,
    },
    p2: {
      uibase: 'number',
      default: 0,
    },
    p3: {
      uibase: 'text',
      default: 'default text',
    },
  }
}

const value002 = [
  4, false, 'test', 62, 'hello', true, false
]

export const actionSequence002: ActionSequenceType = {
  name: 'Action Sequence 002',
  scheme: scheme002,
  value: value002,
  sequence: [
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as ObjectEditor.SelectionList)['p2'],
          1: (scheme002.selectionList as ObjectEditor.SelectionList)['p1'],
          2: (scheme002.selectionList as ObjectEditor.SelectionList)['p3'],
          3: (scheme002.selectionList as ObjectEditor.SelectionList)['p2'],
          4: (scheme002.selectionList as ObjectEditor.SelectionList)['p3'],
          5: (scheme002.selectionList as ObjectEditor.SelectionList)['p1'],
          6: (scheme002.selectionList as ObjectEditor.SelectionList)['p1']
        }
      }
    },
    {
      action: 'addProperty',
      item: [],
      key: '',
      schemeKey: 'p1'
    },
    {
      action: 'checkValue',
      item: [],
      value: [...value002,
      (scheme002.selectionList as ObjectEditor.SelectionList)['p1'].default],
      preCallBack: (context) => {
        const i = 0; // to set breakpoint
      }
    },
    {
      action: 'addProperty',
      item: [],
      key: '',
      schemeKey: 'p2'
    },
    {
      action: 'checkValue',
      item: [],
      value: [...value002,
      (scheme002.selectionList as ObjectEditor.SelectionList)['p1'].default,
      (scheme002.selectionList as ObjectEditor.SelectionList)['p2'].default]
    },
    {
      action: 'addProperty',
      item: [],
      key: '',
      schemeKey: 'p3'
    },
    {
      action: 'checkValue',
      item: [],
      value: [...value002,
      (scheme002.selectionList as ObjectEditor.SelectionList)['p1'].default,
      (scheme002.selectionList as ObjectEditor.SelectionList)['p2'].default
        , (scheme002.selectionList as ObjectEditor.SelectionList)['p3'].default]
    },
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as ObjectEditor.SelectionList)['p2'],
          1: (scheme002.selectionList as ObjectEditor.SelectionList)['p1'],
          2: (scheme002.selectionList as ObjectEditor.SelectionList)['p3'],
          3: (scheme002.selectionList as ObjectEditor.SelectionList)['p2'],
          4: (scheme002.selectionList as ObjectEditor.SelectionList)['p3'],
          5: (scheme002.selectionList as ObjectEditor.SelectionList)['p1'],
          6: (scheme002.selectionList as ObjectEditor.SelectionList)['p1'],
          7: (scheme002.selectionList as ObjectEditor.SelectionList)['p1'],
          8: (scheme002.selectionList as ObjectEditor.SelectionList)['p2'],
          9: (scheme002.selectionList as ObjectEditor.SelectionList)['p3']
        }
      }
    },
    {
      action: 'arrayItemUp',
      item: [6]
    }
  ]
};
