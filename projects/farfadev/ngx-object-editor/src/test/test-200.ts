
import * as ObjectEditor from "../lib/object-editor";
import { ActionSequenceType } from "./object-editor-test-util";

const scheme001: ObjectEditor.Scheme = {
  uibase: 'object',
  properties: {
    p1: {
      uibase: 'boolean',
      default: true,
      optional: true,
    },
    p2: {
      uibase: 'boolean',
      default: false,
      optional: true,
    },
    p3: {
      uibase: 'boolean',
      default: true,
      optional: true,
    },
    p4: {
      uibase: 'boolean',
      default: false,
      optional: true,
    },
  }
}

export const actionSequence200: ActionSequenceType = {
  name: 'Action Sequence 200',
  scheme: scheme001,
  value: undefined,
  sequence: [
    {
      action: 'checkOptionalPropertyList',
      item: [],
      value: ['p1', 'p2', 'p3', 'p4']
    },
    {
      action: 'addProperty',
      item: [],
      key: 'p1'
    },
    {
      action: 'checkValue',
      item: ['p1'],
      value: (scheme001.properties?.['p1'] as ObjectEditor.Scheme).default
    },
    {
      action: 'checkOptionalPropertyList',
      item: [],
      value: ['p2', 'p3', 'p4']
    },
    {
      action: 'addProperty',
      item: [],
      key: 'p2'
    },
    {
      action: 'checkValue',
      item: ['p2'],
      value: (scheme001.properties?.['p2'] as ObjectEditor.Scheme).default
    },
    {
      action: 'checkOptionalPropertyList',
      item: [],
      value: ['p3', 'p4']
    },
    {
      action: 'addProperty',
      item: [],
      key: 'p3'
    },
    {
      action: 'checkValue',
      item: ['p3'],
      value: (scheme001.properties?.['p3'] as ObjectEditor.Scheme).default
    },
    {
      action: 'checkOptionalPropertyList',
      item: [],
      value: ['p4']
    },
    {
      action: 'addProperty',
      item: [],
      key: 'p4'
    },
    {
      action: 'checkValue',
      item: ['p4'],
      value: (scheme001.properties?.['p4'] as ObjectEditor.Scheme).default
    },
    {
      action: 'checkOptionalPropertyList',
      item: [],
      value: [],
      preCallBack: () => {
        const i = 0;
      }
    },
  ]
};
