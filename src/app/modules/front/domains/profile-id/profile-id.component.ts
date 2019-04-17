import { Inject, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../services/profile.service';
import { TagsService } from '../../../../services/tags.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SwiperConfigInterface, SwiperPaginationInterface, SwiperScrollbarInterface } from 'ngx-swiper-wrapper';
import { InterestsService } from "../../../../services/interests.service"
import { Router } from '@angular/router';
import { UsersService } from '../../../../services/users.service';


import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { BrowseComponent } from '../browse/browse.component';

const helper = new JwtHelperService();

@Component({
	selector: 'app-front-domains-profile-id',
	templateUrl: './profile-id.component.html',
	styleUrls: ['./profile-id.component.scss'],
	providers: [ProfileService, TagsService, InterestsService, UsersService]
})
export class ProfileIdComponent implements OnInit {

	public username: string = '';
	public type: string = 'directive';
	public show: boolean = true;
	public profile = [];
	public tags = [];
	public slides = [];
	public id_user;
	public users = <any>{};
	public distance;
	public lastcon;
	profileComplete: boolean;
	isonline: boolean;

	public config: SwiperConfigInterface = {
		a11y: true,
		direction: 'horizontal',
		slidesPerView: 1,
		keyboard: true,
		mousewheel: true,
		scrollbar: false,
		navigation: true,
		pagination: true
	};

	private scrollbar: SwiperScrollbarInterface = {
		el: '.swiper-scrollbar',
		hide: false,
		draggable: true
	};

	private pagination: SwiperPaginationInterface = {
		el: '.swiper-pagination',
		clickable: true,
		hideOnClick: false
	};


	constructor(
		protected router: Router,
		private profileService: ProfileService,
		private interestsService: InterestsService,
		private tagsService: TagsService,
		private ref: ChangeDetectorRef,
		private usersService: UsersService,
		public dialogRef: MatDialogRef<ProfileIdComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
		this.profile = this.data.profile
		this.lastcon = this.data.profile[0].lastCon
		this.isonline = this.data.profile[0].isOnline
		this.data.tags.map((m, i) => {
			this.tags[i] = m.tagname
		})
		this.distance = Math.floor(this.profile[0].distance) / 1000
		this.id_user = localStorage.getItem('id_token');
		this.id_user = helper.decodeToken(this.id_user).id;
		this.usersService.getUser(this.id_user).subscribe((res) => {
			if (res[0].profile == 0) {
				this.profileComplete = false;
				this.router.navigate(['/profile/create'])
			} else {
				this.profileComplete = true;
			}
		})
		this.profileService.getProfileByIdUser(this.data.profile[0].id_user).subscribe(([res1, res2]) => {
			this.slides.push(this.data.profile[0].img)
			res2.forEach((m) => { if (m.img) this.slides.push(m.img) })
		})
	}

	public toggleOverlayControls() {
		if (this.config.navigation) {
			this.config.scrollbar = false;
			this.config.navigation = false;
			this.config.pagination = this.pagination;
		} else if (this.config.pagination) {
			this.config.navigation = false;
			this.config.pagination = false;
			this.config.scrollbar = this.scrollbar;
		} else {
			this.config.scrollbar = false;
			this.config.pagination = false;
			this.config.navigation = true;
		}
	}

	public onIndexChange(index: number): void {
	}

	public onSwiperEvent(event: string): void {
	}

	fake(id_visited) {
		this.interestsService.reportFake(this.id_user, id_visited).subscribe((res) => {
			if (res) {
				this.dialogRef.close();
			}
		}, (err) => {
		})
	}

	block(id_visited) {

		this.interestsService.block(this.id_user, id_visited).subscribe((res) => {
			if (res) {
				this.redirectTo('/browse');
				this.dialogRef.close();
			}
		}, (err) => {
		})
	}
	redirectTo(uri) {
		this.router.navigateByUrl('/', { skipLocationChange: true })
		.then(() => {this.router.navigate([uri])});
	}

}
