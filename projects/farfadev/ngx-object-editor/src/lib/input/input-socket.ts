import * as ObjectEditor from "../object-editor";
import { getUIValue, setUIValue } from "../object-editor-int";

export class InputSocket {
  constructor(private inputElement: HTMLInputElement, private adjust: ObjectEditor.Adjust, private context: ObjectEditor.Context, private update: (context: any, err_msg: string) => void) {
    if (this.inputElement) {
      this.inputElement.addEventListener('keyup', (event: KeyboardEvent) => {
      })
      this.inputElement.onkeydown = (e: KeyboardEvent) => {
        const curPos = this.inputElement!.selectionStart ?? -1;
        return this.adjust.accept ? this.adjust.accept(this.context, e, this.inputElement.value, curPos) : true;
      }
      this.inputElement.oninput = () => {
        this._update(false);
      }
      this.inputElement.onchange = () => {
        this._update(true);
      }
      this.inputElement.onclick = () => {
        context?.onClick?.(context);
      }
      this.updateValue();
      const editUpdate = this.context.editUpdate;
      this.context.editUpdate = (self?: boolean) => {
        if (self !== true) {
          this.updateValue();
        }
        editUpdate?.();
      }
    }
  }
  private updateValue() {
    if (this.adjust.adjust) {
      const adjusted = this.adjust.adjust(this.context, String(getUIValue(this.context) ?? ''));
      this.inputElement.value = adjusted?.formattedValue ?? '';
    }
    else {
      this.inputElement.value = String(getUIValue(this.context) ?? '');
    }
  }
  private _update(uiAdjust: boolean) {
    let cursorPosition: number | null = 0;
    let adjusted;
    if(this.adjust.adjust) {
      adjusted = this.adjust.adjust(this.context, this.inputElement.value, this.inputElement.selectionStart ?? 0);
      setUIValue(this.context, adjusted?.adjustedValue);
    }
    else {
      setUIValue(this.context, this.inputElement.value);
    }
    if (uiAdjust) { // adjust UI value when focus is lost
      if(this.adjust.adjust) {
        const adjusted = this.adjust.adjust(this.context, getUIValue(this.context), this.inputElement.selectionStart ?? 0);
        this.inputElement.value = adjusted?.formattedValue ?? '';
      }
      else {
        this.inputElement.value = getUIValue(this.context);
      }
      cursorPosition = String(this.inputElement.value).length;
    }
    else {
      this.inputElement.value = adjusted?.formattedValue ?? '';
      cursorPosition = this.inputElement!.selectionStart;
      if (adjusted?.cursorPosition == 'end') {
        cursorPosition = String(this.inputElement.value).length;
      }
      else {
        cursorPosition = adjusted?.cursorPosition ?? this.inputElement.selectionStart;
      }
    }
    (async () => {
      this.inputElement!.selectionStart = cursorPosition;
      this.inputElement!.selectionEnd = cursorPosition;
    })();
    this.context.editUpdate?.(true);
    this.update(this.context, uiAdjust ? '' : (adjusted?.message ?? ''));
  }
}