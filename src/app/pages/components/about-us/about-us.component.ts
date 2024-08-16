import { Component, OnInit } from '@angular/core';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { LogInComponent } from '../log-in/log-in.component';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ForgotPwdModalServiceAboutUs } from '../forgotpwd.modal.about-us.service';
import { ResetPwdModalServiceAboutUS } from '../resetpwd.modal.about-us.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, SignUpComponent, LogInComponent, ReactiveFormsModule, HttpClientModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent implements OnInit{
  forgotPasswordForm!: any;
  alertPlaceholder! : any;
  resetPasswordForm!: any;

  constructor(private httpClient: HttpClient, private fb: FormBuilder, private modalService1 : ForgotPwdModalServiceAboutUs, private modalService2 : ResetPwdModalServiceAboutUS ){} 

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.resetPasswordForm = this.fb.group({
      resetToken: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
    });
  }
  passwordStrengthValidator(): ValidatorFn {
    return Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_])[A-Za-z\\d\\W_].{8,}$');
  }
  forgotPassword(): void {
    if (this.forgotPasswordForm.valid) {
      this.httpClient.post('http://localhost:3000/forgot-password', this.forgotPasswordForm.value).subscribe(
        (response: any) => {
          this.appendAlert(response.message, "success", 1);
          this.openResetPasswordModalAboutUs();
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.error.message, "danger", 1);
        }
      );
    }
  }
  openForgotPasswordModalAboutUs(): void{
    this.modalService1.openForgotPasswordModal();
  }
  openResetPasswordModalAboutUs(): void{
    this.modalService2.openResetPasswordModal();
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
