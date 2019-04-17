import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Injectable()

export class InterestsService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }


  like(user_id, liked_user_id) {

    return forkJoin(
      this.httpClient.post<any>(`${this.API_URL}/interests/like`, {user_id, liked_user_id}),
      this.httpClient.get<any>(`${this.API_URL}/match/${user_id}/${liked_user_id}`)
    ) 
  }

  reportFake(user_id, fake_user_id) {
    return this.httpClient.post<any>(`${this.API_URL}/interests/fake`, {user_id, fake_user_id})
  }

  block(id_visitor, id_visited) {
    return this.httpClient.post<any>(`${this.API_URL}/interests/block`, {id_visitor, id_visited})
  }

  getAllProfileLiked(user_id) {

    return this.httpClient.get<any>(`${this.API_URL}/interests/like/${user_id}`)
  }

  unlike(user_id, unliked_user_id) {

    return this.httpClient.delete<any>(`${this.API_URL}/interests/unlike/${user_id}/${unliked_user_id}`)
  }

  getAllProfileWhoLikedYou(user_id) {
    return this.httpClient.get<any>(`${this.API_URL}/interests/likedyou/${user_id}`)
  }

  getAllProfileWhoVisitedYou(user_id) {
    return this.httpClient.get<any>(`${this.API_URL}/interests/visitedyou/${user_id}`)
  }

  getAllProfileBlocked(user_id) {
    return this.httpClient.get<any>(`${this.API_URL}/interests/youblocked/${user_id}`)
  }
}

