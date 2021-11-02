/*
 * @Author: zhanghongqiao 
 * @Date: 2021-11-02 09:31:11 
 * @Email: 991034150@qq.com 
 * @Description: 这是模型的静态常量配置
 * @Last Modified by: zhanghongqiao
 * @Last Modified time: 2021-11-02 16:52:30
 */
 
/** ***************************************************************** */
 
var PLANE_LENGTH = 24;  //货架板面长度
var PLANE_WIDTH = 55;   //货架板面宽度
var PLANE_HEIGHT = 2;   //货架板面高度
var HOLDER_LENGTH = 2;  //支架长度
var HOLDER_WIDTH = 2;   //支架宽度
var HOLDER_HEIGHT = 25; //支架高度
var LAYER_NUM = 3;      //货架层数
var COLUMN_NUM = 2;     //货架每层列数
var BOX_SIZE = 16;      //货物的大小(立方体)

// 货架数组
var shelf_list = new Array();
shelf_list.push({StorageZoneId:'Z1',shelfId:'A1',shelfName:'货架A1',x:-100,y:27,z:0});
shelf_list.push({StorageZoneId:'Z1',shelfId:'A2',shelfName:'货架A2',x:0,y:27,z:0});
shelf_list.push({StorageZoneId:'Z1',shelfId:'A3',shelfName:'货架A3',x:100,y:27,z:0});
shelf_list.push({StorageZoneId:'Z1',shelfId:'A4',shelfName:'货架A4',x:200,y:27,z:0});
shelf_list.push({StorageZoneId:'Z1',shelfId:'A5',shelfName:'货架A5',x:300,y:27,z:0});
shelf_list.push({StorageZoneId:'Z1',shelfId:'A6',shelfName:'货架A6',x:400,y:27,z:0});

function GET_PLANE_LENGTH(){
  return PLANE_LENGTH;
}

function GET_PLANE_WIDTH(){
  return PLANE_WIDTH;
}

function GET_PLANE_HEIGHT(){
  return PLANE_HEIGHT;
}

function GET_HOLDER_LENGTH(){
  return HOLDER_LENGTH;
}

function GET_HOLDER_WIDTH(){
  return HOLDER_WIDTH;
}

function GET_HOLDER_HEIGHT(){
  return HOLDER_HEIGHT;
}

function GET_LAYER_NUM(){
  return LAYER_NUM;
}

function GET_COLUMN_NUM(){
  return COLUMN_NUM;
}

function GET_BOX_SIZE(){
  return BOX_SIZE;
}

function GET_SHELF_LIST(){
  return shelf_list;
}
