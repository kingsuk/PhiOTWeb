import { Component, OnInit } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  
  subsriptions = [{
    id: 0,
    subscriptionTypeName : '',
    validity : 0,
    price : 0,
    apiCallsPerDay: 0,
    numberOfDevices : 0
  }];

  constructor(public http: Http,private router: Router) { }

  ngOnInit() {
     this.http.get('api/Subscription/GetAllSubscriptionTypes').subscribe((result) => this.success(result) , (error) => console.log(error));
  }
  
  success(result : any) : any {
    var jsonResult : any = JSON.parse(result._body);
    this.subsriptions = jsonResult;
    console.log(jsonResult);
  }
  
  buyButton(subscriptionTypeId:number)
  {
    alert(subscriptionTypeId);
  }

}
