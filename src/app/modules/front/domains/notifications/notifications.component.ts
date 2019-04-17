import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../../services/chat.service';
import { LikeService } from '../../../../services/likes.service';
import { UnlikeService } from '../../../../services/unlikes.service';
import { VisitService } from '../../../../services/visits.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { JwtHelperService } from '@auth0/angular-jwt'
import { UsersService } from '../../../../services/users.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

const helper = new JwtHelperService();

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [ChatService, LikeService, UnlikeService, VisitService, NotificationsService]

})
export class NotificationsComponent implements OnInit {

  id_user
  messages = []
  likes = []
  visits = []
  unlikes = []
  notifications = []

  array = [];
  sum = 20;
  scrollDistance = 2;
  scrollUpDistance = 2;
  direction = '';

  profileComplete: boolean;

  constructor(
    private chatService: ChatService,
    private likeService: LikeService,
    private unlikeService: UnlikeService,
    private visitService: VisitService,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private router: Router,
    private notificationsService: NotificationsService
    ) { }

  ngOnInit() {

    this.id_user = localStorage.getItem('id_token');
    this.id_user = helper.decodeToken(this.id_user).id;

    this.usersService.getUser(this.id_user).subscribe((res) => {
      if (res[0].profile == 0) {
        this.profileComplete = false;
        this.snackBar.open('complete your profile first to see this page !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
        this.router.navigate(['/profile/create'])
      } else {
        this.notificationsService.getNotifications(this.id_user).subscribe( (res) => {

          if (res.empty != true) {
            res.map( (m) => {
              this.notifications.push(m)
			  this.notificationsService.Seen(this.id_user).subscribe((res) => {

			  })
            })

            this.notifications.reverse()
          }
          if (this.notifications.length < this.sum)
            this.sum = this.notifications.length
          this.appendItems(0, this.sum)
        })

        this.likeService.like.subscribe((res) => {


          this.likes.push()
        })

        this.unlikeService.unlike.subscribe((res) => {


          this.unlikes.push()
        })

        this.visitService.visit.subscribe((res) => {


          this.visits.push()
        })
      }
    })

  }

appendItems(startIndex, endIndex) {
    this.addItems(startIndex, endIndex, 'push');
  }

  addItems(startIndex, endIndex, _method) {

    for (let i = startIndex; i < endIndex; ++i) {
      this.array[_method](this.notifications[i]);
    }

  }


  onScrollDown (ev) {

        // add another 20 items
      if (this.notifications.length - this.array.length >= 12) {
        const start = this.sum;
        this.sum += 12;
        this.appendItems(start, this.sum);
        this.direction = 'down'
      } else {
        const start = this.sum;
        this.sum += this.notifications.length - this.array.length;
        this.appendItems(start, this.sum);
        this.direction = 'down'
      }
  }

}
