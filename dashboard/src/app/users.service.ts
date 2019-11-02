import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }
  private url: string = 'http://127.0.0.1:8080/users'

  getUsers() {
    return this.http.get(this.url);
  }

  getUser(uuid) {
    return this.http.get(`${this.url}/${uuid}`);
  }
}
