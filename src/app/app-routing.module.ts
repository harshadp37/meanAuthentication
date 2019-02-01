import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { NoAuthGuard } from './no-auth.guard';

import { HomeComponent } from './userComponents/home/home.component';
import { RegisterComponent } from './userComponents/register/register.component';
import { LoginComponent } from './userComponents/login/login.component';

import { ProfileComponent } from './userComponents/profile/profile.component';

import { ForgotPasswordComponent } from './resetComponents/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './resetComponents/reset-password/reset-password.component';

import { ActivationComponent } from './activationComponents/activation/activation.component';
import { ActivateComponent } from './activationComponents/activate/activate.component';

import { MeanRoutingModule } from './MEAN/mean-routing.module';

//Routes, NoAuthGuards are for which dont need Authenticated User
//        AuthGuards are for which need Authenticated User
const routes: Routes = [
  { path: "", component: HomeComponent, canActivate: [NoAuthGuard] },
  { path: "register", component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: "login", component: LoginComponent, canActivate: [NoAuthGuard] },

  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },

  { path: "forgotPassword", component: ForgotPasswordComponent, canActivate: [NoAuthGuard] },
  { path: "resetPassword/:token", component: ResetPasswordComponent, canActivate: [NoAuthGuard]},

  { path: "sendActivationLink", component: ActivationComponent, canActivate: [NoAuthGuard] },
  { path: "activate/:token", component: ActivateComponent, canActivate: [NoAuthGuard] },

  { path: "**", redirectTo: "/", pathMatch: "full" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MeanRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
