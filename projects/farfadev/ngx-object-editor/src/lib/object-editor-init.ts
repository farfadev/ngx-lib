import { cloneDeep, get, isEqual, isMatch } from "lodash-es";
import { Context, intS, Scheme, IntScheme, Signal, IntContext, BaseContext, UIBase, SelectionList, UIEffects } from "./object-editor-decl";
import { getOptional, getPropertyScheme, getRunScheme, getSelectionKeys, getSelectionList, isArray, isOptional, isSchemeSelectionKey } from './object-editor-get';
import { setPropertyScheme, setSelectedScheme } from "./object-editor"
import { FarfaOEValueCheck } from "./utils/verifyvalues";
import { fromChimere, toChimere } from "./object-editor-chimere";
import { Subject, Subscription } from "rxjs";

const isUptodate = (context?: Context): boolean => {
  if (context == undefined) return false;
  if (context.parent == undefined) return true;
  if ((context.key != undefined) && (context.parent as IntContext).subContexts?.[context.key] === context)
    return true;
  return ((context.parent as IntContext).subContext == context);
}

const signalsMap = new Map<Signal, Set<Context>>();
// TODO detect loops
export const initSignalling = (context: Context) => {
  if (!isUptodate(context)) return;
  if (context.scheme?.onSignals != undefined) {
    for (const ss of context.scheme?.onSignals) {
      for (const s of ss.signals) {
        const scontexts = signalsMap.get(s) ?? new Set<Context>();
        scontexts.add(context);
        signalsMap.set(s, scontexts);
      }
    }
  }
  if ((context as IntContext).sigInit != true) {
    (context as IntContext).sigInit = true;
    context.subscribe?.((o: Record<string | number, any>) => {
      if (!isUptodate(context)) return;
      fireSignals(context);
    });
  }
}

const fireSignals = (sourceContext: Context) => {
  if (sourceContext.scheme?.fireSignals != undefined) {
    const signals = sourceContext.scheme?.fireSignals(sourceContext);
    for (const signal of signals) {
      const targetContexts = signalsMap.get(signal.signal);
      if (targetContexts != undefined) {
        for (const targetContext of targetContexts) {
          if (targetContext.scheme?.onSignals) {
            for (const ssg of targetContext.scheme?.onSignals) {
              if (ssg.signals.includes(signal.signal)) {
                const actions = ssg.call(targetContext, sourceContext, signal);
              }
            }
          }
        }
      }
      //todo  + selfSignal if target context equal source context
    }
  }
}

const releaseSignalling = (context: Context) => {
  if (context.scheme?.onSignals != undefined) {
    for (const ss of context.scheme?.onSignals) {
      for (const s of ss.signals) {
        const scontexts = signalsMap.get(s) ?? new Set<Context>();
        scontexts.delete(context);
      }
    }
  }
}

export const releaseContext = (context: Context | undefined) => {

  const iContext = context as IntContext;

  if (!context || iContext.released) return;

  iContext.released = true;

  if ((context.parent as IntContext)?.subContext == context) {
    (context.parent as IntContext).subContext = undefined;
  }

  releaseContext(iContext.subContext);

  for (const subContext of Object.values(iContext.subContexts ?? {})) {
    releaseContext(subContext);
  }

  releaseSignalling(context);
  iContext.updateObservable?.complete();
  delete iContext.init;
  delete iContext.sigInit;
  delete iContext.updateObservable;
  delete iContext.subContext;
  delete iContext.subContexts;
  context.key = undefined;
  context.value = undefined;
  context.scheme = { uibase: 'none' };
}

export const getUIValue = (context: Context): any => {
  let value;
  const iContext = context as IntContext;
  if (context.scheme?.transform != undefined) {
    if (iContext.fwdValue != undefined) {
      return iContext.fwdValue;
    }
    iContext.fwdValue = context.scheme.transform.forward(context.value);
    return iContext.fwdValue;
  }
  else {
    iContext.fwdValue = undefined;
    return context.value;
  }
}

export const setUIValue = (context: Context, newValue: any, scheme?: Scheme): Context => {
  let value;
  const iContext = context as IntContext;
  let rContext = context;

  if (scheme) {
    rContext = reCreateContext(context, newValue, scheme);
  }
  else if (context.scheme?.transform != undefined) {
    context.value = context.scheme.transform.backward(newValue);
    iContext.fwdValue = newValue;
  }
  else {
    context.value = newValue;
    iContext.fwdValue = undefined;
  }
  (rContext as IntContext).updateObservable?.next({ value: newValue, scheme });
  return rContext;
}

