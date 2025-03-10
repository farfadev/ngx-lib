/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ObjectEditor } from '../object-editor';
import { ObjectEditorModule } from '../object-editor.module';

type KeyLabel = {
  key: string | number;
  label: string | number;
}
@Component({
  standalone: false,
  selector: 'object-editor',
  templateUrl: './object-editor.component.html',
  styleUrls: ['./object-editor.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ObjectEditorComponent implements OnInit, OnDestroy {
  @ViewChild('objectcontainer')
  private objectContainer!: ElementRef<HTMLElement>;

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
  primeNg: boolean = false; // if true, will use the primeng components

  ui_id;

  // binding to toggle the root fieldset
  root_fieldset_expanded = true;

  // bindings to select the scheme on 'select' schemes
  _schemeSelectionKey?:  string
  set schemeSelectionKey(v: string | undefined) {
    this._schemeSelectionKey = v;
    if(this.context) this.selectScheme(this.context, v);
  };
  get schemeSelectionKey(): string | undefined {
    return this._schemeSelectionKey ?? '';
  }
  selectionObj?: KeyLabel;

  // holds the selected scheme when a 'select' scheme has been selected
  selectedSubContext?: ObjectEditor.Context;

  /*  set selectionKey(o: { key: string, label: string }) {
      if (this.editing) {
        this._selectionKey = o;
        ObjectEditor.selectScheme(this.editing, o.key);
      }
    }
  
    get selectionKey(): { key: string, label: string } | undefined {
      return this._selectionKey;
    }
  */
  properties: (string | number)[] = [];
  innerSchemeOptions: (string | number)[] = [];
  newProperty = {
    property: '',
    schemeKey: ''
  };
  canAddProperty(): boolean {
    return ((this.newProperty.property != '')
      && (this.newProperty.schemeKey != '')
      && this.context?.value[this.newProperty.property] == undefined);
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

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  hasOptionalProperties(): boolean {
    return this.getOptionalPropertyKeyLabelList().length > 0;
  }

  getOptionalPropertyKeyLabelList(): KeyLabel[] {
    if (!this.context) return [];
    const keyLabelList: KeyLabel[] = [];
    const keyList = ObjectEditor.getOptionalPropertyList(this.context);
    for(const key of keyList) {
      keyLabelList.push({key, label: this.context.scheme?.properties?.[key]?.label ?? key});
    }
    return keyLabelList;
  }

  optionalPropertySel: string = '';
  
  optionalPropertySet() {
    const s = this.optionalPropertySel;
    if (s && this.context?.scheme?.properties?.[s]) {
      this.newProperty.property = s;
      this.newProperty.schemeKey = this.context.scheme?.properties[s].uibase ?? "";
      this.addNewProperty();
      this.newProperty.property = '';
      this.newProperty.schemeKey = '';
    }
    (async () => this.optionalPropertySel = '')();
  }

  subContextList: { [key: number | string]: ObjectEditor.Context | undefined } = {};

  getSubContext(p: string | number): ObjectEditor.Context | undefined {
    if (!this.subContextList[p] && this.context) {
      this.subContextList[p] = ObjectEditor.getSubContext(this.context, p);
    }
    return this.subContextList[p];
  }

  selectScheme(context: ObjectEditor.Context, schemeKey?: string | number) {
    this.selectedSubContext = ObjectEditor.selectScheme(context, schemeKey);
    this.selectionObj = undefined;
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }

  getSchemeSelectionList(context: ObjectEditor.Context) {
    const result: KeyLabel[] = [];
    const selList = ObjectEditor.getSchemeSelectionList(context.scheme);
    const keys = Object.keys(selList);
    for (let key of keys) {
      result.push({ key, label: selList[key].label ?? key });
    }
    return result;
  }

  isArray() {
    return this.context ? ObjectEditor.isArray(this.context) : false;
  }
  isObject() {
    return this.context ? ObjectEditor.isObject(this.context) : false;
  }
  isediting(context: ObjectEditor.Context) {
    return context == this.editing;
  }

  isReadOnly(context: ObjectEditor.Context): boolean {
    return ObjectEditor.isReadOnly(context);
  }

  isRestricted(context: ObjectEditor.Context): boolean {
    return ObjectEditor.isRestricted(context);
  }

  isOptional(context: ObjectEditor.Context): boolean {
    return ObjectEditor.isOptional(context);
  }

  getHtmlType(context: ObjectEditor.Context) {
    return ObjectEditor.getBaseScheme(context)?.html;
  }

  getDescriptionArticle(context: ObjectEditor.Context) {
    return ObjectEditor.getDescription(context);
  }

  getStyle(context: ObjectEditor.Context) {
    return ObjectEditor.getStyle(context);
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

  getDesignToken(context: ObjectEditor.Context) {
    return ObjectEditor.getDesignToken(context);
  }

  onclick(context: ObjectEditor.Context, event: MouseEvent) {
    this.propertyClickEvent = true;
    if (this.editing != context) {
      this.edittoggle(context, event);
    }
    /*    else {
          if (this.getHtmlType(context) == 'checkbox') {
            if (typeof this.context.value[p] != 'boolean') this.context.value[p] = ObjectEditor.convert(
              this.context.value[p],
              this.context.scheme!.properties![p]);
          }
        } */
  }
  edittoggle(context: ObjectEditor.Context, event: MouseEvent) {
    if (this.editing === context) {
      this.editing = undefined;
      //      ObjectEditor.editUpdate(context);
    } else {
      this.editing = context;
      this.propertyClickEvent = true;
    }
  }

  setProperties(): void {
    if (!this.context) return;
    this.properties = ObjectEditor.getProperties(this.context);
    this.subContextList = {};
    (async () => this.optionalPropertySel = '')();
  }

  addNewProperty() {
    if (!this.context) return;
    this.editing = ObjectEditor.addNewProperty(this.context, this.newProperty);
    this.setProperties();
    this.newProperty = {
      property: '',
      schemeKey: ''
    };
  }

  delete(context: ObjectEditor.Context) {
    ObjectEditor.deleteProperty(context);
    this.setProperties();
  }

  ngOnInit() {
    window.addEventListener('click', this.windowClickListener);
  }

  initContext() {
    if (!this.context) return;
    this.setProperties();
    this.innerSchemeOptions = ObjectEditor.getInnerSchemeSelectionKeys(this.context.scheme);
    //    if(!this.context.value) this.context.value = {};
    if (!this.context.scheme) this.context.scheme = { uibase: 'object' };
    ObjectEditor.initValue(this.context.value, this.context.scheme);
    if(this.context?.scheme?.uibase == 'select' && typeof this.context?.key == 'string') {
      this.selectScheme(this.context,this.context.key)
    }
    this.context.contextChange = (context) => {
      //this.ref.detectChanges();
      //this.reloadComponent();
      this.context = context;
      this.setProperties();
    };
    const editUpdate = this.context.editUpdate;
    this.context.editUpdate = () => {
      if (editUpdate) editUpdate();
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

