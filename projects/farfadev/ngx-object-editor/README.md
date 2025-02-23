<h1> @farfadev/ngx-object-editor </h1>

An [Angular](https://angular.dev/) component to edit typescript/ javascript object

<h2>installation</h2>
npm i @farfadev/ngx-object-editor

<h2>utilisation</h2>
<p>&lt;ngx-object-editor [context]=mycontext/&gt;</p>
<code color='blue'>
import { Component, OnInit } from '@angular/core';<br>
import { RouterModule } from '@angular/router';<br>
import { ObjectEditorContext } from '@farfadev/ngx-object-editor';<br>
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";<br>

@Component({<br>
  selector: 'app-object-editor-test',<br>
  templateUrl: './test.component.html',<br>
  styleUrls: ['./test.component.scss'],<br>
  imports: [RouterModule, ObjectEditorModule],<br>
})<br>
export class TestComponent  implements OnInit {<br>
<br>
  mycontext: ObjectEditorContext = {<br>
    value: {<br>
     p1: 'coucou',<br>
     p3: '#ffffff',<br>
     p4: false<br>
    } ,<br>
    scheme: {<br>
      uibase: 'object',<br>
      restricted: false,<br>
     properties: {<br>
       p1: {<br>
         uibase: 'text'<br>
       },<br>
       p2: {<br>
         uibase: 'number',<br>
         optional: true,<br>
         default: 5<br>
       },<br>
       p3: {<br>
         uibase: 'color'<br>
       },<br>
       p4: {<br>
        uibase: 'boolean',<br>
        default: true<br>
      }<br>
    }<br>
    }<br>
   }<br>
<br> 
  constructor() { }<br>
<br>
  ngOnInit() {}<br>
<br>
}<br>
</code>

