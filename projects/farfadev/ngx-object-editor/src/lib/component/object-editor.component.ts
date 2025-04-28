/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ObjectEditor } from '../object-editor';
import { _farfa_oe_marker } from './markers';

type KeyLabel = {
  key: string;
  label: string;
}
@Component({
  standalone: false,
  selector: 'object-editor',
  templateUrl: './object-editor.component.html',
  styleUrls: ['./object-editor.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ObjectEditorComponent implements OnInit, OnDestroy {

  _context?: ObjectEditor.Context;
  get context(): ObjectEditor.Context | undefined {
    return this._context;
  }
  @Input()
  set context(value: ObjectEditor.Context) {
    this._context = value;
    this.initContext();
  }
  @Input()
  debug = false;

  @Output()
  propertyListChange = new EventEmitter<ObjectEditor.Context>();

  ui_id;

  // binding to toggle the root fieldset
  root_fieldset_expanded = true;

  // for the select uibase
  selectionKey?: string;
  subContext?: ObjectEditor.Context;

  properties: (string | number)[] = [];
  schemeOptions: string[] = [];
  newProperty = {
    property: '',
    schemeKey: ''
  };

  canAddObjectProperty(): boolean {
    return (this.context?.scheme?.uibase == 'object'
      && (this.newProperty.property != '')
      && (this.newProperty.schemeKey != '')
      && this.context?.value[this.newProperty.property] == undefined);
  }
  canAddArrayElement(): boolean {
    return (this.context?.scheme?.uibase == 'array'
      && (this.newProperty.schemeKey != '')
      && (this.context.scheme.length?.max ? this.context.value.length < this.context.scheme.length.max : true));
  }
  editing?: ObjectEditor.Context;
  propertyClickEvent = false;
  windowClickListener = (ev: MouseEvent) => {
    if (!this.propertyClickEvent && this.editing) {
      //      ObjectEditor.editUpdate(this.editing);
      this.editing = undefined;
    }
    this.propertyClickEvent = false;
  };

  constructor(@Host() elementRef: ElementRef) {
    this.ui_id = window.crypto.randomUUID();
    elementRef.nativeElement.setAttribute(_farfa_oe_marker, '');
  }

  getNumber(arg0: any): number {
    return Number(arg0);
  }

  canArrayItemUp(context: ObjectEditor.Context) {
    return !(context?.pcontext == undefined
      || !ObjectEditor.isArray(context?.pcontext)
      || context?.key === undefined
      || context.pcontext?.scheme?.properties === undefined)
      && this.getNumber(context.key) > 0;
  }

  arrayItemUp(context: ObjectEditor.Context) {
    if (context?.key === undefined ||
      context.pcontext?.scheme?.properties === undefined) return;
    const i = Number(context.key);
    if ((i < 1) || (i >= context.pcontext.value.length)) return;
    const v0 = context.pcontext.value[i - 1];
    const v1 = context.pcontext.value[i];
    context.pcontext.value[i] = v0;
    context.pcontext.value[i - 1] = v1;

    const s0 = context.pcontext?.scheme?.properties?.[i - 1];
    const s1 = context.pcontext?.scheme?.properties?.[i];
    context.pcontext.scheme.properties[i] = s0;
    context.pcontext.scheme.properties[i - 1] = s1;
    context.pcontext.contextChange?.(context.pcontext, { key: i - 1 });
  }

  canArrayItemDown(context: ObjectEditor.Context) {
    const res = !(context?.pcontext == undefined
      || !ObjectEditor.isArray(context?.pcontext)
      || context?.key === undefined
      || context.pcontext?.scheme?.properties === undefined)
      && this.getNumber(context.key) < context.pcontext.value.length - 1;
    return res;
  }

  arrayItemDown(context: ObjectEditor.Context) {
    if (context?.key === undefined ||
      context.pcontext?.scheme?.properties === undefined) return;
    const i = Number(context.key);
    if ((i < 0) || (i >= context.pcontext.value.length - 1)) return;
    const v0 = context.pcontext.value[i];
    const v1 = context.pcontext.value[i + 1];
    context.pcontext.value[i + 1] = v0;
    context.pcontext.value[i] = v1;

    const s0 = context.pcontext?.scheme?.properties?.[i];
    const s1 = context.pcontext?.scheme?.properties?.[i + 1];
    context.pcontext.scheme.properties[i + 1] = s0;
    context.pcontext.scheme.properties[i] = s1;
    context.pcontext.contextChange?.(context.pcontext, { key: i + 1 });
  }

  hasOptionalProperties(): boolean {
    return this.getOptionalPropertyKeyLabelList().length > 0;
  }

  getOptionalPropertyKeyLabelList(): KeyLabel[] {
    if (!this.context) return [];
    const keyLabelList: KeyLabel[] = [];
    const keyList = ObjectEditor.getOptionalPropertyList(this.context);
    for (const key of keyList) {
      keyLabelList.push({ key, label: this.context.scheme?.properties?.[key]?.label ?? key });
    }
    return keyLabelList;
  }

  optionalPropertySel: string = '';

  optionalPropertySet() {
    const s = this.optionalPropertySel;
    if (s && this.context?.scheme?.properties?.[s]) {
      this.newProperty.property = s;
      this.newProperty.schemeKey = this.context.scheme?.properties[s].uibase ?? "";
      this.addProperty();
      this.newProperty.property = '';
      this.newProperty.schemeKey = '';
    }
    /*  //TODO async replaced by setTimeout to workaround source map problem  
        (async () => {
          this.optionalPropertySel = '';
        })();
    */
    setTimeout(() => this.optionalPropertySel = '', 10);
  }

  subContextList: { [key: number | string]: ObjectEditor.Context | undefined } = {};

  getSubContext(p: string | number): ObjectEditor.Context | undefined {
    if (!this.subContextList[p] && this.context) {
      this.subContextList[p] = ObjectEditor.getSubContext(this.context, p);
      if (this.subContextList[p] != undefined) {
        const pOnClick = this.subContextList[p]!.onClick;
        this.subContextList[p]!.onClick = (subContext: ObjectEditor.Context) => {
          this.onclick(this.subContextList[p]!);
          pOnClick?.(subContext);
        }
      }
    }
    return this.subContextList[p];
  }

  hasMask(context: ObjectEditor.Context) {
    return ObjectEditor.getMaskOptions(context) != undefined;
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }

  isArray() {
    return this.context ? ObjectEditor.isArray(this.context) : false;
  }
  isObject() {
    return this.context ? ObjectEditor.isObject(this.context) : false;
  }
  isSelect() {
    return this.context ? ObjectEditor.isSelect(this.context) : false;
  }
  isediting(subContext: ObjectEditor.Context) {
    return (subContext == this.editing);
    //    return (this.editing != undefined)&&((context == this.editing) || (this.subContextList?.[this.editing?.key ?? ''] == this.editing));
  }

  isReadOnly(context: ObjectEditor.Context): boolean {
    return ObjectEditor.isReadOnly(context);
  }

  isOptional(context: ObjectEditor.Context): boolean {
    return ObjectEditor.isOptional(context);
  }

  isHorizontal(context: ObjectEditor.Context) {
    return ObjectEditor.getUIEffects(context!)?.['horizontal'] ?? false;
  }

  isRadio(context: ObjectEditor.Context) {
    return ObjectEditor.getUIEffects(context!)?.['radio'] ?? false;
  }

  schemeSelect(context: ObjectEditor.Context, key?: string) {
    this.subContext = ObjectEditor.select(context, key);
  }

  getSelectionKeyLabels(context: ObjectEditor.Context) {
    const result: KeyLabel[] = [];
    const selList = ObjectEditor.getSelectionList(context);
    const keys = Object.keys(selList);
    for (let key of keys) {
      result.push({ key, label: selList[key].label ?? key });
    }
    return result;
  }

  getSelectionLabel(context: ObjectEditor.Context) {
    return ObjectEditor.getSelectionLabel(context) ?? 'select';
  }

  selectOnclick() {
    this._context?.onClick?.(this.context!);
  }

  getUIBase(context: ObjectEditor.Context) {
    return context.scheme?.uibase ?? '';
  }

  getDescriptionArticle(context: ObjectEditor.Context) {
    return ObjectEditor.getDescription(context);
  }

  getStyle(context: ObjectEditor.Context, stylePlus?: string) {
    const style = ObjectEditor.getStyle(context);
    const rStyle = style ? (style + (stylePlus ? ';' + stylePlus : '')) : stylePlus ?? '';
    return rStyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

  getInnerStyle(context: ObjectEditor.Context, stylePlus?: string) {
    const style = ObjectEditor.getInnerStyle(context);
    const rStyle = style ? (style + (stylePlus ? ';' + stylePlus : '')) : stylePlus ?? '';
    return rStyle;
  }

  getInnerStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getInnerStyleClass(context);
  }

  getDesignToken(context: ObjectEditor.Context) {
    return ObjectEditor.getDesignToken(context);
  }

  getUIEffects(): ObjectEditor.UIEffects {
    return ObjectEditor.getUIEffects(this.context!)!;
  }

  canToggle(): boolean {
    return this.getUIEffects()?.toggle ?? false;
  }

  onclick(context: ObjectEditor.Context, event?: MouseEvent) {
    this.propertyClickEvent = true;
    if (this.editing != context) {
      this.edittoggle(context);
    }
    this._context?.onClick?.(this.context!);
    /*    else {
          if (this.getHtmlType(context) == 'checkbox') {
            if (typeof this.context.value[p] != 'boolean') this.context.value[p] = ObjectEditor.convert(
              this.context.value[p],
              this.context.scheme!.properties![p]);
          }
        } */
  }
  edittoggle(context: ObjectEditor.Context) {
    if (this.editing === context) {
      this.editing = undefined;
      //      ObjectEditor.editUpdate(context);
    } else {
      this.editing = context;
      this.propertyClickEvent = true;
    }
  }

  updatePropertyList(subContext: ObjectEditor.Context) {
    this.setProperties();
  }

  setProperties(): void {
    if (!this.context) return;
    this.properties = ObjectEditor.getProperties(this.context);
    this.subContextList = {};
  }

  addProperty() {
    if (!this.context) return;
    this.editing = ObjectEditor.addProperty(this.context, this.newProperty);
    this.setProperties();
    this.newProperty = {
      property: '',
      schemeKey: ''
    };
    this.propertyListChange.emit(this.context);
  }

  canReset(context: ObjectEditor.Context) {
    return ObjectEditor.canReset(context);
  }

  reset(context: ObjectEditor.Context) {
    ObjectEditor.reset(context);
  }

  canDelete(context: ObjectEditor.Context) {
    return ObjectEditor.canDeleteProperty(context);
  }

  delete(context: ObjectEditor.Context) {
    ObjectEditor.deleteProperty(context);
    this.propertyListChange.emit(context);
  }

  getTextValue(o: any) {
    return JSON.stringify(o);
  }

  ngOnInit() {
    window.addEventListener('click', this.windowClickListener);
  }

  initContext() {
    if (!this.context) return;
    if (this.context.scheme?.uibase == 'select') {
      const editUpdate = this.context.editUpdate;
      this.context.editUpdate = () => {
        this.selectionKey = ObjectEditor.getSelectionKey(this.context);
        editUpdate?.(true);
      }
      this.selectionKey = ObjectEditor.getSelectionKey(this.context);
    }
    else {
      this.schemeOptions = ObjectEditor.getSelectionKeys(this.context);
      //    if(!this.context.value) this.context.value = {};
      if (!this.context.scheme) this.context.scheme = { uibase: 'object' };
      ObjectEditor.initContext(this.context);
      this.setProperties();
      this.context.contextChange = (context, env?: { [key: string | number]: any }) => {
        //this.ref.detectChanges();
        //this.reloadComponent();
        this.context = context;
        //this.setProperties();
        if (env?.['key'] != undefined) {
          this.propertyClickEvent = true;
          this.editing = this.getSubContext(env?.['key']);
        }
      };
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.windowClickListener);
  }

  invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
      g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
      b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + this.padZero(r) + this.padZero(g) + this.padZero(b);
  }

  padZero(str: string, len?: number) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
  }

}

