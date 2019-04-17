import { Component, OnInit, ElementRef, ViewChild, Injectable  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, EmailValidator } from "@angular/forms";
import {ProfileService} from '../../../../../../services/profile.service';
import { UsersService } from '../../../../../../services/users.service';
import { TagsService } from '../../../../../../services/tags.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {map, startWith} from 'rxjs/operators';



const helper = new JwtHelperService();


@Component({
  selector: 'app-front-form-profile-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  providers: [ProfileService, UsersService, TagsService]
})
@Injectable()
export class CreateComponent implements OnInit {

  public editEnabled = true;
  public picurl: string;
  public  id: string;
  createprofileForm: FormGroup;
  public user= <any>{};
  public errorHttpResponse: boolean = false;
  public problem: string;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  allTags: string[]
  uploaded: boolean = false
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(protected fb: FormBuilder, private tagsService: TagsService, private profileService: ProfileService, protected router: Router, private usersService: UsersService) {
    this.createprofileForm = this.fb.group({
      age: ["", [Validators.required, Validators.min(18), Validators.max(150), Validators.pattern(/^[0-9]*$/)]],
      email: ["", [Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      biography: ["", Validators.required],
      name: ["", [Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[a-zA-Z]+$/)]],
      surname: ["", [Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[a-zA-Z]+$/)]],
      sexualOrientation: ["", Validators.required],
      genre: ["", Validators.required],
      id: this.id
    });
    this.tagsService.getTags().subscribe((response) => {
          if (response) {
            this.allTags = response.map(value => value.tagname);
            this.filteredTags = this.tagCtrl.valueChanges.pipe(
              startWith(null),
              map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice())
            );
          }
          }, (err) => {
    });

  }

  ngOnInit() {
    this.id = localStorage.getItem('id_token');
    this.id = helper.decodeToken(this.id).id;
    this.usersService.getUser(this.id).subscribe((response) => {
      if (response[0].profile == 1) {
        this.router.navigate(['/browse'])
      }
      if (response) {
        this.user.name = response[0].name
        this.user.surname = response[0].surname
        this.user.email = response[0].email
      }
      }, (err) => {
    });

  }

  createProfile() {
    if (this.createprofileForm.value.name == "")
      this.createprofileForm.value.name = this.user.name;
    if (this.createprofileForm.value.surname == "")
      this.createprofileForm.value.surname = this.user.surname;
    if (this.createprofileForm.value.email == "")
      this.createprofileForm.value.email = this.user.email;
    if (this.createprofileForm.value.genre == "female" && this.createprofileForm.value.sexualOrientation == "gay")
      this.createprofileForm.value.sexualOrientation = "lesbian";
    let value = this.createprofileForm.value;
    value.id = this.id;

    this.profileService.addProfile(value, true).subscribe(([res1, res2]) => {
      if (res1 && res2) {
        this.tagsService.addTags(this.tags, this.id).subscribe((response) => {
          if (response) {
            this.usersService.profileCreated(this.id).subscribe( (res) => {
              if (res)
                this.router.navigate(['browse']);
            })
          }
        }, (err) => {
        })
      }
    }, (err) => {
      this.errorHttpResponse = true;
      this.problem = err.error.error
    });
  }

  getErrors(formControlName): Observable<string> {

    let message: string = '';

    const control = this.createprofileForm.get(formControlName);

    if (formControlName && control && control.errors) {

      if (formControlName == 'email') {
        if (control.errors.pattern) message = 'email invalid';
      }

      else if (formControlName == 'name') {
        if (control.errors.minlength) message = 'name must be at least 2';
        if (control.errors.maxlength) message = 'name must be less than 15';
        if (control.errors.pattern) message = 'name must contain only letters';
      }

      else if (formControlName == 'surname') {
        if (control.errors.minlength) message = 'first name must be at least 2';
        if (control.errors.maxlength) message = 'first name must be less than 15';
        if (control.errors.pattern) message = 'first name must contain only letters';
      }

      else if (formControlName == 'age') {
        if (control.errors.required) message = 'age required';
        if (control.errors.min) message = 'you must be at least 18yo';
        if (control.errors.max) message = 'you must be less than 150yo';
        if (control.errors.pattern) message = 'your age is not a number';
      }

      else if (formControlName == 'biography') {
        if (control.errors.required) message = 'biography required';
      }

      else if (formControlName == 'sexualOrientation') {
        if (control.errors.required) message = 'Orientation required';
      }

      else if (formControlName == 'genre') {
        if (control.errors.required) message = 'genre required';
      }
    }
    else
      return;

  return of(message);

  }


  add(event: MatChipInputEvent): void {
    // Add tag only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our tag
      if ((value || '').trim()) {
        this.tags.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.tagCtrl.setValue(null);
    }
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }

  onUploaded(agreed: boolean) {
    if (agreed)
      this.uploaded = true
  }
}
