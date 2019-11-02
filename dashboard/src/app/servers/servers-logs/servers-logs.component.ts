import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-servers-logs',
  templateUrl: './servers-logs.component.html',
  styleUrls: ['./servers-logs.component.css']
})
export class ServersLogsComponent implements OnInit {
  id;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
  }

}
