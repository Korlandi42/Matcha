import { Routes, RouterModule } from '@angular/router';
import {MaintenanceComponent} from './modules/shared/maintenance/maintenance.component';
import {ForbiddenComponent} from './modules/shared/forbidden/forbidden.component';
import {NotFoundComponent} from './modules/shared/not-found/not-found.component';
import {FrontComponent} from './modules/front/front.component';
import {DialogProfileComponent} from "./modules/front/components/dialogs/profile/profile.component";

const routes: Routes = [

  {
    path: '',
    component: FrontComponent
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  },
  {
    path: 'profile/:profile_id',
    component: DialogProfileComponent,
    outlet: 'dialog'
  }
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }

export const AppRoutingModule = RouterModule.forRoot(routes);
