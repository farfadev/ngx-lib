import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { arrayScheme, booleanScheme, numberScheme, objectScheme, stringScheme, valueScheme } from "./common-scheme";
import { expressionScheme } from "./expression-scheme";

type _string = {
  operator: 'string',
  values: any[];
}
export const expStringScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    operator: {
      uibase: 'none',
      default: 'string'
    },
    values: {
      uibase: 'array',
      selectionList: (context: ObjectEditor.Context) => {
        return {
          string: stringScheme,
          expression: expressionScheme
        }
      }
    }
  },
  default: ['string', ""],
  transform: {
    forward: (t: any[]): _string => {
      if (t[0] != 'string') throw ('Invalid string expression ' + JSON.stringify(t))
      if (t.length < 2) throw ('Invalid string expression, shall have one or more operande ' + JSON.stringify(t))
      return {
        operator: 'string',
        values: t.slice(1),
      }
    },
    backward: (u: _string) => {
      return [u.operator, ...u.values];
    }
  }
}