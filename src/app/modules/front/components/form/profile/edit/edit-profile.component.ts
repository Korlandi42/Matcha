import { Component, OnInit, ViewChild, Injectable, ElementRef, Input } from '@angular/core';
import { FormBuilder, AbstractControl, FormGroup, FormControl, Validators, EmailValidator } from "@angular/forms";
import { ProfileService } from '../../../../../../services/profile.service';
import { UsersService } from '../../../../../../services/users.service';
import { TagsService } from '../../../../../../services/tags.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs/operators';
import { getMultipleValuesInSingleSelectionError } from '@angular/cdk/collections';
import { UploadService } from '../../../../../../services/upload.service';
import { MatSnackBar } from '@angular/material';
import { GeolocationService } from '../../../../../../services/geolocation.service';

declare let L;

const helper = new JwtHelperService();
// declare var ol: any;

@Component({
    selector: 'app-front-form-profile-edit',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    providers: [ProfileService, UsersService, TagsService, UploadService, GeolocationService]
})
@Injectable()
export class EditProfileComponent implements OnInit {

    public editEnabled = true;
    public picurl: string;
    public id: string;
    profileForm: FormGroup;
    passwordForm: FormGroup;
    public firstUser: boolean;
    public user = <any>{};
    public profile = <any>{};
    public errorHttpResponse: boolean = false;
    public problem: string;
    public photos: [];
    file: File;
    imgURL: any;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    tagCtrl = new FormControl();
    filteredTags: Observable<string[]>;
    tags: string[];
    allTags: string[];
    lat;
    long;

    // latitude: number = 48.8582;
    // longitude: number = 2.3387;

