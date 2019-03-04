import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from './service/auth.service';
import { NotificationService } from './service/notification.service';
//import * as $ from 'jquery';

declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  $: any;
  newNotifications = [];
  notificationCount: number = 0;

  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService, private dms: DomSanitizer) {

    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        authService.load = true;
      }
      if (event instanceof NavigationCancel) {
        authService.load = false;
      }
      if (event instanceof NavigationEnd) {
        authService.load = false;
      }
      window.scrollTo(0, 0);
    })
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.sessionCheck();
      this.notificationService.getAllNotification().subscribe((res) => {
        if (res.success) {
          if (res.profilePic) {
            this.authService.user.profilePicUrl = "data:" + res.profilePic.fileType + ";base64, " + res.profilePic.value;
          } else {
            this.authService.user.profilePicUrl = "../assets/images/defaultPic.jpg"
          }
          this.newNotifications = res.notifications;
          for (let i = 0; i < this.newNotifications.length; i++) {
            if (!this.newNotifications[i].seen) {
              this.notificationCount++;
            }
          }
          $('#pageTitle').text(this.pageTitle());
        } else {
          console.log(res.message)
        }
      })
    }

    this.bindJquery();
  }

  pageTitle() {
    let title = this.notificationCount ? '(' + this.notificationCount + ') Angular2Authentication' : 'Angular2Authentication';
    return title;
  }

  notificationClick(notificationID, notificationSeen, target, index) {
    this.router.navigateByUrl('/MEAN/intro&setup')
    let checkCommentList = setInterval(() => {
      $('body').css('cursor', 'wait')
      if ($('.commentsList').is(':visible')) {
        console.log($('#' + target.replyID)[0])
        if ($('#' + target.replyID)[0]) {
          $('#' + target.commentID).find('.replyAnchor span').removeClass('glyphicon-triangle-bottom')
          $('#' + target.commentID).find('.replyAnchor span').addClass('glyphicon-triangle-top')

          $('#' + target.commentID).find('.replysList').show();
          $('#' + target.replyID)[0].scrollIntoView();
          $(window)[0].scrollBy({ top: -200 });
          $('#' + target.replyID).animate({ backgroundColor: "yellow" }, 500).animate({ backgroundColor: "#20b2aa" }, 500);
          $('body').css('cursor', 'default')
          clearInterval(checkCommentList);
        } else {
          $('body').css('cursor', 'default')
          clearInterval(checkCommentList);
        }
      }
    }, 1000)
    if (!notificationSeen) {
      this.notificationService.updateNotificationSeen(notificationID, notificationSeen).subscribe((res) => {
        if (res.success) {
          this.newNotifications[index].seen = true;
          this.notificationCount--;
          $('#pageTitle').text(this.pageTitle());
        }
      })
    }
  }

  get loading() {
    return this.authService.load;
  }

  get user() {
    return this.authService.user;
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  logout() {
    setTimeout(() => {
      this.authService.setToken();
      this.authService.setUserData();
      $('#loggingOutModal').modal('hide');
      this.router.navigate(['/login']);
    }, 2000);
  }

  showNotifications(e) {
    if ($(e.target)[0].tagName == "DIV") {
      $(e.target.nextElementSibling).slideToggle('slow');
    } else {
      $(e.target.parentElement.nextElementSibling).slideToggle('slow');
    }
  }

  bindJquery() {
    $(window).click(function (e) {
      if (<any>$(e.target).hasClass('notification-bell') || <any>$(e.target).hasClass('notification-bell-sm') || <any>$(e.target).hasClass('fa fa-bell') || <any>$(e.target).attr('id') === "notifications-count") {

      } else if ($('#notification-dropdown').is(':visible') || $('#notification-dropdown-sm').is(':visible')) {
        $('#notification-dropdown').slideUp('slow');
        $('#notification-dropdown-sm').slideUp('slow');
      }
    })
  }
}
