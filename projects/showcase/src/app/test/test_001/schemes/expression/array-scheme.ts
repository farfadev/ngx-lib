import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { booleanScheme, numberScheme, objectScheme, stringScheme, value2scheme, valueScheme } from "./common-scheme";

type _array = {
  operator: 'array',
  value: any;
  type?: "string" | "number" | "boolean";
  length?: number;
}
export const expArrayScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    operator: {
      uibase: 'none',
      default: 'array'
    },
    value: valueScheme,
    type: {
      uibase: 'select',
      optional: true,
      selectionList: (context: ObjectEditor.Context) => {
        return {
          string: value2scheme('text', "string"),
          number: value2scheme('text', "number"),
          boolean: value2scheme('text', "number"),
        }
      }
    }
  },
  default: ['array', []],
  transform: {
    forward: (t: any[]): _array => {
      if (t[0] != 'literal') throw ('Invalid var expression ' + JSON.stringify(t))
      if (t.length > 4) throw ('Invalid var expression, shall have one single operande ' + JSON.stringify(t))
      const res: _array = { operator: 'array', value: undefined };
      for (let i = 1; i < t.length; i++) {
        if (typeof t[i] == 'string' && ['string', 'number', 'boolean'].includes(t[i]) && res.type == undefined) res.type = t[i];
        if (typeof t[i] == 'number' && res.length == undefined) res.length = t[i];
        if (typeof t[i] == 'object' && res.value == undefined) res.value = t[i];
      }
      return res;
    },
    backward: (u: _array) => {
      const res = [u.operator, u.value];
      if (u.type != undefined) res.push(u.type);
      if (u.length != undefined) res.push(u.length);
      return res;
    }
  }
}