    // map: any;


    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(protected fb: FormBuilder, private geolocationService: GeolocationService, private uploadService: UploadService, private snackBar: MatSnackBar, private tagsService: TagsService,
        private profileService: ProfileService, protected router: Router, private usersService: UsersService) {
        this.profileForm = this.fb.group({
            age: ["", [Validators.min(16), Validators.max(150), Validators.pattern(/^[0-9]*$/)]],
            email: ["", [Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
            biography: [""],
            name: ["", [Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[a-zA-Z]+$/)]],
            surname: ["", [Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[a-zA-Z]+$/)]],
            sexualOrientation: [""],
            genre: [""],
            id: this.id
        });
        this.passwordForm = this.fb.group({
            oldpassword: ["", Validators.required],
            password: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)]],
            confpassword: ["", Validators.required],
        }, { validator: this.checkPasswords });
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
        this.id = localStorage.getItem('id_token');
        this.id = helper.decodeToken(this.id).id;
        this.usersService.getUser(this.id).subscribe((res) => {
            if (res[0].profile == 1) {
                this.tagsService.getTagsofUser(this.id).subscribe((response) => {
                    if (response) {
                        this.tags = response.map(value => value.tagname);
                    }
                }, (err) => {
                });
            }
        })


    }

    ngOnInit() {

        this.usersService.getUser(this.id).subscribe((res) => {
            if (res[0].profile == 0) {
                this.snackBar.open('Complete your profile first to see this page !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
                this.router.navigate(['/profile/create'])
            }
            else {
                this.profileService.getProfileById(this.id).subscribe(([res1, res2, res3]) => {
                    if (res1) {
                        this.profile.name = res1[0].name
                        this.profile.email = res1[0].email
                        this.profile.surname = res1[0].surname
                    }
                    if (res2) {
                        this.profile.id = res2[0].id
                        this.profile.genre = res2[0].genre
                        this.profile.sexualOrientation = res2[0].sexual_orientation
                        this.profile.age = res2[0].age
                        this.profile.biography = res2[0].biography
                        this.profile.img = res2[0].img
                    }
                    if (res3) {
                        this.photos = res3.map(pic => ({ ...pic, filename: pic.img }))
                    }
                }, (err) => {
                });

                this.geolocationService.getLocation(this.id).subscribe((res) => {
                    this.lat = res.latitude;
                    this.long = res.longitude;
                    const map = L.map('map').setView([this.lat, this.long], 19);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    L.marker([this.lat, this.long], { draggable: true }).addTo(map)
                        .bindPopup('This is where I live.')
                        .openPopup();

                    map.on('click', (e) => {
                        this.geolocationService.addLocation(this.id, e.latlng.lat, e.latlng.lng).subscribe(() => {
                        })
                        this.snackBar.open('your localisation has been changed!', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
                        this.router.navigate(['/profile'])
                    });
                })
            }
        })

    }




    deletePic(id_photo, id_user) {
        this.profileService.deletePicture(id_photo, id_user).subscribe((response) => {
            if (response) {
                this.profileService.getProfileById(this.id).subscribe(([res1, res2, res3]) => {
                    if (res3) {
                        this.photos = res3.map(pic => ({ ...pic, filename: '/assets/uploads/' + this.id + '/' + pic.filename }))
                    }
                }, (err) => {
                });
            }
        }, (err) => {
        })
    }

    public processFile(imageInput: any) {

        if (imageInput.files[0].size > 3000000) {
            this.snackBar.open('file size must be 3mb maximum', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
            return;
        }
        else if (imageInput.files[0].type !== 'image/jpeg' && imageInput.files[0].type !== 'image/jpg' && imageInput.files[0].type !== 'image/png') {
            this.snackBar.open('file must be a jpg/png/jpeg', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
            return;
        }
		this.file = imageInput.files[0];

		var reader = new FileReader();
		reader.readAsDataURL(this.file);
		reader.onload = (_event) => {
			this.imgURL = reader.result;
		}
		this.uploadService.uploadProfilePicture(this.file, this.id).subscribe( (res) => {
		  if (res) { this.profile.img = res.path; }
		})

    }

    public sendFile() {


    }

    onSelectFile(imageInput: any) {
        if (imageInput.files[0].size > 3000000) {
            this.snackBar.open('file size must be 3mb maximum', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
            return;
        }
        else if (imageInput.files[0].type !== 'image/jpeg' && imageInput.files[0].type !== 'image/jpg' && imageInput.files[0].type !== 'image/png') {
            this.snackBar.open('file must be a jpg/png/jpeg', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
            return;
        }
        this.file = imageInput.files[0]
        var reader = new FileReader();

        reader.readAsDataURL(this.file);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
        }
        // this.uploadService.uploadImage(this.file).subscribe( (res) => {
        //   if (res) {
        //     this.profileService.addProfilePicture(this.id, res.path, res.filename).subscribe( (res) => {

        //     })
        //   }
        // })
    }

    saveProfile() {
        if (this.tags.length == 0) {
            this.errorHttpResponse = true;
            this.problem = "you must choose at least one interest"
            return;
        }
        if (this.profileForm.value.name == "")
            this.profileForm.value.name = this.profile.name;
        if (this.profileForm.value.surname == "")
            this.profileForm.value.surname = this.profile.surname;
        if (this.profileForm.value.email == "")
            this.profileForm.value.email = this.profile.email;
        if (this.profileForm.value.age == "")
            this.profileForm.value.age = this.profile.age;
        if (this.profileForm.value.genre == "")
            this.profileForm.value.genre = this.profile.genre;
        if (this.profileForm.value.sexualOrientation == "")
            this.profileForm.value.sexualOrientation = this.profile.sexualOrientation;
        if (this.profileForm.value.biography == "")
            this.profileForm.value.biography = this.profile.biography;
        if (this.profileForm.value.genre == "female" && this.profileForm.value.sexualOrientation == "gay")
            this.profileForm.value.sexualOrientation = "lesbian";

        let value = this.profileForm.value;
        value.id = this.id;

        this.profileService.addProfile(value, false).subscribe(async ([res1, res2]) => {
            if (res1 && res2) {
                this.tagsService.addTags(this.tags, this.id).subscribe((response) => {
                    if (response) {
                        this.router.navigate(['/profile']);
                    }
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

    checkPasswords(control: AbstractControl) {
        const password: string = control.get('password').value; // get password from our password form control
        const confirmPassword: string = control.get('confpassword').value; // get password from our confirmPassword form control
        // compare is the password math
        if (password !== confirmPassword) {
            // if they don't match, set an error in our confirmPassword form control
            control.get('confpassword').setErrors({ NoPassswordMatch: true });
        }
    }

    changePassword() {
        const value = this.passwordForm.value;
        value.id = this.id;

        this.usersService.changeUsersPassword(value).subscribe((response) => {
            if (response) {
                this.router.navigate(['/profile']);
            }
        }, (err) => {
        })
    }

    getErrors(formControlName): Observable<string> {

        let message: string = '';

        const control = this.profileForm.get(formControlName);
        const control2 = this.passwordForm.get(formControlName);

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
                if (control.errors.min) message = 'you must be at least 16yo';
                if (control.errors.max) message = 'you must be less than 150yo';
                if (control.errors.pattern) message = 'your age is not a number';
            }
        }
        else if (formControlName && control2 && control2.errors) {

            if (formControlName == 'oldpassword') {
                if (control2.errors.required) message = 'Current password required';
            }

            else if (formControlName == 'password') {
                if (control2.errors.required) message = 'Password required';
                else if (control2.errors.pattern) message = 'Invalid password : Minimum 8 chars, at least 1 uppercase letter, 1 lowercase letter and 1 number: ';
            }

            else if (formControlName == 'confpassword') {
                if (control2.errors.required) message = 'confirm your password';
                if (control2.errors.NoPassswordMatch) message = 'passwords not the same';
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


    // // public clear() {
    // //   this.picurl = '';
    // //}
}
