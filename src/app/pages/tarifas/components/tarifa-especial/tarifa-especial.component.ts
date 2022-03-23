import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal, NgbDate, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Habitacion } from 'src/app/pages/habitaciones/_models/habitacion';
import { HabitacionesService } from 'src/app/pages/reportes/_services/habitaciones.service';
import {DateTime} from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { TarifasService } from '../../_services/tarifas.service';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { Tarifas } from '../../_models/tarifas';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
    {name:'Lun', value:'0', checked:false},
    {name:'Mar', value:'1', checked:false},
    {name:'Mie', value:'2', checked:false},
    {name:'Jue', value:'3', checked:false},
    {name:'Vie', value:'4', checked:false},
    {name:'Sab', value:'5', checked:false},
    {name:'Dom', value:'6', checked:false}
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

  /**Models & Arrays */
  codigoCuarto:Habitacion[]=[]
  tipodeCaurto:string;
  resultLocationCamas = []
  disponiblesIndexadosCamas:listaCamas[]=[]
  tarifaRackArr:any[]=[]
  tarifaRackArrOnly:Tarifas


  /**Variables */
  closeResult:string
  plan:string="No Aplica"
  camaFCVacio:boolean=false
  tarifaEspecialYVariantes:boolean=false
  descuentoTotalProCheckbox:boolean=false
  activa:boolean=true
  /**Subscription */
  subscription:Subscription[]=[]

  constructor(
    public modal:NgbActiveModal,
    public habitacionService:HabitacionesService,
    public fb:FormBuilder,
    public i18n: NgbDatepickerI18n,
    public parametrosService:ParametrosServiceService,
    public tarifasService:TarifasService,
    public modalService:NgbModal
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

  ngOnInit(): void {
    this.getTarifasRack();

    this.tarifaFormGroup = this.fb.group({
      nombre:['',Validators.required],
      tarifaRack:[0,Validators.required],
      minima:[1,Validators.required],
      maxima:[1,Validators.required],
      precio1:[0],
      precio2:[0],
      precio3:[0],
      precio4:[0],
      descuento:[]
      
    })
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
                  TarifaRack:value[e].TarifaRack,
                  Tarifa1Persona:value[e].Tarifa1Persona,
                  Tarifa2Persona:value[e].Tarifa2Persona,
                  Tarifa3Persona:value[e].Tarifa3Persona,
                  Tarifa4Persona:value[e].Tarifa4Persona,
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
    }else
    {
      this.descuentoTotalProCheckbox=false
    }
  }

  tarifaEspecial(event:MatCheckboxChange){
    if(event.checked){
      this.tarifaEspecialYVariantes=true
    }else
    {
      this.tarifaEspecialYVariantes=false
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

    let tarifa :Tarifas

    let fromDate = this.fromDate.day+"/"+this.fromDate.month+"/"+this.fromDate.year
    let toDate = this.toDate.day+"/"+this.toDate.month+"/"+this.toDate.year

    if(this.resultLocationCamas.length==0){
      this.camaFCVacio=true
      return
    }

    if(this.descuentoTotalProCheckbox==true){

      let tarifaRack

      for(let i=0;i<this.resultLocationCamas.length;i++){

        tarifaRack = this.tarifaRackArr.filter(filtro=>filtro.Habitacion==this.resultLocationCamas[i])
        const descuento = this.formControls['descuento'].value
        const tarifaConDesc = tarifaRack[i].TarifaRack-((descuento*tarifaRack[i].TarifaRack)/100)
        let habitacion = this.resultLocationCamas.filter(filtro=>filtro==this.resultLocationCamas[i])

        tarifa = {
          Tarifa:this.formControls['nombre'].value,
          Habitacion:habitacion,
          Llegada:fromDate,
          Salida:toDate,
          Plan:this.plan,
          Politicas: this.gratis!=true ? 'Gratis' : 'Ninguno' || this.sinRembolso!=true ? 'No Reembolsable' : 'Ninguno',
          EstanciaMinima:this.formControls['minima'].value,
          EstanciaMaxima:this.formControls['maxima'].value,
          Estado:true,
          TarifaRack:tarifaConDesc,
          Tarifa1Persona:tarifaConDesc,
          Tarifa2Persona:tarifaConDesc,
          Tarifa3Persona:tarifaConDesc,
          Tarifa4Persona:tarifaConDesc,
          Dias:this.options
        }

        this.tarifasService.postTarifaEspecial(tarifa).subscribe(
          (value)=>{
            if((i+1)==this.resultLocationCamas.length){
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
                this.modal.close()
                this.tarifasService.sendNotification(true)
            }
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

    }else {
      tarifa = {
        Tarifa:this.formControls['nombre'].value,
        Habitacion:this.resultLocationCamas,
        Llegada:fromDate,
        Salida:toDate,
        Plan:this.plan,
        Politicas: this.gratis!=true ? 'Gratis' : 'Ninguno' || this.sinRembolso!=true ? 'No Reembolsable' : 'Ninguno',
        EstanciaMinima:this.formControls['minima'].value,
        EstanciaMaxima:this.formControls['maxima'].value,
        Estado:true,
        TarifaRack:this.formControls['tarifaRack'].value,
        Tarifa1Persona:this.formControls['precio1'].value,
        Tarifa2Persona:this.formControls['precio2'].value,
        Tarifa3Persona:this.formControls['precio3'].value,
        Tarifa4Persona:this.formControls['precio4'].value,
        Dias:this.options

      }

      this.tarifasService.postTarifaEspecial(tarifa).subscribe(
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
            this.resultLocationCamas=[];
            this.formControls['minima'].patchValue(1)
            this.formControls['maxima'].patchValue(1)
            this.formControls['tarifaRack'].patchValue(1)
            this.formControls['precio1'].patchValue(0)
            this.formControls['precio2'].patchValue(0)
            this.formControls['precio3'].patchValue(0)
            this.formControls['precio4'].patchValue(0)
            this.camaFCVacio=false;
            this.tarifaFormGroup.reset();
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



