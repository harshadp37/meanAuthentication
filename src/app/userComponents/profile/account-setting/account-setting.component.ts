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
        let _this = this;
        $("#pp").css("width", "225px");
        $("#pp").css("height", "225px");
        $('#pp, .profilePicDiv').css('cursor', 'move')
        $('#pp, .profilePicDiv').bind('wheel', function (e) {
          e.stopPropagation();
          _this.mousewheelEvent(e);
        })

        $('#pp').bind('mousedown', function (e: any) {
          e.stopPropagation();
          console.log('mousedown');
        })

        $('#pp').bind('mouseup', function (e: any) {
          e.stopPropagation();
          console.log('mouseup');
        })
      }
    }
  }

  mousewheelEvent(e: any) {
    var delta;
    if (e.originalEvent.wheelDelta !== undefined)
      delta = e.originalEvent.wheelDelta;
    else
      delta = e.originalEvent.deltaY * -1;
    if (delta > 0) {
      $("#pp").css("width", "+=120");
      $("#pp").css("height", "+=120");
      console.log($('#pp').width() + "  " + $('#pp').height())
    }
    else if($('#pp').css("width") > "345") {
      $("#pp").css("width", "-=120");
      $("#pp").css("height", "-=120");
      console.log($('#pp').width() + "  " + $('#pp').height())
    }else{
      $("#pp").css("width", "225");
      $("#pp").css("height", "225");
      console.log($('#pp').width() + "  " + $('#pp').height())
    }
  }

  saveImage() {
    $(document).css('cursor', 'wait')
    if (this.profilePicChanged) {
      //New Image Object to get Original Image Pixels
      let t = new Image();
      t.src = $('#pp').attr('src');

      //Calculate Image width & Height after zoom 
      var newImageWidth = Math.floor(t.width - (t.width * ($('#pp').width() - 225) / $('#pp').width()));
      var newImageHeight = Math.floor(t.height - (t.height * ($('#pp').height() - 225) / $('#pp').height()));
      console.log(newImageWidth + "  " + newImageWidth)

      ////Calculate Scrolled Position of image after zoom
      var newImageScrollLeft = Math.floor((t.width - newImageWidth) * $('.profilePicDiv').scrollLeft() / (($('#pp').width() === 225 ? 0 : $('#pp').width()) - 225));
      var newImageScrollTop = Math.floor((t.height - newImageHeight) * $('.profilePicDiv').scrollTop() / (($('#pp').height() === 225 ? 0 : $('#pp').height()) - 225));
      console.log(newImageScrollLeft + "  " + newImageScrollTop)

      var img = <CanvasImageSource>document.getElementById('pp');
      var mod = document.getElementById('mod');
      var canvas = <HTMLCanvasElement>document.getElementById('c');
      var context = canvas.getContext('2d');
      canvas.width = newImageWidth;
      canvas.height = newImageHeight;
      context.drawImage(img, newImageScrollLeft, newImageScrollTop, newImageWidth, newImageHeight, 0, 0, newImageWidth, newImageHeight);
      mod.setAttribute('src', canvas.toDataURL());

      //NewProfilePic Object & then send it to backEnd
      let newProfilePic = {
        fileType: mod.getAttribute('src').split(';')[0].split(':')[1],
        value: mod.getAttribute('src').split(',')[1]
      }
      this.userService.changeProfilePic(newProfilePic).subscribe((res) => {
        if (res.success) {
          this.alternateProfilePicUrl = null;
          this.profilePicChanged = false;
          this.authService.user.profilePicUrl = mod.getAttribute('src')
          $("#pp").css("width", "225px");
          $("#pp").css("height", "225px");
          $('#pp, .profilePicDiv').css('cursor', 'default')
          $('#pp, .profilePicDiv').unbind('wheel')
          $('#pp').unbind('mousedown')
          $('#pp').unbind('mouseup')
          $(document).css('cursor', 'default')
        } else {
          console.log(res);
          $(document).css('cursor', 'default')
        }
      });
    } else {
      console.log('Please Select new profile picture.')
      $(document).css('cursor', 'default')
    }
  }
}
