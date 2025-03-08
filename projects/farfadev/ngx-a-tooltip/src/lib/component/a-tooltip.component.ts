import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  standalone: false,
  selector: 'a-tooltip',
  templateUrl: './a-tooltip.component.html',
  styleUrls: ['./a-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition(':leave', [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class ATooltipComponent {
  @Input() text = '';

}
