window.addEventListener("load", init);

function init() {

  //////////////////////////////////////////////////////////////////////////////////
  //		settings
  //////////////////////////////////////////////////////////////////////////////////

  // 画面サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラー 背景色の設定
  let renderer = new THREE.WebGLRenderer({　canvas: document.querySelector('#myCanvas')　});
  renderer.setClearColor(new THREE.Color('grey'));
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  // シーンを作成
  let scene = new THREE.Scene();

  // カメラを作成
  let camera = new THREE.PerspectiveCamera(15, width / height, 1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // ライトの設置
  //let ambLight = 1;
  //const envlight = new THREE.AmbientLight(0xffffff, ambLight);
  //scene.add(envlight);

  var directionalLight = new THREE.DirectionalLight('#ffffff', 1);
  directionalLight.position.set(10, 10, 0);
  scene.add(directionalLight);






  //test用
  var test_geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var test_material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
  var cube = new THREE.Mesh( test_geometry, test_material );
  cube.position.set(0, 0, 0);
  cube.rotation.x = 0.5;
  cube.rotation.z = 0.5;
  scene.add( cube );


  //////////////////////////////////////////////////////////////////////////////////
  //		defs
  //////////////////////////////////////////////////////////////////////////////////


  //common-def
  const NUM_POS = 3;
  const VER_RECT = NUM_POS * 4;
  const PI = Math.PI;
  const CLOSE = false;
  const OPEN = true;
  const LEFT = false;
  const RIGHT = true;
  const center2 = new THREE.Vector2();
  const center3 = new THREE.Vector3();
  let pipeRad = 0;
  let lowerPipePos = new THREE.Vector2();

  //resolusion
  const reso = 3; //解像度の変更
  const headNode = 8 * reso;
  const headEdge = 6 * reso;
  const pipeEdge = 4 * reso;
  const pipeNode = 4 * reso;
  const bodyNode = 4 * reso;
  const bodyEdge = 4 * reso;

  //size
  const wScale = 100; //サイズの変更
  const armLength = wScale / 9;
  const armLength2 = armLength * 1.2;
  const armThick = wScale / 17;
  const footLength = wScale / 11;
  const footLength2 = footLength * 1.5;
  const footThick = wScale / 16;
  const headSize = wScale / 1.25;
  const bodyLength = wScale / 4.7;
  const bodyWidth = wScale / 4.1;
  const line_width = wScale / 50;
  let upperArmThick = new Array(pipeNode);
  let lowerArmThick = new Array(pipeNode);
  let lowerArmWidth = new Array(pipeNode);
  let upperFootThick = new Array(pipeNode);
  let lowerFootThick = new Array(pipeNode);
  let ankleThick = new Array(pipeNode);
  let bodyWidths = new Array(bodyNode);
  let bodyThicks = new Array(bodyNode);

  //material
  const loader = new THREE.TextureLoader();
  const vert = document.getElementById('vs').textContent;
  const mono_frag = document.getElementById('fs_mono').textContent;
  const uv_frag = document.getElementById('fs_uv').textContent;
  const bi_frag = document.getElementById('fs_bi').textContent;

  let uniform = THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights'],{
    'uTexture': { value: null },
    'uTone': { value: null },
    'uColor1': { value: null },
    'uColor2': { value: null }
    }
  ] );

  let material = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    uniforms: uniform,
    vertexShader: vert,
    fragmentShader: null,
    lights: true
  });

  let monoMat = material.clone();
  monoMat.fragmentShader = mono_frag;
  let uvMat = material.clone();
  uvMat.fragmentShader = bi_frag;


  //////////////////////////////////////////////////////////////////////////////////
  //		common - functions
  //////////////////////////////////////////////////////////////////////////////////

  ////////makePipes

  function makePipe(open, node, edge, ep, cp, thick, width){
    //defs
    let zpos = new THREE.Vector2();
    let pt = [];
    let rot = pipeRad;
    //bone
    let curve = new THREE.QuadraticBezierCurve(center2,cp,ep);
    let bone = curve.getPoints( node-1 );
    //set points
    for(var i=0; i<node; i++){
      pt[i] = [];
      if(i!=0){
        let diff = new THREE.Vector2();
        diff.subVectors(bone[i], zpos);
        rot = Math.atan2(diff.y, diff.x);
      }
      for(var j=0; j<edge; j++){
        let theta = j*2*PI/edge;
        let w = width[i] * Math.cos(theta);
        let h = thick[i] * Math.sin(theta)
        let v = new THREE.Vector2(0, h);
        v.add(bone[i]);
        v.rotateAround(bone[i], rot);
        pt[i][j] = [v.x, v.y, w];
      }
      zpos = bone[i];
    }
    //closed face
    if(!open){
      pt[node] = [];
      for(var j=0; j<edge; j++){
        pt[node][j] = [bone[node-1].x, bone[node-1].y, 0];
      }
    }
    //update
    pipeRad = rot;
    return pt;
  }

  function makeJoint(node, edge, thick, rad){
    //defs
    let origin = new THREE.Vector2( 0,-thick[0] );
    let init = new THREE.Vector2();
    origin.rotateAround(init, pipeRad);
    let bone = new THREE.Vector2( 0,thick[0] );
    bone.add(origin);
    bone.rotateAround(origin, pipeRad);
    //set pt
    let pt = [];
    for(let i=0; i<node; i++){
      pt[i] = [];
      let r = i==0 ? 0 : rad/(node-1);
      bone.rotateAround(origin, r);
      for(let j=0; j<edge; j++){
        let theta = j * 2 * PI / edge;
        let radius = Math.sin(theta)>0 ? thick[i] : thick[0];
        let w = thick[0] * Math.cos(theta);
        let h = radius * Math.sin(theta);
        let v = new THREE.Vector2(0, h);
        v.add(bone);
        v.rotateAround(bone, i * r + pipeRad);
        pt[i][j] = [v.x, v.y, w];
      }
    }
    //update values
    pipeRad += rad;
    lowerPipePos = bone;
    return pt;
  }

  ////////make geometry

  function updateGeometry(node, edge, pt, geometry){
    let vertices = setVertices(node, edge, pt);
    let geo_new = new THREE.BufferGeometry();
    geo_new.addAttribute('position', new THREE.BufferAttribute(vertices, NUM_POS));
    let geo_merg = new THREE.Geometry().fromBufferGeometry( geo_new );
    geo_merg.mergeVertices();
    geometry.vertices = geo_merg.vertices;
    geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
    geometry.computeVertexNormals();
  }

  function mergeGeometry(geo){
    let geo_merg = new THREE.Geometry().fromBufferGeometry( geo );
    geo_merg.mergeVertices();
    geo_merg.computeVertexNormals();
    return geo_merg;
  }

  function makeGeometry(node, edge, pt){
    const vertices = setVertices(node, edge, pt);
    const indices = setIndices(node, edge);
    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, NUM_POS));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    return geometry;
  }

  function setUvs(node, edge, pt){
    const nPos = 2;
    const nVert = nPos * 4;
    const numVertices = nVert*(node-1)*edge;
    let vertices = new Float32Array(numVertices);
    for(let i=0; i<node-1; i++){
      for(let j=0; j<edge; j++){
        for(let k=0;k<nPos;k++){
          let n = i*nVert*edge + j*nVert + k;
          vertices[n+nPos*0] = pt[i][j][k];
          vertices[n+nPos*1] = pt[i][j+1][k];
          vertices[n+nPos*2] = pt[i+1][j+1][k];
          vertices[n+nPos*3] = pt[i+1][j][k];
        }
      }
    }
    return vertices;
  }

  function setVertices(node, edge, pt){
    let numVertices = VER_RECT*(node-1)*edge;
    let vertices = new Float32Array(numVertices);
    for(var i=0; i<node-1; i++){
      for(var j=0; j<edge; j++){
        for(var k=0;k<NUM_POS;k++){
          let n = i*VER_RECT*edge + j*VER_RECT + k;
          vertices[n+NUM_POS*0] = pt[i][j][k];
          vertices[n+NUM_POS*1] = pt[i][(j+1)%edge][k];
          vertices[n+NUM_POS*2] = pt[i+1][(j+1)%edge][k];
          vertices[n+NUM_POS*3] = pt[i+1][j][k];
        }
      }
    }
    return vertices;
  }

  function setIndices(node, edge){
    let numIndices = (VER_RECT*(node-1)*edge)/2;
    let order = [0,3,2,2,1,0];
    let indices = new Uint16Array(numIndices);
    for(let i=0; i<numIndices/6; i++){
      for(let j=0; j<order.length; j++){
        indices[i*6+j] = i*4+order[j];
      }
    }
    return indices;
  }


  ////////culc_help

  function getBezierPt(len1, len2, bend1, bend2){
    //angle adjust
    let diff = Math.abs(bend1) * -Math.PI/8;
    let rad = bend1 + bend2 + diff;
    //upperPipe
    const x1 = len1 * Math.cos(bend1);
    const y1 = len1 * Math.sin(bend1);
    const ep1 = new THREE.Vector2( x1,y1 );
    let cp1 = new THREE.Vector2( 0,0 );
    ep1.y>0 ? cp1.y = y1/2 : cp1.x = -y1/2;
    //lowerPipe
    const joint_len = armThick * Math.abs(bend2);
    len2 -= joint_len;
    const x2 = len2 * Math.cos(rad);
    const y2 = len2 * Math.sin(rad);
    const ep2 = new THREE.Vector2( x2,y2 );
    const cp2 = new THREE.Vector2( 0,0 );
    //result
    return {ep1, cp1, ep2, cp2}
  }

  function mapping(value, inMin, inMax, outMin, outMax){
    let norm = (value - inMin)/(inMax - inMin);
    let out = norm * (outMax - outMin) + outMin;
    return out;
  }

  ////////animate

  function blink(model, open){
    let tex = open ? model.eyeTex1 : model.eyeTex2;
    let col = open ? model.highCol : model.skinCol;
    model.eyeMat.uniforms.uTexture.value = tex;
    model.eyeMat.uniforms.uColor1.value = col;
    model.elash.visible = open;
  }

  //////////////////////////////////////////////////////////////////////////////////
  //		render the whole thing on the page
  //////////////////////////////////////////////////////////////////////////////////

  function sceneUpdate(){
    requestAnimationFrame( sceneUpdate );
    //animate(cr, moves1, 40);
    renderer.render( scene, camera );
  }

  sceneUpdate();

}
