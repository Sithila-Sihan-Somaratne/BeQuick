import { Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { LogInComponent } from '../log-in/log-in.component';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import * as bcrypt from 'bcryptjs';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbNavModule, NgbDropdownModule, NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

interface PurposeResponse {
  message: string;
  status: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    SignUpComponent,
    LogInComponent,
    ReactiveFormsModule,
    HttpClientModule,
    NgbNavModule,
    NgbDropdownModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @ViewChild('resetPasswordModal') resetPasswordModal: any;
  @ViewChild('liveAlertPlaceholder4', { static: false }) alertPlaceholder1!: ElementRef<HTMLDivElement>;
  @ViewChild('liveAlertPlaceholder5', { static: false }) alertPlaceholder2!: ElementRef<HTMLDivElement>;
  hide: boolean = true;
  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  isLoggedIn: boolean = false;
  active: number = 1;
  userProfile: any = {};
  @ViewChild('offcanvasProfile') offcanvasProfileTemplate!: TemplateRef<any>;
  offcanvasRef: NgbOffcanvasRef | undefined;

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private modalService1: NgbModal,
    private modalService2: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.resetPasswordForm = this.fb.group({
      resetToken: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
    }, { validators: this.fieldsMatchValidator('newPassword', 'confirmPassword') });

    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (this.isLoggedIn) {
        this.loadUserProfile();
      }
    });
  }

  loadUserProfile(): void {
    const userName = this.authService.getUserName(); // Get the logged-in user's name
    if (userName) {
      this.profileService.getUserProfile(userName).subscribe(
        (data: any) => {
          this.userProfile = data;
          // Format the date of birth for display
          if (this.userProfile.dateOfBirth) {
            this.userProfile.dateOfBirth = new Date(this.userProfile.dateOfBirth).toLocaleDateString();
          }
        },
        (error) => {
          console.error('Error fetching user profile:', error);
        }
      );
    }
  }

  passwordStrengthValidator(): ValidatorFn {
    return Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_])[A-Za-z\\d\\W_].{8,}$');
  }

  fieldsMatchValidator(...fields: string[]): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      let isValid = true;
      for (let i = 0; i < fields.length; i += 2) {
        const field = group.get(fields[i]);
        const matchingField = group.get(fields[i + 1]);
        if (field && matchingField && field.value !== matchingField.value) {
          isValid = false;
          matchingField.setErrors({ fieldsDoNotMatch: true });
        } else {
          matchingField?.setErrors(null);
        }
      }
      return isValid ? null : { fieldsDoNotMatch: true };
    };
  }

  encryptPassword(password: string): string {
    const saltRounds = 12;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }

  forgotPassword(): void {
    if (this.forgotPasswordForm.valid) {
      this.httpClient.post('http://localhost:3000/forgot-password', this.forgotPasswordForm.value).subscribe(
        (response: any) => {
          this.appendAlert(response.message, 'success', 1);
          setTimeout(() => {
            this.openResetPasswordModal();
          }, 20000);
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.error.message, 'danger', 1);
        }
      );
    }
  }

  resetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const { resetToken, newPassword, confirmPassword } = this.resetPasswordForm.value;
      if (newPassword !== confirmPassword) {
        this.appendAlert('Passwords do not match!', 'danger', 2);
        return;
      }
      const encryptedPassword = this.encryptPassword(newPassword);
      this.httpClient.post(`http://localhost:3000/reset-password/${resetToken}`, { newPassword: encryptedPassword }).subscribe(
        (response) => {
          const message = (response as PurposeResponse).message;
          this.appendAlert(message, 'success', 2);
        },
        (error: HttpErrorResponse) => {
          this.appendAlert(error.error.message, 'danger', 2);
        }
      );
    }
  }

  openMultiPurposeModal(content: any) {
    this.modalService1.open(content, { backdrop: 'static' });
  }

  openForgotPasswordModal(content: any): void {
    this.modalService1.open(content, { backdrop: 'static' });
  }

  openResetPasswordModal(): void {
    this.modalService2.open(this.resetPasswordModal, { backdrop: 'static' });
  }

  appendAlert(message: string, type: string, option: number): void {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div><i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'x-circle-fill'}"></i> ${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>',
    ].join('');

    if (option === 1 && this.alertPlaceholder1) {
      this.alertPlaceholder1.nativeElement.append(wrapper);
    } else if (option === 2 && this.alertPlaceholder2) {
      this.alertPlaceholder2.nativeElement.append(wrapper);
    } else {
      console.error('Something went wrong!!!!');
    }
  }

  openProfileOffcanvas(content: TemplateRef<any>) {
    this.offcanvasRef = this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvasProfileLabel', position: 'end' });
  }

  closeProfileOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.close();
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeProfileOffcanvas();
  }
}
