import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/server.service';
import { ProvisionService } from 'src/app/provision.service';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'servers-list',
  templateUrl: './servers-list.component.html',
  styleUrls: ['./servers-list.component.css']
})
export class ServersListComponent implements OnInit {
  panelOpenState = true;
  activeServers;
  inactiveServers;

  constructor(
    private serverService: ServerService,
    private provisionService: ProvisionService,
    private dialog: MatDialog,
    ) {}

  ngOnInit() {
    this.getActiveServers();
    this.getInactiveServers();
  }

  getActiveServers() {
    this.serverService.getActiveServers().subscribe((data: any) => {
      this.activeServers = data;
    });
  }

  getInactiveServers() {
    this.serverService.getInactiveServers().subscribe((data: any) => {
      this.inactiveServers = data;
    });
  }

  startActiveServer(id) {
    // PUT /server/active {action: "start"}
    this.serverService.updateActiveServer({ action: 'start', id }).subscribe((data: any) => {
      console.log(data);
      this.getActiveServers();
    });
  }

  reloadActiveServer(id) {
    // PUT /server/active {action: "reload"}
    this.serverService.updateActiveServer({ action: 'reload', id }).subscribe((data: any) => {
      console.log(data);
      this.getActiveServers();
    });
  }

  suspendActiveServer(id) {
    // PUT /server/active {action: "suspend"}
    this.serverService.updateActiveServer({ action: 'suspend', id }).subscribe((data: any) => {
      console.log(data);
      this.getActiveServers();
    });
  }

  deleteActiveServer(id) {
    // DELETE /server/active {id}
    this.serverService.deleteActiveServer(id).subscribe((data: any) => {
      console.log(data);
      this.getActiveServers();
    });
  }

  provision({ host, port, url, name }) {
    // POST /provision {host, port, url, name}
    this.provisionService.provision({ host, port, url, name }).subscribe((data: any) => {
      console.log(data);
      this.getActiveServers();
      // this.getInactiveServers();
    });
  }

  provisionInactiveServer() {

  }

  deleteInactiveServer() {

  }

  openDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
