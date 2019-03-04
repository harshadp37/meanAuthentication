import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http : HttpClient) { }

  createUser(data) : Observable<any>{
    return this.http.post("/api/register", data)
  }

  checkUsername(data) : Observable<any>{
    return this.http.post("/api/checkUsername", data)
  }

  checkEmail(data) : Observable<any>{
    return this.http.post("/api/checkEmail", data)
  }

  login(data) : Observable<any>{
    return this.http.post("/api/login", data)
  }

  getUser() : Observable<any>{
    return this.http.get('/api/me')
  }

  getProfilePic() : Observable<any>{
    return this.http.get('/api/profilePic');
  }

  changeProfilePic(data) : Observable<any>{
    console.log(data)
    return this.http.put('/api/profilePic', data);
  }

  sendResetLink(passwordResetData) : Observable<any>{
    return this.http.post('/api/forgotPassword', passwordResetData);
  }

  verifyToken(token) : Observable<any>{
    return this.http.get('api/resetPassword/' + token);
  }

  resetPassword(data) : Observable<any>{
    return this.http.put('/api/resetPassword', data);
  }

  sendActivationLink(data) : Observable<any>{
    return this.http.post('/api/sendActivationLink', data);
  }

  activateAccount(token) : Observable<any>{
    return this.http.put('/api/activate/' + token, null);
  }
}
