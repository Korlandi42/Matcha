import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

@Injectable()


export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (localStorage.getItem('username')) { // à changer, décode token et vérifier timestamp
            let id_user = localStorage.getItem('id_token');
            id_user = helper.decodeToken(id_user).id;
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
