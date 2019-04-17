import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UploadService } from '../../../../../../services/upload.service';
import { UsersService } from '../../../../../../services/users.service';
import {ProfileService} from '../../../../../../services/profile.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router'

const helper = new JwtHelperService();


@Component({
  selector: 'app-front-form-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
  providers: [UploadService, ProfileService, UsersService]

})
export class ProfilePictureComponent implements OnInit {

  @Output() uploaded = new EventEmitter<boolean>();
  didUpload = false
  public id_user
  public imagePath
  file: File;
  imgURL: any;

  constructor(
    private uploadService: UploadService,
    private profileService: ProfileService,
    protected router: Router,
    private usersService: UsersService
  ) { }

  ngOnInit() {

    let id = localStorage.getItem('id_token');
    this.id_user = helper.decodeToken(id).id;
  }

    async processFile(imageInput: any) {

	    this.file = imageInput.files[0]

	    var reader = new FileReader();
	    reader.readAsDataURL(this.file);
	    reader.onload = (_event) => {
	      this.imgURL = reader.result;
	    }

	    await this.uploadService.uploadProfilePicture(this.file, this.id_user).subscribe( (res) => {
	        if (res.uploaded === true) {
			console.log(res);
	          this.uploaded.emit(res.uploaded);
	        }
	    })
  	}
}
