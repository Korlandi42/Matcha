import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { Socket } from 'ngx-socket-io';
import { Auth } from '../models/auth';

@Injectable()

export class AuthenticationService {

	API_URL = 'http://localhost:3000';

	constructor(private httpClient: HttpClient, private socket: Socket) { }

	authenticate(user, latitude, longitude) {
		return this.httpClient.post<any>(`${this.API_URL}/auth/login`, { user, latitude, longitude })
			.pipe(map(data => {

				if (data && data.token) {

					const expiresAt = moment().add(data.expiresIn, 'second');

					localStorage.setItem('id_token', data.token);
					localStorage.setItem('username', user.username);
					localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));

					let auth = new Auth()
					auth.id = data.id
					this.authenticateSocket(auth)
				}
				return data;
			}));
	}


	authenticateSocket(auth: Auth) {
		this.socket.emit('authenticate', auth)
	}

	logout() {
		localStorage.removeItem("id_token");
		localStorage.removeItem("username");
		localStorage.removeItem("expires_at");
	}

	public isLoggedIn() {
		return moment().isBefore(this.getExpiration());
	}

	isLoggedOut() {
		return !this.isLoggedIn();
	}

	getExpiration() {
		const expiration = localStorage.getItem("expires_at");
		const expiresAt = JSON.parse(expiration);
		return moment(expiresAt);
	}

}
