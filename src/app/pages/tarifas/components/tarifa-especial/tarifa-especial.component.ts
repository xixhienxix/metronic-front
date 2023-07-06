import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal, NgbDate, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Habitacion } from 'src/app/pages/habitaciones/_models/habitacion';
import {DateTime} from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { TarifasService } from '../../_services/tarifas.service';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { Tarifas } from '../../_models/tarifas';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { HabitacionesService } from 'src/app/pages/habitaciones/_services/habitaciones.service';
import { OverlayContainer } from '@angular/cdk/overlay';

type listaCamas = {key:number;value:string;}

@Component({
  selector: 'app-tarifa-especial',
  templateUrl: './tarifa-especial.component.html',
  styleUrls: ['./tarifa-especial.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TarifaEspecialComponent implements OnInit {

  /**CheckBoxes */
  options = [
    {name:'Lun', value:0, checked:false},
    {name:'Mar', value:1, checked:false},
    {name:'Mie', value:2, checked:false},
    {name:'Jue', value:3, checked:false},
    {name:'Vie', value:4, checked:false},
    {name:'Sab', value:5, checked:false},
    {name:'Dom', value:6, checked:false}
  ]
  gratis:boolean=false
  sinRembolso:boolean=false

  /**DATES */
  today: DateTime | null;
  fromDate: DateTime;
  fechaInicial:string
  comparadorInicial:Date
  tomorrow: DateTime | null;
  toDate: DateTime;
  fechaFinal:string
  comparadorFinal:Date
  
  /**FormGroup */
  tarifaFormGroup:FormGroup
  camasFC = new FormControl();
  precios = new FormArray([]);
  preciosNinos = new FormArray([]);
  preciosFormGroup:FormGroup;

  /**Models & Arrays */
  codigoCuarto:Habitacion[]=[]
  tipodeCaurto:string;
  resultLocationCamas = []
  disponiblesIndexadosCamas:listaCamas[]=[]
  tarifaRackArr:any[]=[]
  tarifaRackArrOnly:Tarifas
  cuartosArray:Habitacion[]=[]
  numbers:any
  numbersNinos:any
  tarifas = []

  /**Variables */
  closeResult:string
  plan:string="No Aplica"
  camaFCVacio:boolean=false
  tarifaEspecialYVariantes:boolean=false
  descuentoTotalProCheckbox:boolean=false
  activa:boolean=true
  maximoDePersonas:number
  maximoDeNinos:number;
  descuentoNoAplicado=false
  adultos:number=1;
  ninos:number=0
  dehabilitaButtons:boolean=false


  /**Subscription */
  subscription:Subscription[]=[]

  constructor(
    public modal:NgbActiveModal,
    public habitacionService:HabitacionesService,
    public fb:FormBuilder,
    public i18n: NgbDatepickerI18n,
    public parametrosService:ParametrosServiceService,
    public tarifasService:TarifasService,
    public modalService:NgbModal,
    private overlayContainer: OverlayContainer
  ) {
    this.fromDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
    this.toDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
    this.toDate = this.toDate.plus({ days: 1 });
    this.fechaInicial=this.fromDate.day+" de "+this.i18n.getMonthFullName(this.fromDate.month)+" del "+this.fromDate.year
    this.fechaFinal=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year
   }

  /**Getters */
  /**Getters */
  get formControls (){
    return this.tarifaFormGroup.controls
  }

  get tipoCuarto() 
  { 
    return this.tarifaFormGroup.get('tipoCuarto') 
  }

  get selectedOptions() { // right now: ['1','3']
    return this.options
              .filter(opt => opt.checked)
              .map(opt => opt.value)
  }

  get preciosControls (){
    return this.preciosFormGroup.controls
  }

  ngOnInit(): void {
    this.getTarifasRack();

    this.tarifaFormGroup = this.fb.group({
      nombre:['',Validators.required],
      minima:[1,Validators.required],
      maxima:[0,Validators.required],
      estado:[true,Validators.required]
    })
    this.preciosFormGroup = this.fb.group({
      tarifaRack:[0,Validators.required],
      descuento:[0],
      precios: this.fb.array([]),
      preciosNinos: this.fb.array([]),
      adultos:[1,Validators.required],
      ninos:[0,Validators.required],
    })

    const adultos = this.tarifaFormGroup.value.adultos
    const ninos = this.tarifaFormGroup.value.ninos



    this.preciosFormGroup.controls['descuento'].valueChanges.subscribe(value => {
      this.descuentoNoAplicado=true
    });

    this.getHabitaciones();
    this.getCodigosCuarto();
  }



  getTarifasRack(){
    this.tarifaRackArr=[]
    this.tarifasService.getTarifaRack().subscribe(
      (value)=>{
        this.tarifaRackArr=[]
        if(value){
          for(let e=0;e<value.length;e++){
            for(let i=0;i<value[e].Habitacion.length;i++){
              let tarifario = {
                  Tarifa:value[e].Tarifa,
                  Habitacion:value[e].Habitacion[i],
                  Llegada:value[e].Llegada,
                  Salida:value[e].Salida,
                  Plan:value[e].Plan,
                  Politicas:value[e].Politicas,
                  EstanciaMinima:value[e].EstanciaMinima,
                  EstanciaMaxima:value[e].EstanciaMaxima,
                  Adultos:value[e].Adultos,
                  Ninos:value[e].Ninos,
                  TarifaRack:value[e].TarifaRack,
                  TarifaXAdulto:value[e].TarifaXAdulto,
                  TarifaXNino:value[e].TarifaXNino,
                  Dias:value[e].Dias,
                  Estado:value[e].Estado==true ? 'Activa' : 'No Activa'
              }
              this.tarifaRackArr.push(tarifario)
          }
        
          }
        }

      },
      (error)=>{

      })
  }

  preventCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.add('disable-backdrop-click');
  }

  allowCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.remove('disable-backdrop-click');
  }

  getHabitaciones(){
    const sb = this.habitacionService.getAll().subscribe(
      (res)=>{
        this.cuartosArray=res
      },
      (error)=>{

      })
  }

  aplicaDescuento(){
    this.dehabilitaButtons=true
    this.preciosControls.tarifaRack.patchValue(this.preciosControls.tarifaRack.value-(this.preciosControls.tarifaRack.value*this.preciosControls.descuento.value/100))
    
    let preciosConDesc = []
    let preciosConDescNinos = []

    for(let i=0;i<this.precios.value.length;i++){
      preciosConDesc.push(this.precios.value[i]-(this.precios.value[i]*this.preciosControls.descuento.value/100))
    }
    this.precios.patchValue(preciosConDesc)

    for(let i=0;i<this.preciosNinos.value.length;i++){
      preciosConDescNinos.push(this.preciosNinos.value[i]-(this.preciosNinos.value[i]*this.preciosControls.descuento.value/100))
    }
    this.preciosNinos.patchValue(preciosConDescNinos)

    this.descuentoNoAplicado=false


  }

  planSeleccionado(event:any){
    this.plan=event.value
  }

  //Date Helpers
  getCodigosCuarto()
  {
    this.codigoCuarto=[]
    const sb = this.habitacionService.getCodigohabitaciones()
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
      .subscribe((codigoCuarto)=>{
        this.codigoCuarto=(codigoCuarto)
        for(let i=0;i<codigoCuarto.length;i++){
          this.disponiblesIndexadosCamas.push({key:i,value:codigoCuarto[i]})
        }
      })
      this.subscription.push(sb)
  }



  fechaSeleccionadaInicial(event:NgbDate){

    this.fromDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})
  
    this.comparadorInicial = new Date(event.year,event.month-1,event.day)
  
    this.fechaInicial= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  }

  fechaSeleccionadaFinal(event:NgbDate){

    this.toDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})

    this.comparadorFinal = new Date(event.year,event.month-1,event.day)

    this.fechaFinal= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  }
  
  descuentoTotalProc(event:MatCheckboxChange){

    if(event.checked){
      this.descuentoTotalProCheckbox=true
      this.descuentoNoAplicado=true
    }else
    {
      this.descuentoTotalProCheckbox=false
      this.descuentoNoAplicado=false

    }
  }

  selectionChange(){
    let tarifaRack

    if(this.resultLocationCamas.length ==1){

      tarifaRack = this.tarifaRackArr.filter(filtro=>filtro.Habitacion==this.resultLocationCamas[0])

      this.preciosControls.tarifaRack.patchValue(tarifaRack[0].TarifaRack)
    }
  }

  tarifaEspecial(event:MatCheckboxChange){
    if(!event.checked){
      this.precios.clear();
      this.preciosNinos.clear();
    }else{

      var cuartosFiltrados:Habitacion[]=[];
      let filtro
  
      for(let j=0;j<this.resultLocationCamas.length;j++){
  
         filtro = this.cuartosArray.find(object => {
          return object.Codigo == this.resultLocationCamas[j];
        });
        
        cuartosFiltrados.push(filtro)

      }
  
      if(cuartosFiltrados.length==0){
        this.maximoDePersonas=cuartosFiltrados[0].Adultos
        this.maximoDeNinos=cuartosFiltrados[0].Ninos
      }else{
        this.maximoDePersonas= Math.max(...cuartosFiltrados.map(o => o.Adultos))
        this.maximoDeNinos= Math.max(...cuartosFiltrados.map(o => o.Ninos))

      }
      this.numbers = Array(this.maximoDePersonas);
      this.numbers = this.numbers.fill().map((x,i)=>i)

      this.numbersNinos = Array(this.maximoDeNinos);
      this.numbersNinos = this.numbersNinos.fill().map((x,i)=>i)
  
      for(let e=1; e<this.numbers.length;e++){
        this.precios.push(new FormControl(0));
      }

      for(let e=1; e<this.numbersNinos.length;e++){
        this.preciosNinos.push(new FormControl(0));
      }
  
      if(event.checked){
        this.tarifaEspecialYVariantes=true
      }else
      {
        this.tarifaEspecialYVariantes=false
      }
  
    }

  }

  setPoliticas(politicas:string){
    if(politicas=='Gratis'){
      this.gratis=true
    }else {
      this.sinRembolso=true

    }
  }

  camasValue(selected:any){
    this.resultLocationCamas = this.resultLocationCamas.filter((option) => {
      return option !== selected;
    });
  
  }

  getOption(option:any,event:MatCheckboxChange){
    if(event.checked==true){
        for(let i=0; i<this.options.length;i++){
         if(this.options[i].name==option.name){
          this.options[i].checked=true
         }
        }
    }
    
  }

  

  onSubmit(){
    if(this.tarifaFormGroup.invalid || this.preciosFormGroup.invalid ){
      const modalRef =  this.modalService.open(AlertsComponent,{size:'sm',backdrop:'static'})
      modalRef.componentInstance.alertHeader = 'Advertencia'
      modalRef.componentInstance.mensaje='Faltan Datos por Capturar'          
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

    }else{

    
    let fromDate = this.fromDate.day+"/"+this.fromDate.month+"/"+this.fromDate.year
    let toDate = this.toDate.day+"/"+this.toDate.month+"/"+this.toDate.year


    if(this.resultLocationCamas.length==0){
      this.camaFCVacio=true
      return
    }

    let tarifa :Tarifas= {
      Tarifa:this.formControls["nombre"].value,
      Habitacion:this.resultLocationCamas,
      Llegada:fromDate,
      Salida:toDate,
      Plan:this.plan,
      Adultos:this.preciosFormGroup.value.adultos,
      Ninos:this.preciosFormGroup.value.ninos,
      Politicas: this.gratis!=true ? 'Gratis' : 'Ninguno' || this.sinRembolso!=true ? 'No Reembolsable' : 'Ninguno',
      EstanciaMinima:this.formControls['minima'].value,
      EstanciaMaxima:this.formControls['maxima'].value,
      Estado:true,
      TarifaRack:this.preciosControls['tarifaRack'].value,
      TarifaXAdulto:this.precios.value,
      TarifaXNino:this.preciosNinos.value,
      Dias:this.options,
      Descuento:this.preciosControls['descuento'].value
    }

    this.tarifasService.postTarifa(tarifa).subscribe(
      (value)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Tarifa(s) Generada(s) con éxito'          
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.tarifasService.sendNotification(true)
          this.modal.close();
          
      },
      (error)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje='No se pudo guardar la tarifa intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
      })
    }
 
  }

  
  closeModal(){
    this.modal.close();
  }

  /*FORM HELPERS*/
  isControlValid(controlName: string): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
      const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);
  
      return invalidCtrl || invalidParent;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
  }

}



