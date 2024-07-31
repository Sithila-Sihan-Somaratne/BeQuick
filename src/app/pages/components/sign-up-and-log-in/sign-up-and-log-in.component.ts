import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import * as bcrypt from 'bcryptjs';

interface SignUpAndLogInResponse {
  message: string;
  status: number
}

@Component({
  selector: 'app-sign-up-and-log-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './sign-up-and-log-in.component.html',
  styleUrl: './sign-up-and-log-in.component.css'
})

export class SignUpANDlogInComponent implements OnInit {
  hide: boolean = true;
  signUpForm!: FormGroup;
  logInForm!: FormGroup;
  signUpSuccess: boolean = false;
  logInSuccess: boolean = false;
  verifyPinForm: any;
  alertPlaceholder1!: HTMLDivElement;
  alertPlaceholder2!: HTMLDivElement;
  alertPlaceholder3!: HTMLDivElement;

  constructor(private httpClient: HttpClient, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      userContact: ['', Validators.required],
      confirmContact: ['', Validators.required],
      userPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]]
    }, { validators: this.fieldsMatchValidator('userEmail', 'confirmEmail', 'userContact', 'confirmContact', 'userPwd', 'confirmPwd') });
    this.logInForm = this.fb.group({
      userName: ['', Validators.required],
      userPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
    });
    this.verifyPinForm = this.fb.group({
      pin: ['', Validators.required]
    })
    this.alertPlaceholder1 = document.getElementById('liveAlertPlaceholder1') as HTMLDivElement;
    this.alertPlaceholder2 = document.getElementById('liveAlertPlaceholder2') as HTMLDivElement;
    this.alertPlaceholder3 = document.getElementById('liveAlertPlaceholder3') as HTMLDivElement;
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
      const encryptedPassword = this.encryptPassword(this.signUpForm.value.userPwd);
      const formWithEncryptedPassword = {
        ...this.signUpForm.value,
        userPwd: encryptedPassword
      };
      this.httpClient.post('http://localhost:3000/sign-up', formWithEncryptedPassword).subscribe(
        (response) => {
          const message = (response as SignUpAndLogInResponse).message;
          this.appendAlert(message, "success", 1);
          this.signUpSuccess = true;
        },
        (error: HttpErrorResponse) => {
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.appendAlert(error.message, "danger", 1)
        }
      );

    }
  }

  logIn(): void {
    if (this.logInForm.valid) {
      const encryptedPassword = this.encryptPassword(this.logInForm.value.userPwd);
      const formWithEncryptedPassword = {
        ...this.logInForm.value,
        userPwd: encryptedPassword
      };
      this.httpClient.post('http://localhost:3000/log-in', formWithEncryptedPassword).subscribe(
        (response) => {
          const message = (response as SignUpAndLogInResponse).message;
          this.appendAlert(message, "success", 3);
          this.signUpSuccess = true;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.appendAlert(error.message, "danger", 3)
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
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            this.appendAlert(error.message, 'danger', 2);
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
    switch(option) {
      case 1:
        this.alertPlaceholder1.append(wrapper);
        break;
      case 2:
        this.alertPlaceholder2.append(wrapper);
        break;
      case 3:
        this.alertPlaceholder3.append(wrapper);
        break;
      default:
        alert("ERROR! SOMETHING WENT WRONG!")
        break;
    }
    
  }


}
