import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FarfaTooltipComponent as FarfaTooltipComponent } from './component/farfa-tooltip.component';
import { FarfaTooltipDirective as FarfaTooltipDirective } from './directive/farfa-tooltip.directive';

@NgModule({
  declarations: [
    FarfaTooltipComponent,
    FarfaTooltipDirective
  ],
  imports: [
    CommonModule,
    OverlayModule,
  ],
  exports: [
    FarfaTooltipDirective
  ]
})
export class FarfaTooltipModule { }
