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
    repository: null,
    instances: null,
    maxMemoryUsage: null,
    activeURL: null
  };

  constructor(
    private provisionService: ProvisionService,
    private dialog: MatDialog,
    ) {}

  ngOnInit() {

  }

  provision(options) {
    this.provisionService.provision(options).subscribe((data: any) => {
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
