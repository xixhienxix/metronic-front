import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitacionMainComponent } from './habitacion-main.component';

describe('HabitacionMainComponent', () => {
  let component: HabitacionMainComponent;
  let fixture: ComponentFixture<HabitacionMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabitacionMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitacionMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
