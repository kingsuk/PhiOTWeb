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
    if(this.subscriptionName.trim()=="")
    {
      this.showAcknowledgement("Subscription name is required");
      return;
    }
    if(this.subscriptionName.trim().length<3)
    {
      this.showAcknowledgement("Subscription name too short.");
      return;
    }
    let body = `subscriptionType=${this.subscriptionType}&subscriptionName=${this.subscriptionName}`;
    this.http.get('api/Subscription/AddNewSubscription?'+body,{ headers: this.headers }).subscribe((result) => this.subscriptionCreateSuccess(result) , (error) => this.error(error));

  }

  subscriptionCreateSuccess(result : any) : any {
    var jsonResult : any = JSON.parse(result._body);
    
    this.showAcknowledgementSuccess(jsonResult.statusMessage);
    
    let element: HTMLElement = document.getElementById('close') as HTMLElement;
    element.click();
    this.router.navigate(['/dashboard']);

  }

  error(error: any)
  {
      console.log(error);
      if(error.status==403)
      {
          
          var jsonObject = JSON.parse(error._body);
          this.showAcknowledgement(jsonObject.statusMessage);
      }
      else if(error.status == 400)
      {
          var jsonObject = JSON.parse(error._body);
          
          
          for (var key in jsonObject) {
              
            this.showAcknowledgement(jsonObject[key]);
          }
      }
  }

  statusMessage:string = "";
  statusMessageSuccess:string = "";
  
  showAcknowledgement(statusMessage:any){
        console.log(statusMessage);
        this.statusMessage = statusMessage;
        
        let x: HTMLElement = document.getElementById("snackbar") as HTMLElement;
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

    showAcknowledgementSuccess(statusMessage:any){
        console.log(statusMessage);
        this.statusMessageSuccess = statusMessage;
        
        let x: HTMLElement = document.getElementById("snackbarSuccess") as HTMLElement;
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

}
