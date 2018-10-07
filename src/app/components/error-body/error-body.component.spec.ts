import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorBodyComponent } from './error-body.component';

describe('ErrorBodyComponent', () => {
  let component: ErrorBodyComponent;
  let fixture: ComponentFixture<ErrorBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
