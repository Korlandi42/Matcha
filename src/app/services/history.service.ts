import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class HistoryService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }

  getHistory(id_chatroom) {

    return this.httpClient.get<any>(`${this.API_URL}/messages/history/${id_chatroom}`)
  }
}
