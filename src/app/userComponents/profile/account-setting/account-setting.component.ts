import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.css']
})
export class AccountSettingComponent implements OnInit {

  constructor(private authService: AuthService, private dms: DomSanitizer) { }

  ngOnInit() {
    $(document).ready(function(){
      $('.btnChange').bind('click', function(){
        $('.imageToChange').click();
      })
    })
  }

  get user(){
    return this.authService.user;
  }

  processImage(fileInput){
    let file = fileInput.target.files[0].name;
    console.log(file);
}

}
