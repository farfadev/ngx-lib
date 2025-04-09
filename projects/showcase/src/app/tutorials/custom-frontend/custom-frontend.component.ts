import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdjustSocket, FarfaIconModule, FarfaIconService, ObjectEditor, adjustDMS } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-object-editor-test',
  templateUrl: './custom-frontend.component.html',
  styleUrls: ['./custom-frontend.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule, ObjectEditorModule, FarfaIconModule],
})
export class ShowcasesCustomFrontendComponent implements OnInit {

  err_msg: string = '';
  _debug: boolean = false;
  @Input()
  set debug(v: boolean) {
    this._debug = v;
  };
  get debug(): boolean {
    return this._debug;
  }

  constructor() {
  }

  mycontext1: ObjectEditor.Context = {
    value: {
      coordinates: [32, 67]
    },
    scheme: {
      uibase: 'object',
      label: 'test-object-editor',
      uiEffects: {
        toggle: true
      },
      properties: {
        'custom-frontend-coords': {
          uibase: 'custom',
          default: [12.5542, 15.87122],
          transform: {
            forward: (value: number[]) => ({ lat: value[0], lon: value[1] }),
            backward: (value: Coordinates) => [value.lat, value.lon]
          },
          customFrontEnd: {
            html: (context: ObjectEditor.Context) =>
              "<label style='color:red;'>latitude&nbsp;&nbsp;&nbsp;  </label><input id='lat'></input><br>"
              + "<label style='color:blue;'>longitude </label><input id='lon'></input><br>",
            init: (context: ObjectEditor.Context, element: HTMLElement, err: (err_msg: string) => void) => {
              for (const c of element.children) {
                if (c.tagName == 'INPUT') {
                  const subContext = ObjectEditor.getSubContext(context, c.id);
                  if (subContext) {
                    new AdjustSocket(c as HTMLInputElement, adjustDMS({}), subContext, (context: ObjectEditor.Context, err_msg: string) => {
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

  mycontext2: ObjectEditor.Context = {
    value: false,
    scheme: {
      uibase: 'boolean',
      label: 'test-object-editor2',
    }
  }

  ngOnInit() {
  }
}

