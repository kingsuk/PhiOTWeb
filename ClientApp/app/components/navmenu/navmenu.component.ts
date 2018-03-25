import { Component } from '@angular/core';

import { CookieService } from 'angular2-cookie/core';

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent {

    email : any = 'asdf';
    constructor(private _cookieService:CookieService) {
        
    }
    ngOnInit() {
        
        this.email = this._cookieService.get('email');
    }
    
}
