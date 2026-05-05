/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';

import * as ObjectEditor from '../../object-editor';

@Component({
  standalone: false,
  selector: 'oe-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  //  encapsulation: ViewEncapsulation.Emulated
})
export class OEFileComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('objectcontainer')
  private objectContainer!: ElementRef<HTMLElement>;

  _context?: ObjectEditor.Context;
  get context(): ObjectEditor.Context | undefined {
    return this._context;
  }
  @Input()
  set context(value: ObjectEditor.Context) {
    this._context = value;
    this.initContext();
  }

  filesSignal = signal<File[]>(new Array<File>());

  urls = new Map<File, string>();

  ui_id;

  err_msg: string = '';

  inputElement?: HTMLInputElement;

  constructor() {
    this.ui_id = window.crypto.randomUUID();
  }

  getId() {
    return this.ui_id + this.context?.key;
  }

  isReadOnly(context: ObjectEditor.Context) {
    return context.isReadOnly();
  }

  isMultiple() {
    return this.context?.getMaskOptions()?.['multiple'] ?? false;
  }

  accept() {
    return this.context?.getMaskOptions()?.['accept'] ?? '*';
  }

  trash(f: File) {
    this.filesSignal.update((files: File[]) => {
      const i = files.indexOf(f);
      if (i >= 0) files.splice(i, 1);
      return files.splice(0);
    });
    const url = this.urls.get(f);
    if (url !== undefined) URL.revokeObjectURL(url);
    this.urls.delete(f);
    this.editUpdate();
  }

  getURL(f: File) {
    return this.urls.get(f);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.inputElement = document.getElementById(this.getId()) as HTMLInputElement;
    this.inputElement.addEventListener("dragenter", this.dragenter, false);
    this.inputElement.addEventListener("dragover", this.dragover, false);
    this.inputElement.addEventListener("drop", this.drop, false);

    const fileSelect = document.getElementById(this.getId() + "fileSelect");
    const fileElem = document.getElementById(this.getId() + "fileElem");
    fileElem?.addEventListener("change", (e: Event) => {
      this.handleFiles((e.target as any).files);
    }, false);
    if (fileSelect)
      fileSelect.addEventListener(
        "click",
        (e) => {
          if (fileElem) {
            fileElem.click();
          }
        },
        false,
      );
  }

  ngOnDestroy(): void {
  }

  getStyle(context: ObjectEditor.Context) {
    const stylePlus = this.err_msg != '' ? 'color:red' : '';
    const rstyle = context.getStyle();

    return rstyle ? rstyle + ';' + stylePlus : stylePlus;
  }

  getStyleClass(context: ObjectEditor.Context) {
    return context.getStyleClass();
  }

  getLabel(subContext: ObjectEditor.Context) {
    return subContext.getLabel();
  }

  onclick() {
    // this._context?.pcontext?.onClick?.(this._context);
  }

  editUpdate() {
    this.context?.setUIValue(this.filesSignal());
  }

  initContext() {
    if (!this.context) return;
    const keys = this.context.getUIValue() != undefined ? Object.keys(this.context.getUIValue()) : [];
    this.filesSignal.update((files: File[]) => {
      for (const key of keys) {
        if(this.context) files.push(this.context.getUIValue()[key]);
      }
      return files.slice(0);
    });
  }

  dragenter = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }

  dragover = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }

  drop = (e: DragEvent) => {
    if (!this.isReadOnly(this.context!)) {

      let files: FileList | undefined = undefined;

      e.stopPropagation();
      e.preventDefault();

      const dt = e.dataTransfer;
      if (dt?.files)
        files = dt?.files;

      if (files)
        this.handleFiles(files);
    }
  }

  handleFiles = (newFiles: FileList) => {
    this.filesSignal.update((files: File[]) => {
      for (let i = 0; i < newFiles.length; i++) {
        files.push(newFiles[i]);
        this.urls.set(newFiles[i], URL.createObjectURL(newFiles[i]));
      }
      return files.slice(0);
    });
    this.editUpdate();
  }
}

