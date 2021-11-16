/*
 * @Author: zhanghongqiao 
 * @Date: 2021-11-01 09:12:14 
 * @Email: 991034150@qq.com 
 * @Description: 3D仓库显示模型存放的地方
 * @Last Modified by: zhanghongqiao
 * @Last Modified time: 2021-11-03 11:20:50
 */


//模型材质信息
var planeMat, RackMat, RackMat2, CargoMat, LineMat, RollTexture, RollMat;
//库区信息
var storageZoneSize = 0, storageZoneList = [];
//货架信息
var shelfSize = 0, shelfList = [];
//货位信息
var storageUnitSize = 0, storageUnitList = [];
//货物信息
var cargoSize = 0, cargoList = [], CargosExist;


/** 初始化材质信息 */
function initMat() {
  planeMat = new THREE.MeshLambertMaterial();
  RackMat = new THREE.MeshLambertMaterial();
  RackMat2 = new THREE.MeshPhongMaterial({color:0x1C86EE});
  CargoMat = new THREE.MeshLambertMaterial();
  LineMat = new THREE.MeshLambertMaterial();
  RollMat = new THREE.MeshLambertMaterial();

  new THREE.TextureLoader().load( './images/plane.png', function( map ) {
      planeMat.map = map;
      planeMat.transparent = true;
      planeMat.opacity = 0.8;
      planeMat.needsUpdate = true;
  } );
  new THREE.TextureLoader().load( "./images/rack.png", function( map ) {
      RackMat.map = map;
      RackMat.needsUpdate = true;
  } );
  new THREE.TextureLoader().load( "./images/box.png", function( map ) {
      CargoMat.map = map;
      CargoMat.needsUpdate = true;
  } );
  new THREE.TextureLoader().load( "./images/line.png", function( map ) {
      LineMat.map = map;
      LineMat.needsUpdate = true;
  } );
  RollTexture = new THREE.TextureLoader().load( "./images/biaoyu.png", function( map ) {
      RollMat.map = map;
      RollMat.needsUpdate = true;
      RollMat.transparent = true;
      RollMat.side = THREE.DoubleSide;
  } );
  RollTexture.wrapS = THREE.RepeatWrapping;
  RollTexture.wrapT=THREE.RepeatWrapping;
}

//region 放置天空盒
function addSkybox( size,scene ) {
  urls = [
      './images/skybox/远山_RT.jpg', // right
      './images/skybox/远山_LF.jpg', // left
      './images/skybox/远山_UP.jpg', // top
      './images/skybox/远山_DN.jpg', // bottom
      './images/skybox/远山_BK.jpg', // back
      './images/skybox/远山_FR.jpg'  // front
  ];
  // 环境贴图
  var skyboxCubemap = new THREE.CubeTextureLoader().load( urls );
  skyboxCubemap.format = THREE.RGBFormat;

  var skyboxShader = THREE.ShaderLib['cube'];
  skyboxShader.uniforms['tCube'].value = skyboxCubemap;
  var obj = new THREE.Mesh(
      new THREE.BoxGeometry( size, size, size ),
      new THREE.ShaderMaterial({
          fragmentShader : skyboxShader.fragmentShader,
          vertexShader : skyboxShader.vertexShader,
          uniforms : skyboxShader.uniforms,
          depthWrite : false,
          side : THREE.BackSide
      })
  );
  scene.add( obj );
}

//region 库区
/** 放置虚线框区域和库区名称 */
/**
 * region 库区 (放置虚线框区域和库区名称)
 * @param {Number} x 库区的位置
 * @param {Number} z 库区的位置
 * @param {Number} width 宽度
 * @param {Number} length 长度
 * @param {Object} scene 场景
 * @param {String} name 库区的名字，用美元符号分隔，即 “库区英文ID$库区中文名”
 * @param {String} textColor 显示文字的颜色 使用十六进制颜色代码
 * @param {Number} font_size 字体的大小
 * @param {String} textposition 文字的位置，我这里提供了“左对齐”、“居中”、“右对齐”三种方式。
 */
