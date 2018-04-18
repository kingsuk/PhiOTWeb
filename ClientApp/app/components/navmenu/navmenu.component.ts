import { Component } from '@angular/core';

import { Router } from '@angular/router';

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent {

    email : any = "";

    constructor(private router: Router) {
        
    }

    ngOnInit() {
        console.log(localStorage.getItem('token'));
        if(!localStorage.getItem('token'))
        {
            this.router.navigate(['/auth']);
            return;
        }
        else
        {
            this.email = localStorage.getItem('user_email');
        }
        
    }
    
}
