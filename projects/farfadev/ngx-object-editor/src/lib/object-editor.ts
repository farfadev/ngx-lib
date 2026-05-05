//import cloneDeep from "lodash.clonedeep";
import { Scheme, isScheme, Context, isContext, SelectionList, UIEffects, IntContext, intS, Adjusted, Adjust, BaseContext, isBaseContext } from "./object-editor-decl";
import { createContext } from "./object-editor-init";
import { getRunScheme, getSelectionList, isSchemeSelectionKey } from "./object-editor-get";

export type { Scheme, Context, BaseContext, SelectionList, UIEffects, Adjust, Adjusted };
export { isScheme, isContext, isBaseContext, createContext };

export const setSelectedScheme = (context: BaseContext, key: string, selectedScheme?: Scheme) => {
  intS(context.scheme)!.selectedKey = key;
  if (selectedScheme == undefined) {
    const v = getSelectionList(context)?.[key!];
    intS(context.scheme)!.selectedScheme = getRunScheme(v, context);
  }
  else {
    intS(context.scheme)!.selectedScheme = selectedScheme;
  }
  (context as IntContext).subContext = undefined;
}

export const setPropertyScheme = (context: BaseContext, property: string | number, schemeKey: string = '', scheme?: Scheme): void => {
  if (context.scheme!.properties == undefined) {
    context.scheme!.properties = {};
  }
  if (isSchemeSelectionKey(context, schemeKey)) {
    context.scheme!.properties[property] = (scheme == undefined) ?
      getRunScheme(getSelectionList(context)?.[schemeKey], context) as Scheme :
      scheme;
    intS(context.scheme!.properties[property])!.parentSelectedKey = schemeKey;
    intS(context.scheme!.properties[property])!.optional = true;
    intS(context.scheme!.properties[property])!.deletable = true;
    intS(context.scheme!.properties[property])!.ctime = Date.now();
  }
}


