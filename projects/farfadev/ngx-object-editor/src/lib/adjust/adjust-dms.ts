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
  return ((context: ObjectEditor.Context, curPos?: number): ObjectEditor.Adjusted => {
    return _adjustDMS(context.value, options, curPos);
  });
}

const _adjustDMS = (valueIn: string, options: AdjustDMSOptions, curPos?: number): ObjectEditor.Adjusted => {

  const adjusted : ObjectEditor.Adjusted = {

  }

  let value = String(valueIn);

  value = stripFormat(value);
  // -/+ 126.82273
  // -/+ 126°54.7771
  // -/+ 126°54.7771'
  // -/+ 126°54.7771'52.8822
  // -/+ 126°54'52.8822''

  const regex1 = /^([+\-]{0,1})([0-9]*\.{0,1}[0-9]*)(°|'|''){0,1}$/
  const regex2 = /^([+\-]{0,1})((?:[0-9]+°){0,1})((?:[0-9]+'){0,1})([0-9]*\.{0,1}[0-9]*)('|''){0,1}$/

  const degI = value.indexOf('°');

  let degS, minS, secS;

  if (degI != -1) {
    degS = value.substring(0, degI);
    value = value.substring(degI + 1, value.length);
  }
  let minI = value.indexOf('\'');
  let secI = value.indexOf('\'\'');
  if (minI == secI) minI = -1;
  if (minI != -1) {
    minS = value.substring(0, minI);
    value = value.substring(minI + 1, value.length);
    secI = value.indexOf('\'\'');
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
  adjusted.adjustedValue = valueD.add(valueM.mul(60)).add(valueS.mul(3600)).mul(negative?-1:1).toNumber();
  adjusted.formattedValue = format(adjusted.adjustedValue);
  adjusted.cursorPosition = curPos;
  return adjusted;
}

const stripFormat = (value: string) => {
  value = value.replaceAll(/![0-9\.\-+°']/, '');
  return value;
}

const format = (value: number): string => {
  let valueDec = new Decimal(value);
  //TODO 
  return value.toString();
}