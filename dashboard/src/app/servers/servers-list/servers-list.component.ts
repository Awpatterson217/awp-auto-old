import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/server.service';
import { ProvisionService } from 'src/app/provision.service';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';

const servers = [{
  id: 'server1',
  status: 'active',
  repository: "https://gerrit.fischerinternational.com/admin/repos"
},{
  id: 'server2',
  status: 'active',
  repository: "https://gerrit.fischerinternational.com/admin/repos"
},{
  id: 'server3',
  status: 'suspended',
  repository: "https://gerrit.fischerinternational.com/admin/repos"
},{
  id: 'server4',
  status: 'active',
  repository: "https://gerrit.fischerinternational.com/admin/repos"
},{
  id: 'server5',
  status: 'errored',
  repository: "https://gerrit.fischerinternational.com/admin/repos"
}];

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
    private provisionService: ProvisionService,
    private dialog: MatDialog,
    ) {}

  ngOnInit() {
    // this.servers = servers;
    this.getServers();
  }

  getServers() {
    this.serverService.getServers().subscribe((data: any) => {
      this.servers = data;
    });
  }

  provision({ host, port, url, name }) {
    // POST /provision {host, port, url, name}
    this.provisionService.provision({ host, port, url, name }).subscribe((data: any) => {
      console.log(data);
      this.getServers();
    });
  }

  start(id) {
    // PUT /provision {action: "start"}
    this.provisionService.put({ action: 'start', id }).subscribe((data: any) => {
      console.log(data);
      this.getServers();
    });
  }

  reload(id) {
    // PUT /provision {action: "reload"}
    this.provisionService.put({ action: 'reload', id }).subscribe((data: any) => {
      console.log(data);
      this.getServers();
    });
  }

  suspend(id) {
    // PUT /provision {action: "suspend"}
    this.provisionService.put({ action: 'suspend', id }).subscribe((data: any) => {
      console.log(data);
      this.getServers();
    });
  }

  remove(id) {
    // DELETE /provision {id}
    this.provisionService.delete(id).subscribe((data: any) => {
      console.log(data);
      this.getServers();
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
