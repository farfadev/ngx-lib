
import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { value } from "./common-scheme";
import { expLetScheme, expVarScheme } from "./let-var-scheme";
import { expLiteralScheme } from "./literal-scheme";
import { expArrayScheme } from "./array-scheme";
import { expTypeofScheme } from "./typeof-scheme";
import { expStringScheme } from "./string-scheme";

export type Expression = {
  operator: 'let' | 'var' | 'literal' | 'array' | 'typeof' | 'string' | 'number' | 'boolean' | 'object' | 'collator' | 'format' | 'image' |
  'number-format' | 'to-string' | 'to-number' | 'to-boolean' | 'to-color' |
  'at' | 'in' | 'index-of' | 'slice' | 'global-state' | 'get' | 'has' | 'length';
  operande: value[];
}

export const expressionScheme: ObjectEditor.Scheme = {
  uibase: 'select',
  selectionList: (context: ObjectEditor.Context) => {return {
    'let': expLetScheme,
    'var': expVarScheme,
    'literal': expLiteralScheme,
    'array': expArrayScheme,
    'typeof': expTypeofScheme,
    'string': expStringScheme
  }},
  detectScheme: (context: ObjectEditor.Context) => {
    if (context.value?.[0] != undefined
      && Object.keys((expressionScheme.selectionList as Function)(undefined)).includes(context.value[0])) {
      return context.value?.[0];
    }
    return undefined;
  },
}

