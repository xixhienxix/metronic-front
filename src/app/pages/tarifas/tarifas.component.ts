import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { TarifasService } from './_services/tarifas.service';

@Component({
  selector: 'app-tarifas',
  templateUrl: './tarifas.component.html',
  styleUrls: ['./tarifas.component.scss']
})
export class TarifasComponent implements OnInit {

  //DOM
  isLoading: boolean;

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  //Filtros
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;

  private subscriptions: Subscription[] = [];

  constructor(
    public fb : FormBuilder,
    public tarifasService:TarifasService
  ) { 
    this.tarifasService.fetch();
  }

  ngOnInit(): void {


    this.tarifasService.items$.subscribe(
      (value)=>{
        if(value.length==0){

        }
       
      },
      (error)=>{

      }
    )

    this.grouping = this.tarifasService.grouping;
    this.paginator = this.tarifasService.paginator;
    this.sorting = this.tarifasService.sorting;
  }
// sorting
sort(column: string) {
  const sorting = this.sorting;
  const isActiveColumn = sorting.column === column;
  if (!isActiveColumn) {
    sorting.column = column;
    sorting.direction = 'desc';
  } else {
    sorting.direction = sorting.direction === 'desc' ? 'asc' : 'desc';
  }
  this.tarifasService.patchState({ sorting });
}

// pagination
paginate(paginator: PaginatorState) {
  this.tarifasService.patchState({ paginator });
}


}
