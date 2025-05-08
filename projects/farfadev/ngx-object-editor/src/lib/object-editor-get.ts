import { Context, intS, SelectionList, UIEffects } from "./object-editor-decl";

export const getSelectionKey = (context?: Context): string | undefined => {
  return intS(context?.scheme)?.selectedKey;
}

export const getSelectionLabel = (context: Context): string | undefined => {
  const selectionLabel = getUIEffects(context)?.selectLabel;
  if (typeof selectionLabel == 'function') {
    return selectionLabel(context);
  }
  else {
    return selectionLabel;
  }
}

export const getStyle = (context: Context) => {
  const style = getUIEffects(context)?.style;
  if (typeof style == 'function') {
    return style(context);
  }
  else {
    return style;
  }
}

export const getStyleClass = (context: Context) => {
  const styleClass = getUIEffects(context)?.styleClass;
  if (typeof styleClass == 'function') {
    return styleClass(context);
  }
  else {
    return styleClass;
  }
}

export const getInnerStyle = (context: Context) => {
  const innerStyle = getUIEffects(context)?.innerStyle;
  if (typeof innerStyle == 'function') {
    return innerStyle(context);
  }
  else {
    return innerStyle;
  }
}

export const getInnerStyleClass = (context: Context) => {
  const innerStyleClass = getUIEffects(context)?.innerStyleClass;
  if (typeof innerStyleClass == 'function') {
    return innerStyleClass(context);
  }
  else {
    return innerStyleClass;
  }
}

export const getDesignToken = (context: Context) => {
  const designToken = getUIEffects(context)?.designToken;
  if (typeof designToken == 'function') {
    return designToken(context);
  }
  else {
    return designToken;
  }
}

export const getInputAttributes = (context: Context): { [key: string]: any } | undefined => {
  const inputAttributes = getUIEffects(context)?.inputAttributes;
  if (typeof inputAttributes == 'function') {
    return inputAttributes(context);
  }
  else {
    return inputAttributes;
  }
}

export const getMaskOptions = (context: Context): Record<string, unknown> | undefined => {
  if (typeof context.scheme?.maskOptions == 'function') {
    return context.scheme.maskOptions(context);
  }
  else {
    return context.scheme?.maskOptions;
  }
}

export const getUIEffects = (context: Context): UIEffects | undefined => {
  if (typeof context.scheme?.uiEffects == 'function') {
    return context.scheme.uiEffects(context);
  }
  else {
    return context.scheme?.uiEffects;
  }
}

export const getLabel = (context: Context) => {
    return context.scheme?.label ?? context.key ?? intS(context.pcontext?.scheme)?.selectedKey;
  }
  
  export const getDescription = (context: Context): string | undefined => {
    if (typeof context.scheme?.description == 'function') {
      return context.scheme.description(context);
    }
    else {
      return context.scheme?.description;
    }
  }

  
  export const getOptionalPropertyList = (context: Context): string[] => {
    if (!(context.scheme?.uibase == 'object') || !context.scheme?.properties) {
      return [];
    }
    const isel = Object.keys(context.scheme?.properties);
    const rsel: string[] = [];
    isel.forEach((s) => {
      const value = context.value == undefined ?
        undefined
        : context.scheme?.transform?.forward ?
          context.scheme?.transform?.forward(context.value)
          : context.value;
      if (!value?.hasOwnProperty(s)) {
        rsel.push(s);
      }
    });
    return rsel;
  }
  
export const getSelectionList = (context?: Context, p?: string | number): SelectionList<any, any> => {
  if (!context?.scheme) return {};
  const selList = p ?
    context.scheme.properties?.[p].selectionList :
    context.scheme.selectionList;

  return (typeof selList == 'function' ?
    selList(context) : selList) ?? {}
}

  export const getSelectionKeys = (context?: Context, p?: string | number): string[] => {
    const list: string[] = [];
    if (!context?.scheme || (p && !context?.scheme?.properties?.[p])) return [];
    list.push(...Object.keys(getSelectionList(context, p)));
    return list;
  }
  
  export const getProperties = (context: Context) => {
    let properties: (string | number)[] = [];
    const value = context.scheme?.transform?.forward ?
      context.scheme?.transform?.forward(context.value) :
      context.value;
    const schemeKeys = Object.keys(context.scheme?.properties ?? {});
    for (const sp of schemeKeys) {
      if ((value?.[sp] != undefined) || !intS(context.scheme?.properties?.[sp])?.optional) {
        properties.push(sp);
      }
    }
    properties = (context.scheme?.uibase === 'object') ? properties.sort((a, b) => {
      const a_ct = intS(context.scheme?.properties?.[a])?.ctime ?? 0;
      const b_ct = intS(context.scheme?.properties?.[b])?.ctime ?? 0;
      if (a_ct == b_ct) {
        if ((typeof a == 'string') && (typeof b == 'string'))
          return schemeKeys.indexOf(a) - schemeKeys.indexOf(b);
        else
          return properties.indexOf(a) - properties.indexOf(b);
      }
      else {
        return a_ct - b_ct;
      }
    }) : properties.sort((a, b) => {
      return Number(a) - Number(b)
    })
    return properties;
  }
  
  