function addArea(x, z, width, length, scene, name, textColor, font_size, textposition) {
  var geometry = new THREE.PlaneGeometry(width, length);
  var obj = new THREE.Mesh(geometry, planeMat);
  obj.position.set(x, 1.5, z);
  obj.rotation.x = -Math.PI / 2.0;
  obj.name = "库区" + "$" + name.split("$")[1];
  scene.add(obj);

  new THREE.FontLoader().load('./data/FZYaoTi_Regular.json', function (font) {
    // 加入立体文字
    var text = new THREE.TextGeometry(name.split("$")[1], {
      // 设定文字字体
      font: font,
      //尺寸
      size: font_size,
      //厚度
      height: 0.01
    });
    text.computeBoundingBox();
    //3D文字材质
    var m = new THREE.MeshStandardMaterial({ color: "#" + textColor });
    var mesh = new THREE.Mesh(text, m)
    if (textposition == "左对齐") {
      mesh.position.x = x - width / 2 + 10;
    } else if (textposition == "居中") {
      mesh.position.x = x - 15;
    } else if (textposition == "右对齐") {
      mesh.position.x = x + width / 2 - 60;
    }
    mesh.position.y = 1.3;
    mesh.position.z = z + length / 2 - 20;
    mesh.rotation.x = -Math.PI / 2.0;
    scene.add(mesh);
  });
}
//endregion


//创建货架对象
function shelf(storageZoneId, shelfId, shelfName,
  planeLength, planeWidth, planeHeight,
  holderLength, holderWidth, holderHeight,
  positionX, positionY, positionZ,
  layerNum, columnNum) {
  this.storageZoneId = storageZoneId;
  this.shelfId = shelfId;
  this.shelfName = shelfName;
  this.planeLength = planeLength;
  this.planeWidth = planeWidth;
  this.planeHeight = planeHeight;
  this.holderLength = holderLength;
  this.holderWidth = holderWidth;
  this.holderHeight = holderHeight;
  this.positionX = positionX;
  this.positionY = positionY;
  this.positionZ = positionZ;
  this.layerNum = layerNum;
  this.columnNum = columnNum;
}

//根据货架编码获取货架对象
function getShelfById(shelfId) {
  for (var i = 0; i < shelfSize; i++) {
    if (shelfList[i].shelfId == shelfId) {
      return shelfList[i];
    }
  }
}

//创建货位对象
function storageUnit(storageZoneId, shelfId, shelfName,
  inLayerNum, inColumnNum,
  positionX, positionY, positionZ, storageUnitId) {
  this.storageZoneId = storageZoneId;
  this.shelfId = shelfId;
  this.shelfName = shelfName;
  this.inLayerNum = inLayerNum;
  this.inColumnNum = inColumnNum;
  this.positionX = positionX;
  this.positionY = positionY;
  this.positionZ = positionZ;
  this.storageUnitId = storageUnitId;
}

//根据货架ID、层数、列数获取货位对象
function getStorageUnitById(shelfId, inLayerNum, inColumnNum) {  
  for (var i = 0; i < storageUnitSize; i++) { 
    if (storageUnitList[i].shelfId == shelfId && storageUnitList[i].inLayerNum == inLayerNum && storageUnitList[i].inColumnNum == inColumnNum) { 
      return storageUnitList[i]; 
    } 
  }
  // return storageUnitList[0]
}

//根据库位编码获取货位对象
function getStorageUnitByUnitId(storageUnitId) {
  for (var i = 0; i < storageUnitSize; i++) {
    if (storageUnitList[i].storageUnitId == storageUnitId) {
      return storageUnitList[i];
    }
  }
}


//region 货架货位

