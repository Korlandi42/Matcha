import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../services/profile.service';
import { EditProfileComponent } from '../../components/form/profile/edit/edit-profile.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from "@angular/material";
import { TagsService } from '../../../../services/tags.service';
import { UsersService } from '../../../../services/users.service';
import { Router } from '@angular/router';


const helper = new JwtHelperService();

// const decodedToken = helper.decodeToken(myRawToken);

@Component({
	selector: 'app-front-domains-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss'],
	providers: [TagsService, UsersService, ProfileService, { provide: MatDialogRef, useValue: {} },
		{ provide: MAT_DIALOG_DATA, useValue: [] },],
})
export class ProfileComponent implements OnInit {

	public username: string = '';
	public id: string;
	public profile = <any>{};
	public profileComplete: boolean;

	constructor(
		protected profileService: ProfileService, protected router: Router,
		private tagsService: TagsService, private usersService: UsersService,
		protected snackBar: MatSnackBar,
	) { }

	ngOnInit() {
		this.username = localStorage.getItem('username');
		this.id = localStorage.getItem('id_token');
		this.id = helper.decodeToken(this.id).id;
		this.usersService.getUser(this.id).subscribe((res) => {
			if (res[0].profile == 0) {
				this.profileComplete = false;
				this.snackBar.open('complete your profile first to see this page !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
				this.router.navigate(['/profile/create'])
			} else {
				this.profileService.getProfileById(this.id).subscribe(([res1, res2]) => {

					if (res1[0]) {
						this.profile.name = res1[0].name;
						this.profile.email = res1[0].email;
						this.profile.surname = res1[0].surname;
						this.profile.score = res1[0].score;
					}
					if (res2[0]) {
						this.profile.id = res2[0].id;
						this.profile.genre = res2[0].genre;
						this.profile.sexualOrientation = res2[0].sexual_orientation;
						this.profile.age = res2[0].age;
						this.profile.biography = res2[0].biography;
						this.profile.hobbies_tag = res2[0].hobbies_tag;
						this.profile.id_user = this.id;
					}
					this.tagsService.getTagsofUser(this.id).subscribe((response) => {
						if (response) {
							if (this.profile) this.profile.tags = response.map(value => value.tagname);
						}
					}, (err) => {
					});
				});
			}
		})


	}
}
