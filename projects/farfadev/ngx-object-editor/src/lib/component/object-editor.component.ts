/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import * as ObjectEditor from '../object-editor';
import * as ObjectEditorInt from '../object-editor-int';
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
export class ObjectEditorComponent implements OnInit, AfterViewInit, OnDestroy {

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
  get selectionKey() {
    return ObjectEditorInt.getSelectionKey(this.context);
  };

  set selectionKey(key: string | undefined) {
    this.schemeSelect(this.context!, key);
  }

  get subContext(): ObjectEditor.Context | undefined {
    return ObjectEditor.getSubContext(this.context!);
  };

  properties: (string | number)[] = [];
  schemeOptions: string[] = [];
  newProperty = {
    property: '',
    schemeKey: ''
  };

  canAddObjectProperty(): boolean {
    return (ObjectEditorInt.getUIBase(this.context) == 'object'
      && (this.newProperty.property != '')
      && (this.newProperty.schemeKey != '')
      && ObjectEditorInt.getUIValue(this.context!)?.[this.newProperty.property] == undefined);
  }

  canAddArrayElement(): boolean {
    return (ObjectEditorInt.getUIBase(this.context) == 'array'
      && (this.newProperty.schemeKey != '')
      && (this.context?.scheme?.length?.max ? ObjectEditorInt.getUIValue(this.context).length < this.context.scheme.length.max : true));
  }

  editing?: ObjectEditor.Context;
  propertyClickEvent = false;
  windowClickListener = (ev: MouseEvent) => {
    if (!this.propertyClickEvent && this.editing) {
      //      ObjectEditorInt.editUpdate(this.editing);
      this.editing = undefined;
    }
    this.propertyClickEvent = false;
  };

  constructor(@Host() elementRef: ElementRef) {
    this.ui_id = window.crypto.randomUUID();
    elementRef.nativeElement.setAttribute(_farfa_oe_marker, '');
  }

  canArrayItemUp(context: ObjectEditor.Context) {
    return ObjectEditor.canArrayItemUp(context);
  }

  arrayItemUp(context: ObjectEditor.Context) {
    ObjectEditor.arrayItemUp(context);
  }

  canArrayItemDown(context: ObjectEditor.Context) {
    return ObjectEditor.canArrayItemDown(context);
  }

  arrayItemDown(context: ObjectEditor.Context) {
    ObjectEditor.arrayItemDown(context);
  }

  hasOptionalProperties(): boolean {
    return this.getOptionalPropertyKeyLabelList().length > 0;
  }

  getOptionalPropertyKeyLabelList(): KeyLabel[] {
    if (!this.context) return [];
    const keyLabelList: KeyLabel[] = [];
    const keyList = ObjectEditorInt.getOptionalPropertyList(this.context, 'ui');
    for (const key of keyList) {
      keyLabelList.push({ key, label: ObjectEditorInt.getPropertyScheme(this.context.scheme,key)?.label ?? key });
    }
    return keyLabelList;
  }

  optionalPropertySel: string = '';

