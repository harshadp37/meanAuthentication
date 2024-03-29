import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './service/auth.service';

@Injectable()

export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService : AuthService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var newReq = req.clone({
            setHeaders : {
                ['x-access-token'] : this.authService.getToken() ? this.authService.getToken() : ''
            }
        })
        return next.handle(newReq);
    }
}
