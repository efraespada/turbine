import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginBodyComponent } from './login-body.component';

describe('LoginBodyComponent', () => {
  let component: LoginBodyComponent;
  let fixture: ComponentFixture<LoginBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
