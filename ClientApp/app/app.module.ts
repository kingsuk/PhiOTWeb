import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';


import { AppComponent } from './components/app/app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { CounterComponent } from './components/counter/counter.component';
import { AuthComponent } from './components/auth/auth.component';
import { RegisterComponent } from './components/register/register.component';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewDeviceComponent } from './components/dashboard/new-device/new-device.component';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        CounterComponent,
        FetchDataComponent,
        HomeComponent,
        AuthComponent,
        RegisterComponent,
        DashboardComponent,
        NewDeviceComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'auth', pathMatch: 'full' },
            { path: 'register', component: RegisterComponent },
            { path: 'home', component: HomeComponent },
            { path: 'auth', component: AuthComponent },
            { path: 'counter', component: CounterComponent },
            { path: 'fetch-data', component: FetchDataComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'dashboard/new-device', component: NewDeviceComponent }
        ])
    ],
    providers: [
        CookieService
      ]
})
export class AppModuleShared {
}
