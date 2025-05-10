import { validateColor } from "../color-utils/colors";

export namespace FarfaOEValueCheck {

    export const isAnyDateTime = (v: any): boolean => {
        const date = new Date(v);
        return !Number.isNaN(date.valueOf())
    }

    export const isStringDate = (v: any): boolean => {
        if(typeof v != 'string') return false;
        const date = new Date(v);
        //todo check there is no time information
        return !Number.isNaN(date.valueOf())
    }

    export const isStringTime = (v: any): boolean => {
        if(typeof v != 'string') return false;
        const date = new Date(v);
        //todo check there is no date information
        return !Number.isNaN(date.valueOf())
    }

    export const isStringNumber = (v: any): boolean => {
        if(typeof v != 'string') return false;
        const number = new Number(v);
        return !Number.isNaN(number.valueOf())
    }

    export const isStringBoolean = (v: any): boolean => {
        if(typeof v != 'string') return false;
        v = v.toLowerCase();
        return ['true','false'].includes(v);
    }

    export const isStringColor = (v:any) : boolean => {
        if(typeof v != 'string') return false;
        return validateColor(v);
    }

    export const isTypeFunction = (x: any) => {
        return Object.prototype.toString.call(x) === '[object Function]';
      }

    export const isTypeArray = (x: any) => {
        return Object.prototype.toString.call(x) === '[object Array]';
    }
    
    export const isTypeDate = (x: any) => {
        return Object.prototype.toString.call(x) === '[object Date]';
    }

    export const isTypeObject = (x: any) => {
        return Object.prototype.toString.call(x) === '[object Object]';
    }
}