import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ATooltipComponent } from './a-tooltip.component';

describe('ATooltipComponent', () => {
  let component: ATooltipComponent;
  let fixture: ComponentFixture<ATooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ATooltipComponent ]
    }).compileComponents();

    fixture = TestBed.createComponent(ATooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
