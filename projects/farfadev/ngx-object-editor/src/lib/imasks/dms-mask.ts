import Decimal from "decimal.js";
import IMask from "imask";

export const dmsMask = {
    mask: Number,
    pattern: 'D-`m-`s',
    blocks: {
        D: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 360,
          maxLength: 3,
        },
        m: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 59,
          maxLength: 2,
        },
        s: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 59.9999,
          maxLength: 7
        }
    },
    format: (value: number) => {
        const dv = new Decimal(value);
        let deg = dv.toFixed(0,Decimal.ROUND_DOWN);
        let min = dv.sub(deg).mul(60).truncated();
        let sec = dv.sub(deg).sub(min.div(60)).mul(60);
        return [deg,min,sec].join('-');
    },
    
}