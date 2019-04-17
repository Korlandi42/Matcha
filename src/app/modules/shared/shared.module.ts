// Angular
import {NgModule} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ChipsComponent } from '../front/components/chips/chips.component';

// Default state
import {ForbiddenComponent} from './forbidden/forbidden.component';
import {MaintenanceComponent} from './maintenance/maintenance.component';
import {NotFoundComponent} from './not-found/not-found.component';

// Material
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatBadgeModule} from '@angular/material/badge';
import {MatDialogModule} from '@angular/material';
import {MatSnackBarModule} from '@angular/material';
import {MatSliderModule} from '@angular/material/slider';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';

// External Librairies
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

// Directives
import { HighlightDirective } from '../front/domains/messages/highlight.directive'

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  observer: true,
  direction: 'horizontal',
  threshold: 50,
  spaceBetween: 5,
  slidesPerView: 1,
  centeredSlides: true
};


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSidenavModule,
    MatCardModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    SwiperModule,
    MatSliderModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatListModule,
    MatSelectModule,
    ScrollingModule,
    MatBottomSheetModule,
    
  ],
  declarations: [
    ForbiddenComponent,
    MaintenanceComponent,
    NotFoundComponent,
    ChipsComponent,
    HighlightDirective,
  ],
  exports: [
    BrowserAnimationsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSidenavModule,
    MatCardModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    SwiperModule,
    MatSliderModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatListModule,
    HighlightDirective,
    MatSelectModule,
    ScrollingModule,
    MatBottomSheetModule,
  ],
  providers:[
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    }
  ]
})

export class SharedModule {
}
