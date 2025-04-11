import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FarfaSourceCodeComponent } from '../../source-code/source-code.component';

@Component({
  selector: 'showcases-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  imports: [CommonModule, FarfaSourceCodeComponent],
})
export class ShowcasesContainerComponent implements OnInit, OnDestroy {

  @ViewChild('vcr', { static: true, read: ViewContainerRef })
  vcr!: ViewContainerRef;

  sources?: Record<string, string>;

  cdr = inject(ChangeDetectorRef);

  componentRef?: ComponentRef<any>;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route
      .data
      .subscribe(async (v: any) => {
        const x = await v.component?.();
          this.vcr.clear();
          if (this.componentRef) this.componentRef.destroy();
            this.componentRef = this.vcr.createComponent(x);
            if (v.inputs) {
              for (const key of Object.keys(v.inputs)) {
                this.componentRef.setInput(key, v.inputs[key]);
              }
            }
          this.componentRef?.changeDetectorRef.detectChanges();
        if (v.sources) this.sources = v.sources;
      });

  }
  ngOnDestroy() {
    if (this.componentRef) this.componentRef.destroy();
    this.componentRef = undefined;
  }
}

