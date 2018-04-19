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
    statusMessage:string = "";
    statusMessageSuccess:string = "";

    id = this.route.snapshot.paramMap.get('id');
  
    currentVal: any;
    isCopied: boolean = false;
    datasetName: string = "";
    defaultConfig: any;
    enableEdit = false;
    editId : number = 0;
    editableJsonData: any;

    dataSet = [
        {
            ds_id : 0,
            ds_name : "",
            jsonData : "",
            reverseJsonData : "",
        }
    ];

    device = {
        id: 0,
        deviceName: '',
        device_token:''
    };

    constructor(private http: Http, private router: Router,private route: ActivatedRoute,) {
           this.defaultConfig = this.currentConfig.map(x => Object.assign({}, x));
    }

    ngOnInit() {
        //console.log(this.compareDifferencr(this.totalConfig,this.totalConfig1));
       // console.log(this.id);
        let body = `deviceId=${this.id}`;
        this.http.get('api/device/GetDeviceInfoByDeviceId?'+body,{ headers: this.headers }).subscribe((result) => this.success(result) , (error) => this.error(error));
        this.getAllDatasets();
    }

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

    success(result : any) : any {
        var jsonResult : any = JSON.parse(result._body);
        this.device = jsonResult;
        console.log(jsonResult);
      }

    userDataSuccess(result : any) : any {
        var jsonResult : any = JSON.parse(result._body);
        this.dataSet = jsonResult;
        console.log(jsonResult);
    }

    getAllDatasets(){
        let body = `ds_deviceId=${this.id}`;
        this.http.get('api/Dataset/GetAllDatasetByUserIdAndDeviceId?'+body,{ headers: this.headers }).subscribe((result) => this.userDataSuccess(result) , (error) => this.error(error));

    }

    
    toggleChild(name: string)
    {
        this.currentVal = this.currentConfig.find(x=> x.name === name);
    
        if(this.currentVal.value)
        {
            this.currentVal.value = this.currentVal.value-1;
        
        }
        else
        {
            this.currentVal.value++;
        }
    
        console.log(JSON.stringify(this.currentConfig));
        
        
    }

    copyToClipBoard($event:any){
        let copyText: HTMLElement = document.getElementById("devie_token") as HTMLElement;
        //copyText.select();
        $event.target.select();
        document.execCommand("Copy");
    }

    publish(dataset:any)
    {
        //alert(dataset);
        
        let message = this.compareDifferencr(dataset,this.defaultConfig);
        console.log(message);
        if(message.length==0)
        {
            this.showAcknowledgement("Nothing has changed.");
            return;
        }
        let jsonData = [{
                header: "data",
                data: message
            }
        ];
        
        this.publishToMqtt(jsonData);
    }
  
    DirectPublish(dataset:any)
    {
        //alert(dataset);
        
//         let message = this.compareDifferencr(dataset,this.defaultConfig);
//         console.log(message);
//         if(message.length==0)
//         {
//             this.showAcknowledgement("Nothing has changed.");
//             return;
//         }
        let jsonData = [{
                header: "data",
                data: dataset
            }
        ];
        
        this.publishToMqtt(jsonData);
    }

    publishToMqtt(jsonData:any)
    {
        let body = `token=${this.device.device_token}&message=${JSON.stringify(jsonData)}`;
        this.http.get('api/publish/sendToDevice?'+body,{headers: this.headers} ).subscribe((result:any) => {
            var jsonResult : any = JSON.parse(result._body);
            this.showAcknowledgementSuccess(jsonResult.statusMessage);
        }, (error) => this.error(error));
    }
    station()
    {
        let stationConfig = [{
            header: "station"
        }];
        let body = `token=${this.device.device_token}&message=${JSON.stringify(stationConfig)}`;
        this.http.get('api/publish/sendToDevice?'+body,{headers: this.headers} ).subscribe((result:any) => {
            var jsonResult : any = JSON.parse(result._body);
            this.showAcknowledgementSuccess(jsonResult.statusMessage);
        }, (error) => this.error(error));
    }
  
    createDataset()
    {
      //alert(this.device.id);
        let message = this.compareDifferencr(this.currentConfig,this.defaultConfig);
        console.log("message",message);
        if(message.length==0)
        {
            this.showAcknowledgement("Nothing has changed.");
            return;
        }
        
        let reverseMessage = this.reverseJsonData(message);
        let jsonData = [{
                header: "data",
                data: message
            }
        ];
        let reverseJsonData = [{
                header: "data",
                data: reverseMessage
            }
        ];
        
        let body = `ds_name=${this.datasetName}&ds_deviceId=${this.device.id}&jsonData=${JSON.stringify(jsonData)}&reverseJsonData=${JSON.stringify(reverseJsonData)}`;
        this.http.get('api/dataset/CreateNewDataset?'+body,{headers: this.headers} ).subscribe((result:any) => {
            var jsonResult : any = JSON.parse(result._body);
            this.showAcknowledgementSuccess(jsonResult.statusMessage);
            this.getAllDatasets();
        }, (error) => this.error(error));
    }

    editDataset(id:number,jsonData:any)
    {
        
        this.editId = id;
        this.enableEdit = true;
        jsonData = JSON.parse(jsonData);
        jsonData = jsonData[0].data;
        this.editableJsonData = jsonData;
        console.log(jsonData);
        this.setToAllOff(this.currentConfig);
        for(var i in jsonData)
        {
            this.currentVal = this.currentConfig.find(x=> x.name === jsonData[i].name);
            this.currentVal.value = jsonData[i].value;
            console.log(this.currentVal);
        }
        
    }

    saveEditedDataset(){
        //alert(this.editId);
        let message = this.compareDifferencr(this.currentConfig,this.defaultConfig);
        console.log("message",message);
        console.log("editableJsonData",this.editableJsonData);
        //debugger;
        if(JSON.stringify(this.editableJsonData)==JSON.stringify(message))
        {
            this.showAcknowledgement("Nothing has changed.");
            return;
        }
        let reverseMessage = this.reverseJsonData(message);
        let jsonData = [{
                header: "data",
                data: message
            }
        ];
        let reverseJsonData = [{
                header: "data",
                data: reverseMessage
            }
        ];
        
        let body = `ds_id=${this.editId}&jsonData=${JSON.stringify(jsonData)}&reverseJsonData=${JSON.stringify(reverseJsonData)}`;
        this.http.get('api/dataset/EditDatasetByDsIdAndUserId?'+body,{headers: this.headers} ).subscribe((result:any) => {
            var jsonResult : any = JSON.parse(result._body);
            this.showAcknowledgementSuccess(jsonResult.statusMessage);
            this.getAllDatasets();
        }, (error) => this.error(error));
    }

    cancelEdit(){
        this.enableEdit = false;
        this.setToAllOff(this.currentConfig);
    }

    deleteDataset(id:number)
    {
        let body = `ds_id=${id}`;
        this.http.get('api/dataset/DeleteDatasetByDsIdAndUserId?'+body,{headers: this.headers} ).subscribe((result:any) => {
            var jsonResult : any = JSON.parse(result._body);
            this.showAcknowledgementSuccess(jsonResult.statusMessage);
            this.getAllDatasets();
        }, (error) => this.error(error));
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

    
    compareDifferencr(obj1:any, obj2:any){
        var ret:any = [];
        for(var i in obj2) {
            if(obj1[i].value!=obj2[i].value)
            {
                ret.push(obj1[i]);
                
            }
        }
        return ret;    
    }

    reverseJsonData(obj:any)
    {
        var retArr:any = [];
        for(var i in obj)
        {
            var returnObj:any = {};
            returnObj.name = obj[i].name;
            returnObj.pin = obj[i].pin;
            if(obj[i].value == 1)
            {
                returnObj.value = 0;
            }
            else if(obj[i].value == 0)
            {
                returnObj.value = 1;
            }
            retArr.push(returnObj);
        }

        return retArr;
    }

    test = "";

    setToAllOff(obj:any){
        for(var i in obj)
        {
            if(obj[i].value == 1)
            {
                obj[i].value = 0;
            }
            
        }
        return obj;
    }

    

    currentConfig = [{
        name: "D0",
        pin: 16,
        value: 0
    }, {
        name: "D1",
        pin: 5,
        value: 0
    }, {
        name: "D2",
        pin: 4,
        value: 0
    }, {
        name: "D3",
        pin: 0,
        value: 0
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
        value: 0
    }, {
        name: "D6",
        pin: 12,
        value: 0
    }, {
        name: "D7",
        pin: 13,
        value: 0
    }, {
        name: "D8",
        pin: 15,
        value: 0
    }, {
        name: "D9",
        pin: 3,
        value: 0
    }, {
        name: "D10",
        pin: 1,
        value: 0
    }, {
        name: "GND",
        value: 2
    }, {
        name: "3V3",
        value: 2
    }];
}
