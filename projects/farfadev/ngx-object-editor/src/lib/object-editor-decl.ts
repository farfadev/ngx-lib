  /**
   * - [UIBase]({@link ./object-editor.doc.md})
   */
  export type UIBase = 'text' | 'password' | 'color' | 'number' | 'boolean' | 'range' |
    'date' | 'time' | 'datetime' | 'file' | 'tel' | 'email' | 'url' | 'image'
    | 'object' | 'array' | 'select' | 'from' | 'custom' | 'angular' | 'none';

  export type SelectionList<T = any, U = any> = { [key: string]: Scheme<T, U> };

  /**
   * define UI behaviour and styling
   */
  export type UIEffects = {
    /**
     * if the UI element can be toggled
     */
    toggle?: boolean;
    /**
     * group the properties in one block
     * // TODO
     */
    // TODO
    uiGroups?: {
      properties: string[];
      toggle?: boolean;
    }[];
    /**
     * if the select element shall be displayed as radio button
     */
    radio?: boolean;
    /**
     * if element shall be displayed horizontally instead of vertically
     */
    horizontal?: true;
    /**
     * a call back to set the label on select elements
     */
    selectLabel?: string | ((context: Context) => string);
    /**
     * set the style of the element
     */
    style?: string | ((context: Context) => string);
    /**
     * set element input attributes
     */
    inputAttributes?: { [key: string]: string } | ((context: Context) => { [key: string]: string });
    innerStyle?: string | ((context: Context) => string);
    // for html class (or primeng styleClass) attribute (need css injection :host::ngdeep)
    // TODO doesn't work yet
    styleClass?: string | ((context: Context) => string);
    // for html class (or primeng styleClass) attribute (need css injection :host::ngdeep)
    // TODO doesn't work yet
    innerStyleClass?: string | ((context: Context) => string);
    // for primeng design token styling
    // TODO doesn't work yet (primeng components)
    designToken?: object | ((context: Context) => object);
  }

  /**
  * type of values returned by the adjust callback
  * @property formattedValue is the new ui value as appearing to user
  * @property adjustedValue is the new actual value as set on the model
  * @property message is displayed to explain an erroneous value
  * @property cursorPosition is the new cursor position after value is formatted
   * 
   */
  export type Adjusted = {
    formattedValue?: string,
    adjustedValue?: any,
    message?: string,
    cursorPosition?: number | 'end'
  }

  /** 
   * {@link ./object-editor.doc.html}
   */
  export type Adjust = {
    // called after each value change (return Adjusted value)
    adjust?: (context: Context, inputValue?: string, cursorPosition?: number) => Adjusted | null,
    // called on key down, to accept or not the event (return true/ falls)
    accept?: (context: Context, key: KeyboardEvent, inputValue: string, cursorPosition: number) => boolean
  }

  /**
   * 
   * @param key 
   * @returns Signal
   */
  export const signal = (key: string) => Symbol.for(key);
  /**
   * 
   */
  export const signalInit = Symbol();
  export const signalSelf = Symbol();
  /**
   * type Signal for signalling value changes to subscribed listeners
   */
  export type Signal = Symbol;

  /**
   * describes a data scheme for the display and manupulation of the data
   * 
   */
  export type Scheme<ValueType = any, FwdValueType = any> = {
    /** indicates how the value shall be basically handled by the front-end */
    uibase: UIBase;
    /** the user-friendly ui label to identify the property, by default it is the property name */
    label?: string;
    /** rules for UI , such as scrolling, toggling, styling */
    uiEffects?: UIEffects | ((context: Context) => UIEffects);
    /** an html <article> that helps frontend user to understand/ set the value */
    description?: string | ((context: Context) => string);
    /** //TODO a call-back to set the Scheme dynamically depending on a runtime context */
    dynamic?: (context: Context) => Scheme<ValueType, FwdValueType>;
    /** array of signals fired when value changes*/
    fireSignals?: (context: Context) => {signal: Signal; data?: any} [],
    onSignals?: {signals: Signal[]; call: (context: Context, source: Context, signal: {signal: Signal; data?: any}) => void}[];
    /** if value is optional - may depend on the context */
    optional?: boolean | 'signal' | ((context?: Context) => boolean |  'signal');
    /** if value is view/read only frontend user cannot edit the value - may depend on the context */
    readonly?: boolean | ((context?: Context) => boolean);
    /** provides a default value to use when no value is provided */
    default?: ValueType;
    /** 
    * front end form is a tranformation of the actual value <br>
    * exemple: [lat,lon] transformed as {latitude: number, longitude: number}
    */
    transform?: {
      /** forward function transforms the inner value to a different frontend value  */
      forward: (t: ValueType) => FwdValueType;
      /** backward function transforms the frontend value to an inner value */
      backward: (u: FwdValueType) => ValueType;
    }
    customFrontEnd?: {
      html?: (context: Context) => string; // an html component
      init?: (context: Context, el: HTMLElement, err_cb: (err_msg: string) => void) => void; // call back to initiaalise the html element after DOM attachment (event listeners ...)
    }
    angularFrontEnd?: {
      component?: (context: Context) => any; // an angular component
      inputs?: (context: Context) => Record<string, any>; // call back to set the input attributes of the component
    }
    /** https://imask.js.org/guide.html */
    maskOptions?: Record<string, unknown> | ((context: Context) => Record<string, unknown>);

    /** for arrays, specifies min and/ or max array length */
    length?: {
      min?: number;
      max?: number;
    }

    /** value validation/ adjustment callbacks */
    adjust?: Adjust,

    /**
     *  provides a set of selectable schemes 
     * - when the value can have different schemes (select) 
     * - for additional properties on objects
     * - for array items possible schemes
     */
    selectionList?: SelectionList<ValueType, FwdValueType> | ((context: Context) => SelectionList<ValueType, FwdValueType>);
    /** provides the default scheme selection key from the scheme selection list, otherwise the first scheme in the selection list is selected  */
    defaultSelectionKey?: string;
    /**
     * custom callback to identify a scheme selection key from a value 
     * during initialisation from sheer value (without chimere context)
     * shall return the scheme selection key or undefined if unable to identity the scheme.
     * In this later case, the internal algorithm is used
    */
    detectScheme?: (context: Context, value: any) => string | undefined;

    /** for object/array provides the schemes corresponding to the value properties */
    properties?: { [key: number | string]: Scheme | (() => Scheme)}
  }
  export interface Context {
    /** the value which is edited */
    value?: any;
    /** the edition scheme */
    scheme?: Scheme;

    /** the parent context (encompassing object, array, select, undefined on the root Context)  */
    pcontext?: Context;
    /** the key in the parent context (object property name, array item number, selection key */
    key?: string | number;
    /** a call back which is called by the editor when the value changes */
    editUpdate?: (self?: boolean) => void;
    /** called by the client application to change the context (value and/ or scheme)
     eg in case of an update from the server, to avoid full page reload */
    contextChange?: (context: Context, env?: { [key: string | number]: any }) => void;
    /** a call back which is called when the ui is clicked, internal use only */
    onClick?: (subContext: Context) => void;

    /** set the display on/off of an element contained in an object or an array */
    setDisplay?: (display: 'on'|'off',key: string|number) => void;
    /** set/ unset an optional element contained in an object as readonly */
    setReadOnly?: (readonly: boolean,key?: string|number) => void;
    /**
     * set value (after transform if any)
     */
    setUIValue?: (value: any) => void;
    /**
     * get value (after transform if any)
     */
    getUIValue?: () => any;
    /** 
     * set/ unset an optional element contained in an object as mandatory 
     */
    add?: (key: string|number,scheme?: string) => void;
    /** 
     * delete an element contained in an object or an array.
     * 
     * if within an object, the element shall be optional
     */
    delete?: (key: string|number) => void;
  }
  
/**
 * holds internal scheme properties 
 */
export interface IntScheme<ValueType = any, FwdValueType = any> extends Scheme<ValueType, FwdValueType> {

  /** INTERNAL: if scheme can be deleted (and corresponding value) */
  deletable?: boolean;

  // scheme creation time (for dynamically created properties)
  ctime?: number;

  // holds the selected scheme selection key from the scheme selection list
  selectedKey?: string;
  // holds the scheme selection key from the scheme selection list
  selectedScheme?: Scheme;

  /** holds the scheme selection key from the parent object/array scheme selection list */
  parentSelectedKey?: string;

  /**cloned */
  cloned?: true;
}

export const intS = (scheme: Scheme | undefined): IntScheme | undefined => {
  return (scheme != undefined ? scheme as IntScheme : undefined);
}

/**
 * holds internal context properties 
 */
export interface IntContext extends Context {
  init?: true;
  sigInit?: true;
  fwdValue?: any;
  display?: 'on' | 'off', // as set by signals
  readonly?: true, // as set by signals
  subContext?: IntContext;
  subContexts?: Record<string|number,IntContext>;
}

