import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import * as bcrypt from 'bcryptjs';
import * as bs from 'bootstrap';

interface LogInResponse {
  message: string;
  status: number
}

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit{
  logInForm!: FormGroup;
  hide: boolean = true;
  logInSuccess: boolean = false;
  alertPlaceholder!: HTMLDivElement;
  forgotPasswordForm!: any;

  constructor(private httpClient: HttpClient, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.logInForm = this.fb.group({
      userName: ['', Validators.required],
      userPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
    });
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.alertPlaceholder = document.getElementById('liveAlertPlaceholder3') as HTMLDivElement;
  }
  passwordStrengthValidator(): ValidatorFn {
    return Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_])[A-Za-z\\d\\W_].{8,}$');
  }
  encryptPassword(password: string): string {
    const saltRounds = 12;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
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
          const message = (response as LogInResponse).message;
          this.appendAlert(message, "success", 1);
          this.logInSuccess = true;
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.error.message, "danger", 1)
          if (error.error.message.includes('Account locked')) {
            this.logInForm.disable();
            setTimeout(() => this.logInForm.enable(), 300000); // 5 minutes
          }
        }
      );

    }
  }
  forgotPassword(): void {
    if (this.forgotPasswordForm.valid) {
      this.httpClient.post('http://localhost:3000/forgot-password', this.forgotPasswordForm.value).subscribe(
        (response: any) => {
          this.appendAlert(response.message, "success", 1);
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.error.message, "danger", 1);
        }
      );
    }
  }
  openForgotPasswordModal(): void {
    const forgotPasswordModal = new bs.Modal(document.getElementById('forgotPasswordModal')!); // Use the alias here
    forgotPasswordModal.show();
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
        this.alertPlaceholder.append(wrapper);
        break;
      default:
        alert("ERROR! SOMETHING WENT WRONG!")
        break;
    }

  }
}


export namespace bootstrap{}