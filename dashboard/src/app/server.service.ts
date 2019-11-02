import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }
  private url: string = 'http://127.0.0.1:3000/server'

  getServers() {
    return this.http.get(this.url);
  }

  getServer(id) {
    return this.http.get(`${this.url}/${id}`);
  }
}
