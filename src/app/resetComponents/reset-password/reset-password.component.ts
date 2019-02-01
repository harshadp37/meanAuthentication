import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/service/user.service';

declare var jQuery: any;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;

  tokenVerified: boolean = false;
  tokenErrorMsg: String = '';

  passwordMatch: boolean = false;
  passwordMsg: String = '';

  successMsg: String = '';
  errorMsg: String = '';

  loading : boolean = false;
  submitted : boolean = false;

  userID: String;
  constructor(private fb: FormBuilder, private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.tokenVerified = false;

    this.userService.verifyToken(this.route.snapshot.params.token).subscribe((res) => {
      if (res.success) {
        this.tokenVerified = true;
        this.userID = res.userID;
        this.InitializeForm();
      } else {
        this.tokenVerified = false;
        this.tokenErrorMsg = res.message;
        jQuery('#InvalidTokenModal').modal('show');
      }
    })
  }

  InitializeForm() {
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{1,}$/)
      ])],
      confirmPassword: ['', Validators.compose([
        Validators.required
      ])]
    })
  }

  enableForm() {;
    this.resetPasswordForm.get('password').enable();
    this.resetPasswordForm.get('confirmPassword').enable();
  }

  disableForm() {
    this.resetPasswordForm.get('password').disable();
    this.resetPasswordForm.get('confirmPassword').disable();
  }

  resetPassword(valid) {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.submitted = true;
    this.disableForm();

    if (valid && this.passwordMatch) {
      this.userService.resetPassword({userID: this.userID, password: this.resetPasswordForm.get('password').value}).subscribe((res)=>{
        if(res.success){
          this.successMsg = res.message;
          this.resetPasswordForm.reset();
          this.loading = false;
          this.submitted = false;
        }else{
          this.enableForm();
          this.errorMsg = res.message;
          this.loading = false;
        }
      })
    }else{
      this.enableForm();
      this.errorMsg = "Please ensure that form is filled correctly.";
      this.loading = false;
    }
  }

  checkPassword(password, confirmPassword) {
    this.passwordMatch = false;
    this.passwordMsg = "";

    if (password.value && password.valid) {
      if (confirmPassword.value && (password.value === confirmPassword.value)) {
        this.passwordMatch = true;
      } else if (!confirmPassword.value) {
        this.passwordMatch = false;
      } else {
        this.passwordMatch = false;
        this.passwordMsg = "Password does not Match."
      }
    } else {
      this.passwordMatch = false;
    }
  }

}
