import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { Expression, expressionScheme } from "./expression-scheme";

export const value2scheme = (uibase: ObjectEditor.UIBase, value: any, label?: string) => {
    const scheme: ObjectEditor.Scheme = { uibase: uibase, default: value, label, readonly: true };
    return scheme;
}

export const operators = [
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

export type value = number | string | boolean | object | Expression;

export const numberScheme: ObjectEditor.Scheme = {
    uibase: 'number'
}

export const stringScheme: ObjectEditor.Scheme = {
    uibase: 'text'
}

export const booleanScheme: ObjectEditor.Scheme = {
    uibase: 'boolean'
}

export const objectScheme: ObjectEditor.Scheme = {
    uibase: 'object',
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

export const arrayScheme: ObjectEditor.Scheme = {
    uibase: 'array',
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

export const valueScheme: ObjectEditor.Scheme = {
    uibase: 'select',
    selectionList: {
        'number': numberScheme,
        'string': stringScheme,
        'boolean': booleanScheme,
        'expression': expressionScheme
    },
    detectScheme: (context: ObjectEditor.Context) => {
        if (context.value == undefined || context.value == null) return undefined;
        if (typeof context.value == 'number') return 'number';
        if (typeof context.value == 'string') return 'string';
        if (typeof context.value == 'boolean') return 'boolean';
        if (typeof context.value == 'object') {
            if (operators.includes(context.value[0])) return 'expression';
            else return 'object';
        }
        return undefined;
    }
}



