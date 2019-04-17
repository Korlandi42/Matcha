import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()

export class SuggestionsService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {}


  getSuggestions(id_user) {

    return this.httpClient.get<any>(`${this.API_URL}/suggestions/${id_user}`)
  }

  // getIdsByOrientation(genre, sexual_orientation, lat, lon) {
   
  //   return this.httpClient.get<any>(`${this.API_URL}/suggestions/${genre}/${sexual_orientation}/${lat}/${lon}`)    
  // }

}