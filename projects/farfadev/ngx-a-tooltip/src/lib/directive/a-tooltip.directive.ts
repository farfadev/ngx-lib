import { ComponentRef, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ATooltipComponent } from '../component/a-tooltip.component';


// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ standalone: false, selector: '[aTooltip]' })
export class ATooltipDirective implements OnInit {

  @Input('aTooltip') properties!: { originX?: any; originY?: any; overlayX?: any; overlayY?: any; offsetX?: any; offsetY?: any; text: string; };
  private overlayRef!: OverlayRef;

  private defaultProperties = {
    text: '',
    originX: 'end',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: -8,
    offsetY: -8,
  };

  constructor(private overlay: Overlay,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.properties = {...this.defaultProperties, ...this.properties };
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

    this.overlayRef = this.overlay.create({ positionStrategy });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('mouseenter')
  show() {
    const tooltipRef: ComponentRef<ATooltipComponent>
      = this.overlayRef.attach(new ComponentPortal(ATooltipComponent));
    tooltipRef.instance.text = this.properties.text;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('mouseleave')
  hide() {
    this.overlayRef.detach();
  }
}
