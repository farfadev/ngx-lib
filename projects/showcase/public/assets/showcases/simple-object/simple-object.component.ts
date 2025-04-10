import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'object-editor-tuto1',
  templateUrl: './simple-object.component.html',
  styleUrls: ['./simple-object.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseSimpleObjectComponent {

  _debug: boolean = false;
  @Input()
  set debug(v: boolean) {
    this._debug = v;
    this.mycontext.debug = v;
  };
  get debug(): boolean {
    return this._debug;
  }

  mycontext: ObjectEditor.Context = {
    value: {
      simpleText: 'hello',
      simpleNumber: 3,
      simpleColor: '#ffffff',
      simpleBoolean: false,
      simpleRadio: undefined
    },
    scheme: {
      uibase: 'object',
      label: 'tuto1',
      properties: {
        simpleText: {
          uibase: 'text',
          default: 'test'
        },
        simpleNumber: {
          uibase: 'number',
          default: 5
        },
        simpleColor: {
          uibase: 'color',
          default: 'red'
        },
        simpleBoolean: {
          uibase: 'boolean',
          default: true
        },
        simpleRadio: {
          uibase: 'radio',
          uiEffects: {
            horizontal: true
          },
          enum: {
            sel1: 'coucou',
            sel2: 0,
            sel3: { a: 1, b: 'zebu' }
          }
        },
      }
    }
  }
}

