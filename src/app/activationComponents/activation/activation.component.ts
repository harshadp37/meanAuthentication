import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {

  activationForm: FormGroup;

  successMsg: String;
  errorMsg: String;

  loading: boolean = false;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) { }

  ngOnInit() {
    this.activationForm = this.fb.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,4})$/)
      ])]
    })
  }

  sendActivationLink(valid) {
    this.successMsg = '';
    this.errorMsg = '';
    this.activationForm.get('email').disable();
    this.loading = true;
    this.submitted = true;

    if (valid) {
      this.userService.sendActivationLink(this.activationForm.value).subscribe((res) => {
        if (res.success) {
          this.successMsg = res.message;
          this.activationForm.reset();
          this.loading = false;
          this.submitted = false;
        } else {
          this.activationForm.get('email').enable();
          this.errorMsg = res.message;
          this.loading = false;
        }
      })
    }
  }

}
