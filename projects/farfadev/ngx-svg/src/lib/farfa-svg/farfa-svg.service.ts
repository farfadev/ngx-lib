import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class FarfaSvgService {
  iconMap = new Map<string, string>();
  subscriptions = new Map<string, Map<number, (svg: string) => void>>();
  id = 0;

  constructor() {
  }

  setSVG(name: string|undefined, svg: string): {svg?: string; error?: string} {
    const start = svg.indexOf('<svg');
    const end = svg.lastIndexOf('</svg>');
    svg = svg.slice(start, end + 6);
    if (start < 0 || end < 0) return ({error:'svg element shall start with <svg and end with </svg>'});
    if (name) {
      this.iconMap.set(name, svg);
      const s = this.subscriptions.get(name);
      (async () => {
        for (const ss of s?.keys() ?? []) {
          s?.get(ss)?.(svg);
        }
      })();
    }
    return {svg};
  }

  loadSVG(name: string|undefined, input: string | URL | Request): Promise<string> {
    return new Promise<string>((resolve, error) => {
      const res = fetch(input).then((res: Response) => {
        if (res.status >= 200 && res.status < 300) {
          res.body?.getReader().read().then((value: ReadableStreamReadResult<Uint8Array>) => {
            if (value?.value) {
              const str = utf8ArrayToStr(value.value);
              const res = this.setSVG(name, str);
              if ((res.error != undefined)||(res.svg == undefined)) {
                error(res.error);
              }
              else {
                resolve(res.svg);
              }
            }
          });
        }
        else {
          error(res.statusText);
        }
      });
    });
  }

  getSVG(name: string, update: (svg: string | undefined) => void): number {
    let s = this.subscriptions.get(name) ?? new Map<number, () => void>();
    const id = this.id;
    s.set(id, update);
    this.id++;
    this.subscriptions.set(name, s);
    update(this.iconMap.get(name) ?? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>');
    return id;
  }

  remove(id: number) {

  }

}

const utf8ArrayToStr = (array: Uint8Array) => {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }

  return out;
}