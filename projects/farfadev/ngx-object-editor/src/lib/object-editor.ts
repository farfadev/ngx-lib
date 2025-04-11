//import cloneDeep from "lodash.clonedeep";
import { ComponentType } from "@angular/cdk/overlay";
import { cloneDeep } from "lodash-es";

export namespace ObjectEditor {

  interface From {
    reference: string;
  }

  interface IScheme {
    html: string;
    js: string;
  }
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
  /**
   * - [UIBase]({@link ./object-editor.doc.md})
   */
  export type UIBase = 'text' | 'password' | 'color' | 'number' | 'boolean' | 'radio' | 'range' |
    'date' | 'time' | 'datetime' | 'file' | 'tel' | 'email' | 'url' | 'image'
    | 'object' | 'array' | 'select' | 'from' | 'custom' | 'angular';

  export const schemeIdProperty = '_$schemeRef';

  export type SchemeList<T = any, U = any> = { [key: number | string]: Scheme<T, U> };

  export type UIEffects = {
    toggle?: boolean;
    horizontal?: true;
    // for html style attribute
    style?: string | ((context: Context) => string);
    // for html style attribute of the inner items (object/ array)
    inputAttributes?: {[key: string]: string} | ((context: Context) => {[key: string]: string});
    innerStyle?: string | ((context: Context) => string);
    // for html class (or primeng styleClass) attribute (need css injection :host::ngdeep)
    // TODO doesn't work yet
    styleClass?: string | ((context: Context) => string);
    // for html class (or primeng styleClass) attribute (need css injection :host::ngdeep)
    // TODO doesn't work yet
    innerStyleClass?: string | ((context: Context) => string);
    // for primeng design token styling
    designToken?: object | ((context: Context) => object);
  }

  // type of values returned by the adjust callback
  // - formattedValue is the new ui value as appearing to user
  // - adjustedValue is the new actual value as set on the model
  // - message is displayed to explain an erroneous value
  // - cursorPosition is the new cursor position after value is formatted
  export type Adjusted = {
    formattedValue?: string,
    adjustedValue?: any,
    message?: string,
    cursorPosition?: number | 'end'
  }

  /** 
   * {@link ./object-editor.doc.html}
   */
  export type Adjust = {
    // called after each value change (return Adjusted value)
    adjust?: (context: Context, inputValue?: string, cursorPosition?: number) => Adjusted | null,
    // called on key down, to accept or not the event (return true/ falls)
    accept?: (context: Context, key: KeyboardEvent, inputValue: string, cursorPosition: number) => boolean
  }

