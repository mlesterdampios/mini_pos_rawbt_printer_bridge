import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  apiServer;
  imgUrl;
  webServer;
  schoolName;
  key;
  token;
  maxWidth;
  maxHeight;
  gateName;
  announcementImg;
  backgroundImg;
  bgMaxWidth;
  bgMaxHeight;
  announcementMaxWidth;
  announcementMaxHeight;
  constructor(private nav: NavController, private storage: Storage, public alertController: AlertController, private router: Router,public loadingCtrl: LoadingController, public toastController: ToastController, private http: HttpClient) { 
    storage.get('settings').then((val) => {
      if(val==null || val==undefined){
        let UUID = this.generateUUID();
        this.storage.set('settings', {key: "", announcementMaxWidth:"600", announcementMaxHeight:"600", bgMaxWidth:"600", bgMaxHeight:"600", token: UUID, apiServer:"http://localhost/school_rfid_api/", imgUrl:"http://localhost/school_mgmt_sys/uploads/student_images/no_image.png", webServer:"http://localhost/school_mgmt_sys/", schoolName:"Demo", maxWidth : "600", maxHeight : "600", gateName: "Gate 1", announcementImg : "https://d31v04zdn5vmni.cloudfront.net/blog/wp-content/uploads/2018/03/ultimate-guide-to-background-images-in-email-690x362.png", backgroundImg : "https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_960_720.jpg"});
        this.key = "";
        this.token = UUID;
        this.apiServer = "http://localhost/school_rfid_api/";
        this.imgUrl = "http://localhost/school_mgmt_sys/uploads/student_images/no_image.png";
        this.webServer = "http://localhost/school_mgmt_sys/";
        this.schoolName = "Demo";
        this.maxWidth = "600";
        this.maxHeight = "600";
        this.gateName = "Gate 1";
        this.announcementImg = "https://d31v04zdn5vmni.cloudfront.net/blog/wp-content/uploads/2018/03/ultimate-guide-to-background-images-in-email-690x362.png";
        this.backgroundImg = "https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_960_720.jpg";
        this.bgMaxWidth = "600";
        this.bgMaxHeight = "600";
        this.announcementMaxWidth = "600";
        this.announcementMaxHeight = "600";
      }else{
        this.key = val.key;
        this.token = val.token;
        this.apiServer = val.apiServer;
        this.imgUrl = val.imgUrl;
        this.webServer = val.webServer;
        this.schoolName = val.schoolName;
        this.maxWidth = val.maxWidth;
        this.maxHeight = val.maxHeight;
        this.gateName = val.gateName;
        this.announcementImg = val.announcementImg;
        this.backgroundImg = val.backgroundImg;
        this.bgMaxWidth = val.bgMaxWidth;
        this.bgMaxHeight = val.bgMaxHeight;
        this.announcementMaxWidth = val.announcementMaxWidth;
        this.announcementMaxHeight = val.announcementMaxHeight;
      }
    });
  }

  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  ngOnInit() {
  }

  validateInputs(){
    if((this.apiServer) && (this.imgUrl) && (this.webServer) && (this.schoolName))
    {
      return true;
    }
    return false;
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async loadingFunction(loadmsg) {
    const loader = await this.loadingCtrl.create({
      message: loadmsg
    })
    return await loader.present();
  }

  async alertShow(pSubHeader){
    const alert = await this.alertController.create({
      header: 'Error',
      subHeader: pSubHeader,
      message: 'Please check your inputs.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async successShow(pSubHeader){
    const alert = await this.alertController.create({
      header: 'Success',
      message: pSubHeader,
      buttons: ['OK']
    });
    await alert.present();
  }

  submit(){
    let loading = this.loadingFunction("Please wait...");
    if(this.validateInputs()){
      this.storage.set('settings', {key: this.key, announcementMaxWidth:this.announcementMaxWidth, announcementMaxHeight: this.announcementMaxHeight, bgMaxWidth: this.bgMaxWidth, bgMaxHeight:this.bgMaxHeight, token: this.token, apiServer:this.apiServer, imgUrl:this.imgUrl, webServer:this.webServer, schoolName:this.schoolName, maxHeight: this.maxHeight, maxWidth: this.maxWidth, gateName: this.gateName , announcementImg: this.announcementImg, backgroundImg: this.backgroundImg});
        loading.then(()=>{
          this.loadingCtrl.dismiss();
          this.successShow("Please reload the app to apply changes!");
          this.nav.pop();
        });
    }else{
      loading.then(()=>{
        this.loadingCtrl.dismiss();
      });
      this.alertShow("Fill all fields with correct data");
    }
  }
}
