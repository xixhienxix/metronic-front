import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExpressComponent } from './edit-express.component';

describe('EditExpressComponent', () => {
  let component: EditExpressComponent;
  let fixture: ComponentFixture<EditExpressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditExpressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditExpressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
