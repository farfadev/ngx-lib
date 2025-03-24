import { ObjectEditor } from "../object-editor";
import Decimal from 'decimal.js';

type AdjustNumberOptions = {
  min?: number;
  max?: number;
  significants?: number;
  decimals?: number;
  errors?: {
    notNumber?: () => string,
    min?: (value: number) => string,
    max?: (value: number) => string,
    significants?: (value: number) => string,
    decimals?: (value: number) => string
  }
}

export const adjustNumber = (options: AdjustNumberOptions) => {
  return {
    adjust: ((context: ObjectEditor.Context, curPos?: number) => {
    return _adjustNumber(context.value, options, curPos);
  }),
  accept: ((context: ObjectEditor.Context, key: KeyboardEvent, curPos: number) => {
    return _accept(context.value, key, curPos);
  })
};
}

const _adjustNumber = (value: string, options: AdjustNumberOptions, cursorPosition?: number): ObjectEditor.Adjusted | null => {
  value = String(value);
  const hasEndDot = value.match(/\.\s*$/);
  const pv = validate(value, options);
  const p0 = getDigitCount(value, cursorPosition ?? String(pv.value).length);
  let rvalue = format(value);
  cursorPosition = adjustCursor(rvalue, p0);
  return { formattedValue: rvalue, adjustedValue: pv.value, cursorPosition, message: pv.message };
}


const getDigitCount = (v: String, p: number): number => {
  let r = 0;
  for (let i = 0; i < p; i++) {
    if (![' '].includes(v.charAt(i))) {
      r++;
    }
  }
  return r;
}

const adjustCursor = (v: string, count: number): number => {
  let r = 0;
  for (const c of [...v]) {
    if (count == 0) break;
    if ("-0123456789.eE".indexOf(c) >= 0) count--;
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
  //    const s = x.split(/^(-{0,1}[0-9]*\.{0,1}[0-9]*)((?:[eE]{1}[-]{0,1}[0-9]*){0,1})$/);
  const e = x.match(/[eE]{1}/);
  const ei = e?.[0] ? x.indexOf(e[0]) : -1;
  const s = x.split(/[eE]{1}/);
  x = s[0];
  let r: string = '';
  let vl: string = '';
  let vr: string = '';
  const ds = x.indexOf('.');
  if (ds >= 0) {
    [vl, vr] = x.split('.');
  }
  else {
    vl = x;
    vr = '';
  }
  for (let i = vl.length - 1; i >= 0; i--) {
    if (((vl.length - i) % 3 == 1) && (i != (vl.length - 1))) r = ' ' + r;
    r = vl.charAt(i) + r;
  }
  if (ds >= 0) r = r + '.';
  for (let i = 0; i < vr.length; i++) {
    if (((i) % 3 == 0) && (i != 0)) r = r + ' ';
    r = r + vr.charAt(i);
  }
  return r + (ei != -1 ? 'e' + s[1] : '');
}

const format = (v: string) => {
  v = stripFormat(v);
  v = numberWithSeparator(v, ' ');
  return v;
}

const validate = (value: string, options?: AdjustNumberOptions): { value: number; message?: string } => {
  let err_msg;
  let rValue: number = Number(stripFormat(value));
  if (isNaN(rValue)) {
    err_msg = options?.errors?.notNumber?.() ?? 'not a number';
    rValue = options?.min ? options?.min : options?.max ? options?.max : 0;
  }
  else {
    if ((options?.decimals != undefined) &&
      (countDecimals(rValue) > options.decimals)) {
      err_msg = options?.errors?.decimals?.(options.decimals) ?? 'decimal digits over the maximum allowed ' + options.decimals;
      rValue = roundDecimals(rValue, options.decimals);
    }
    if ((options?.significants != undefined) && (countSignificant(rValue) > options.significants)) {
      err_msg = options?.errors?.significants?.(options.significants) ?? 'significant digits over the maximum allowed ' + options.significants;
      rValue = roundSignificant(rValue, options.significants);
    }
    if ((options?.min != undefined) && rValue < options.min) {
      err_msg = options?.errors?.min?.(options.min) ?? 'value is below the minimum allowed ' + options.min;
      rValue = options.min
    }
    if ((options?.max != undefined) && rValue > options.max) {
      err_msg = options?.errors?.max?.(options.max) ?? 'value is over the maximum allowed ' + options.max;
      rValue = options.max
    }
  }
  return { value: rValue, message: err_msg };
}

const roundDecimals = (xi: number, n: number): number => {
  let x = new Decimal(xi);
  n = Math.round(n);
  return (x.toDecimalPlaces(n, Decimal.ROUND_DOWN).toNumber());
}

const roundSignificant = (xi: number, n: number): number => {
  let x = new Decimal(xi);
  let ax = x.abs();
  n = Math.round(n);
  const rlog10x = Decimal.round(Decimal.log10(Decimal.abs(x)));
  const exp = (rlog10x.toNumber() - n);
  const la = Decimal.floor(Decimal.div(ax, Decimal.pow(10, exp)));
  const y = Decimal.mul(Decimal.mul(Decimal.sign(x), la), Decimal.pow(10, exp));
  return y.toNumber();
}

const countDecimals = (x: number, z?: number): number => {
  let counting = false, count1 = 0, count2 = 0;
  const s = x.toString().split(/[eE]{1}/);
  const e = s[1] ? Number(s[1]) : 0;
  for (const c of s[0]) {
    if (c == '.') { counting = true; continue; }
    if (c == 'e' || c == 'E') break;
    if (counting && (c >= '0') && (c <= '9')) {
      count2++;
      if (c != '0') count1 = count2;
    }
  }
  return Math.max(-e + count1, 0);
}

const countSignificant = (x: number, z?: number): number => {
  let index1 = 0, index2 = 0;
  for (const c of x.toString()) {
    if (c == '.') continue;
    if (c == 'e' || c == 'E') break;
    if ((c >= '0') && (c <= '9')) {
      if (index2 != 0 || c != '0') index2++;
      if (c != '0') index1 = index2;
    }
  }
  return index1;
}

const _accept = (value: string, keyb: KeyboardEvent, curPos: number = -1) => {
  const key = keyb.key;
  if (key == '-') {
    if (curPos === 0) {
      return (value.charAt(1) != '-');
    }
    if (curPos > 0) {
      return (value.charAt(curPos) != '-' &&
        (value.charAt(curPos - 1) == 'e' ||
          value.charAt(curPos - 1) == 'E'));
    }
    if (value.indexOf('-') >= 0) return false;
    if (curPos > 0) return false;
  }
  if (['.'].includes(key)) {
    if (value.indexOf('.') >= 0) return false;
  }
  return (key.length == 1 && ("-1234567890.eE".indexOf(key) >= 0)) ||
    ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'].includes(key)
}

