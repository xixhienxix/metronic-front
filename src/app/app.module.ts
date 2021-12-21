import { NgModule, APP_INITIALIZER,LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/_services/auth.service';
import { environment } from 'src/environments/environment';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting

// Highlight JS
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { SplashScreenModule } from './_metronic/partials/layout/splash-screen/splash-screen.module';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
// #fake-end#
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// // import {MatExpansionModule} from '@angular/material/expansion';
// import {MatIconModule} from '@angular/material/icon';
// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import {MatButtonModule} from '@angular/material/button';
// import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ClickOutsideDirective } from './pages/directives/click-outside.directive';
import { DialogComponent } from './pages/reportes/customers/components/nueva-reserva-modal/components/dialog/dialog.component';
//Locale i18n
import localeEs from '@angular/common/locales/es-MX';
import { registerLocaleData } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { SaldarCuentaComponent } from './app/pages/reportes/customers/components/edit-reserva-modal/components/_helpers/saldar-cuenta/saldar-cuenta.component';


function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}

registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [AppComponent,ClickOutsideDirective, DialogComponent, SaldarCuentaComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SplashScreenModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    HighlightModule,
    ClipboardModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,
    SharedModule,
    MatProgressBarModule,
    // MatTabsModule,
    // MatCheckboxModule,
    // MatExpansionModule,
    // MatIconModule,
    // MatDatepickerModule,
    // MatFormFieldModule,
    // MatButtonModule,


        // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          xml: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          scss: () => import('highlight.js/lib/languages/scss'),
          json: () => import('highlight.js/lib/languages/json')
        },
      },
    },
    {
      provide: LOCALE_ID, useValue: 'es-Mx',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
