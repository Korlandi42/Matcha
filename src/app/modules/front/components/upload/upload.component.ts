import { Component, Input, OnInit } from '@angular/core';
import { UploadService } from '../../../../services/upload.service';
import { ProfileService } from '../../../../services/profile.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import {CarouselComponent} from '../carousel/carousel.component';
import { DomSanitizer } from '@angular/platform-browser';
import { UsersService } from '../../../../services/users.service';

const helper = new JwtHelperService();

@Component({
  selector: 'app-front-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [UploadService]
})
export class UploadComponent extends CarouselComponent implements OnInit {

  @Input() id_user;
  @Input() slide;

  constructor(
    private sanitizer: DomSanitizer,
    protected uploadService: UploadService,
    protected profileService: ProfileService,
    protected usersService: UsersService,
    protected router: Router,
    ) {
    super(
      uploadService,
      profileService,
      usersService,
      router,
      )
  }

  ngOnInit() {
  }

  public processFile(imageInput: any) {

    let file: File = imageInput.files[0]
	if (file) {
		this.uploadService.uploadImage(file, this.id_user).subscribe( (res) => {
			if (res) {
				this.slides.push(res.path);
			}
		})
	}

      // if (res) {
        // this.profileService.addPicture(this.id_user, res.path, res.filename).subscribe( (res) => {
          // if (res && res.status == 200) {
          //   console.log("photo uploaded")
          // }
        // })
      // }
  }

  // transform(){
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(this.slide);
  // }

}
