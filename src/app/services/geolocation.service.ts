import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';

@Injectable()

export class GeolocationService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }

  getLocation(id) {
    return this.httpClient.get<any>(`${this.API_URL}/geolocation/${id}`)
  }

  manualLocation(id) {
    return this.httpClient.post<any>(`${this.API_URL}/geolocation/manual`, {id})
  }

  addLocation(id, latitude, longitude) {

    return this.httpClient.post<any>(`${this.API_URL}/geolocation`, {id, latitude, longitude})
  }

  isGeoloc(id) {
    return this.httpClient.get<any>(`${this.API_URL}/geolocation/${id}`)
  }
}
