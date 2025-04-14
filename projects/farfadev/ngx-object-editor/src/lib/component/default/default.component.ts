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

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
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

}

