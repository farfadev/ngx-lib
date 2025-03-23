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
        if (e.key == '-') {
          if(curPos === 0) {
            return(this.value.charAt(1) != '-');
          }
          if(curPos > 0) {
            return(this.value.charAt(curPos) != '-' && 
              (this.value.charAt(curPos-1) == 'e' ||
              this.value.charAt(curPos-1) == 'E'));
          }
          if (this.value.indexOf('-') >= 0) return false;
          if (this.inputElement!.selectionStart??-1 > 0) return false;
        }
        if (['.'].includes(e.key)) {
          if (this.value.indexOf('.') >= 0) return false;
        }
        return (e.key.length == 1 && ("-1234567890.eE".indexOf(e.key) >= 0)) ||
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
    this._context?.onClick?.();
  }

  adjust(cursor?: number) {
    const adjust = this.context?.scheme?.adjust ?? adjustNumber({});
    return adjust(this.context!,cursor);
  }

  editUpdate() {
    this.context!.value = this.value;
    const adjusted = this.adjust(this.inputElement!.selectionStart??0);
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
    const adjusted = this.adjust()
    this.value = adjusted?.formattedValue??this.value;
    this.err_msg = adjusted?.message??'';
  }

}

