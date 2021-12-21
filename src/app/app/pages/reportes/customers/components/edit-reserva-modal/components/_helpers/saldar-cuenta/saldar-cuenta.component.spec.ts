import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldarCuentaComponent } from './saldar-cuenta.component';

describe('SaldarCuentaComponent', () => {
  let component: SaldarCuentaComponent;
  let fixture: ComponentFixture<SaldarCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaldarCuentaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaldarCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
