import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;

  successMsg: String;
  errorMsg: String;

  loading: boolean = false;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) { }

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,4})$/)
      ])]
    })
  }

  sendResetLink(valid) {
    this.successMsg = '';
    this.errorMsg = '';
    this.forgotPasswordForm.get('email').disable();
    this.loading = true;
    this.submitted = true;

    if (valid) {
      this.userService.sendResetLink(this.forgotPasswordForm.value).subscribe((res) => {
        if (res.success) {
          this.successMsg = res.message;
          this.forgotPasswordForm.reset();
          this.loading = false;
          this.submitted = false;
        } else {
          if (res.activationLink) {
            this.errorMsg = res.message;
            this.loading = false;
          } else {
            this.forgotPasswordForm.get('email').enable();
            this.errorMsg = res.message;
            this.loading = false;
          }
        }
      })
    }
  }
}
