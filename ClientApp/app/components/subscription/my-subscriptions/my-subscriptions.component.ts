import { Component, OnInit,TemplateRef  } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';

//import { BsModalService } from 'ngx-bootstrap/modal';
//import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.css']
})
export class MySubscriptionsComponent implements OnInit {

  token = localStorage.getItem('token');
  private headers = new Headers({'Authorization': 'Bearer '+this.token});
  
  //modalRef: BsModalRef;

  constructor(public http: Http,private router: Router,
    //private modalService: BsModalService
  ) { }

  ngOnInit() {
  }
  
  openModal(template: TemplateRef<any>) {
    //this.modalRef = this.modalService.show(template);
  }

}
