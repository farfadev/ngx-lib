//import cloneDeep from "lodash.clonedeep";

import { getSelectionKeys } from "./object-editor-int";
import { Context, IntContext } from "./object-editor-decl";

export const isOptional = (context: Context) => {
  const opt = context.scheme?.optional;
  const mandatory = (context as IntContext).mandatory ?? false;
  if (typeof opt == 'function') {
    return opt(context) && !mandatory;
  }
  else {
    return (opt ?? false) && !mandatory;
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

