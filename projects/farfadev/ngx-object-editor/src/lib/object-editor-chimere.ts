
import { cloneDeep } from "lodash-es";
import { Context, Scheme, intS } from "./object-editor-decl"
import { getProperties, getSelectionList, getSubContext, setSelectedScheme } from "./object-editor-int";

export const loadContext = (context: Context, stream: ReadableStream) => {

}
/**
 * @function storeContext 
 * @param context the context (a value and a scheme)
 * @param stream the output stream
 * @param chimere an internal object construct mixing value and parts of scheme
 * @description Serialize a context into a stream for transmission or storage
 */
export const storeContext = (context: Context, stream?: WritableStream) => {
  const chimere = _toChimere(context);
  return chimere;
}
const cc = {
  key: 'key',
  deletable: 'deletable',
  ctime: 'ctime',
  selectedKey: 'selectedKey',
  parentSelectedKey: 'parentSelectedKey',
  scheme: 'scheme',
  sub: 'sub',
  selected: 'selected',
  value: 'value',
}
/**
 * @function toChimere
 * @param {Context} context 
 * @returns {Record<string | number, any>} chimere 
 * @description Returns a <b>mixing</b> (chimere) of scheme and value for streaming data (transmission/ storage) and later reconstructing a context from the streamed (received/ stored) data
 */
export const toChimere = (context: Context): Record<string | number, any> => {
  return _toChimere(context) ?? {};
}
const _toChimere = (context: Context, forwarded?: boolean): Record<string | number, any> | null => {
  let chimere: Record<string | number, any> = {};
  const nFwd = (forwarded == true) || (context.scheme?.transform != undefined);
  if (context.key != undefined) chimere[cc.key] = context.key;
  if (context.scheme) {
    const scheme: Record<string, any> = context.scheme;
    const sScheme: Record<string, any> = {};
    for (const key of [cc.deletable, cc.ctime, cc.selectedKey, cc.parentSelectedKey]) {
      if (scheme[key] !== undefined) {
        sScheme[key] = scheme[key];
      }
    }
    if (Object.keys(sScheme).length > 0) chimere[cc.scheme] = sScheme;
  }

  switch (context.scheme?.uibase) {
    case 'object': {
      const sub: any[] = [];
      const keys = getProperties(context);
      for (const key of keys) {
        const subContext = getSubContext(context, key);
        if (subContext) {
          const rchimere = _toChimere(subContext, nFwd);
          if (rchimere != null) sub.push(rchimere);
        }
      }
      if (sub.length > 0) chimere[cc.sub] = sub;
    }
      break;
    case 'array': {
      const sub: any[] = [];
      for (let i = 0; i < context.value.length; i++) {
        const subContext = getSubContext(context, i);
        if (subContext) {
          const rchimere = _toChimere(subContext, nFwd);
          if (rchimere != null) sub.push(rchimere);
        }
      }
      if (sub.length > 0) chimere[cc.sub] = sub;
    }
      break;
    case 'select':
      const subContext = getSubContext(context, intS(context.scheme)?.selectedKey);
      if (subContext) {
        const rchimere = _toChimere(subContext, nFwd);
        if (rchimere != null) chimere[cc.selected] = rchimere;
      }
      break;
    default:
      if (!forwarded)
        chimere[cc.value] = context.value;
      break;
  }
  if (context.scheme!.transform && !forwarded) {
    chimere[cc.value] = context.value;
  }
  const chimereKeys = Object.keys(chimere);
  return chimere;
}
export const fromChimere = (chimere: Record<string | number, any>, refScheme: Scheme): Context => {
  const context: Context = {
    scheme: cloneDeep(refScheme)
  }
  _fromChimere(context, chimere);
  return context;
}

