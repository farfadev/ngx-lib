import { cloneDeep, isEqual, isMatch } from "lodash-es";
import { Context, intS, Scheme, IntScheme, Signal, IntContext } from "./object-editor-decl";
import { getOptional, getPropertyScheme, getRunScheme, getSelectionList } from './object-editor-get';
import { addProperty, deleteProperty, select, setPropertyScheme, setSelectedScheme } from "./object-editor"
import { FarfaOEValueCheck } from "./utils/verifyvalues";
import { isOptional, isSchemeSelectionKey, isUptodate } from "./object-editor-is";
import { fromChimere } from "./object-editor-chimere";
import { Subject } from "rxjs";

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
    context.updateObservable?.subscribe((o: object) => {
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


export const uiinitialized = (context: Context) => {
  initUserFunctions(context);
  initSignalling(context);
}

export const uidestroyed = (context: Context) => {
  releaseSignalling(context);
}

export const releaseSignalling = (context: Context) => {
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

  if ((context.pcontext as IntContext)?.subContext == context) {
    (context.pcontext as IntContext).subContext = undefined;
  }

  releaseContext(iContext.subContext);

  for (const subContext of Object.values(iContext.subContexts ?? {})) {
    releaseContext(subContext);
  }

  releaseSignalling(context);
  context.updateObservable?.complete();
  delete iContext.init;
  delete context.updateObservable;
  delete context.contextChange;
  delete context.onClick;
  delete iContext.subContext;
  delete iContext.subContexts;
  context.key = undefined;
  context.value = undefined;
  context.scheme = undefined;
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
    rContext = reinitContext(context, newValue, scheme);
  }
  else if (context.scheme?.transform != undefined) {
    context.value = context.scheme.transform.backward(newValue);
    iContext.fwdValue = newValue;
  }
  else {
    context.value = newValue;
    iContext.fwdValue = undefined;
  }
  rContext.updateObservable?.next({ value: newValue, scheme });
  return rContext;
}

export const editUpdate = (subContext: Context) => {
  if (subContext.pcontext == undefined) return;
  const parentContext = subContext.pcontext;
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
  parentContext.updateObservable?.next({ subContext });
}

export const reinitContext = (context: Context, value: any, scheme: Scheme): Context => {
  const newContext: Context = { scheme, value };
  initContext(newContext);
  const ipContext = context.pcontext as IntContext;
  ipContext.subContext = ipContext.subContext == context ? newContext : undefined;
  for (const key of Object.keys(ipContext.subContexts ?? {})) {
    if (ipContext.subContexts?.[key] == context) {
      ipContext.subContexts[key] = newContext;
    }
  }
  newContext.pcontext = context.pcontext;
  releaseContext(context);
  return newContext;
}

const initSchemeAndValue = (context: Context): void => {

  const iContext = (context as IntContext);

  if (iContext.init == true) return;

  if (!context.scheme) {
    context.scheme = { uibase: 'object' };
  }
  context.scheme = getRunScheme(context.scheme, context.pcontext);
  const result = initScheme(context);
  context.value = initValue(context);

  const transform = context.scheme?.transform;
  if ((transform != undefined) && (iContext.fwdValue == undefined)) {
    iContext.fwdValue = transform.forward(context.value);
  }
}

export const initContextInternals = (context: Context) => {

  const iContext = (context as IntContext);

  if (iContext.init == true) return;

  context.updateObservable = new Subject<object>();
  context.updateObservable.subscribe((o: object) => {
    editUpdate(context);
  });
  context.contextChange = context.contextChange;

  initUserFunctions(context);
  initSignalling(context);
  iContext.init = true;
}

export const initContext = (context: Context): void => {
  initSchemeAndValue(context);
  initContextInternals(context);
}

export const initValue = (context: Context): any => {
  let { value, scheme } = context;
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
          value![key] = initValue({ value: value[key], scheme: getPropertyScheme({ scheme, value }, key) });
        }
      }
      break;
    case 'array':
      if (value == undefined) value = [];
      if (!(value instanceof Array)) {
        throw Error('Invalid value type, expecting Array');
      }
      for (let i = 0; i < value.length; i++) {
        value[i] = initValue({ value: value[i], scheme: getPropertyScheme({ value, scheme }, i) })
      }
      if (scheme.length?.min != undefined) {
        let lastKey;
        const keys = Object.keys(scheme.properties ?? {});
        for (let i = 0; i < scheme.length.min; i++) {
          if (scheme.properties?.[i]) {
            lastKey = i;
          }
          if (lastKey && i > value.length && getPropertyScheme({ value, scheme }, lastKey))
            value.push(initValue({ value: value[i], scheme: getPropertyScheme({ value, scheme }, lastKey) }));
        }
      }
      break;
    case 'select': {
      value = initValue({ value: context.value, scheme: intS(context.scheme)!.selectedScheme! });
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

const initScheme = (context: Context): number => {
  let match: number = 0;
  let count = 0;
  const forward = context.scheme?.transform?.forward;
  const value = (typeof forward == 'function') ? forward(context.value) : context.value;

  if (value == undefined) return 0;

  const selectionList = getSelectionList(context);

  switch (context.scheme?.uibase) {
    case 'object':
    case 'array':
      for (const p of Object.keys(value)) {
        let pmatch = 0;
        if (context.scheme.properties?.[p] != undefined) {
          const subContext = {
            scheme: getRunScheme(getPropertyScheme(context, p), context),
            pcontext: context,
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
              const subContext = {
                scheme: getRunScheme(selectionList[selKey], context),
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
                scheme: getRunScheme(selectionList[selKey], context),
                pcontext: context,
                value: value[p],
                key: p
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
            const subContext = {
              scheme: getRunScheme(selectionList[selKey], context),
              pcontext: context,
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
            const subContext = {
              scheme: getRunScheme(selectionList[selKey], context),
              pcontext: context,
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

const initUserFunctions = (context: IntContext) => {
  // set stubs
  context.add = () => { }
  context.delete = () => { }
  // set those which make sense 
  if (['object', 'array'].includes(context.scheme?.uibase ?? '')) {
    context.add = (key: string | number, scheme?: string) => {
      addProperty(context, { property: key, schemeKey: scheme ?? '' });
      (async () => context.contextChange?.(context, { key }))();
    }
  }
  if (['object', 'array'].includes(context.scheme?.uibase ?? '')) {
    context.delete = (key: string | number) => {
      deleteProperty(context, key);
      (async () => context.contextChange?.(context, { key }))();
    }
  }
  context.setReadOnly = (flag: boolean, key?: string | number) => {
    if (key != undefined) {
      const subContext = context.subContexts?.[key];
      if (subContext != undefined) {
        if (flag) subContext.readonly = true;
        else delete subContext.readonly;
        subContext.updateObservable?.next({ readonly: subContext.readonly });
      }
      else {
        if (flag) context.readonly = true;
        else delete context.readonly;
        context.updateObservable?.next({ readonly: context.readonly });
      }
    }
  }
  context.setDisplay = (flag: 'on' | 'off', key: string | number) => {
    if (key != undefined) {
      const subContext = context.subContexts?.[key];
      if (subContext != undefined) {
        subContext.display = flag;
        subContext.updateObservable?.next({ display: subContext.display });
      }
      else {
        context.display = flag;
        context.updateObservable?.next({ display: context.display });
      }
    }
  }
  context.setUIValue = (value: any, scheme?: Scheme): Context => {
    return setUIValue(context, value, scheme);
  }
  context.getUIValue = () => {
    return getUIValue(context);
  }
  context.setChimere = (chimere: Record<string | number, any>, scheme: Scheme): Context => {
    return fromChimere(chimere, scheme);
  }
}