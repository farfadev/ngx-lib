import { ComponentRef, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef, CloseScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { FarfaTooltipComponent } from '../component/farfa-tooltip.component';
import { FarfaToolTipProperties } from '../types/farfatooltip';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ standalone: false, selector: '[farfa-tooltip]' })
export class FarfaTooltipDirective implements OnInit {

  @Input('farfa-tooltip') properties!: FarfaToolTipProperties;
  private overlayRef!: OverlayRef;

  private defaultProperties: FarfaToolTipProperties = {
    html: '',
    text: '',
    mode: 'hover',
    originX: 'end',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: -8,
    offsetY: -8,
    style: 'background-color: white; border: 1px solid black; padding: 1em'
  };

  constructor(private overlay: Overlay,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.properties = { ...this.defaultProperties, ...this.properties };
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: this.properties.originX,
        originY: this.properties.originY,
        overlayX: this.properties.overlayX,
        overlayY: this.properties.overlayY,
        offsetX: this.properties.offsetX,
        offsetY: this.properties.offsetY,
      }]);

    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    this.overlayRef = this.overlay.create({ positionStrategy, scrollStrategy });
    this.overlayRef.outsidePointerEvents().subscribe((event: MouseEvent) => {
      if ((event.type == 'click') && (event.target != this.elementRef.nativeElement)) this.hide();
    });
  }

  @HostListener('mouseenter')
  mouseenter() {
    if (this.properties.mode == 'hover') this.show();
  }

  @HostListener('mouseleave')
  mouseleave() {
    if (this.properties.mode == 'hover') this.hide();
  }

  @HostListener('click', ['$event.target'])
  click(target: HTMLElement) {
    if (this.overlayRef.hasAttached()) this.hide();
    else this.show();
  }

  show() {
    if (!this.overlayRef.hasAttached()) {
      const tooltipRef: ComponentRef<FarfaTooltipComponent>
        = this.overlayRef.attach(new ComponentPortal(FarfaTooltipComponent));
      tooltipRef.instance.text = this.properties.text;
      tooltipRef.instance.html = this.properties.html;
      tooltipRef.instance.style = this.defaultProperties.style + ';' + this.properties.style;
    }
  }

  hide() {
    this.overlayRef.detach();
  }
}