/** 放置单层货架 */
/** x,y,z 整个模型在场景中的位置 */
/** plane_x,plane_y,plane_z 货架板面的长高宽 */
/** holder_x,holder_y,holder_z 货架支架的长高宽 */
/** scene,name,num 要添加的场景,货架的名字,单层货架的库位数量 */
function addRack(x,y,z,plane_x,plane_y,plane_z,holder_x,holder_y,holder_z,scene,name,num) { 
  var plane = new THREE.BoxGeometry( plane_x, plane_y, plane_z/num );
  var gz = [];
  for(var i = 0; i < num; i++){
      gz.push( z + plane_z/num/2 + (plane_z/num)*i );
      var obj = new THREE.Mesh( plane, RackMat );
      obj.position.set(x , y, gz[i]) ;
      var msg = name+"$"+(2-i);

      var storageUnitId = msg.split("$")[1] + "$" + msg.split("$")[3] + "$" + msg.split("$")[4];

      //添加货位
      var storageUnit_obj = new storageUnit(msg.split("$")[0],
          msg.split("$")[1],
          msg.split("$")[2],
          msg.split("$")[3],
          msg.split("$")[4],
          x, y, gz[i], storageUnitId);
 
      storageUnitList.push(storageUnit_obj);
      storageUnitSize++;

      var Unit = getStorageUnitById(msg.split("$")[1],msg.split("$")[3],msg.split("$")[4]);
      obj.name = "货位"+"$"+Unit.storageUnitId;
      scene.add(obj);
  }

  var holder = new THREE.BoxGeometry( holder_x, holder_y, holder_z );
  var obj2 = new THREE.Mesh( holder, RackMat2 );
  var obj3 = new THREE.Mesh( holder, RackMat2 );
  var obj4 = new THREE.Mesh( holder, RackMat2 );
  var obj5 = new THREE.Mesh( holder, RackMat2 );

  obj2.position.set(x-plane_x/2+holder_x/2,y-holder_y/2-plane_y/2,z+holder_z/2);
  obj3.position.set(x+plane_x/2-holder_x/2,y-holder_y/2-plane_y/2,z+holder_z/2);
  obj4.position.set(x-plane_x/2+holder_x/2,y-holder_y/2-plane_y/2,z+plane_z-holder_z/2);
  obj5.position.set(x+plane_x/2-holder_x/2,y-holder_y/2-plane_y/2,z+plane_z-holder_z/2);
  scene.add(obj2);scene.add(obj3);scene.add(obj4);scene.add(obj5);
}

/** 放置一叠货架 */
/** stack_num 货架的叠数 */
function addStackOfRack(x,y,z,plane_x,plane_y,plane_z,holder_x,holder_y,holder_z,scene,name,num,stack_num) {
  for(var i = 0; i < stack_num; i++){
      addRack(x,y*(i+1),z,plane_x,plane_y,plane_z,holder_x,holder_y,holder_z,scene,name+"$"+(i+1),num);
  }
}

/** 根据货架配置添加货架 */
function addShelf(scene) {
  var shelf_list = GET_SHELF_LIST();
  shelfSize = shelf_list.length;
  for(var i = 0; i < shelfSize; i++){
      var shelf_obj = new shelf(shelf_list[i].StorageZoneId,
          shelf_list[i].shelfId,
          shelf_list[i].shelfName,
          PLANE_LENGTH,PLANE_WIDTH,PLANE_HEIGHT,
          HOLDER_LENGTH,HOLDER_WIDTH,HOLDER_HEIGHT,
          shelf_list[i].x,
          shelf_list[i].y,
          shelf_list[i].z,
          LAYER_NUM,COLUMN_NUM);
      shelfList.push(shelf_obj);
  }
  console.log('shelfSize', shelfSize)
  for(var i = 0;i < shelfSize; i++){
      addStackOfRack(shelfList[i].positionX,shelfList[i].positionY,shelfList[i].positionZ,shelfList[i].planeLength,shelfList[i].planeHeight,shelfList[i].planeWidth,shelfList[i].holderLength,shelfList[i].holderHeight,shelfList[i].holderWidth,scene,shelfList[i].storageZoneId+"$"+shelfList[i].shelfId+"$"+shelfList[i].shelfName,shelfList[i].columnNum,shelfList[i].layerNum);
  }
}


//region 货物
/** 放置单个货物 */
function addCargo(x,y,z,box_x,box_y,box_z,scene,name) {
  var geometry = new THREE.BoxGeometry( box_x, box_y, box_z );
  var obj = new THREE.Mesh( geometry, CargoMat );
  obj.position.set(x,y,z);
  obj.name = name;
  scene.add(obj);
}

/** 添加单个货位上的货物 */
function addOneUnitCargos(shelfId,inLayerNum,inColumnNum,scene) {
  var storageUnit = getStorageUnitById(shelfId,inLayerNum,inColumnNum);
  // if(!storageUnit) {
  //   return
  // } 
  var shelf = getShelfById(storageUnit.shelfId);
  var storageUnitid = storageUnit.storageUnitId; 
  var x = storageUnit.positionX;
  var y = storageUnit.positionY + 8 + shelf.planeHeight/2;
  var z = storageUnit.positionZ;
  addCargo(x,y,z,16,16,16,scene,"货物"+"$"+storageUnitid)
}
//endregion
