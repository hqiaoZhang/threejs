(function (W,doc,U) {
    let  scene,camera ,renderer,el
    /**
     * 初始化
     * @param data
     * @param callback
     */
    const init = (data,callback) => {
        el =  data.el
        const  width = el.offsetWidth, height = el.offsetHeight,asp =  width / height

        //渲染器
        renderer = new THREE.WebGLRenderer({antialias : true, alpha: true});
        renderer.setSize(width, height);
        el.append(renderer.domElement);
        renderer.setClearColor(data.clearColor||'#000')

        //场景
        scene = new THREE.Scene()

        //相机
        if(data.cameraType === 2)
            camera = new THREE.OrthographicCamera(-5 * asp,5 * asp, 5, -5, 1, 100)
        else{
            camera = new THREE.PerspectiveCamera(45, asp, 1, 10000)
            const  onResize = () =>{
                camera.aspect = el.offsetWidth / el.offsetHeight
                renderer.setSize(el.offsetWidth, el.offsetHeight) //重新获取
                camera.updateProjectionMatrix()
                renderer.render(scene,camera)
            }
            W.addEventListener('resize', onResize, false)
        }

        camera.position.set(10,10,10)
        camera.lookAt(0,0,0)
        scene.add(camera)

        //辅助
        if(data.axes) scene.add(new THREE.AxesHelper(10))//坐标轴辅助红x 绿y 蓝z
        if(data.gridHelper) scene.add(new THREE.GridHelper(100,100))//网格参考线

        //回调
        callback(scene,camera,renderer)

        //渲染
        renderer.render(scene,camera)
    }
    /**
     * 旋转 也可以使用 对象的.rotateX替代
     * @param object 需要旋转的对象
     * @param axis 旋转轴，是一个向量，new THREE.Vector3(1,0,0)表示绕x轴顺时针旋转
     * @param radians 旋转的角度
     */
    const  rotateWorldAxis = (object, axis, radians) => {
        const rm = new THREE.Matrix4()
        rm.makeRotationAxis(axis.normalize(), radians)
        rm.multiply(object.matrix)
        object.matrix = rm
        object.rotation.setFromRotationMatrix(object.matrix)
    }

    /**
     * @param el
     * @param event
     * @param parent
     * @param recursive
     * @returns {*}
     */
        // 获取与射线相交的对象数组
    const getIntersectObject = (el,event,parent,recursive) => {
            event.preventDefault()
            const mouse = new THREE.Vector2()
            const raycaster = new THREE.Raycaster()

            mouse.x = ( ( event.clientX || event.touches[0].pageX) / el.offsetWidth) * 2 - 1
            mouse.y = -( ( event.clientY || event.touches[0].pageY) / el.offsetHeight) * 2 + 1

            raycaster.setFromCamera(mouse, camera)

            //intersectObjects(object,recursive)object — 用来检测和射线相交的物体。recursive — 如果为true，它还检查所有后代。否则只检查该对象本身。缺省值为false。
            return {
                raycaster : raycaster,
                objectList : raycaster.intersectObjects((parent || scene).children, recursive)
            }
        }
    /**
     * 随机颜色
     *@returns {string}
     */
    const randomColor = ()=> `rgb(${parseInt(Math.random()*256)},${parseInt(Math.random()*256)},${parseInt(Math.random()*256)})`

    /**
     * @param message
     * @returns {HTMLDivElement}
     */
    const loading = message => {
        let div = doc.getElementsByClassName("ys-loading")[0]
        if(!div){
            div = doc.createElement('div')
            div.className = "ys-loading"
            div.style.position = "fixed"
            div.style.top = "45%"
            div.style.left = "0"
            div.style.right = "0"
            div.style.textAlign = "center"
            div.style.zIndex = '9999'
            div.style.color = '#fff'
            doc.body.appendChild(div)
        }
        div.innerHTML =  `<span style="background-color: rgba(0,0,0,0.8);padding: 5px 10px">正在加载&nbsp;${message||''}&nbsp;请稍候  ...</span>`
        return div
    }

    /**
     * 三维坐标转屏幕坐标
     * @param vectorOrObject
     * @returns {{x: number, y: number}}
     */
    const vectorToScreen = vectorOrObject => {
        let o
        if(vectorOrObject instanceof THREE.Vector3)
            o = vectorOrObject
        else if (vectorOrObject instanceof THREE.Object3D)
            o =  new THREE.Vector3(vectorOrObject.position.x,vectorOrObject.position.y,vectorOrObject.position.z)
        else
            throw  "the arguments is a object of Vector3 or Object3D"
        const standardVector = o.project(camera)//世界坐标转标准设备坐标
            ,a = renderer.getSize(new THREE.Vector2()).width/2
            ,b = renderer.getSize(new THREE.Vector2()).height/2
            ,x = Math.round(standardVector.x * a + a)//标准设备坐标转屏幕坐标
            ,y = Math.round(-standardVector.y * b + b)//标准设备坐标转屏幕坐标
        return{x,y}
    }

    /**
     * 地理坐标转三维坐标
     * @param radius
     * @param lng
     * @param lat
     * @returns {*}
     */
    const  geographicToVector = (radius,lng,lat) =>  new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, (90 - lat) * (Math.PI / 180), (90 + lng) * (Math.PI / 180)))

    /**
     * 和上面一样：地理坐标转三维坐标 只是返回的是 x y z
     * @param radius
     * @param lng
     * @param lat
     * @param height
     * @returns {{x: number, y: *, z: number}}
     */
    const  geographicToVectorPosition = (radius,lng,lat,height) => {
        const phi = (180 + lng) * (Math.PI / 180)
        const theta = (90 - lat) * (Math.PI / 180)
        return {
            x: -radius * Math.sin(theta) * Math.cos(phi),
            y: radius * Math.cos(theta)+ ( height|| 0),
            z: radius * Math.sin(theta) * Math.sin(phi),
        }
    }

    /**
     * 地理坐标转2d平面
     * @param radius
     * @param lng
     * @param lat
     * @returns {{x: number, y: number}}
     */
    const geographicToPlaneCoords = (radius,lng,lat) => {
        return {x:(lat / 180) * radius, y:(lng / 180) * radius}
    }

    /**
     *
     * @param text
     * @param options (fontSize,backgroundColor,color)
     * @returns {*}
     */
    const createSpriteText = ( text, options ) => {
        if(!options) options = {}
        options.fontSize = options.fontSize || 12
        const average = el.offsetWidth > el.offsetHeight? el.offsetHeight/180:el.offsetWidth/360
        const canvas = document.createElement('canvas')
        canvas.width = text.length * (options.fontSize || 18) * average
        canvas.height = options.fontSize * average
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = options.backgroundColor||'transparent'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.font = canvas.height + "px '微软雅黑'"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = options.color
        ctx.fillText(text,  canvas.width / 2, canvas.height / 2)
        const texture = new THREE.Texture(canvas)
        texture.needsUpdate = true
        const sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: texture}))
        sprite.scale.set(options.fontSize / average * text.length, options.fontSize / average, 1)
        return sprite
    }

    /**
     * @param TWEEN
     * @param controls
     * @param option
     * @returns {string|*}
     */
    const flyTo = (TWEEN,controls,option) => {
        if(!TWEEN) throw "请传入 TWEEN"
        option.position = option.position || [] //相机新的位置
        option.controls = option.controls || [] //控制器新的中心点位置(围绕词典旋转等)
        option.duration = option.duration || 1000 //飞行时间
        option.easing =  option.easing || TWEEN.Easing.Linear.None
        TWEEN.removeAll()
        const curPosition = camera.position
            , controlsTar = controls.target
            , tween = new TWEEN.Tween({
            x1: curPosition.x, // 相机当前位置x
            y1: curPosition.y, // 相机当前位置y
            z1: curPosition.z, // 相机当前位置z
            x2: controlsTar.x, // 控制当前的中心点x
            y2: controlsTar.y, // 控制当前的中心点y
            z2: controlsTar.z // 控制当前的中心点z
        }).to({
            x1: option.position[0], // 新的相机位置x
            y1: option.position[1], // 新的相机位置y
            z1: option.position[2], // 新的相机位置z
            x2: option.controls[0], // 新的控制中心点位置x
            y2: option.controls[1], // 新的控制中心点位置x
            z2: option.controls[2] // 新的控制中心点位置x
        }, option.duration).easing(TWEEN.Easing.Linear.None) // TWEEN.Easing.Cubic.InOut //匀速
        tween.onUpdate(() => {
            controls.enabled = false
            camera.position.set(tween._object.x1, tween._object.y1, tween._object.z1)
            controls.target.set(tween._object.x2, tween._object.y2, tween._object.z2)
            controls.update()
            if (option.update instanceof Function)
                option.update(tween)
        })
        tween.onStart(()=> {
            controls.enabled = false
            if (option.start instanceof Function)
                option.start()
        })
        tween.onComplete(() => {
            controls.enabled = true
            if (option.done instanceof Function)
                option.done()
        })
        tween.onStop( () => option.stop instanceof Function? option.stop():'')
        tween.start()
        TWEEN.add(tween)
        return tween
    }

    /**
     * 计算三角形面积
     * @param v1
     * @param v2
     * @param v3
     * @returns {number}
     */
    const getTriangleArea = (v1, v2, v3) => new THREE.Vector3().crossVectors(v1.clone().sub(v2),v1.clone().sub(v3)).length()/2

    /**
     * 计算网格对象的面积
     * @param mesh
     * @returns {number}
     */
    const getMeshArea = mesh => {
        let area = 0
        let geometry = mesh.geometry.clone()
        if( geometry.isBufferGeometry) geometry =  new THREE.Geometry().fromBufferGeometry(geometry)
        geometry.faces.forEach(e =>{
            area += getTriangleArea(
                geometry.vertices[e.a],
                geometry.vertices[e.b],
                geometry.vertices[e.c])
        })
        return area
    }
    /**
     * 计算网格对象体积
     * @param mesh
     * @returns {number}
     */
    const getMeshVolume = mesh => {
        let geometry = mesh.geometry.clone()
        if( geometry.isBufferGeometry) geometry =  new THREE.Geometry().fromBufferGeometry(geometry)
        let V = 0
        geometry.faces.forEach(e =>{
            V += geometry.vertices[e.a].clone().cross(geometry.vertices[e.b]).dot(geometry.vertices[e.c]) / 6
        })
        return V
    }

    // 计算制高点
    const  getLenVector = (v1, v2, len) => v1.lerp(v2, len / v1.distanceTo(v2))
    /**
     * 获取球体上的两点之间的制高点，用于绘制三维三次贝塞尔曲线
     * @param v0 起点
     * @param v3 终点
     * @param n1 调控角度
     * @param n2 调控角度
     * @param p0 参考点 默认原点
     * @returns {[*, *]}
     */
    const getSphereHeightPoints = (v0,v3,n1,n2,p0) =>{
        // 夹角
        const angle = (v0.angleTo(v3) * 180) / Math.PI / 10 // 0 ~ Math.PI
            ,aLen = angle * ( n1 || 10)
            ,hLen = angle * angle * (n2 || 120)
        p0 = p0 || new THREE.Vector3(0, 0, 0) //默认以 坐标原点为参考对象

        // 法线向量
        const rayLine = new THREE.Ray(p0, v0.clone().add(v3.clone()).divideScalar(2))

        // 顶点坐标
        const vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0))

        // 控制点坐标
        return [ getLenVector(v0.clone(), vtop, aLen),getLenVector(v3.clone(), vtop, aLen)]
    }

    /**
     *
     * @returns {{REVISION: number, domElement: HTMLDivElement, setMode: setMode, update: update, end: (function(): number), begin: begin}}
     */
    const  initStatus = () => {
        const stats = new Stats()
        stats.setMode(0); // 0: fps, 1: ms
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        return stats
    }

    /**
     * 判断是否是手机端
     * @returns {boolean}
     */
    const isMobile = () => navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null

    /**
     * 主入口
     * @type object
     */
    const ysThree = {
        loading,
        init,
        rotateWorldAxis,
        getIntersectObject,
        randomColor,
        vectorToScreen,
        geographicToVector,
        geographicToVectorPosition,
        geographicToPlaneCoords,
        createSpriteText,
        flyTo,
        getTriangleArea,
        getMeshArea,
        getMeshVolume,
        getSphereHeightPoints,
        initStatus,
        isMobile
    }
    W.ysThree = ysThree

})(window,document,undefined)
