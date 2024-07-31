import { Component } from '@angular/core';
import { SignUpANDlogInComponent } from '../sign-up-and-log-in/sign-up-and-log-in.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [SignUpANDlogInComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {}
