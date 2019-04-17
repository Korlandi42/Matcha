import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable()

export class UploadService {

	API_URL = 'http://localhost:3000';

	constructor(private httpClient: HttpClient) { }

	uploadProfilePicture(file, id_user) {
		const formData = new FormData();
		formData.append('file', file);
		return this.httpClient.post<any>(`${this.API_URL}/upload/profilepicture/${id_user}`, formData)
	}

	uploadImage(file, id_user) {
		const formData = new FormData();
		formData.set('file', file);
		return this.httpClient.post<any>(`${this.API_URL}/upload/${id_user}`, formData)
	}
}
