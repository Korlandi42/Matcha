import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root',})

export class UsersService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }


  addUser(user) {
    return this.httpClient.post<any>(`${this.API_URL}/users/register`, user)
	
      // .pipe(map(data => {
      //
      //     // if (data && data.token) {
      //     //   console.log(user);
      //     //   return this.httpClient.post<any>(`${this.API_URL}/sendmail`, user, data.token);
      //     // }
      // }));
  }

  profileCreated(id) {
    return this.httpClient.patch<any>(`${this.API_URL}/users/profile/${id}`, true);
  }

  getUser(id) {
    return this.httpClient.get<any>(`${this.API_URL}/users/${id}`)
  }

  sendMailReset(user) {
    return this.httpClient.post<any>(`${this.API_URL}/sendMail/resetpassword`, user)
  }

  sendMailConfirmAccount(user, id) {
    return this.httpClient.post<any>(`${this.API_URL}/sendMail/confirmaccount/${id}`, user)
  }

  changeUsersPassword(user) {
    return this.httpClient.patch<any>(`${this.API_URL}/users/password/${user.id}`, user);
  }

  verifytoken(token) {
    return this.httpClient.get<any>(`${this.API_URL}/users/verifytoken/${token}`);
  }

  resetPassword(user) {
    return this.httpClient.patch<any>(`${this.API_URL}/users/resetpassword/${user.id}`, user);
  }

  lastCon(id) {
    return this.httpClient.get<any>(`${this.API_URL}/users/logout/${id}`);
  }

  // login(user) {
  //   return this.httpClient.post(`${this.API_URL}/login`, user);
  // }
}
