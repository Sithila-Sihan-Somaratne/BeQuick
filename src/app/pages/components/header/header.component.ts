import { Component, OnInit } from '@angular/core';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { LogInComponent } from '../log-in/log-in.component';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalServiceHeader } from '../modal-header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SignUpComponent, LogInComponent, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit{
  forgotPasswordForm!: any;
  alertPlaceholder! : any;

  constructor(private httpClient: HttpClient, private fb: FormBuilder, private modalService : ModalServiceHeader){} 

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
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
  openForgotPasswordModalHeader(): void{
    this.modalService.openForgotPasswordModal();
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
