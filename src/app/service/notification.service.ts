import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  getAllNotification() : Observable<any>{
    return this.http.get('/notification/all');
  }

  updateNotificationSeen(notificationID, notificationSeen) : Observable<any>{
    return this.http.put('/notification/updateSeen/' + notificationID, {notificationSeen: notificationSeen});
  }
}
