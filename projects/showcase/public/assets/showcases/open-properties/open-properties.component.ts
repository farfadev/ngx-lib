
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-optional-properties',
  templateUrl: './open-properties.component.html',
  styleUrls: ['./open-properties.component.scss'],
  imports: [FormsModule, ObjectEditorModule],
})

export class ShowcaseOpenPropertiesComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any, label?: string) {
    const scheme: ObjectEditor.Scheme = { uibase: 'none', default: value, label, readonly: true };
    return scheme;
  }

  myvalue = {
    simpleNumber: 3,
    simpleColor: '#0000ff',
    simpleBoolean: false,
    simpleRadio: undefined,
    openProp1: 'open property 1'
  }
  myscheme: ObjectEditor.Scheme = {
    uibase: 'object',
    label: 'showcase optional properties',
    properties: {
      simpleText: {
        uibase: 'text',
        optional: true,
        default: 'test'
      },
      simpleNumber: {
        uibase: 'number',
        default: 5
      },
      simpleColor: {
        uibase: 'color',
        optional: true,
        default: '#008000'
      },
      simpleBoolean: {
        uibase: 'boolean',
        default: true
      },
      simpleRadio: {
        uibase: 'select',
        optional: true,
        uiEffects: {
          radio: true,
          horizontal: true
        },
        selectionList: {
          sel1: this.value2scheme('coucou'),
          sel2: this.value2scheme(0),
          sel3: this.value2scheme({ a: 1, b: 'zebu' })
        },
      },
    },
    selectionList: {
      'boolean': {
        uibase: 'boolean'
      },
      'number': {
        uibase: 'number'
      },
      'text': {
        uibase: 'text'
      }
    },
  }
  mycontext: ObjectEditor.Context = ObjectEditor.createContext(this.myscheme,this.myvalue);
}


