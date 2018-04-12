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
  
  token :string = localStorage.getItem('token');
  subs: any;
  DeviceName : string = "name";
  SubscriptionId : number = 0;
  
  currentDeviceType : number = 0;
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
        alert(jsonObject.statusMessage);
        
        
        
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

