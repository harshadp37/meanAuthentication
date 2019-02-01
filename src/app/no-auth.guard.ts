import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './service/user.service';
import { AuthService } from './service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (this.authService.getToken()) {

      if (state.url === "/" || state.url === "/MEAN/intro&setup" || state.url === "/MEAN/registration") {
        return this.userService.getUser().pipe(map(res => {
          if (res.success) {
            this.authService.setUserData(res.message.name, res.message.username, res.message.email);
            return true;
          } else {
            this.authService.setToken();
            this.authService.setUserData();
            return true;
          }
        }))
      } else {
        return this.userService.getUser().pipe(map(res => {
          if (res.success) {
            this.authService.setUserData(res.message.name, res.message.username, res.message.email);
            this.router.navigate(['/profile']);
            return false;
          } else {
            this.authService.setToken();
            this.authService.setUserData();
            return true;
          }
        }))
      }
    } else {
      this.authService.setUserData();
      return true;
    }
  }
}
