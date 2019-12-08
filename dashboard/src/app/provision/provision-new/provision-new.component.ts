import { Component, OnInit } from '@angular/core';
import { ProvisionService } from 'src/app/provision.service';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'provision-new',
  templateUrl: './provision-new.component.html',
  styleUrls: ['./provision-new.component.css']
})
export class ProvisionNewComponent implements OnInit {
  panelOpenState = true;
  options = {
    host: null,
    port: null,
    url: null,
  };

  constructor(
    private provisionService: ProvisionService,
    private dialog: MatDialog,
    ) {}

  ngOnInit() {

  }

  provision({ host, port, url }) {
    // POST /provision {host, port, url }
    this.provisionService.provision({ host, port, url }).subscribe((data: any) => {
      console.log(`Provisioning instance from ${url} at ${host}:${port}`);
      console.log({data});
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.provision(this.options);
      }
    });
  }
}
