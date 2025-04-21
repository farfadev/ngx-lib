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
  key: string;
  label: string;
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
  debug = false;

  ui_id;

  subContext?: ObjectEditor.Context;

  selectionKey?: string;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  isReadOnly(context: ObjectEditor.Context) {
    return ObjectEditor.isReadOnly(context);
  }

  isHorizontal() {
    return ObjectEditor.getUIEffects(this.context!)?.['horizontal'] ?? false;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  select(context: ObjectEditor.Context, key?: string) {
    this.subContext = ObjectEditor.select(context,key);
  }

  getSelectionLabel(context: ObjectEditor.Context) {
    return ObjectEditor.getSelectionLabel(context) ?? 'select';
  }

  getSelectionKeyLabels(context: ObjectEditor.Context) {
    const result: KeyLabel[] = [];
    const selList = ObjectEditor.getSelectionList(context);
    const keys = Object.keys(selList);
    for (let key of keys) {
      result.push({ key, label: selList[key].label ?? key });
    }
    return result;
  }

  onclick() {
    this._context?.onClick?.(this.context!);
  }

  initContext() {
    if (!this.context) return;
    const editUpdate = this.context.editUpdate;
    this.context.editUpdate = () => {
      this.selectionKey = ObjectEditor.getSelectionKey(this.context);
      editUpdate?.(true);
    }
    this.selectionKey = ObjectEditor.getSelectionKey(this.context);
  }

}

