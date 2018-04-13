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
    alert(device_type_id);
  }

  error(error: any) {
    console.log(error);
    if (error.status == 403) {

      var jsonObject = JSON.parse(error._body);
      alert(jsonObject.statusMessage);
    } else if (error.status == 400) {
      var jsonObject = JSON.parse(error._body);


      for (var key in jsonObject) {

        alert(jsonObject[key]);
      }
    }
  }





}