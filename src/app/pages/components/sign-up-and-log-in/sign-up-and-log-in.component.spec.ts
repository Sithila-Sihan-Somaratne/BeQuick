import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpANDlogInComponent } from './sign-up-and-log-in.component';

describe('SignUpANDlogInComponent', () => {
  let component: SignUpANDlogInComponent;
  let fixture: ComponentFixture<SignUpANDlogInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpANDlogInComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpANDlogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
