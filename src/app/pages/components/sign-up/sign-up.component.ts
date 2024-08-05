import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import * as bcrypt from 'bcryptjs';

interface SignUpResponse {
  message: string;
  status: number
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  providers: [DatePipe]
})
export class SignUpComponent implements OnInit {
  hide: boolean = true;
  signUpForm!: FormGroup;
  logInForm!: FormGroup;
  signUpSuccess: boolean = false;
  verifyPinForm: any;
  alertPlaceholder1!: HTMLDivElement;
  alertPlaceholder2!: HTMLDivElement;

  constructor(private httpClient: HttpClient, private fb: FormBuilder, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userContact: ['', Validators.required],
      userDOB: ['', [Validators.required, minimumAgeValidator(18)]],
      userPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      bankName: ['', Validators.required],
      bankAccountNumber: ['', Validators.required],
      bankSWIFT: ['', Validators.required]
    }, { validators: this.fieldsMatchValidator('userPwd', 'confirmPwd') });
    this.verifyPinForm = this.fb.group({
      pin: ['', Validators.required]
    });
    this.alertPlaceholder1 = document.getElementById('liveAlertPlaceholder1') as HTMLDivElement;
    this.alertPlaceholder2 = document.getElementById('liveAlertPlaceholder2') as HTMLDivElement;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy/MM/dd') || '';
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

  encryptPassword(password: string): string {
    const saltRounds = 12;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  signUp(): void {
    if (this.signUpForm.valid) {
      const formattedDOB = this.datePipe.transform(this.signUpForm.value.userDOB, 'yyyy-MM-dd');
      const formWithFormattedDOB = {
        ...this.signUpForm.value,
        userDOB: formattedDOB,
        confirmPwd: "",
        userPwd: this.encryptPassword(this.signUpForm.value.userPwd)
      };
      this.httpClient.post('http://localhost:3000/sign-up', formWithFormattedDOB).subscribe(
        (response) => {
          const message = (response as SignUpResponse).message;
          this.appendAlert(message, "success", 1);
          this.signUpSuccess = true;
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.error.message, "danger", 1)
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