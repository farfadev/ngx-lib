/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ObjectEditor } from '../../object-editor';

type KeyLabel = {
  key: string | number;
  label: string | number;
}
@Component({
  standalone: false,
  selector: 'oe-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OERadioComponent implements OnInit, OnDestroy {
  @ViewChild('objectcontainer')
  private objectContainer!: ElementRef<HTMLElement>;

  _context?: ObjectEditor.Context;
  get context(): ObjectEditor.Context | undefined {
    return this._context;
  }
  @Input()
  set context(value: ObjectEditor.Context) {
    this._context = value;
    this.initContext();
  }

  @Input()
  primeNg: boolean = false; // if true, will use the primeng components

  ui_id;

  selectedEnumKey?: string;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  selectEnum(context: ObjectEditor.Context, enumKey?: string|number) {
    ObjectEditor.selectEnum(context,enumKey);
  }

  getSelectedEnumKey(context: ObjectEditor.Context|undefined = this.context): string | undefined {
    return context ? ObjectEditor.getSelectedEnumKey(context) : undefined;
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }

  getEnumList(context: ObjectEditor.Context): string[] {
    return ObjectEditor.getEnumKeys(context.scheme);
  }

  onclick() {
    this._context?.onClick?.();
  }

  initContext() {
    if (!this.context) return;
    this.selectedEnumKey = this.getSelectedEnumKey(this.context);
  }

}

