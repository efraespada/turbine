import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleBodyComponent } from './console-body.component';

describe('ConsoleBodyComponent', () => {
  let component: ConsoleBodyComponent;
  let fixture: ComponentFixture<ConsoleBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
