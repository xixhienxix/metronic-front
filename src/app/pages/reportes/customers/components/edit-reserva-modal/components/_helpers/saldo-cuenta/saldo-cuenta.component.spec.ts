import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldoCuentaComponent } from './saldo-cuenta.component';

describe('SaldoCuentaComponent', () => {
  let component: SaldoCuentaComponent;
  let fixture: ComponentFixture<SaldoCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaldoCuentaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaldoCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
