import { expect } from 'vitest';
import * as ObjectEditor from "../lib/object-editor";
import { cloneDeep, isEqual, isMatch } from "lodash-es";
import { fromChimere, toChimere } from '../lib/object-editor-chimere';

import { expectSubSet, getSubValueFromKeys } from "./tests-utils";
import { checkContext } from '../lib/object-editor-init';

export type Action =
  'setValue'
  | 'checkValue'
  | 'checkUIValue'
  | 'checkValueSubSet'
  | 'checkSchemeSubSet'
  | 'addProperty'
  | 'setReadOnly'
  | 'checkReadOnly'
  | 'setDisplay'
  | 'checkDisplay'
  | 'checkChimere'
  | 'checkOptionalPropertyList'
  | 'canDeleteProperty'
  | 'deleteProperty'
  | 'canArrayItemUp'
  | 'arrayItemUp'
  | 'canArrayItemDown'
  | 'arrayItemDown'
  | 'select'
  | 'canReset'
  | 'reset'
  ;
export type ActionType = {
  action: Action; // the action to perform
  item: (string | number)[]; // the path to the sub context or sub value to perform the action on (empty array for the root context or value)
  key?: string | number; // an optional key to perform the action on (useful for actions like setReadOnly, setDisplay, addProperty, deleteProperty ...)
  value?: any; // the value to use for the action (for actions like setValue, checkValue, setReadOnly, setDisplay ...)
  dynValue?: (context: ObjectEditor.Context, actionSeqData: Record<string, any>) => any; // a dynamic value to use for the action (a function that takes the current context and the action sequence data and returns the value to use for the action, useful when the value depends on the context or on previous actions in the sequence)
  schemeKey?: string; // an optional scheme key to use for the action (useful for actions like addProperty to specify the scheme of the added property, it will be looked up in the current context scheme properties using the schemeKey)
  scheme?: ObjectEditor.Scheme | ((c: ObjectEditor.Context) => ObjectEditor.Scheme) | undefined;
  id?: string; // a string to identify the action (useful for debugging)
  preCallBack?: (context: ObjectEditor.Context, actionSeqData: Record<string, any>) => void; // a call back to be called before the action is performed (useful to set dynamic values, scheme or other data for the action)
  postCallBack?: (context: ObjectEditor.Context, actionSeqData: Record<string, any>) => void; // a call back to be called after the action is performed (useful to set dynamic values, scheme or other data for the next actions)
};
export type ActionSequenceType = {
  name?: string; // a name to identify the action sequence (useful for debugging)
  scheme: ObjectEditor.Scheme; // the scheme to create the context
  value: any; // the value to create the context
  sequence: ActionType[] // the sequence of actions to perform on the context
};

const getDynValue = (action: ActionType, context: ObjectEditor.Context, actionSeqData: Record<string, any>): any => {
  return typeof action.dynValue == 'function' ? action.dynValue(context, actionSeqData) : action.value;
};

enum actionList {
  isOptional,
  isArray,
  isObject,
  isSelect,
  isReadOnly,
  getUIBase,
  getSelectionKey,
  getSelectionLabel,
  getStyle,
  getStyleClass,
  getInnerStyle,
  getInnerStyleClass,
  getSubContext,
  getDesignToken,
  getInputAttributes,
  getMaskOptions,
  getUIEffects,
  getLabel,
  getDescription,
  getPropertyScheme,
  getOptionalPropertyList,
  getSelectionList,
  getSelectionKeys,
  getProperties,
  select,
  canReset,
  reset,
}

const getSubSchemeFromKeys = (scheme: ObjectEditor.Scheme | (() => ObjectEditor.Scheme) | undefined, keys: (string | number)[] = []): ObjectEditor.Scheme | undefined => {
  let subScheme: ObjectEditor.Scheme | (() => ObjectEditor.Scheme) | undefined = scheme;
  for (const key of keys) {
    if (!subScheme) break;
    if (typeof subScheme == 'function') subScheme = subScheme();
    subScheme = subScheme.properties?.[key];
  }
  if (typeof subScheme == 'function') subScheme = subScheme();
  return subScheme;
}

const getSubContextFromKeys = (context: ObjectEditor.Context, keys: (string | number)[] = []): ObjectEditor.Context | undefined => {
  let subContext: ObjectEditor.Context | undefined = context;
  for (const key of keys) {
    if (!subContext || subContext?.value?.[key] == undefined) return undefined;
    subContext = subContext.getSubContext(key);
  }
  return subContext;
}

export const lastAction: { sequence?: ActionSequenceType, action?: ActionType } = {};

