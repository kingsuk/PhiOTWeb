import { Component, OnInit } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-device',
  templateUrl: './new-device.component.html',
  styleUrls: ['./new-device.component.css']
})
export class NewDeviceComponent implements OnInit {
  
  
  subs: any;
  DeviceName : string = "";
  SubscriptionId : number = 0;
  
  currentDeviceType : number = 0;

  token = localStorage.getItem('token');
  private headers = new Headers({'Authorization': 'Bearer '+this.token});

  constructor(public http: Http,private router: Router) {
  
  }

  ngOnInit() {
    //this.subs = new Subscriptions();
    
    //this.subs.name = "hello";
    //console.log(this.subs);
    this.http.get('api/subscription/GetSubscriptionById',{ headers: this.headers }).subscribe((result) => this.success(result) , (error) => this.error(error));
  }
  
  addDeviceTypes(currentDeviceType: number)
  {
    this.currentDeviceType = currentDeviceType;
    //alert(this.currentDeviceType);
    
  }
  
  createNewDevice()
  {
    if(this.DeviceName.trim()=="" || this.SubscriptionId==0){
      this.showAcknowledgement("All fields are required.");
      return;
    }
    if(this.DeviceName.trim().length<3){
      this.showAcknowledgement("Name should be atleast 3 characters long.");
      return;
    }
      
    let body = `DeviceName=${this.DeviceName}&device_type_id=${this.currentDeviceType}&subscription_id=${this.SubscriptionId}`;
    this.http.get('api/Device/AddNewDevice?'+body,{ headers: this.headers }).subscribe((result) => this.createDeviceSuccess(result) , (error) => this.error(error));
    
  }
  
  success(result: any){
        var jsonObject : any = JSON.parse(result._body);
        console.log(jsonObject);
        this.subs = jsonObject;
        
        
    }
  
  createDeviceSuccess(result: any){
    console.log(result);
        var jsonObject : any = JSON.parse(result._body);
        console.log(jsonObject);
        this.showAcknowledgementSuccess(jsonObject.statusMessage);
    
        let closeElement: HTMLElement = document.getElementById("closeButton") as HTMLElement;
        //copyText.select();
        closeElement.click();
        
        
        if(this.currentDeviceType==1)
        {
            this.router.navigate(['/device/nodemcu/'+jsonObject.statusCode]);
        }
        else if(this.currentDeviceType == 2)
        {
            this.router.navigate(['/device/esp01/'+jsonObject.statusCode]);
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

