
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { Subscription } from 'rxjs';

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'showcases-angular-component',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.scss'],
  imports: [FormsModule],
})
export class ShowcasesAngularComponentCoords implements OnInit, AfterViewInit, OnDestroy {

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

  subscription: Subscription | undefined;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.subscription?.unsubscribe();
    this.subscription = this.context?.updateObservable?.subscribe((o: object) => {
      // some stuff when the context is updated
    });
    const subContextLat = ObjectEditor.getSubContext(this.context!, 'lat');
    if (subContextLat && this.latEl) {
      new ObjectEditor.InputSocket(this.latEl.nativeElement, ObjectEditor.adjustDMS({}), subContextLat, (context: ObjectEditor.Context, err_msg: string) => {
        this.err_msg_lat = err_msg;
      });
    }
    const subContextLon = ObjectEditor.getSubContext(this.context!, 'lon');
    if (subContextLon && this.lonEl) {
      new ObjectEditor.InputSocket(this.lonEl.nativeElement, ObjectEditor.adjustDMS({}), subContextLon, (context: ObjectEditor.Context, err_msg: string) => {
        this.err_msg_lon = err_msg;
      });
    }
  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

