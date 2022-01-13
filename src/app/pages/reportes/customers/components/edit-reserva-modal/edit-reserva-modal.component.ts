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
import { AlertsComponent } from '../../../../../main/alerts/alerts.component';
import { Edo_Cuenta_Service } from '../../../_services/edo_cuenta.service';
import { HistoricoService } from '../../../_services/historico.service';
import { AmaLlavesService } from '../../../_services/ama-llaves.service';
import { Ama_De_Llaves } from '../../../_models/ama-llaves';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import {DateTime} from 'luxon'
import { DisponibilidadService } from '../../../_services/disponibilidad.service';
import { Disponibilidad } from '../../../_models/disponibilidad.model';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import { edoCuenta } from '../../../_models/edoCuenta.model';
import { SaldoCuentaComponent } from './components/_helpers/saldo-cuenta/saldo-cuenta.component';



const DISPONIBILIDAD_DEFAULT:Disponibilidad ={
id:1,
Cuarto:'',
Habitacion:100,
Estatus:1,
Dia:1,
Mes:1,
Ano:2021,
Estatus_Ama_De_Llaves:'Limpia',
Folio_Huesped:0
}

const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:1,
  nombre: '',
  estatus:'',
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
  creada:'',
  tipoHuesped:"Regular",
  notas:'',
  vip:'',
  ID_Socio:0
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
  @ViewChild('email') emailModal: null;
  @ViewChild('spinner') spinnerModal: null;

  @Input()
        
  //form
  formGroup:FormGroup

    /** CheckOut*/
    diasDiferencia:number
    totalAlojamientoNuevo:number
    alojamiento_id:string
    nochesReales:number
    nochesTotales:number
    saldoPendiente:number

    //DATETIMEPICKER RANGE
    fullFechaSalida:string
    fullFechaLlegada:string
    hoveredDate: NgbDate | null = null;
    llegaHoy:Boolean;
    toDate: NgbDate | null;
    todayDate: DateTime | null;
    todayDateString: string;

    closeResult: string;

    id:number;
    folio:number;
    isLoading$;
    model:NgbDateStruct;
    huesped: Huesped;
    foliador:Foliador;
    folioLetra:string;
    public folios:Foliador[]=[];
    amaDeLlavesList:Ama_De_Llaves[]=[];
    amaDeLlaves:Ama_De_Llaves;
    public folioactualizado:any;

    mensaje_exito:string

    estatusArray:Estatus[]=[];

    disponibilidadEstatus:Disponibilidad=DISPONIBILIDAD_DEFAULT

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

    /*DOM*/
    colorAma:string='LIMPIA'
    cargando:boolean=true


    constructor(
      //Date Imports
      private modalService: NgbModal,
      public fb:FormBuilder,
      public amaDeLlavesService:AmaLlavesService,
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
      private historicoService : HistoricoService,
      public parametrosService:ParametrosServiceService,
      public disponibilidadService:DisponibilidadService,
      public divisasService : DivisasService
      ) {
        this.todayDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
        this.todayDateString = this.todayDate.day+'/'+this.todayDate.month+'/'+this.todayDate.year
      }



    ngOnInit(): void {
      this.divisasService.getcurrentDivisa
      this.isLoading$ = this.customersService.isLoading$;
      this.loadCustomer();
      this.getEstatus();
      this.getAmaDeLlaves();
      // this.getAmaDeLlavesByID();
      

      this.formGroup = this.fb.group({
        estatus : [this.customersService.getCurrentHuespedValue.estatus],
        ama:['']
      }) 

    }

    get getFormGroupValues (){
     return this.formGroup.controls
    }

    // async getPrice(currency: string): Promise<number> {
    //   const response = await this.http.get(this.currentPriceUrl).toPromise();
    //   return response.json().bpi[currency].rate;
    // }
    getAmaDeLlaves(){

      const sb = this.amaDeLlavesService.getAmaDeLlaves().subscribe(
        (value)=>{
          for(let i=0;i<value.length;i++)
          {
            this.amaDeLlavesList.push(value[i])
          }
          this.getAmaDeLlavesByID()
        },
        (error)=>{
          console.log(error)
        },
        ()=>{}
        )
        this.subscriptions.push(sb)
    }

    getAmaDeLlavesByID(){

      let habitacion=this.customerService.getCurrentHuespedValue.habitacion
      let numeroCuarto=this.customerService.getCurrentHuespedValue.numeroCuarto
      let diaDeHoy=DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona) 
       

      const sb = this.disponibilidadService.getEstatusAmaDeLlaves(diaDeHoy.day,diaDeHoy.month,diaDeHoy.year,numeroCuarto,habitacion).subscribe(
        (value)=>{
            this.disponibilidadEstatus=value[0]
            this.formGroup.get('ama').patchValue(this.disponibilidadEstatus.Estatus_Ama_De_Llaves)
            for(let i=0;i<this.amaDeLlavesList.length;i++){
              if(this.amaDeLlavesList[i].Descripcion==value[0].Estatus_Ama_De_Llaves)
              {
                this.colorAma=this.amaDeLlavesList[i].Color
              }
            }
            this.cargando=false
        },
        (error)=>{
          console.log(error)
        },
        ()=>{}
        )

        this.subscriptions.push(sb)
    }

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
     const sb = this.estatusService.getEstatus()
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

                          this.subscriptions.push(sb)

    }    
    
    

    loadCustomer() {

    if (!this.folio) {


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

          //REVISAR SI LLEGA HOY EL HUESPED

          let fechaDeLlegada =new Date(parseInt(this.huesped.llegada.split('/')[2]),parseInt(this.huesped.llegada.split('/')[1])-1,parseInt(this.huesped.llegada.split('/')[0])) 
          let diaHoy= new Date()

          var Difference_In_Time=fechaDeLlegada.getTime()-diaHoy.getTime()
          var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
          if(Difference_In_Days>=1){this.llegaHoy=true}

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

  // backgroundColorAmadeLlaves(estatus:string){
  //   let color;
  //   for (let i=0;i<this.amaDeLlavesList.length;i++)
  //   {
  //     if(estatus==this.amaDeLlavesList[i].Descripcion)
  //     {
  //       color = this.amaDeLlavesList[i].Color
  //     }
  //   }
  //   return color;
  // }

  openDialog(huesped:Huesped,estatus:string) {
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
    modalRef.componentInstance.estatus = estatus;

    modalRef.result.then((result) => {
      if(result=='Cancel')
      {
        this.formGroup.patchValue(
          {'estatus':this.customerService.getCurrentHuespedValue.estatus}
        );

        this.formGroup.controls['estatus'].setValue(this.customerService.getCurrentHuespedValue.estatus);
      }
    }, (reason) => {
    });
    }

    onChangeAma(estatus:string)
    {
      this.disponibilidadEstatus.Estatus_Ama_De_Llaves=estatus

     const sb = this.disponibilidadService.actualizaDisponibilidad(this.disponibilidadEstatus).subscribe(
        (value)=>{
          this.customerService.fetch();
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'Exito'
          modalRef.componentInstance.mensaje='Estatus de habitacion Actualizado'
        
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;

            });
            this.getAmaDeLlavesByID();
       },
        (error)=>{
            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader = 'Error'
            modalRef.componentInstance.mensaje='No se pudo Actualizar el Estatus de Ama de Llaves'
            modalRef.result.then((result) => {
              this.closeResult = `Closed with: ${result}`;
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  
              });
            
        })
        this.subscriptions.push(sb)
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
      let edoFiltrado : any
      let totalCargos
      let totalAbonos

      if(estatus==12||estatus==11||estatus==4){
         
        edoFiltrado = this.estadoDeCuentaService.currentCuentaValue.filter((result)=> result.Abono>1)
        
        console.log(edoFiltrado) 

        if(edoFiltrado.length<0)
        { 
          for(let i=0; i<edoFiltrado.length; i++)
          {
            totalCargos = totalCargos + edoFiltrado[i].Cargo
            totalAbonos = totalAbonos + edoFiltrado[i].Abono
          }
          if(totalAbonos<totalCargos)
          {
            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader = 'Advertencia'
            modalRef.componentInstance.mensaje='El huesped tiene saldo a Favor, aplique una devolucion antes de darle Check-Out'

            return

          }
          
        }
        this.isLoading=false
      }


          const sb = this.estatusService.actualizaEstatus(estatus,folio,this.huesped)
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
              
              const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
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

                const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
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
        this.subscriptions.push(sb)
    }

    checkOut(estatus:number,folio:number)
    {
      this.isLoading=true

      let diaSalida = this.huesped.salida.split('/')[0]
      let mesSalida = this.huesped.salida.split('/')[1]
      let anoSalida = this.huesped.salida.split('/')[2]

      let diaLlegada = this.huesped.llegada.split('/')[0]
      let mesLlegada = this.huesped.llegada.split('/')[1]
      let anoLlegada = this.huesped.llegada.split('/')[2]

      let fechaSalida:DateTime = DateTime.fromObject({year:anoSalida,month:mesSalida,day:diaSalida})
      let fechaLlegada:DateTime = DateTime.fromObject({year:anoLlegada,month:mesLlegada,day:diaLlegada})

      const nochesAlojadas:DateTime = this.todayDate.diff(fechaLlegada, ["days"])
            const nochesReservadas:DateTime = fechaSalida.diff(fechaLlegada, ["days"])
            
            this.nochesReales = Math.ceil(nochesAlojadas.days) 
            this.nochesTotales = Math.ceil(nochesReservadas.days)

            if(nochesAlojadas==0){this.nochesReales=1}

            this.totalAlojamientoNuevo = this.huesped.tarifa*this.nochesReales

            const cargosSinAlojamiento:edoCuenta[] = this.estadoDeCuentaService.currentCuentaValue.filter(cargos => cargos.Cargo > 0 && cargos.Descripcion !='Alojamiento');
            const abonos:edoCuenta[] = this.estadoDeCuentaService.currentCuentaValue.filter(abonos=> abonos.Abono>0)
            const alojamientoAnterior = this.estadoDeCuentaService.currentCuentaValue.filter(alojamiento => alojamiento.Descripcion =='Alojamiento' );
            this.alojamiento_id = alojamientoAnterior[0]._id

            const totalAbonos = abonos.reduce((previous,current)=>previous+current.Abono,0)
            const totalCargosSinAlojamiento = cargosSinAlojamiento.reduce((previous,current)=>previous+current.Cargo,0)

            this.saldoPendiente = (totalCargosSinAlojamiento+this.totalAlojamientoNuevo)-totalAbonos


      if(fechaSalida.startOf("day") >= this.todayDate.startOf("day") )
      {
        const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
        modalRef.componentInstance.alertHeader='Advertencia'
        modalRef.componentInstance.mensaje = 'La fecha de salida del húesped es posterior al dia de hoy, desea realizar un Check-Out anticipado?'
       
        modalRef.result.then((result) => {
        if(result=='Aceptar')
          {
            
            if(this.saldoPendiente==0)
            {   
              this.checkOutfunction()

            }else
            {
              this.isLoading=false

              const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef.componentInstance.alertHeader='Advertencia'
              modalRef.componentInstance.mensaje = 'Aun queda Saldo pendiente en la cuenta desea liquidar la cuenta?'
              modalRef.result.then((result) => {

                if(result=='Aceptar'){
                  this.saldarCuenta();
                }
                else{
                  this.closeResult = `Closed with: ${result}`;
                }
                }, (reason) => {
                    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                });
      
              }
            }
            if(result=='Close click')
            {
              this.isLoading=false
            }
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
              console.log((reason));
              this.isLoading=false
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
        
           

      }else 
      {
          if (this.huesped.pendiente==0)
          {
            const sb = this.estatusService.actualizaEstatus(estatus,folio,this.huesped)
              .subscribe(
                ()=>
                {
                  this.isLoading=false
                  const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
                  modalRef.componentInstance.alertHeader='EXITO'
                  modalRef.componentInstance.mensaje = 'Chek-Out Realizado con Exito '
                  
                    setTimeout(() => {
                      modalRef.close('Close click');
                    },4000)

                    this.postHistorico();

                this.customerService.fetch();
                this.modal.dismiss();

                },
                (err)=>{
                  this.isLoading=false

                  if(err)
                  {

                    const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
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
              this.subscriptions.push(sb)
          }else
          {
            this.isLoading=false

            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader='Advertencia'
            modalRef.componentInstance.mensaje = 'Aun queda Saldo pendiente en la cuenta desea liquidar la cuenta?'
            
            modalRef.result.then((result) => {
              if(result=='Aceptar'){
                this.saldarCuenta();
                modalRef.close();
              }
              else{
                this.closeResult = `Closed with: ${result}`;
              }
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              });
    
          }
        }
    }

    saldarCuenta(){
    
      const modalRef = this.modalService.open(SaldoCuentaComponent,{size:'sm' , backdrop:'static'})
      modalRef.componentInstance.folio=this.huesped.folio
      modalRef.componentInstance.saldoPendiente=this.saldoPendiente

      const sb = modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        //Recibir Data del Modal usando EventEmitter
        this.checkOutfunction();
        modalRef.close();
        })

      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

        this.subscriptions.push(sb)
    }

    checkOutfunction(){

      this.huesped.salida=this.todayDate.day+'/'+this.todayDate.month+'/'+this.todayDate.year
      this.huesped.pendiente=0
      this.huesped.porPagar=0
      this.huesped.noches=this.nochesReales
      
      const sb = this.estatusService.actualizaEstatus(4,this.huesped.folio,this.huesped).subscribe(
        ()=>
        {
          for(let i=1;i<=this.nochesTotales;i++){

            const fecha = this.todayDate.plus({days:i})
            let dispo:Disponibilidad

              if(i<=this.nochesReales){
                 dispo = {
                  Cuarto:this.huesped.habitacion,
                  Habitacion:this.huesped.numeroCuarto,
                  Estatus:1,
                  Dia:fecha.day,
                  Mes:fecha.month,
                  Ano:fecha.year,
                  Estatus_Ama_De_Llaves:'Revisar',
                  Folio_Huesped:this.huesped.folio
                }
              }else{
                 dispo = {
                  Cuarto:this.huesped.habitacion,
                  Habitacion:this.huesped.numeroCuarto,
                  Estatus:1,
                  Dia:fecha.day,
                  Mes:fecha.month,
                  Ano:fecha.year,
                  Estatus_Ama_De_Llaves:'Limpia',
                  Folio_Huesped:this.huesped.folio
                }
              }
           

           const sb = this.disponibilidadService.actualizaDisponibilidad(dispo).subscribe(
              (value)=>{
              },
              (error)=>{}
              )
              this.subscriptions.push(sb)
          }

          this.isLoading=false
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='EXITO'
          modalRef.componentInstance.mensaje = 'Chek-Out Realizado con Exito '
        
           const sb = this.estadoDeCuentaService.actualizaSaldo(this.alojamiento_id,this.totalAlojamientoNuevo).subscribe(
              (value)=>
              { 
                console.log(value)
                this.customerService.fetch();

              },
              (error)=>{  
                console.log(error)
               })

             this.modal.dismiss();
               this.subscriptions.push(sb)
               this.postHistorico();  

               setTimeout(() => {
                modalRef.close('Close click');
              },4000)
        },
        (err)=>
        {
          this.isLoading=false

          if(err)
          {

            const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
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
      this.subscriptions.push(sb)

    }


    postHistorico(){
      
      this.huesped.salida=this.todayDate.day+'/'+this.todayDate.month+'/'+this.todayDate.year
      this.huesped.pendiente=0
      this.huesped.porPagar=0
      this.huesped.noches=this.nochesReales
      this.isLoading=true

       const sb = this.historicoService.addPost(this.huesped).subscribe(
            (value)=>{
              console.log(value)
              this.isLoading=false

              const sb = this.customerService.deleteHuesped(this.huesped._id).subscribe(
                (value)=>{
                  
                },
                (error)=>{})
                this.subscriptions.push(sb)
            },
            (error)=>{
              if(error){
                const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
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
      this.subscriptions.push(sb);
    }

    openModifica(){
      const modalRef = this.modalService.open(ModificaHuespedComponent,{ size: 'md', backdrop:'static' })
      modalRef.componentInstance.huesped = this.huesped;

      modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {

        //Recibir Data del Modal usando EventEmitter
        this.huesped=receivedEntry;

        const ano = this.huesped.llegada.split("/")[2]
        const mes = this.huesped.llegada.split("/")[1]
        const dia = this.huesped.llegada.split("/")[0]

        const anoS = this.huesped.salida.split("/")[2]
        const mesS = this.huesped.salida.split("/")[1]
        const diaS = this.huesped.salida.split("/")[0]

        const fromDate = DateTime.fromObject({day:dia,month:mes,year:ano});


        if(fromDate.day==this.todayDate.day && fromDate.month==this.todayDate.month && fromDate.year==this.todayDate.year )
        {this.llegaHoy=false}
        else 
        {this.llegaHoy=true}

        this.customerService.fetch()
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
      const modalRef=this.modalService.open(this.emailModal,{ size: 'md', backdrop:'static' })
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
      const sb = this.emailService.enviarConfirmacion(this.huesped).subscribe(
        (result)=>{
          this.isLoading=false

          console.log(result)
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'EXITO'
          modalRef.componentInstance.mensaje = 'Email Enviado Con Exito'
          this.enviandoEmail=false
        },
        (err)=>{
          this.isLoading=false

          if(err){
            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader = 'ERROR'
            modalRef.componentInstance.mensaje = err.message
            this.enviandoEmail=false

          }
        },
        ()=>{
          this.enviandoEmail=false

        }
      )
      this.subscriptions.push(sb)
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
