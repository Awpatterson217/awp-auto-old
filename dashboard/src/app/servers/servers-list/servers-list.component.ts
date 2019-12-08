import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/server.service';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'servers-list',
  templateUrl: './servers-list.component.html',
  styleUrls: ['./servers-list.component.css']
})
export class ServersListComponent implements OnInit {
  panelOpenState = true;
  servers;

  constructor(
    private serverService: ServerService,
    private dialog: MatDialog,
    private sanitizer:DomSanitizer
    ) {}

  ngOnInit() {
    this.getServers();
  }

  getServers() {
    this.serverService.getServers().subscribe((data: any) => {
      this.servers = data;
    });
  }

  start(id) {
    // PUT /server/active {action: "start"}
    this.serverService.update({ action: 'start', id }).subscribe((data: any) => {
      console.log(data);
      this.getServers();
    });
  }

  reload(id) {
    // PUT /server/active {action: "reload"}
    this.serverService.update({ action: 'reload', id }).subscribe((data: any) => {
      this.getServers();
    });
  }

  suspend(id) {
    // PUT /server/active {action: "suspend"}
    this.serverService.update({ action: 'suspend', id }).subscribe((data: any) => {
      this.getServers();
    });
  }

  delete(id) {
    // DELETE /server/active {id}
    this.serverService.delete(id).subscribe((data: any) => {
      this.getServers();
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(`http://${url}`);
  }
}
