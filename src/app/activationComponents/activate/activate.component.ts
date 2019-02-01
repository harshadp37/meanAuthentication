import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/service/user.service';

declare var jQuery: any;

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {

  tokenVerified: boolean = false;
  tokenErrorMsg: String = '';
  tokenSuccessMsg: String = '';

  loading: boolean = false;

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.loading = true;
    this.tokenVerified = false;
    this.tokenErrorMsg = '';
    this.tokenSuccessMsg = '';

    this.userService.activateAccount(this.route.snapshot.params.token).subscribe((res) => {
      if (res.success) {
        this.tokenVerified = true;
        this.tokenSuccessMsg = res.message;
        this.loading = false;
        jQuery('#activationModal').modal('show');
      } else {
        this.tokenVerified = false;
        this.tokenErrorMsg = res.message;
        this.loading = false;
        jQuery('#activationModal').modal('show');
      }
    })
  }
}
