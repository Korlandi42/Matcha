import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';

@Injectable()

export class MatchService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {}

  getAllMatch(id_user) {
   
    return this.httpClient.get<any>(`${this.API_URL}/match/${id_user}`)
  }

}