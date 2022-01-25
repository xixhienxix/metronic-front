import { Component, OnInit,Input, ViewChild } from '@angular/core';
import { NgbActiveModal,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  @Input() huesped;
  @Input() estatus;
  closeResult: string;
  @ViewChild('exito') exito= null;
  @ViewChild('error') error= null;
  subscription:Subscription[]=[]
  constructor(
    public customerService: HuespedService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,

  ) { }

  ngOnInit(): void {

  }
  closeModal(sendData) {
    this.activeModal.close(sendData);
  }

  cambiaEstatus(huesped:Huesped)
  {
    this.huesped.estatus=this.estatus
    const sb = this.customerService.updateHuesped(huesped)
    .subscribe(
     ()=>
     {
      const modalRef = this.modalService.open(this.exito,{ size: 'sm', backdrop:'static' });
      
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        this.customerService.fetch();

        setTimeout(() => {
          modalRef.close('Close click');
        },4000)
    },
     (err)=>
     {
       console.log(err.message)
      const modalRef = this.modalService.open(this.error,{ size: 'sm', backdrop:'static' })
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        setTimeout(() => {
          modalRef.close('Close click');
        },4000)     
      },
     ()=>{

     }

   )
this.subscription.push(sb)
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
}

ngOnDestroy(): void {
  this.subscription.forEach(sb=> sb.unsubscribe());
}
}


