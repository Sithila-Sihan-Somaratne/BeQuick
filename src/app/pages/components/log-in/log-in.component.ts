import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../services/auth.service';

interface LogInResponse {
  message: string;
  status: number;
}

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FontAwesomeModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {
  faLogIn = faRightFromBracket;
  logInForm!: FormGroup;
  hide: boolean = true;
  isLoggedIn: boolean = false;
  logInSuccess: boolean = false;
  alertPlaceholder!: HTMLDivElement;

  constructor(private httpClient: HttpClient, private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.logInForm = this.fb.group({
      userName: ['', Validators.required],
      userPwd: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
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
      const formData = {
        loginInput: this.logInForm.get('userName')?.value,
        userPwd: this.logInForm.get('userPwd')?.value
      };
      this.httpClient.post('http://localhost:3000/log-in', formData).subscribe(
        (response: any) => {
          const message = (response as LogInResponse).message;
          this.appendAlert(message, "success", 1);
          this.isLoggedIn = true;
          this.authService.login(); // Notify that login is successful
        },
        (error: HttpErrorResponse) => {
          console.error('Error object:', error); // Log the entire error object for debugging
          const errorMessage = error.error?.message || 'An unexpected error occurred';
          this.appendAlert(errorMessage, "danger", 1);
          // Check if the error message exists and includes 'Account locked'
          if (errorMessage.includes('Account locked')) {
            this.logInForm.disable();
            setTimeout(() => this.logInForm.enable(), 300000); // 5 minutes
          }
        }
      );
    }
  }

  appendAlert = (message: any, type: any, option: number): void => {
    const wrapper = document.createElement('div');
    if (type === 'success') {
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div><i class="bi bi-check-circle-fill"></i> ${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('');
    } else {
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div><i class="bi bi-x-circle-fill"></i> ${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('');
    }
    switch (option) {
      case 1:
        this.alertPlaceholder.append(wrapper);
        break;
      default:
        alert("ERROR! SOMETHING WENT WRONG!");
        break;
    }
  }
}