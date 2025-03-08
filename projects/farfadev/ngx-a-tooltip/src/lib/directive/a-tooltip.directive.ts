import { ComponentRef, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef, CloseScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ATooltipComponent } from '../component/a-tooltip.component';
import { AToolTipProperties } from '../types/atooltip';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ standalone: false, selector: '[aTooltip]' })
export class ATooltipDirective implements OnInit {

  @Input('aTooltip') properties!: AToolTipProperties;
  private overlayRef!: OverlayRef;

  private defaultProperties: AToolTipProperties = {
    html: '',
    text: '',
    mode: 'hover',
    originX: 'end',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: -8,
    offsetY: -8,
    style:'background-color: white; border: 1px solid black; padding: 1rem'
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
    const tooltipRef: ComponentRef<ATooltipComponent>
      = this.overlayRef.attach(new ComponentPortal(ATooltipComponent));
    tooltipRef.instance.text = this.properties.text;
    tooltipRef.instance.html = this.properties.html;
    tooltipRef.instance.style = this.defaultProperties.style + ';' + this.properties.style;
  }

  hide() {
    this.overlayRef.detach();
  }
}
