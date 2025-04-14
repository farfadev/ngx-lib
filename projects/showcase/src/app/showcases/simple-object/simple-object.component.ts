import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-simple-object',
  templateUrl: './simple-object.component.html',
  styleUrls: ['./simple-object.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseSimpleObjectComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any,label?: string) {
    const scheme: ObjectEditor.Scheme = {uibase: 'none',default: value,label,readonly:true};
    return scheme;
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
      label: 'showcase simple object',
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
          default: '#FF00FF'
        },
        simpleBoolean: {
          uibase: 'checkbox',
          default: true
        },
        simpleRadio: {
          uibase: 'radio',
          uiEffects: {
            horizontal: true
          },
          selectionList: {
            sel1: this.value2scheme('coucou'),
            sel2: this.value2scheme(0),
            sel3: this.value2scheme({ a: 1, b: 'zebu' })
          },
          defaultSelectionKey: 'sel2'
        },
      }
    }
  }
}

