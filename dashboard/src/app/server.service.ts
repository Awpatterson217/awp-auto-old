import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }
  private activeServersURL: string = 'http://127.0.0.1:3000/server/active'
  private inactiveServersURL: string = 'http://127.0.0.1:3000/server/inactive'

  getActiveServers() {
    return this.http.get(this.activeServersURL);
  }

  getActiveServer(id) {
    return this.http.get(`${this.activeServersURL}/${id}`);
  }

  getInactiveServers() {
    return this.http.get(this.inactiveServersURL);
  }

  getInactiveServer(id) {
    return this.http.get(`${this.inactiveServersURL}/${id}`);
  }

  updateActiveServer({ action, id }) {
    console.log({action})
    console.log({id})
    // start, reload, suspend
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'my-auth-token'
      })
    };

    return this.http.put(this.activeServersURL, { action, id }, httpOptions);
  }

  deleteActiveServer(id) {
    return this.http.delete(`${this.activeServersURL}/${id}`);
  }
}
