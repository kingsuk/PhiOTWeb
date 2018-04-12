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
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewDeviceComponent } from './components/dashboard/new-device/new-device.component';
import { NodemcuComponent } from './components/nodemcu/nodemcu.component';
import { NodeespComponent } from './components/nodeesp/nodeesp.component';
import { MySubscriptionsComponent } from './components/subscription/my-subscriptions/my-subscriptions.component';
import { SubscriptionsComponent } from './components/subscription/subscriptions/subscriptions.component';
import { CreateNewSubscriptionsComponent } from './components/subscription/create-new-subscriptions/create-new-subscriptions.component';

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
        NewDeviceComponent,
        NodemcuComponent,
        NodeespComponent,
        MySubscriptionsComponent,
        SubscriptionsComponent,
        CreateNewSubscriptionsComponent
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
            { path: 'dashboard/new-device', component: NewDeviceComponent },
            { path: 'device/nodemcu/:id', component: NodemcuComponent },
            { path: 'device/esp01/:id', component: NodeespComponent },
            { path: 'subscriptions', component: SubscriptionsComponent },
            { path: 'subscription/create', component: CreateNewSubscriptionsComponent },
            { path: 'subscription/mysubscriptions', component: MySubscriptionsComponent }
        ])
    ]
})
export class AppModuleShared {
}
