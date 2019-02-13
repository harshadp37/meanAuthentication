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
  editReplyForm: FormGroup;

  editMatch: boolean;
  editReplyMatch: boolean;

  errorMsg: String;

  loadingComments: boolean = true;
  constructor(private commentService: CommentService, private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.commentFormInit();
    this.replyFormInit();
    this.editFormInit();
    this.editReplyFormInit();
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
    }, 500)

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

  editReplyFormInit() {
    this.editReplyForm = this.fb.group({
      editReplyBody: ['', Validators.required]
    })
  }

  calTotalComments() {
    let totalComment = this.comments.length;
    for (let i = 0; i < this.comments.length; i++) {
      totalComment = totalComment + (this.comments[i].replys ? this.comments[i].replys.length : 0);
    }
    return totalComment;
  }

  saveComment() {
    if (this.commentForm.valid) {
      let comment = {
        'commentBody': this.commentForm.get('commentBody').value
      }
      this.commentForm.disable();
      this.commentService.saveComment(this.title, comment).subscribe((res) => {
        if (res.success) {
          this.commentForm.reset();
          this.commentForm.enable();
          this.ngOnInit();
        } else {
          this.commentForm.enable();
        }
      })
    }
  }

  saveReply(commentID) {
    if (this.replyForm.valid) {
      let reply = {
        'replyBody': this.replyForm.get('replyBody').value
      }
      this.replyForm.disable()
      this.commentService.saveReply(commentID, reply).subscribe((res) => {
        if (res.success) {
          this.replyForm.reset();
          this.replyForm.enable()
          this.ngOnInit();
        } else {
          this.replyForm.enable()
        }
      })
    }
  }

  saveEdit(commentID) {
    if (this.editForm.valid && !this.editMatch) {
      let editBody = {
        'editBody': this.editForm.get('editBody').value
      }
      this.editForm.disable();
      this.commentService.saveEditedComment(commentID, editBody).subscribe((res) => {
        if (res.success) {
          this.editForm.reset();
          this.editForm.enable();
          this.ngOnInit();
        } else {
          this.editForm.enable();
        }
      })
    }
  }

  saveReplyEdit(replyID) {
    if (this.editReplyForm.valid && !this.editReplyMatch) {
      let editReplyBody = {
        'editReplyBody': this.editReplyForm.get('editReplyBody').value
      }
      this.editReplyForm.disable();
      this.commentService.saveEditedReply(replyID, editReplyBody).subscribe((res) => {
        if (res.success) {
          this.editReplyForm.reset();
          this.editReplyForm.enable();
          this.ngOnInit();
        } else {
          this.editReplyForm.enable();
        }
      })
    }
  }

  deleteComment(commentID) {
    if (confirm('Are you sure, you want to delete this comment..?')) {
      this.commentService.deleteComment(commentID).subscribe((res) => {
        if (res.success) {
          this.ngOnInit();
        } else {
          console.log(res.message)
        }
      })
    }
  }

  deleteReply(replyID) {
    if (confirm('Are you sure, you want to delete this reply..?')) {
      this.commentService.deleteReply(replyID).subscribe((res) => {
        if (res.success) {
          this.ngOnInit();
        } else {
          console.log(res.message)
        }
      })
    }
  }

  checkMatch(e) {
    this.editMatch = false;
    if (e.target.value === e.target.parentElement.parentElement.parentElement.children[0].textContent) {
      this.editMatch = true;
    }
  }

  checkReplyMatch(e) {
    this.editReplyMatch = false;
    if (e.target.value === e.target.parentElement.parentElement.parentElement.children[0].textContent) {
      this.editReplyMatch = true;
    }
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

      $('.commentDiv .commentsList ul li').bind('mouseenter', function (e) {
        if ($(e.target).parents().hasClass('replysList')) {
          return;
        }
        if ($(e.target)[0].tagName === "LI") {
          $(e.target).find('.commentHeader .deletebtn').show();
        } else {
          $(e.target).parents('li').find('.commentHeader .deletebtn').show();
        }
      })

      $('.commentDiv .commentsList ul li').bind('mouseleave', function (e) {
        if ($(e.target)[0].tagName === "LI") {
          $(e.target).find('.commentHeader .deletebtn').hide();
        } else {
          $(e.target).parents('li').find('.commentHeader .deletebtn').hide();
        }
      })

      $('.commentDiv .commentsList .commentFooter .replysList ul li').bind('mouseenter', function (e) {
        e.stopPropagation();
        if ($(e.target)[0].tagName === "LI") {
          $(e.target).find('.replyHeader .deletebtn').show();
        } else {
          $($(e.target).parents('li')[0]).find('.replyHeader .deletebtn').show();
        }
      })

      $('.commentDiv .commentsList .commentFooter .replysList ul li').bind('mouseleave', function (e) {
        e.stopPropagation();
        if ($(e.target)[0].tagName === "LI") {
          $(e.target).find('.replyHeader .deletebtn').hide();
        } else {
          $($(e.target).parents('li')[0]).find('.replyHeader .deletebtn').hide();
        }
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

      $('.commentDiv .commentsList .commentFooter .replysList .replyFooter .editReplybtn').bind('click', function (e) {
        _this.editReplyForm.reset();
        $('.commentDiv .commentsList .commentFooter .replysList .replyBody .edit-reply-form').each(function () {
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
