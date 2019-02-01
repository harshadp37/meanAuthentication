import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  errorMsg: String;
  successMsg: String;

  usernameMsg: String;
  ValidUsername: boolean = false;
  checkingUsername: boolean = false;

  EmailMsg: String;
  ValidEmail: boolean = false;
  checkingEmail: boolean = false;

  passwordMatch: boolean = false;
  passwordMsg = "";

  loading: boolean = false;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) { }

  ngOnInit() {

    this.registerForm = this.fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^([a-zA-Z]{3,15})\s([a-zA-Z]{3,15})$/)
      ])],
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern(/^([a-zA-Z0-9]*)$/)
      ])],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,4})$/)
      ])],
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

  enableForm() {
    this.registerForm.get('name').enable();
    this.registerForm.get('username').enable();
    this.registerForm.get('email').enable();
    this.registerForm.get('password').enable();
    this.registerForm.get('confirmPassword').enable();
  }

  disableForm() {
    this.registerForm.get('name').disable();
    this.registerForm.get('username').disable();
    this.registerForm.get('email').disable();
    this.registerForm.get('password').disable();
    this.registerForm.get('confirmPassword').disable();
  }

  onSubmit(valid) {
    this.submitted = true;
    this.loading = true;
    this.disableForm();
    this.errorMsg = '';
    this.successMsg = '';

    if (valid && this.ValidUsername && this.ValidEmail && this.passwordMatch) {
      this.userService.createUser(this.registerForm.value).subscribe((res) => {
        if (res.success) {
          this.successMsg = res.message + "...Redirecting";
          this.registerForm.reset();
          this.loading = false;
          this.submitted = false;
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 2000)
        } else {
          this.enableForm();
          this.errorMsg = res.message;
          this.loading = false;
        }
      });
    } else {
      this.enableForm();
      this.errorMsg = "Please ensure that form is filled correctly.";
      this.loading = false;
    }
  }

  checkUsername() {
    this.ValidUsername = false;
    this.usernameMsg = '';
    
    if (this.registerForm.value.username && this.registerForm.controls.username.valid) {
      this.checkingUsername = true;
      this.userService.checkUsername({ username: this.registerForm.value.username }).subscribe((res) => {
        if (res.success) {
          this.usernameMsg = res.message;
          this.ValidUsername = true;
          this.checkingUsername = false;
        } else {
          this.usernameMsg = res.message;
          this.ValidUsername = false;
          this.checkingUsername = false;
        }
      })
    }
  }

  checkEmail() {
    this.ValidEmail = false;
    this.EmailMsg = '';

    if (this.registerForm.value.email && this.registerForm.controls.email.valid) {
      this.checkingEmail = true;
      this.userService.checkEmail({ email: this.registerForm.value.email }).subscribe((res) => {
        if (res.success) {
          this.EmailMsg = res.message;
          this.ValidEmail = true;
          this.checkingEmail = false;
        } else {
          this.EmailMsg = res.message;
          this.ValidEmail = false;
          this.checkingEmail = false;
        }
      })
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
