import { Routes } from '@angular/router';

import { HomePageComponent } from './home/home.page';

export const routes: Routes = [
    {
        path: 'home',
        component: HomePageComponent,
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
