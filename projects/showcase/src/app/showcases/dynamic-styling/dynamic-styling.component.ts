import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ObjectEditorModule } from '@farfadev/ngx-object-editor';
import * as ObjectEditor from '@farfadev/ngx-object-editor';

@Component({
  selector: 'showcases-dynamic-styling',
  templateUrl: './dynamic-styling.component.html',
  styleUrls: ['./dynamic-styling.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseDynamicStylingComponent {

  @Input()
  debug = false;

  mycontext: ObjectEditor.Context = {
    value: {
    },
    scheme: {
      uibase: 'object',
      label: 'showcase dynamic styling',
      properties: {
        'dynamic-styling-text': {
          uibase: 'text',
          default: 'replace me by "red"',
          uiEffects: { style: (context: ObjectEditor.Context) => context.value == "red" ? "color: red;font-weight: bold" : "color: green;font-weight: bold" },
          description: (context: ObjectEditor.Context) => '<p><b>property ' + context.key + '</b></br></p<p>this is to test a text input, style <span style=\'font-weight:bold;color:red;\'>bold red</span> when value is \'red\' </br></p>' +
            "<p>value=" + (typeof context.value) + " " + context.value + "</p>"
        },
        'dynamic-styling-number': {
          uibase: 'number',
          default: 15,
          uiEffects: { style: (context: ObjectEditor.Context) => context.value == 12 ? "color: red;font-weight: bold" : "color: green;font-weight: bold" },
          description: (context: ObjectEditor.Context) => '<p><b>property ' + context.key + '</b></br></p<p>this is to test a number input, style <span style=\'font-weight:bold;color:red;\'>bold red</span> when value is 12 </br></p>' +
            "<p>value=" + (typeof context.value) + " " + context.value + "</p>"
        },
      }
    }
  }
}

