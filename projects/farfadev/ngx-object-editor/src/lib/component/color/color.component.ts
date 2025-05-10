/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as ObjectEditor from '../../object-editor';
import * as ObjectEditorInt from '../../object-editor-int';
import { colorNames, getColorHex, getColorName } from '../../color-utils/color-table';

@Component({
  standalone: false,
  selector: 'oe-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OEColorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('objectcontainer')
  private objectContainer!: ElementRef<HTMLElement>;

  _context?: ObjectEditor.Context;
  get context(): ObjectEditor.Context | undefined {
    return this._context;
  }
  @Input()
  set context(context: ObjectEditor.Context) {
    this._context = context;
    this._colorPick = getColorHex(context.value) ?? '#ffffff';
    this._colorName = getColorName(context.value) ?? '';
    this.initContext();
  }

  _colorName!: string;
  _colorPick!: string;
  get colorPick() {
    return this._colorPick;
  }
  set colorPick(v: string) {
    this._colorPick = v;
    this._colorName = getColorName(v) ?? '';
    this.context!.value = v;
  }
  get colorName() {
    return this._colorName;
  }
  set colorName(v: string) {
    this._colorPick = getColorHex(v) ?? '0xffffff';
    this._colorName = v;
    this.context!.value = this.colorPick;
  }

  ui_id;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  isReadOnly(context: ObjectEditor.Context) {
    return ObjectEditorInt.isReadOnly(context);
  }

  isHorizontal() {
    return ObjectEditorInt.getUIEffects(this.context!)?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const customElement = document.getElementById(this.getId()) as HTMLInputElement;
    const attributes = ObjectEditorInt.getInputAttributes(this.context!);
    if(attributes != undefined) {
      for (const key of Object.keys(attributes)) {
        customElement.setAttribute(key,attributes[key]);
      }
    }
    ObjectEditorInt.uiinitialized(this.context!);
  }

  ngOnDestroy(): void {
    ObjectEditorInt.uidestroyed(this.context!);
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditorInt.getLabel(subContext);
  }

  onclick() {
    this._context?.onClick?.(this.context!);
  }

  initContext() {
    if (!this.context) return;
    const peditUpdate = this.context.editUpdate;
    this.context.editUpdate = (self?: boolean) => {
      this._colorPick = getColorHex(this.context?.value) ?? '#ffffff';
      this._colorName = getColorName(this.context?.value) ?? '';  
      peditUpdate?.(self);
    }
  }

  getHtmlType(context: ObjectEditor.Context) {
    return context?.scheme?.uibase;
  }

  getStyle(context: ObjectEditor.Context) {
    const rstyle = ObjectEditorInt.getStyle(context);
    return rstyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditorInt.getStyleClass(context);
  }

  getColorNames() {
    return colorNames;
  }
}

