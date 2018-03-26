import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  
  
  constructor() { }

  ngOnInit() {
  }
  
  devices = [{
        name: "D0",
        pin: 1,
        value: 0
    }, {
        name: "D1",
        pin: 2,
        value: 1
    }, {
        name: "D2",
        pin: 1,
        value: 0
    }, {
        name: "D3",
        pin: 2,
        value: 1
    }, {
        name: "D4",
        pin: 2,
        value: 0
    }, {
        name: "3V3",
        value: 2
    }, {
        name: "GND",
      pin: 2,
        value: 2
    }, {
        name: "D5",
        pin: 2,
        value: 1
    }, {
        name: "D6",
        pin: 2,
        value: 0
    }, {
        name: "D7",
        pin: 1,
        value: 1
    }, {
        name: "D8",
        pin: 1,
        value: 0
    }, {
        name: "D9",
        pin: 2,
        value: 1
    }, {
        name: "D10",
        pin: 1,
        value: 1
    }, {
        name: "GND",
      pin: 2,
        value: 2
    }, {
        name: "3V3",
      pin: 2,
        value: 2
    }];

    jsonData = [{
        header: "data",
        data: this.totalConfig
    }
    ];

}
