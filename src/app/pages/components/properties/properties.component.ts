import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faStar } from '@fortawesome/free-solid-svg-icons';
import { faSkype, faViber, faWhatsappSquare, faYahoo } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css'
})
export class PropertiesComponent implements OnInit {

  faSearch = faMagnifyingGlass;
  faStar = faStar;
  faWhatsapp = faWhatsappSquare;
  faViber = faViber;
  faPhone = faPhone;
  faSkype = faSkype;
  faMail = faEnvelope;
  faYahoo = faYahoo;
  @Input() public rating:number = 0; 

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    
  }

  setRating(value: number) {
    if (this.rating === value) {
      this.rating = 0; 
    } else {
      this.rating = value; 
    }
  }
}
