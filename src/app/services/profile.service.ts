import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Injectable()

export class ProfileService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }

  getAllUsers() {
    return this.httpClient.get<any>(`${this.API_URL}/users`);
  }

  getAllUsersAndProfiles(user_id) {

    return forkJoin(
      this.httpClient.get<any>(`${this.API_URL}/users`),
      this.httpClient.get<any>(`${this.API_URL}/profile`))
  }

  getProfileByUsername(username) {
    return this.httpClient.get(`${this.API_URL}/profile`, username);
  }

  getProfileById(id) {
    return forkJoin(
      this.httpClient.get<any>(`${this.API_URL}/users/${id}`),
      this.httpClient.get<any>(`${this.API_URL}/profile/id_user/${id}`),
      this.httpClient.get<any>(`${this.API_URL}/profile/id_user/${id}/picture`));
  }

  getProfileByIdUser(id_user) {
    return forkJoin(
      this.httpClient.get<any>(`${this.API_URL}/profile/id_user/${id_user}`),
      this.httpClient.get<any>(`${this.API_URL}/profile/id_user/${id_user}/picture`));
  }

  addProfile(user, firstUser) {
    // if (firstUser === true) {
    //   return forkJoin(
    //     this.httpClient.patch<any>(`${this.API_URL}/profile`, user),
    //     this.httpClient.patch<any>(`${this.API_URL}/users/${user.id}`, user));
    // } else {
      return forkJoin(
        this.httpClient.patch<any>(`${this.API_URL}/profile/id_user/${user.id}`, user),
        this.httpClient.patch<any>(`${this.API_URL}/users/${user.id}`, user))
     // }
  }

  addPicture(id_user, path, filename) {

    return this.httpClient.patch<any>(`${this.API_URL}/profile/picture`, { id_user, path, filename });
  }

  addProfilePicture(id_user, path, filename) {
    return this.httpClient.post<any>(`${this.API_URL}/profile/profilepicture`, { id_user, path, filename });
  }

  userHasProfile(id) {
    return this.httpClient.get<any>(`${this.API_URL}/profile/id_user/${id}`);
  }

  deletePicture(id_photo, id_user) {
    return this.httpClient.delete<any>(`${this.API_URL}/profile/id_user/${id_user}/picture/${id_photo}`);
  }

}
