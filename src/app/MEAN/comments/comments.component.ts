import { Component, OnInit, Input } from '@angular/core';
import { CommentService } from 'src/app/service/comment.service';
import { AuthService } from 'src/app/service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  @Input()
  title = String;

  comments = [];
  commentForm: FormGroup;
  replyForm: FormGroup;
  editForm: FormGroup;

  editMatch: boolean;

  errorMsg: String;
  submitted: boolean = false;
  replySubmitted: boolean = false;
  editSubmitted: boolean = false;

  loadingComments: boolean = true;
  constructor(private commentService: CommentService, private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.commentFormInit();
    this.replyFormInit();
    this.editFormInit();
    this.loadingComments = true;

    setTimeout(() => {
      this.commentService.getAllComment(this.title).subscribe(res => {
        if (res.success) {
          this.comments = res.comments;
          this.loadingComments = false;
          this.bindJquery();
        } else {
          this.errorMsg = res.message;
          this.loadingComments = false;
          this.bindJquery();
        }
      })
    }, 2000)

  }

  get username() {
    return this.authService.user.username;
  }

  commentFormInit() {
    this.commentForm = this.fb.group({
      commentBody: ['', Validators.required]
    })
  }

  replyFormInit() {
    this.replyForm = this.fb.group({
      replyBody: ['', Validators.required]
    })
  }

  editFormInit() {
    this.editForm = this.fb.group({
      editBody: ['', Validators.required]
    })
  }

  saveComment() {
    this.submitted = true;
    if (this.commentForm.valid) {
      let comment = {
        'username': this.username,
        'commentBody': this.commentForm.get('commentBody').value
      }

      this.commentService.saveComment(this.title, comment).subscribe((res) => {
        console.log(res);
        if (res.success) {
          this.commentForm.reset();
          this.submitted = false;
          this.ngOnInit();
        } else {
          this.submitted = true;
        }
      })
    }
  }

  saveReply(commentID) {
    this.replySubmitted = true;
    if (this.replyForm.valid) {
      let reply = {
        'username': this.username,
        'replyBody': this.replyForm.get('replyBody').value
      }

      this.commentService.saveReply(commentID, reply).subscribe((res) => {
        if (res.success) {
          this.replyForm.reset();
          this.replySubmitted = false;
          this.ngOnInit();
        } else {
          this.replySubmitted = true;
        }
      })
    }
  }

  saveEdit(commentID){
    this.editSubmitted = true;
    if (this.editForm.valid) {
      let editBody = {
        'editBody': this.editForm.get('editBody').value
      }

      this.commentService.saveEditedComment(commentID, editBody).subscribe((res) => {
        if (res.success) {
          this.editForm.reset();
          this.editSubmitted = false;
          this.ngOnInit();
        } else {
          this.editSubmitted = true;
        }
      })
    }
  }

  checkMatch(e){
    this.editMatch = false;
    if(e.target.value === e.target.parentElement.parentElement.parentElement.children[0].textContent){
      this.editMatch = true;
    }
  }

  calTotalComments(){
    let totalComment = this.comments.length;
    for(let i=0; i < this.comments.length; i++){
      totalComment = totalComment + (this.comments[i].replys ? this.comments[i].replys.length : 0);
    }
    return totalComment;
  }

  bindJquery() {
    var _this = this;
    $(document).ready(function () {
      //Toggle ReplyList 
      $('.replyAnchor').bind('click', function (e) {
        $(e.target.children[0]).toggleClass('glyphicon-triangle-bottom')
        $(e.target.children[0]).toggleClass('glyphicon-triangle-top')

        $(e.target.nextElementSibling).toggle('slow');
      })

      $('.replyAnchor span').bind('click', function (e) {
        $(this).toggleClass('glyphicon-triangle-bottom')
        $(this).toggleClass('glyphicon-triangle-top')

        $(e.target.parentElement.nextElementSibling).toggle('slow');
      })

      //Toggle Reply-Form & Hide/Reset Other Reply-Form
      $('.commentDiv .commentsList .commentFooter .replybtn').bind('click', function (e) {
        _this.replyForm.reset();
        $('.commentDiv .commentsList .commentFooter .reply-form').each(function () {
          if ($(this)[0] === $(e.target.nextElementSibling)[0] || $(this)[0] === $(e.target.nextElementSibling.nextElementSibling)[0]) {
            if (e.target.nextElementSibling.nodeName === 'DIV') {
              $(e.target.nextElementSibling).toggle('slow');
            } else {
              $(e.target.nextElementSibling.nextElementSibling).toggle('slow');
            }
          } else if ($(this).is(':visible')) {
            $(this).hide('slow');
          }
        })
      })

      $('.commentDiv .commentsList .commentFooter .editbtn').bind('click', function (e) {
        _this.editForm.reset();
        $('.commentDiv .commentsList .commentBody .edit-form').each(function () {
          if ($(this)[0] === $(e.target.parentElement.parentElement.children[1].children[1])[0]) {

            e.target.parentElement.parentElement.children[1].children[1].children[0][0].value = e.target.parentElement.parentElement.children[1].children[0].textContent;
            $(e.target.parentElement.parentElement.children[1].children[0]).toggle('slow')
            $(e.target.parentElement.parentElement.children[1].children[1]).toggle('slow')

          } else if ($(this).is(':visible') || $(this.parentElement.children[0]).not(':visible')) {
            $(this).hide();
            $(this.parentElement.children[0]).show();
          }
        })
      })

    })

  }
}
