//import cloneDeep from "lodash.clonedeep";
import { cloneDeep, isEqual, isMatch } from "lodash-es";

import { FarfaOEValueCheck } from "./utils/verifyvalues";

export namespace ObjectEditor {

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
  /**
   * - [UIBase]({@link ./object-editor.doc.md})
   */
  export type UIBase = 'text' | 'password' | 'color' | 'number' | 'checkbox' | 'range' |
    'date' | 'time' | 'datetime' | 'file' | 'tel' | 'email' | 'url' | 'image'
    | 'object' | 'array' | 'select' | 'from' | 'custom' | 'angular' | 'none';

  export type SelectionList<T = any, U = any> = { [key: string]: Scheme<T, U> };

  /**
   * define UI behaviour and styling
   */
  export type UIEffects = {
    /**
     * if the UI element can be toggled
     */
    toggle?: boolean;
    /**
     * if the select element shall be displayed as radio button
     */
    radio?: boolean;
    /**
     * if element shall be displayed horizontally instead of vertically
     */
    horizontal?: true;
    /**
     * a call back to set the label on select elements
     */
    selectLabel?: string | ((context: Context) => string);
    /**
     * set the style of the element
     */
    style?: string | ((context: Context) => string);
    /**
     * set element input attributes
     */
    inputAttributes?: { [key: string]: string } | ((context: Context) => { [key: string]: string });
    innerStyle?: string | ((context: Context) => string);
    // for html class (or primeng styleClass) attribute (need css injection :host::ngdeep)
    // TODO doesn't work yet
    styleClass?: string | ((context: Context) => string);
    // for html class (or primeng styleClass) attribute (need css injection :host::ngdeep)
    // TODO doesn't work yet
    innerStyleClass?: string | ((context: Context) => string);
    // for primeng design token styling
    // TODO doesn't work yet (primeng components)
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
  /**
   * describes a data scheme for the display and manupulation of the data
   * 
   */
  export type Scheme<ValueType = any, FwdValueType = any> = {
    /** indicates how the value shall be basically handled by the front-end */
    uibase: UIBase;
    /** the user-friendly ui label to identify the property, by default it is the property name */
    label?: string;
    /** rules for UI , such as scrolling, toggling, styling */
    uiEffects?: UIEffects | ((context: Context) => UIEffects);
    /** an html <article> that helps frontend user to understand/ set the value */
    description?: string | ((context: Context) => string);
    /** //TODO a call-back to set the Scheme dynamically depending on a runtime context */
    dynamic?: (context?: Context) => Scheme<ValueType, FwdValueType>;
    /** //TODO when the value depends on other values (properties) and shall be recalculated (callback f) when one of these values changes */
    dependsOn?: { properties: (string | number)[]; f: (context?: Context) => ValueType }
    /** if value is optional - may depend on the outer value (value of the encompassing object) */
    optional?: boolean | ((context?: Context) => boolean);
    /** optionaly can deactivate display - triggered on sibling properties updates */
    display?: { properties?: (string | number)[]; f: (context?: Context) => boolean; };
    /** if value is view/read only frontend user cannot edit the value */
    readonly?: boolean;
    /** provides a default value to use when no value is provided */
    default?: ValueType;
    /** 
    * front end form is a tranformation of the actual value <br>
    * exemple: [lat,lon] transformed as {latitude: number, longitude: number}
    */
    transform?: {
      /** forward function transforms the inner value to a different frontend value  */
      forward: (t: ValueType) => FwdValueType;
      /** backward function transforms the frontend value to an inner value */
      backward: (u: FwdValueType) => ValueType;
    }
    customFrontEnd?: {
      html?: (context: Context) => string; // an html component
      init?: (context: Context, el: HTMLElement, err_cb: (err_msg: string) => void) => void; // call back to initiaalise the html element after DOM attachment (event listeners ...)
    }
    angularFrontEnd?: {
      component?: (context: Context) => any; // an angular component
      inputs?: (context: Context) => Record<string, any>; // call back to set the input attributes of the component
    }
    /** https://imask.js.org/guide.html */
    maskOptions?: Record<string, unknown> | ((context: Context) => Record<string, unknown>);

    /** for arrays, specifies min and/ or max array length */
    length?: {
      min?: number;
      max?: number;
    }

    /** value validation/ adjustment callbacks */
    adjust?: Adjust,

    /**
     *  provides a set of selectable schemes 
     * - when the value can have different schemes (select) 
     * - for additional properties on objects
     * - for array items possible schemes
     */
    selectionList?: SelectionList<ValueType, FwdValueType> | ((context: Context) => SelectionList<ValueType, FwdValueType>);
    /** provides the default scheme selection key from the scheme selection list, otherwise the first scheme in the selection list is selected  */
    defaultSelectionKey?: string;
    /**
     * custom callback to identify a scheme selection key from a value 
     * during initialisation from sheer value (without chimere context)
     * shall return the scheme selection key or undefined if not found
     * if not provided or return undefined, the internal algorithm is used
    */
    detectScheme?: (context: Context, value: any) => string | undefined;

    /** for object/array provides the schemes corresponding to the value properties */
    properties?: { [key: number | string]: Scheme }
  }
  export interface Context {
    /** the value which is edited */
    value?: any;
    /** the edition scheme */
    scheme?: Scheme;

    /** the parent context (encompassing object, array, select, undefined on the root Context)  */
    pcontext?: Context;
    /** the key in the parent context (object property name, array item number, selection key */
    key?: string | number;
    /** a call back which is called by the editor when the value changes */
    editUpdate?: (self?: boolean) => void;
    /** called by the client application to change the context (value and/ or scheme)
     eg in case of an update from the server, to avoid full page reload */
    contextChange?: (context: Context, env?: { [key: string | number]: any }) => void;
    /** a call back which is called when the ui is clicked, internal use only */
    onClick?: (subContext: Context) => void;
  }

  /**
   * holds internal scheme properties 
   */
  interface IntScheme<ValueType = any, FwdValueType = any> extends Scheme<ValueType, FwdValueType> {

    /** INTERNAL: if scheme can be deleted (and corresponding value) */
    deletable?: boolean;

    // scheme creation time (for dynamically created properties)
    ctime?: number;

    // holds the selected scheme selection key from the scheme selection list
    selectedKey?: string;
    // holds the scheme selection key from the scheme selection list
    selectedScheme?: Scheme;

    /** holds the scheme selection key from the parent object/array scheme selection list */
    parentSelectedKey?: string;
  }
  const intS = (scheme: Scheme|undefined): IntScheme|undefined => {
    return (scheme != undefined ? scheme as IntScheme : undefined);
  } 

  /**
   * holds internal context properties 
   */
  interface IntContext extends Context {
    fwdValue: any;
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

  export const getSelectionKey = (context?: Context): string | undefined => {
    return intS(context?.scheme)?.selectedKey;
  }

  export const getSelectionLabel = (context: Context): string | undefined => {
    const selectionLabel = getUIEffects(context)?.selectLabel;
    if (typeof selectionLabel == 'function') {
      return selectionLabel(context);
    }
    else {
      return selectionLabel;
    }
  }
  const setSelectedScheme = (context: Context, key: string) => {
    intS(context.scheme)!.selectedKey = key;
    const v = getSelectionList(context)?.[key!];
    intS(context.scheme)!.selectedScheme = cloneDeep(v);
  }
  export const select = (context: Context, key?: string): Context | undefined => {
    if (key === undefined) {
      const keys = getSelectionKeys(context);
      if (context.scheme?.defaultSelectionKey != undefined && keys?.includes(context.scheme?.defaultSelectionKey)) {
        key = context.scheme?.defaultSelectionKey;
      }
      if (key === undefined) {
        key = keys?.[0];
      }
    }

    setSelectedScheme(context, key);

    context.value = initValue({ value: undefined, scheme: intS(context.scheme)!.selectedScheme! });

    context.editUpdate?.();
    return getSubContext(context);
  }

  export const getSelectionList = (context?: Context, p?: string | number): SelectionList<any, any> => {
    if (!context?.scheme) return {};
    const selList = p ?
      context.scheme.properties?.[p].selectionList :
      context.scheme.selectionList;

    return (typeof selList == 'function' ?
      selList(context) : selList) ?? {}
  }

  const setPropertyScheme = (context: Context, property: string | number, schemeKey: string, scheme?: Scheme): void => {
    if (context.scheme!.properties == undefined) {
      context.scheme!.properties = {};
    }
    if (isSchemeSelectionKey(context, schemeKey)) {
      context.scheme!.properties[property] = (scheme == undefined) ?
        cloneDeep(getSelectionList(context)[schemeKey]) as Scheme :
        scheme;
      intS(context.scheme!.properties[property])!.parentSelectedKey = schemeKey;
      intS(context.scheme!.properties[property])!.optional = true;
      intS(context.scheme!.properties[property])!.deletable = true;
      intS(context.scheme!.properties[property])!.ctime = Date.now();
    }
  }

  export const getSelectionKeys = (context?: Context, p?: string | number): string[] => {
    const list: string[] = [];
    if (!context?.scheme || (p && !context?.scheme?.properties?.[p])) return [];
    list.push(...Object.keys(getSelectionList(context, p)));
    return list;
  }

  export const initContext = (context: Context): void => {
    if (!context.scheme) {
      context.scheme = { uibase: 'object' };
    }
    if (!context.pcontext) {
      context.scheme = cloneDeep(context.scheme);
      const result = initScheme(context);
    }
    context.value = initValue(context);
  }

  const initValue = (context: Context): any => {
    let { value, scheme } = context;
    if (!scheme) return undefined;
    if (value == undefined && scheme.default != undefined) {
      value = cloneDeep(scheme.default);
    }
    if (scheme.transform) {
      value = scheme.transform.forward(value);
    }
    switch (scheme.uibase) {
      case 'object':
        if (value == undefined) value = {};
        const keys = Object.keys(scheme?.properties ?? {});
        for (const key of keys) {
          if (!scheme?.properties?.[key].optional && scheme.properties?.[key]) {
            value![key] = value![key] ?? initValue({ value: value[key], scheme: scheme.properties?.[key] });
          }
        }
        break;
      case 'array':
        if (value == undefined) value = [];
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
              value.push(initValue({ value: value[i], scheme: scheme.properties?.[lastKey] }));
          }
        }
        break;
      case 'select': {
        select(context);
        value = context.value;
      }
        break;
      case 'checkbox':
        if (value == undefined) {
          value = false;
        }
        break;
      case 'color':
        if (value == undefined) {
          value = '#ffffff';
        }
        break;
      case 'date':
        if (value == undefined) {
          value = new Date().toISOString().substring(0, 10);
        }
        break;
      case 'datetime':
        if (value == undefined) {
          value = new Date().toISOString().substring(0, 16);
        }
        break;
      case 'email':
        if (value == undefined) {
          value = '';
        }
        break;
      case 'file':
        if (value == undefined) {
          value = [];
        }
        break;
      case 'from':
        break;
      case 'image':
        if (value == undefined) {
          value = '';
        }
        break;
      case 'number':
        if (value == undefined) {
          value = 0;
        }
        break;
      case 'text':
        if (value == undefined) {
          value = '';
        }
        break
      case 'time':
        if (value == undefined) {
          value = new Date().toISOString().substring(11, 16);
        }
        break;
      case 'url':
        if (value == undefined) {
          value = '';
        }
        break;
      case 'none':
      case 'custom':
      case 'angular':
        if (value == undefined) {
        }
        break;
    }
    if (scheme.transform) {
      value = scheme.transform.backward(value);
    }
    return value;
  }

