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
import { adjustNumber } from '../../adjust/adjust-number';
import { InputSocket } from '../../input/input-socket';

@Component({
  standalone: false,
  selector: 'oe-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OENumberComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('objectcontainer')
  private objectContainer!: ElementRef<HTMLElement>;

  _context?: ObjectEditor.Context;
  get context(): ObjectEditor.Context | undefined {
    return this._context;
  }
  @Input()
  set context(value: ObjectEditor.Context) {
    this._context = value;
    this.setAdjustSocket();
  }

  ui_id;

  err_msg: string = '';

  value: string = '';

  inputElement?: HTMLElement;

  adjustSocket?: InputSocket;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  setAdjustSocket() {
    if (this.inputElement) {
      this.adjustSocket = new InputSocket(this.inputElement as HTMLInputElement, this.context?.scheme?.adjust ?? adjustNumber({}), this.context!, (context: any, err_msg: string) => {
        this.err_msg = err_msg;
        context.editUpdate(true);
      });
    }
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.inputElement = document.getElementById(this.getId()) as HTMLInputElement;
    this.setAdjustSocket();
  }

  ngOnDestroy(): void {
  }

  getStyle(context: ObjectEditor.Context) {
    const stylePlus = this.err_msg != '' ? 'color:red' : '';
    const rstyle = ObjectEditor.getStyle(context);

    return rstyle ? rstyle + ';' + stylePlus : stylePlus;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }
}

