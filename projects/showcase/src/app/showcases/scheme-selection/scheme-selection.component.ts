import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ObjectEditor } from '@farfadev/ngx-object-editor';
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
              uibase: 'checkbox',
              label: 'myboolean'
            },

            number: {
              uibase: 'number',
              default: 3,
            }
          }
        },
      }
    }
  }
}

