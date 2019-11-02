import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProvisionService {

  constructor(private http: HttpClient) { }
  private url: string = 'http://127.0.0.1:3000/provision'

  provision({ host, port, url, name }) {
    return this.http.post(this.url, { host, port, url, name });
  }

  put({ action, id }) {
    console.log({action})
    console.log({id})
    // start, reload, suspend
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
