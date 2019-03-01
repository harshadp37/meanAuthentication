import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';

import { UserService } from './service/user.service';
import { AuthService } from './service/auth.service';

import { AuthInterceptor } from './auth-interceptor';

import { AppComponent } from './app.component';

import { HomeComponent } from './userComponents/home/home.component';
import { RegisterComponent } from './userComponents/register/register.component';
import { LoginComponent } from './userComponents/login/login.component';

import { ProfileComponent } from './userComponents/profile/profile.component';

import { ForgotPasswordComponent } from './resetComponents/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './resetComponents/reset-password/reset-password.component';

import { ActivationComponent } from './activationComponents/activation/activation.component';
import { ActivateComponent } from './activationComponents/activate/activate.component';

import { MeanRegistrationComponent } from './MEAN/mean-registration/mean-registration.component';
import { SidePanelComponent } from './MEAN/side-panel/side-panel.component';
import { MEANdataService } from './service/meandata.service';
import { MeanLoginComponent } from './MEAN/mean-login/mean-login.component';
import { IntroAndSetupComponent } from './MEAN/intro-and-setup/intro-and-setup.component';
import { CommentsComponent } from './MEAN/comments/comments.component';
import { CommentService } from './service/comment.service';
import { NotificationService } from './service/notification.service';
import { NotificationDateFormatPipe } from './notification-date-format.pipe';
import { ProfileDetailsComponent } from './userComponents/profile/profile-details/profile-details.component';
import { RecentActivityComponent } from './userComponents/profile/recent-activity/recent-activity.component';
import { AccountSettingComponent } from './userComponents/profile/account-setting/account-setting.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ActivationComponent,
    ActivateComponent,
    MeanRegistrationComponent,
    SidePanelComponent,
    MeanLoginComponent,
    IntroAndSetupComponent,
    CommentsComponent,
    NotificationDateFormatPipe,
    ProfileDetailsComponent,
    RecentActivityComponent,
    AccountSettingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    UserService,
    AuthService,
    MEANdataService,
    CommentService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
