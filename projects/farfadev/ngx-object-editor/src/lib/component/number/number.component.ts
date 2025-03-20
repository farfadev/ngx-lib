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
        //this.adjustBOM();
      })
      this.inputElement.onkeydown = (e: KeyboardEvent) => {
        if (e.key == '-') {
          if (this.value.indexOf('-') >= 0) return false;
          if (this.inputElement!.selectionStart??-1 > 0) return false;
        }
        if (['.'].includes(e.key)) {
          if (this.value.indexOf('.') >= 0) return false;
        }
        return (e.key.length == 1 && ("-1234567890.".indexOf(e.key) >= 0)) ||
          ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'].includes(e.key)
      };
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
    //this.adjustBOM();
    this._context?.onClick?.();
  }

  editUpdate() {
    this.context!.value = this.value;
    const checked = this.context?.scheme?.check?.(this.context,this.inputElement!.selectionStart??0)
    this.context!.value = checked?.adjustedValue;
    this.value = checked?.formattedValue??'';
    this.err_msg = checked?.message??'';

/*    this.validate();
    const p0 = this.getDigitCount(this.value,this.inputElement!.selectionStart??0);
    this.value = this.format(this.value);
    const cursorPosition = this.adjustCursor(this.value,p0);
*/
    let cursorPosition = 0;
    if(checked?.cursorPosition == 'end') {
      cursorPosition = String(this.context!.value).length;
    }
    else {
      cursorPosition = checked?.cursorPosition ?? 0;
    }

    setTimeout(()=>{
      this.inputElement!.selectionStart = cursorPosition;
      this.inputElement!.selectionEnd = cursorPosition;
    },0);

    this._context!.editUpdate?.();
  }

  initContext() {
    if (!this.context) return;
    const checked = this.context?.scheme?.check?.(this.context)
    this.value = checked?.formattedValue??'';
    this.err_msg = checked?.message??'';
  }

}

