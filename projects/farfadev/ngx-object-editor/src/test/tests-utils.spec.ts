
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import * as ObjectEditor from "../lib/object-editor";
import * as ObjectEditorInt from "../lib/object-editor-int"
import { isEqual } from "lodash-es";
import { fromChimere, toChimere } from '../lib/object-editor-chimere';

export const expectSubSet = (received: any, expected: any) => {
  for (const key of Object.keys(expected)) {
    if (typeof expected[key] === 'object' && expected[key] !== null) {
      expect(received[key]).toBeDefined();
      expectSubSet(received[key], expected[key]);
    } else {
      expect(received[key]).toBe(expected[key]);
    }
  }
}

export const getSubContextFromKeys = (context: ObjectEditor.Context, keys: (string | number)[]): ObjectEditor.Context | undefined => {
  let subContext: ObjectEditor.Context | undefined = context;
  for (const key of keys) {
    if (!subContext) break;
    subContext = ObjectEditor.getSubContext(subContext, key);
  }
  return subContext;
}

export const getSubValueFromKeys = (value: object, keys: (string | number)[]): any => {
  let subValue: any = value;
  for (const key of keys) {
    if(!subValue) break;
    subValue = subValue[key];
  }  
  return subValue;
}

export const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

export class Semaphore<T> {
  eresolve: ((v: unknown) => void) | undefined = undefined;
  promise: Promise<T>|undefined;
  constructor() {
    this.promise = new Promise<any> ((resolve: (v: unknown) => void, reject: (reason: any) => void) => {
      this.eresolve = resolve;
    })
  }
  set(v: any) {
    this.eresolve?.(v);
  }
  get() {
    return this.promise;
  }
}
