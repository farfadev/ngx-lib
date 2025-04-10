import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdjustSocket, FarfaIconModule, ObjectEditor, adjustDMS } from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";
import { FarfaSourceCodeComponent } from '../../source-code/source-code.component';

type Coordinates = {
  lat: number;
  lon: number;
}

@Component({
  selector: 'showcases-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule, ObjectEditorModule, FarfaIconModule, FarfaSourceCodeComponent],
})
export class ShowcasesContainerComponent implements OnInit {

  innerComponent?: any;

  sources?: Record<string,string>;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route
    .data
    .subscribe((v: any) => {
      v.component?.then((component: any)=>{
        const key = Object.keys(component)?.[0];
       if(key) this.innerComponent = component[key];
      }); 
      if(v.sources) this.sources = v.sources;
    });  

  }
}

