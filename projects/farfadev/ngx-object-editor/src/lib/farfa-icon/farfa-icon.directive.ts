import { Directive, ElementRef, Input, OnDestroy, OnInit } from "@angular/core";
import { FarfaIconService } from "./farfa-icon.service";

@Directive({ standalone: false, selector: '[farfa-icon]' })
export class FarfaIconDirective implements OnInit, OnDestroy {

  _properties?: Record<string, any>;
  @Input('farfa-icon')
  set properties(p: Record<string, any> | undefined) {
    this._properties = p;
    this.setIcon();
  };
  get properties() {
    return this._properties;
  }

  //observer: MutationObserver;
  svgId?: number;
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
    for (const svgEl of svgEls) {
      svgEl.removeAttribute('width');
      svgEl.removeAttribute('height');
      //svgEl.setAttribute('width','100%');
      //svgEl.setAttribute('height','100%');
      for (const attr of attrs ?? []) {
        if (![''].includes(attr)) continue;
        const attrValue = this.elementRef.nativeElement.getAttribute(attr);
        svgEl.setAttribute(attr, attrValue);
      }
    }
  }

  setIcon() {
    if (this.svgId) {
      this.iconService.remove(this.svgId);
    }
    if (this.properties?.['name']) {
      this.svgId = this.iconService.getSVGIcon(this.properties['name'], (svg) => {
        this.elementRef.nativeElement.innerHTML = svg;
        this.updateSVGAttributes();
      });
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.svgId) this.iconService.remove(this.svgId);
  }
}