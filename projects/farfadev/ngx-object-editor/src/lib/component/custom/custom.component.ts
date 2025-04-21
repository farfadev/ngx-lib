/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Host,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ObjectEditor } from '../../object-editor';
import { _farfa_oe_marker } from '../markers';

@Component({
  standalone: false,
  selector: 'oe-custom',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class OECustomComponent implements OnInit, OnDestroy, AfterViewInit {

  _context?: ObjectEditor.Context;
  get context(): ObjectEditor.Context | undefined {
    return this._context;
  }
  @Input()
  set context(value: ObjectEditor.Context) {
    this._context = value;
  }

  ui_id;

  err_msg: string = '';

  constructor(@Host() private elementRef: ElementRef<any>) {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  private getAngularContentAttribute(element: HTMLElement): string | undefined {
    const ngHostAttribute =
      element
        .getAttributeNames()
        .find((attr) => attr.startsWith('_nghost-')) ??
      element
        .getAttributeNames()
        .find((attr) => attr.startsWith('_ngcontent-'));
    if (!ngHostAttribute) {
      return undefined;
    }

    return ngHostAttribute.replace(
      '_nghost-',
      '_ngcontent-'
    );

  }

  getExternalParent(element: HTMLElement | null) {
    let rElement;
    for(;element != null; element = element.parentElement) {
      if(element.getAttributeNames().includes(_farfa_oe_marker)) rElement = element;
    }
    return rElement?.parentElement;
  }

  private fixEmulatedEncapsulation(): void {
    // Make sure the component element exists
    if (!this.elementRef?.nativeElement) {
      return;
    }

    const element: HTMLElement = this.elementRef.nativeElement;
    // get the compile-time, dynamically generated, unique host identifier from the component root element

    const externalParent = this.getExternalParent(element);

    let ngContentAttribute = this.getAngularContentAttribute(externalParent??element);

    // Find all elements inside the component that didn't exist on compile time - and add the _ngcontent-ng-XXX attribute to apply scoped CSS
    if (ngContentAttribute)
      element
        .querySelectorAll(`:not([${ngContentAttribute}])`)
        .forEach((elem) => elem.setAttribute(ngContentAttribute!, ''));
  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const customElement = document.getElementById(this.getId()) as HTMLInputElement;

    if (customElement) {
      const innerHTML = this.context?.scheme?.customFrontEnd?.html?.(this.context);
      if (innerHTML) {
        customElement.insertAdjacentHTML('afterbegin', innerHTML);
        this.context?.scheme?.customFrontEnd?.init?.(this.context, customElement, (err_msg: string) => {
          this.err_msg = err_msg;
        });
      }
    }
    this.fixEmulatedEncapsulation();
  }

  ngOnDestroy(): void {
  }

}

