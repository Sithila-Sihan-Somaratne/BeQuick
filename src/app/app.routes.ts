import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/components/home-page/home-page.component';
import { PropertiesComponent } from './pages/components/properties/properties.component';

export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    }, {
        path: 'properties',
        component: PropertiesComponent
    }
];
