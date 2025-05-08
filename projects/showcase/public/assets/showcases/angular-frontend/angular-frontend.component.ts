import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from "@farfadev/ngx-object-editor";
import { ShowcasesAngularComponentCoords } from './mycomponent/my.component';

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'showcases-angular-frontend',
  templateUrl: './angular-frontend.component.html',
  styleUrls: ['./angular-frontend.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditor.ObjectEditorModule],
})
export class ShowcasesCustomFrontendComponent {

  err_msg: string = '';
  @Input() debug = false;

  mycontext: ObjectEditor.Context = {
    scheme: {
      uibase: 'object',
      label: 'showcase angular frontend',
      uiEffects: {
        toggle: true
      },
      properties: {
        'coordinates': {
          uibase: 'angular',
          default: [12.5542, 15.87122],
          transform: {
            forward: (value: number[]) => ({ lat: value[0], lon: value[1] }),
            backward: (value: Coordinates) => [value.lat, value.lon]
          },
          angularFrontEnd: {
            component: (context: ObjectEditor.Context) => ShowcasesAngularComponentCoords,
            inputs: (context: ObjectEditor.Context) => ({
              welcomeMessage: 'I am a custom angular component'
            })
          }
        }
      }
    }
  }
}

