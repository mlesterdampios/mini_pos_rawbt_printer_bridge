import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './authentication.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule'/*, canActivate : [AuthenticationGuard]*/ },
  { path: 'register', loadChildren: './register/register.module#RegisterPageModule'},
  /*{ path: 'api_register', loadChildren: './api_register/api_register.module#ApiRegisterPageModule'},*/
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
