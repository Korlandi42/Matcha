import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class TagsService {

  API_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }


  addTags(tags, id_user) {
    return this.httpClient.post<any>(`${this.API_URL}/tags/add/${id_user}`, tags)
  }

  getTags() {
    return this.httpClient.get<any>(`${this.API_URL}/tags`)
  }

  getTagsofUser(id_user) {
    return this.httpClient.get<any>(`${this.API_URL}/tags/${id_user}`)
  }

}