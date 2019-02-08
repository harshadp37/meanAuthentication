import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/user.service';
import { AuthService } from 'src/app/service/auth.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  successMsg: String;
  errorMsg: String;
  loading: boolean = false;
  submitted: boolean = false;

  activationLink: boolean;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private app : AppComponent) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.compose([
        Validators.required
      ])],
      password: ['', Validators.compose([
        Validators.required
      ])]
    })
  }

  enableForm() {
    this.loginForm.get('username').enable();
    this.loginForm.get('password').enable();
  }

  disableForm() {
    this.loginForm.get('username').disable();
    this.loginForm.get('password').disable();
  }

  login(valid) {
    this.loading = true;
    this.submitted = true;
    this.disableForm();
    this.successMsg = '';
    this.errorMsg = '';
    this.activationLink = false;

    if (valid) {
      this.userService.login(this.loginForm.value).subscribe((res) => {
        if (res.success) {
          this.successMsg = res.message;
          this.loginForm.reset();
          this.submitted = false;
          this.loading = false;
          setTimeout(() => {
            this.authService.load = true;
            this.authService.setToken(res.token);
            this.app.ngOnInit();
            this.router.navigate(['/profile']);
          }, 2000)
        } else {
          if (res.activationLink) {
            this.activationLink = res.activationLink;
            this.errorMsg = res.message;
            this.loading = false;
          } else {
            this.enableForm();
            this.errorMsg = res.message;
            this.loading = false;
          }
        }
      })
    } else {
      this.enableForm();
      this.loading = false;
    }

  }

}
