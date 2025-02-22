/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ObjectEditor, Scheme } from '../object-editor';
import { ObjectEditorContext } from '../object-editor-context';

@Component({
  standalone: false,
  selector: 'object-editor',
  templateUrl: './object-editor.component.html',
  styleUrls: ['./object-editor.component.scss'],
})
export class ObjectEditorComponent implements OnInit, OnDestroy {
  @ViewChild('objectcontainer')
  private objectContainer!: ElementRef<HTMLElement>;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input()
  context!: ObjectEditorContext;

  ui_id;

  private _sel?: string;

  properties: string[] = [];
  typeoptions: string[] = [];
  newProperty = {
    property: '',
    type: ''
  };

  editing?: string | number;
  propertyClickEvent = false;
  windowClickListener = (ev: MouseEvent) => {
    if (!this.propertyClickEvent) {
      this.editing = '';
    }
    this.propertyClickEvent = false;
  };

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  hasListSel(): boolean {
    return this.getListSel().length > 0;
  }

  getListSel(): string[] {
    if (!this.context.scheme?.properties) {
      return [];
    }
    const isel = Object.keys(this.context.scheme?.properties);
    const rsel: string[] = [];
    isel.forEach((s) => {
      if (!this.context.value?.hasOwnProperty(s)) {
        rsel.push(s);
      }
    });
    return rsel;
  }

  set sel(s: string | undefined) {
    if (s && this.context.scheme?.properties?.[s]) {
      this._sel = s;
      this.newProperty.property = s;
      this.newProperty.type = this.context.scheme?.properties[s].uibase ?? "";
      this.addNewProperty();
    }
  }

  get sel() {
    return this._sel;
  }

  getSubContext(p: string | number): ObjectEditorContext {
    if (this.context.scheme?.uibase ?? '' in ['object', 'array'])
      return {
        scheme: this.context.scheme?.properties?.[p],
        value: this.context.value[p],
        propertyName: p,
        editUpdate: this.context.editUpdate,
        contextChange: this.context.contextChange
      }
    else {
      return {

      }
    }
  }

  getLabel() {
    return this.context.scheme?.label ?? this.context.propertyName;
  }

  isArray() {
    return this.context.scheme?.uibase == 'array';
  }
  isediting(p: string | number) {
    return p === this.editing;
  }

  isReadOnly(p: string | number): boolean {
    return this.context.scheme?.properties?.[p]?.readonly ?? false;
  }

  isRestricted(p?: string | number): boolean {
    if (p) {
      return this.context.scheme?.properties?.[p]?.optional ?? false;
    }
    else {
      return this.context.scheme?.restricted ?? false;
    }
  }

  isOptional(p?: string | number): boolean {
    if (p) {
      return this.context.scheme?.properties?.[p]?.optional ?? false;
    }
    else {
      return this.context.scheme?.optional ?? false;
    }
  }

  getHtmlType(p: string | number) {
    return ObjectEditor.getScheme(this.context?.scheme?.properties?.[p]?.uibase)?.html;
  }

  onclick(p: string | number, event: MouseEvent) {
    this.propertyClickEvent = true;
    if (this.editing != p) {
      this.edittoggle(p, event);
    }
    else {
      if (this.getHtmlType(p) == 'checkbox') {
        if (typeof this.context.value[p] != 'boolean') this.context.value[p] = ObjectEditor.convert(
          this.context.value[p],
          this.context.scheme!.properties![p]);
      }
    }
  }
  edittoggle(p: string | number, event: MouseEvent) {
    if (this.editing === p) {
      this.editing = undefined;
      this.editUpdate(p);
    } else {
      this.editing = p;
      this.propertyClickEvent = true;
    }
  }

  setProperties(): void {
    this.properties = [];
    for (const sp of Object.keys(this.context.scheme?.properties ?? {})) {
      if (this.context.value?.[sp]) {
        this.properties.push(sp);
      }
    }
    for (const sp of Object.keys(this.context.value ?? {})) {
      if (sp !== '_scheme' && !this.properties.includes(sp)) {
        this.properties.push(sp);
      }
    };
  }

  addNewProperty() {
    if (this.context.scheme === undefined) {
      this.context.scheme = { uibase: 'object' };
    }
    if (this.context.scheme.uibase != 'object' &&
      this.context.scheme.uibase != 'array') {
      return;
    }
    if (
      this.newProperty.property &&
      this.newProperty.property !== '' &&
      // cannot replace existing property
      this.context.value[this.newProperty.property] === undefined &&
      // sanity check on newproperty type
      ObjectEditor.isScheme(this.newProperty.type)
    ) {
      if (!this.context.scheme.properties)
        this.context.scheme.properties = {};
      // if there is no preset scheme for the added property
      // then create one based on the type, and mark it optional and deletable
      if (!this.context.scheme.properties[this.newProperty.property])
        this.context.scheme.properties[this.newProperty.property] = {
          uibase: this.newProperty.type as Scheme['uibase'],
          optional: true,
          deletable: true
        };
      this.context.value[this.newProperty.property] =
        ObjectEditor.initValue(undefined,
          this.context.scheme.properties?.[this.newProperty.property])
      this.editing = this.newProperty.property;
      this.setProperties();
      this.newProperty = {
        property: '',
        type: ''
      };
      this.editUpdate(this.editing);
    }
  }

  delete(p: string | number) {
    if (this.context.scheme?.properties?.[p].optional) {
      delete this.context.value[p];
    }
    if (this.context.scheme?.properties?.[p].deletable) {
      delete this.context.scheme.properties[p];
    }
    this.setProperties();
    if (this.context.editUpdate) {
      this.context.editUpdate(this.context, p);
    }
  }

  ngOnInit() {
    window.addEventListener('click', this.windowClickListener);
    this.setProperties();
    this.typeoptions = ObjectEditor.getSchemes();
    //    if(!this.context.value) this.context.value = {};
    if (!this.context.scheme) this.context.scheme = { uibase: 'object' };
    ObjectEditor.initValue(this.context.value, this.context.scheme);
    this.context.contextChange = (context) => {
      //this.ref.detectChanges();
      //this.reloadComponent();
      this.context = context;
      this.setProperties();
    };
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.windowClickListener);
  }

  private editUpdate(p: string | number) {
    if (this.context.editUpdate) {
      if (!this.context.value) this.context.value = {};
      if (!this.context.scheme) this.context.scheme = { uibase: 'object', properties: {} };
      this.context.value[p] = ObjectEditor.convert(
        this.context.value[p],
        this.context.scheme.properties![p]
      );
      this.context.editUpdate(this.context, p);
    }
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

