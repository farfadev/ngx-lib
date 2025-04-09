import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  standalone: false,
  selector: 'a-tooltip',
  templateUrl: './farfa-tooltip.component.html',
  styleUrls: ['./farfa-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 })),
      ]),
      transition(':leave', [animate(1000, style({ opacity: 0 }))]),
    ]),
  ],
})
export class FarfaTooltipComponent {
  _trustedHtml?: SafeHtml;
  @Input() text?: string;
  @Input() set html(v: string|undefined) {
    v = v ?? '';
    this._trustedHtml = this.sanitizer.bypassSecurityTrustHtml(v);
    const i = 0;
  };
  @Input() style?: string = 'background-color: white; border: 1px solid black; padding: 1rem';

  constructor(private sanitizer: DomSanitizer) {
  }
}
