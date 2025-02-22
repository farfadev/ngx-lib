import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ObjectEditorContext } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'app-object-editor-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  imports: [RouterModule, ObjectEditorModule],
})
export class TestComponent  implements OnInit {

  context: ObjectEditorContext = {
    value: {
     p1: 'coucou',
     p3: '#ffffff',
     p4: false
    } ,
    scheme: {
      uibase: 'object',
      restricted: false,
     properties: {
       p1: {
         uibase: 'text'
       },
       p2: {
         uibase: 'number',
         optional: true,
         default: 5
       },
       p3: {
         uibase: 'color'
       },
       p4: {
        uibase: 'boolean',
        default: true
      }
    }
    }
   }
 
  constructor() { }

  ngOnInit() {}

}
