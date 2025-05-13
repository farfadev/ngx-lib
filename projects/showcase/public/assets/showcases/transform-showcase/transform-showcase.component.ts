import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-transform',
  templateUrl: './transform-showcase.component.html',
  styleUrls: ['./transform-showcase.component.scss'],
  imports: [CommonModule, FormsModule, ObjectEditorModule],
})
export class ShowcaseTransformComponent {

  @Input()
  debug: boolean = false;

  value2scheme(value: any,label?: string) {
    const scheme: ObjectEditor.Scheme = {uibase: 'none',default: value,label,readonly:true};
    return scheme;
  }

  mycontext: ObjectEditor.Context = {
    value: {
      simpleCoordinates: [-2,37],
    },
    scheme: {
      uibase: 'object',
      label: 'showcase transform',
      properties: {
        simpleCoordinates: {
          uibase: 'object',
          default: '[12,-45]',
          properties: {
            latitude: {
              uibase: 'number',
              adjust: ObjectEditor.adjustDMS({}),
            },
            longitude: {
              uibase: 'number',
              adjust: ObjectEditor.adjustDMS({}),
            }
          },
          transform: {
            forward: (t: number[]) => {latitude: t?.[1] ?? 0; longitude: t?.[0] ?? 0},
            backward: (v: {latitude: number; longitude: number}) => [v.longitude,v.latitude]
          }
        },
      }
    }
  }
}

