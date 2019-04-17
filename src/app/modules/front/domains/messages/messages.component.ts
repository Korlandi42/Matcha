import { Component, OnInit, Input, ViewChildren } from '@angular/core';
import { ChatService } from '../../../../services/chat.service';
import { ProfileService } from '../../../../services/profile.service';
import { MatchService } from '../../../../services/matchs.service';
import { HistoryService } from '../../../../services/history.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HighlightDirective } from './highlight.directive';
import { Message } from '../../../../models/message'
import { UsersService } from '../../../../services/users.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

const helper = new JwtHelperService();

@Component({
  selector: 'app-front-domains-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  providers: [MatchService, ProfileService, HistoryService, ChatService]
})
export class MessagesComponent implements OnInit {

  @ViewChildren(HighlightDirective)
  elements:HighlightDirective[];

  constructor(
    private matchService: MatchService,
    private profileService: ProfileService,
    private historyService: HistoryService,
    private chatService: ChatService,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private router: Router
    ) { }

  public id
  public lovers = []
  public show: boolean = false;
  public id_lover
  public messages = []
  public messageText
  public currentSender = ''
  public currentReceiver = ''
  public currentChatRoom = ''
  public profileComplete: boolean;

  ngOnInit() {

    this.id = localStorage.getItem('id_token');
    this.id = helper.decodeToken(this.id).id;
    this.usersService.getUser(this.id).subscribe((res) => {
      if (res[0].profile == 0) {
        this.profileComplete = false;
        this.snackBar.open('complete your profile first to see this page !', 'X', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'end' })
        this.router.navigate(['/profile/create'])
      } else {
        this.matchService.getAllMatch(this.id).subscribe((res) => {

          this.lovers = res.map((m) => {
            this.profileService.getProfileById(m.id_lover).subscribe( ([res2, res3]) => {
                m.isonline = res2[0].isOnline
                m.name = res2[0].name
                m.surname = res2[0].surname
                m.picture = res3[0].img
                return m
            })
            return m
          })

        })

        this.chatService.message.subscribe((res) => {

          this.messages.push({sender: res.sender, content: res.content})
        })
      }
    })
  }

  sendMessage(id_sender, id_receiver, id_chatroom, content) {

    this.messageText = '';
    let msg = new Message()
    msg.id_chatroom = id_chatroom
    msg.sender = id_sender
    msg.receiver = id_receiver
    msg.content = content
    this.chatService.sendMsg(msg)
  }

  openChatRoom(id_receiver, id_chatroom) {

    this.messages = []
    this.show = true
    this.historyService.getHistory(id_chatroom).subscribe( (res) => {

      if (res.log) {
      } else {

        res.map( (m) => {
          this.messages.push({sender: m.id_sender, content: m.content})
        })
      }

      this.currentSender = this.id
      this.currentReceiver = id_receiver
      this.currentChatRoom = id_chatroom
    })
  }
}
