import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor(private router : Router, private auth : AuthenticationService) {}
  
  canActivate(): boolean {
    let value = this.auth.isAuthenticated() // <= from auth service
    if (!value) {
      this.router.navigate(["api_register"]);
    }
    return value
  }
}
