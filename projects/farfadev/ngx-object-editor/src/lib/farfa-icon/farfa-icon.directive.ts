import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { FarfaIconService } from "./farfa-icon.service";

@Directive({ standalone: false, selector: '[farfa-icon]' })
export class FarfaIconDirective implements OnInit {

  @Input('farfa-icon') properties!: Record<string,any>;

  //observer: MutationObserver;

  constructor(private elementRef: ElementRef, private iconService: FarfaIconService) {
/*    this.observer = new MutationObserver((mutations)=> {
      for(const mutation of mutations) {
        if((mutation.type === 'attributes')&&(mutation.target == elementRef.nativeElement)) {
          this.updateSVGAttributes();
        }
      }
    });
    this.observer.observe(elementRef.nativeElement, {
      attributes: true //configure it to listen to attribute changes
    });
  */  }

  updateSVGAttributes() {
    const attrs = this.elementRef.nativeElement.getAttributeNames?.();
    const svgEls = (this.elementRef.nativeElement as HTMLElement).getElementsByTagName('svg');
    for(const svgEl of svgEls) {
      svgEl.removeAttribute('width');
      svgEl.removeAttribute('height');
      //svgEl.setAttribute('width','100%');
      //svgEl.setAttribute('height','100%');
      for(const attr of attrs??[]) {
      if(![''].includes(attr)) continue;
        const attrValue = this.elementRef.nativeElement.getAttribute(attr);
        svgEl.setAttribute(attr,attrValue);
      }
    }
  }

  ngOnInit(): void {
    const svg = this.iconService.getSVGIcon(this.properties['name']);
    this.elementRef.nativeElement.insertAdjacentHTML('afterbegin',svg);
    this.updateSVGAttributes();
  }
}