  export type Scheme<T = any, U = any> = {

    uibase: UIBase;

    // the user-friendly ui label to identify the property, by default the property name
    label?: string;
    // rules for UI , such as scrolling, toggling
    uiEffects?: UIEffects | ((context: Context) => UIEffects);
    // an html <article> that helps frontend user to understand/ set the value 
    description?: string | ((context: Context) => string);
    // a call-back to set Scheme dynamically depending on a runtime context
    dynamic?: (context?: Context) => Scheme<T, U>;
    // the value depends on other values (properties) and shall be recalculated (callback f) when one of these valuess changes
    dependsOn?: { properties: (string | number)[]; f: (value?: any) => T }
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
      html?: (context: Context) => string; // an html component
      init?: (context: Context, el: HTMLElement, err_cb: (err_msg: string) => void) => void; // call back to initiaalise the html element after DOM attachment (event listeners ...)
    }
    angularFrontEnd?: {
      component?: (context: Context) => any; // an angular component
      inputs?: (context: Context) => Record<string,any>; // call back to set the input attributes of the component
    }
    // https://imask.js.org/guide.html
    maskOptions?: Record<string, unknown> | ((context: Context) => Record<string, unknown>);
    length?: {
      min?: number;
      max?: number;
    }
    // value validation/ adjustment callbacks
    adjust?: Adjust,
    // provides a set of selectable schemes when value can have different schemes
    schemeSelectionList?: SchemeList<T, U> | (() => SchemeList<T, U>);
    // holds the scheme selection key from the scheme selection list
    defaultSchemeSelectionKey?: number | string;
    // holds the scheme selection key from the scheme selection list
    schemeSelectionKey?: number | string;
    // holds the scheme selection key from the scheme selection list
    schemeSelected?: Scheme;
    // provides a set of selectable schemes for new object/array property
    innerSchemeSelectionList?: SchemeList<T, U> | (() => SchemeList<T, U>);
    // for object or array, provide the schemes for the object/ array properties
    properties?: { [key: number | string]: Scheme }
    // for value enumation, 
    defaultEnumKey?: number | string;
    enum?: { [key: number | string]: any }
    // if restricted is true, cannot add new properties from frontend
    unrestricted?: boolean;
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
    'radio': {
      type: 'radio',
      html: 'radio',
      js: 'object',
    },
    'range': {
      type: 'range',
      html: 'range',
      js: 'number',
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
    password: {
      type: 'password',
      html: 'password',
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
      js: 'object',
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
    custom: {
      type: 'custom',
      html: 'custom',
      js: 'custom'
    },
    angular: {
      type: 'angular',
      html: 'angular',
      js: 'angular'
    }
  };
  export interface Context {
    value?: any; // the value
    scheme?: Scheme; // the scheme associated with the value
    // the parent context (encompassing object, array, select, undefined on the root Context)
    pcontext?: Context;
    key?: string | number; // the key in the parent context
    // called by the editor when value changes on editor side to update the client application
    editUpdate?: (self?: boolean) => void;
    // called by the client application to change the context (value and scheme)
    // eg in case of an update from the server, to avoid page reload
    contextChange?: (context: Context, env?: { [key: string | number]: any }) => void;
    onClick?: (subContext: Context) => void;
    debug?: boolean; // display debugging information
  }

  export const getBaseSchemes = (): string[] => {
    return Object.keys(ObjectEditor.baseSchemes);
  }
  export const getBaseScheme = (context: Context | string) => {
    if (typeof context == 'object') {
      if (context.scheme?.uibase == undefined) return undefined;
      return (ObjectEditor.baseSchemes as any)[context.scheme?.uibase];
    }
    else if (typeof context == 'string') {
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
      case 'string':
        return String(value);
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
    if (scheme?.unrestricted) {
      list.push(...ObjectEditor.getBaseSchemes());
    }
    list.push(...Object.keys(ObjectEditor.getSchemeSelectionList(scheme)));
    return list;
  }

  export const getInnerSchemeSelectionKeys = (scheme?: Scheme, p?: string | number): (string | number)[] => {
    const list: (string | number)[] = [];
    if (!scheme || (p && !scheme.properties?.[p])) return [];
    if ((!p && scheme?.unrestricted) || (p && scheme?.properties?.[p].unrestricted)) {
      list.push(...ObjectEditor.getBaseSchemes());
    }
    list.push(...Object.keys(ObjectEditor.getInnerSchemeSelectionList(scheme, p)));
    return list;
  }

  const setSelectedScheme = (scheme: Scheme, schemeKey?: string | number): void => {
    if (!schemeKey) {
      schemeKey = scheme?.defaultSchemeSelectionKey;
    }
    if (!schemeKey && !scheme?.optional) {
      schemeKey = ObjectEditor.getSchemeSelectionKeys(scheme)?.[0];
    }
    if (!schemeKey) {
      scheme.schemeSelectionKey = undefined;
      scheme.schemeSelected = undefined;
    }
    if (schemeKey == scheme.schemeSelectionKey && scheme.schemeSelected) {
      // same key is selected, just do nothing
      //TODO find a way to reset the scheme
      return;
    }
    if (schemeKey && ObjectEditor.isSchemeSelectionKey(scheme, schemeKey)) {
      const selList = ObjectEditor.getSchemeSelectionList(scheme);
      const baseList = ObjectEditor.getBaseSchemes();
      if (selList[schemeKey]) {
        scheme.schemeSelectionKey = schemeKey;
        scheme.schemeSelected = cloneDeep(selList[schemeKey]);
      }
      else if (typeof schemeKey == 'string' && baseList.includes(schemeKey)) {
        scheme.schemeSelectionKey = schemeKey;
        scheme.schemeSelected = {
          uibase: schemeKey as ObjectEditor.Scheme['uibase'],
          optional: true,
          deletable: true,
          ctime: Date.now()
        };
      }
    }
  }

  export const selectScheme = (context: Context, schemeKey?: string | number): ObjectEditor.Context | undefined => {
    if (context.scheme) setSelectedScheme(context.scheme, schemeKey);
    if (!schemeKey) {
      schemeKey = context.scheme?.defaultSchemeSelectionKey;
    }
    if (!schemeKey && !context.scheme?.optional) {
      schemeKey = ObjectEditor.getSchemeSelectionKeys(context.scheme)?.[0];
    }
    if (!context.scheme?.schemeSelected) {
      context.value = undefined;
      context.editUpdate?.();
      return ObjectEditor.getSubContext(context);
    }
    if (context.scheme!.schemeSelected) {
      context.value = context.pcontext!.value![context.key!] =
        initValue(undefined, context.scheme!.schemeSelected);
      return ObjectEditor.getSubContext(context);
    }
    else {
      context.value = context.pcontext!.value![context.key!] = undefined;
      return undefined;
    }
  }

  export const getSelectedEnumKey = (context: ObjectEditor.Context): string | undefined => {
    if ((!context) || (context.value === undefined)) return undefined;
    const _enum = context.scheme?.enum ?? {};
    for (const key of Object.keys(_enum)) {
      if (JSON.stringify(context.value) == JSON.stringify(_enum[key])) {
        return key;
      }
    }
    return undefined;
  }

  export const getEnumKeys = (scheme: Scheme | undefined): string[] => {
    if (scheme?.uibase != 'radio') {
      return [];
    }
    if (scheme?.enum) {
      return Object.keys(scheme?.enum);
    }
    return [];
  }

  export const selectEnum = (context: Context, enumKey?: string | number): void => {

    if (!enumKey && context.value !== undefined) {
      enumKey = getSelectedEnumKey(context);
    }

    if (!enumKey) {
      enumKey = context.scheme?.defaultEnumKey;
    }
    if (!enumKey && context.scheme && !context.scheme?.optional) {
      enumKey = ObjectEditor.getEnumKeys(context.scheme)?.[0];
    }
    if (!enumKey || (context.scheme?.enum?.[enumKey] == undefined)) {
      context.value = undefined;
    }
    else {
      context.value = cloneDeep(context.scheme.enum?.[enumKey]);
    }
    context.editUpdate?.();
  }

  export const initContext = (context: Context): void => {
    if(!context.scheme) {
      context.scheme = { uibase: 'object' };
    }
    context.value = ObjectEditor.initValue(context.value, context.scheme);
  }

  export const initValue = (value: any, scheme: Scheme): any => {
    switch (scheme.uibase) {
      case 'object':
        if (value == undefined && scheme.default != undefined) {
          value = cloneDeep(scheme.default);
        }
        else {
          if (value == undefined) {
            value = {};
          }
          const keys = Object.keys(scheme?.properties ?? {});
          for (const key of keys) {
            if (!scheme?.properties?.[key].optional && scheme.properties?.[key]) {
              value![key] = value![key] ?? ObjectEditor.initValue(value[key], scheme.properties?.[key]);
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
        if (scheme.length?.min != undefined) {
          let lastKey;
          const keys = Object.keys(scheme.properties ?? {});
          for (let i = 0; i < scheme.length.min; i++) {
            if (scheme.properties?.[i]) {
              lastKey = i;
            }
            if (lastKey && i > value.length && scheme.properties?.[lastKey])
              value.push(ObjectEditor.initValue(value[i], scheme.properties?.[lastKey]));
          }
        }
        break;
      case 'select': {
        setSelectedScheme(scheme, scheme.schemeSelectionKey);
        if (scheme.schemeSelectionKey && scheme.schemeSelected) {
          if (!value) value = initValue(undefined, scheme.schemeSelected);
        }
        else {
          value = undefined;
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
      case 'radio':
        if (value == undefined) {
          const keys = Object.keys(scheme.enum ?? {});
          const key = scheme.defaultEnumKey ?? keys.length > 0 ? keys[0] : undefined;
          value = key ? cloneDeep(scheme.enum?.[key]) : undefined;
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
        case 'custom':
        case 'angular':
            if (value == undefined && scheme.default != undefined) {
            value = cloneDeep(scheme.default);
          }
          else if (value == undefined) {
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
    const schemeKeys = Object.keys(context.scheme?.properties ?? {});
    for (const sp of schemeKeys) {
      if (value?.[sp] && !context.scheme?.properties?.[sp].deletable) {
        properties.push(sp);
      }
    }
    for (const sp of Object.keys(value ?? {})) {
      if (sp !== ObjectEditor.schemeIdProperty && !properties.includes(sp)
        && (context.scheme?.properties?.[sp] != undefined)
        && (value[sp] == undefined ? !context.scheme?.properties?.[sp].optional : true)) {
        properties.push(sp);
      }
    };
    properties = (context.scheme?.uibase === 'object') ? properties.sort((a, b) => {
      const a_ct = context.scheme?.properties?.[a].ctime ?? 0;
      const b_ct = context.scheme?.properties?.[b].ctime ?? 0;
      if (a_ct == b_ct) {
        if ((typeof a == 'string') && (typeof b == 'string'))
          return schemeKeys.indexOf(a) - schemeKeys.indexOf(b);
        else
          return properties.indexOf(a) - properties.indexOf(b);
      }
      else {
        return a_ct - b_ct;
      }
    }) : properties.sort((a, b) => {
      return Number(a) - Number(b)
    })
    return properties;
  }

  export const editUpdate = (context: Context) => {
    if (context.editUpdate && context.pcontext && context.key !== undefined) {
      if (!context.pcontext.value) context.pcontext.value = {};
      if (!context.pcontext.scheme) context.pcontext.scheme = { uibase: 'object', properties: {} };
      context.pcontext.value[context.key] = ObjectEditor.convert(
        context.pcontext.value[context.key],
        context.pcontext.scheme.properties![context.key]
      );
      context.editUpdate();
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

  export const isSelect = (context: Context) => {
    return context.scheme?.uibase == 'select'
  }

  export const isReadOnly = (context: Context) => {
    const opt = context.scheme?.readonly;
    return opt ?? false;
  }

  export const isRestricted = (context: Context) => {
    const opt = context.scheme?.unrestricted;
    return opt ?? true;
  }

  export const getOptionalPropertyList = (context: Context): string[] => {
    if (!(context.scheme?.uibase == 'object') || !context.scheme?.properties) {
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

  export const addProperty = (context: Context, newProperty: { property: string | number, schemeKey: string }): ObjectEditor.Context | undefined => {
    if (context.scheme === undefined) {
      context.scheme = { uibase: 'object' };
    }
    if (context.scheme.uibase != 'object' &&
      context.scheme.uibase != 'array') {
      return undefined;
    }
    if (context.scheme.uibase == 'array') {
      newProperty.property = context.value.length;
    }
    if (
      (newProperty.property !== undefined) &&
      newProperty.property !== '' &&
      // cannot replace existing property
      context.value[newProperty.property] === undefined &&
      // sanity check on newproperty type
      (ObjectEditor.isInnerSchemeSelectionKey(context.scheme, newProperty.schemeKey)||
      ObjectEditor.getOptionalPropertyList(context).includes(String(newProperty.property)))
    ) {
      if (!context.scheme.properties)
        context.scheme.properties = {};
      if (context.scheme.properties[newProperty.property] === undefined) {
        if (ObjectEditor.isInnerSchemeSelectionKey(context.scheme, newProperty.schemeKey)) {
          if (ObjectEditor.getInnerSchemeSelectionList(context.scheme)[newProperty.schemeKey] != undefined) {
            context.scheme.properties[newProperty.property] =
              cloneDeep(ObjectEditor.getInnerSchemeSelectionList(context.scheme)[newProperty.schemeKey]);
            context.scheme.properties[newProperty.property].optional = true;
            context.scheme.properties[newProperty.property].deletable = true;
            context.scheme.properties[newProperty.property].ctime = Date.now();
          }
          else if (ObjectEditor.getBaseSchemes().includes(newProperty.schemeKey)) {
            // if there is no preset scheme for the added property
            // then create one based on the type, and mark it optional and deletable
            context.scheme.properties[newProperty.property] = {
              uibase: newProperty.schemeKey as ObjectEditor.Scheme['uibase'],
              optional: true,
              deletable: true,
              ctime: Date.now()
            };
          }
        }
      }
      if (newProperty.schemeKey == 'select') {
        const pScheme = context.scheme.properties[newProperty.property];
        const selList = ObjectEditor.getSchemeSelectionList(pScheme);
        pScheme.schemeSelectionKey = Object.keys(selList)[0];
      }
      switch (context.scheme.uibase) {
        case 'object': {
          context.value[newProperty.property] =
            ObjectEditor.initValue(undefined,
              context.scheme.properties?.[newProperty.property])
        }
          break;
        case 'array': {
          context.value.splice(newProperty.property, 0,
            ObjectEditor.initValue(undefined,
              context.scheme.properties?.[newProperty.property]));
        }
          break;
      }
      const subContext = ObjectEditor.getSubContext(context, newProperty.property);
      if (subContext) editUpdate(subContext);
      return subContext;
    }
    return undefined;
  }

  export const canDeleteProperty = (context: Context) => {
    if (context.pcontext?.scheme?.uibase === 'object') {
      if ((context.scheme?.optional || context.scheme?.deletable) && context.key !== undefined) {
        return true;
      }
      if (context.scheme?.deletable && context.key !== undefined) {
        return true;
      }
      if (context.scheme && (!context.scheme.optional && !context.scheme.deletable) && context.key !== undefined && context.scheme.default) {
        return true;
      }
    }
    if (context.pcontext?.scheme?.uibase === 'array') {
      return true;
    }
    return false;
  }

  export const deleteProperty = (context: Context) => {
    if (context.pcontext?.scheme?.uibase === 'object') {
      if ((context.scheme?.optional || context.scheme?.deletable) && context.key !== undefined) {
        delete context?.pcontext?.value[context.key];
        context.value = undefined;
      }
      if (context.scheme?.deletable && context.key !== undefined) {
        delete context.pcontext?.scheme?.properties?.[context.key];
      }
      if (context.scheme && (!context.scheme.optional && !context.scheme.deletable) && context.key !== undefined) {
        context.value = ObjectEditor.initValue(undefined, context.scheme);
        if (context.pcontext?.value !== undefined) {
          context.pcontext.value[context.key] = context.value;
        }
      }
    }
    if (context.pcontext?.scheme?.uibase === 'array') {
      const nschemeP = context.pcontext.scheme.properties ?? {};
      const end = context.pcontext?.value.length - 1;
      (context.pcontext?.value as any[]).splice(Number(context.key), 1);
      for (const i of Object.keys(context.pcontext.scheme.properties!)) {
        if ((Number(i) >= Number(context.key)) && (Number(i) < end)) {
          nschemeP[Number(i)] = context.pcontext.scheme.properties![Number(i) + 1];
        }
      }
      context.key = undefined;
      context.value = undefined;
      context.scheme = undefined;
      delete nschemeP[end];
    }
    if (context.editUpdate) {
      context.editUpdate();
    }
    else if (context.pcontext?.editUpdate) {
      context.pcontext?.editUpdate();
    }
  }

  export const getStyle = (context: Context) => {
    const style = getUIEffects(context)?.style;
    if (typeof style == 'function') {
      return style(context);
    }
    else {
      return style;
    }
  }

  export const getStyleClass = (context: Context) => {
    const styleClass = getUIEffects(context)?.styleClass;
    if (typeof styleClass == 'function') {
      return styleClass(context);
    }
    else {
      return styleClass;
    }
  }

  export const getInnerStyle = (context: Context) => {
    const innerStyle = getUIEffects(context)?.innerStyle;
    if (typeof innerStyle == 'function') {
      return innerStyle(context);
    }
    else {
      return innerStyle;
    }
  }

  export const getInnerStyleClass = (context: Context) => {
    const innerStyleClass = getUIEffects(context)?.innerStyleClass;
    if (typeof innerStyleClass == 'function') {
      return innerStyleClass(context);
    }
    else {
      return innerStyleClass;
    }
  }

  export const getDesignToken = (context: Context) => {
    const designToken = getUIEffects(context)?.designToken;
    if (typeof designToken == 'function') {
      return designToken(context);
    }
    else {
      return designToken;
    }
  }

  export const getInputAttributes = (context: Context): {[key: string]: any} | undefined => {
    const inputAttributes = getUIEffects(context)?.inputAttributes;
    if (typeof inputAttributes == 'function') {
      return inputAttributes(context);
    }
    else {
      return inputAttributes;
    }
  }

  export const getMaskOptions = (context: Context): Record<string, unknown> | undefined => {
    if (typeof context.scheme?.maskOptions == 'function') {
      return context.scheme.maskOptions(context);
    }
    else {
      return context.scheme?.maskOptions;
    }
  }

  export const getUIEffects = (context: Context): UIEffects | undefined => {
    if (typeof context.scheme?.uiEffects == 'function') {
      return context.scheme.uiEffects(context);
    }
    else {
      return context.scheme?.uiEffects;
    }
  }

  export const getSubContext = (context: Context, p?: string | number): ObjectEditor.Context | undefined => {
    if (['object', 'array', 'custom', 'angular'].includes(context.scheme?.uibase ?? '')) {
      if (p === undefined) {
        return undefined;
      }
      const transform = context.scheme?.properties?.[p]?.transform;
      const subContext = {
        scheme: context.scheme?.properties?.[p],
        value: transform?.forward ? transform.forward(context.value[p]) : context.value[p],
        pcontext: context,
        key: p,
        editUpdate: () => {
          if (subContext.key !== undefined) {
            if (subContext.value !== undefined)
              context.value[subContext.key] = transform?.backward ? transform.backward(subContext.value) : subContext.value;
            else if (subContext.scheme?.optional)
              delete context.value[subContext.key];
          }
          context.editUpdate?.();
        },
        contextChange: context.contextChange,
        onClick: () => {

        },
        debug: context.debug
      }
      return subContext;
    }
    else if (context.scheme?.uibase == 'select') {
      if (context.scheme?.schemeSelected) {
        const transform = context.scheme?.schemeSelected.transform;
        const subContext = {
          scheme: context.scheme.schemeSelected,
          pcontext: context,
          value: context.value,
          editUpdate: () => {
            context.value = transform?.backward ? transform.backward(subContext.value) : subContext.value;
            context.editUpdate?.();
          },
          contextChange: context.contextChange
        }
        return subContext;
      }
      else {
        return undefined;
      }
    }
    return undefined;
  }

  export const getLabel = (context: Context) => {
    return context.scheme?.label ?? context.key ?? context.pcontext?.scheme?.schemeSelectionKey;
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
