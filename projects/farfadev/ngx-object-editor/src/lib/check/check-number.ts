import { ObjectEditor } from "../object-editor";
import Decimal from 'decimal.js';

type Options = {
    min?: number;
    max?: number;
    significants?: number;
    digits?: number;
}

export const checkNumber = (value: string,options: {},cursorPosition?: number): ObjectEditor.Checked|null => {
    value = String(value);
    const hasEndDot = value.match(/\.\s*$/);
    const pv = validate(value,options);
    const p0 = getDigitCount(value,cursorPosition??String(pv.value).length);
    let rvalue = format(value);
    cursorPosition = adjustCursor(rvalue,p0);
    return {formattedValue: rvalue,adjustedValue: pv.value,cursorPosition,message: pv.message};
}


const getDigitCount = (v:String,p: number): number => {
    let r = 0;
    for(let i = 0; i < p; i++) {
      if(![' '].includes(v.charAt(i))) {
        r++;
      }
    }
    return r;
  }

const adjustCursor = (v:string,count: number): number => {
    let r = 0;
    for(const c of [...v]) {
      if(count == 0) break;
      if("-0123456789.".indexOf(c)>=0) count--;
      r++;
    }
    return r;
  }

  const stripFormat = (v: string): string => {
    v = v.replaceAll(' ', '').replace(',', '.');
    return v;
  }

  const numberWithSeparator = (x: string, c: string): string => {
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

  const format = (v: string) => {
    v = stripFormat(v);
    v = numberWithSeparator(v, ' ');
    return v;
  }

  const validate = (value: string,options?: Options): {value: number; message?: string} => {
    let err_msg;
    let rValue: number = Number(stripFormat(value));
    if ((options?.min != undefined) && rValue < options.min) {
      err_msg = 'value is below the minimum allowed ' + options.min;
      rValue = options.min
    }
    else if ((options?.max != undefined) && rValue > options.max) {
      err_msg = 'value is over the maximum allowed ' + options.max;
      rValue = options.max
    }
    else if (options?.significants != undefined) {
      if (countSignificant(rValue) > options.significants) {
        err_msg = 'significant digits over the maximum allowed ' + options.significants;
      };
      rValue = roundSignificant(rValue, options.significants);
    }
    return {value: rValue, message: err_msg};
  }


  const roundSignificant= (xi: number, n: number): number => {
    let x = new Decimal(xi);
    let ax = x.abs();
    n = Math.round(n);
    const rlog10x = Decimal.round(Decimal.log10(Decimal.abs(x)));
    const exp = (rlog10x.toNumber() - n);
    const la = Decimal.floor(Decimal.div(ax , Decimal.pow(10 , exp)));
    const y = Decimal.mul(Decimal.mul(Decimal.sign(x), la), Decimal.pow(10, exp));
    return y.toNumber();
  }

  const countSignificant = (x: number, z?: number): number => {
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

