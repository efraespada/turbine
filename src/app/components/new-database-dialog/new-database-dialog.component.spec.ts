import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDatabaseDialogComponent } from './new-database-dialog.component';

describe('NewDatabaseDialogComponent', () => {
  let component: NewDatabaseDialogComponent;
  let fixture: ComponentFixture<NewDatabaseDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDatabaseDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDatabaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
