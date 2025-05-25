import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { arrayScheme, booleanScheme, numberScheme, objectScheme, stringScheme } from "./common-scheme";

type _literal = {
  operator: 'literal',
  value: any;
}
export const expLiteralScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    operator: {
      uibase: 'none',
      default: 'literal'
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
  default: ['literal', 0],
  transform: {
    forward: (t: any[]): _literal => {
      if (t[0] != 'literal') throw ('Invalid var expression ' + JSON.stringify(t))
      if (t.length != 2) throw ('Invalid var expression, shall have one single operande ' + JSON.stringify(t))
      return {
        operator: 'literal',
        value: t[1],
      }
    },
    backward: (u: _literal) => {
      return [u.operator, u.value];
    }
  }
}