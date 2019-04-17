import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SharedModule } from './modules/shared/shared.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './helpers/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FrontModule} from './modules/front/front.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AuthenticationService } from "./services/authentication.service";

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    FrontModule,
    SocketIoModule.forRoot(config)
  ],
  exports: [

  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