  const initScheme = (context: Context): number => {
    let match: number = 0;
    let count = 0;
    const forward = context.scheme?.transform?.forward;
    const value = (typeof forward == 'function') ? forward(context.value) : context.value;
    
    if(value == undefined) return 0;

    const selectionList = ObjectEditor.getSelectionList(context);

    switch (context.scheme?.uibase) {
      case 'object':
      case 'array':
        for (const p of Object.keys(value)) {
          let pmatch = 0;
          if (context.scheme.properties?.[p] != undefined) {
            const subContext = {
              scheme: context.scheme.properties?.[p],
              pcontext: context,
              value: value[p],
              key: p
            }
            pmatch = initScheme(subContext);
          }
          if (pmatch == 0 && selectionList != undefined) {
            if (context.scheme.detectScheme != undefined) {
              const selKey = context.scheme.detectScheme(context, value);
              if (selKey != undefined && Object.keys(selectionList).includes(selKey)) {
                const subContext = {
                  scheme: cloneDeep(selectionList[selKey]),
                  pcontext: context,
                  value: value[p],
                  key: p
                }
                const smatch = initScheme(subContext);
                if (smatch == 1) {
                  setPropertyScheme(context, p, selKey, subContext.scheme);
                  pmatch += smatch;
                }
              }
            }
            if (pmatch == 0) {
              for (const selKey of Object.keys(selectionList)) {
                const subContext = {
                  scheme: cloneDeep(selectionList[selKey]),
                  pcontext: context,
                  value: value[p],
                  key: p
                }
                const smatch = initScheme(subContext);
                if (smatch == 1) {
                  setPropertyScheme(context, p, selKey,subContext.scheme);
                  pmatch += smatch;
                  break;
                }
              }
            }
          }
          match += pmatch;
          count++;
        }
        break;
      case 'select':
        if (selectionList != undefined) {
          if (context.scheme.detectScheme != undefined) {
            const selKey = context.scheme.detectScheme(context, value);
            if (selKey != undefined && Object.keys(selectionList).includes(selKey)) {
              const subContext = {
                scheme: cloneDeep(selectionList[selKey]),
                pcontext: context,
                value
              }
              const smatch = initScheme(subContext);
              if (smatch == 1) {
                setSelectedScheme(context, selKey);
                match = smatch;
                count = 1;
              }
            }
          }
          if (match == 0) {
            for (const selKey of Object.keys(selectionList)) {
              const subContext = {
                scheme: cloneDeep(selectionList[selKey]),
                pcontext: context,
                value: value
              }
              const smatch = initScheme(subContext);
              if (smatch == 1) {
                setSelectedScheme(context, selKey);
                match = smatch;
                count = 1;
                break;
              }
            }
          }
        }
        break;
      case 'none':
        match = isEqual(value, context.scheme.default) ? 1 : 0;
        count = 1;
        break;
      case 'checkbox':
        match = (typeof value == 'boolean') ? 1 : 0;
        count = 1;
        break;
      case 'number':
        match = (typeof value == 'number') ? 1 : 0;
        count = 1;
        break;
      case 'color':
        match = FarfaOEValueCheck.isStringColor(value) ? 1 : 0;
        count = 1;
        break;
      case 'date':
      case 'datetime':
      case 'time':
        //todo differentiate between date , time and datetime
        match = FarfaOEValueCheck.isAnyDateTime(value) ? 1 : 0;
        count = 1;
        break;
      default:
        match = typeof value == 'string' ? 1 : 0;
        count = 1;
    }
    return (count != 0 ? match / count : 0);
  }

