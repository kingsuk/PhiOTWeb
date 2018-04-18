import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  token = localStorage.getItem('token');

  devices = [{
    deviceName: "",
    id: 0,
    device_type_id: 0
  }];

  private headers = new Headers({
    'Authorization': 'Bearer ' + this.token
  });



  constructor(private http: Http, private router: Router) {}

  ngOnInit() {
    this.getAllDevicesByUserId();

  }

  getAllDevicesByUserId()
  {
    this.http.get('api/device/GetAllDevicesByUser', {
      headers: this.headers
    }).subscribe((result) => this.success(result), (error) => this.error(error));
  }

  success(result: any) {
    var jsonObject: any = JSON.parse(result._body);
    console.log(jsonObject);
    this.devices = jsonObject;


  }

  edit(id: number,device_type_id: number) {
    if(device_type_id==1){
      this.router.navigate(['/device/nodemcu/'+id]);
    }
    else if(device_type_id==2){
      this.router.navigate(['/device/esp01/'+id]);
    }
    
  }

  delete(id: number, device_type_id: number) {
    //alert(device_type_id);

    let body = `id=${id}`;

    this.http.get(`api/device/DeleteDeviceByDeviceAndUserId?${body}`, { headers: this.headers }).subscribe((result:any) => 
    {
      var jsonResult : any = JSON.parse(result._body);
      this.showAcknowledgementSuccess(jsonResult.statusMessage);
      this.getAllDevicesByUserId();
    }, (error) => this.error(error));
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