import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(
    // To give data to modal
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {}
}
