import cloneDeep from "lodash.clonedeep";

interface From {
  reference: string;
}

interface IScheme {
  html: string;
  js: string;
}

export type Scheme<T = any, U = any> = {
  uibase: 'from' | 'text' | 'color' | 'number' | 'boolean' |
  'date' | 'time' | 'datetime' | 'file' | 'email' | 'url' | 'image'
  | 'object' | 'array';

  // the ui label to identify the value, by default the property name
  label?: string;
  // an html <article> that helps frontend user to understand/ set the value 
  helper?: string;
  // a call-back to set EditorOptions dynamically depending on a runtime context
  dynamic?: () => Scheme<T, U>;
  // refer to another property when the value depends on another property value 
  dependsOn?: { property: string; f: () => T }
  // if value can be undefined
  optional?: boolean;
  // if scheme can be deleted (and corresponding value)
  deletable?: boolean;
  // if value is view/read only frontend user cannot edit the value 
  readonly?: boolean;
  // provides a (re)set to default feature with the provided default value
  default?: T;
  // front end form is a tranformation of the actual value
  // exemple [lat,lon] transformed as {latitude: number, longitude: number}
  transform?: {
    // T is the type of the inner value, U is the type of the front end value
    // forward function transforms the inner value to a frontend value
    // backward function transforms the frontend value to an inner value
    forward: (t: T) => U;
    backward: (u: U) => T;
  }
  customFrontEnd?: {
    view?: () => string; // an html component when viewing
    edit?: () => string; // an html component when editing
  }

  min?: T;
  max?: T;
  length?: {
    min?: number;
    max?: number;
  }
  // a custom check returning a non emtpy string if check fails
  // example: { customCheck: (t: T) => [2,4,6].find((el)=>el==t) ? "": "value shall be either 2, 4 or 6"}
  customCheck?: (t: T) => string,
  decimals?: number // number of decimal digits
  significants?: number // number of significant digits
  regexp?: RegExp; // input text shall meet regexp
  // provides a set of selectable options
  selection?: { [key: number | string]: Scheme<T, U> } | (() => { [key: number | string]: Scheme<T, U> });
  properties?: { [key: number | string]: Scheme<any, any> }
  // if restricted is true, cannot add new properties from frontend
  restricted?: boolean;
  // default scheme to apply to inner element, such as array elements
  innerScheme?: Scheme<any,any>;
}
export class ObjectEditor {
  static readonly schemes = {
    'object': {
      type: 'object',
      html: 'object',
      js: 'object'
    },
    'array': {
      type: 'array',
      html: 'array',
      js: 'object'
    },
    from: {
      type: 'from',
      html: 'text',
      js: 'string',
      reference: '',
    },
    text: {
      type: 'text',
      html: 'text',
      js: 'string',
    },
    color: {
      type: 'color',
      html: 'color',
      js: 'string',
    },
    // eslint-disable-next-line quote-props
    'number': {
      type: 'number',
      html: 'number',
      js: 'number',
    },
    'boolean': {
      type: 'boolean',
      html: 'checkbox',
      js: 'boolean',
    },
    date: {
      type: 'date',
      html: 'date',
      js: 'string',
    },
    time: {
      type: 'time',
      html: 'time',
      js: 'string',
    },
    datetime: {
      type: 'datetime',
      html: 'datetime-local',
      js: 'string',
    },
    file: {
      type: 'file',
      html: 'file',
      js: 'string',
    },
    email: {
      type: 'email',
      html: 'email',
      js: 'string',
    },
    url: {
      type: 'url',
      html: 'url',
      js: 'string',
    },
    image: {
      type: 'image',
      html: 'image',
      js: 'string',
    },
  };
  public static getSchemes(): string[] {
    return Object.keys(ObjectEditor.schemes);
  }
  public static getScheme(typeName: string | undefined) {
    if(typeName == undefined) return undefined;
    return (ObjectEditor.schemes as any)[typeName];
  }
  static isScheme(type: string | undefined | null): boolean {
    return type ? ObjectEditor.schemes.hasOwnProperty(type) : false;
  }
  public static convert(value: any, scheme: Scheme): any {
    const type = ObjectEditor.getScheme(scheme.uibase);
    if (!value) {
      return value;
    }
    switch (type.js) {
      case 'number':
        return Number(value);
        break;
      case 'boolean':
        return Boolean(value);
        break;
      default:
        return value;
        break;
    }
  }
  static initValue(value: any, scheme: Scheme): any {
    switch (scheme.uibase) {
      case 'array':
        if (!value) value = cloneDeep(scheme.default) ?? [];
        if (!(value instanceof Array)) {
          throw Error('Invalid value type, expecting Array');
        }
        if (scheme.min) {
          let lastKey;
          const keys = Object.keys(scheme.properties ?? {});
          for (let i = 0; i < scheme.min; i++) {
            if (scheme.properties?.[i]) {
              lastKey = i;
            }
            if (i > value.length && scheme.properties?.[lastKey])
              value.push(ObjectEditor.initValue(value[i], scheme.properties?.[lastKey]));
          }
        }
        break;
      case 'boolean':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = false;
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'color':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '#ffffff';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'date':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = new Date(new Date().toDateString()).toISOString();
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'datetime':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = (new Date()).toISOString();
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'email':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'file':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'from':
        break;
      case 'image':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'number':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = 0;
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'object':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = {};
          const keys = Object.keys(scheme?.properties ?? {});
          for (const key in keys) {
            if (!scheme?.properties?.[key].optional && scheme.properties?.[key]) {
              value![key] = value![key] ?? ObjectEditor.initValue(value, scheme.properties?.[key]);
            }
          }
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'text':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break
      case 'time':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '12:00:00';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
      case 'url':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else if (value == undefined) {
          value = '';
          if (scheme.transform) {
            value = scheme.transform.backward(value);
          }
        }
        break;
    }
    return value;
  }
}
