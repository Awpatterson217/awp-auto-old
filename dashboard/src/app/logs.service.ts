import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// TODO

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  constructor(private http: HttpClient) { }
  private url: string = 'http://127.0.0.1:8080/admin/api/logs'

  getAll() {
    return this.http.get(this.url);
  }
}
