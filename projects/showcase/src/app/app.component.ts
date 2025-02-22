import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ObjectEditorModule } from '@farfadev/ngx-object-editor';
import { TestComponent } from "./test/test.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ObjectEditorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'showcase';
}
