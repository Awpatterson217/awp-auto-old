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
}
