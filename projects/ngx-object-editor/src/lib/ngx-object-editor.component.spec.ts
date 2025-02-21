import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxObjectEditorComponent } from './ngx-object-editor.component';

describe('NgxObjectEditorComponent', () => {
  let component: NgxObjectEditorComponent;
  let fixture: ComponentFixture<NgxObjectEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxObjectEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxObjectEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
