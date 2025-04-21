import { CommonModule } from '@angular/common';
import { Component, ElementRef, Host, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSocket, ObjectEditor, adjustDMS } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'showcases-custom-frontend',
  templateUrl: './custom-frontend.component.html',
  styleUrls: ['./custom-frontend.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcasesCustomFrontendComponent {

  err_msg: string = '';
  @Input()
  debug = false;

  marker?: string;

  constructor() {
  }

  mycontext1: ObjectEditor.Context = {
    value: {
      coordinates: [32, 67]
    },
    scheme: {
      uibase: 'object',
      label: 'showcase custom frontend',
      uiEffects: {
        toggle: true
      },
      properties: {
        'coordinates': {
          uibase: 'custom',
          default: [12.5542, 15.87122],
          transform: {
            forward: (value: number[]) => ({ lat: value[0], lon: value[1] }),
            backward: (value: Coordinates) => [value.lat, value.lon]
          },
          customFrontEnd: {
            html: (context: ObjectEditor.Context) =>
              "<label class='latitude'>latitude&nbsp;&nbsp;&nbsp;  </label><input id='lat'/><br>"
              + "<label style='color:blue;'>longitude </label><input id='lon'/><br>",
            init: (context: ObjectEditor.Context, element: HTMLElement, err: (err_msg: string) => void) => {
              for (const c of element.children) {
                if (c.tagName == 'INPUT') {
                  const subContext = ObjectEditor.getSubContext(context, c.id);
                  if (subContext) {
                    new InputSocket(c as HTMLInputElement, adjustDMS({}), subContext, (context: ObjectEditor.Context, err_msg: string) => {
                      err(err_msg);
                      context.editUpdate?.();
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

