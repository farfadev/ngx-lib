import { expect } from 'vitest';
import * as ObjectEditor from "../lib/object-editor";
import { cloneDeep, isEqual } from "lodash-es";
import { fromChimere, toChimere } from '../lib/object-editor-chimere';

import { expectSubSet, getSubValueFromKeys } from "./tests-utils";

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
  ;
export type ActionType = { 
  action: Action; 
  item: (string | number)[]; 
  key?: string | number;
  value?: any;
  schemeKey?: string; 
  scheme?: ObjectEditor.Scheme | ((c: ObjectEditor.Context) => ObjectEditor.Scheme) | undefined;
  preCallBack?: (context: ObjectEditor.Context) => void; 
  postCallBack?: (context: ObjectEditor.Context) => void; 
};
export type ActionSequenceType = { 
  name?: string;
  scheme: ObjectEditor.Scheme; 
  value: any; 
  sequence: ActionType[] 
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
  addProperty,
  canDeleteProperty,
  deleteProperty,
  canArrayItemUp,
  arrayItemUp,
  canArrayItemDown,
  arrayItemDown
}

const getSubSchemeFromKeys = (scheme: ObjectEditor.Scheme | (() => ObjectEditor.Scheme) | undefined, keys: (string | number)[]): ObjectEditor.Scheme | undefined => {
  let subScheme: ObjectEditor.Scheme | (() => ObjectEditor.Scheme) | undefined = scheme;
  for (const key of keys) {
    if (!subScheme) break;
    if (typeof subScheme == 'function') subScheme = subScheme();
    subScheme = subScheme.properties?.[key];
  }
  if (typeof subScheme == 'function') subScheme = subScheme();
  return subScheme;
}

const getSubContextFromKeys = (context: ObjectEditor.Context, keys: (string | number)[]): ObjectEditor.Context | undefined => {
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
    for (const action of actionSequence.sequence) {
      lastAction.sequence = actionSequence;
      lastAction.action = action;
      action.preCallBack?.(context);
      switch (action.action) {
        case 'setValue': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.setUIValue?.(action.value);
          break;
        }
        case 'checkValue': {
          const subValue = getSubValueFromKeys(context.value, action.item);
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subValue).toEqual(action.value);
          expect(subContext?.value).toEqual(action.value);
          break;
        }
        case 'checkUIValue': {
          const subValue = getSubContextFromKeys(context, action.item)?.getUIValue?.();
          expect(subValue).toEqual(action.value);
          break;
        }
        case 'checkValueSubSet': {
          const subValue = getSubValueFromKeys(context.value, action.item);
          const subContext = getSubContextFromKeys(context, action.item);
          expectSubSet(subValue, action.value);
          expectSubSet(subContext?.value, action.value);
          break;
        }
        case 'checkSchemeSubSet': {
          const subScheme = getSubSchemeFromKeys(context.scheme, action.item);
          const subContext = getSubContextFromKeys(context, action.item);
          expectSubSet(subScheme, action.scheme ?? action.value);
          if (subContext) expectSubSet(subContext.scheme, action.scheme ?? action.value);
          break;
        }
        case 'setReadOnly': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.setReadOnly?.(action.value,action.key);
          break;
        }
        case 'checkReadOnly': {
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.getReadOnly?.(action.key)).toEqual(action.value);
          break;
        }
        case 'setDisplay': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.setDisplay?.(action.value,action.key);
          break;
        }
        case 'checkDisplay': {
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.getDisplay?.(action.key)).toEqual(action.value);
          break;
        }
        case 'checkChimere': {
          const subContext = getSubContextFromKeys(context, action.item);
          const chimere = toChimere(subContext!);
          const subContext2 = fromChimere(chimere, subContext!.scheme!);
          expect(isEqual(subContext?.value, subContext2.value)).toBeTruthy();
          break;
        }
        case 'checkOptionalPropertyList': {
          const subContext = getSubContextFromKeys(context, action.item);
          const optionalProperties = subContext?.getOptionalPropertyList();
          expect(optionalProperties).toEqual(action.value);
          break;
        }
        case 'addProperty': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.addProperty?.(String(action.key ?? ''), action.schemeKey);
          break;
        }
   case 'canDeleteProperty': {
          const subContext = getSubContextFromKeys(context, action.item);
          expect(subContext?.canDeleteProperty?.(action.key)).toEqual(action.value);
          break;
   }
   case 'deleteProperty': {
          const subContext = getSubContextFromKeys(context, action.item);
          subContext?.deleteProperty?.(action.key);
          break;
   }
  case 'canArrayItemUp': {
    break;
  }
  case 'arrayItemUp': {
    break;
  }
  case 'canArrayItemDown': {
    break;
  }
       default: {
          throw new Error(`Unknown action ${action.action}`);
        }
      }
      action.postCallBack?.(context);
    }
    expect(actionSequence.scheme).toEqual(schemeClone);
    expect(actionSequence.value).toEqual(valueClone);
  }
}