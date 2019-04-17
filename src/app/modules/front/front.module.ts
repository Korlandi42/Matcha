import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FileUploadModule } from 'ng2-file-upload';

//directives
import { FileSelectDirective } from 'ng2-file-upload';

//main
import { FrontRoutingModule } from './front-routing.module';
import { FrontComponent } from './front.component';

//domains
import { HomeComponent } from './domains/home/home.component';
import { ProfileComponent } from './domains/profile/profile.component';
import { BrowseComponent } from './domains/browse/browse.component';

//components
import { TopNavigationComponent } from './components/top-navigation/top-navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/form/login/login.component';
import { RegisterComponent } from './components/form/register/register.component';
import { LogoutComponent } from './components/logout/logout.component';
import { EditProfileComponent } from './components/form/profile/edit/edit-profile.component';
import { ForgotPasswordComponent } from './components/form/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/form/reset-password/reset-password.component';

//dialogs
import { DialogProfileComponent } from './components/dialogs/profile/profile.component';
import { CreateComponent } from './components/form/profile/create/create.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { SearchComponent } from './components/search/search.component';
import { ProfileIdComponent } from './domains/profile-id/profile-id.component';
import { UploadComponent } from './components/upload/upload.component';
import { MessagesComponent } from './domains/messages/messages.component';
import { ProfilePictureComponent } from './components/form/profile/profile-picture/profile-picture.component';
import { NotificationsComponent } from './domains/notifications/notifications.component';
import { MatTabsModule } from '@angular/material';
import { Ng5SliderModule } from 'ng5-slider';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TopNavLoggedComponent } from './components/top-navigation/top-nav-logged/top-nav-logged.component';

@NgModule({
  imports: [
    CommonModule,
    FrontRoutingModule,
    MatTabsModule,
    InfiniteScrollModule,
    SharedModule,
    Ng5SliderModule,
  ],
  exports: [
    SharedModule,
  ],
  declarations: [
    FrontComponent,
    HomeComponent,
    TopNavigationComponent,
    FooterComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    BrowseComponent,
    LogoutComponent,
    EditProfileComponent,
    DialogProfileComponent,
    CreateComponent,
    CarouselComponent,
    FileSelectDirective,
    SearchComponent,
    ProfileIdComponent,
    UploadComponent,
    MessagesComponent,
    ProfilePictureComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NotificationsComponent,
    TopNavLoggedComponent,
  ],
  providers: [
  ],
  entryComponents: [
    ProfileIdComponent,
  ],
})
export class FrontModule { }
