import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader-spinner',
  template:'<div class="lds-hourglass"></div>',
  styleUrls: ['./loader-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
