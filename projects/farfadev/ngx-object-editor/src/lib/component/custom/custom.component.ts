/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ObjectEditor } from '../../object-editor';

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

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const customElement = document.getElementById(this.getId()) as HTMLInputElement;

    if (customElement) {
      const innerHTML = this.context?.scheme?.customFrontEnd?.html?.(this.context);
      if(innerHTML) {
        customElement.insertAdjacentHTML('afterbegin',innerHTML);
        this.context?.scheme?.customFrontEnd?.init?.(this.context,customElement,(err_msg: string)=>{
          this.err_msg = err_msg;
        });
      }
    }
  }

  ngOnDestroy(): void {
  }

}

