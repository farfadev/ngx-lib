import { ObjectEditor } from "./object-editor";
import { isEqual } from "lodash-es";

const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));
const scheme1: ObjectEditor.Scheme = {
  uibase: 'object',
  selectionList: {
    scheme1: {
      uibase: 'checkbox',
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
                  uibase: 'checkbox'
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
      uibase: 'checkbox',
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
    ObjectEditor.initContext(context1);
    expect(isEqual(context1.scheme.properties?.['p1'],scheme1.properties?.['p1'])).toBeTruthy();
    expect(isEqual(context1.scheme.properties?.['p2'],scheme1.properties?.['p2'])).toBeTruthy();
    expect(isEqual(context1.scheme.properties?.['p3'],scheme1.properties?.['p3'])).toBeTruthy();
    expect(context1.scheme.properties?.['pInt']).toBeDefined();
    expect(context1.scheme.properties?.['pInt']).toBeDefined();
    expect(context1.scheme.properties?.['fifi']).toBeDefined();
    expect(context1.scheme.properties?.['lala']).toBeDefined();
  })
})
