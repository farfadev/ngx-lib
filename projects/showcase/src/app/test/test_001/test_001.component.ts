import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as ObjectEditor from '@farfadev/ngx-object-editor';
import { ObjectEditorModule, adjustNumber, dmsMask } from "@farfadev/ngx-object-editor";
import { FarfaSvgModule, FarfaSvgService } from '@farfadev/ngx-svg';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github.css';
import { valueScheme } from './expression-scheme';

// https://github.com/nerdstep/react-coordinate-input/blob/master/README.md
// https://imask.js.org/guide.html#getting-started

type Coordinates = {
  lat: number;
  lon: number;
}

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

  value2scheme(uibase: ObjectEditor.UIBase, value: any, label?: string) {
    const scheme: ObjectEditor.Scheme = { uibase: uibase, default: value, label, readonly: true };
    return scheme;
  }

  /**
   * keep a native version of the scheme
   */
  test001Context = {
    scheme: valueScheme,
//    value: ['let','toto',3,'titi','hello',['var','toto']]
  };

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }
}

