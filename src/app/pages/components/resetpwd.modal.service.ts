import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';

@Injectable({
  providedIn: 'root'
})
export class ResetPwdModalService {
  constructor(private modalService: NgbModal) {}

  openResetPasswordModal(): void {
    const modalRef = this.modalService.open(HeaderComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true
    });
  }
}
