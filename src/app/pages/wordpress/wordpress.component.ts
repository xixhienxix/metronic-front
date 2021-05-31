import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class WordpressComponent  {
  name = 'Angular';
  srcUrl: string = "https://www.urbanpro.com/kolkata/self-and-beyond-golf-green/4422880";
}
