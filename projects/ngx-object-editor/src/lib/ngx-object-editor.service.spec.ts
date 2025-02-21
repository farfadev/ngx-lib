import { TestBed } from '@angular/core/testing';

import { NgxObjectEditorService } from './ngx-object-editor.service';

describe('NgxObjectEditorService', () => {
  let service: NgxObjectEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxObjectEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
