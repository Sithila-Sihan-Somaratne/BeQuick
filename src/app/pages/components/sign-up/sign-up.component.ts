import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

interface SignUpResponse {
  message: string;
  status: number
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FontAwesomeModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  faSignUp = faUserPlus 
  hide: boolean = true;
  signUpForm!: FormGroup;
  logInForm!: FormGroup;
  signUpSuccess: boolean = false;
  verifyPinForm: any;
  alertPlaceholder1!: HTMLDivElement;
  alertPlaceholder2!: HTMLDivElement;

  constructor(private httpClient: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userContact: ['', Validators.required],
      userDOB: ['', [Validators.required, minimumAgeValidator(18)]],
      userPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]]
    }, { validators: this.fieldsMatchValidator('userPwd', 'confirmPwd') });
    this.verifyPinForm = this.fb.group({
      pin: ['', Validators.required]
    });
    this.alertPlaceholder1 = document.getElementById('liveAlertPlaceholder1') as HTMLDivElement;
    this.alertPlaceholder2 = document.getElementById('liveAlertPlaceholder2') as HTMLDivElement;
  }

  passwordStrengthValidator(): ValidatorFn {
    return Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_])[A-Za-z\\d\\W_].{8,}$');
  }

  fieldsMatchValidator(...fields: string[]): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      let isValid = true;
      for (let i = 0; i < fields.length; i += 2) {
        let field = group.get(fields[i]);
        let matchingField = group.get(fields[i + 1]);
        if (field && matchingField && field.value !== matchingField.value) {
          isValid = false;
          matchingField.setErrors({ fieldsDoNotMatch: true });
        } else {
          matchingField?.setErrors(null);
        }
      }
      return isValid ? null : { 'fieldsDoNotMatch': true };
    };
  }

  signUp(): void {
    if (this.signUpForm.valid) {
      const formData = this.signUpForm.value;
      this.httpClient.post('http://localhost:3000/sign-up', formData).subscribe(
        (response) => {
          const message = (response as SignUpResponse).message;
          this.appendAlert(message, "success", 1);
          this.signUpSuccess = true;
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.message, "danger", 1)
        }
      );
    }
  }

  verifyPin(): void {
    const pin = this.verifyPinForm.get('pin')?.value;
    if (pin) {
      this.httpClient
        .post('http://localhost:3000/verify-pin', {
          userName: this.signUpForm.value.userName,
          verificationPin: pin,
        })
        .subscribe(
          (response: any) => {
            this.appendAlert(response.message, 'success', 2);
          },
          (error: HttpErrorResponse) => {
            this.appendAlert(error.error.message, 'danger', 2);
          }
        );
    }
  }

  appendAlert = (message: any, type: any, option: number): void => {
    const wrapper = document.createElement('div')
    if (type === 'success') {
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div><i class="bi bi-check-circle-fill"></i> ${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    } else {
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div><i class="bi bi-x-circle-fill"></i> ${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    }
    switch (option) {
      case 1:
        this.alertPlaceholder1.append(wrapper);
        break;
      case 2:
        this.alertPlaceholder2.append(wrapper);
        break;
      default:
        alert("ERROR! SOMETHING WENT WRONG!")
        break;
    }
  }
}

export function minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { 'minimumAge': { value: minAge } };
  };
}