import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';

@Injectable()

export class NotificationsService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {}

  getNotifications(id_user) {

    return this.httpClient.get<any>(`${this.API_URL}/notifications/${id_user}`)
  }

  Seen(id_user) {
	  return this.httpClient.get<any>(`${this.API_URL}/notifications/seen/${id_user}`)
  }
}
