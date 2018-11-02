import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashBodyComponent } from './splash-body.component';

describe('SplashBodyComponent', () => {
  let component: SplashBodyComponent;
  let fixture: ComponentFixture<SplashBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplashBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
