import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { AuthService } from './service/auth.service';
import * as $ from 'jquery';
import { NotificationService } from './service/notification.service';

declare var jQuery: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Angular2Authentication';
  newNotifications = [];
  seenNotifications = [];

  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService) {

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
      this.notificationService.getAllNotification().subscribe((res)=>{
        if(res.success){
          this.newNotifications = res.notifications;
        }else{
          console.log(res.message)
        }
      })
    }

    this.bindJquery();
  }

  get loading() {
    return this.authService.load;
  }

  get username() {
    return this.authService.user.username;
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  logout() {
    setTimeout(() => {
      this.authService.setToken();
      this.authService.setUserData();
      jQuery('#loggingOutModal').modal('hide');
      this.router.navigate(['/login']);
    }, 2000);
  }

  showNotifications(e) {
    if($(e.target)[0].tagName == "DIV"){
      $(e.target.nextElementSibling).slideToggle('slow');
    }else{
      $(e.target.parentElement.nextElementSibling).slideToggle('slow');
    }
  }

  bindJquery(){
    $(window).click(function(e){
      if(<any>$(e.target).hasClass('notification-bell') || <any>$(e.target).hasClass('fa fa-bell') || <any>$(e.target).attr('id') === "notifications-count"){
        e.preventDefault();
      }else if($('#notification-dropdown').is(':visible') || $('#notification-dropdown-sm').is(':visible')){
        $('#notification-dropdown').slideUp('slow');
        $('#notification-dropdown-sm').slideUp('slow');
      }
    })
  }
}
