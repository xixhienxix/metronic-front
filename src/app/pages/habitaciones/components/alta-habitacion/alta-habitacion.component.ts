import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Adicional } from '../../_models/adicionales';
import { Amenidades } from '../../_models/amenidades';
import { Tipos_Habitacion } from '../../_models/tipos';
import { TiposService } from '../../_services/tipos.service';

type listaAmenidades = {key:number;value:string}
type listaCamas = {key:number;value:string;cantidad:number}


@Component({
  selector: 'app-alta-habitacion',
  templateUrl: './alta-habitacion.component.html',
  styleUrls: ['./alta-habitacion.component.scss']
})
export class AltaHabitacionComponent implements OnInit {

  @ViewChild('itemSelect') public itemSelect: MatSelect;
  @ViewChild('matOption') public matOption: MatOption;

  /**Modal */
  closeResult:string

  /**FormControl */
  formGroup:FormGroup
  nombreHabitacionesFC=new FormControl();
  amenidadesFC = new FormControl();
  camasFC = new FormControl();
  serviciosAdicionales=new FormControl();

  /*MODELS*/
  tiposArr:Tipos_Habitacion[]=[]
  amenidadesArr:Amenidades[]=[]
  disponiblesIndexados:listaAmenidades[]=[]
  disponiblesIndexadosCamas:listaCamas[]=[]
  resultLocation = []
  resultLocationCamas = []
  resultAdicionales = []
  adicionalesArr:Adicional[]=[]
  camasArr:Adicional[]=[]
  inventarioArr:number[]=[1]
  nombreHabs:[]=[]

  /*DOM*/
  loadingAdicionales:boolean=true
  checkBox:boolean=false

  //VALORES DEFAULT
  quantity:number=1;
  quantityExtra:number=0;
  quantityInv:number=1;
  quantityExtraInv:number=0;

  /**Subscription */
  subscriptions:Subscription[]=[]

  constructor(
    public fb : FormBuilder,
    public tiposHabitacionService:TiposService,
    public modalService : NgbModal
  ) { 

  }

  ngOnInit(): void {

    this.getTiposHAB();
    this.getAmenidades();
    this.getCamas();
    

    this.formGroup = this.fb.group({
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      tipo: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      descripcion: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(300)])],
      personas: [1, Validators.compose([Validators.required,Validators.min(1)])],
      extras: [0, Validators.required],
      vista: ['', Validators.required],
      inventario: [1, Validators.required],
    })



    this.formGroup.controls['inventario'].valueChanges.subscribe(
      (value)=>{
        this.inventarioArr=[]
        for(let i=value;i>0; i--)
        this.inventarioArr.push(i)
        this.inventarioArr.sort(function(a, b) {
          return a - b;
        });
      },
      (error)=>{

      })
    
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
    const sb = this.tiposHabitacionService.getAmenidades().subscribe(
      (value)=>{ 
        if(value){this.amenidadesArr=value} 

        for(let i=0;i<value.length;i++){
          this.disponiblesIndexados.push({key:i,value:value[i].Descripcion})
        }
    },
    (error)=>{

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

  onSubmit(){

    this.formGroup.value
    this.nombreHabs
    this.nombreHabitacionesFC.value

    return
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

    plus()
    {
        this.quantity++;
        //this.formGroup.controls['ninos'].patchValue(this.quantityExtra)
        //this.formGroup.controls['ninos'].updateValueAndValidity();
    }
    minus()
    {
      if(this.quantity>1)
      {
      this.quantity--;
      }
      else
      this.quantity
    }

    plusExtra()
    {
        this.quantityExtra++;
    }
    minusExtra()
    {
      if(this.quantityExtra>0)
      {
      this.quantityExtra--;
      }
      else
      this.quantityExtra
  
    
    }

    plusInv()
    {
        this.quantityInv++;
        this.formGroup.controls['inventario'].patchValue(this.quantityInv)
        //this.formGroup.controls['ninos'].updateValueAndValidity();
    }
    minusInv()
    {
      if(this.quantityInv>1)
      {
      this.quantityInv--;

      }
      else
      {this.quantityInv}
      this.formGroup.controls['inventario'].patchValue(this.quantityInv)


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

    ngOnDestroy(): void {
      this.subscriptions.forEach(sb => sb.unsubscribe());
    }


}
