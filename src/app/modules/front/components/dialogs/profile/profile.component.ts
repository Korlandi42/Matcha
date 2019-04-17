import { Component } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material";
import { ProfileIdComponent } from "../../../domains/profile-id/profile-id.component";
import { VisitService } from "../../../../../services/visits.service";
import { SuggestionsService } from "../../../../../services/suggestions.service"
import { InterestsService } from "../../../../../services/interests.service"
import { UsersService } from '../../../../../services/users.service';
import { JwtHelperService } from '@auth0/angular-jwt'

const helper = new JwtHelperService();

@Component({
	selector: 'app-front-dialogs-profile',
	template: '',
	providers: [VisitService, SuggestionsService, InterestsService, UsersService]
})
export class DialogProfileComponent {

	public profiles = []
	public myprofile = []
	profileComplete: boolean;

	constructor(
		private activateRoute: ActivatedRoute,
		private interestsService: InterestsService,
		private router: Router,
		private matDialog: MatDialog,
		private suggestionsService: SuggestionsService,
		private usersService: UsersService,
		private visitService: VisitService
	) {

		let id_user = localStorage.getItem('id_token');
		id_user = helper.decodeToken(id_user).id;
		this.usersService.getUser(id_user).subscribe((res) => {
			if (res[0].profile == 0) {
				this.profileComplete = false;
				this.router.navigate(['/profile/create'])
			} else {
				this.profileComplete = true;
				this.activateRoute.paramMap.subscribe(res => {
					if (res.get('profile_id')) {
						let id_visited = res.get('profile_id');
						if (id_visited == id_user) return;
						this.suggestionsService.getSuggestions(id_user).subscribe((res) => {
							this.profiles = res;
							this.profiles.map((m, i) => {
								if (m.id_user == id_visited)
									this.myprofile.push(m)
							})
							this.interestsService.getAllProfileWhoLikedYou(id_user).subscribe((res) => {

								if (res && res.length) {
									this.myprofile.map(p => {
										if (res.some(r => r.id_visitor == p.id_user)) {
											p.likedyou = true
											return p
										}
									})
								}
							}, (err) => {
							})
							if (!this.myprofile[0]) return;
							this.visitService.sendVisit({ id_user, id_visited })
							const config = {
								data: { profile: this.myprofile, tags: this.myprofile[0].tags },
								width: '80%',
								maxWidth: '100%',
								// disableClose: false,
								// backdropClass: 'app-front-domains-browse',
								panelClass: 'app-front-domains-browse',
								autoFocus: false,
							};
							const dialogRef = this.matDialog.open(ProfileIdComponent, config);
							dialogRef.afterClosed().subscribe(this.back);
						}, (err) => {
						})
					}
				})
			}
		})

	}

	public back = () => {
		this.router.navigate([{ outlets: { dialog: null } }], { queryParamsHandling: 'preserve' });
	}

}
