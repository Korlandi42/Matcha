import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Message } from '../models/message';

@Injectable()

export class ChatService {

  message = this.socket.fromEvent<Message>('message');

  constructor(private socket: Socket) { }

  sendMsg(msg: Message) {
    this.socket.emit('message', msg)
  }

}
