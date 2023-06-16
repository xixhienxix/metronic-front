import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { Adicional } from '../../_models/adicionales';
import { Amenidades } from '../../_models/amenidades';
import { Habitacion } from '../../_models/habitacion';
import { Tipos_Habitacion } from '../../_models/tipos';
import { HabitacionesService } from '../../_services/habitaciones.service';
import { TiposService } from '../../_services/tipos.service';
import { NoWhiteSpacesValidator } from '../../_validators/nonwhitespaces.validator/nonwhitespaces.validator.component';
import { DateTime } from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { Tarifas } from 'src/app/pages/reportes/_models/tarifas';
import { TarifasService } from 'src/app/pages/tarifas/_services/tarifas.service';
import { Disponibilidad } from 'src/app/pages/reportes/_models/disponibilidad.model';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage'
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database'
import { finalize, map } from 'rxjs/operators';
import { FileUploadService } from '../../_services/file.upload.service'
import { UploadFormComponent } from '../helpers/uploads/upload-form.component';

type listaAmenidades = {key:number;value:string}
type listaCamas = {key:number;value:string;cantidad:number}

export class FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;

  constructor(file: File) {
    this.file = file;
  }
}

@Component({
  selector: 'app-alta-habitacion',
  templateUrl: './alta-habitacion.component.html',
  styleUrls: ['./alta-habitacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AltaHabitacionComponent implements OnInit {

  @ViewChild('itemSelect') public itemSelect: MatSelect;
  @ViewChild('matOption') public matOption: MatOption;
  /**Modal */
  closeResult:string
  habitacion:Habitacion;

  /**FormControl */
  formGroup:FormGroup
  amenidadesFC = new FormControl();
  camasFC = new FormControl();
  serviciosAdicionales=new FormControl();
  inputForm:FormGroup;

  /*MODELS*/
  tiposArr:Tipos_Habitacion[]=[]
  amenidadesArr:Amenidades[]=[]
  disponiblesIndexados:listaAmenidades[]=[]
  disponiblesIndexadosCamas:listaCamas[]=[]
  disponibilidadNuevaGeneral:Disponibilidad[]=[]
  resultLocation = []
  resultLocationCamas = []
  resultAdicionales = []
  adicionalesArr:Adicional[]=[]
  camasArr:Adicional[]=[]
  // inventarioArr:number[]=[1]
  nombreHabs:[]=[]

  /**DateTime */
  toDate: DateTime;
  fromDate:DateTime

  /*DOM*/
  loadingAdicionales:boolean=true
  checkBox:boolean=false
  nombresIguales:boolean=false
  edicion:boolean=false
  inicio:boolean=true
  editarHab:boolean=false
  isLoading:boolean=false
  reload:boolean=false

  /**FLAGS DE Generacion */
  habitacionGenerada:boolean = false
  tarifaGenerada:boolean = false
  disponibilidadGenerada:boolean = false
  mensajeDeHabitacionGenerada:string=''
  mensajeDeTarifaGenerada:string=''
  mensajeDeDisponibilidadGenerada:string=''


  //VALORES DEFAULT
  quantity:number=1;
  quantityExtra:number=0;
  quantityInv:number=1;
  quantityExtraInv:number=0;

  //File Upload
  sendUpload: boolean;
  imagen:any;
  imageSelected:boolean=false


  /**Subscription */
  subscriptions:Subscription[]=[]

  constructor(
    private uploadService: FileUploadService,
    public fb : FormBuilder,
    public tiposHabitacionService:TiposService,
    public modalService : NgbModal,
    public habitacionService:HabitacionesService,
    public router : Router,
    public modal:NgbActiveModal,
    public tarifasService:TarifasService,
    public parametrosService:ParametrosServiceService,
    private af :AngularFireStorage
  ) {
    this.fromDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
    this.toDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
    this.toDate = this.toDate.plus({ days: 1 });

  }

  ngOnInit(): void {


    this.getTiposHAB();
    this.getAmenidades();
    this.getCamas();


    this.formGroup = this.fb.group({
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100),NoWhiteSpacesValidator.cannotContainSpace])],
      tipo: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      descripcion: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(300)])],
      personas: [1, Validators.compose([Validators.required,Validators.min(1)])],
      extras: [0, Validators.required],
      vista: [''],
      inventario: [1, Validators.required],
      orden:[1,Validators.required],
      nombreHabs: this.fb.array([]),
      tarifaBase:[0,Validators.required],
      etiqueta:[0,Validators.required],

    })

    this.inputForm = this.fb.group({
      nombreHabs: ['',],
    });

    if(this.habitacion!=undefined){
      this.editarHab=true
      this.f.nombre.patchValue(this.habitacion.Codigo)
      this.f.tipo.patchValue(this.habitacion.Tipo)
      this.f.descripcion.patchValue(this.habitacion.Descripcion)
      this.f.personas.patchValue(this.habitacion.Personas)
      this.f.extras.patchValue(this.habitacion.Personas_Extra)
      this.f.vista.patchValue(this.habitacion.Vista)
      this.f.tarifaBase.patchValue(this.habitacion.Tarifa)
      this.f.inventario.patchValue(this.habitacion.Inventario)
      this.f.etiqueta.patchValue(this.habitacion.Numero)

      // this.formGroup.controls["nombreHabs"].patchValue(this.habitacion.Tipos_Camas)
    }

    this.inputs.push(this.inputForm);



  }

  get inputs() {
    return this.formGroup.controls["nombreHabs"] as FormArray;
  }
  get f(){
    return this.formGroup.controls;
  }

  getTiposHAB(){
   const sb = this.tiposHabitacionService.getTiposDeCuarto().subscribe(
      (value)=>{
        if(value){this.tiposArr=value}
    },
    (error)=>{

    }
    )

    this.subscriptions.push(sb)

  }

  getAmenidades(){
    this.reload=true;
    const sb = this.tiposHabitacionService.getAmenidades().subscribe(
      (value)=>{
        this.reload=false

        if(value){this.amenidadesArr=value}
        for(let i=0;i<value.length;i++){
          this.disponiblesIndexados.push({key:i,value:value[i].Descripcion})
        }
    },
    (error)=>{
      this.reload=false

    }
    )

    this.subscriptions.push(sb)
  }

  getCamas(){
    const sb = this.tiposHabitacionService.getCamas().subscribe(
      (value)=>{
        if(value){this.camasArr=value}

        for(let i=0;i<value.length;i++){
          this.disponiblesIndexadosCamas.push({key:i,value:value[i].Descripcion,cantidad:1})
        }
    },
    (error)=>{

    }
    )

    this.subscriptions.push(sb)
  }

  camasValue(selected:any){
    this.resultLocationCamas = this.resultLocationCamas.filter((option) => {
      return option !== selected;
    });

  }

  amenidadesValue(selected:string){

    this.resultLocation = this.resultLocation.filter((option) => {
      return option !== selected;
    });

  }

  addInput(){

    this.quantityInv++;
    this.formGroup.controls['inventario'].patchValue(this.quantityInv)

      this.inputForm = this.fb.group({
        nombreHabs: [''],
    });

    this.inputs.push(this.inputForm);
  }

  removeInput(){

    if(this.quantityInv>1)
      {
      this.quantityInv--;
      this.inputs.removeAt(this.quantityInv-1);

      }
      else
      {this.quantityInv}

      this.formGroup.controls['inventario'].patchValue(this.quantityInv)

  }

  resetForm(){

    this.formGroup.controls['descripcion'].patchValue('')
    this.formGroup.controls['tipo'].patchValue('')
    this.formGroup.controls['nombre'].patchValue('')
    this.formGroup.controls['vista'].patchValue('')
    this.formGroup.controls['orden'].patchValue('')

    this.quantity=1
    this.quantityExtra=0
    this.formGroup.controls['personas'].patchValue(this.quantity)
    this.formGroup.controls['extras'].patchValue(this.quantity)
    // this.formGroup.controls['inventario'].patchValue(1)
    this.camasArr=[]
    // this.amenidadesArr=[]
    // this.inputs.reset();
    // this.amenidadesFC.reset();
    // this.camasFC.reset();
    this.amenidadesArr=[]
    this.resultLocation=[]
    this.getAmenidades()
    this.disponiblesIndexadosCamas=[]
    this.resultLocationCamas=[]
    this.getCamas()

    this.f.tipo.patchValue(0)
    this.camasFC.markAsUntouched();
    this.amenidadesFC.markAsUntouched();

  }

  async onSubmit(){
    let habitacionNueva:Habitacion
    this.inicio=false

    if(this.formGroup.invalid){
      this.findInvalidControls()
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key).markAsDirty();
      });
      return
    }
    this.closeModal();

    let conteoCamas=0;

    for(let y=0;y<this.camasFC.value.length; y++){
      let numero
      numero=parseInt(this.camasFC.value[y].split(' ')[0])
      conteoCamas=numero+conteoCamas
    }

  let nombreHabs=[]

  for(let y=0; y<this.formGroup.value.nombreHabs.length;y++){
    if(this.formGroup.value.nombreHabs[y].nombreHabs==''){
      nombreHabs.push({nombreHabs:this.formGroup.value.nombre.toString()+((y+1).toString())})
    }
  }

  if(this.editarHab==true){
    habitacionNueva = {
      _id:this.habitacion._id,
      Codigo:this.formGroup.value.nombre,
      Numero:this.formGroup.value.etiqueta,
      Descripcion:this.formGroup.value.descripcion,
      Tipo:this.formGroup.value.tipo,
      Personas:this.formGroup.value.personas,
      Personas_Extra:this.formGroup.value.extras,
      Inventario:this.formGroup.value.inventario,
      Vista:this.formGroup.value.vista,
      Camas:conteoCamas,
      Tipos_Camas:this.camasFC.value,
      Amenidades:this.amenidadesFC.value,
      Orden:this.formGroup.value.orden,
      Tarifa:this.formGroup.value.tarifaBase
    }
  }else {
    if(nombreHabs.length!=0){
      habitacionNueva = {
        Codigo:this.formGroup.value.nombre,
        Numero:nombreHabs,
        Descripcion:this.formGroup.value.descripcion,
        Tipo:this.formGroup.value.tipo,
        Personas:this.formGroup.value.personas,
        Personas_Extra:this.formGroup.value.extras,
        Inventario:this.formGroup.value.inventario,
        Vista:this.formGroup.value.vista,
        Camas:conteoCamas,
        Tipos_Camas:this.camasFC.value,
        Amenidades:this.amenidadesFC.value,
        Orden:this.formGroup.value.orden,
        Tarifa:this.formGroup.value.tarifaBase
      }
    }else{
      habitacionNueva = {
        Codigo:this.formGroup.value.nombre,
        Numero:this.formGroup.value.nombreHabs,
        Descripcion:this.formGroup.value.descripcion,
        Tipo:this.formGroup.value.tipo,
        Personas:this.formGroup.value.personas,
        Personas_Extra:this.formGroup.value.extras,
        Inventario:this.formGroup.value.inventario,
        Vista:this.formGroup.value.vista,
        Camas:conteoCamas,
        Tipos_Camas:this.camasFC.value,
        Amenidades:this.amenidadesFC.value,
        Orden:this.formGroup.value.orden,
        Tarifa:this.formGroup.value.tarifaBase
      }
    }

  }
