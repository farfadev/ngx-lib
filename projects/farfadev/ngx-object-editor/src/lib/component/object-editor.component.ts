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
  signal,
  ViewEncapsulation
} from '@angular/core';
import * as ObjectEditor from '../object-editor';
import { _farfa_oe_marker } from './markers';
import { Subscription } from 'rxjs';

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

  _context: ObjectEditor.Context = {scheme: {uibase: 'none'}} as ObjectEditor.Context;
  get context(): ObjectEditor.Context {
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

  updateSubscription: Subscription | undefined;

  updateSignal = signal(0n);

  // binding to toggle the root fieldset
  root_fieldset_expanded = true;

  // for the select uibase
  get selectionKey() {
    return this.context?.getSelectionKey();
  };

  set selectionKey(key: string | undefined) {
    this.schemeSelect(this.context!, key);
  }

  get subContext(): ObjectEditor.Context | undefined {
    return this.context?.getSubContext();
  };

  properties: (string | number)[] = [];
  schemeOptions: string[] = [];
  newProperty = {
    property: '',
    schemeKey: ''
  };

  canAddObjectProperty(): boolean {
    return (this.context?.getUIBase() == 'object'
      && (this.newProperty.property != '')
      && (this.newProperty.schemeKey != '')
      && this.context!.getUIValue()?.[this.newProperty.property] == undefined);
  }

  canAddArrayElement(): boolean {
    return (this.context?.getUIBase() == 'array'
      && (this.newProperty.schemeKey != '')
      && (this.context?.scheme?.length?.max ? this.context!.getUIValue()!.length < this.context.scheme.length.max : true));
  }

  windowClickListener = (ev: MouseEvent) => {
    // TODO placeholder
  };

  constructor(@Host() elementRef: ElementRef) {
    this.ui_id = window.crypto.randomUUID();
    elementRef.nativeElement.setAttribute(_farfa_oe_marker, '');
  }

  canArrayItemUp(context: ObjectEditor.Context) {
    return context.canArrayItemUp();
  }

  arrayItemUp(context: ObjectEditor.Context) {
    context.arrayItemUp();
  }

  canArrayItemDown(context: ObjectEditor.Context) {
    return context.canArrayItemDown();
  }

  arrayItemDown(context: ObjectEditor.Context) {
    context.arrayItemDown();
  }

  hasOptionalProperties(): boolean {
    return this.getOptionalPropertyKeyLabelList().length > 0;
  }

  getOptionalPropertyKeyLabelList(): KeyLabel[] {
    if (!this.context) return [];
    const keyLabelList: KeyLabel[] = [];
    const keyList = this.context.getOptionalPropertyList('ui');
    for (const key of keyList) {
      keyLabelList.push({ key, label: this.context!.getPropertyScheme(key)?.label ?? key });
    }
    return keyLabelList;
  }

  optionalPropertySel: string = '';

  optionalPropertySet() {
    const s = this.optionalPropertySel;
    if (s && this.context!.getPropertyScheme(s)) {
      this.newProperty.property = s;
      this.newProperty.schemeKey = this.context!.getPropertyScheme(s)?.uibase ?? "";
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
    const subContext = this.context!.getSubContext(p);
    return subContext;
  }

  hasMask(context: ObjectEditor.Context) {
    return context.getMaskOptions() != undefined;
  }

  getLabel(subContext: ObjectEditor.Context) {
    return subContext.getLabel();
  }

  isArray() {
    return this.context ? this.context.isArray() : false;
  }
  isObject() {
    return this.context ? this.context.isObject() : false;
  }
  isSelect() {
    return this.context ? this.context.isSelect() : false;
  }

  isReadOnly(context: ObjectEditor.Context): boolean {
    return context.isReadOnly();
  }

  isHorizontal(context: ObjectEditor.Context) {
    return context.getUIEffects()?.['horizontal'] ?? false;
  }

  isRadio(context: ObjectEditor.Context) {
    return context.getUIEffects()?.['radio'] ?? false;
  }

  schemeSelect(context: ObjectEditor.Context, key?: string) {
    context.select(key);
    //    this.selectionKey = ObjectEditorInt.getSelectionKey(this.context) ?? "";
  }

  getSelectionKeyLabels(context: ObjectEditor.Context) {
    const result: KeyLabel[] = [];
    const selList = context.getSelectionList() ?? {};
    const keys = Object.keys(selList);
    for (let key of keys) {
      result.push({ key, label: selList[key].label ?? key });
    }
    //console.log('SKL : ',JSON.stringify(result));
    return result;
  }

  getSelectionLabel(context: ObjectEditor.Context) {
    return context.getSelectionLabel() ?? '';
  }

  selectOnclick() {
    //this._context?.onClick?.(this.context!);
  }

  getUIBase(context: ObjectEditor.Context) {
    return context.getUIBase() ?? '';
  }

  getDescriptionArticle(context: ObjectEditor.Context) {
    return context.getDescription();
  }

  getStyle(context: ObjectEditor.Context, stylePlus?: string) {
    const style = context.getStyle();
    const rStyle = style ? (style + (stylePlus ? ';' + stylePlus : '')) : stylePlus ?? '';
    return rStyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return context.getStyleClass();
  }

  getInnerStyle(context: ObjectEditor.Context, stylePlus?: string) {
    const style = context.getInnerStyle();
    const rStyle = style ? (style + (stylePlus ? ';' + stylePlus : '')) : stylePlus ?? '';
    return rStyle;
  }

  getInnerStyleClass(context: ObjectEditor.Context) {
    return context.getInnerStyleClass();
  }

  getDesignToken(context: ObjectEditor.Context) {
    return context.getDesignToken();
  }

  getUIEffects(): ObjectEditor.UIEffects {
    return this._context?.getUIEffects() ?? {};
  }

  canToggle(): boolean {
    return this.getUIEffects()?.toggle ?? false;
  }

  updatePropertyList(subContext: ObjectEditor.Context) {
    this.setProperties();
  }

  setProperties(): void {
    if (!this.context) return;
    this.properties = this.context.getProperties();
  }

  addProperty() {
    if (!this.context) return;
    this.context.addProperty(this.newProperty.property, this.newProperty.schemeKey);
    this.setProperties();
    this.newProperty = {
      property: '',
      schemeKey: ''
    };
    this.propertyListChange.emit(this.context);
  }

  canReset(context: ObjectEditor.Context) {
    return context.canReset();
  }

  reset(context: ObjectEditor.Context) {
    context.reset();
  }

  canDelete(context: ObjectEditor.Context) {
    return context.canDeleteProperty();
  }

  delete(context: ObjectEditor.Context) {
    context.deleteProperty();
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
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = this.context.subscribe?.((o: Record<string|number,any>) => {
      this.setProperties();
      this.updateSignal.update((v: bigint) => ++v);
    });
    if (this.context.getUIBase() == 'select') {
      const test = 0;
    }
    else {
      this.schemeOptions = this.context.getSelectionKeys();
      this.setProperties();
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.windowClickListener);
    this.context?.unsubscribe(this.updateSubscription);
  }
}

