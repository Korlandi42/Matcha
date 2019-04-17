import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Visit } from '../models/visit';

@Injectable()

export class VisitService {

  visit = this.socket.fromEvent<Visit>('visit')

  constructor(private socket: Socket) { }

  sendVisit(visit: Visit) {
    this.socket.emit('visit', visit)
  }

}
