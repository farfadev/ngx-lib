import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FarfaTooltipComponent } from './farfa-tooltip.component';

describe('ATooltipComponent', () => {
  let component: FarfaTooltipComponent;
  let fixture: ComponentFixture<FarfaTooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FarfaTooltipComponent ]
    }).compileComponents();

    fixture = TestBed.createComponent(FarfaTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
