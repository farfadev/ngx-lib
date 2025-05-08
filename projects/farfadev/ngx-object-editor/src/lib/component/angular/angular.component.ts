
// https://dev.to/railsstudent/render-dynamic-components-in-angular-using-viewcontainerref-160h

import { ChangeDetectorRef, Component, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef, inject } from '@angular/core';
import * as ObjectEditor from '../../object-editor';
import * as ObjectEditorInt from '../../object-editor-int';

@Component({
  standalone: false,
  selector: 'oe-angular',
  template: `<ng-container #vcr></ng-container>`,
})
export class OEAngularComponent implements OnInit, OnDestroy, OnChanges {

  _context?: ObjectEditor.Context;
  @Input()
  set context(c: ObjectEditor.Context | undefined) {
    this._context = c;
  }

  get context() {
    return this._context;
  }

  @Input()
  debug = false;

  @ViewChild('vcr', { static: true, read: ViewContainerRef })
  vcr!: ViewContainerRef;

  componentRef?: any;

  cdr = inject(ChangeDetectorRef);

  constructor() {
  }

  async renderDynamicComponents() {

    // clear dynamic components shown in the container previously    
    this.vcr.clear();
    if(this.componentRef) this.componentRef.destroy();
    this.componentRef = undefined;
    const cp = this.context?.scheme?.angularFrontEnd?.component?.(this.context);
    if (cp) {
      this.componentRef = this.vcr.createComponent(cp);
      const inputs = this.context?.scheme?.angularFrontEnd?.inputs?.(this.context);
      if (inputs) {
        for (const key of Object.keys(inputs)) {
          this.componentRef.setInput(key, inputs[key]);
        }
      }
      this.componentRef.setInput('context',this.context);
      this.componentRef.setInput('debug',this.debug);
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    const breakpoint = 0; // to set breakpoints
    this.renderDynamicComponents();
  }
  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.componentRef = undefined;
    ObjectEditorInt.uidestroyed(this.context!);
  }
  ngOnChanges(changes: SimpleChanges): void {

  }
}

