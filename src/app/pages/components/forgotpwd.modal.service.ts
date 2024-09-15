import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';

@Injectable({
  providedIn: 'root'
})
export class ForgotPwdModalService {
  constructor(private modalService: NgbModal) {}

  openForgotPasswordModal(): void {
    const modalRef = this.modalService.open(HeaderComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true
    });
  }
}
