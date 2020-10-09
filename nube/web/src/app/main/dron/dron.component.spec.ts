import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DronComponent } from './dron.component';

describe('DronComponent', () => {
  let component: DronComponent;
  let fixture: ComponentFixture<DronComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DronComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
