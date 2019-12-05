import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MatFormFieldModule,
  MatInputModule,
  MatDialogModule
} from '@angular/material';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UsersTableComponent } from './users/users-table/users-table.component';
import { UsersComponent } from './users/users.component';
import { UsersDetailComponent } from './users/users-detail/users-detail.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { FooterComponent } from './footer/footer.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ServersComponent } from './servers/servers.component';
import { ServersListComponent } from './servers/servers-list/servers-list.component';
import { ServersLogsComponent } from './servers/servers-logs/servers-logs.component';
import { DialogComponent } from './dialogs/dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';

const appRoutes: Routes = [{
  path: 'admin/dashboard',
  children: [
    {
      path: 'servers',
      component: ServersComponent,
      children: [
        {path: 'list', component: ServersListComponent},
        {path: 'logs/:id', component: ServersLogsComponent},
        {path: '', redirectTo: 'list', pathMatch: 'full'},
      ]
    },
    {
      path: 'users',
      component: UsersComponent,
      children: [
        {path: 'table', component: UsersTableComponent},
        {path: 'details/:uuid', component: UsersDetailComponent},
        {path: '', redirectTo: 'table', pathMatch: 'full'},
      ]
    },
    {path: 'home', component: HomeComponent},
    {path: 'settings', component: SettingsComponent},
    {path: '', redirectTo: '/admin/dashboard/home', pathMatch: 'full'}
  ]
}];

@NgModule({
  declarations: [
    AppComponent,
    UsersTableComponent,
    UsersDetailComponent,
    SideNavComponent,
    TopNavComponent,
    FooterComponent,
    UsersComponent,
    HomeComponent,
    SettingsComponent,
    ServersComponent,
    ServersListComponent,
    ServersLogsComponent,
    DialogComponent,
    ConfirmDialogComponent
  ],
  imports: [
    AngularFontAwesomeModule,
    RouterModule.forRoot(
      appRoutes,
    ),
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatListModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  entryComponents: [
    DialogComponent,
    ConfirmDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
