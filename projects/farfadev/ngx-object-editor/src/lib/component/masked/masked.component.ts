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

import IMask, { InputMask } from 'imask';

@Component({
  standalone: false,
  selector: 'oe-masked',
  templateUrl: './masked.component.html',
  styleUrls: ['./masked.component.scss'],
  //  encapsulation: ViewEncapsulation.Emulated
})
export class OEMaskedComponent implements OnInit, OnDestroy, AfterViewInit {
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

  err_msg: string = '';

  value: string = '';

  mask?: InputMask;

  inputElement?: HTMLInputElement;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.inputElement = document.getElementById(this.getId()) as HTMLInputElement;
    this.initMask();
  }

  ngOnDestroy(): void {
    this.mask?.destroy();
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

  onclick() {
    this._context?.pcontext?.onClick?.(this._context);
  }

  stripFormat(value: string) {
    //TODO
    return value;
  }

  editUpdate() {
    this.context!.value = this.value;
    this._context!.editUpdate?.();
  }

  initMask() {
    if (this.context !== undefined && this.inputElement !== undefined) {
      const options = ObjectEditor.getMaskOptions(this.context);
      if (options !== undefined) {
        options['commit'] = (value: any, masked: any) => {
          if (this.context) {
//            this.value = value;
//            this.editUpdate();
          }
        };
        if (options['mask'] === undefined) {
          options['mask'] = /^.*$/
        };
        if (this.inputElement != undefined && this.mask == undefined) {
          this.mask = IMask(this.inputElement, options);
          this.mask.value = this.context.value.toString();
          this.mask.on('accept', () => {
            if (this.context !== undefined && this.mask !== undefined) {
              this.value = this.mask.unmaskedValue;
              this.editUpdate();
            }
          });
        }
        else if (this.mask)
          this.mask.updateOptions(options);
      }
    }
  }

  initContext() {
    if (!this.context) return;
    this.initMask();
    //TODO on editupdates check maskoptions need an update
  }

}

