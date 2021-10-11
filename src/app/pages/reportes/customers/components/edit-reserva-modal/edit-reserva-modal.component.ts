import { Component, Input,  OnInit,ViewEncapsulation,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, EMPTY, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, first, tap } from 'rxjs/operators';
import { Huesped } from '../../../_models/customer.model';
import { Foliador } from '../../../_models/foliador.model';
import { Estatus } from '../../../_models/estatus.model';
import { HuespedService } from '../../../_services';
import { CustomAdapter, CustomDateParserFormatter } from '../../../../../_metronic/core';
import { ReportesComponent } from '../../../reportes.component'
import { HttpClient } from "@angular/common/http";
import { map} from 'rxjs/operators'
import { FoliosService} from '../../../_services/folios.service'
import { EstatusService} from '../../../_services/estatus.service'
import { ConfirmationModalComponent} from '../helpers/confirmation-modal/confirmation-modal/confirmation-modal.component'
import { NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';
import { AdicionalService } from 'src/app/pages/reportes/_services/adicional.service';
import { Adicional } from 'src/app/pages/reportes/_models/adicional.model';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ModificaHuespedComponent } from '../helpers/modifica-huesped/modifica-huesped.component';
import { TransaccionesComponentComponent } from './components/transacciones/transacciones-component/transacciones-component.component';
import { EmailService } from '../../../_services/email.service';
import { AlertsComponent } from '../helpers/alerts-component/alerts/alerts.component';
import { Edo_Cuenta_Service } from '../../../_services/edo_cuenta.service';
import { HistoricoService } from '../../../_services/historico.service';

const todayDate = new Date();
const todayString = todayDate.getUTCDate()+"/"+todayDate.getUTCMonth()+"/"+todayDate.getUTCFullYear()+"-"+todayDate.getUTCHours()+":"+todayDate.getUTCMinutes()+":"+todayDate.getUTCSeconds()

const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:1,
  nombre: '',
  estatus:'',
  // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:500,
  porPagar: 500,
  pendiente:500,
  origen: 'Online',
  habitacion: "",
  telefono:"",
  email:"",
  motivo:"",
  //OTROS DATOs
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'Español',
  numeroCuarto:0,
  creada:todayString,
  tipoHuesped:"Regular"
};




