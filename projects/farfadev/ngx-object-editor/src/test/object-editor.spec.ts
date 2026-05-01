import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import * as ObjectEditor from "../lib/object-editor";
import * as ObjectEditorInt from "../lib/object-editor-int"
import { isEqual } from "lodash-es";
import { fromChimere, toChimere } from '../lib/object-editor-chimere';
import { expectSubSet, getSubContextFromKeys, getSubValueFromKeys, Semaphore, sleep } from './tests-utils.spec';

const step1 = new Semaphore();

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
const actionList1 = [
  {
    item: ['p1'],
    value: false
  },
  {
    item: ['fifi', 1],
    value: { amp: 'hello', loop: { q: 12, m: 'bOkp' } }
  }
]
describe('object-editor', () => {
  beforeAll(async () => {

  })
  afterEach(async () => {
    await sleep(2000);
  });
  it('test1', () => {
    const context1 = {
      scheme: scheme1,
      value: scheme1Value1
    }
    ObjectEditorInt.initContext(context1);
    expectSubSet(context1.scheme.properties?.['p1'], scheme1.properties?.['p1']);
    expectSubSet(context1.scheme.properties?.['p2'], scheme1.properties?.['p2']);
    expectSubSet(context1.scheme.properties?.['p3'], scheme1.properties?.['p3']);
    expect(context1.scheme.properties?.['pInt']).toBeDefined();
    expect(context1.scheme.properties?.['pInt']).toBeDefined();
    expect(context1.scheme.properties?.['fifi']).toBeDefined();
    expect(context1.scheme.properties?.['lala']).toBeDefined();
    const chimere1 = toChimere(context1);
    const context2 = fromChimere(chimere1, context1.scheme);
    expect(isEqual(context1.value, context2.value)).toBeTruthy();
    for(const action of actionList1) {
      const subContext = getSubContextFromKeys(context1, action.item);
      subContext?.setUIValue?.(action.value);
      const subValue = getSubValueFromKeys(context1.value,action.item);
      expect(subValue).toEqual(action.value);
    }
  })
})
