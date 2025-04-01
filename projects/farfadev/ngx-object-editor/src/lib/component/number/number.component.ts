/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ObjectEditor } from '../../object-editor';
import { adjustNumber } from '../../adjust/adjust-number';

@Component({
  standalone: false,
  selector: 'oe-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class OENumberComponent implements OnInit, OnDestroy, AfterViewInit {
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

  ui_id;

  err_msg: string = '';

  value: string = '';

  inputElement?: HTMLInputElement;

  dataPositions = [];

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.inputElement = document.getElementById(this.getId()) as HTMLInputElement;
    if (this.inputElement) {
      this.inputElement.addEventListener('keyup', (event: KeyboardEvent) => {
      })
      this.inputElement.onkeydown = (e: KeyboardEvent) => {
        const curPos = this.inputElement!.selectionStart??-1;
        return this.accept(e,this.inputElement!.value,curPos);
      }
    }
  }

  ngOnDestroy(): void {
  }

  getStyle(context: ObjectEditor.Context) {
    const stylePlus = this.err_msg!=''?'color:red':'';
    const rstyle = ObjectEditor.getStyle(context);
    
    return rstyle ? rstyle+';'+stylePlus:stylePlus;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return ObjectEditor.getStyleClass(context);
  }

  getLabel(subContext: ObjectEditor.Context) {
    return ObjectEditor.getLabel(subContext);
  }

  onclick() {
    this._context?.onClick?.();
  }

  accept(key: KeyboardEvent, inputValue: string, cursor: number) {
    const adjust = this.context?.scheme?.adjust ?? adjustNumber({});
    return adjust.accept(this.context!,key,inputValue,cursor);
  }

  adjust(inputValue: string, cursor?: number) {
    const adjust = this.context?.scheme?.adjust ?? adjustNumber({});
    return adjust.adjust(this.context!,inputValue,cursor);
  }

  editUpdate() {
    this.context!.value = this.value;
    const adjusted = this.adjust(this.value,this.inputElement!.selectionStart??0);
    this.context!.value = adjusted?.adjustedValue ?? '';
    this.value = adjusted?.formattedValue??'';
    this.err_msg = adjusted?.message??'';

    let cursorPosition = this.inputElement!.selectionStart;
    if(adjusted?.cursorPosition == 'end') {
      cursorPosition = String(this.context!.value).length;
    }
    else {
      cursorPosition = adjusted?.cursorPosition ?? this.inputElement!.selectionStart;
    }

    setTimeout(()=>{
      this.inputElement!.selectionStart = cursorPosition;
      this.inputElement!.selectionEnd = cursorPosition;
    },0);

    this._context!.editUpdate?.();
  }

  initContext() {
    if (!this.context) return;
    const adjusted = this.adjust(String(this.context.value))
    this.value = adjusted?.formattedValue??this.value;
    this.err_msg = adjusted?.message??'';
  }

}

