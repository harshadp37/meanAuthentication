import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { AuthService } from './service/auth.service';
import * as $ from 'jquery';

declare var jQuery: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Angular2Authentication';
  newNotifications = [
    {
      user: {
        name: 'Harshad'
      },
      action: 'replied On',
      target: 'Your Comment'
    },
    {
      user: {
        name: 'Harsh'
      },
      action: 'replied On',
      target: 'Your Comment'
    }
  ]

  constructor(private router: Router, public authService: AuthService) {

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
    }
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
    $(e.target.parentElement.nextElementSibling).slideToggle('slow');
    this.newNotifications.push({
      user: {
        name: 'harshadp37'
      },
      action: 'replied On',
      target: 'Your Comment'
    })
  }
}
