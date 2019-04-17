import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../../../../../services/authentication.service";
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GeolocationService } from '../../../../../services/geolocation.service';
import { Auth } from '../../../../../models/auth';

@Component({
  selector: 'app-front-form-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthenticationService, GeolocationService],
})

export class LoginComponent implements OnInit {

  public problem: string;
  loginForm: FormGroup;
  private  users:  Array<object> = [];
  public errorHttpResponse: boolean = false;
  public alert: string;

  constructor(
    protected router: Router,
    protected fb: FormBuilder,
    private snackBar: MatSnackBar,
    private  authenticationService:  AuthenticationService,
    private geolocationService: GeolocationService
  ) {
      this.loginForm = this.fb.group({
        username: ["", Validators.required],
        password: ["", Validators.required],
      });
    }

    ngOnInit() {

      let id_user = localStorage.getItem('id_token');
      if (id_user) {
        this.router.navigate(['/browse'])
      }
      // this.alert = window.location.search.split('=')[1];
      // console.log(this.alert)
      // if (this.alert == "true")
      //   this.snackBar.open('your account has been confirmed !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
    }

    public login = async ()  => {
      this.errorHttpResponse = false;
      let value = this.loginForm.value;
      await this.getGeolocation(value)
    };

    public sendAuth(id) {
      let auth = new Auth()
      auth.id = id
      this.authenticationService.authenticateSocket(auth)
    }


    public getGeolocation(value) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          let crd = pos.coords;

          // console.log('Your current position is:');
          // console.log(`Latitude : ${crd.latitude}`);
          // console.log(`Longitude: ${crd.longitude}`);
          // console.log(`More or less ${crd.accuracy} meters.`);
          if (crd) {
            this.authenticationService.authenticate(value, crd.latitude, crd.longitude).subscribe((res) => {
              if (res.auth == true) {
                this.sendAuth(res.id)
                if (res.profile == 1)
                  this.router.navigate(['/browse']);
                else
                  this.router.navigate(['/profile/create']);
              }
            }, (err) => {
              this.errorHttpResponse = true;
              this.problem = err.error.error
            });
          }
        }, (err) => {
            if (err.code == 1) {
              this.authenticationService.authenticate(value, 0, 0).subscribe((res) => {
                if (res.auth == true) {
                  this.sendAuth(res.id)
                  if (res.profile == 1)
                    this.router.navigate(['/browse']);
                  else
                    this.router.navigate(['/profile/create']);
                }
              }, (err) => {
                this.errorHttpResponse = true;
                this.problem = err.error.error
              });
            }
        })
      }
    }

    getErrors(formControlName): Observable<string> {

      let message: string = '';
      const control = this.loginForm.get(formControlName);

      if (!formControlName || !control.errors) return;

      if (formControlName == 'username') {
        if (control.errors.required) message = 'username required';
      }

      else if (formControlName == 'password') {
        if (control.errors.required) message = 'Password required';
      }

      return of(message);
    }
}
