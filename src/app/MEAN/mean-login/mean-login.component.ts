import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mean-login',
  templateUrl: './mean-login.component.html',
  styleUrls: ['./mean-login.component.css']
})
export class MeanLoginComponent implements OnInit {

  from: string = "Login"; 

  constructor() { }

  ngOnInit() {
  }

}
