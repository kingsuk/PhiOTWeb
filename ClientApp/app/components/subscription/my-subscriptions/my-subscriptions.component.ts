import { Component, OnInit,TemplateRef  } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';

//import { BsModalService } from 'ngx-bootstrap/modal';
//import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.css']
})
export class MySubscriptionsComponent implements OnInit {

  token = localStorage.getItem('token');
  private headers = new Headers({'Authorization': 'Bearer '+this.token});
  
  subscriptions:any = [{
    id:0,
    subscriptionName : '',
    subscriptionType : 0,
    createdDate:'',
    modifiedDate:''
  }];

  constructor(public http: Http,private router: Router,
   
  ) { }

  ngOnInit() {
    
    this.getAllSubscriptions();
  }

  getAllSubscriptions(){
    this.http.get('api/Subscription/GetSubscriptionById',{headers:this.headers}).subscribe((result:any) => {
      var jsonObject = JSON.parse(result._body);
      this.subscriptions = jsonObject;
      console.log(jsonObject);
    } , (error) => this.error(error));
  }

  deleteSubscription(id:number){
    
    let body = `id=${id}`;
    this.http.get('api/Subscription/DeleteSubscriptionByUserIdAndDeviceId?'+body,{headers:this.headers}).subscribe((result:any) => {
      var jsonObject = JSON.parse(result._body);
      this.showAcknowledgementSuccess(jsonObject.statusMessage);
      console.log(jsonObject);
      this.getAllSubscriptions();
    } , (error) => this.error(error));
  }
  

  error(error: any) {
    console.log(error);
    if (error.status == 403) {

      var jsonObject = JSON.parse(error._body);
      this.showAcknowledgement(jsonObject.statusMessage);
    } else if (error.status == 400) {
      var jsonObject = JSON.parse(error._body);


      for (var key in jsonObject) {

        this.showAcknowledgement(jsonObject[key]);
      }
    }
    else
    {
      var jsonObject = JSON.parse(error._body);
      this.showAcknowledgement(jsonObject.statusMessage);
    }
  }

  getSubscriptionName(subscriptionType: number)
    {
        if(subscriptionType==1)
        {
            return "Free";
        }
        else if(subscriptionType==2)
        {
            return "Dev";
        }
        else if(subscriptionType==3)
        {
            return "Pro";
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
