import { cloneDeep } from "lodash-es";
import { Context, intS, BaseContext, Scheme, SelectionList, IntContext } from "./object-editor-decl";


export const isOptional = (context: BaseContext, key?: string | number): boolean => {
  const opt = getOptional(context,key);
  return opt == true || opt == 'signal';
}

export const getOptional = (context: BaseContext, key?: string | number): boolean | 'signal' | undefined => {
  const scheme = (key == undefined) || (context.scheme == undefined) ? context.scheme : getPropertyScheme(context,key);
  if (typeof scheme?.optional == 'function') {
    return scheme.optional(context);
  }
  else {
    return scheme?.optional;
  }
}

export const getPropertyScheme = (context: BaseContext, key?: number | string): Scheme | undefined => {
  if ((context?.scheme == undefined) || (key == undefined)) return undefined;
  return getRunScheme(context.scheme.properties?.[key], context);
}

export const isArray = (context: BaseContext) => {
  return context.scheme?.uibase == 'array'
}

export const getSelectionList = (context: BaseContext, p?: string | number): SelectionList<any, any> => {
  if (!context?.scheme) return {};
  const selList = p ?
    getPropertyScheme(context, p)?.selectionList :
    context.scheme.selectionList;

  return (typeof selList == 'function' ?
    selList(context) : selList) ?? {}
}

export const getSelectionKeys = (context?: BaseContext, key?: string | number): string[] => {
    const list: string[] = [];
    if (!context?.scheme || (key && !context?.scheme?.properties?.[key])) return [];
    list.push(...Object.keys(getSelectionList(context, key)));
    return list;
  }


export const isSchemeSelectionKey = (context?: BaseContext, key?: string): boolean => {
  const keys = getSelectionKeys(context);
  return (keys && key) ? keys.includes(key) : false;
}

export const getRunScheme = (scheme?: Scheme | ((context?: BaseContext) => Scheme), pContext?: BaseContext) => {
  if (typeof scheme == 'function') scheme = scheme(pContext);
  if (!intS(scheme)?.cloned) {
    scheme = cloneDeep(scheme);
    if (typeof scheme == 'object') intS(scheme)!.cloned = true;
  }
  return scheme;
}

