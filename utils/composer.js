/*
  * 需要在jsp中导入的包
  <script src="./ThreeJs/three.js"></script>
  <script src="./ThreeJs/EffectComposer.js"></script>
  <script src="./ThreeJs/RenderPass.js"></script>
  <script src="./ThreeJs/OutlinePass.js"></script>
  <script src="./ThreeJs/FXAAShader.js"></script>
  <script src="./ThreeJs/ShaderPass.js"></script>
  <script src="./ThreeJs/CopyShader.js"></script>
  */

 THREE.ThreeJs_Composer = function ( _renderer, _scene, _camera) {
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var selectedObjects = [];

  window.addEventListener( 'click', onMouseClick);
  
  function onMouseClick( event ) {
      var x, y;
      if ( event.changedTouches ) {
          x = event.changedTouches[ 0 ].pageX;
          y = event.changedTouches[ 0 ].pageY;
      } else {
          x = event.clientX;
          y = event.clientY;
      }
      mouse.x = ( x / window.innerWidth ) * 2 - 1;
      mouse.y = - ( y / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera( mouse, _camera );
      var intersects = raycaster.intersectObjects( [ _scene ], true );

      if(intersects.length == 0){
          $("#label").attr("style","display:none;");//隐藏说明性标签
          return;
      }
      if(intersects[0].object.name == "地面" || (intersects[0].object.name == "") || (intersects[0].object.name == "墙面")){
          $("#label").attr("style","display:none;");//隐藏说明性标签
          selectedObjects.pop();
      }else{
          $("#label").attr("style","display:block;");// 显示说明性标签
          $("#label").css({left: x, top: y-40});// 修改标签的位置
          $("#label").text(intersects[0].object.name);// 显示模型信息

          selectedObjects.pop();
          selectedObjects.push( intersects[0].object );
      }
  }
}
