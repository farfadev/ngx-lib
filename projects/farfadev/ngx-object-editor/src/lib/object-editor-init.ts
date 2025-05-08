import { cloneDeep, isEqual, isMatch } from "lodash-es";
import { Context, intS, Scheme, IntScheme, Signal, IntContext } from "./object-editor-decl";
import { getSelectionList } from './object-editor-get';
import { select, setPropertyScheme, setSelectedScheme } from "./object-editor"
import { FarfaOEValueCheck } from "./utils/verifyvalues";
import { isOptional, isSchemeSelectionKey } from "./object-editor-is";

const signalsMap = new Map<Signal,Set<Context>>();
// TODO detect loops
export const initSignalling = (context: Context) => {
  if(context.scheme?.onSignals != undefined) {
    for (const ss of context.scheme?.onSignals) {
      for (const s of ss.signals) {
        const scontexts = signalsMap.get(s) ?? new Set<Context>();
        scontexts.add(context);
        signalsMap.set(s,scontexts);
      }
    }
  }
  const peditUpdate = context.editUpdate;
  context.editUpdate = (self?: boolean) => {
    fireSignals(context);
    peditUpdate?.(self);
  }
}

const fireSignals = (sourceContext: Context) => {
  if(sourceContext.scheme?.fireSignals != undefined) {
    const signals = sourceContext.scheme?.fireSignals(sourceContext);
    for (const signal of signals) {
      const targetContexts = signalsMap.get(signal.signal);
      if(targetContexts != undefined) {
        for(const targetContext of targetContexts) {
          if(targetContext.scheme?.onSignals) {
            for (const ssg of targetContext.scheme?.onSignals) {
              if(ssg.signals.includes(signal.signal)) {
                const actions = ssg.call(targetContext,sourceContext,signal);
              }
            }
            (async () => targetContext.editUpdate?.())();
          }
        }
      }
      //todo  + selfSignal if target context equal source context
    }
  }
}


export const uiinitialized = (context: Context) => {
  initSignalling(context);
}

export const uidestroyed = (context: Context) => {
  if(context.scheme?.onSignals != undefined) {
    for (const ss of context.scheme?.onSignals) {
      for (const s of ss.signals) {
        const scontexts = signalsMap.get(s) ?? new Set<Context>();
        scontexts.delete(context);
      }
    }
  }
}

export const initContext = (context: Context): void => {
  if (!context.scheme) {
    context.scheme = { uibase: 'object' };
  }
  if (!context.pcontext) {
    context.scheme = cloneDeep(context.scheme);
    const result = initScheme(context);
    context.value = initValue(context);
  }
}

export const initValue = (context: Context): any => {
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
          const subScheme = scheme.properties?.[p];
          check(subScheme != undefined);
          let baseSubScheme = baseScheme.properties?.[p];
          if (baseSubScheme == undefined) {
            check(intS(subScheme)!.parentSelectedKey != undefined);
            if (intS(subScheme)?.parentSelectedKey) {
              check(isSchemeSelectionKey({ scheme }, intS(subScheme)!.parentSelectedKey));
              baseSubScheme = getSelectionList({ scheme: baseScheme })[intS(subScheme)?.parentSelectedKey!]
              check(intS(subScheme)!.ctime != undefined)
              check(intS(subScheme)!.optional == true)
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