  export const checkScheme = (value: any, scheme: Scheme, baseScheme: Scheme, select?: boolean) => {

    let badcheckcount = 0;
    const check = (test: boolean) => {
      if (!test) badcheckcount++
    }
    const _checkScheme = (value: any, scheme: IntScheme, baseScheme: Scheme, select?: boolean) => {
      check(isMatch(scheme, baseScheme));
      switch (baseScheme.uibase) {
        case 'select':
          check(value != undefined ? intS(scheme)!.selectedKey != undefined : intS(scheme)!.selectedKey == undefined);
          check(value != undefined ? intS(scheme)!.selectedScheme != undefined : intS(scheme)!.selectedScheme == undefined);
          if(intS(scheme)?.selectedKey != undefined) {
            _checkScheme(value,intS(scheme)!.selectedScheme!,getSelectionList({scheme: baseScheme})[intS(scheme)!.selectedKey!]);
          }
          break;
        case 'object':
        case 'array':
          for(const p of Object.keys(value)) {
            const subScheme = scheme.properties?.[p];
            check(subScheme != undefined);
            let baseSubScheme = baseScheme.properties?.[p];
            if(baseSubScheme == undefined) {
              check(intS(subScheme)!.parentSelectedKey != undefined); 
              if(intS(subScheme)?.parentSelectedKey) {
                check(isSchemeSelectionKey({scheme},intS(subScheme)!.parentSelectedKey));
                baseSubScheme = getSelectionList({scheme: baseScheme})[intS(subScheme)?.parentSelectedKey!]
                check(intS(subScheme)!.ctime != undefined)
                check(intS(subScheme)!.optional == true)
                check(intS(subScheme)!.deletable == true)
              }
            }
            check(baseSubScheme != undefined);
            if(subScheme != undefined && baseSubScheme != undefined)
              _checkScheme(value[p],subScheme,baseSubScheme);
          }
          break;
      }
    }
    _checkScheme(value,scheme,baseScheme);
    return badcheckcount;
}

