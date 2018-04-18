import { Component, Inject } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'auth',
    templateUrl: './auth.component.html',
    styleUrls:['./auth.component.css']
})
export class AuthComponent {

    email: string = "";
    password: string = "";
    
    statusMessage:string="";

    private headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});



    constructor(public http: Http,private router: Router) {
        
    }

    ngOnInit() {
        localStorage.clear();
    }

    login() {
        let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
        if(!EMAIL_REGEXP.test(this.email))
        {
            this.showAcknowledgement("Email is not valid");
        }
        else
        {
            if(this.password.trim().length<6)
            {
                this.showAcknowledgement("Password has to be more than 6 character long.");
                
            }
            else
            {
                let body = `email=${this.email}&password=${this.password}`;

                this.http.get('api/auth/AuthAttempt?'+body,
                { headers: this.headers }).subscribe((result) => this.success(result) , (error) => this.error(error));
            }
        }
    }

    success(result: any){
        var jsonObject : any = JSON.parse(result._body);
        console.log(jsonObject);

        
        localStorage.setItem('user_email', jsonObject.email);
        localStorage.setItem('token', jsonObject.token);
        
        this.showAcknowledgement("Login Successful...");
        this.router.navigate(['/dashboard']);
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

    showAcknowledgement(statusMessage:any){
        this.statusMessage = statusMessage;
        
        let x: HTMLElement = document.getElementById("snackbar") as HTMLElement;
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
    
    
}
