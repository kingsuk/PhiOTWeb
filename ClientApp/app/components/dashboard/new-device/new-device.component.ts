import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-device',
  templateUrl: './new-device.component.html',
  styleUrls: ['./new-device.component.css']
})
export class NewDeviceComponent implements OnInit {
  
  currentDeviceType : number;

  constructor() { }

  ngOnInit() {
  }
  
  addDeviceTypes(currentDeviceType: number)
  {
    this.currentDeviceType = currentDeviceType;
    //alert(this.currentDeviceType);
  }
  
  createNewDevice()
  {
    alert(this.currentDeviceType);
  }

}
