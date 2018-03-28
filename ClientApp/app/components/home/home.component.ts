import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls:['./home.component.css']
})
export class HomeComponent {
    
    

    @Inject('BASE_URL') baseUrl: string;
    currentVal: any;
    topic: string = "1002";

    constructor(public http: Http, private router: Router) {
           
    }

    ngOnInit() {
//         if(!localStorage.getItem('token'))
//         {
//             this.router.navigate(['/auth']);
//         }
        
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

        this.http.get('api/publish?topic='+this.topic+'&message='+ JSON.stringify(this.jsonData)).subscribe(result => {
            console.log(result);
        }, error => console.error(error));
    }
    station()
    {
        this.http.get('api/publish?topic=' + this.topic + '&message=' + JSON.stringify(this.stationConfig)).subscribe(result => {
            console.log(result);
        }, error => console.error(error));
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
