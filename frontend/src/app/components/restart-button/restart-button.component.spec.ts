import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestartButtonComponent } from './restart-button.component';

describe('RestartButtonComponent', () => {
  let component: RestartButtonComponent;
  let fixture: ComponentFixture<RestartButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestartButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestartButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
