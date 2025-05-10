//import cloneDeep from "lodash.clonedeep";
import { cloneDeep } from "lodash-es";
import { Scheme, Context, SelectionList, UIEffects, IntContext, intS, Adjusted, Adjust } from "./object-editor-decl";
import { isOptional, isSchemeSelectionKey } from "./object-editor-is";
import { initSignalling, initValue } from "./object-editor-init";
import { getOptionalPropertyList, getSelectionKeys, getSelectionList } from "./object-editor-get";

export type { Scheme, Context, SelectionList, UIEffects, Adjust, Adjusted };

export const setSelectedScheme = (context: Context, key: string) => {
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

export const setPropertyScheme = (context: Context, property: string | number, schemeKey: string, scheme?: Scheme): void => {
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
      context.pcontext.scheme.properties![context.key]
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

  if (key != undefined) {
    const subContext = (context as IntContext).subContexts?.[key];
    if (subContext == undefined) return;
    context = subContext;
  }
  if (context.pcontext?.scheme?.uibase === 'object') {
    if ((isOptional(context) || intS(context.scheme)?.deletable) && context.key !== undefined) {
      delete context?.pcontext?.value[context.key];
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

export const getSubContext = (context: Context, p?: string | number): Context | undefined => {
  const dynamic = (p == undefined) ? context.scheme?.dynamic : context.scheme?.properties?.[p].dynamic;
  if (typeof dynamic == 'function') {
    const subContext = {
      scheme: cloneDeep(dynamic(context)),
      value: (p == undefined) ? context.value : context.value?.[p],
      pcontext: context,
      key: p,
    }
    if (p == undefined) (context as IntContext).subContext = subContext;
    else {
      if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
      (context as IntContext).subContexts![p] = subContext;
    }
    initSignalling(subContext);
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
          else if (isOptional(subContext))
            delete context.value[subContext.key];
        }
        delete iContext.fwdValue;
        context.editUpdate?.();
      },
      contextChange: context.contextChange,
      onClick: () => {

      }
    }
    if (p == undefined) (context as IntContext).subContext = subContext;
    else {
      if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
      (context as IntContext).subContexts![p] = subContext;
    }
    initSignalling(subContext);
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
      if (p == undefined) (context as IntContext).subContext = subContext;
      else {
        if ((context as IntContext).subContexts == undefined) (context as IntContext).subContexts = {};
        (context as IntContext).subContexts![p] = subContext;
      }
      initSignalling(subContext);
      return subContext;
    }
    else {
      return undefined;
    }
  }
  return undefined;
}
