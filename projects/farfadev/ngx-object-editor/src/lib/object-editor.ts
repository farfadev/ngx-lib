//import cloneDeep from "lodash.clonedeep";
import { cloneDeep } from "lodash-es";

export namespace ObjectEditor {

  interface From {
    reference: string;
  }

  interface IScheme {
    html: string;
    js: string;
  }
  export const schemeIdProperty = '_$schemeRef';
  export type Scheme<T = any, U = any> = {
    uibase: 'from' | 'text' | 'color' | 'number' | 'boolean' |
    'date' | 'time' | 'datetime' | 'file' | 'email' | 'url' | 'image'
    | 'object' | 'array' | 'select';

    // the user-friendly ui label to identify the property, by default the property name
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
    // scheme creation time (for dynamically created properties)
    ctime?: number;
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
    decimals?: number // number of decimal digits (digits in excess wil be truncated)
    significants?: number // number of significant digits (digits in excess will be truncated)
    regexp?: RegExp; // input text shall meet regexp
    // provides a set of selectable options
    selection?: { [key: number | string]: Scheme<T, U> } | (() => { [key: number | string]: Scheme<T, U> });
    properties?: { [key: number | string]: Scheme<any, any> }
    // if restricted is true, cannot add new properties from frontend
    restricted?: boolean;
    // default scheme to apply to inner element, such as array elements
    innerScheme?: Scheme<any, any>;
  }
  export const schemes = {
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
  export interface Context {
    value?: any;
    scheme?: Scheme;
    propertyName?: string | number;
    // called by the editor when value changes on editor side to update the service client
    editUpdate?: (c: any, p: string | number) => void;
    // called by the service client to change the context (value and scheme)
    contextChange?: (context: Context) => void;
  }

  export const getSchemes = (): string[] => {
    return Object.keys(ObjectEditor.schemes);
  }
  export const getScheme = (typeName: string | undefined) => {
    if (typeName == undefined) return undefined;
    return (ObjectEditor.schemes as any)[typeName];
  }
  export const isScheme = (type: string | undefined | null): boolean => {
    return type ? ObjectEditor.schemes.hasOwnProperty(type) : false;
  }
  export const convert = (value: any, scheme: Scheme): any => {
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
  export const initValue = (value: any, scheme: Scheme): any => {
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
            if (lastKey && i > value.length && scheme.properties?.[lastKey])
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

  export const getProperties = (context: Context) => {
    let properties: (string|number)[] = [];
    for (const sp of Object.keys(context.scheme?.properties ?? {})) {
      if (context.value?.[sp]) {
        properties.push(sp);
      }
    }
    for (const sp of Object.keys(context.value ?? {})) {
      if (sp !== ObjectEditor.schemeIdProperty && !properties.includes(sp)) {
        properties.push(sp);
      }
    };
    properties = properties.sort((a,b) => {
      const a_ct = context.scheme?.properties?.[a].ctime ??0;
      const b_ct = context.scheme?.properties?.[b].ctime ??0;
      if(a_ct == b_ct) {
        return properties.indexOf(a) - properties.indexOf(b);
      }
      else {
        return a_ct - b_ct;
      }
    })
    return properties;
  }

  export const editUpdate = (context: Context, p: string | number) => {
    if (context.editUpdate) {
      if (!context.value) context.value = {};
      if (!context.scheme) context.scheme = { uibase: 'object', properties: {} };
      context.value[p] = ObjectEditor.convert(
        context.value[p],
        context.scheme.properties![p]
      );
      context.editUpdate(context, p);
    }
  }

  export const getListSel = (context: Context): string[] => {
    if (!context.scheme?.properties) {
      return [];
    }
    const isel = Object.keys(context.scheme?.properties);
    const rsel: string[] = [];
    isel.forEach((s) => {
      if (!context.value?.hasOwnProperty(s)) {
        rsel.push(s);
      }
    });
    return rsel;
  }

  export const addNewProperty = (context: Context, newProperty: { property: string | number, type: string }) => {
    if (context.scheme === undefined) {
      context.scheme = { uibase: 'object' };
    }
    if (context.scheme.uibase != 'object' &&
      context.scheme.uibase != 'array') {
      return;
    }
    if (
      newProperty.property &&
      newProperty.property !== '' &&
      // cannot replace existing property
      context.value[newProperty.property] === undefined &&
      // sanity check on newproperty type
      ObjectEditor.isScheme(newProperty.type)
    ) {
      if (!context.scheme.properties)
        context.scheme.properties = {};
      // if there is no preset scheme for the added property
      // then create one based on the type, and mark it optional and deletable
      if (!context.scheme.properties[newProperty.property])
        context.scheme.properties[newProperty.property] = {
          uibase: newProperty.type as ObjectEditor.Scheme['uibase'],
          optional: true,
          deletable: true,
          ctime: new Date().getUTCDate()
        };
      context.value[newProperty.property] =
        ObjectEditor.initValue(undefined,
          context.scheme.properties?.[newProperty.property])
      editUpdate(context, newProperty.property);
    }
  }

  export const deleteProperty = (context: Context, p: string | number) => {
    if (context.scheme?.properties?.[p].optional) {
      delete context.value[p];
    }
    if (context.scheme?.properties?.[p].deletable) {
      delete context.scheme.properties[p];
    }
    if (context.editUpdate) {
      context.editUpdate(context, p);
    }
  }


  export const selectScheme = (value: any, scheme: Scheme, schemeId: string) => {
    if (!scheme.selection) {
      return;
    }
    let rscheme;
    if (typeof scheme.selection == 'function') {
      rscheme = scheme.selection();
    }
    else {
      rscheme = scheme.selection;
    }
    if (rscheme && rscheme[schemeId]) {
      value[schemeIdProperty] = schemeId;
    }
  }
}
