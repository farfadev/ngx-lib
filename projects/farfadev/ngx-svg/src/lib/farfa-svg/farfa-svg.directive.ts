import { Directive, ElementRef, Input, OnDestroy, OnInit } from "@angular/core";
import { FarfaSvgService } from "./farfa-svg.service";

@Directive({ standalone: false, selector: '[farfa-svg]' })
export class FarfaSvgDirective implements OnInit, OnDestroy {

  _properties?: Record<string, any>;
  @Input('farfa-svg')
  set properties(p: Record<string, any> | undefined) {
    this._properties = p;
    this.setSVG();
  };
  get properties() {
    return this._properties;
  }

  //observer: MutationObserver;
  svgId?: number;
  constructor(private elementRef: ElementRef, private iconService: FarfaSvgService) {
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

  private updateSVGAttributes() {
    const attrs = this.elementRef.nativeElement.getAttributeNames?.();
    const svgEls = (this.elementRef.nativeElement as HTMLElement).getElementsByTagName('svg');
    for (const svgEl of svgEls) {
      //svgEl.removeAttribute('width');
      //svgEl.removeAttribute('height');
      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', '100%');
      for (const attr of attrs ?? []) {
        if (!['width','height'].includes(attr)) continue;
        const attrValue = this.elementRef.nativeElement.getAttribute(attr);
        svgEl.setAttribute(attr, attrValue);
      }
    }

    this.fixEmulatedEncapsulation();
  }

  private setSVG() {
    if (this.svgId) {
      this.iconService.remove(this.svgId);
    }
    if (this.properties?.['svg'] && !this.properties?.['name']) {
      this.elementRef.nativeElement.innerHTML = this.properties?.['svg'];
      this.updateSVGAttributes();
    }
    else if (this.properties?.['name']) {
      this.svgId = this.iconService.getSVG(this.properties['name'], (svg) => {
        this.elementRef.nativeElement.innerHTML = svg;
        this.updateSVGAttributes();
      });
    }
    if (this.properties?.['init']) {
      const f = this.properties?.['init'];
      if(typeof f == 'function') {
        f(this.properties,this.elementRef.nativeElement);
      }
    }
  }

  private fixEmulatedEncapsulation(): void {
    // Make sure the component element exists
    if (!this.elementRef?.nativeElement) {
      return;
    }

    const elementRef: HTMLElement = this.elementRef.nativeElement;
    // get the compile-time, dynamically generated, unique host identifier from the component root element
    const ngHostAttribute =
      elementRef
        .getAttributeNames()
        .find((attr) => attr.startsWith('_nghost-')) ??
      elementRef
        .getAttributeNames()
        .find((attr) => attr.startsWith('_ngcontent-'));

    // In case there is no nghost (no encapsulation / shadow DOM)
    if (!ngHostAttribute) {
      return;
    }

    const ngContentAttribute = ngHostAttribute.replace(
      '_nghost-',
      '_ngcontent-'
    );

    // Find all elements inside the component that didn't exist on compile time - and add the _ngcontent-ng-XXX attribute to apply scoped CSS
    elementRef
      .querySelectorAll(`:not([${ngContentAttribute}])`)
      .forEach((elem) => elem.setAttribute(ngContentAttribute, ''));
  }



  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.svgId) this.iconService.remove(this.svgId);
  }
}