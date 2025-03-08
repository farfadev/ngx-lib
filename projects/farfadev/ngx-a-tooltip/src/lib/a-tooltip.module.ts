import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { ATooltipComponent } from './component/a-tooltip.component';
import { ATooltipDirective } from './directive/a-tooltip.directive';

@NgModule({
  declarations: [
    ATooltipComponent,
    ATooltipDirective
  ],
  imports: [
    CommonModule,
    OverlayModule,
  ],
  exports: [
    ATooltipDirective
  ]
})
export class ATooltipModule { }
