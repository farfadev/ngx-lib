
import * as ObjectEditor from "@farfadev/ngx-object-editor";

const operators = [
  // variablesBinding: 
  'let', 'var',
  //types:
  'literal', 'array', 'typeof', 'string', 'number', 'boolean', 'object', 'collator', 'format', 'image',
    'number-format', 'to-string', 'to-number', 'to-boolean', 'to-color',
  //lookup: 
  'at', 'in', 'index-of', 'slice', 'global-state', 'get', 'has', 'length',
  //decision: 
  'case', 'match', 'coalesce', '==', '!=', '>', '<', '>=', '<=', 'all', 'any', '!', 'within',
  //rampsScalesCurves: 
  'step', 'interpolate', 'interpolate-hcl', 'interpolate-lab',
  //math: 
  'ln2', 'pi', 'e', '+', '*', '-', '/', '%', '^', 'sqrt', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'min', 'max', 'round', 'abs', 'ceil', 'floor', 'distance',
  //color: 
  'to-rgba', 'rgb', 'rgba',
  //featureData: 
  'properties', 'feature-state', 'geometry-type', 'id', 'line-progress', 'accumulated',
  //zoom: 
  'zoom',
  //heatmap: 
  'heatmap-density',
  //string: 
  'is-supported-script', 'upcase', 'downcase', 'concat', 'resolved-local',
]

//["let", var_1_name, var_1_value, ..., var_n_name, var_n_value, expression]: any
//["var", var_name]: any
//["literal", json_object]: object
//["literal", json_array]: array

type value = number | string | boolean | object | Expression;

type Expression = {
  operator: 'let' | 'var' | 'literal' | 'array' | 'typeof' | 'string' | 'number' | 'boolean' | 'object' | 'collator' | 'format' | 'image' |
  'number-format' | 'to-string' | 'to-number' | 'to-boolean' | 'to-color' |
  'at' | 'in' | 'index-of' | 'slice' | 'global-state' | 'get' | 'has' | 'length';
  operande: value[];
}

export const expressionScheme: ObjectEditor.Scheme = {
  uibase: 'select',
  selectionList: (context: ObjectEditor.Context) => {return {
    'let': letScheme,
    'var': varScheme
  }},
  detectScheme: (context: ObjectEditor.Context) => {
    if (context.value?.[0] != undefined
      && Object.keys((expressionScheme.selectionList as Function)(undefined)).includes(context.value[0])) {
      return context.value?.[0];
    }
    return undefined;
  },
}

const numberScheme: ObjectEditor.Scheme = {
  uibase: 'number'
}

const stringScheme: ObjectEditor.Scheme = {
  uibase: 'text'
}

const booleanScheme: ObjectEditor.Scheme = {
  uibase: 'boolean'
}

export const valueScheme: ObjectEditor.Scheme = {
  uibase: 'select',
  selectionList: {
    'number': numberScheme,
    'string': stringScheme,
    'boolean': booleanScheme,
    'expression': expressionScheme
  },
  detectScheme: (context: ObjectEditor.Context) => {
    if(context.value == undefined || context.value == null) return undefined;
    if(typeof context.value == 'number') return 'number';
    if(typeof context.value == 'string') return 'string';
    if(typeof context.value == 'boolean') return 'boolean';
    if(typeof context.value == 'object') {
      if(operators.includes(context.value[0]))  return 'expression';
      else return 'object';
    }
    return undefined;
  }
}

type _let = {
  operator: 'let',
  namedValues: {name: string, value: any}[],
  expression: Expression;
}

const letScheme: ObjectEditor.Scheme = {
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
            value: valueScheme
          }
        }
      }
    },
    expression: expressionScheme
  },
  default: ['let','placeholder',0,undefined],
  transform: {
    forward: (t: any[]): _let => {
      if (t[0] != 'let') throw ('Invalid let expression' + JSON.stringify(t))
      if (t.length < 4) throw ('Invalid let expression, shall have minimum of three operande' + JSON.stringify(t))
      if (t.length % 2 != 0) throw ('Invalid let expression' + JSON.stringify(t))
      return {
        operator: 'let',
        namedValues: (() => {
          const res: Array<{name: string,value: any}> = [];
          for (let i = 1; i < t.length - 2; i+=2) {
            if (typeof t[i] == "string") {
              res.push({name: t[i],value: t[i + 1]});
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
        if(u.namedValues[i]?.name != undefined) {
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
const varScheme: ObjectEditor.Scheme = {
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
  default: ['var','placeholder'],
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
      return [u.operator,u.name];
    }
  }
}


type _literal = {
  operator: 'literal',
  jsonValue: string;
}
type _array = {
  operator: 'array',
  value: any,
  type: 'string' | 'number' | 'boolean',
  length: number
}
