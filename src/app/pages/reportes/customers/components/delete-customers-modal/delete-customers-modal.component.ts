import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, delay, finalize, tap } from 'rxjs/operators';
import { HuespedService } from '../../../_services';

@Component({
  selector: 'app-delete-customers-modal',
  templateUrl: './delete-customers-modal.component.html',
  styleUrls: ['./delete-customers-modal.component.scss']
})
export class DeleteHuespedesModalComponent implements OnInit, OnDestroy {
  @Input() ids: number[];
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(private huespedService: HuespedService, public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  deleteCustomers() {
    this.isLoading = true;
    const sb = this.huespedService.deleteItems(this.ids).pipe(
      delay(1000), // Remove it from your code (just for showing loading)
      tap(() => this.modal.close()),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe();
    this.subscriptions.push(sb);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
