import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorBodyComponent } from './monitor-body.component';

describe('MonitorBodyComponent', () => {
  let component: MonitorBodyComponent;
  let fixture: ComponentFixture<MonitorBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