  export const getProperties = (context: Context) => {
    let properties: (string | number)[] = [];
    const value = context.scheme?.transform?.forward ?
      context.scheme?.transform?.forward(context.value) :
      context.value;
    const schemeKeys = Object.keys(context.scheme?.properties ?? {});
    for (const sp of schemeKeys) {
      if ((value?.[sp] != undefined) || !intS(context.scheme?.properties?.[sp])?.optional) {
        properties.push(sp);
      }
    }
    properties = (context.scheme?.uibase === 'object') ? properties.sort((a, b) => {
      const a_ct = intS(context.scheme?.properties?.[a])?.ctime ?? 0;
      const b_ct = intS(context.scheme?.properties?.[b])?.ctime ?? 0;
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

  export const convert = (value: any, scheme: Scheme): any => {
    if (!value) {
      return value;
    }
    if (['number', 'range'].includes(scheme.uibase)) return (Number(value));
    if (['checkbox'].includes(scheme.uibase)) return (Boolean(value));
    if (['text', 'password', 'color', 'date', 'datetime', 'time', 'email', 'image', 'url'].includes(scheme.uibase)) return (String(value));
  }

  const editUpdate = (context: Context) => {
    if (context.editUpdate && context.pcontext && context.key !== undefined) {
      if (!context.pcontext.value) context.pcontext.value = {};
      if (!context.pcontext.scheme) context.pcontext.scheme = { uibase: 'object', properties: {} };
      context.pcontext.value[context.key] = convert(
        context.pcontext.value[context.key],
        context.pcontext.scheme.properties![context.key]
      );
      context.editUpdate();
    }
  }

  export const getOptionalPropertyList = (context: Context): string[] => {
    if (!(context.scheme?.uibase == 'object') || !context.scheme?.properties) {
      return [];
    }
    const isel = Object.keys(context.scheme?.properties);
    const rsel: string[] = [];
    isel.forEach((s) => {
      const value = context.value == undefined ?
        undefined
        : context.scheme?.transform?.forward ?
          context.scheme?.transform?.forward(context.value)
          : context.value;
      if (!value?.hasOwnProperty(s)) {
        rsel.push(s);
      }
    });
    return rsel;
  }

  const isSchemeSelectionKey = (context?: Context, key?: string): boolean => {
    const keys = getSelectionKeys(context);
    return (keys && key) ? keys.includes(key) : false;
  }

  export const addProperty = (context: Context, newProperty: { property: string | number, schemeKey: string }): Context | undefined => {
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
      (isSchemeSelectionKey(context, newProperty.schemeKey) ||
        getOptionalPropertyList(context).includes(String(newProperty.property)))
    ) {
      if (!context.scheme.properties)
        context.scheme.properties = {};
      if (context.scheme.properties[newProperty.property] === undefined) {
        setPropertyScheme(context, newProperty.property, newProperty.schemeKey);
      }
      switch (context.scheme.uibase) {
        case 'object': {
          context.value[newProperty.property] =
            initValue({
              value: undefined,
              scheme: context.scheme.properties?.[newProperty.property]
            })
        }
          break;
        case 'array': {
          context.value.splice(newProperty.property, 0,
            initValue({
              value: undefined,
              scheme: context.scheme.properties?.[newProperty.property]
            }));
        }
          break;
      }
      const subContext = getSubContext(context, newProperty.property);
      if (subContext) editUpdate(subContext);
      return subContext;
    }
    return undefined;
  }

  export const canReset = (context: Context): boolean => {
    return context.scheme?.default
      || (context.scheme?.defaultSelectionKey && (context.scheme?.uibase == 'select'))
      ;
  }

  export const reset = (context: Context) => {
    if (context.scheme?.default) {
      context.value = context.scheme?.default;
    }
    if (context.scheme?.defaultSelectionKey) {
      select(context, context.scheme?.defaultSelectionKey);
    }
    if (context.editUpdate) {
      context.editUpdate();
    }
    else if (context.pcontext?.editUpdate) {
      context.pcontext?.editUpdate();
    }
  }

  export const canDeleteProperty = (context: Context): boolean => {
    if (context.pcontext?.scheme?.uibase === 'object') {
      if ((context.scheme?.optional || intS(context.scheme)?.deletable) && context.key !== undefined) {
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
      if ((context.scheme?.optional || intS(context.scheme)?.deletable) && context.key !== undefined) {
        delete context?.pcontext?.value[context.key];
        context.value = undefined;
      }
      if (intS(context.scheme)?.deletable && context.key !== undefined) {
        delete context.pcontext?.scheme?.properties?.[context.key];
      }
      if (context.scheme && (!context.scheme.optional && !intS(context.scheme)?.deletable) && context.key !== undefined) {
        context.value = initValue({ value: undefined, scheme: context.scheme });
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

  export const getInputAttributes = (context: Context): { [key: string]: any } | undefined => {
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

  export const getSubContext = (context: Context, p?: string | number): Context | undefined => {
    const dynamic = (p == undefined) ? context.scheme?.dynamic : context.scheme?.properties?.[p].dynamic;
    if (typeof dynamic == 'function') {
      const subContext = {
        scheme: cloneDeep(dynamic(context)),
        value: (p == undefined) ? context.value : context.value?.[p],
        pcontext: context,
        key: p,
      }
      return subContext;
    }
    const transform = context.scheme?.transform;
    const iContext = (context as IntContext);
    if ((transform != undefined) && (iContext.fwdValue == undefined)) {
      iContext.fwdValue = transform.forward(context.value);
    }

    if (context.scheme?.uibase == 'none') return undefined;
    if (['object', 'array', 'custom', 'angular'].includes(context.scheme?.uibase ?? '')) {
      if (p === undefined) {
        return undefined;
      }
      const subContext = {
        scheme: context.scheme?.properties?.[p],
        value: iContext.fwdValue ? iContext.fwdValue[p] : context.value[p],
        pcontext: context,
        key: p,
        editUpdate: () => {
          if (subContext.key !== undefined) {
            if (subContext.value !== undefined)
              context.value[subContext.key] = transform?.backward ? transform.backward(subContext.value) : subContext.value;
            else if (subContext.scheme?.optional)
              delete context.value[subContext.key];
          }
          delete iContext.fwdValue;
          context.editUpdate?.();
        },
        contextChange: context.contextChange,
        onClick: () => {

        }
      }
      return subContext;
    }
    else if ('select' == context.scheme?.uibase) {
      if (intS(context.scheme)?.selectedScheme) {
        const transform = intS(context.scheme)!.selectedScheme!.transform;
        const subContext = {
          scheme: intS(context.scheme)!.selectedScheme,
          pcontext: context,
          value: iContext.fwdValue ? iContext.fwdValue : context.value,
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
    return context.scheme?.label ?? context.key ?? intS(context.pcontext?.scheme)?.selectedKey;
  }

  export const getDescription = (context: Context): string | undefined => {
    if (typeof context.scheme?.description == 'function') {
      return context.scheme.description(context);
    }
    else {
      return context.scheme?.description;
    }
  }
  export const loadContext = (context: Context, stream: ReadableStream) => {

  }
  /**
   * @function storeContext 
   * @param context the context (a value and a scheme)
   * @param stream the output stream
   * @param chimere an internal object construct mixing value and parts of scheme
   * @description Serialize a context into a stream for transmission or storage
   */
  export const storeContext = (context: Context, stream?: WritableStream) => {
    const chimere = _toChimere(context);
    return chimere;
  }
  const cc = {
    key: 'key',
    deletable: 'deletable',
    ctime: 'ctime',
    selectedKey: 'selectedKey',
    parentSelectedKey: 'parentSelectedKey',
    scheme: 'scheme',
    sub: 'sub',
    selected: 'selected',
    value: 'value',
  }
  /**
   * @function toChimere
   * @param {Context} context 
   * @returns {Record<string | number, any>} chimere 
   * @description Returns a <b>mixing</b> (chimere) of scheme and value for streaming data (transmission/ storage) and later reconstructing a context from the streamed (received/ stored) data
   */
  export const toChimere = (context: Context): Record<string | number, any> => {
    return _toChimere(context) ?? {};
  }
  const _toChimere = (context: Context, forwarded?: boolean): Record<string | number, any> | null => {
    let chimere: Record<string | number, any> = {};
    const nFwd = (forwarded == true) || (context.scheme?.transform != undefined);
    if (context.key != undefined) chimere[cc.key] = context.key;
    if (context.scheme) {
      const scheme: Record<string, any> = context.scheme;
      const sScheme: Record<string, any> = {};
      for (const key of [cc.deletable, cc.ctime, cc.selectedKey, cc.parentSelectedKey]) {
        if (scheme[key] !== undefined) {
          sScheme[key] = scheme[key];
        }
      }
      if (Object.keys(sScheme).length > 0) chimere[cc.scheme] = sScheme;
    }

    switch (context.scheme?.uibase) {
      case 'object': {
        const sub: any[] = [];
        const keys = getProperties(context);
        for (const key of keys) {
          const subContext = getSubContext(context, key);
          if (subContext) {
            const rchimere = _toChimere(subContext, nFwd);
            if (rchimere != null) sub.push(rchimere);
          }
        }
        if (sub.length > 0) chimere[cc.sub] = sub;
      }
        break;
      case 'array': {
        const sub: any[] = [];
        for (let i = 0; i < context.value.length; i++) {
          const subContext = getSubContext(context, i);
          if (subContext) {
            const rchimere = _toChimere(subContext, nFwd);
            if (rchimere != null) sub.push(rchimere);
          }
        }
        if (sub.length > 0) chimere[cc.sub] = sub;
      }
        break;
      case 'select':
        const subContext = getSubContext(context, intS(context.scheme)?.selectedKey);
        if (subContext) {
          const rchimere = _toChimere(subContext, nFwd);
          if (rchimere != null) chimere[cc.selected] = rchimere;
        }
        break;
      default:
        if (!forwarded)
          chimere[cc.value] = context.value;
        break;
    }
    if (context.scheme!.transform && !forwarded) {
      chimere[cc.value] = context.value;
    }
    const chimereKeys = Object.keys(chimere);
    return chimere;
  }
  export const fromChimere = (chimere: Record<string | number, any>, refScheme: Scheme): Context => {
    const context: Context = {
      scheme: cloneDeep(refScheme)
    }
    _fromChimere(context, chimere);
    return context;
  }

  const _fromChimere = (context: Context, chimere: Record<string | number, any>): void => {
    if (chimere['key'] != undefined) context.key = chimere['key'];
    if (chimere['value'] != undefined) context.value = chimere['value'];
    if ((context.key) && (context.scheme == undefined)) context.scheme = context.pcontext?.scheme?.properties?.[context.key];
    if ((intS(context.pcontext?.scheme)?.selectedScheme) && (context.scheme == undefined)) context.scheme = cloneDeep(intS(context.pcontext?.scheme)?.selectedScheme);
    if (chimere['scheme'] != undefined) {
      if ((context.scheme == undefined) && (chimere['scheme']['parentSelectedKey'] != undefined)) {
        context.scheme = cloneDeep(ObjectEditor.getSelectionList(context.pcontext)[chimere['scheme']['parentSelectedKey']]);
      }
      if (chimere['scheme']['deletable'] != undefined) intS(context.scheme)!.deletable = chimere['scheme']['deletable'];
      if (chimere['scheme']['ctime'] != undefined) intS(context.scheme)!.ctime = chimere['scheme']['ctime'];
      if (chimere['scheme']['selectedKey'] != undefined) intS(context.scheme)!.selectedKey = chimere['scheme']['selectedKey'];
      if (chimere['scheme']['parentSelectedKey'] != undefined) intS(context.scheme)!.parentSelectedKey = chimere['scheme']['parentSelectedKey'];
      if (intS(context.scheme)?.deletable == true)
        context.scheme!.optional = true;
    }
    if (intS(context.scheme)?.selectedKey != undefined) {
      setSelectedScheme(context, intS(context.scheme)!.selectedKey!);
    }
    if (context.scheme?.transform == undefined) {
      if (context.scheme?.uibase == 'object') context.value = {};
      if (context.scheme?.uibase == 'array') context.value = [];
    }
    const props = chimere['sub'];
    for (const prop of props ?? []) {
      const nContext: Context = {
        pcontext: context,
      }
      _fromChimere(nContext, prop);
      if (nContext.key != undefined) {
        if (context.scheme?.transform == undefined) {
          context.value[nContext.key] = nContext.value;
        }
        if (context.scheme && nContext.scheme) {
          if (context.scheme.properties == undefined) {
            context.scheme.properties = {};
          }
          context.scheme.properties![nContext.key] = nContext.scheme;
        }
      }
    }
    const selected = chimere['selected'];
    if (context.scheme!.uibase == 'select' && selected != undefined) {
      const nContext: Context = {
        pcontext: context,
      }
      _fromChimere(nContext, selected);
      if (context.value == undefined)
        context.value = nContext.value;
    }
  }
  /**
   * find all differences between 2 contexes (check toChimere/ fromChimere)
   * @param context1 the initial context
   * @param context2 the context resulting from fromChimere
   */
  export const compare = (context1: Context, context2: Context) => {
    return deepDiffMapper().map(context1, context2);
  }
  const deepDiffMapper = () => {
    // https://stackoverflow.com/questions/8572826/generic-deep-diff-between-two-objects
    return {
      VALUE_CREATED: 'created',
      VALUE_UPDATED: 'updated',
      VALUE_DELETED: 'deleted',
      VALUE_UNCHANGED: 'unchanged',
      map: function (obj1: any, obj2: any) {
        if (this.isFunction(obj1) || this.isFunction(obj2)) {
          throw 'Invalid argument. Function given, object expected.';
        }
        if (this.isValue(obj1) || this.isValue(obj2)) {
          const type = this.compareValues(obj1, obj2);
          if (type != this.VALUE_UNCHANGED) {
            return {
              type,
              data: obj1 === undefined ? obj2 : obj1
            };
          }
          else return null;
        }

        var diff: any = {};
        const obj1_keys: (string | number)[] = [];
        for (var key in obj1) {
          if (this.isFunction(obj1[key])) {
            continue;
          }
          obj1_keys.push(key);
          var value2 = undefined;
          if (obj2[key] !== undefined) {
            value2 = obj2[key];
          }
          const sdiff = this.map(obj1[key], value2);
          if (sdiff != null)
            diff[key] = sdiff;
        }
        for (var key in obj2) {
          if (this.isFunction(obj2[key]) || obj1_keys.includes(key)) {
            continue;
          }

          const sdiff = this.map(obj1[key], value2);
          if (sdiff != null)
            diff[key] = sdiff;
        }

        return Object.keys(diff).length > 0 ? diff : null;

      },
      compareValues: function (value1: any, value2: any) {
        if (value1 === value2) {
          return this.VALUE_UNCHANGED;
        }
        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
          return this.VALUE_UNCHANGED;
        }
        if (value1 === undefined) {
          return this.VALUE_CREATED;
        }
        if (value2 === undefined) {
          return this.VALUE_DELETED;
        }
        return this.VALUE_UPDATED;
      },
      isFunction: function (x: any) {
        return Object.prototype.toString.call(x) === '[object Function]';
      },
      isArray: function (x: any) {
        return Object.prototype.toString.call(x) === '[object Array]';
      },
      isDate: function (x: any) {
        return Object.prototype.toString.call(x) === '[object Date]';
      },
      isObject: function (x: any) {
        return Object.prototype.toString.call(x) === '[object Object]';
      },
      isValue: function (x: any) {
        return !this.isObject(x) && !this.isArray(x);
      }
    }
  };
}
