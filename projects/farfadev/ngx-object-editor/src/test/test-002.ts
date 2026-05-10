
import { cloneDeep } from "lodash-es";
import * as ObjectEditor from "../lib/object-editor";
import { ActionSequenceType } from "./object-editor-test-util";

type SL = ObjectEditor.SelectionList<any, any>;

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
          0: (scheme002.selectionList as SL)['p2'],
          1: (scheme002.selectionList as SL)['p1'],
          2: (scheme002.selectionList as SL)['p3'],
          3: (scheme002.selectionList as SL)['p2'],
          4: (scheme002.selectionList as SL)['p3'],
          5: (scheme002.selectionList as SL)['p1'],
          6: (scheme002.selectionList as SL)['p1']
        }
      }
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
      (scheme002.selectionList as SL)['p3'].default],
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
      (scheme002.selectionList as SL)['p3'].default,
      (scheme002.selectionList as SL)['p2'].default]
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
      (scheme002.selectionList as SL)['p3'].default,
      (scheme002.selectionList as SL)['p2'].default
        , (scheme002.selectionList as SL)['p1'].default]
    },
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as SL)['p2'],
          1: (scheme002.selectionList as SL)['p1'],
          2: (scheme002.selectionList as SL)['p3'],
          3: (scheme002.selectionList as SL)['p2'],
          4: (scheme002.selectionList as SL)['p3'],
          5: (scheme002.selectionList as SL)['p1'],
          6: (scheme002.selectionList as SL)['p1'],
          7: (scheme002.selectionList as SL)['p3'],
          8: (scheme002.selectionList as SL)['p2'],
          9: (scheme002.selectionList as SL)['p1']
        }
      }
    },
    {
      action: 'canArrayItemUp',
      item: [0],
      value: false
    },
    {
      action: 'canArrayItemDown',
      item: [6],
      value: true
    },
    {
      action: 'canArrayItemDown',
      item: [9],
      value: false
    },
    {
      action: 'arrayItemUp',
      item: [0],
      value: false,
      preCallBack: (context, actionSeqData) => {
        actionSeqData['beforeArrayItemDown6'] = cloneDeep(context.value);
      }
    },
    {
      action: 'arrayItemDown',
      item: [6],
      value: true
    },
    {
      action: 'arrayItemDown',
      item: [9],
      value: false
    },
    {
      action: 'checkValue',
      item: [],
      dynValue: (c: ObjectEditor.Context, actionSeqData: Record<string,any>) => {
        const v = cloneDeep(actionSeqData['beforeArrayItemDown6']);
        const v1 = v[6];
        const v2 = v[7];
        v[7] = v1;
        v[6] = v2;
        return v;
      }
    },
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as SL)['p2'],
          1: (scheme002.selectionList as SL)['p1'],
          2: (scheme002.selectionList as SL)['p3'],
          3: (scheme002.selectionList as SL)['p2'],
          4: (scheme002.selectionList as SL)['p3'],
          5: (scheme002.selectionList as SL)['p1'],
          6: (scheme002.selectionList as SL)['p3'],
          7: (scheme002.selectionList as SL)['p1'],
          8: (scheme002.selectionList as SL)['p2'],
          9: (scheme002.selectionList as SL)['p1']
        }
      }
    },
    {
      action: 'arrayItemUp',
      item: [7],
      value: true
    },
    {
      action: 'checkValue',
      item: [],
      dynValue: (c: ObjectEditor.Context, actionSeqData: Record<string,any>) => {
        const v = actionSeqData['beforeArrayItemDown6'];
        return v;
      }
    },
    {
      action: 'canDeleteProperty',
      item: [6],
      value: true
    },
    {
      action: 'canDeleteProperty',
      item: [],
      key: 6,
      value: true
    },
    {
      action: 'deleteProperty',
      item: [],
      key: 6,
    },
    {
      action: 'checkValue',
      item: [],
      dynValue: (c: ObjectEditor.Context, actionSeqData: Record<string,any>) => {
        const v: any[] = cloneDeep(actionSeqData['beforeArrayItemDown6']);
        v.splice(6,1);
        return v;
      }
    },
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as SL)['p2'],
          1: (scheme002.selectionList as SL)['p1'],
          2: (scheme002.selectionList as SL)['p3'],
          3: (scheme002.selectionList as SL)['p2'],
          4: (scheme002.selectionList as SL)['p3'],
          5: (scheme002.selectionList as SL)['p1'],
          6: (scheme002.selectionList as SL)['p3'],
          7: (scheme002.selectionList as SL)['p2'],
          8: (scheme002.selectionList as SL)['p1']
        }
      }
    },
    {
      action: 'deleteProperty',
      item: [],
      key: 0,
    },
    {
      action: 'checkValue',
      item: [],
      dynValue: (c: ObjectEditor.Context, actionSeqData: Record<string,any>) => {
        const v: any[] = cloneDeep(actionSeqData['beforeArrayItemDown6']);
        v.splice(6,1);
        v.splice(0,1);
        return v;
      }
    },
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as SL)['p1'],
          1: (scheme002.selectionList as SL)['p3'],
          2: (scheme002.selectionList as SL)['p2'],
          3: (scheme002.selectionList as SL)['p3'],
          4: (scheme002.selectionList as SL)['p1'],
          5: (scheme002.selectionList as SL)['p3'],
          6: (scheme002.selectionList as SL)['p2'],
          7: (scheme002.selectionList as SL)['p1']
        }
      }
    },
    {
      action: 'deleteProperty',
      item: [7],
    },
    {
      action: 'checkValue',
      item: [],
      dynValue: (c: ObjectEditor.Context, actionSeqData: Record<string,any>) => {
        const v: any[] = cloneDeep(actionSeqData['beforeArrayItemDown6']);
        v.splice(6,1);
        v.splice(0,1);
        v.splice(7,1);
        return v;
      }
    },
    {
      action: 'checkSchemeSubSet',
      item: [],
      value: {
        properties: {
          0: (scheme002.selectionList as SL)['p1'],
          1: (scheme002.selectionList as SL)['p3'],
          2: (scheme002.selectionList as SL)['p2'],
          3: (scheme002.selectionList as SL)['p3'],
          4: (scheme002.selectionList as SL)['p1'],
          5: (scheme002.selectionList as SL)['p3'],
          6: (scheme002.selectionList as SL)['p2'],
        }
      }
    },
  ]
}