const _fromChimere = (context: Context, chimere: Record<string | number, any>): void => {
  if (chimere['key'] != undefined) context.key = chimere['key'];
  if (chimere['value'] != undefined) context.value = chimere['value'];
  if ((context.key) && (context.scheme == undefined)) context.scheme = context.pcontext?.scheme?.properties?.[context.key];
  if ((intS(context.pcontext?.scheme)?.selectedScheme) && (context.scheme == undefined)) context.scheme = cloneDeep(intS(context.pcontext?.scheme)?.selectedScheme);
  if (chimere['scheme'] != undefined) {
    if ((context.scheme == undefined) && (chimere['scheme']['parentSelectedKey'] != undefined)) {
      context.scheme = cloneDeep(getSelectionList(context.pcontext)[chimere['scheme']['parentSelectedKey']]);
    }
    if (chimere['scheme']['deletable'] != undefined) intS(context.scheme)!.deletable = chimere['scheme']['deletable'];
    if (chimere['scheme']['ctime'] != undefined) intS(context.scheme)!.ctime = chimere['scheme']['ctime'];
    if (chimere['scheme']['selectedKey'] != undefined) intS(context.scheme)!.selectedKey = chimere['scheme']['selectedKey'];
    if (chimere['scheme']['parentSelectedKey'] != undefined) intS(context.scheme)!.parentSelectedKey = chimere['scheme']['parentSelectedKey'];
    if (intS(context.scheme)?.deletable == true)
      context.scheme!.optional = true;
  }
  if (intS(context.scheme)?.selectedKey != undefined) {
    setSelectedScheme(context, intS(context.scheme)!.selectedKey!);
  }
  if (context.scheme?.transform == undefined) {
    if (context.scheme?.uibase == 'object') context.value = {};
    if (context.scheme?.uibase == 'array') context.value = [];
  }
  const props = chimere['sub'];
  for (const prop of props ?? []) {
    const nContext: Context = {
      pcontext: context,
    }
    _fromChimere(nContext, prop);
    if (nContext.key != undefined) {
      if (context.scheme?.transform == undefined) {
        context.value[nContext.key] = nContext.value;
      }
      if (context.scheme && nContext.scheme) {
        if (context.scheme.properties == undefined) {
          context.scheme.properties = {};
        }
        context.scheme.properties![nContext.key] = nContext.scheme;
      }
    }
  }
  const selected = chimere['selected'];
  if (context.scheme!.uibase == 'select' && selected != undefined) {
    const nContext: Context = {
      pcontext: context,
    }
    _fromChimere(nContext, selected);
    if (context.value == undefined)
      context.value = nContext.value;
  }
}
/**
 * find all differences between 2 contexes (check toChimere/ fromChimere)
 * @param context1 the initial context
 * @param context2 the context resulting from fromChimere
 */
export const compare = (context1: Context, context2: Context) => {
  return deepDiffMapper().map(context1, context2);
}
const deepDiffMapper = () => {
  // https://stackoverflow.com/questions/8572826/generic-deep-diff-between-two-objects
  return {
    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',
    map: function (obj1: any, obj2: any) {
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        const type = this.compareValues(obj1, obj2);
        if (type != this.VALUE_UNCHANGED) {
          return {
            type,
            data: obj1 === undefined ? obj2 : obj1
          };
        }
        else return null;
      }

      var diff: any = {};
      const obj1_keys: (string | number)[] = [];
      for (var key in obj1) {
        if (this.isFunction(obj1[key])) {
          continue;
        }
        obj1_keys.push(key);
        var value2 = undefined;
        if (obj2[key] !== undefined) {
          value2 = obj2[key];
        }
        const sdiff = this.map(obj1[key], value2);
        if (sdiff != null)
          diff[key] = sdiff;
      }
      for (var key in obj2) {
        if (this.isFunction(obj2[key]) || obj1_keys.includes(key)) {
          continue;
        }

        const sdiff = this.map(obj1[key], value2);
        if (sdiff != null)
          diff[key] = sdiff;
      }

      return Object.keys(diff).length > 0 ? diff : null;

    },
    compareValues: function (value1: any, value2: any) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },
    isFunction: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x: any) {
      return !this.isObject(x) && !this.isArray(x);
    }
  }
};
