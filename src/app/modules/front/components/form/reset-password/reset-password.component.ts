import { Component, OnInit } from '@angular/core';
import { FormBuilder, AbstractControl, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "../../../../../services/users.service";
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [UsersService]
})
export class ResetPasswordComponent implements OnInit {

  resetpasswordForm: FormGroup;
  public token: string;
  public verifytoken: boolean;
  public id: string;

  constructor(protected router: Router, private usersService: UsersService, protected fb: FormBuilder, private snackBar: MatSnackBar) {
    this.resetpasswordForm = this.fb.group({
      newpassword: ["", [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
      confpassword: ["", Validators.required],
    }, {validator: this.checkPasswords });
    this.token = window.location.search.split('=')[1];
    this.usersService.verifytoken(this.token).subscribe((response) => {
      if (response) {
        this.id = response[0].id
        this.verifytoken = true;
      }
    }, (err) => {
        this.router.navigate(['/browse']);
        this.snackBar.open('lien invalide !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
    })

   }

  ngOnInit() {

  }

  resetpassword() {
    if (this.verifytoken == true) {
      const value = this.resetpasswordForm.value;
      value.id = this.id;
      this.usersService.resetPassword(value).subscribe((response) => {
        if (response) {
          this.router.navigate(['/']);
          this.snackBar.open('your password has been changed !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
        }
      }, (err) => {
      })
    }
  }

  checkPasswords(control: AbstractControl) {
    const password: string = control.get('newpassword').value; // get password from our password form control
    const confirmPassword: string = control.get('confpassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confpassword').setErrors({ NoPassswordMatch: true });
    }
  }

  getErrors(formControlName): Observable<string> {

    let message: string = '';
    const control = this.resetpasswordForm.get(formControlName);

    if (!formControlName || !control.errors) return;

    if (formControlName == 'newpassword') {
      if (control.errors.required) message = 'Password required';
      else if (control.errors.pattern) message = 'password invalid';
    }

    else if (formControlName == 'confpassword') {
      if (control.errors.required) message = 'confirm your password';
      if (control.errors.NoPassswordMatch) message = 'passwords are not the same';
    }

    return of(message);
  }

}