export const editUpdate = (subContext: Context) => {
  if (subContext.parent == undefined) return;
  const parentContext = subContext.parent;
  const iContext = (parentContext as IntContext);
  const transform = parentContext?.scheme?.transform;
  if (subContext.key !== undefined) {
    //    if (subContext.value !== undefined) {
    if (transform == undefined || subContext.value == undefined)
      parentContext.value[subContext.key] = subContext.value;
    else {
      iContext.fwdValue[subContext.key] = subContext.value;
      parentContext.value = transform?.backward(iContext.fwdValue);
    }
  }
  else if (iContext.scheme?.uibase == 'select') {
    if (subContext.value == undefined || transform == undefined)
      iContext.value = subContext.value;
    else {
      iContext.value = transform?.backward(subContext.value);
    }
  }
  (parentContext as IntContext).updateObservable?.next({ subContext });
}

const reCreateContext = (context: Context, value: any, scheme: Scheme): Context => {
  const newContext = createContext(scheme, value);
  const ipContext = context.parent as IntContext;
  ipContext.subContext = ipContext.subContext == context ? newContext : undefined;
  for (const key of Object.keys(ipContext.subContexts ?? {})) {
    if (ipContext.subContexts?.[key] == context) {
      ipContext.subContexts[key] = newContext;
    }
  }
  newContext.parent = context.parent;
  releaseContext(context);
  return newContext;
}

const initSchemeAndValue = (context: BaseContext): void => {

  const iContext = (context as IntContext);

  if (!context.scheme) {
    context.scheme = { uibase: 'object' };
  }
  context.scheme = getRunScheme(context.scheme, context.parent) ?? { uibase: 'none' };
  const result = initScheme(context);
  context.value = initValue(context.value, context.scheme);

  const transform = context.scheme?.transform;
  if ((transform != undefined) && (iContext.fwdValue == undefined)) {
    iContext.fwdValue = transform.forward(context.value);
  }
}

export const initContextInternals = (context: BaseContext) => {

  const iContext = (context as IntContext);

  if (iContext.init == true) return;

  iContext.updateObservable = new Subject<Record<string | number, any>>();
  iContext.subscribe = ((f: (value: Record<string | number, any>) => void) => iContext.updateObservable!.subscribe(f)).bind(iContext);
  iContext.unsubscribe = (subscription: Subscription | undefined) => subscription?.unsubscribe();
  iContext.subscribe((o: Record<string | number, any>) => {
    editUpdate(iContext);
  });

  initUserFunctions(iContext);
  initSignalling(iContext);
}

export const createContext = (scheme: Scheme, value?: any): Context => {
  const context: BaseContext = { scheme, value };
  initContext(context);
  return context as Context;
}

const createSubContext = (context: IntContext, scheme: Scheme | undefined, value: any, p?: string | number): Context | undefined => {
  if (scheme == undefined) return undefined;
  const subContext = createContext(scheme, value);
  subContext.parent = context;
  if (p == undefined) (context as IntContext).subContext = subContext;
  else {
    if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
    (context as IntContext).subContexts![p] = subContext;
    subContext.key = p;
  }
  initContext(subContext);
  (subContext as IntContext).updateObservable?.subscribe((o: Record<string | number, any>) => {
    (context as IntContext).updateObservable?.next({ subContext, o });
  })
  return subContext;
}

const initContext = (context: BaseContext): void => {

  if ((context as IntContext).init == true) return;

  initContextInternals(context);
  initSchemeAndValue(context);

  (context as IntContext).init = true;

}

