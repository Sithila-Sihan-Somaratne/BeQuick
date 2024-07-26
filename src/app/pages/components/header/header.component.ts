import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import * as bcrypt from 'bcryptjs';

interface SignUpAndLogInResponse {
  message: string;
  status: number
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  hide: boolean = true;
  signUpForm!: FormGroup;
  logInForm!: FormGroup;
  alertPlaceholder!: HTMLDivElement;
  signUpSuccess: boolean = false;
  logInSuccess: boolean = false;

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
    this.alertPlaceholder = document.getElementById('liveAlertPlaceholder') as HTMLDivElement;
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
          console.log(response)
          const message = (response as SignUpAndLogInResponse).message;
          this.appendAlert(message, "success");
          this.signUpSuccess = true;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.appendAlert(error.message, "danger")
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
          console.log(response)
          const message = (response as SignUpAndLogInResponse).message;
          this.appendAlert(message, "success");
          this.signUpSuccess = true;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.appendAlert(error.message, "danger")
        }
      );

    }
  }

  verifyPin(): void {
    let pin = document.getElementById("pin")?.textContent;
    console.log(pin);
    if (pin) {
      this.httpClient.post('http://localhost:3000/verify-pin', { userName: this.signUpForm.value.userName, verificationPin: pin }).subscribe(
        (response) => {
          // Handle successful verification
          const message = (response as any).message; // Adjust the type as needed
          this.appendAlert(message, "success");
        },
        (error: HttpErrorResponse) => {
          // Handle errors, such as incorrect PIN
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.appendAlert(error.message, "danger");
        }
      );
    }
  }

  appendAlert = (message: any, type: any): void => {
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

    this.alertPlaceholder.append(wrapper)
  }


}
