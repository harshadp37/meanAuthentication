import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profilePic;

  constructor(private authService : AuthService, private userService: UserService, private dms: DomSanitizer) { }

  ngOnInit() {
  }

  get user(){
    return this.authService.user;
  }

  get isLoggedIn() : boolean{
    return this.authService.isLoggedIn();
  }
}
