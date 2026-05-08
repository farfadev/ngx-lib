
import { cloneDeep } from "lodash-es";
import * as ObjectEditor from "../lib/object-editor";
import { ActionSequenceType } from "./object-editor-test-util";


const scheme1: ObjectEditor.Scheme = {
  uibase: 'object',
  selectionList: {
    scheme1: {
      uibase: 'boolean',
    },
    scheme2: {
      uibase: 'number'
    },
    scheme3: {
      uibase: 'array',
      selectionList: {
        s3scheme1: {
          uibase: 'select',
          selectionList: {
            const1: {
              uibase: 'none',
              default: { toto: true, tila: { z: 12, g: "HhhU" } }
            },
            const2: {
              uibase: 'none',
              default: { toto: true, tila: { z: 12, g: 'uJJk' } }
            },
            const3: {
              uibase: 'none',
              default: true
            },
            schemeObj: {
              uibase: 'object',
              properties: {
                toto: {
                  uibase: 'boolean'
                },
                tila: {
                  uibase: 'object',
                  properties: {
                    z: {
                      uibase: 'number',
                    },
                    g: {
                      uibase: 'text',
                    }
                  }
                }
              }
            }
          }
        },
        s3scheme2: {
          uibase: 'object',
          properties: {
            amp: {
              uibase: 'text'
            },
            loop: {
              uibase: 'object',
              properties: {
                q: {
                  uibase: 'number'
                },
                m: {
                  uibase: 'text'
                }
              }
            }
          }
        }
      }
    }
  },
  properties: {
    p1: {
      uibase: 'boolean',
    },
    p2: {
      uibase: 'number',
      optional: true
    },
    p3: {
      uibase: 'text',
    },
  }
}
const scheme1Value1 = {
  p1: true,
  p3: 'test',
  pInt: 3,
  pBool: true,
  fifi: [{
    toto: true, tila: { z: 12, g: 'uJJk' }
  },
  {
    toto: true, tila: { z: 12, g: 'unnJJjk' }
  }],
  lala: [{
    toto: true, tila: { z: 12, g: 'o00kJk' }
  }]
}

export const actionSequence100: ActionSequenceType = {
  name: 'Action Sequence 100',
  scheme: scheme1,
  value: scheme1Value1,
  sequence: [
    {
      action: 'checkSchemeSubSet',
      item: ['p1'],
      scheme: scheme1.properties?.['p1']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['p2'],
      scheme: scheme1.properties?.['p2']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['p3'],
      scheme: scheme1.properties?.['p3']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['p3'],
      scheme: scheme1.properties?.['p3']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['pInt'],
      scheme: (scheme1.selectionList as ObjectEditor.SelectionList)?.['scheme2']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['pBool'],
      scheme: (scheme1.selectionList as ObjectEditor.SelectionList)?.['scheme1']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['fifi'],
      scheme: (scheme1.selectionList as ObjectEditor.SelectionList)?.['scheme3']
    },
    {
      action: 'checkSchemeSubSet',
      item: ['lala'],
      scheme: (scheme1.selectionList as ObjectEditor.SelectionList)?.['scheme3']
    },
    {
      action: 'checkChimere',
      item: []
    }
  ]
}

export const actionSequence101: ActionSequenceType = {
  name: 'Action Sequence 101',
  scheme: scheme1,
  value: scheme1Value1,
  sequence: [
    {
      action: 'setValue',
      item: ['p1'],
      value: false
    },
    {
      action: 'checkValue',
      item: ['p1'],
      value: false
    },
    {
      action: 'checkValue',
      item: [],
      value: (() => {
        const v2 = cloneDeep(scheme1Value1);
        v2.p1 = false;
        return v2;
      })()
    },
    {
      action: 'setValue',
      item: ['fifi', 1],
      value: { amp: 'hello', loop: { q: 12, m: 'bOkp' } }
    },
    {
      action: 'checkValue',
      item: ['fifi', 1],
      value: { amp: 'hello', loop: { q: 12, m: 'bOkp' } }
    },
    {
      action: 'setReadOnly',
      item: ['fifi', 1],
      value: true
    },
    {
      action: 'checkReadOnly',
      item: ['fifi', 1],
      value: true
    },
    {
      action: 'setValue',
      item: ['fifi', 1],
      value: { amp: 'hello1', loop: { q: 125, m: 'abOkp' } }
    },
    {
      action: 'checkValue',
      item: ['fifi', 1],
      value: { amp: 'hello', loop: { q: 12, m: 'bOkp' } }
    },
    {
      action: 'setReadOnly',
      item: ['fifi', 1],
      value: false
    },
    {
      action: 'checkReadOnly',
      item: ['fifi', 1],
      value: false
    },
    {
      action: 'setValue',
      item: ['fifi', 1],
      value: { amp: 'hello1', loop: { q: 125, m: 'abOkp' } }
    },
    {
      action: 'checkValue',
      item: ['fifi', 1],
      value: { amp: 'hello1', loop: { q: 125, m: 'abOkp' } }
    },
  ]
}

export const actionSequence102: ActionSequenceType = {
  name: 'Action Sequence 102',
  scheme: scheme1,
  value: scheme1Value1,
  sequence: [
    {
      action: 'setDisplay',
      item: ['p1'],
      value: false
    },
    {
      action: 'checkDisplay',
      item: ['p1'],
      value: false
    },
    {
      action: 'setDisplay',
      item: ['p1'],
      value: true
    },
    {
      action: 'checkDisplay',
      item: ['p1'],
      value: true
    }
  ]
}

export const actionSequence103: ActionSequenceType = {
  name: 'Action Sequence 103',
  scheme: scheme1,
  value: scheme1Value1,
  sequence: [
    {
      action: 'checkValue',
      item: ['p2'],
      value: undefined
    },
    {
      action: 'addProperty',
      item: [],
      key: 'p2'
    },
    {
      action: 'checkValue',
      item: ['p2'],
      value: 0
    },
    {
      action: 'setValue',
      item: ['p2'],
      value: 123.8
    },
    {
      action: 'checkValue',
      item: ['p2'],
      value: 123.8
    },
    {
      action: 'checkValue',
      item: [],
      value: (() => {
        const v2 = cloneDeep(scheme1Value1);
        (v2 as any).p2 = 123.8;
        return v2;
      })()
    },
    {
      action: 'checkChimere',
      item: ['p2']
    }
  ]
}


