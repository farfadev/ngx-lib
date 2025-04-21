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
import { ObjectEditor } from '../../object-editor';

@Component({
  standalone: false,
  selector: 'oe-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OECheckboxComponent implements OnInit, OnDestroy {
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

  isReadOnly(context: ObjectEditor.Context) {
    return ObjectEditor.isReadOnly(context);
  }

  isHorizontal() {
    return ObjectEditor.getUIEffects(this.context!)?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
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

  getStyle(context: ObjectEditor.Context) {
    const rstyle = ObjectEditor.getStyle(context);
    return rstyle;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

}

