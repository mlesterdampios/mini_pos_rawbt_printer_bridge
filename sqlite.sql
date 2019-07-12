/*
get `Order` row
*/

Select `Order`.*, `Customer`.`Name` from `Order`, `Customer` where `Order`.`Id` = 5 and `Order`.`CustomerId` = `Customer`.`Id`;

/*
get `OrderDetail` rows
*/

Select `OrderDetail`.*, `Product`.`Name` as `ProductName`, `Unit`.`Name` as `UnitName` from `OrderDetail`, `Product`, `Unit` where `OrderDetail`.`OrderId` = 5 and `OrderDetail`.`ProductId` = `Product`.`Id` and `OrderDetail`.`UnitId` = `Unit`.`Id` ;

/*
get `Setting` row
*/

Select * from `Setting` where `Id` = 1;

/*
get `PurchaseOrder` row
*/

Select `PurchaseOrder`.*, `Supplier`.`Name` from `PurchaseOrder`, `Supplier` where `PurchaseOrder`.`Id` = 2 and `PurchaseOrder`.`SupplierId` = `Supplier`.`Id`;

/*
get `PurchaseOrderDetail` rows
*/
Select `PurchaseOrderDetail`.*, `Product`.`Name` as `ProductName`, `Unit`.`Name` as `UnitName` from `PurchaseOrderDetail`, `Product`, `Unit` where `PurchaseOrderDetail`.`PurchaseOrderId` = 2 and `PurchaseOrderDetail`.`ProductId` = `Product`.`Id` and `PurchaseOrderDetail`.`UnitId` = `Unit`.`Id` ;
