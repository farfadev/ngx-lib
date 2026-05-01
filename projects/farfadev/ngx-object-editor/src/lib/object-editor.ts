//import cloneDeep from "lodash.clonedeep";
import { cloneDeep } from "lodash-es";
import { Scheme, Context, SelectionList, UIEffects, IntContext, intS, Adjusted, Adjust } from "./object-editor-decl";
import { isArray, isOptional, isSchemeSelectionKey } from "./object-editor-is";
import { getUIValue, initContext, initSignalling, initValue, releaseContext, setUIValue } from "./object-editor-init";
import { getOptionalPropertyList, getPropertyScheme, getRunScheme, getSelectionKeys, getSelectionList } from "./object-editor-get";

export type { Scheme, Context, SelectionList, UIEffects, Adjust, Adjusted };

export const setSelectedScheme = (context: Context, key: string, selectedScheme?: Scheme) => {
  intS(context.scheme)!.selectedKey = key;
  if (selectedScheme == undefined) {
    const v = getSelectionList(context)?.[key!];
    intS(context.scheme)!.selectedScheme = getRunScheme(v, context);
  }
  else {
    intS(context.scheme)!.selectedScheme = selectedScheme;
  }
  (context as IntContext).subContext = undefined;
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

  context.updateObservable?.next({ value: context.value, scheme: context.scheme });
  return getSubContext(context);
}

export const setPropertyScheme = (context: Context, property: string | number, schemeKey: string, scheme?: Scheme): void => {
  if (context.scheme!.properties == undefined) {
    context.scheme!.properties = {};
  }
  if (isSchemeSelectionKey(context, schemeKey)) {
    context.scheme!.properties[property] = (scheme == undefined) ?
      getRunScheme(getSelectionList(context)[schemeKey], context) as Scheme :
      scheme;
    intS(context.scheme!.properties[property])!.parentSelectedKey = schemeKey;
    intS(context.scheme!.properties[property])!.optional = true;
    intS(context.scheme!.properties[property])!.deletable = true;
    intS(context.scheme!.properties[property])!.ctime = Date.now();
  }
}

const convert = (value: any, scheme: Scheme): any => {
  if (!value) {
    return value;
  }
  if (['number', 'range'].includes(scheme.uibase)) return (Number(value));
  if (['boolean'].includes(scheme.uibase)) return (Boolean(value));
  if (['text', 'password', 'color', 'date', 'datetime', 'time', 'email', 'image', 'url'].includes(scheme.uibase)) return (String(value));
}

const editUpdate = (context: Context) => {
  if (context.pcontext && context.key !== undefined) {
    if (!context.pcontext.value) context.pcontext.value = {};
    if (!context.pcontext.scheme) context.pcontext.scheme = { uibase: 'object', properties: {} };
    context.pcontext.value[context.key] = convert(
      context.pcontext.value[context.key],
      getPropertyScheme(context.pcontext, context.key) || { uibase: 'none' }
    );
    context.updateObservable?.next({ value: context.value, scheme: context.scheme });
  }
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
            scheme: getPropertyScheme(context, newProperty.property)
          })
      }
        break;
      case 'array': {
        context.value.splice(newProperty.property, 0,
          initValue({
            value: undefined,
            scheme: getPropertyScheme(context, newProperty.property)
          }));
      }
        break;
    }
    const subContext = getSubContext(context, newProperty.property);
    subContext?.updateObservable?.next(subContext);
    return subContext;
  }
  return undefined;
}

export const canReset = (context: Context): boolean => {
  return ((context.scheme?.default != undefined)
    || ((context.scheme?.defaultSelectionKey != undefined) && (context.scheme?.uibase == 'select')))
    ;
}

export const reset = (context: Context) => {
  if (context.scheme?.default != undefined) {
    context.value = context.scheme?.default;
  }
  if (context.scheme?.defaultSelectionKey != undefined) {
    select(context, context.scheme?.defaultSelectionKey);
  }
  context.updateObservable?.next({ value: context.value, scheme: context.scheme });
}
/**
 * checks if a property (object) or an item (array) can be deleted
 * @param context 
 * @returns true if property can be deleted, false otherwise
 */
