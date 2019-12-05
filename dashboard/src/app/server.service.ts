import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }
  private url: string = 'http://127.0.0.1:3000/admin/api/server'

  getServers() {
    return this.http.get(this.url);
  }

  getServer(id) {
    return this.http.get(`${this.url}/${id}`);
  }

  update({ action, id }) {
    // Action = start, reload, suspend
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'my-auth-token'
      })
    };

    return this.http.put(this.url, { action, id }, httpOptions);
  }

  delete(id) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
