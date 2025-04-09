import { ObjectEditor } from "../object-editor";

export class AdjustSocket {
  constructor(private inputElement: HTMLInputElement, private adjust: ObjectEditor.Adjust, private context: ObjectEditor.Context, private update: (context: any, err_msg: string) => void) {
    if (this.inputElement) {
      this.inputElement.addEventListener('keyup', (event: KeyboardEvent) => {
      })
      this.inputElement.onkeydown = (e: KeyboardEvent) => {
        const curPos = this.inputElement!.selectionStart ?? -1;
        return this.adjust.accept(this.context, e, this.inputElement.value, curPos);
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
        if(self !== true) {
          this.updateValue();
        }
        editUpdate?.();
      }
    }
  }
  private updateValue() {
    const adjusted = this.adjust.adjust(this.context, String(this.context.value ?? ''));
    this.inputElement.value = adjusted?.formattedValue ?? '';
  }
  private _update(uiAdjust: boolean) {
    let cursorPosition: number | null = 0;
    const adjusted = this.adjust.adjust(this.context, this.inputElement.value, this.inputElement.selectionStart ?? 0);
    this.context.value = adjusted?.adjustedValue;
    if (uiAdjust) { // adjust UI value when focus is lost
      const adjusted = this.adjust.adjust(this.context, this.context.value, this.inputElement.selectionStart ?? 0);
      this.inputElement.value = adjusted?.formattedValue ?? '';
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