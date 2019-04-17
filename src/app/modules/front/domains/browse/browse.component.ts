import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core'
import { Router } from '@angular/router'
import { ProfileService } from "../../../../services/profile.service"
import { SuggestionsService } from "../../../../services/suggestions.service"
import { InterestsService } from "../../../../services/interests.service"
import { LikeService } from '../../../../services/likes.service'
import { UnlikeService } from '../../../../services/unlikes.service'
import { GeolocationService } from '../../../../services/geolocation.service'
import { JwtHelperService } from '@auth0/angular-jwt'
import { Like } from '../../../../models/like'
import { Unlike } from '../../../../models/unlike'
import { UsersService } from '../../../../services/users.service'
import { MatSnackBar } from '@angular/material'
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material'
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

const helper = new JwtHelperService()

@Component({
	selector: 'app-front-domains-browse',
	templateUrl: './browse.component.html',
	styleUrls: ['./browse.component.scss'],
	providers: [ProfileService, InterestsService, LikeService, UnlikeService, GeolocationService, SuggestionsService, UsersService]
})

export class BrowseComponent implements OnInit {

	expanded = false;
	sortBy = ['Age', 'Popularity', 'Distance', 'Tags']
	public id_user: string
	public ids = []
	public profiles = []
	public data = []
	public liked_profiles = []
	public scrollItems: number[] = [];
	public filter: [];
	public filtered_profiles = []
	public isFiltre = false;
	public isSort = false;
	sort;
	compare = false;
	profileComplete: boolean;

	array = [];
	filtered_array = [];
	sum = 12;
	sum2 = 12;
	scrollDistance = 1;
	scrollUpDistance = 2;
	direction = '';
	modalOpen = false;


	constructor(
		protected profileService: ProfileService,
		protected snackBar: MatSnackBar,
		protected interestsService: InterestsService,
		protected likesService: LikeService,
		protected unlikesService: UnlikeService,
		protected geolocationService: GeolocationService,
		protected suggestionsService: SuggestionsService,
		protected usersService: UsersService,
		protected router: Router,
		protected bottomSheet: MatBottomSheet,
		private sanitization: DomSanitizer
	) { }

