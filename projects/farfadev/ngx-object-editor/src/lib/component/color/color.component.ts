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
    this._colorPick = getColorHex(context.getUIValue()) ?? '#ffffff';
    this._colorName = getColorName(context.getUIValue()) ?? '';
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
    this.context!.setUIValue(v);
  }
  get colorName() {
    return this._colorName;
  }
  set colorName(v: string) {
    this._colorPick = getColorHex(v) ?? '0xffffff';
    this._colorName = v;
    this.context!.setUIValue(this.colorPick);
  }

  ui_id;

  updateSubscription: any;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  isReadOnly(context: ObjectEditor.Context) {
    return context.isReadOnly();
  }

  isHorizontal() {
    return this.context?.getUIEffects()?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const customElement = document.getElementById(this.getId()) as HTMLInputElement;
    const attributes = this.context?.getInputAttributes();
    if(attributes != undefined) {
      for (const key of Object.keys(attributes)) {
        customElement.setAttribute(key,attributes[key]);
      }
    }
  }

  ngOnDestroy(): void {
    this.context?.unsubscribe(this.updateSubscription);
  }

  getLabel(subContext: ObjectEditor.Context) {
    return subContext.getLabel();
  }

  onclick() {
//    this._context?.onClick?.(this.context!);
  }

  initContext() {
    if (!this.context) return;
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = this.context.subscribe((o: object) => {
      this._colorPick = getColorHex(this.context?.getUIValue()) ?? '#ffffff';
      this._colorName = getColorName(this.context?.getUIValue()) ?? '';  
    })
  }

  getHtmlType(context: ObjectEditor.Context) {
    return context?.scheme?.uibase;
  }

  getStyle(context: ObjectEditor.Context) {
    const rstyle = context.getStyle();
    return rstyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return context.getStyleClass();
  }

  getColorNames() {
    return colorNames;
  }
}

