import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontComponent } from './front.component';
import { HomeComponent } from './domains/home/home.component';
import { ProfileComponent } from './domains/profile/profile.component';
import { LoginComponent } from './components/form/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { RegisterComponent } from './components/form/register/register.component';
import { BrowseComponent } from './domains/browse/browse.component';
import { NotificationsComponent } from './domains/notifications/notifications.component';
import { AuthGuard } from './guards/auth-guard';
import { ProfileGuard } from '../../profile.guard';
import { EditProfileComponent } from './components/form/profile/edit/edit-profile.component';
import { ProfilePictureComponent } from './components/form/profile/profile-picture/profile-picture.component';
import { MessagesComponent } from './domains/messages/messages.component';
import { CreateComponent } from './components/form/profile/create/create.component';

import { ForgotPasswordComponent } from './components/form/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/form/reset-password/reset-password.component';


const routes: Routes = [
  {
    path: '',
    component: FrontComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        component: ProfileComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'browse',
        canActivate: [AuthGuard],
        component: BrowseComponent,
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        component: NotificationsComponent,
      },
      {
        path: 'messages',
        canActivate: [AuthGuard],
        component: MessagesComponent,
      },
      {
        path: 'logout',
        canActivate: [AuthGuard],
        component: LogoutComponent,
      },
      {
        path: 'profile/edit',
        canActivate: [AuthGuard],
        component: EditProfileComponent,
      },
      {
        path: 'profile/create',
        canActivate: [AuthGuard],
        component: CreateComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class FrontRoutingModule { }
