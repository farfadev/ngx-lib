
import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { Expression, expressionScheme } from "./expression-scheme";
import { valueScheme } from "./common-scheme";

type _let = {
  operator: 'let',
  namedValues: { name: string, value: any }[],
  expression: Expression;
}

const namedValuesScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    name: {
      uibase: 'text'
    },
    value: () => valueScheme
  }
}

export const expLetScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    'operator': {
      uibase: 'none',
      default: 'let'
    },
    namedValues: {
      uibase: 'array',
      selectionList: {
        'new': {
          uibase: 'object',
          properties: {
            name: {
              uibase: 'text'
            },
            value: () => valueScheme
          }
        }
      }
    },
    expression: () => expressionScheme
  },
  default: ['let', 'placeholder', 0, undefined],
  transform: {
    forward: (t: any[]): _let => {
      if (typeof t != 'object' || t[0] != 'let') throw ('Invalid let expression' + JSON.stringify(t))
      if (t.length < 4) throw ('Invalid let expression, shall have minimum of three operande' + JSON.stringify(t))
      if (t.length % 2 != 0) throw ('Invalid let expression' + JSON.stringify(t))
      return {
        operator: 'let',
        namedValues: (() => {
          const res: Array<{ name: string, value: any }> = [];
          for (let i = 1; i < t.length - 2; i += 2) {
            if (typeof t[i] == "string") {
              res.push({ name: t[i], value: t[i + 1] });
            }
            else {
              throw ('Invalid let expression, operande at position ' + i + 1 + ' shall be a string ' + 'Invalid let expression' + JSON.stringify(t))
            }
          }
          return res;
        })(),
        expression: (() => {
          return t[t.length - 1]
        })()
      }
    },
    backward: (u: _let): any[] => {
      const res: any[] = [u.operator];
      for (let i = 0; i < u.namedValues.length; i++) {
        if (u.namedValues[i]?.name != undefined) {
          res.push(u.namedValues[i].name);
          res.push(u.namedValues[i].value);
        }
      }
      res.push(u.expression);
      return res;
    }
  }
}

type _var = {
  operator: 'var',
  name: string,
}
export const expVarScheme: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    operator: {
      uibase: 'none',
      default: 'var'
    },
    name: {
      uibase: 'text'
    }
  },
  default: ['var', 'placeholder'],
  transform: {
    forward: (t: any[]): _var => {
      if (t[0] != 'var') throw ('Invalid var expression ' + JSON.stringify(t))
      if (t.length != 2) throw ('Invalid var expression, shall have one single operande ' + JSON.stringify(t))
      if (typeof t[1] != 'string') throw ('Invalid var expression, the operande is not a string ' + JSON.stringify(t))
      return {
        operator: 'var',
        name: t[1],
      }
    },
    backward: (u: _var) => {
      return [u.operator, u.name];
    }
  }
}
