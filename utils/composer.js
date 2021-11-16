var door_state_left1 = true; //默认是门是关闭的
var door_state_right1 = true; //默认是门是关闭的
var door_state_left2 = true; //默认是门是关闭的
var door_state_right2 = true; //默认是门是关闭的


THREE.ThreeJs_Composer = function (_renderer, _scene, _camera, _options, _selectobject) {
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var selectedObjects = [];

  window.addEventListener('click', onMouseClick);

  function onMouseClick(event) {
    var x, y;
    if (event.changedTouches) {
      x = event.changedTouches[0].pageX;
      y = event.changedTouches[0].pageY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = - (y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    var intersects = raycaster.intersectObjects([_scene], true);

    if (intersects.length == 0) {
      $("#label").attr("style", "display:none;");//隐藏说明性标签
      return;
    }
    if (intersects[0].object.name == "地面" || (intersects[0].object.name == "") || (intersects[0].object.name == "墙面")) {
      $("#label").attr("style", "display:none;");//隐藏说明性标签
      selectedObjects.pop();
    } else {
      $("#label").attr("style", "display:block;");// 显示说明性标签
      $("#label").css({ left: x, top: y - 40 });// 修改标签的位置
      $("#label").text(intersects[0].object.name);// 显示模型信息

      selectedObjects.pop();
      selectedObjects.push(intersects[0].object);
    }

    var Msg = intersects[0].object.name.split("$");
    if(Msg[0] == "货物") {
      _options.batchNo = "一个货物";
      _options.qty = "100";
      _options.qtyUom = "kg";
      _options.qty2 = "10";
      _options.selectObj = intersects[0].object.name;
      _selectobject.push( intersects[0].object );
    }

    if (intersects[0].object.name == "左门1") {
      if (door_state_left1) {
        new TWEEN.Tween(intersects[0].object.rotation).to({
          y: -0.5 * Math.PI
        }, 5000).easing(TWEEN.Easing.Elastic.Out).onComplete(function () {
        }).start();
        door_state_left1 = false;
      } else {
        new TWEEN.Tween(intersects[0].object.rotation).to({
          y: 0
        }, 5000).easing(TWEEN.Easing.Elastic.Out).onComplete(function () {
        }).start();
        door_state_left1 = true;
      }
    }  

  }
}