export const canDeleteProperty = (context: Context): boolean => {
  if (context.pcontext?.scheme?.uibase === 'object') {
    if ((isOptional(context) || intS(context.scheme)?.deletable) && context.key !== undefined) {
      return true;
    }
  }
  if (context.pcontext?.scheme?.uibase === 'array') {
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
export const deleteProperty = (context: Context, key?: string | number) => {
  let release;
  if (key != undefined) {
    const subContext = (context as IntContext).subContexts?.[key];
    if (subContext == undefined) return;
    context = subContext;
  }
  if (!context.pcontext || !context.key) return;
  const iparentContext = context.pcontext as IntContext;
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
      delete context.pcontext?.scheme?.properties?.[context.key];
    }
    if (context.scheme && (!isOptional(context) && !intS(context.scheme)?.deletable) && context.key !== undefined) {
      context.value = initValue({ value: undefined, scheme: context.scheme });
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
    const nSubcontextsP = (context.pcontext as IntContext).subContexts;
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
  if (context.pcontext != undefined) {
    (context.pcontext as IntContext).subContext = undefined;
  }
  iparentContext.updateObservable?.next({ value: iparentContext.value, scheme: iparentContext.scheme });
}

export const getSubContext = (context: Context, p?: string | number): Context | undefined => {

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
    const subContext: Context = {
      scheme: getPropertyScheme(context, p),
      value: iContext.fwdValue ? iContext.fwdValue[p] : context.value[p],
      pcontext: context,
      key: p,
    }
    if (p == undefined) (context as IntContext).subContext = subContext;
    else {
      if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
      (context as IntContext).subContexts![p] = subContext;
    }
    initContext(subContext);
    subContext.updateObservable?.subscribe((o: object) => {
      context.updateObservable?.next({ subContext, o });
    })
    return subContext;
  }
  else if ('select' == context.scheme?.uibase) {
    if (intS(context.scheme)?.selectedScheme) {
      //      const transform = intS(context.scheme)!.selectedScheme!.transform;
      const subContext: Context = {
        scheme: intS(context.scheme)!.selectedScheme,
        pcontext: context,
        value: iContext.fwdValue ? iContext.fwdValue : context.value,
      }
      if (p == undefined) (context as IntContext).subContext = subContext;
      else {
        if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
        (context as IntContext).subContexts![p] = subContext;
      }
      initContext(subContext);
      subContext.updateObservable?.subscribe((o: object) => {
        context.updateObservable?.next({ subContext, o });
      })
      return subContext;
    }
    else {
      return undefined;
    }
  }
  return undefined;
}

const getNumber = (arg0: any): number => {
  return Number(arg0);
}

const swapArrayItems = (context: IntContext, index1: number, index2: number): boolean => {
  const value = getUIValue(context);
  if (index1 < 0 || index2 < 0 || index1 >= value.length || index2 >= value.length || !context.scheme?.properties) return false;
  const v1 = value[index1];
  const v2 = value[index2];
  value[v2] = v1;
  value[v1] = v2;
  setUIValue(context, value);
  const s1 = context.scheme.properties[index1];
  const s2 = context.scheme.properties[index2];
  context.scheme.properties[index1] = s2;
  context.scheme.properties[index2] = s1;

  // TODO swap subcontexes instead of deleting them
  releaseContext(context.subContexts?.[index1]);
  releaseContext(context.subContexts?.[index2]);
  delete (context.subContexts?.[index1]);
  delete (context.subContexts?.[index2]);

  context.updateObservable?.next({ value: context.value, scheme: context.scheme });
  context.contextChange?.(context, { key: index1 });

  return true;
}

export const canArrayItemUp = (context: Context): boolean => {
  return !(context?.pcontext == undefined
    || !isArray(context?.pcontext)
    || context?.key === undefined
    || context.pcontext?.scheme?.properties === undefined)
    && getNumber(context.key) > 0;
}

export const arrayItemUp = (context: Context): boolean => {
  if (!context.pcontext) return false;
  const i = Number(context.key);
  return swapArrayItems(context.pcontext, i - 1, i);
}

export const canArrayItemDown = (context: Context): boolean => {
  const res = !(context?.pcontext == undefined
    || !isArray(context?.pcontext)
    || context?.key === undefined
    || context.pcontext?.scheme?.properties === undefined)
    && getNumber(context.key) < context.pcontext.value.length - 1;
  return res;
}

export const arrayItemDown = (context: Context): boolean => {
  if (!context.pcontext) return false;
  const i = Number(context.key);
  return swapArrayItems(context.pcontext, i, i + 1);
}


