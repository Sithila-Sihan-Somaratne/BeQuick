import { Injectable } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ResetPwdModalService {
  openResetPasswordModal(): void {
    const modalElement = document.getElementById('resetPasswordModal')!;
    const modalOptions: bootstrap.Modal.Options = {
      backdrop: 'static',
      keyboard: false,
      focus: false
    };
    new bootstrap.Modal(modalElement, modalOptions).show();
  }
}
