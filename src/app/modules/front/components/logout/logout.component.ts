import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../../../services/authentication.service";
import { UsersService } from '../../../../services/users.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  providers: [UsersService]
})
export class LogoutComponent implements OnInit {

  public  id: string;

  constructor(
    protected router: Router,
    private  authenticationService:  AuthenticationService,
    private usersService: UsersService
  ) {
    this.id = localStorage.getItem('id_token');
    this.id = helper.decodeToken(this.id).id;
    this.usersService.lastCon(this.id).subscribe(() => {
    }, (err) => {
    });
    this.authenticationService.logout();
    this.router.navigate(['/']);
   }

  ngOnInit() {

  }

}