export const testActionSequenceList = (actionSequenceList: ActionSequenceType[]) => {
  for (const actionSequence of actionSequenceList) {
    const schemeClone = cloneDeep(actionSequence.scheme);
    const valueClone = cloneDeep(actionSequence.value);
    const context = ObjectEditor.createContext(actionSequence.scheme, actionSequence.value);
    expect(checkContext(context, schemeClone)).toEqual(0);
    const actionSeqdata: Record<string, any> = {};
    for (const action of actionSequence.sequence) {
      lastAction.sequence = actionSequence;
      lastAction.action = action;
      action.preCallBack?.(context, actionSeqdata);
      switch (action.action) {
        case 'setValue': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.setUIValue?.(value);
          break;
        }
        case 'checkValue': {
          const value = getDynValue(action, context, actionSeqdata);
          const subValue = getSubValueFromKeys(context.value, action.item);
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subValue).toEqual(value);
          expect(subContext?.value).toEqual(value);
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'checkUIValue': {
          const value = getDynValue(action, context, actionSeqdata);
          const subValue = getSubContextFromKeys(context, action.item)?.getUIValue?.();
          expect(subValue).toEqual(value);
          break;
        }
        case 'checkValueSubSet': {
          const value = getDynValue(action, context, actionSeqdata);
          const subValue = getSubValueFromKeys(context.value, action.item);
          const subContext = getSubContextFromKeys(context, action.item);
          expectSubSet(subValue, value);
          expectSubSet(subContext?.value, value);
          break;
        }
        case 'checkSchemeSubSet': {
          const value = getDynValue(action, context, actionSeqdata);
          const subScheme = getSubSchemeFromKeys(context.scheme, action.item);
          const subContext = getSubContextFromKeys(context, action.item);
          expectSubSet(subScheme, action.scheme ?? value);
          if (subContext) expectSubSet(subContext.scheme, action.scheme ?? value);
          break;
        }
        case 'setReadOnly': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.setReadOnly?.(value, action.key);
          break;
        }
        case 'checkReadOnly': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.getReadOnly?.(action.key)).toEqual(value);
          break;
        }
        case 'setDisplay': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.setDisplay?.(value, action.key);
          break;
        }
        case 'checkDisplay': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.getDisplay?.(action.key)).toEqual(value);
          break;
        }
        case 'checkChimere': {
          const subContext = getSubContextFromKeys(context, action.item);
          const chimere = toChimere(subContext!);
          const subContext2 = fromChimere(chimere, subContext!.scheme!);
          expect(isEqual(subContext?.value, subContext2.value)).toBeTruthy();
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'checkOptionalPropertyList': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          const optionalProperties = subContext?.getOptionalPropertyList();
          expect(optionalProperties).toEqual(value);
          break;
        }
        case 'addProperty': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.addProperty?.(String(action.key ?? ''), action.schemeKey);
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'canDeleteProperty': {
          const subContext = getSubContextFromKeys(context, action.item);
          const value = getDynValue(action, context, actionSeqdata);
          expect(subContext?.canDeleteProperty?.(action.key)).toEqual(value);
          break;
        }
        case 'deleteProperty': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.deleteProperty?.(action.key);
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'canArrayItemUp': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.canArrayItemUp?.()).toEqual(value);
          break;
        }
        case 'arrayItemUp': {
          const subContext = getSubContextFromKeys(context, action.item);
          const value = getDynValue(action, context, actionSeqdata);
          if (value != undefined) expect(subContext?.arrayItemUp?.()).toEqual(value);
          else subContext?.arrayItemUp?.();
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'canArrayItemDown': {
          const value = getDynValue(action, context, actionSeqdata);
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.canArrayItemDown?.()).toEqual(value);
          break;
        }
        case 'arrayItemDown': {
          const subContext = getSubContextFromKeys(context, action.item);
          const value = getDynValue(action, context, actionSeqdata);
          if (value != undefined) expect(subContext?.arrayItemDown?.()).toEqual(value);
          else subContext?.arrayItemDown?.();
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'select': {
          const subContext = getSubContextFromKeys(context, action.item);
          const newContext = subContext?.select(action.key as string);
          expect(checkContext(context, schemeClone)).toEqual(0);
          break;
        }
        case 'canReset': {
          break;
        }

        case 'reset': {
          break;
        }

        default: {
          throw new Error(`Unknown action ${action.action}`);
        }
      }
      action.postCallBack?.(context, actionSeqdata);
    }
    expect(actionSequence.scheme).toEqual(schemeClone);
    expect(actionSequence.value).toEqual(valueClone);
  }
}