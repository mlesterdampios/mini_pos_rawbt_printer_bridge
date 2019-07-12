import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user;

  constructor(private storage: Storage) {
    storage.get('user').then((val) => {
      console.log(val);
      this.user = val;
    });
  }

  setLoggedIn(_value) {
    this.user = _value;
    console.log(_value);
    this.storage.set('user', _value);
  }

  isAuthenticated(): boolean {
    return (this.user) ? true : false;
  }

  getUser(){
    return (this.user) ? this.user : false;
  }

  logout(){
    console.log("logout");
    this.storage.clear().then(()=>{
      this.user = null;
    });
  }
}