this.isLoading=true

    const sb =  this.habitacionService.postHabitacion(habitacionNueva,this.editarHab,this.formGroup.value.image).subscribe(
      (value)=>{

        this.sendUpload=true
        this.habitacionGenerada = true
        this.mensajeDeHabitacionGenerada='Habitación(es) Generadas con éxito'

        const dispoCreada = this.habitacionService.creaDisponibilidad(nombreHabs,this.formGroup.value.nombre)

        const tarifasCreadas = this.postTarifa()

        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje=this.mensajeDeHabitacionGenerada

        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.habitacionService.fetch();
            this.modal.close()

        },
      (error)=>{
        this.habitacionGenerada = false
        this.mensajeDeHabitacionGenerada='No se pudo guardar la habitación intente de nuevo mas tarde'
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje=this.mensajeDeHabitacionGenerada
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
          this.isLoading=false
      }
    )
  }


  async postTarifa(){

    let fromDate = this.fromDate.day+"/"+this.fromDate.month+"/"+this.fromDate.year
    let toDate = this.toDate.day+"/"+this.toDate.month+"/"+this.toDate.year+1

    let tarifa : Tarifas= {
      Tarifa:'Tarifa Estandar',
      Habitacion:this.formGroup.value.nombre,
      Llegada:fromDate,
      Salida:toDate,
      Plan:'Ninguno',
      Politicas:'Ninguno',
      EstanciaMinima:1,
      EstanciaMaxima:0,
      Estado:true,
      TarifaRack:this.formGroup.value.tarifaBase,
      TarifaxPersona:[this.formGroup.value.tarifaBase],

      Dias:[
        {name:'Lun', value:0, checked:true},
        {name:'Mar', value:1, checked:true},
        {name:'Mie', value:2, checked:true},
        {name:'Jue', value:3, checked:true},
        {name:'Vie', value:4, checked:true},
        {name:'Sab', value:5, checked:true},
        {name:'Dom', value:6, checked:true}
      ]
    }

    return this.tarifasService.postTarifa(tarifa).subscribe(
      (value)=>{

        this.tarifasService.sendNotification(true)
        return "Tarifa(s) Generada(s) con éxito"
      },
      (error)=>{
        return "No se pudo guardar la tarifa intente de nuevo mas tarde"
      })
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.formGroup.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
}

  checkbox(value:any){
    if(value){
      this.checkBox=true
    }else {
      this.checkBox=false
    }
  }

    // FormHelpers
    isControlValid(controlName: string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }

    isControlInvalid(controlName: string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
    }

    controlHasError(validation, controlName): boolean {
      const control = this.formGroup.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    }

    isControlTouched(controlName): boolean {
      const control = this.formGroup.controls[controlName];
      return control.dirty || control.touched;
    }

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
        const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

        return invalidCtrl || invalidParent;
    }

    plus()
    {
        this.quantity++;
        this.formGroup.controls['personas'].patchValue(this.quantity)
        //this.formGroup.controls['ninos'].updateValueAndValidity();
    }
    minus()
    {
      if(this.quantity>1)
      {
      this.quantity--;
      this.formGroup.controls['personas'].patchValue(this.quantity)

      }
      else
      this.quantity
      this.formGroup.controls['personas'].patchValue(this.quantity)

    }

    plusExtra()
    {
        this.quantityExtra++;
        this.formGroup.controls['extras'].patchValue(this.quantityExtra)

    }
    minusExtra()
    {
      if(this.quantityExtra>0)
      {
      this.quantityExtra--;
      this.formGroup.controls['extras'].patchValue(this.quantityExtra)

      }
      else
      this.quantityExtra
      this.formGroup.controls['extras'].patchValue(this.quantityExtra)


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

    imageSelectedFunc(){
      this.imageSelected=true;
    }


    closeModal()
    {
      this.modal.close();
    }

    ngOnDestroy(): void {
      this.subscriptions.forEach(sb => sb.unsubscribe());
    }


}
