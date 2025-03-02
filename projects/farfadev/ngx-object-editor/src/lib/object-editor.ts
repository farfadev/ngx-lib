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
  export type SchemeList<T = any, U = any> = { [key: number | string]: Scheme<T, U> };
  export type Scheme<T = any, U = any> = {
    uibase: 'from' | 'text' | 'color' | 'number' | 'boolean' |
    'date' | 'time' | 'datetime' | 'file' | 'email' | 'url' | 'image'
    | 'object' | 'array' | 'select';

    // the user-friendly ui label to identify the property, by default the property name
    label?: string;
    style?: string | ((context: Context) => string)
    styleClass?: string | ((context: Context) => string)
    // an html <article> that helps frontend user to understand/ set the value 
    description?: string | ((context: Context) => string);
    // a call-back to set EditorOptions dynamically depending on a runtime context
    dynamic?: (context?: Context) => Scheme<T, U>;
    // refer to another property when the value depends on another property value 
    dependsOn?: { property: string; f: (value?: any) => T }
    // if value can be undefined (optional) - may depend on the outer value (value of the encompassing object)
    optional?: boolean | ((context?: Context) => boolean);
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
    // provides a set of selectable schemes when value can have different schemes
    schemeSelectionList?: SchemeList<T, U> | (() => SchemeList<T, U>);
    // holds the scheme selection key from the scheme selection list
    schemeSelectionKey?: number | string;
    // provides a set of selectable schemes for new object/array property
    innerSchemeSelectionList?: SchemeList<T, U> | (() => SchemeList<T, U>);
    // for object or array, provide the schemes for the object/ array properties
    properties?: { [key: number | string]: Scheme }
    // if restricted is true, cannot add new properties from frontend
    restricted?: boolean;
  }
  export const baseSchemes = {
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
    'select': {
      type: 'select',
      html: 'select',
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
    value?: any; // the value
    scheme?: Scheme; // the scheme associated with the value
    // the parent context (encompassing object, array, select, undefined on the root Context)
    pcontext?: Context;
    key?: string | number; // the key in the parent context
    // called by the editor when value changes on editor side to update the client application
    editUpdate?: (c: any, key?: string | number) => void;
    // called by the client application to change the context (value and scheme)
    // eg in case of an update from the server, to avoid page reload
    contextChange?: (context: Context) => void;
  }

  export const getBaseSchemes = (): string[] => {
    return Object.keys(ObjectEditor.baseSchemes);
  }
  export const getBaseScheme = (context: Context | string) => {
    if(typeof context == 'object') {
    if (context.scheme?.uibase == undefined) return undefined;
      return (ObjectEditor.baseSchemes as any)[context.scheme?.uibase];
    }
    else if(typeof context == 'string') {
      return (ObjectEditor.baseSchemes as any)[context];
    }
  }
  export const isSchemeSelectionKey = (scheme?: Scheme, key?: string | number): boolean => {
    const keys = ObjectEditor.getSchemeSelectionKeys(scheme);
    return (keys && key) ? keys.includes(key) : false;
  }
  export const isInnerSchemeSelectionKey = (scheme?: Scheme, key?: string | number): boolean => {
    const keys = ObjectEditor.getInnerSchemeSelectionKeys(scheme);
    return (keys && key) ? keys.includes(key) : false;
  }
  export const convert = (value: any, scheme: Scheme): any => {
    const type = ObjectEditor.getBaseScheme(scheme.uibase);
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

  export const getSchemeSelectionList = (scheme?: Scheme): SchemeList<any, any> => {
    if (!scheme) return {};
    const selList = scheme.schemeSelectionList;

    return (typeof selList == 'function' ?
      selList() : selList) ?? {}
  }

  export const getInnerSchemeSelectionList = (scheme?: Scheme, p?: string | number): SchemeList<any, any> => {
    if (!scheme) return {};
    const selList = p ?
      scheme.properties?.[p].innerSchemeSelectionList :
      scheme.innerSchemeSelectionList;

    return (typeof selList == 'function' ?
      selList() : selList) ?? {}
  }

  export const getSchemeSelectionKeys = (scheme?: Scheme): (string | number)[] => {
    const list: (string | number)[] = [];
    if (!scheme) return [];
    if (scheme?.restricted) {
      list.push(...ObjectEditor.getBaseSchemes());
    }
    list.push(...Object.keys(ObjectEditor.getSchemeSelectionList(scheme)));
    return list;
  }

  export const getInnerSchemeSelectionKeys = (scheme?: Scheme, p?: string | number): (string | number)[] => {
    const list: (string | number)[] = [];
    if (!scheme || (p && !scheme.properties?.[p])) return [];
    if ((!p && !scheme?.restricted) || (p && !scheme?.properties?.[p].restricted)) {
      list.push(...ObjectEditor.getBaseSchemes());
    }
    list.push(...Object.keys(ObjectEditor.getInnerSchemeSelectionList(scheme, p)));
    return list;
  }

  export const selectScheme = (context: Context, propertyKey: string | number, schemeKey: string): any => {
    if (ObjectEditor.isSchemeSelectionKey(context.scheme!.properties![propertyKey], schemeKey)) {
      const selList = ObjectEditor.getSchemeSelectionList(context.scheme!.properties![propertyKey]);
      const baseList = ObjectEditor.getBaseSchemes();
      if (selList[schemeKey]) {
        context.scheme!.properties![propertyKey].schemeSelectionKey = schemeKey;
      }
      else if (baseList.includes(schemeKey)) {
      }
      context.value![propertyKey] =
        initValue(undefined,
          ObjectEditor.getSchemeSelectionList(context.scheme?.properties?.[propertyKey])[schemeKey]);
    }
  }

  export const initValue = (value: any, scheme: Scheme): any => {
    switch (scheme.uibase) {
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
          if (scheme.transform?.backward) {
            value = scheme.transform.backward(value);
          }
        }
        break;
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
      case 'select': {

        const selList = ObjectEditor.getSchemeSelectionList(scheme);

        if (!scheme.schemeSelectionKey && !scheme.optional) {
          scheme.schemeSelectionKey = Object.keys(selList)[0];
        }

        if (scheme.schemeSelectionKey) {
          if (!value) value = initValue(value, selList[scheme.schemeSelectionKey]);
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
          value = new Date().toISOString().substring(0, 10);
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
          value = new Date().toISOString().substring(0, 16);
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
          value = new Date().toISOString().substring(11, 16);
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
    let properties: (string | number)[] = [];
    const value = context.scheme?.transform?.forward ? 
    context.scheme?.transform?.forward(context.value) :
    context.value;
    for (const sp of Object.keys(context.scheme?.properties ?? {})) {
      if (value?.[sp] && !context.scheme?.properties?.[sp].deletable) {
        properties.push(sp);
      }
    }
    for (const sp of Object.keys(value ?? {})) {
      if (sp !== ObjectEditor.schemeIdProperty && !properties.includes(sp)) {
        properties.push(sp);
      }
    };
    properties = properties.sort((a, b) => {
      const a_ct = context.scheme?.properties?.[a].ctime ?? 0;
      const b_ct = context.scheme?.properties?.[b].ctime ?? 0;
      if (a_ct == b_ct) {
        return properties.indexOf(a) - properties.indexOf(b);
      }
      else {
        return a_ct - b_ct;
      }
    })
    return properties;
  }

  export const editUpdate = (context: Context) => {
    if (context.editUpdate && context.pcontext && context.key) {
      if (!context.pcontext.value) context.pcontext.value = {};
      if (!context.pcontext.scheme) context.pcontext.scheme = { uibase: 'object', properties: {} };
      context.pcontext.value[context.key] = ObjectEditor.convert(
        context.pcontext.value[context.key],
        context.pcontext.scheme.properties![context.key]
      );
      context.editUpdate(context);
    }
  }

  export const isOptional = (context: Context) => {
    const opt = context.scheme?.optional;
    if (typeof opt == 'function') {
      return opt(context);
    }
    else {
      return opt ?? false;
    }
  }

  export const isArray = (context: Context) => {
    return context.scheme?.uibase == 'array'
  }

  export const isObject = (context: Context) => {
    return context.scheme?.uibase == 'object'
  }

  export const isReadOnly = (context: Context) => {
    const opt = context.scheme?.readonly;
    return opt ?? false;
  }

  export const isRestricted = (context: Context) => {
    const opt = context.scheme?.restricted;
    return opt ?? false;
  }

  export const getOptionalPropertyList = (context: Context): string[] => {
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

  export const addNewProperty = (context: Context, newProperty: { property: string | number, schemeKey: string }) => {
    if (context.scheme === undefined) {
      context.scheme = { uibase: 'object' };
    }
    if (context.scheme.uibase != 'object' &&
      context.scheme.uibase != 'array') {
      return;
    }
    if (context.scheme.uibase == 'array') {
      newProperty.property = context.value.length;
    }
    if (
      (newProperty.property || newProperty.property == 0) &&
      newProperty.property !== '' &&
      // cannot replace existing property
      context.value[newProperty.property] === undefined &&
      // sanity check on newproperty type
      ObjectEditor.isInnerSchemeSelectionKey(context.scheme, newProperty.schemeKey)
    ) {
      if (!context.scheme.properties)
        context.scheme.properties = {};
      if (!context.scheme.properties[newProperty.property]) {
        if (ObjectEditor.isInnerSchemeSelectionKey(context.scheme, newProperty.schemeKey)) {
          if (ObjectEditor.getBaseSchemes().includes(newProperty.schemeKey)) {
            // if there is no preset scheme for the added property
            // then create one based on the type, and mark it optional and deletable
            context.scheme.properties[newProperty.property] = {
              uibase: newProperty.schemeKey as ObjectEditor.Scheme['uibase'],
              optional: true,
              deletable: true,
              ctime: Date.now()
            };
          }
          else {
            context.scheme.properties[newProperty.property] =
              cloneDeep(ObjectEditor.getInnerSchemeSelectionList(context.scheme)[newProperty.schemeKey]);
            context.scheme.properties[newProperty.property].optional = true;
            context.scheme.properties[newProperty.property].deletable = true;
            context.scheme.properties[newProperty.property].ctime = Date.now();
          }
        }
      }
      if (newProperty.schemeKey == 'select') {
        const pScheme = context.scheme.properties[newProperty.property];
        const selList = ObjectEditor.getSchemeSelectionList(pScheme);
        pScheme.schemeSelectionKey = Object.keys(selList)[0];
      }
      context.value[newProperty.property] =
        ObjectEditor.initValue(undefined,
          context.scheme.properties?.[newProperty.property])
          const subContext = ObjectEditor.getSubContext(context,newProperty.property);
      editUpdate(subContext);
    }
  }

  export const deleteProperty = (context: Context) => {
    if (context.scheme?.optional && context.key) {
      delete context?.pcontext?.value[context.key];
    }
    if (context.scheme?.deletable && context.key) {
      delete context.pcontext?.scheme?.properties?.[context.key];
    }
    if (context.editUpdate) {
      context.editUpdate(context);
    }
  }

  export const getStyle = (context: Context) => {
    if (typeof context.scheme?.style == 'function') {
      return context.scheme.style(context);
    }
    else {
      return context.scheme?.style;
    }
  }

  export const getStyleClass = (context: Context) => {
    if (typeof context.scheme?.styleClass == 'function') {
      return context.scheme.styleClass(context);
    }
    else {
      return context.scheme?.styleClass;
    }
  }

  export const getSubContext = (context: Context, p?: string | number): ObjectEditor.Context => {
    if (!p) {
      return context;
    }
    if (context.scheme?.uibase ?? '' in ['object', 'array']) {
      const transform = context.scheme?.properties?.[p]?.transform;
      const subContext = {
        scheme: context.scheme?.properties?.[p],
        value: transform?.forward ? transform.forward(context.value[p]):context.value[p],
        pcontext: context,
        key: p,
        editUpdate: (c: any, key?: string | number) => {
          context.value[p] = transform?.backward ? transform.backward(subContext.value):subContext.value;
          context.editUpdate?.(c, key);
        },
        contextChange: context.contextChange
      }
      return subContext;
    }
    else {
      return {

      }
    }
  }

  export const getLabel = (context: Context) => {
    return context.scheme?.label ?? context.key;
  }

  export const getDescription = (context: Context): string | undefined => {
    if (typeof context.scheme?.description == 'function') {
      return context.scheme.description(context);
    }
    else {
      return context.scheme?.description;
    }
  }
}
