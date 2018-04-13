import { Component, OnInit, Inject } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nodemcu',
  templateUrl: './nodemcu.component.html',
  styleUrls: ['./nodemcu.component.css']
})
export class NodemcuComponent implements OnInit {

    

    token = localStorage.getItem('token');
    private headers = new Headers({'Authorization': 'Bearer '+this.token});

    id = this.route.snapshot.paramMap.get('id');
  
    currentVal: any;
    isCopied: boolean = false;
    datasetName: string = "";

    device = {
        id: 0,
        deviceName: '',
        device_token:''
    }

    constructor(private http: Http, private router: Router,private route: ActivatedRoute,) {
           
    }

    ngOnInit() {
        
        console.log(this.id);
        let body = `deviceId=${this.id}`;
        this.http.get('api/device/GetDeviceInfoByDeviceId?'+body,{ headers: this.headers }).subscribe((result) => this.success(result) , (error) => this.error(error));

    }

    success(result : any) : any {
        var jsonResult : any = JSON.parse(result._body);
        this.device = jsonResult;
        console.log(jsonResult);
      }

    
    toggleChild(name: string)
    {
        this.currentVal = this.totalConfig.find(x=> x.name === name);
    
        if(this.currentVal.value)
        {
            this.currentVal.value = this.currentVal.value-1;
        
        }
        else
        {
            this.currentVal.value++;
        }
    
        console.log(JSON.stringify(this.totalConfig));
        console.log(JSON.stringify(this.jsonData));
    }

    publish()
    {
        let body = `token=${this.device.device_token}&message=${JSON.stringify(this.jsonData)}`;
        this.http.get('api/publish/sendToDevice?'+body,{headers: this.headers} ).subscribe(result => {
            console.log(result);
        }, error => console.error(error));
    }
    station()
    {
        let body = `token=${this.device.device_token}&message=${JSON.stringify(this.stationConfig)}`;
        this.http.get('api/publish/sendToDevice?'+body,{headers: this.headers} ).subscribe(result => {
            console.log(result);
        }, error => console.error(error));
    }
  
    createDataset()
    {
      alert(this.device.id);
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

    test = "";

    stationConfig = [{
        header: "station"
    }];

    totalConfig = [{
        name: "D0",
        pin: 16,
        value: 0
    }, {
        name: "D1",
        pin: 5,
        value: 1
    }, {
        name: "D2",
        pin: 4,
        value: 0
    }, {
        name: "D3",
        pin: 0,
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
        value: 2
    }, {
        name: "D5",
        pin: 14,
        value: 1
    }, {
        name: "D6",
        pin: 12,
        value: 0
    }, {
        name: "D7",
        pin: 13,
        value: 1
    }, {
        name: "D8",
        pin: 15,
        value: 0
    }, {
        name: "D9",
        pin: 3,
        value: 1
    }, {
        name: "D10",
        pin: 1,
        value: 1
    }, {
        name: "GND",
        value: 2
    }, {
        name: "3V3",
        value: 2
    }];

    jsonData = [{
        header: "data",
        data: this.totalConfig
    }
    ];

}
