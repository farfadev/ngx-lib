import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-scheme-selection',
  templateUrl: './scheme-selection.component.html',
  styleUrls: ['./scheme-selection.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseSchemeSelectionComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any,label?: string) {
    const scheme: ObjectEditor.Scheme = {uibase: 'none',default: value,label,readonly:true};
    return scheme;
  }

  mycontext: ObjectEditor.Context = {
    scheme: {
      uibase: 'object',
      label: 'showcase scheme selection',
      properties: {
        'scheme-selection': {
          uibase: 'select',
          defaultSelectionKey: 'value',
          selectionList: {
            color: {
              uibase: 'color',
              label: 'mycolor',
              default: '#ff004e'
            },
            value: {
              uibase:'none',
              label: 'default value',
              readonly: true,
              default: 'default'
            },
            boolean: {
              uibase: 'boolean',
              label: 'myboolean'
            },

            number: {
              uibase: 'number',
              default: 3,
            }
          }
        },
        simpleRadio: {
          uibase: 'select',
          uiEffects: {
            radio: true,
            horizontal: true
          },
          selectionList: {
            sel1: this.value2scheme('coucou'),
            sel2: this.value2scheme(0),
            sel3: this.value2scheme({ a: 1, b: 'zebu' })
          }
        },
      }
    }
  }
}

