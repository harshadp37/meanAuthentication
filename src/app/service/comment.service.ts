import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class CommentService {

  //socket = io();

  constructor(private http : HttpClient, private authService : AuthService) {
    //this.ap();
  }

  /* ap(){
    this.socket.on('onConnected', (id)=>{
      console.log('connected : ' + id);
      this.socket.emit('join', {username : this.authService.user.username})
      this.socket.emit('Msg', {from : this.authService.user.username, to : this.authService.user.username === 'sadanandp42' ? 'harshadp37' : 'sadanandp42', Msg : 'from : ' + this.authService.user.username})
    })

    this.socket.on('newMsg', (data)=>{
      console.log(data.Msg);
    })
  } */


  getAllComment(title) : Observable<any>{
    return this.http.get('/posts/' + title);
  }

  saveComment(title, comment) : Observable<any>{
    return this.http.post('/posts/saveComment/' + title, comment);
  }

  saveEditedComment(commentID, editBody) : Observable<any>{
    return this.http.put('/posts/updateComment/' + commentID, editBody);
  }

  deleteComment(commentID) : Observable<any>{
    return this.http.delete('/posts/deleteComment/' + commentID);
  }

  saveReply(commentID, reply) : Observable<any>{
    return this.http.post('/posts/saveReply/' + commentID, reply);
  }

  saveEditedReply(replyID, editReplyBody) : Observable<any>{
    return this.http.put('/posts/updateReply/' + replyID, editReplyBody);
  }

  deleteReply(replyID) : Observable<any>{
    return this.http.delete('/posts/deleteReply/' + replyID);
  }
}
