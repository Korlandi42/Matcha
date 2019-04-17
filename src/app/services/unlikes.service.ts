import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Unlike } from '../models/unlike';

@Injectable()

export class UnlikeService {

  unlike = this.socket.fromEvent<Unlike>('unlike')

  constructor(private socket: Socket) { }

  sendUnlike(unlike: Unlike) {
    this.socket.emit('unlike', unlike)
  }

}
