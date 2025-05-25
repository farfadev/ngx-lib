import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { arrayScheme, booleanScheme, numberScheme, objectScheme, stringScheme } from "./common-scheme";

type _typeof = {
  operator: 'typeof',
  value: any;
}
export const expTypeofScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    operator: {
      uibase: 'none',
      default: 'typeof'
    },
    value: {
      uibase: 'select',
      selectionList: (context: ObjectEditor.Context) => {
        return {
          boolean: booleanScheme,
          number: numberScheme,
          string: stringScheme,
          object: objectScheme,
          array: arrayScheme
        }
      }
    }
  },
  default: ['typeof', 0],
  transform: {
    forward: (t: any[]): _typeof => {
      if (t[0] != 'typeof') throw ('Invalid var expression ' + JSON.stringify(t))
      if (t.length != 2) throw ('Invalid var expression, shall have one single operande ' + JSON.stringify(t))
      return {
        operator: 'typeof',
        value: t[1],
      }
    },
    backward: (u: _typeof) => {
      return [u.operator, u.value];
    }
  }
}