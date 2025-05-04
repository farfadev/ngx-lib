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
import { ObjectEditor } from '../../object-editor';
import { colorNames, getColorHex, getColorName } from '../../utils/color-table';

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
  set context(value: ObjectEditor.Context) {
    this._context = value;
    this._colorPick = getColorHex(value.value) ?? '#ffffff';
    this._colorName = getColorName(value.value) ?? '';
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
    return ObjectEditor.isReadOnly(context);
  }

  isHorizontal() {
    return ObjectEditor.getUIEffects(this.context!)?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const customElement = document.getElementById(this.getId()) as HTMLInputElement;
    const attributes = ObjectEditor.getInputAttributes(this.context!);
    if(attributes != undefined) {
      for (const key of Object.keys(attributes)) {
        customElement.setAttribute(key,attributes[key]);
      }
    }
  }

  ngOnDestroy(): void {
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }

  onclick() {
    this._context?.onClick?.(this.context!);
  }

  initContext() {
    if (!this.context) return;
  }

  getHtmlType(context: ObjectEditor.Context) {
    return context?.scheme?.uibase;
  }

  getStyle(context: ObjectEditor.Context) {
    const rstyle = ObjectEditor.getStyle(context);
    return rstyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

  getColorNames() {
    return colorNames;
  }
}

