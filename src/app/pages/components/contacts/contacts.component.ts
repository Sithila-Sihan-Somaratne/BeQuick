import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsappSquare, faViber, faSkype, faYahoo } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent {
  faWhatsapp = faWhatsappSquare;
  faViber = faViber;
  faPhone = faPhone;
  faSkype = faSkype;
  faMail = faEnvelope;
  faYahoo = faYahoo;
}
