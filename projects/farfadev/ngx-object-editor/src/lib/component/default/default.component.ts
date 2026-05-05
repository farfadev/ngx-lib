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

@Component({
  standalone: false,
  selector: 'oe-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OEDefaultComponent implements OnInit, OnDestroy, AfterViewInit {
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

  ui_id;

  get value(): any {
    return ObjectEditorInt.getUIValue(this.context!);
  }

  set value(v: any) {
    ObjectEditorInt.setUIValue(this.context!, v);
  }


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
    return this.context!.getUIEffects()?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const customElement = document.getElementById(this.getId()) as HTMLInputElement;
    const attributes = this.context!.getInputAttributes();
    if (attributes != undefined) {
      for (const key of Object.keys(attributes)) {
        customElement.setAttribute(key, attributes[key]);
      }
    }
  }

  ngOnDestroy(): void {
  }

  getLabel(subContext: ObjectEditor.Context) {
    return subContext.getLabel();
  }

  onclick() {
    // this._context?.onClick?.(this.context!);
  }

  initContext() {
    if (!this.context) return;
  }

  getHtmlType(context: ObjectEditor.Context) {
    if (context?.scheme?.uibase == 'datetime') return 'datetime-local';
    return context?.scheme?.uibase;
  }

  getStyle(context: ObjectEditor.Context) {
    const rstyle = context.getStyle();
    return rstyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return context.getStyleClass();
  }

}