const initValue = (value: any, scheme?: Scheme): any => {
  if (!scheme) {
    return value;
  }
  if (value == undefined && scheme.default != undefined) {
    value = cloneDeep(scheme.default);
    initScheme({ value, scheme });
  }
  if (scheme.transform != undefined) {
    value = scheme.transform.forward(value);
  }
  switch (scheme.uibase) {
    case 'object':
      if (value == undefined) value = {};
      const keys = Object.keys(scheme?.properties ?? {});
      for (const key of keys) {
        if (!(isOptional({ scheme, value }, key) && getPropertyScheme({ scheme, value }, key))) {
          value![key] = initValue(value[key], getPropertyScheme({ scheme, value }, key));
        }
      }
      break;
    case 'array':
      if (value == undefined) value = [];
      if (!(value instanceof Array)) {
        throw Error('Invalid value type, expecting Array');
      }
      for (let i = 0; i < value.length; i++) {
        value[i] = initValue(value[i], getPropertyScheme({ value, scheme }, i))
      }
      if (scheme.length?.min != undefined) {
        let lastKey;
        const keys = Object.keys(scheme.properties ?? {});
        for (let i = 0; i < scheme.length.min; i++) {
          if (scheme.properties?.[i]) {
            lastKey = i;
          }
          if (lastKey && i > value.length && getPropertyScheme({ value, scheme }, lastKey))
            value.push(initValue(value[i], getPropertyScheme({ value, scheme }, lastKey)));
        }
      }
      break;
    case 'select': {
      value = initValue(value, intS(scheme)?.selectedScheme as Scheme | undefined);
    }
      break;
    case 'boolean':
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

const initScheme = (context: BaseContext): number => {
  let match: number = 0;
  let count = 0;
  const forward = context.scheme?.transform?.forward;
  const value = (typeof forward == 'function') ? forward(context.value) : context.value;
  context.scheme = getRunScheme(context.scheme, context.parent) ?? { uibase: 'none' };

  if (value == undefined) return 0;

  const selectionList = getSelectionList(context);

  switch (context.scheme?.uibase) {
    case 'object':
    case 'array':
      for (const p of Object.keys(value)) {
        let pmatch = 0;
        if (context.scheme.properties?.[p] != undefined) {
          const subContext: BaseContext = {
            scheme: getPropertyScheme(context, p),
            parent: context,
            value: value[p],
            key: p
          }
          pmatch = initScheme(subContext);
          if (pmatch == 1) {
            context.scheme.properties[p] = subContext.scheme!;
          }
        }
        if (pmatch == 0 && selectionList != undefined) {
          if (context.scheme.detectScheme != undefined) {
            const selKey = context.scheme.detectScheme(context, value);
            if (selKey != undefined && Object.keys(selectionList).includes(selKey)) {
              const subContext: BaseContext = {
                scheme: selectionList[selKey],
                parent: context,
                value: value[p],
                key: selKey
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
              const subContext: BaseContext = {
                scheme: getRunScheme(selectionList[selKey], context),
                parent: context,
                value: value[p],
                key: selKey
              }
              const smatch = initScheme(subContext);
              if (smatch == 1) {
                setPropertyScheme(context, p, selKey, subContext.scheme);
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
            const subContext: BaseContext = {
              scheme: getRunScheme(selectionList[selKey], context),
              parent: context,
              value
            }
            const smatch = initScheme(subContext);
            if (smatch == 1) {
              setSelectedScheme(context, selKey, subContext.scheme);
              match = smatch;
              count = 1;
            }
          }
        }
        if (match == 0) {
          for (const selKey of Object.keys(selectionList)) {
            const subContext: BaseContext = {
              scheme: getRunScheme(selectionList[selKey], context),
              parent: context,
              value: value
            }
            const smatch = initScheme(subContext);
            if (smatch == 1) {
              setSelectedScheme(context, selKey, subContext.scheme);
              match = smatch;
              count = 1;
              break;
            }
          }
        }
      }
      break;
    case 'none':
      match = (context.scheme.default != undefined) ? (isEqual(value, context.scheme.default) ? 1 : 0) : 1;
      count = 1;
      break;
    case 'boolean':
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
        if (intS(scheme)?.selectedKey != undefined) {
          _checkScheme(value, intS(scheme)!.selectedScheme!, getSelectionList({ scheme: baseScheme })[intS(scheme)!.selectedKey!]);
        }
        break;
      case 'object':
      case 'array':
        for (const p of Object.keys(value)) {
          const subScheme = getPropertyScheme({ value, scheme }, p);
          check(subScheme != undefined);
          let baseSubScheme = getPropertyScheme({ value, scheme: baseScheme }, p);
          if (baseSubScheme == undefined) {
            check(intS(subScheme)!.parentSelectedKey != undefined);
            if (intS(subScheme)?.parentSelectedKey != undefined) {
              check(isSchemeSelectionKey({ scheme }, intS(subScheme)!.parentSelectedKey));
              baseSubScheme = getSelectionList({ scheme: baseScheme })[intS(subScheme)?.parentSelectedKey!]
              check(intS(subScheme)!.ctime != undefined)
              check(getOptional({ scheme: subScheme }) == true)
              check(intS(subScheme)!.deletable == true)
            }
          }
          check(baseSubScheme != undefined);
          if (subScheme != undefined && baseSubScheme != undefined)
            _checkScheme(value[p], subScheme, baseSubScheme);
        }
        break;
    }
  }
  _checkScheme(value, scheme, baseScheme);
  return badcheckcount;
}

const getNumber = (arg0: any): number => {
  return Number(arg0);
}

const swapArrayItems = (context: IntContext, index1: number, index2: number): boolean => {
  const value = getUIValue(context);
  if (index1 < 0 || index2 < 0 || index1 >= value.length || index2 >= value.length || !context.scheme?.properties) return false;
  const v1 = value[index1];
  const v2 = value[index2];
  value[index2] = v1;
  value[index1] = v2;
  const s1 = context.scheme.properties[index1];
  const s2 = context.scheme.properties[index2];
  context.scheme.properties[index1] = s2;
  context.scheme.properties[index2] = s1;

  // TODO swap subcontexes instead of deleting them
  releaseContext(context.subContexts?.[index1]);
  releaseContext(context.subContexts?.[index2]);
  delete (context.subContexts?.[index1]);
  delete (context.subContexts?.[index2]);

  setUIValue(context, value);

  return true;
}


const initUserFunctions = (context: IntContext) => {
  context.setReadOnly = (flag: boolean, key?: string | number) => {
    if (key != undefined) {
      const subContext = context.subContexts?.[key];
      if (subContext != undefined) {
        if (flag) subContext.readonly = true;
        else delete subContext.readonly;
        subContext.updateObservable?.next({ readonly: subContext.readonly });
      }
    }
    else {
      if (flag) context.readonly = true;
      else delete context.readonly;
      context.updateObservable?.next({ readonly: context.readonly });
    }
  }

  context.getReadOnly = (key?: string | number): boolean | undefined => {
    if (key != undefined) {
      const subContext = context.subContexts?.[key];
      if (subContext != undefined) {
        return subContext.scheme?.readonly === true ? true : (subContext.readonly ?? false);
      }
      return undefined;
    }
    else {
      return context.scheme?.readonly === true ? true : context.readonly ?? false;
    }
  }

  context.setDisplay = (flag: 'on' | 'off', key?: string | number) => {
    if (key != undefined) {
      const subContext = context.subContexts?.[key];
      if (subContext != undefined) {
        subContext.display = flag;
        subContext.updateObservable?.next({ display: subContext.display });
      }
    }
    else {
      context.display = flag;
      context.updateObservable?.next({ display: context.display });
    }
  }
  context.getDisplay = (key?: string | number) => {
    if (key != undefined) {
      const subContext = context.subContexts?.[key];
      if (subContext != undefined) {
        return subContext.display;
      }
      return undefined;
    }
    else {
      return context.display;
    }
  }
  context.setUIValue = (value: any, scheme?: Scheme): Context => {
    return setUIValue(context, value, scheme);
  }
  context.getUIValue = () => {
    return getUIValue(context);
  }
  context.setChimere = (chimere: Record<string | number, any>, scheme?: Scheme): Context => {
    const base = fromChimere(chimere, scheme ?? context.scheme!);
    return setUIValue(context, base.value, scheme);
  }
  context.getChimere = (): Record<string | number, any> => {
    const value = getUIValue(context);
    return toChimere(context);
  }

  context.getOptional = (key?: string | number): boolean | 'signal' | undefined => {
    return getOptional(context, key);
  }

  context.isOptional = (key?: string | number): boolean => {
    const opt = getOptional(context, key);
    return opt == true || opt == 'signal';
  }

  context.isArray = () => {
    return context.scheme?.uibase == 'array'
  }

  context.isObject = () => {
    return context.scheme?.uibase == 'object'
  }

  context.isSelect = () => {
    return context.scheme?.uibase == 'select'
  }
  context.isReadOnly = () => {
    const readOnly = context.scheme?.readonly;
    const contextOpt = (context as IntContext).readonly ?? false;
    if (typeof readOnly == 'function') {
      return readOnly(context) || contextOpt;
    }
    else {
      return (readOnly ?? false) || contextOpt;
    }
  }
  context.getUIBase = (): UIBase | undefined => {
    return context?.scheme?.uibase;
  }

  context.getSelectionKey = (context?: Context): string | undefined => {
    return intS(context?.scheme)?.selectedKey;
  }

  context.getSelectionLabel = (): string | undefined => {
    const selectionLabel = context.getUIEffects()?.selectLabel;
    if (typeof selectionLabel == 'function') {
      return selectionLabel(context);
    }
    else {
      return selectionLabel;
    }
  }

  context.getStyle = () => {
    const style = context.getUIEffects()?.style;
    if (typeof style == 'function') {
      return style(context);
    }
    else {
      return style;
    }
  }

  context.getStyleClass = () => {
    const styleClass = context.getUIEffects()?.styleClass;
    if (typeof styleClass == 'function') {
      return styleClass(context);
    }
    else {
      return styleClass;
    }
  }

  context.getInnerStyle = () => {
    const innerStyle = context.getUIEffects()?.innerStyle;
    if (typeof innerStyle == 'function') {
      return innerStyle(context);
    }
    else {
      return innerStyle;
    }
  }

  context.getInnerStyleClass = () => {
    const innerStyleClass = context.getUIEffects()?.innerStyleClass;
    if (typeof innerStyleClass == 'function') {
      return innerStyleClass(context);
    }
    else {
      return innerStyleClass;
    }
  }

  context.getDesignToken = () => {
    const designToken = context.getUIEffects()?.designToken;
    if (typeof designToken == 'function') {
      return designToken(context);
    }
    else {
      return designToken;
    }
  }

  context.getInputAttributes = (): { [key: string]: any } | undefined => {
    const inputAttributes = context.getUIEffects()?.inputAttributes;
    if (typeof inputAttributes == 'function') {
      return inputAttributes(context);
    }
    else {
      return inputAttributes;
    }
  }

  context.getMaskOptions = (): Record<string, unknown> | undefined => {
    if (typeof context.scheme?.maskOptions == 'function') {
      return context.scheme.maskOptions(context);
    }
    else {
      return context.scheme?.maskOptions;
    }
  }

  context.getUIEffects = (): UIEffects | undefined => {
    if (typeof context.scheme?.uiEffects == 'function') {
      return context.scheme.uiEffects(context);
    }
    else {
      return context.scheme?.uiEffects;
    }
  }

  context.getLabel = (): string | number | undefined => {
    return context.scheme?.label ?? context.key ?? intS(context.parent?.scheme)?.selectedKey;
  }

  context.getDescription = (): string | undefined => {
    if (typeof context.scheme?.description == 'function') {
      return context.scheme.description(context);
    }
    else {
      return context.scheme?.description;
    }
  }

  context.getPropertyScheme = (key?: number | string): Scheme | undefined => {
    getPropertyScheme(context, key);
    if ((context?.scheme == undefined) || (key == undefined)) return undefined;
    return getRunScheme(context.scheme.properties?.[key], context);
  }


  context.getOptionalPropertyList = (mode?: 'ui'): string[] => {
    if (!(context.scheme?.uibase == 'object') || !context.scheme?.properties) {
      return [];
    }
    const isel = Object.keys(context.scheme?.properties);
    const rsel: string[] = [];
    const value = context.value == undefined ?
      undefined
      : context.scheme?.transform?.forward ?
        context.scheme?.transform?.forward(context.value)
        : context.value;
    for (const s of isel) {
      if (!value?.hasOwnProperty(s) && (!(getOptional(context, s) == 'signal') || mode != 'ui')) {
        rsel.push(s);
      }
    };
    return rsel;
  }

  context.getSelectionList = (p?: string | number): SelectionList<any, any> => {
    return getSelectionList(context, p);
  }

  context.getSelectionKeys = (p?: string | number): string[] => {
    return getSelectionKeys(context, p);
  }

  context.getProperties = () => {
    let properties: (string | number)[] = [];
    const value = context.scheme?.transform?.forward ?
      context.scheme?.transform?.forward(context.value) :
      context.value;
    const schemeKeys = Object.keys(context.scheme?.properties ?? {});
    for (const sp of schemeKeys) {
      if ((typeof value == 'object' && value.hasOwnProperty(sp)) || !isOptional(context, sp)) {
        properties.push(sp);
      }
    }
    properties = (context.scheme?.uibase === 'object') ? properties.sort((a, b) => {
      const a_ct = intS(getPropertyScheme(context, a))?.ctime ?? 0;
      const b_ct = intS(getPropertyScheme(context, b))?.ctime ?? 0;
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

  context.select = (key?: string): BaseContext | undefined => {
    if (key === undefined) {
      const keys = context.getSelectionKeys();
      if (context.scheme?.defaultSelectionKey != undefined && keys?.includes(context.scheme?.defaultSelectionKey)) {
        key = context.scheme?.defaultSelectionKey;
      }
      if (key === undefined) {
        key = keys?.[0];
      }
    }

    if (key) setSelectedScheme(context, key);

    context.value = initValue(undefined, intS(context.scheme)!.selectedScheme!);

    (context as IntContext).updateObservable?.next({ value: context.value, scheme: context.scheme });
    return context.getSubContext();
  }

  context.getSubContext = (p?: string | number): Context | undefined => {

    const iContext = (context as IntContext);

    if (p != undefined && (iContext.subContexts?.[p] != undefined)) {
      return iContext.subContexts?.[p];
    }
    else if (iContext.subContext != undefined) {
      return iContext.subContext;
    }

    if (context.scheme?.uibase == 'none') return undefined;

    if (['object', 'array', 'custom', 'angular'].includes(context.scheme?.uibase ?? '')) {
      if (p === undefined) {
        return undefined;
      }
      let subScheme: Scheme | undefined = getPropertyScheme(context, p);
      if(! subScheme && ['custom', 'angular'].includes(context.scheme?.uibase ?? '')) {
         subScheme = { uibase: 'none' };

      }
      if (subScheme == undefined) return undefined;
      const subContext = createSubContext(
        iContext,
        subScheme,
        iContext.fwdValue ? iContext.fwdValue[p] : context.value[p],
        p
      );
      if (subContext == undefined) return undefined;
      if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
      (context as IntContext).subContexts![p] = subContext;
      (subContext as IntContext).updateObservable?.subscribe((o: Record<string | number, any>) => {
        (context as IntContext).updateObservable?.next({ subContext, o });
      });
      return subContext;
    }
    else if ('select' == context.scheme?.uibase) {
      if (intS(context.scheme)?.selectedScheme) {
        //      const transform = intS(context.scheme)!.selectedScheme!.transform;
        const subContext = createSubContext(
          iContext,
          intS(context.scheme)!.selectedScheme!,
          iContext.fwdValue ? iContext.fwdValue : context.value);
        return subContext;
      }
      else {
        return undefined;
      }
    }
    return undefined;
  }

  context.addProperty = (property: string | number, schemeKey?: string): Context | undefined => {
    if (context.scheme === undefined) {
      context.scheme = { uibase: 'object' };
    }
    if (context.scheme.uibase != 'object' &&
      context.scheme.uibase != 'array') {
      return undefined;
    }
    if (context.scheme.uibase == 'array') {
      property = context.value.length;
    }
    if (
      (property !== undefined) &&
      property !== '' &&
      // cannot replace existing property
      context.value[property] === undefined &&
      // sanity check on newproperty type
      (isSchemeSelectionKey(context, schemeKey) ||
        context.getOptionalPropertyList().includes(String(property)))
    ) {
      if (!context.scheme.properties)
        context.scheme.properties = {};
      if (context.scheme.properties[property] === undefined) {
        setPropertyScheme(context, property, schemeKey);
      }
      switch (context.scheme.uibase) {
        case 'object': {
          context.value[property] =
            initValue(undefined, getPropertyScheme(context, property))
        }
          break;
        case 'array': {
          context.value.splice(property, 0,
            initValue(undefined, getPropertyScheme(context, property)));
        }
          break;
      }
      const subContext = context.getSubContext(property);
      (subContext as IntContext)?.updateObservable?.next(subContext!);
      return subContext;
    }
    return undefined;
  }

  /**
   * check if a context can be reset to default value
   * @returns true if the context can be reset, false otherwise
   */
  context.canReset = (): boolean => {
    return ((context.scheme?.default != undefined)
      || ((context.scheme?.defaultSelectionKey != undefined) && (context.scheme?.uibase == 'select')))
      ;
  }
  /**
   * reset a context to default value. If the scheme defines a default value, the context value is set to it. If the scheme defines a default selection key and is a select, the selection is set to the default selection key. After reset, an update is emitted with the new value and scheme.
   * @param context is the context to reset
   * @returns void
   */
  context.reset = () => {
    if (context.scheme?.default != undefined) {
      context.value = context.scheme?.default;
    }
    if (context.scheme?.defaultSelectionKey != undefined) {
      context.select(context.scheme?.defaultSelectionKey);
    }
    (context as IntContext).updateObservable?.next({ value: context.value, scheme: context.scheme });
  }
  /**
   * checks if a property (object) or an item (array) can be deleted
   * @param context 
   * @returns true if property can be deleted, false otherwise
   */
  context.canDeleteProperty = (): boolean => {
    if (context.parent?.scheme?.uibase === 'object') {
      if ((isOptional(context) || intS(context.scheme)?.deletable) && context.key !== undefined) {
        return true;
      }
    }
    if (context.parent?.scheme?.uibase === 'array') {
      return true;
    }
    return false;
  }
  /**
   * delete a property from an object or an item from an array. 
   * @param context is the context to delete or the parent context if a key is specified
   * @param key optional, when specified the deletion applies to the object property or the array item corresponding to the key
   * @returns void
   */
  context.deleteProperty = (key?: string | number) => {
    let release;
    if (key != undefined) {
      const subContext = (context as IntContext).subContexts?.[key];
      if (subContext == undefined) return;
      context = subContext;
    }
    if (!context.parent || !context.key) return;
    const iparentContext = context.parent as IntContext;
    if (iparentContext?.scheme?.uibase === 'object') {
      if ((isOptional(context) || intS(context.scheme)?.deletable) && context.key !== undefined) {
        if (iparentContext?.fwdValue) {
          delete iparentContext?.fwdValue[context.key];
          iparentContext.value = iparentContext.scheme?.transform?.backward(iparentContext.fwdValue);
        }
        else {
          delete iparentContext.value[context.key];
        }
        release = context;
      }
      if (intS(context.scheme)?.deletable && context.key !== undefined) {
        delete context.parent?.scheme?.properties?.[context.key];
      }
      if (context.scheme && (!isOptional(context) && !intS(context.scheme)?.deletable) && context.key !== undefined) {
        context.value = initValue(undefined, context.scheme);
        if (iparentContext.value !== undefined) {
          iparentContext.value[context.key] = context.value;
        }
      }
      if (release) {
        releaseContext(context);
        delete iparentContext.subContexts?.[context.key];
      }
    }
    if (iparentContext.scheme?.uibase === 'array') {
      const nschemeP = iparentContext.scheme.properties ?? {};
      const nSubcontextsP = (context.parent as IntContext).subContexts;
      const end = iparentContext.value.length - 1;
      if (iparentContext?.fwdValue) {
        (iparentContext?.fwdValue as any[]).splice(Number(context.key), 1);
        iparentContext.value = iparentContext.scheme?.transform?.backward(iparentContext.fwdValue);
      }
      else {
        (iparentContext.value as any[]).splice(Number(context.key), 1);
      }
      for (const i of Object.keys(iparentContext.scheme.properties!)) {
        if ((Number(i) >= Number(context.key)) && (Number(i) < end)) {
          nschemeP[Number(i)] = iparentContext.scheme.properties![Number(i) + 1];
          if (nSubcontextsP) nSubcontextsP[Number(i)] = nSubcontextsP[Number(i) + 1];
        }
      }
      release = context;
      releaseContext(context);
      delete nschemeP[end];
      if (nSubcontextsP) delete nSubcontextsP[end];
    }
    if (context.parent != undefined) {
      (context.parent as IntContext).subContext = undefined;
    }
    iparentContext.updateObservable?.next({ value: iparentContext.value, scheme: iparentContext.scheme });
  }

  context.canArrayItemUp = (): boolean => {
    return !(context?.parent == undefined
      || !isArray(context.parent)
      || context?.key === undefined
      || context.parent?.scheme?.properties === undefined)
      && getNumber(context.key) > 0;
  }

  context.arrayItemUp = (): boolean => {
    if (!context.parent) return false;
    const i = Number(context.key);
    return swapArrayItems(context.parent as IntContext, i - 1, i);
  }

  context.canArrayItemDown = (): boolean => {
    const res = !(context?.parent == undefined
      || !isArray(context.parent)
      || context?.key === undefined
      || context.parent?.scheme?.properties === undefined)
      && getNumber(context.key) < context.parent.value.length - 1;
    return res;
  }

  context.arrayItemDown = (): boolean => {
    if (!context.parent) return false;
    const i = Number(context.key);
    return swapArrayItems(context.parent as IntContext, i, i + 1);
  }
}