//import cloneDeep from "lodash.clonedeep";
import { cloneDeep } from "lodash-es";
import { Scheme, Context, SelectionList, UIEffects, IntContext, intS, Adjusted, Adjust } from "./object-editor-decl";
import { isArray, isOptional, isSchemeSelectionKey } from "./object-editor-is";
import { getUIValue, initContext, initSignalling, initValue, setUIValue } from "./object-editor-init";
import { getOptionalPropertyList, getPropertyScheme, getRunScheme, getSelectionKeys, getSelectionList } from "./object-editor-get";

export type { Scheme, Context, SelectionList, UIEffects, Adjust, Adjusted };

export const setSelectedScheme = (context: Context, key: string, selectedScheme?: Scheme) => {
  intS(context.scheme)!.selectedKey = key;
  if (selectedScheme == undefined) {
    const v = getSelectionList(context)?.[key!];
    intS(context.scheme)!.selectedScheme = getRunScheme(v);
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

  context.editUpdate?.();
  return getSubContext(context);
}

export const setPropertyScheme = (context: Context, property: string | number, schemeKey: string, scheme?: Scheme): void => {
  if (context.scheme!.properties == undefined) {
    context.scheme!.properties = {};
  }
  if (isSchemeSelectionKey(context, schemeKey)) {
    context.scheme!.properties[property] = (scheme == undefined) ?
      getRunScheme(getSelectionList(context)[schemeKey]) as Scheme :
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
  if (context.editUpdate && context.pcontext && context.key !== undefined) {
    if (!context.pcontext.value) context.pcontext.value = {};
    if (!context.pcontext.scheme) context.pcontext.scheme = { uibase: 'object', properties: {} };
    context.pcontext.value[context.key] = convert(
      context.pcontext.value[context.key],
      getPropertyScheme(context.pcontext.scheme,context.key) || {uibase: 'none'}
    );
    context.editUpdate();
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
            scheme: getPropertyScheme(context.scheme,newProperty.property)
          })
      }
        break;
      case 'array': {
        context.value.splice(newProperty.property, 0,
          initValue({
            value: undefined,
            scheme: getPropertyScheme(context.scheme,newProperty.property)
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
  if (context.editUpdate) {
    context.editUpdate();
  }
  else if (context.pcontext?.editUpdate) {
    context.pcontext?.editUpdate();
  }
}

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

export const deleteProperty = (context: Context, key?: string | number) => {
  const iparentContext = context.pcontext as IntContext;
  if (key != undefined) {
    const subContext = (context as IntContext).subContexts?.[key];
    if (subContext == undefined) return;
    context = subContext;
  }
  if (context.pcontext?.scheme?.uibase === 'object') {
    if ((isOptional(context) || intS(context.scheme)?.deletable) && context.key !== undefined) {
      if(iparentContext?.fwdValue) {
        delete iparentContext?.fwdValue[context.key];
        iparentContext.value = iparentContext.scheme?.transform?.backward(iparentContext.fwdValue);
      }
      else {
        delete context?.pcontext?.value[context.key];
      }
      context.value = undefined;
    }
    if (intS(context.scheme)?.deletable && context.key !== undefined) {
      delete context.pcontext?.scheme?.properties?.[context.key];
    }
    if (context.scheme && (!isOptional(context) && !intS(context.scheme)?.deletable) && context.key !== undefined) {
      context.value = initValue({ value: undefined, scheme: context.scheme });
      if (context.pcontext?.value !== undefined) {
        context.pcontext.value[context.key] = context.value;
      }
    }
  }
  if (context.pcontext?.scheme?.uibase === 'array') {
    const nschemeP = context.pcontext.scheme.properties ?? {};
    const end = context.pcontext?.value.length - 1;
    if(iparentContext?.fwdValue) {
      (iparentContext?.fwdValue as any[]).splice(Number(context.key), 1);
      iparentContext.value = iparentContext.scheme?.transform?.backward(iparentContext.fwdValue);
    }
    else {
      (context.pcontext?.value as any[]).splice(Number(context.key), 1);
    }
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
  if(context.pcontext != undefined) {
    (context.pcontext as IntContext).subContext = undefined;
    (context.pcontext as IntContext).subContexts = undefined;
  }
  if (context.editUpdate) {
    context.editUpdate();
  }
  else if (context.pcontext?.editUpdate) {
    context.pcontext?.editUpdate();
  }
}

export const getSubContext = (context: Context, p?: string | number): Context | undefined => {

  const iContext = (context as IntContext);

  if(p != undefined && (iContext.subContexts?.[p] != undefined)) {
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
    const subContext = {
      scheme: getPropertyScheme(context.scheme,p),
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
    return subContext;
  }
  else if ('select' == context.scheme?.uibase) {
    if (intS(context.scheme)?.selectedScheme) {
      //      const transform = intS(context.scheme)!.selectedScheme!.transform;
      const subContext = {
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


export const canArrayItemUp = (context: Context) => {
  return !(context?.pcontext == undefined
    || !isArray(context?.pcontext)
    || context?.key === undefined
    || context.pcontext?.scheme?.properties === undefined)
    && getNumber(context.key) > 0;
}

export const arrayItemUp = (context: Context) => {
  const iContext = context as IntContext;
  const iparentContext = context?.pcontext as IntContext;
  if (context?.key === undefined ||
    context.pcontext?.scheme?.properties === undefined) return;
  const i = Number(context.key);
  if ((i < 1) || (i >= context.pcontext.value.length)) return;

  const value = getUIValue(iparentContext);
  const v0 = value[i - 1];
  const v1 = value[i];
  value[i] = v0;
  value[i - 1] = v1;
  setUIValue(iparentContext,value);

  const s0 = context.pcontext?.scheme?.properties?.[i - 1];
  const s1 = context.pcontext?.scheme?.properties?.[i];
  context.pcontext.scheme.properties[i] = s0;
  context.pcontext.scheme.properties[i - 1] = s1;
/*
  const sc0 = (context.pcontext as IntContext).subContexts![i - 1];
  const sc1 = (context.pcontext as IntContext).subContexts![i];
  (context.pcontext as IntContext).subContexts![i - 1] = sc1!;
  (context.pcontext as IntContext).subContexts![i] = sc0;

  const key0 = sc0.key;
  const key1 = sc1.key;
  sc0.key = key1;
  sc1.key = key0;
*/
  delete (context.pcontext as IntContext).subContexts![i];
  delete (context.pcontext as IntContext).subContexts![i - 1];

  context.pcontext?.editUpdate?.();
  context.pcontext.contextChange?.(context.pcontext, { key: i - 1 });
}

export const canArrayItemDown = (context: Context) => {
  const res = !(context?.pcontext == undefined
    || !isArray(context?.pcontext)
    || context?.key === undefined
    || context.pcontext?.scheme?.properties === undefined)
    && getNumber(context.key) < context.pcontext.value.length - 1;
  return res;
}

export const arrayItemDown = (context: Context) => {
  const iparentContext = context?.pcontext as IntContext;
  if (context?.key === undefined ||
    context.pcontext?.scheme?.properties === undefined) return;
  const i = Number(context.key);
  if ((i < 0) || (i >= context.pcontext.value.length - 1)) return;

  const value = getUIValue(iparentContext);
  const v0 = value[i];
  const v1 = value[i + 1];
  value[i + 1] = v0;
  value[i] = v1;
  setUIValue(iparentContext,value);

  const s0 = context.pcontext?.scheme?.properties?.[i];
  const s1 = context.pcontext?.scheme?.properties?.[i + 1];
  context.pcontext.scheme.properties[i + 1] = s0;
  context.pcontext.scheme.properties[i] = s1;
/*
  const sc0 = (context.pcontext as IntContext).subContexts![i];
  const sc1 = (context.pcontext as IntContext).subContexts![i + 1];
  (context.pcontext as IntContext).subContexts![i] = sc1;
  (context.pcontext as IntContext).subContexts![i + 1] = sc0;

  const key0 = sc0.key;
  const key1 = sc1.key;
  sc0.key = key1;
  sc1.key = key0;
*/
    delete (context.pcontext as IntContext).subContexts![i];
    delete (context.pcontext as IntContext).subContexts![i + 1];
  context.pcontext?.editUpdate?.();
  context.pcontext.contextChange?.(context.pcontext, { key: i + 1 });
}


