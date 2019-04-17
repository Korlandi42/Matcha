import { Injectable , Component} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './services/authentication.service';
import { UsersService } from './services/users.service';
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root',
})
export class ProfileGuard implements  CanActivate {
  
  id:string;
  profile: boolean;

  constructor(private router: Router, private  authenticationService:  AuthenticationService, private usersService: UsersService,) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.id = localStorage.getItem('id_token');
    this.id = helper.decodeToken(this.id).id;
    this.usersService.getUser(this.id).subscribe((res) => {
      if (res[0].profile == 1) {
        this.profile = true;
      }
    })
    if (this.profile) {
      return true;
    }
    

      // not logged in so redirect to login page with the return url
    this.router.navigate(['/profile/create'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
