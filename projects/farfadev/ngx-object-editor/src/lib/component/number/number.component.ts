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
//import { abs, floor, log10, round, sign } from 'mathjs';
import Decimal from 'decimal.js';

type KeyLabel = {
  key: string | number;
  label: string | number;
}
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
    this.initContext();
  }

  ui_id;

  err_msg: string = '';

  value: string = '';

  inputElement?: HTMLInputElement;

  dataPositions = [];

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
    if (this.inputElement) {
      this.inputElement.addEventListener('keyup', (event: KeyboardEvent) => {
        //this.adjustBOM();
      })
      this.inputElement.onkeydown = (e: KeyboardEvent) => {
        if (e.key == '-') {
          if (this.value.indexOf('-') >= 0) return false;
          if (this.inputElement!.selectionStart??-1 > 0) return false;
        }
        if (['.'].includes(e.key)) {
          if (this.value.indexOf('.') >= 0) return false;
        }
        return (e.key.length == 1 && ("-1234567890.".indexOf(e.key) >= 0)) ||
          ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'].includes(e.key)
      };
    }
  }

  ngOnDestroy(): void {
  }

  getStyle(context: ObjectEditor.Context) {
    const stylePlus = this.err_msg!=''?'color:red':'';
    const rstyle = ObjectEditor.getStyle(context);
    
    return rstyle ? rstyle+';'+stylePlus:stylePlus;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }

  onclick() {
    //this.adjustBOM();
    this._context?.onClick?.();
  }

  stripFormat(v: string): string {
    v = v.replaceAll(' ', '').replace(',', '.');
    return v;
  }

  numberWithSeparator(x: string, c: string): string {
//    return x.replace(/\B(?=(\d{3}?)+(?!\d))/g, c);
    let r: string = '';
    let vl: string = '';
    let vr: string = '';
    const ds = x.indexOf('.');
    if(ds >=0) {
      [vl , vr ] = x.split('.');
    }
    else {
      vl = x;
      vr = '';
    }
    for(let i = vl.length-1;i>=0;i--) {
      if(((vl.length-i)%3 == 1)&&(i!=(vl.length-1))) r = ' '+r;
      r = vl.charAt(i) + r;
    }
    if(ds >= 0) r = r + '.';
    for(let i = 0; i<vr.length;i++) {
      if(((i)%3 == 0)&&(i!=0)) r = r+' ';
      r = r + vr.charAt(i);
    }
    return r;
  }

  format(v: string) {
    v = this.stripFormat(v);
    v = this.numberWithSeparator(v, ' ');
    return v;
  }

  validate() {
    this.err_msg = '';
    let rValue: number = Number(this.stripFormat(this.value));
    if ((this.context?.scheme?.min != undefined) && rValue < this.context?.scheme?.min) {
      this.err_msg = 'value below minimum ' + this.context?.scheme?.min;
      rValue = this.context?.scheme?.min
    }
    else if ((this.context?.scheme?.max != undefined) && rValue > this.context?.scheme?.max) {
      this.err_msg = 'value over maximum ' + this.context?.scheme?.max;
      rValue = this.context?.scheme?.max
    }
    else if (this.context?.scheme?.significants != undefined) {
      if (this.countSignificant(rValue) > this.context?.scheme?.significants) {
        this.err_msg = 'value significant digits over maximum ' + this.context?.scheme?.significants;
      };
      rValue = this.roundSignificant(rValue, this.context?.scheme?.significants);
    }
    this.context!.value = rValue;
  }

  adjustCursor(v:string,count: number): number {
    let r = 0;
    for(const c of [...v]) {
      if(count == 0) break;
      if("-0123456789.".indexOf(c)>=0) count--;
      r++;
    }
    return r;
  }

  getDigitCount(v:String,p: number): number {
    let r = 0;
    for(let i = 0; i < p; i++) {
      if(![' '].includes(v.charAt(i))) {
        r++;
      }
    }
    return r;
  }

  editUpdate() {
    this.validate();
    const p0 = this.getDigitCount(this.value,this.inputElement!.selectionStart??0);
    this.value = this.format(this.value);
    const cursorPosition = this.adjustCursor(this.value,p0);
    setTimeout(()=>{
      this.inputElement!.selectionStart = cursorPosition;
      this.inputElement!.selectionEnd = cursorPosition;
    },0);
    this._context!.editUpdate?.();
  }

  roundSignificant(xi: number, n: number): number {
    let x = new Decimal(xi);
    let ax = x.abs();
    n = Math.round(n);
    const rlog10x = Decimal.round(Decimal.log10(Decimal.abs(x)));
    const exp = (rlog10x.toNumber() - n + 1);
    const la = Decimal.floor(Decimal.div(ax , Decimal.pow(10 , exp)));
    const y = Decimal.mul(Decimal.mul(Decimal.sign(x), la), Decimal.pow(10, exp));
    return y.toNumber();
  }

  countSignificant(x: number, z?: number): number {
    let index1 = 0, index2 = 0;
    for (const c of x.toString()) {
      if (c == '.') continue;
      if ((c >= '0') && (c <= '9')) {
        if (index2 != 0 || c != '0') index2++;
        if (c != '0') index1 = index2;
      }
    }
    return index1;
  }

  initContext() {
    if (!this.context) return;
    this.value = this.format(this.context.value?.toString() ?? '');

  }

}

