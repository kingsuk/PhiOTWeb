import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { Http, Headers } from '@angular/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  token = localStorage.getItem('token');
  private headers = new Headers({'Authorization': 'Bearer '+this.token});

  email: string = "";
  password: string = "";
  confirmPassword: string = "";

  constructor(private http: Http, private router: Router ) {

   }

  ngOnInit() {
    
    
  }

  register()
  {
    
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if(!EMAIL_REGEXP.test(this.email))
    {
        this.showAcknowledgement("Email is not valid");
        return;
    }
    if(this.password.trim().length<6 || this.confirmPassword.trim().length<6)
    {
        this.showAcknowledgement("Password has to be more than 6 character long.");
        return;
    }
    if(this.password !== this.confirmPassword)
    {
      this.showAcknowledgement("Passwords do not match.");
      return;
    }
    
    let body = `email=${this.email}&password=${this.password}`;
    this.http.get('api/auth/Register?'+body, { headers: this.headers
    }).subscribe((result:any) => {
      var jsonResult : any = JSON.parse(result._body);
      this.showAcknowledgementSuccess(jsonResult.statusMessage);

      let body = `email=${this.email}&password=${this.password}`;
      this.http.get('api/auth/AuthAttempt?'+body,
      { headers: this.headers }).subscribe((result) => this.success(result) , (error) => this.error(error));
    
    }, (error) => this.error(error));
  }

  success(result: any){
    var jsonObject : any = JSON.parse(result._body);
    console.log(jsonObject);

    
    localStorage.setItem('user_email', jsonObject.email);
    localStorage.setItem('token', jsonObject.token);
    
    this.showAcknowledgement("Login Successful...");
    this.router.navigate(['/dashboard']);
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
    else
    {
      var jsonObject = JSON.parse(error._body);
      this.showAcknowledgement(jsonObject.statusMessage);
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
