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

@Component({
  standalone: false,
  selector: 'oe-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OECheckboxComponent implements OnInit, AfterViewInit, OnDestroy {
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

  get value(): boolean {
    return this.context?.getUIValue() ?? false;
  }

  set value(v: boolean) {
    this.context!.setUIValue(v);
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
    return this.context?.getUIEffects()?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
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

  getStyle(context: ObjectEditor.Context) {
    const rstyle = context.getStyle();
    return rstyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return context.getStyleClass();
  }

}

