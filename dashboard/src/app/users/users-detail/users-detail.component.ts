import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '../../users.service';

import { cloneDeep, isEqual } from 'lodash';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'users-detail',
  templateUrl: './users-detail.component.html',
  styleUrls: ['./users-detail.component.css']
})
export class UsersDetailComponent implements OnInit {
  public user;
  public tempUser;
  public isEditing: boolean = false;
  public hasEdits: boolean = false;
  private uuid: string;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    // this.uuid = this.route.snapshot.paramMap.get('uuid');

    // this.userService.getUser(this.uuid).subscribe((data) => {
    //   this.user = data
    //   this.tempUser = cloneDeep(this.user);
    // });
  }

  edit() {
    this.isEditing = !this.isEditing;
  }

  save() {
    this.userService.getUser(this.uuid).subscribe((data) => {
      this.user = data
      this.tempUser = cloneDeep(this.user);
      this.checkEdits();
      this.isEditing = false;

      const snackBarRef = this.snackBar.open('Changes Saved', 'Undo', {
        duration: 1.5 * 1000,
      });
    });
  }

  abandon() {
    this.tempUser = cloneDeep(this.user);
    this.checkEdits();
  }

  onKey(event: any) {
    this.checkEdits();
  }

  checkEdits() {
    this.hasEdits = isEqual(this.user, this.tempUser)
    ? false
    : true;
  }
}
