import { Injectable } from '@angular/core';
import * as jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
declare var jQuery: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  user = {
    name: '',
    username: '',
    email: ''
  }

  load: boolean;
  sessionExpired: boolean;

  setToken(token?) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    if (this.getToken()) {
      return true;
    } else {
      return false;
    }
  }

  setUserData(name?, username?, email?) {
    if (name && username && email) {
      this.user.name = name;
      this.user.username = username;
      this.user.email = email;
    } else {
      this.user.name = '';
      this.user.username = '';
      this.user.email = '';
    }
  }

  sessionCheck() {
    this.sessionExpired = false;

    let session = setInterval(() => {
      if (this.getToken()) {
        try {
          var payload = jwt_decode(localStorage.getItem('token'));
          if (Math.floor(new Date().getTime() / 1000) > payload.exp) {
            this.sessionExpired = true;
            clearInterval(session);
            jQuery('#sessionModal').modal('show');
          } else {
            this.setUserData(payload.name, payload.username, payload.email);
            this.sessionExpired = false;
          }
        } catch (err) {
          this.sessionExpired = true;
          clearInterval(session);
          this.setToken();
          this.setUserData();
          jQuery('#sessionModal').modal('show');
        }
      } else {
        this.sessionExpired = true;
        clearInterval(session);
        this.setToken();
        this.setUserData();
        if (window.location.pathname === "/profile") {
          jQuery('#sessionModal').modal('show');
        }
      }
    }, 10000)
  }
}
