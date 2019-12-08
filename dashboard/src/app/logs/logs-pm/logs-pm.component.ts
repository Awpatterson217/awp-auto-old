import { Component, OnInit } from '@angular/core';
import { LogsService } from 'src/app/logs.service';

@Component({
  selector: 'logs-pm',
  templateUrl: './logs-pm.component.html',
  styleUrls: ['./logs-pm.component.css']
})
export class LogsPMComponent implements OnInit {
  panelOpenState = true;
  options = {
    host: null,
    port: null,
    url: null,
  };

  constructor(
    private logsService: LogsService,
    ) {}

  ngOnInit() {

  }

  getAll() {
    this.logsService.getAll().subscribe((data: any) => {
      console.log('All logs');
      console.log({data});
    });
  }
}
