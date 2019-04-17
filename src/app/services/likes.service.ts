import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Like } from '../models/like';

@Injectable()

export class LikeService {

  like = this.socket.fromEvent<Like>('like')

  constructor(private socket: Socket) { }

  sendLike(like: Like) {
    this.socket.emit('like', like)
  }

}
