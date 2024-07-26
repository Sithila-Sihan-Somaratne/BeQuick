import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/components/home-page/home-page.component';
import { PropertiesComponent } from './pages/components/properties/properties.component';
import { AboutUsComponent } from './pages/components/about-us/about-us.component';
import { ContactsComponent } from './pages/components/contacts/contacts.component';
import { ReviewsComponent } from './pages/components/reviews/reviews.component';
import { LearnMoreComponent } from './pages/components/learn-more/learn-more.component';

export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    }, {
        path: 'properties',
        component: PropertiesComponent
    }, {
        path: 'about',
        component: AboutUsComponent
    }, {
        path: 'contacts',
        component: ContactsComponent
    }, {
        path: 'reviews',
        component: ReviewsComponent
    }, {
        path: 'learn-more',
        component: LearnMoreComponent
    }
];
