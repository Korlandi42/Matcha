import { Component, OnInit } from '@angular/core';
import { FormBuilder, AbstractControl, FormGroup, FormControl, Validators} from "@angular/forms";
import { UsersService } from '../../../../../services/users.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-front-form-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [UsersService],
})
export class RegisterComponent implements OnInit {

  public problem: string;
  public success: boolean;
  registerForm: FormGroup;
  public errorHttpResponse: boolean = false;
  private  users:  Array<object> = [];

  constructor(protected fb: FormBuilder, private  usersService:  UsersService, private snackBar: MatSnackBar, protected router: Router,) {
    this.registerForm = this.fb.group({
      username: ["", [
        Validators.required,
        Validators.pattern(/^[0-9a-zA-Z]+$/),
        Validators.minLength(6),
        Validators.maxLength(30)
      ]],
      email: ["", [
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ]],
      password: ["", [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      ]],
      confirmPassword: ["", [Validators.required]],
      name: ["", [Validators.required, Validators.minLength(2),
        Validators.maxLength(15), Validators.pattern(/^[a-zA-Z]+$/)
      ]],
      surname: ["", [Validators.required, Validators.minLength(2),
        Validators.maxLength(15), Validators.pattern(/^[a-zA-Z]+$/)
      ]]
    }, {validator: this.checkPasswords });
  }

  checkPasswords(control: AbstractControl) {
    const password: string = control.get('password').value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword').setErrors({ NoPassswordMatch: true });
    }
  }

  ngOnInit() {
    let id_user = localStorage.getItem('id_token');
      if (id_user) {
        this.router.navigate(['/browse'])
      }
  }

  public register() {
    if (this.registerForm.invalid) return;

    this.errorHttpResponse = false;
    const value = this.registerForm.value;
    this.usersService.addUser(value).subscribe((response) => {
      if (response) {
        this.snackBar.open('Registered successfully, please check your emails to confirm your account !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
        this.router.navigate(['/']);
		console.log(response);
        this.usersService.sendMailConfirmAccount(value, response.insertId).subscribe((response) => {
        }, (err) => {
          this.errorHttpResponse = true;
          this.problem = err.error.error
      });
      }
    }, (err) => {
        this.errorHttpResponse = true;
        this.problem = err.error.error
    });
  }

  getErrors(formControlName): Observable<string> {

    let message: string = '';

    const control = this.registerForm.get(formControlName);


    if (!formControlName || !control.errors) return;

    if (formControlName == 'username') {
      if (control.errors.required) message = 'Username required';
      else if (control.errors.minlength) message = 'Username must be at least 6';
      else if (control.errors.maxlength) message = 'Username must be less than 30';
      else if (control.errors.pattern) message = 'Username must be alphanumeric';
    }

    else if (formControlName == 'email') {
      if (control.errors.required) message = 'Email required';
      else if (control.errors.pattern) message = 'Invalid email';
    }

    else if (formControlName == 'password') {
      if (control.errors.required) message = 'Password required';
      else if (control.errors.pattern) message = 'Invalid password : Minimum 8 chars, at least 1 uppercase letter, 1 lowercase letter and 1 number: ';
    }

    else if (formControlName == 'confirmPassword') {
      if (control.errors.required) message = 'Confirm your password';
      if (control.errors.NoPassswordMatch) message = 'Passwords are not identical';
    }

    else if (formControlName == 'name') {
      if (control.errors.required) message = 'Name required';
      if (control.errors.minlength) message = 'Name must be at least 2';
      if (control.errors.maxlength) message = 'Name must be less than 15';
      if (control.errors.pattern) message = 'Name must contain only letters';
    }

    else if (formControlName == 'surname') {
      if (control.errors.required) message = 'First name required';
      if (control.errors.minlength) message = 'First name must be at least 2';
      if (control.errors.maxlength) message = 'First name must be less than 15';
      if (control.errors.pattern) message = 'First name must contain only letters';
    }

    // console.log(message);
    return of(message);

  }
}
