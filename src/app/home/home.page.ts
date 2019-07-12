import { Component, Input, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, LoadingController, AlertController, ToastController  } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { WebIntent } from '@ionic-native/web-intent/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { AppMinimize } from '@ionic-native/app-minimize/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  dbFileFullPath;
  isAutomatic;
  lastPrintedID;
  lastPrintedPurchaseID;

  timer;
  origMsTimer = 10;
  msTimer = this.origMsTimer;

  STR_PAD_LEFT = 1;
  STR_PAD_RIGHT = 2;
  STR_PAD_BOTH = 3;

  receipt_character_count = 31;
  //window.open("rawbt:base64,"+btoa(this.reciept_template),"_system","location=yes");
  constructor(private appMinimize: AppMinimize, private sqliteDbCopy: SqliteDbCopy, private sqlitePorter: SQLitePorter, private androidPermissions: AndroidPermissions, private sqlite: SQLite, private webIntent: WebIntent, private iab: InAppBrowser, private transfer: FileTransfer, private fileChooser: FileChooser, private file: File, private nav: NavController, private storage: Storage, public alertController: AlertController, private router: Router,public loadingCtrl: LoadingController, public toastController: ToastController, private http: HttpClient) { 
    console.log(this.file.dataDirectory);
    storage.get('settings').then((val) => {
      if(val==null || val==undefined){
        let UUID = this.generateUUID();
        this.storage.set('settings', {dbFileFullPath: "", isAutomatic: true, lastPrintedID: 0, origMsTimer: 10, lastPrintedPurchaseID: 0});
        this.dbFileFullPath = "";
        this.isAutomatic = true;
        this.lastPrintedID = 0;
        this.lastPrintedPurchaseID = 0;
        this.origMsTimer = 10;
        this.msTimer = this.origMsTimer;
      }else{
        this.dbFileFullPath = val.dbFileFullPath;
        this.isAutomatic = val.isAutomatic;
        this.lastPrintedID = val.lastPrintedID;
        this.lastPrintedPurchaseID = val.lastPrintedPurchaseID;
        this.origMsTimer = val.origMsTimer;
        this.msTimer = val.origMsTimer;
      }
      this.StartTimer();
    });
  }

  loadDb(){
    this.fileChooser.open().then(uri => 
      this.dbFileFullPath = uri
    );
  }
  //storeInfo
  /*
  {
    StoreName: "",
    Address: "",
    Mobile: "",
  }
  */

  //order
  /*
    {
      Id: 1,
      OrderNumber: "",
      TotalPrice: 0,
      Name: "",
      Notes: "",
      OrderDate: 0,
      items: [{
        ProductName: "",
        Quantity: 0,
        Price: 0,
      }]
    };
  */

  //purchaseOrder
  /*
    {
      Id: 1,
      PurchaseOrderNumber: "",
      PurchaseTotalPrice: 0,
      Name: "",
      Notes: "",
      PurchaseOrderDate: 0,
      items: [{
        ProductName: "",
        PurchaseQuantity: 0,
        PurchasePrice: 0,
      }]
    };
  */
  structLayout(storeInfo, order){
    var printable = "";
    //header
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    printable += this.pad(storeInfo.StoreName,this.receipt_character_count," ",3, storeInfo.StoreName);
    printable += this.pad(storeInfo.Address,this.receipt_character_count," ",3, storeInfo.Address);
    printable += this.pad("Contact: "+storeInfo.Mobile,this.receipt_character_count," ",3, storeInfo.Mobile);
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    //order details
    printable += this.pad("Order No: "+order.OrderNumber,this.receipt_character_count," ",2, order.OrderNumber);
    printable += this.pad("Bill To: "+order.Name,this.receipt_character_count," ",2, order.Name);
    printable += this.pad("Date: "+(new Date(order.OrderDate)).toLocaleString(),this.receipt_character_count," ",2, order.OrderDate);
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    //header-end
    //body
    for(var i = 0; i < order.items.length; i++){
      printable += this.pad(order.items[i].ProductName,this.receipt_character_count," ",2, "");
      printable += this.pad(order.items[i].Quantity+" X P"+(order.items[i].Price / order.items[i].Quantity).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),this.receipt_character_count," ",1, "");
    }
    //body-end
    //footer
    //notes
    printable += this.pad("",this.receipt_character_count,"*",3, "");
    printable += this.pad("Notes: "+order.Notes,this.receipt_character_count," ",2, order.Notes);
    printable += this.pad("",this.receipt_character_count,"*",3, order.Notes);
    //notes-end
    printable += this.pad("Total: "+order.TotalPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')+" Php",this.receipt_character_count," ",1, order.TotalPrice);
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    console.log(printable);
    return printable;
  }

  structLayoutPurchase(storeInfo, purchaseOrder){
    var printable = "";
    //header
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    printable += this.pad(storeInfo.StoreName,this.receipt_character_count," ",3, storeInfo.StoreName);
    printable += this.pad(storeInfo.Address,this.receipt_character_count," ",3, storeInfo.Address);
    printable += this.pad("Contact: "+storeInfo.Mobile,this.receipt_character_count," ",3, storeInfo.Mobile);
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    //order details
    printable += this.pad("Purchase Order No: "+purchaseOrder.PurchaseOrderNumber,this.receipt_character_count," ",2, purchaseOrder.PurchaseOrderNumber);
    printable += this.pad("Supplier: "+purchaseOrder.Name,this.receipt_character_count," ",2, purchaseOrder.Name);
    printable += this.pad("Date: "+(new Date(purchaseOrder.PurchaseOrderDate)).toLocaleString(),this.receipt_character_count," ",2, purchaseOrder.PurchaseOrderDate);
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    //header-end
    //body
    for(var i = 0; i < purchaseOrder.items.length; i++){
      printable += this.pad(purchaseOrder.items[i].ProductName,this.receipt_character_count," ",2, "");
      printable += this.pad(purchaseOrder.items[i].PurchaseQuantity+" X P"+(purchaseOrder.items[i].PurchasePrice / purchaseOrder.items[i].PurchaseQuantity).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),this.receipt_character_count," ",1, "");
    }
    //body-end
    //footer
    //notes
    printable += this.pad("",this.receipt_character_count,"*",3, "");
    printable += this.pad("Notes: "+purchaseOrder.Notes,this.receipt_character_count," ",2, purchaseOrder.Notes);
    printable += this.pad("",this.receipt_character_count,"*",3, purchaseOrder.Notes);
    //notes-end
    printable += this.pad("Total: "+purchaseOrder.PurchaseTotalPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')+" Php",this.receipt_character_count," ",1, purchaseOrder.PurchaseTotalPrice);
    printable += this.pad("",this.receipt_character_count,"-",3, "");
    console.log(printable);
    return printable;
  }

  pad(str, len, pad, dir, checkIfNull) {
    if (checkIfNull == null) return "";
      if (typeof(len) == "undefined") { len = 0; }
      if (typeof(pad) == "undefined") { pad = ' '; }
      if (typeof(dir) == "undefined") { dir = this.STR_PAD_RIGHT; }
  
      if (len + 1 >= str.length) {
          switch (dir){
              case this.STR_PAD_LEFT:
                  str = Array(len + 1 - str.length).join(pad) + str;
              break;
              case this.STR_PAD_BOTH:
                  var padlen = len - str.length;
                  var right = Math.ceil( padlen / 2 );
                  var left = padlen - right;
                  str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
              break;
              default:
                  str = str + Array(len + 1 - str.length).join(pad);
              break;
          } // switch
      }
      return str + "\n";
  }

  initialize(){
    let filepath = this.dbFileFullPath.substring(0, this.dbFileFullPath.lastIndexOf('/') + 1);
    let filename = this.dbFileFullPath.substring(this.dbFileFullPath.lastIndexOf('/') + 1, this.dbFileFullPath.length);
    console.log(filepath+filename);
    this.file.checkFile(filepath, filename).then((file) => {
        console.log("File found: " + file);
        this.PrintOrder();
      }
    ).catch(
      (err) => {
        this.presentToast("File not found");
      }
    );
  }

  print(content){
    this.iab.create("rawbt:base64,"+btoa(content),"_system");
    console.log("rawbt:base64,"+btoa(content));
  }
  //storeInfo
  /*
  {
    StoreName: "",
    Address: "",
    Mobile: "",
  }
  */

  //order
  /*
    {
      Id: 1,
      OrderNumber: "",
      TotalPrice: 0,
      Name: "",
      Notes: "",
      OrderDate: 0,
      items: [{
        ProductName: "",
        Quantity: 0,
        Price: 0,
      }]
    };
  */
    databaseExec(isExist, filename){
      this.sqliteDbCopy.copyDbFromStorage(filename, 2, this.dbFileFullPath, isExist).then(()=>{
        console.log("Coppied DB from storage location to arbitrary location.");
        //execute commands
        this.sqlite.create({
          name: filename,
          location: 'default'
        }).then((db: SQLiteObject) => {
            db.executeSql('Select * from `Setting` where `Id` = 1;', []).then((ret_store) => {
              var storeInfo = JSON.parse(ret_store.rows.item(0).Data);
              console.log("storeInfo");
              console.log(storeInfo);
              //ORDER====================================================================================================================
              db.executeSql('Select `Order`.*, `Customer`.`Name` from `Order`, `Customer` where `Order`.`Id` = '+(this.lastPrintedID+1)+' and `Order`.`CustomerId` = `Customer`.`Id`;', []).then((ret) => {
                //get 1st row only
                //order
                  console.log("order_single");
                  console.log(ret.rows.item(0));
                  var order = ret.rows.item(0);
                  if(order && order!=null && order!=undefined){
                    //get orderdetails rows
                    db.executeSql('Select `OrderDetail`.*, `Product`.`Name` as `ProductName`, `Unit`.`Name` as `UnitName` from `OrderDetail`, `Product`, `Unit` where `OrderDetail`.`OrderId` = '+(this.lastPrintedID+1)+' and `OrderDetail`.`ProductId` = `Product`.`Id` and `OrderDetail`.`UnitId` = `Unit`.`Id` ;', []).then((ret2) => {
                      //get 1st row only
                      //order
                      var _temp = [];
                      for(var i=0; i < ret2.rows.length; i++){
                        console.log("orderdetail");
                        console.log(ret2.rows.item(i));
                        _temp.push(ret2.rows.item(i));
                      }
                      if(_temp){
                        order["items"]= _temp;
                        console.log("Order");
                        console.log(order);
                        this.print(this.structLayout(storeInfo, order));
                        this.lastPrintedID++;
                        this.storage.set('settings', {dbFileFullPath:this.dbFileFullPath, isAutomatic:this.isAutomatic, lastPrintedID: this.lastPrintedID, origMsTimer: this.origMsTimer, lastPrintedPurchaseID: this.lastPrintedPurchaseID});
                      }
                    }).catch((e) => {
                        console.log(e)
                    });
                  }
              }).catch((e) => {
                  console.log(e)
              });
              //ORDER====================================================================================================================
            }).catch((e) => {
                console.log(e)
            });

          }).catch((e) => {
            console.log(e)
          });
          //another_instance==============================================================================================
          this.sqlite.create({
            name: filename,
            location: 'default'
          }).then((db: SQLiteObject) => {
            db.executeSql('Select * from `Setting` where `Id` = 1;', []).then((ret_store) => {
              var storeInfo = JSON.parse(ret_store.rows.item(0).Data);
              console.log("storeInfo");
              console.log(storeInfo);
              //PURCHASEORDER====================================================================================================================
              db.executeSql('Select `PurchaseOrder`.*, `Supplier`.`Name` from `PurchaseOrder`, `Supplier` where `PurchaseOrder`.`Id` = '+(this.lastPrintedPurchaseID+1)+' and `PurchaseOrder`.`SupplierId` = `Supplier`.`Id`;', []).then((ret) => {
                //get 1st row only
                //purchaseOrder
                  console.log("purchaseOrder_single");
                  console.log(ret.rows.item(0));
                  var purchaseOrder = ret.rows.item(0);
                  if(purchaseOrder && purchaseOrder!=null && purchaseOrder!=undefined){
                    //get orderdetails rows
                    db.executeSql('Select `PurchaseOrderDetail`.*, `Product`.`Name` as `ProductName`, `Unit`.`Name` as `UnitName` from `PurchaseOrderDetail`, `Product`, `Unit` where `PurchaseOrderDetail`.`PurchaseOrderId` = '+(this.lastPrintedPurchaseID+1)+' and `PurchaseOrderDetail`.`ProductId` = `Product`.`Id` and `PurchaseOrderDetail`.`UnitId` = `Unit`.`Id`;', []).then((ret2) => {
                      //get 1st row only
                      //order
                      var _temp = [];
                      for(var i=0; i < ret2.rows.length; i++){
                        console.log("purchaseOrderdetail");
                        console.log(ret2.rows.item(i));
                        _temp.push(ret2.rows.item(i));
                      }
                      if(_temp){
                        purchaseOrder["items"]= _temp;
                        console.log("purchaseOrder");
                        console.log(purchaseOrder);
                        this.print(this.structLayoutPurchase(storeInfo, purchaseOrder));
                        this.lastPrintedPurchaseID++;
                        this.storage.set('settings', {dbFileFullPath:this.dbFileFullPath, isAutomatic:this.isAutomatic, lastPrintedID: this.lastPrintedID, origMsTimer: this.origMsTimer, lastPrintedPurchaseID: this.lastPrintedPurchaseID});
                      }
                    }).catch((e) => {
                        console.log(e)
                    });
                  }
              }).catch((e) => {
                  console.log(e)
              });
              //PURCHASEORDER====================================================================================================================
            }).catch((e) => {
                console.log(e)
            });
  
          }).catch((e) => {
            console.log(e)
          });
          //another_instance-end==============================================================================================
      }).catch((err)=>{
        console.log(err);
      });
    }
  PrintOrder(){
    let filepath = this.dbFileFullPath.substring(0, this.dbFileFullPath.lastIndexOf('/') + 1);
    let filename = this.dbFileFullPath.substring(this.dbFileFullPath.lastIndexOf('/') + 1, this.dbFileFullPath.length);
    //request permission
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(result => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(result => {
        //copy db from storage to arbitrary
        console.log("Permissions Ok. Ready to read database "+filepath+filename);
        this.file.resolveLocalFilesystemUrl(this.file.applicationStorageDirectory + "/databases/"+filename).then(()=>{
          this.databaseExec(true,filename)
        }).catch(()=>{
          this.databaseExec(false,filename)
        });
      },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      );
    },
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
    );
  }

  StartTimer(){
    this.timer = setTimeout(x => 
      {
          this.msTimer -= 1;
          console.log(this.msTimer);
          if(this.msTimer>0){
            this.StartTimer();
          }
          if(this.msTimer <= 0) {
            this.msTimer = this.origMsTimer;
            this.StartTimer();
            if(this.isAutomatic){
              this.initialize();
            }
          }
      }, 1000);
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
    if((this.dbFileFullPath))
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

  minimizeApp(){
    this.appMinimize.minimize();
  }
  submit(){
    let loading = this.loadingFunction("Please wait...");
    if(this.validateInputs()){
      this.storage.set('settings', {dbFileFullPath:this.dbFileFullPath, isAutomatic:this.isAutomatic, lastPrintedID: this.lastPrintedID, origMsTimer: this.origMsTimer, lastPrintedPurchaseID: this.lastPrintedPurchaseID});
        loading.then(()=>{
          this.loadingCtrl.dismiss();
          this.successShow("Changes has been saved!. Please restart the app to take effect.");
        });
    }else{
      loading.then(()=>{
        this.loadingCtrl.dismiss();
      });
      this.alertShow("Fill all fields with correct data");
    }
  }
}
