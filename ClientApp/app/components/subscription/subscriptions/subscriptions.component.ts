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
  


  token = localStorage.getItem('token');
  private headers = new Headers({'Authorization': 'Bearer '+this.token});

  subscriptionName:string = "";
  subscriptionType : number = 0;

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
     this.http.get('api/Subscription/GetAllSubscriptionTypes').subscribe((result) => this.success(result) , (error) => this.error(error));
  }
  
  success(result : any) : any {
    var jsonResult : any = JSON.parse(result._body);
    this.subsriptions = jsonResult;
    console.log(jsonResult);
  }
  
  buyButton(subscriptionTypeId:number)
  {
    this.subscriptionType = subscriptionTypeId;
    //alert(subscriptionTypeId);
  }

  createNewSubscription()
  {
    //alert(this.subscriptionName);
    let body = `subscriptionType=${this.subscriptionType}&subscriptionName=${this.subscriptionName}`;
    this.http.get('api/Subscription/AddNewSubscription?'+body,{ headers: this.headers }).subscribe((result) => this.subscriptionCreateSuccess(result) , (error) => this.error(error));

  }

  subscriptionCreateSuccess(result : any) : any {
    var jsonResult : any = JSON.parse(result._body);
    
    alert(jsonResult.statusMessage);
    this.router.navigate(['/dashboard']);
  }

  error(error: any)
  {
      console.log(error);
      if(error.status==403)
      {
          
          var jsonObject = JSON.parse(error._body);
          alert(jsonObject.statusMessage);
      }
      else if(error.status == 400)
      {
          var jsonObject = JSON.parse(error._body);
          
          
          for (var key in jsonObject) {
              
              alert(jsonObject[key]);
          }
      }
  }

}
