import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObjectEditorComponent } from './object-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, DebugElement } from '@angular/core';

import { ObjectEditor } from '../object-editor';
import { ObjectEditorModule } from '../object-editor.module';
import { By } from '@angular/platform-browser';
import { random } from 'mathjs';
const timeout = 15000;

@Component({
  selector: 'test-component-wrapper',
  standalone: false,
  template: '<app-object-editor [context]="context"></app-object-editor>'
})
class TestComponentWrapper {
  context: ObjectEditor.Context = {
   value: {
    p1: 'coucou',
    p2: 12,
    p3: '#ffffff'
   } ,
   scheme: {
    uibase: 'object',
    properties: {
      p1: {
        uibase: 'text'
      },
      p2: {
        uibase: 'number'
      },
      p3: {
        uibase: 'color'
      }
    }
   }
  }
}

describe('ObjectEditorComponent', () => {
  let wrapcomponent: TestComponentWrapper;
  let component: ObjectEditorComponent;
  let fixture: ComponentFixture<TestComponentWrapper>;
  let ui_id;

  Object.defineProperty(crypto,'randomUUID', {
    value: () => 'coucou'+random(),
    writable: false
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestComponentWrapper ],
      imports: [ObjectEditorModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

    }).compileComponents();

    fixture = TestBed.createComponent(TestComponentWrapper);
    wrapcomponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
    ui_id = component.ui_id;
  }),timeout);

  it('should create', () => {
    expect(component).toBeTruthy();
  },timeout);

  it('test p1',() => {
//    jest.spyOn(component.context,method: '');
    const inputElems: DebugElement[] = 
      fixture.debugElement.queryAll(By.css('input'));
    sendInput(fixture,inputElems[1].nativeElement,'toto');
    expect(component.context.value['p1']).toEqual('toto');
  })
});

function sendInput(fixture: ComponentFixture<any>,inputElement: HTMLInputElement, data: any) {
  inputElement.value = data;
  inputElement.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  return fixture.whenStable();
}


