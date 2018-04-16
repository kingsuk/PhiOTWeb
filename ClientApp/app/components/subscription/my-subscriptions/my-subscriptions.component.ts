import { Component, OnInit } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.css']
})
export class MySubscriptionsComponent implements OnInit {

  token = localStorage.getItem('token');
  private headers = new Headers({'Authorization': 'Bearer '+this.token});

  constructor(public http: Http,private router: Router) { }

  ngOnInit() {
  }

}
