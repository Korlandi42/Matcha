import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "../../../../../services/users.service";
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt'

const helper = new JwtHelperService();

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [UsersService]
})
export class ForgotPasswordComponent implements OnInit {

  forgotpasswordForm: FormGroup;
  public errorHttpResponse: boolean = false;
  public problem: string;

  constructor(protected router: Router, private usersService: UsersService, protected fb: FormBuilder, private snackBar: MatSnackBar) {
    this.forgotpasswordForm = this.fb.group({
      email: ["", [
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ]]
    });
  }

  ngOnInit() {
    let id_user = localStorage.getItem('id_token');
    if (id_user) {
      this.router.navigate(['/browse'])
    }
  }

  public forgotpassword() {
    const value = this.forgotpasswordForm.value;
    this.usersService.sendMailReset(value).subscribe((response) => {
      if (response) {
        this.snackBar.open('a mail has been sent to you to reset your password !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
      }
    }, (err) => {
      this.errorHttpResponse = true;
      this.problem = err.error.error
    })

  }

  getErrors(formControlName): Observable<string> {

    let message: string = '';
    const control = this.forgotpasswordForm.get(formControlName);

    if (!formControlName || !control.errors) return;

    if (formControlName == 'email') {
      if (control.errors.required) message = 'email required';
      else if (control.errors.pattern) message = 'email invalid';
    }

    return of(message);
  }

}
