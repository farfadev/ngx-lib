
import { ObjectEditor } from "@farfadev/ngx-object-editor"
import { cloneDeep, isEqual, isMatch } from "lodash-es";

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
        },
        s3scheme2: {
          uibase: 'select',
          selectionList: {
            const1: {
              uibase: 'none',
              default: { toto: true, tila: { z: 12, h: "HhhU" } }
            },
            const2: {
              uibase: 'none',
              default: { toto: true, tila: { z: 12, h: 'uJJk' } }
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
                    h: {
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
  },
  {
    toto: true, tila: { z: 12, h: 'unnJJjk' }
  }],
  lala: [{
    toto: true, tila: { z: 12, g: 'o00kJk' }
  }]
}

export const test_init = (): number => {
  const context1 = {
    scheme: scheme1,
    value: scheme1Value1
  }
  const scheme1_clone = cloneDeep(scheme1);
  ObjectEditor.initContext(context1);
  let err_count = ObjectEditor.checkScheme(scheme1Value1,context1.scheme,scheme1);
  const chimere1 = ObjectEditor.toChimere(context1);
  const context1_b = ObjectEditor.fromChimere(chimere1,scheme1);
  if(!isEqual(context1_b, context1)) err_count++;
  if(!isEqual(scheme1,scheme1_clone)) err_count++;
  return err_count;
}


