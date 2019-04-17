import { Component, OnInit, Input } from '@angular/core';
import { SwiperConfigInterface, SwiperPaginationInterface, SwiperScrollbarInterface } from 'ngx-swiper-wrapper';
import { ProfileService } from '../../../../services/profile.service';
import { UploadService } from '../../../../services/upload.service';
import { Router } from '@angular/router';
import { ProfileIdComponent } from '../../domains/profile-id/profile-id.component'
import { JwtHelperService } from '@auth0/angular-jwt';
import { UsersService } from '../../../../services/users.service';

const helper = new JwtHelperService();

@Component({
	selector: 'app-front-carousel',
	templateUrl: './carousel.component.html',
	styleUrls: ['./carousel.component.scss'],
	providers: [ProfileService, UploadService, UsersService],
})
export class CarouselComponent implements OnInit {

	@Input() profile

	public show: boolean = true;
	public slides = []
	public type: string = 'directive';
	public disabled: boolean = false;
	public id_user;

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

	ngOnInit() {

		this.id_user = localStorage.getItem('id_token');
		this.id_user = helper.decodeToken(this.id_user).id;
		this.usersService.getUser(this.id_user).subscribe((res) => {
			if (res[0].profile == 0) {
				this.router.navigate(['/profile/create'])
			} else {
				this.profileService.getProfileByIdUser(this.id_user).subscribe(([res1, res2]) => {
					this.slides.push(res1[0].img)
					res2.forEach((m) => { this.slides.push(m.img) })
				})
			}
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

	constructor(
		protected uploadService: UploadService,
		protected profileService: ProfileService,
		protected usersService: UsersService,
		protected router: Router
	) { }


	public onIndexChange(index: number): void {
	}

	public onSwiperEvent(event: string): void {
	}



}
