import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeanRegistrationComponent } from './mean-registration/mean-registration.component';
import { MeanLoginComponent } from './mean-login/mean-login.component';
import { IntroAndSetupComponent } from './intro-and-setup/intro-and-setup.component';
import { NoAuthGuard } from '../no-auth.guard';

//Routes, NoAuthGuards are for which dont need Authenticated User
//        AuthGuards are for which need Authenticated User
const routes: Routes = [
    { path: 'MEAN/intro&setup', component: IntroAndSetupComponent, canActivate: [NoAuthGuard] },
    { path: 'MEAN/registration', component: MeanRegistrationComponent, canActivate:[NoAuthGuard] },
    { path: 'MEAN/login', component: MeanLoginComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class MeanRoutingModule { }
