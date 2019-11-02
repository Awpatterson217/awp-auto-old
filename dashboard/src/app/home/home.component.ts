import { Component, OnInit } from '@angular/core';
import {
  Subject,
  fromEvent,
  Observable,
  from,
  of
} from 'rxjs';
import {
  map,
  tap,
  takeUntil
} from 'rxjs/operators';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
