import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule } from "@farfadev/ngx-object-editor";
import { FarfaSvgModule, FarfaSvgService } from '@farfadev/ngx-svg';
import { valueScheme } from './schemes/expression/common-scheme';


@Component({
  selector: 'app-test-001',
  templateUrl: './test_001.component.html',
  styleUrls: [],
  imports: [CommonModule, FormsModule, RouterModule, ObjectEditorModule, FarfaSvgModule],
})
export class Test001Component implements OnInit, AfterViewInit {

  err_msg: string = '';
  @Input()
  debug: boolean = false;


  chimereHL: string = '';

  constructor(private svgService: FarfaSvgService) {
  }

  test001Context = {
    scheme: valueScheme,
//    value: ['let','toto',3,'titi','hello',['var','toto']]
  };

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }
}

