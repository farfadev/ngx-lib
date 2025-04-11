import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSocket, ObjectEditor, adjustDMS } from '@farfadev/ngx-object-editor';

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'showcases-angular-component',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ShowcasesAngularComponentCoords implements OnInit, AfterViewInit {

  @Input()
  context?: ObjectEditor.Context

  @Input()
  debug = false;

  @Input()
  welcomeMessage?: string;

  @ViewChild('lon') lonEl?: ElementRef;
  @ViewChild('lat') latEl?: ElementRef;

  err_msg_lon: string = "";
  err_msg_lat: string = "";

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const subContextLat = ObjectEditor.getSubContext(this.context!, 'lat');
    if (subContextLat && this.latEl) {
      new InputSocket(this.latEl.nativeElement, adjustDMS({}), subContextLat, (context: ObjectEditor.Context, err_msg: string) => {
        this.err_msg_lat = err_msg;
        context.editUpdate?.();
      });
    }
    const subContextLon = ObjectEditor.getSubContext(this.context!, 'lon');
    if (subContextLon && this.lonEl) {
      new InputSocket(this.lonEl.nativeElement, adjustDMS({}), subContextLon, (context: ObjectEditor.Context, err_msg: string) => {
        this.err_msg_lon = err_msg;
        context.editUpdate?.();
      });
    }

  }

}

