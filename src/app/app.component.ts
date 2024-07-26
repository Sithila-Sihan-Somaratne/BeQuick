import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/components/header/header.component';
import { FooterComponent } from './pages/components/footer/footer.component';
import { AboutUsComponent } from './pages/components/about-us/about-us.component';
import { ContactsComponent } from './pages/components/contacts/contacts.component';
import { ReviewsComponent } from './pages/components/reviews/reviews.component';
import { LearnMoreComponent } from './pages/components/learn-more/learn-more.component';
import { StarRatingComponent } from './pages/components/reviews/star-rating/star-rating.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, FooterComponent, AboutUsComponent, ContactsComponent, ReviewsComponent, LearnMoreComponent, StarRatingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BeQuick';
}
