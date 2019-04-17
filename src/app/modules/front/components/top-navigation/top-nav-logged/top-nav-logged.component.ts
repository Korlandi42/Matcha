import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from "../../../../../services/authentication.service";
import { Router } from '@angular/router';
import { ChatService } from '../../../../../services/chat.service';
import { LikeService } from '../../../../../services/likes.service';
import { UnlikeService } from '../../../../../services/unlikes.service';
import { VisitService } from '../../../../../services/visits.service';
import { NotificationsService } from '../../../../../services/notifications.service';
import { JwtHelperService } from '@auth0/angular-jwt'
import { Auth } from '../../../../../models/auth';

const helper = new JwtHelperService();


@Component({
  selector: 'app-front-top-nav-logged',
  templateUrl: './top-nav-logged.component.html',
  styleUrls: ['./top-nav-logged.component.scss'],
  providers: [AuthenticationService, ChatService, LikeService, UnlikeService, VisitService, NotificationsService]
})
export class TopNavLoggedComponent implements OnInit {

  @Input('matBadge') notif: string = ''
  @Input('matBadge') notifMessage: string = ''

  id_user
  nb_notif: number = 0
  nb_notifMessage: number = 0

  constructor(
    protected router: Router,
    private  authenticationService:  AuthenticationService,
    private chatService: ChatService,
    private likeService: LikeService,
    private unlikeService: UnlikeService,
	private visitService: VisitService,
    private notifService: NotificationsService
  ) { }

  ngOnInit() {

    this.id_user = localStorage.getItem('id_token')

    if (this.id_user) {

      this.id_user = helper.decodeToken(this.id_user).id;
      this.sendAuth(this.id_user)
      this.chatService.message.subscribe((res) => {

        if (res.sender != this.id_user) {
          this.nb_notifMessage += 1
          this.notifMessage = this.nb_notifMessage.toString()
        }
      })

      this.likeService.like.subscribe((res) => {

        if (res.id_visitor != this.id_user) {
          this.nb_notif += 1
          this.notif = this.nb_notif.toString()
        }
      })

      this.unlikeService.unlike.subscribe((res) => {

        if (res.id_visitor != this.id_user) {
          this.nb_notif += 1
          this.notif = this.nb_notif.toString()
        }
      })

      this.visitService.visit.subscribe((res) => {

        if (res.id_visited === this.id_user.toString()) {
          this.nb_notif += 1
          this.notif = this.nb_notif.toString()
        }
      })

	  this.notifService.getNotifications(this.id_user).subscribe((res) => {
			for (let n of res) {
				if (n.seen == 0) {
					this.nb_notif += 1;
				}
			}
			if (this.nb_notif > 0) this.notif = this.nb_notif.toString();
	  })
    }
  }

  public sendAuth(id) {
    let auth = new Auth()
    auth.id = id
    this.authenticationService.authenticateSocket(auth)
  }

  public reinitNotifBadge() {
    this.notif = '';
    this.nb_notif = 0;
  }

  public reinitMessageBadge() {
    this.notifMessage = '';
    this.nb_notifMessage = 0;
  }

}
