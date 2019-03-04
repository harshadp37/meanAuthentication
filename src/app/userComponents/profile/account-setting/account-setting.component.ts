import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.css']
})
export class AccountSettingComponent implements OnInit {

  alternateProfilePicUrl = null;
  profilePicChanged: boolean = false;

  constructor(private authService: AuthService, private userService: UserService, private dms: DomSanitizer) { }

  ngOnInit() {
    $(document).ready(function () {
      $('.btnChange').bind('click', function () {
        $('.imageToChange').click();
      })
    })
  }

  get user() {
    return this.authService.user;
  }

  processImage(fileInput) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(fileInput.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.alternateProfilePicUrl = event.target.result;
        this.profilePicChanged = true;
      }
    }
  }

  saveImage() {
    if (this.profilePicChanged) {
      console.log('save');
      var img = <CanvasImageSource>document.getElementById('pp');
      var mod = document.getElementById('mod');
      var canvas = <HTMLCanvasElement>document.getElementById('c');
      var context = canvas.getContext('2d');
      canvas.width = canvas.height = 225;
      context.drawImage(img, $('.profilePicDiv').scrollLeft(), $('.profilePicDiv').scrollTop(), 225, 225, 0, 0, 225, 225);
      mod.setAttribute('src', canvas.toDataURL());
      let newProfilePic = {
        fileType: mod.getAttribute('src').split(';')[0].split(':')[1],
        value: mod.getAttribute('src').split(',')[1]
      }
      this.userService.changeProfilePic(newProfilePic).subscribe((res) => {
        if(res.success){
          this.alternateProfilePicUrl = null;
          this.profilePicChanged = false;
          this.authService.user.profilePicUrl = mod.getAttribute('src')
        }else{
          console.log(res);
        }
      });
    }else{
      console.log('Please Select new profile picture.')
    }
  }
}