	ngOnInit() {

		this.id_user = localStorage.getItem('id_token');
		this.id_user = helper.decodeToken(this.id_user).id;

		this.usersService.getUser(this.id_user).subscribe((res) => {
			if (res[0].profile == 0) {
				this.profileComplete = false;
				this.snackBar.open('Please complete your profile before accessing this page !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
				this.router.navigate(['/profile/create'])
			} else {
				this.profileComplete = true;
				this.suggestionsService.getSuggestions(this.id_user).subscribe((res) => {
					this.profiles = res;
					this.getInterests();
					this.appendItems1(0, this.sum)
				}, (err) => {  })
				this.likesService.like.subscribe((res) => {
					let id_visited = res.id_visited
					this.profiles.map((m, i) => { if (this.profiles[i].id_user == id_visited) { m.liked = true; return (m); }})
				}, (err) => {  })
				this.unlikesService.unlike.subscribe((res) => {
					let id_visited = res.id_visited
					this.profiles.map((m, i) => { if (this.profiles[i].id_user == id_visited) { m.liked = false; return (m); }})
				}, (err) => {  })
			}
		})
	}

	appendItems1(startIndex, endIndex) { this.addItems1(startIndex, endIndex, 'push'); }
	appendItems2(startIndex, endIndex) { this.addItems2(startIndex, endIndex, 'push'); }
	addItems1(startIndex, endIndex, _method) { for (let i = startIndex; i < endIndex; ++i) if (this.profiles[i]) this.array[_method](this.profiles[i]); }
	addItems2(startIndex, endIndex, _method) { for (let i = startIndex; i < endIndex; ++i) if (this.filtered_profiles[i]) this.filtered_array[_method](this.filtered_profiles[i]); }

	onScrollDown(ev) {
		if (!this.isFiltre) {
			// add another 20 items
			if (this.profiles.length - this.array.length >= 12) {
				const start = this.sum;
				this.sum += 12;
				this.appendItems1(start, this.sum);
				if (this.isSort) {
					this.sortTabBy(this.sort)
				}
				this.direction = 'down'
			} else {
				const start = this.sum;
				this.sum += this.profiles.length - this.array.length;
				this.appendItems1(start, this.sum);
				if (this.isSort) {
					this.sortTabBy(this.sort)
				}
				this.direction = 'down'
			}
		} else {
			if (this.filtered_profiles.length - this.filtered_array.length >= 12) {
				const start = this.sum2;
				this.sum2 += 12;
				this.appendItems2(start, this.sum2);
				if (this.isSort) {
					this.sortTabBy(this.sort)
				}
				this.direction = 'down'
			} else {
				const start = this.sum2;
				this.sum2 += this.filtered_profiles.length - this.filtered_array.length;
				this.appendItems2(start, this.sum2);
				if (this.isSort) {
					this.sortTabBy(this.sort)
				}
				this.direction = 'down'
			}
		}
	}

	hideShow(expanded) { this.expanded = expanded ? false: true; }

	getInterests() {
		this.interestsService.getAllProfileLiked(this.id_user).subscribe((res) => {
			if (res && res.length) {
				this.profiles.map(p => {
					if (res.some(r => r.id_visited == p.id_user)) {
						p.liked = true;
						return (p);
					}
				})
			}
		}, (err) => {  })

		this.interestsService.getAllProfileWhoLikedYou(this.id_user).subscribe((res) => {
			if (res && res.length) {
				this.profiles.map(p => {
					if (res.some(r => r.id_visitor == p.id_user)) {
						p.likedyou = true;
						return (p);
					}
				})
			}
		}, (err) => {  })

		this.interestsService.getAllProfileWhoVisitedYou(this.id_user).subscribe((res) => {
			if (res && res.length) {
				this.profiles.map(p => {
					if (res.some(r => r.id_visitor == p.id_user)) {
						p.visitedyou = true;
						return (p);
					}
				})
			}
		}, (err) => {  })
	}

	sendLike(id_visitor, id_visited) {
		let like = new Like()
		like.id_visitor = id_visitor
		like.id_visited = id_visited
		this.likesService.sendLike(like)
	}

	sendUnlike(id_visitor, id_visited) {
		let unlike = new Unlike()
		unlike.id_visitor = id_visitor
		unlike.id_visited = id_visited
		this.unlikesService.sendUnlike(unlike)
	}


	onFiltre($event) {

		this.filter = $event;
		this.Filtre(this.filter);
		this.isFiltre = true;
	}

	Filtre(tab) {
		this.filtered_profiles.length = 0;
		this.filtered_array.length = 0;
		this.sum2 = 12;
		for (let i = 0; i < this.profiles.length; i++) {
			if (tab[0].tags == [])
				this.compare = true;
			else
				this.compare = this.arraysCompare(tab[0].tags, this.profiles[i].tags);
			if (this.profiles[i].age <= tab[0].maxage && this.profiles[i].age >= tab[0].minage
			&& this.profiles[i].score <= tab[0].maxscore && this.profiles[i].score >= tab[0].minscore
			&& this.profiles[i].distance <= (tab[0].maxkm * 1000) && this.profiles[i].distance >= (tab[0].minkm * 1000)
			&& this.compare == true) {
				if (tab[0].like && tab[0].visited) {
					if (this.profiles[i].likedyou && this.profiles[i].visitedyou) {
						this.filtered_profiles.push(this.profiles[i])
					}
				}
				else if (tab[0].like) {
					if (this.profiles[i].likedyou) {
						this.filtered_profiles.push(this.profiles[i])
					}
				}
				else if (tab[0].visited) {
					if (this.profiles[i].visitedyou) {
						this.filtered_profiles.push(this.profiles[i])
					}
				}
				else {
					this.filtered_profiles.push(this.profiles[i])
				}
			}
		}
		if (this.filtered_profiles.length < this.sum2)
			this.sum2 = this.filtered_profiles.length;
		this.appendItems2(0, this.sum2)
		if (this.sort) {
			this.sortTabBy(this.sort)
		}
	}

	arraysCompare = (arr1, arr2) => {
		for (var i = arr1.length; i--;) {
			var tmp = 0
			for (var y = arr2.length; y--;) {
				tmp = y;
				if (arr1[i] == arr2[y].tagname)break;
			}
			if (arr1[i] != arr2[tmp].tagname)  return (false)
		}
		return (true)
	}

	onSelection(e) {
		this.isSort = true;
		if (e.value === 'option1') {
			this.sort = 1
			this.sortTabBy(1)
		}
		else if (e.value === 'option2') {
			this.sort = 2
			this.sortTabBy(2)
		}
		else if (e.value === 'option3') {
			this.sort = 3
			this.sortTabBy(3)
		}
		else if (e.value === 'option4') {
			this.sort = 4;
			this.sortTabBy(4)
		}
	}

	sortTabBy(value) {
		if (value == 1)
			this.isFiltre ?  this.filtered_array.sort((a, b) => (a.age - b.age)) : this.array.sort((a, b) => (a.age - b.age));
		else if (value == 2)
			this.isFiltre ? this.filtered_array.sort((a, b) => (b.score - a.score)) : this.array.sort((a, b) => (b.score - a.score));
		else if (value == 3)
			this.isFiltre ? this.filtered_array.sort((a, b) => (a.distance - b.distance)) : this.array.sort((a, b) => (a.distance - b.distance));
		else if (value == 4)
			this.isFiltre ? this.filtered_array.sort((a, b) => (b.commun_tags - a.commun_tags)) : this.array.sort((a, b) => (b.commun_tags - a.commun_tags));
	}
}