  optionalPropertySet() {
    const s = this.optionalPropertySel;
    if (s && ObjectEditorInt.getPropertyScheme(this.context?.scheme,s)) {
      this.newProperty.property = s;
      this.newProperty.schemeKey = ObjectEditorInt.getPropertyScheme(this.context?.scheme,s)?.uibase ?? "";
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

  getSubContext(p: string | number): ObjectEditor.Context | undefined {
    const subContext = ObjectEditorInt.getSubContext(this.context!, p);
    if (subContext?.onClick == undefined) {
      subContext!.onClick = (subContext: ObjectEditor.Context) => {
        this.onclick(subContext!);
      }
    }
    return subContext;
  }

  hasMask(context: ObjectEditor.Context) {
    return ObjectEditorInt.getMaskOptions(context) != undefined;
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditorInt.getLabel(subContext);
  }

  isArray() {
    return this.context ? ObjectEditorInt.isArray(this.context) : false;
  }
  isObject() {
    return this.context ? ObjectEditorInt.isObject(this.context) : false;
  }
  isSelect() {
    return this.context ? ObjectEditorInt.isSelect(this.context) : false;
  }
  isediting(subContext: ObjectEditor.Context) {
    return (subContext == this.editing);
    //    return (this.editing != undefined)&&((context == this.editing) || (this.subContextList?.[this.editing?.key ?? ''] == this.editing));
  }

  isReadOnly(context: ObjectEditor.Context): boolean {
    return ObjectEditorInt.isReadOnly(context);
  }

  isHorizontal(context: ObjectEditor.Context) {
    return ObjectEditorInt.getUIEffects(context!)?.['horizontal'] ?? false;
  }

  isRadio(context: ObjectEditor.Context) {
    return ObjectEditorInt.getUIEffects(context!)?.['radio'] ?? false;
  }

  schemeSelect(context: ObjectEditor.Context, key?: string) {
    ObjectEditorInt.select(context, key);
//    this.selectionKey = ObjectEditorInt.getSelectionKey(this.context) ?? "";
  }

  getSelectionKeyLabels(context: ObjectEditor.Context) {
    const result: KeyLabel[] = [];
    const selList = ObjectEditorInt.getSelectionList(context);
    const keys = Object.keys(selList);
    for (let key of keys) {
      result.push({ key, label: selList[key].label ?? key });
    }
    //console.log('SKL : ',JSON.stringify(result));
    return result;
  }

  getSelectionLabel(context: ObjectEditor.Context) {
    return ObjectEditorInt.getSelectionLabel(context) ?? '';
  }

  selectOnclick() {
    this._context?.onClick?.(this.context!);
  }

  getUIBase(context: ObjectEditor.Context) {
    return ObjectEditorInt.getUIBase(context) ?? '';
  }

  getDescriptionArticle(context: ObjectEditor.Context) {
    return ObjectEditorInt.getDescription(context);
  }

  getStyle(context: ObjectEditor.Context, stylePlus?: string) {
    const style = ObjectEditorInt.getStyle(context);
    const rStyle = style ? (style + (stylePlus ? ';' + stylePlus : '')) : stylePlus ?? '';
    return rStyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditorInt.getStyleClass(context);
  }

  getInnerStyle(context: ObjectEditor.Context, stylePlus?: string) {
    const style = ObjectEditorInt.getInnerStyle(context);
    const rStyle = style ? (style + (stylePlus ? ';' + stylePlus : '')) : stylePlus ?? '';
    return rStyle;
  }

  getInnerStyleClass(context: ObjectEditor.Context) {
    return ObjectEditorInt.getInnerStyleClass(context);
  }

  getDesignToken(context: ObjectEditor.Context) {
    return ObjectEditorInt.getDesignToken(context);
  }

  getUIEffects(): ObjectEditor.UIEffects {
    return ObjectEditorInt.getUIEffects(this.context!)!;
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
  }
  edittoggle(context: ObjectEditor.Context) {
    if (this.editing === context) {
      this.editing = undefined;
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
    this.properties = ObjectEditorInt.getProperties(this.context);
  }

  addProperty() {
    if (!this.context) return;
    this.editing = ObjectEditorInt.addProperty(this.context, this.newProperty);
    this.setProperties();
    this.newProperty = {
      property: '',
      schemeKey: ''
    };
    this.propertyListChange.emit(this.context);
  }

  canReset(context: ObjectEditor.Context) {
    return ObjectEditorInt.canReset(context);
  }

  reset(context: ObjectEditor.Context) {
    ObjectEditorInt.reset(context);
  }

  canDelete(context: ObjectEditor.Context) {
    return ObjectEditorInt.canDeleteProperty(context);
  }

  delete(context: ObjectEditor.Context) {
    ObjectEditorInt.deleteProperty(context);
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
    ObjectEditorInt.initContext(this.context);
    if (ObjectEditorInt.getUIBase(this.context) == 'select') {
      const editUpdate = this.context.editUpdate;
      this.context.editUpdate = () => {
//        this.selectionKey = ObjectEditorInt.getSelectionKey(this.context) ?? "";
        editUpdate?.(true);
      }
//      this.selectionKey = ObjectEditorInt.getSelectionKey(this.context) ?? "";
      const test = 0;
    }
    else {
      this.schemeOptions = ObjectEditorInt.getSelectionKeys(this.context);
      //    if(!this.context.value) this.context.value = {};
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

  ngAfterViewInit(): void {
    if (this.isObject() || this.isArray() || this.isSelect())
      ObjectEditorInt.uiinitialized(this.context!);
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.windowClickListener);
    ObjectEditorInt.uidestroyed(this.context!);
  }

}

