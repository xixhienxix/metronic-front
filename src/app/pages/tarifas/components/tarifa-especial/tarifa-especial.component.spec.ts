import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifaEspecialComponent } from './tarifa-especial.component';

describe('TarifaEspecialComponent', () => {
  let component: TarifaEspecialComponent;
  let fixture: ComponentFixture<TarifaEspecialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifaEspecialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifaEspecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