@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './edit-reserva-modal.component.html',
  styleUrls: ['./edit-reserva-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  styles:[`
  .form-group.hidden {
    width: 0;
    margin: 0;
    border: none;
    padding: 0;
  }
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  }
`],


  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})

export class EditReservaModalComponent implements OnInit {
  @ViewChild('error') errorModal: null;
  @ViewChild('exito') exitoModal: null;
  @ViewChild('email') emailModal: null;
  @ViewChild('spinner') spinnerModal: null;

  @Input()
        


    //DATETIMEPICKER RANGE
    fullFechaSalida:string
    fullFechaLlegada:string
    hoveredDate: NgbDate | null = null;

    toDate: NgbDate | null;

    closeResult: string;

    id:number;
    folio:number;
    isLoading$;
    model:NgbDateStruct;
    huesped: Huesped=EMPTY_CUSTOMER;
    foliador:Foliador;
    folioLetra:string;
    public folios:Foliador[]=[];
    public folioactualizado:any;

    mensaje_exito:string

    estatusArray:Estatus[]=[];
    checked: boolean = true;
    changeStyleVisible:string = ''
    setLabel:string="label label-lg label-light-primary label-inline"

    private subscriptions: Subscription[] = [];
    public listaFolios:Foliador[];

    /**LOADING */
    enviandoEmail:boolean=false;
    isLoading:boolean=false;

    /*Disabled*/
    reservaCancelada:boolean=false

    /*INDEXES*/
    selectedIndex:number

    constructor(
      //Date Imports
      private modalService: NgbModal,
      //
      public foliosService : FoliosService,
      public adicionalService : AdicionalService,
      private customersService: HuespedService,
      public modal: NgbActiveModal,
      public customerService: HuespedService,
      public postService : ReportesComponent,
      public estatusService : EstatusService,
      public i18n:NgbDatepickerI18n,
      private http: HttpClient,
      private emailService:EmailService,
      private estadoDeCuentaService:Edo_Cuenta_Service,
      private historicoService : HistoricoService
      ) {
      }



    ngOnInit(): void {
      this.isLoading$ = this.customersService.isLoading$;
      this.loadCustomer();
      this.getEstatus();
    
    }


    // async getPrice(currency: string): Promise<number> {
    //   const response = await this.http.get(this.currentPriceUrl).toPromise();
    //   return response.json().bpi[currency].rate;
    // }

    formatFechas()
    {
      const diaLlegada = parseInt(this.huesped.llegada.split("/")[0])
      const mesLlegada = parseInt(this.huesped.llegada.split("/")[1])
      const anoLlegada = parseInt(this.huesped.llegada.split("/")[2])
      const fechaLlegada = new Date(anoLlegada,mesLlegada,diaLlegada)
      this.fullFechaLlegada = fechaLlegada.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaLlegada.getUTCMonth()) + "/" + fechaLlegada.getFullYear().toString()

      const diaSalida = parseInt(this.huesped.salida.split("/")[0])
      const mesSalida = parseInt(this.huesped.salida.split("/")[1])
      const anoSalida = parseInt(this.huesped.salida.split("/")[2])
      const fechaSalida = new Date(anoSalida,mesSalida,diaSalida)
      this.fullFechaSalida = fechaSalida.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaSalida.getUTCMonth()) + "/" + fechaSalida.getFullYear().toString()
    }

    getEstatus(): void {
      this.estatusService.getEstatus()
                        .pipe(map(
                          (responseData)=>{
                            const postArray = []
                            for(const key in responseData)
                            {
                              if(responseData.hasOwnProperty(key))
                              postArray.push(responseData[key]);
                            }
                            return postArray
                          }))
                          .subscribe((estatus)=>{
                            for(let i=0;i<estatus.length;i++)
                            {
                              this.estatusArray=estatus
                            }
                          })

    }    
    
    

    loadCustomer() {

    if (!this.folio) {

        console.log("Load Costumer !this.folio", this.folio)

        this.huesped = EMPTY_CUSTOMER;
        // this.currentHuesped$.next(EMPTY_CUSTOMER)
        this.customersService.setCurrentHuespedValue=EMPTY_CUSTOMER
        // this.huesped.nombre=this.huesped.nombre;
        this.huesped.folio=this.folio;
        this.huesped.origen = "Online";
        // this.loadForm();
      }
       else {

        const sb = this.customersService.getItemById(this.folio).pipe(
          first(),
          catchError((errorMessage) => {
            console.log("ERROR MESSAGE PIPE DESPUES DEL GETELEMETN BY ID",errorMessage)
            this.modal.dismiss(errorMessage);
            return of(EMPTY_CUSTOMER);
          })
        ).subscribe((huesped1: Huesped) => {
          this.huesped = huesped1;

          this.customersService.setCurrentHuespedValue=huesped1
          
          // this.loadForm();
          this.formatFechas();
        });
        this.subscriptions.push(sb);
      }
    }




    ngOnDestroy(): void {
      this.subscriptions.forEach(sb => sb.unsubscribe());
    }

    

    setEstatus(value): void {

      for (let i=0;i<this.estatusArray.length;i++)
      {
        if(value==this.estatusArray[i].id)
        {
          this.huesped.estatus = this.estatusArray[i].estatus
          this.setLabel= this.estatusArray[i].color
        }
      }
  }

  backgroundColor(estatus:string)
  {
    let color;

    for (let i=0;i<this.estatusArray.length;i++)
    {
      if(estatus==this.estatusArray[i].estatus)
      {
        color = this.estatusArray[i].color
      }
    }
    return color;
  }

  openDialog(huesped:Huesped) {
    const modalRef = this.modalService.open(ConfirmationModalComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        // keyboard: false,
        // backdrop: 'static'
        // backdrop: If `true`, the backdrop element will be created for a given modal. Alternatively, specify `’static’` for a backdrop that doesn’t close the modal on click. The default value is `true`.
        // beforeDismiss: Callback right before the modal will be dismissed.
        // centered: If `true`, the modal will be centered vertically. The default value is `false`.
        // container: A selector specifying the element all-new modal windows should be appended to. If not specified, it will be `body`.
        // keyboard: If `true`, the modal will be closed when the `Escape` key is pressed. The default value is `true`.
        // scrollable: Scrollable modal content (false by default).
        // size: Size of a new modal window. ‘sm’ | ‘lg’ | ‘xl’ | string;
        // windowClass: A custom class to append to the modal window.
        // backdropClass: A custom class to append to the modal backdrop.
        // Using componetInstance we can pass data object to modal contents.
      });
  
  
    modalRef.componentInstance.huesped = huesped;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
    });
    }
  

    onSelectHuesped(event : string)
    {
      console.log(event);
      this.huesped.nombre=event;

    }

    closeModal(){
      this.modal.close();
    }
    
//Butons


    confirmaReserva(estatus,folio)
    {
      this.isLoading=true

      if(estatus==12||estatus==11||estatus==4){
        if(this.estadoDeCuentaService.currentCuentaValue.filter((result)=> result.Abono>0)    ){
          const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje='El huesped tiene saldo a Favor, aplique una devolucion antes de darle Check-Out'
        }
        this.isLoading=false
        return
      }


          this.estatusService.actualizaEstatus(estatus,folio)
          .subscribe(
            ()=>
            {
              this.isLoading=false

              if(estatus==3){this.mensaje_exito="Reservacion Confirmada"}
              if(estatus==2){this.mensaje_exito="Reservacion Realizada con Exito"}
              if(estatus==1){this.mensaje_exito="Check-In realizado con exito"}
              if(estatus==4){this.mensaje_exito="Check-Out realizado con exito"}
              if(estatus==11){this.mensaje_exito="No-Show, para reactivar la reservacion haga click en el boton en la parte inferior"}
              if(estatus==12){this.mensaje_exito="Reservacion Cancelada con exito"}
              
              const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
              modalRef.componentInstance.alertHeader='EXITO'
              modalRef.componentInstance.mensaje=this.mensaje_exito
              modalRef.result.then((result) => {
              
                this.closeResult = `Closed with: ${result}`;
                }, (reason) => {
                    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                });
                setTimeout(() => {
                  modalRef.close('Close click');
                },4000)

                this.customerService.fetch();
                this.closeModal()

            },
            (err)=>{
              if(err){

                this.isLoading=false

                const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
                modalRef.componentInstance.alertHeader='ERROR'
                modalRef.componentInstance.mensaje='Ocurrio un Error al actualizar el estatus, vuelve a intentarlo'
                modalRef.result.then((result) => {
                  this.closeResult = `Closed with: ${result}`;
                  }, (reason) => {
                      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                  });
                  setTimeout(() => {
                    modalRef.close('Close click');
                  },4000)
                    }
            },
            ()=>{
      
            
            }
          )
        
    }

    checkOut(estatus:number,folio:number)
    {
      this.isLoading=true

      if (this.huesped.pendiente==0)
      {
        this.estatusService.actualizaEstatus(estatus,folio)
          .subscribe(
            ()=>
            {
              this.isLoading=false
              const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
              modalRef.componentInstance.alertHeader='EXITO'
              modalRef.componentInstance.mensaje = 'Chek-Out Realizado con Exito '
              
                setTimeout(() => {
                  modalRef.close('Close click');
                },4000)

                this.postHistorico(this.huesped.folio);

            this.customerService.fetch();

            },
            (err)=>{
              this.isLoading=false

              if(err)
              {

                const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
                modalRef.componentInstance.alertHeader='ERROR'
                modalRef.componentInstance.mensaje = 'Ocurrio un Error al momento del Check-out intente de nuevo mas tarde'
               
                  setTimeout(() => {
                    modalRef.close('Close click');
                  },4000)
                    }
                    this.isLoading=false
            },
            ()=>{

          });

      }else
      {
        this.isLoading=false

        const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
        modalRef.componentInstance.alertHeader='ERROR'
        modalRef.componentInstance.mensaje = 'Aun queda Saldo pendiente en el húesped '
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
      }
    }

    postHistorico(folio:number){
      this.isLoading=true

      const sb = this.customersService.getItemById(this.folio).pipe(
        first(),
        catchError((errorMessage) => {
          console.log("ERROR MESSAGE PIPE DESPUES DEL GETELEMETN BY ID",errorMessage)
          this.modal.dismiss(errorMessage);
          return of(EMPTY_CUSTOMER);
        })
      ).subscribe((huesped1: Huesped) => {
          this.historicoService.addPost(huesped1).subscribe(
            (value)=>{
              console.log(value)
              this.isLoading=false

            },
            (error)=>{
              if(error){
                const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
                modalRef.componentInstance.alertHeader='ERROR'
                modalRef.componentInstance.mensaje = 'Ocurrio un Error al momento de Guardar al huesped en el historico'
                setTimeout(() => {
                  modalRef.close('Close click');
                },4000)
              }
              this.isLoading=false
            }
            )

        // this.loadForm();
        this.formatFechas();
      });
      this.subscriptions.push(sb);
    }

    openModifica(){
      const modalRef = this.modalService.open(ModificaHuespedComponent,{size:'md'})
      modalRef.componentInstance.huesped = this.huesped;

      modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        //Recibir Data del Modal usando EventEmitter
        console.log("EventEmmiter: ",receivedEntry);
        this.huesped=receivedEntry;
        })
        //Recibir Data del Modal usando modal.close(data)
        modalRef.result.then((result) => {
          if (result) {
          this.huesped=result
            this.formatFechas();
          console.log("modal.close():", result);
          }
          });

      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    openEnviarConfirmacion(){
      const modalRef=this.modalService.open(this.emailModal,{size:'md'})
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    enviarConfirmacion(emailSender:string){
      this.isLoading=true
      this.huesped.email=emailSender
      this.enviandoEmail=true
      this.emailService.enviarConfirmacion(this.huesped).subscribe(
        (result)=>{
          this.isLoading=false

          console.log(result)
          const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
          modalRef.componentInstance.alertHeader = 'EXITO'
          modalRef.componentInstance.mensaje = 'Email Enviado Con Exito'
          this.enviandoEmail=false
        },
        (err)=>{
          this.isLoading=false

          if(err){
            const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
            modalRef.componentInstance.alertHeader = 'ERROR'
            modalRef.componentInstance.mensaje = err.message
            this.enviandoEmail=false

          }
        },
        ()=>{
          this.enviandoEmail=false

        }
      )
    }

    setStep(index:number){
      this.selectedIndex=index;
    }

    getDismissReason(reason: any): string 
    {
          if (reason === ModalDismissReasons.ESC) {
              return 'by pressing ESC';
          } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
              return 'by clicking on a backdrop';
          } else {
              return  `with: ${reason}`;
          }
    }
  }