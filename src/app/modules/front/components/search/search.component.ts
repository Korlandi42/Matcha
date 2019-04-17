import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild, Injectable, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TagsService } from '../../../../services/tags.service';
import { ProfileService } from '../../../../services/profile.service';
import { UsersService } from '../../../../services/users.service';
import { Options, ChangeContext, PointerType } from 'ng5-slider';

@Component({
	selector: 'app-front-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ProfileService, UsersService, TagsService]
})

export class SearchComponent {

	valueAge: number = 18;
	highValueAge: number = 100;
	optionsAge: Options = {
		floor: 18,
		ceil: 100
	};
	valuePopularity: number = 0;
	highValuePopularity: number = 1000;
	optionsPopularity: Options = {
		floor: 0,
		ceil: 1000
	};
	valueDistance: number = 0;
	highValueDistance: number = 500;
	optionsDistance: Options = {
		floor: 0,
		ceil: 500,
		translate: (value: number): string => {
			return value + 'km';
		}
	};
	visible = true;
	like = false;
	visited = false;
	selectable = true;
	removable = true;
	addOnBlur = true;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	tagCtrl = new FormControl();
	filteredTags: Observable<string[]>;
	tags: string[] = [];
	allTags: string[] = [];
	filter = [{ minage: 18, maxage: 100, minscore: 0, maxscore: 1000, minkm: 0, maxkm: 100, tags: [], like: false, visited: false }]
	filteredProfiles: [];
	// message = "test";

	@ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	@Output() onFiltre = new EventEmitter<{}>();

	constructor(private tagsService: TagsService) {
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

	onChangeAge(changeContext: ChangeContext): void {

		let res = this.getContext(changeContext)

		if (res.pointerType === 'Min')
			this.filter[0].minage = res.value
		else
			this.filter[0].maxage = res.value

	}

	onChangeLike() {
		this.like = this.like ? false: true;
		this.filter[0].like = this.like;
	}

	onChangeVisited() {
		this.visited = this.visited ? false: true;
		this.filter[0].visited = this.visited;
	}
	onChangePopularity(changeContext: ChangeContext): void {

		let res = this.getContext(changeContext)
		if (res.pointerType === 'Min')
			this.filter[0].minscore = res.value
		else
			this.filter[0].maxscore = res.value
	}

	onChangeDistance(changeContext: ChangeContext): void {

		let res = this.getContext(changeContext)
		if (res.pointerType === 'Min')
			this.filter[0].minkm = res.value
		else
			this.filter[0].maxkm = res.value
	}

	getContext(changeContext: ChangeContext) {

		let value: number
		let pointerType = changeContext.pointerType === PointerType.Min ? 'Min' : 'Max'

		if (pointerType === 'Min') {
			value = changeContext.value
		} else
			value = changeContext.highValue

		return { pointerType, value }
	}

	formatLabel(value: number | null) {
		if (!value)
			return 0;
		return value;
	}

	filtreprofile() {
		// this.filter[0].tags = this.tags;
		// console.log(this.filter);
	}

	filtre() {
		this.filter[0].tags = this.tags;
		this.onFiltre.emit(this.filter);
	}

	myfunc() {
	}

	add(event: MatChipInputEvent): void {

		if (!this.matAutocomplete.isOpen) {
			const input = event.input;
			const value = event.value;

			if ((value || '').trim()) {
				this.tags.push(value.trim());
			}

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
}
