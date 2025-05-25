//import cloneDeep from "lodash.clonedeep";

import { getSelectionKeys } from "./object-editor-int";
import { Context, IntContext } from "./object-editor-decl";
import { getOptional } from "./object-editor-get";

export const isOptional = (context: Context, key?: string | number): boolean => {
  const opt = getOptional(context, key);
  return opt == true || opt == 'signal';
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
  const readOnly = context.scheme?.readonly;
  const contextOpt = (context as IntContext).readonly ?? false;
  if (typeof readOnly == 'function') {
    return readOnly(context) || contextOpt;
  }
  else {
    return (readOnly ?? false) || contextOpt;
  }
}

export const isSchemeSelectionKey = (context?: Context, key?: string): boolean => {
  const keys = getSelectionKeys(context);
  return (keys && key) ? keys.includes(key) : false;
}

export const isUptodate = (context?: Context): boolean => {
  if(context == undefined) return false;
  if (context.pcontext == undefined) return true;
  if ((context.key != undefined) && (context.pcontext as IntContext).subContexts?.[context.key] === context)
    return true;
  return ((context.pcontext as IntContext).subContext == context);
}

