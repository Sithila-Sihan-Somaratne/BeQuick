import { Injectable } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ResetPwdModalServiceAboutUS {
  openResetPasswordModal(): void {
    const modalElement = document.getElementById('resetPasswordModalAboutUs')!;
    const modalOptions: bootstrap.Modal.Options = {
      backdrop: 'static',
      keyboard: false,
      focus: false
    };
    new bootstrap.Modal(modalElement, modalOptions).show();
  }
}
