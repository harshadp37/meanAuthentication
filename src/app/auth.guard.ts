import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private userService: UserService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (this.authService.getToken()) {
        return this.userService.getUser().pipe(map(res => {
          if (res.success) {
            this.authService.setUserData(res.message.name, res.message.username, res.message.email);
            return true;
          } else {
            this.authService.setToken();
            this.authService.setUserData();
            this.router.navigate(['/login']);
            return false;
          }
        }))
      } else {
        this.authService.setUserData();
        this.router.navigate(['/login']);
        return false;
      }
  }
}
