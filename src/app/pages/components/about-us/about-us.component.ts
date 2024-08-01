import { Component } from '@angular/core';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { LogInComponent } from '../log-in/log-in.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [SignUpComponent, LogInComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {}
