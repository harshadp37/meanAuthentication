import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private authService : AuthService) { }

  ngOnInit() {
  }

  get user(){
    return this.authService.user;
  }

  get isLoggedIn() : boolean{
    return this.authService.isLoggedIn();
  }
}
