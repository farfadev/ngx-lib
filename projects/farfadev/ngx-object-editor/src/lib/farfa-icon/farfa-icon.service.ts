import { Injectable } from "@angular/core";
import { iconCircleMinus, iconCirclePlus, iconInfo, iconMoveDown, iconMoveUp, iconTrash2 } from "./farfa-icon.icons";

@Injectable({ providedIn: 'root' })
export class FarfaIconService {
  iconMap = new Map<string, string>();

  constructor() {
    const uri = document.currentScript?.baseURI;
    this.iconMap.set('circle-minus',iconCircleMinus);
    this.iconMap.set('circle-plus',iconCirclePlus);
    this.iconMap.set('info',iconInfo);
    this.iconMap.set('move-up',iconMoveUp);
    this.iconMap.set('move-down',iconMoveDown);
    this.iconMap.set('trash-2',iconTrash2);
    this.importSVGIcon('trash', '/assets/icons/trash-2.svg')
  }

  importSVGIcon(name: string, url: string) {
    const res = fetch(url).then((res: Response) => {
      res.body?.getReader().read().then((value: ReadableStreamReadResult<Uint8Array>) => {
        this.iconMap.set(name, String(value));
      });
    });
  }

  getSVGIcon(name: string) {
    return this.iconMap.get(name);
  }
}