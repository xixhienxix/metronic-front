import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from './modules/i18n/translation.service';
// language list
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as chLang } from './modules/i18n/vocabs/ch';
import { locale as esLang } from './modules/i18n/vocabs/es';
import { locale as jpLang } from './modules/i18n/vocabs/jp';
import { locale as deLang } from './modules/i18n/vocabs/de';
import { locale as frLang } from './modules/i18n/vocabs/fr';
import { SplashScreenService } from './_metronic/partials/layout/splash-screen/splash-screen.service';
import { Router, NavigationEnd, NavigationError, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableExtendedService } from './_metronic/shared/crud-table';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DivisasService } from './pages/parametros/_services/divisas.service';
import { ParametrosServiceService } from './pages/parametros/_services/parametros.service.service';
import { AuthService } from './modules/auth';
import { AuthModel } from './modules/auth/_models/auth.model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(

    private translationService: TranslationService,
    private splashScreenService: SplashScreenService,
    private router: Router,
    private tableService: TableExtendedService,
    private divisasService:DivisasService,
    private modalService:NgbModal,
    private parametrosService: ParametrosServiceService,
    private authService : AuthService
  ) {

    // register translations
    this.translationService.loadTranslations(
      enLang,
      chLang,
      esLang,
      jpLang,
      deLang,
      frLang
    );
  }


  ngOnInit() {

    if(localStorage.getItem("HOTEL")!=undefined){
      let nombreHotel = localStorage.getItem("HOTEL").replace(/\s/g, '')
      this.parametrosService.getParametros(nombreHotel).subscribe((value)=>{
      })
    }
    if(localStorage.getItem("USER")!=undefined){
      let userData = localStorage.getItem("USER")
      let userDataModel = JSON.parse(userData)
      this.authService.currentUserSubject.next(userDataModel)
    }

    this.divisasService.getcurrentDivisa
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // clear filtration paginations and others
        this.tableService.setDefaults();
        // hide splash screen
        this.splashScreenService.hide();
        //dismiss all modals
        this.modalService.dismissAll();
        // scroll to top on every route change
        window.scrollTo(0, 0);

        // to display back the body content
        setTimeout(() => {
          document.body.classList.add('page-loaded');
        }, 500);
      }
    });

     


    this.unsubscribe.push(routerSubscription);
  }
  


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
