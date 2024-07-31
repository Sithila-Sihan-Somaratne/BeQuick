import { Component } from '@angular/core';
import { SignUpANDlogInComponent } from '../sign-up-and-log-in/sign-up-and-log-in.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SignUpANDlogInComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {}