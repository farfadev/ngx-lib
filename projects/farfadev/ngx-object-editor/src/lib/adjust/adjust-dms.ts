import { ObjectEditor } from "../object-editor";
import Decimal from 'decimal.js';

type AdjustDMSOptions = {
  decimals?: number;
  errors?: {
    notDMS?: () => string,
    decimals?: (value: number) => string
  }
}

export const adjustDMS = (options: AdjustDMSOptions) => {
  return {
    adjust: ((context: ObjectEditor.Context, curPos?: number): ObjectEditor.Adjusted => {
      return _adjustDMS(context.value, options, curPos);
    }),
    accept: ((context: ObjectEditor.Context, key: KeyboardEvent, curPos: number) => {
      return _accept(context.value, key.key, curPos);
    })
  }
}
const _adjustDMS = (valueIn: string, options: AdjustDMSOptions, curPos?: number): ObjectEditor.Adjusted => {

  const adjusted: ObjectEditor.Adjusted = {

  }

  let value = String(valueIn);

  value = stripFormat(value);
  // -/+ 126.82273
  // -/+ 126°54.7771
  // -/+ 126°54.7771'
  // -/+ 126°54.7771'52.8822
  // -/+ 126°54'52.8822''
  //https://regex101.com/
  const regex1 = /^([+\-]{0,1})([0-9]*\.{0,1}[0-9]*)(°|'|''){0,1}$/
  const regex2 = /^([+\-]{0,1})((?:[0-9]+°){0,1})((?:[0-9]+'){0,1})([0-9]*\.{0,1}[0-9]*)('|''){0,1}$/

  const degI = value.indexOf('°');

  let degS, minS, secS;

  if (degI != -1) {
    degS = value.substring(0, degI);
    value = value.substring(degI + 1, value.length);
  }
  let minI = value.indexOf('\'');
  let secI = value.indexOf('"');
  if (minI == secI) minI = -1;
  if (minI != -1) {
    minS = value.substring(0, minI);
    value = value.substring(minI + 1, value.length);
    secI = value.indexOf('"');
  }
  if (secI != -1) {
    secS = value.substring(0, secI);
    value = "";
  }
  if (value.length > 0) {
    if (minS != undefined) {
      secS = value;
    }
    else if (degS != undefined) {
      minS = value;
    }
    else {
      degS = value;
    }
  }
  let valueD = degS ? new Decimal(degS) : new Decimal(0);
  const valueM = minS ? new Decimal(minS) : new Decimal(0);
  const valueS = secS ? new Decimal(secS) : new Decimal(0);
  const negative = valueD.isNeg();
  valueD = valueD.absoluteValue();
  adjusted.adjustedValue = valueD.plus(valueM.dividedBy(60)).plus(valueS.dividedBy(3600)).times(negative ? -1 : 1).times(10**15).round().dividedBy(10**15).toNumber();
  adjusted.formattedValue = format(adjusted.adjustedValue);
  adjusted.cursorPosition = curPos;
  return adjusted;
}

const _accept = (value: string, key: string, curPos: number) => {
  if (['-','.','\'','"'].includes(key)) {
    if (value.indexOf(key) >= 0) return false;
  }
  const posD = (value.indexOf('°'));
  const posM = (value.indexOf('\''));
  const posS = (value.indexOf('"'));
  if((key == '°') 
    && ((posM != -1 ? (posM < curPos):false) 
    ||  (posS != -1 ? (posS < curPos): false)))
    return false;
  if((key == '\'')
    && ((posD != -1 ? (posD > curPos):false) 
    ||  (posS != -1 ? (posS < curPos): false)))
    return false;
  if((key == '"\'"')
    && ((posD != -1 ? (posD > curPos):false) 
    ||  (posM != -1 ? (posM > curPos): false)))
    return false;
  if (key == '-') {
    if (curPos > 0) return false;
    if (value.indexOf('-') >= 0) return false;
  }
  return (key.length == 1 && ("-1234567890.°'\"".indexOf(key) >= 0)) ||
    ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'].includes(key)
}

const stripFormat = (value: string) => {
  value = value.replaceAll(/(?![0-9\.\-+°'])/g, '');
  return value;
}

const format = (value: number): string => {
  let valueDec = new Decimal(value);
  const sign = valueDec.isNegative();
  valueDec = valueDec.absoluteValue();
  let valueD = valueDec.toNearest(10**-9).truncated();
  valueDec = Decimal.max(valueDec.minus(valueD),0);
  valueDec = valueDec.times(60);
  let valueM = valueDec.toNearest(10**-9).truncated();
  valueDec = Decimal.max(valueDec.minus(valueM),0);
  let valueS = valueDec.times(60).toNearest(10**-6);
  const vd = valueD.toNumber();
  const vm = valueM.toNumber();
  const vs = valueS.toNumber();
  return (sign ? '-' : '') 
    + (vd + '°')
    + ((vm == 0 && vs == 0) ? '' : (vm + '\''))
    + (vs == 0 ? '' : (vs + '"'))
}