import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MEANdataService {

  constructor(private http: HttpClient) { }

  getRegistrationFile() : Observable<any>{
    return this.http.get('/api/data/registrationData')
  }

  getLoginFile() : Observable<any>{
    return this.http.get('/api/data/loginData')
  }
}
