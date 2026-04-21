import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  standalone: false,
  selector: 'a-tooltip',
  templateUrl: './farfa-tooltip.component.html',
  styleUrls: ['./farfa-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
