import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../services/authentication.service";

@Component({
  selector: 'app-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.scss'],
  providers: [AuthenticationService]
})
export class FrontComponent implements OnInit {

  constructor(
    private  authenticationService:  AuthenticationService,
  ) { }

  ngOnInit() {
  }

  public  isLoggedIn(){
      return this.authenticationService.isLoggedIn();
  }

}
