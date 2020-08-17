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
  camera.position.set(0, 0, 1000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  // ライトの設置
  let ambLight = 1;
  const envlight = new THREE.AmbientLight(0xffffff, ambLight);
  scene.add(envlight);
  var directionalLight = new THREE.DirectionalLight('#ffffff', 1);
  directionalLight.position.set(10, 5, 10);
  scene.add(directionalLight);


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
  //		model_init
  //////////////////////////////////////////////////////////////////////////////////

  //model_settings
  let anon_col = {
    skinCol: new THREE.Color(0xefa083),
    hairCol: new THREE.Color(0x8b0000),
    eyeCol: new THREE.Color(0xcfb000),
    highCol: new THREE.Color(0x38180f),
    bodyCol: new THREE.Color(0xff0000)
  };
  let anon_tex = {
    eyeTex1: 'img/eye_open.png',
    eyeTex2: 'img/eye_close.png',
    headTex: 'img/hair.png'
  };
  let anon = new model_init(anon_col, anon_tex);
  anon.init();
  armUpdate(anon, LEFT, 0.0,0,0,0);
  armUpdate(anon, RIGHT, 0,0,0,0);

  //model_init
  function model_init(col, tex){
    //animation_param
    this.time = 0;
    this.a_index = 0;
    this.a_count = 0;
    this.pos_x = 0;
    this.pos_y = 0;
    this.pos_z = 0;
    this.rot_x = 0;
    this.rot_y = 0;
    this.rot_z = 0;
    this.head_lr = 0;
    this.head_fb = 0;
    this.head_tw = 0;
    this.body_lr = 0;
    this.body_fb = 0;
    this.body_tw = 0;
    this.armL_b1 = 0;
    this.armL_b2 = 0;
    this.armL_r1 = 0;
    this.armL_r2 = 0;
    this.armR_b1 = 0;
    this.armR_b2 = 0;
    this.armR_r1 = 0;
    this.armR_r2 = 0;
    this.footL_b1 = 0;
    this.footL_b2 = 0;
    this.footL_b3 = 0;
    this.footL_r1 = 0;
    this.footL_r2 = 0;
    this.footL_r3 = 0;
    this.footR_b1 = 0;
    this.footR_b2 = 0;
    this.footR_b3 = 0;
    this.footR_r1 = 0;
    this.footR_r2 = 0;
    this.footR_r3 = 0;
    this.blink = 1;
    //colors
    this.skinCol = col.skinCol;
    this.bodyCol = col.bodyCol;
    this.eyeCol = col.eyeCol;
    this.highCol = col.highCol;
    this.hairCol = col.hairCol;
    //material
    this.skinMat = monoMat.clone();
    this.skinMat.uniforms.uColor1.value = this.skinCol;
    this.bodyMat = monoMat.clone();
    this.bodyMat.uniforms.uColor1.value = this.bodyCol;
    this.hairMat = monoMat.clone();
    this.hairMat.uniforms.uColor1.value = this.hairCol;
    this.torsoMat = monoMat.clone();
    this.torsoMat.uniforms.uColor1.value = this.bodyCol;
    this.headMat = uvMat.clone();
    this.headTex = loader.load(tex.headTex);
    this.headMat.uniforms.uColor1.value = this.skinCol;
    this.headMat.uniforms.uColor2.value = this.hairCol;
    this.headMat.uniforms.uTexture.value = this.headTex;
    this.eyeMat = uvMat.clone();
    this.eyeTex1 = loader.load(tex.eyeTex1); //eye_open
    this.eyeTex2 = loader.load(tex.eyeTex2); //eye_close
    this.eyeMat.uniforms.uColor1.value = this.highCol;
    this.eyeMat.uniforms.uColor2.value = this.eyeCol;
    this.eyeMat.uniforms.uTexture.value = this.eyeTex1;
    this.lineMat = new THREE.LineBasicMaterial({
      color: 0x000000, linewidth: line_width});
    //geometry
    this.upperArmGeoL;
    this.upperArmGeoR;
    this.elbowGeoL;
    this.elbowGeoR;
    this.lowerArmGeoL;
    this.lowerArmGeoR;
    this.upperFootGeoL;
    this.upperFootGeoR;
    this.kneeGeoL;
    this.kneeGeoR;
    this.ankleGeoL;
    this.ankleGeoR;
    this.lowerFootGeoL;
    this.lowerFootGeoR;
    this.bodyGeo;
    //groups
    this.bodyG = new THREE.Group();
    this.headG = new THREE.Group();
    this.elash = new THREE.Group();
    this.handGL = new THREE.Group();
    this.handGR = new THREE.Group();
    this.elbowGL = new THREE.Group();
    this.elbowGR = new THREE.Group();
    this.lowerArmGL = new THREE.Group();
    this.lowerArmGR = new THREE.Group();
    this.armGL = new THREE.Group();
    this.armGR = new THREE.Group();
    this.armG = new THREE.Group();
    this.toeGL = new THREE.Group();
    this.toeGR = new THREE.Group();
    this.kneeGL = new THREE.Group();
    this.kneeGR = new THREE.Group();
    this.lowerFootGL = new THREE.Group();
    this.lowerFootGR = new THREE.Group();
    this.footGL = new THREE.Group();
    this.footGR = new THREE.Group();
    this.footG = new THREE.Group();
    this.toeObjL;
    this.toeObjR;
    //init
    this.init = function(){
      this.headInit();
      armInit(this);
      //footInit(this);
      //bodyInit(this);
      //this.bodyG.scale.set(0.01,0.01,0.01);
    }
    //headInit
    this.headInit = function(){
      //makeHead(this);
      //makeEye2(this);
      //makeEar(this);
      //makeLines(this);
      //this.headG.rotation.x = PI/20;
      this.bodyG.add(this.headG);
    }
  }








  function armInit(model){
    //defs
    const node = pipeNode;
    const edge = pipeEdge;
    const hand_thick = armThick * Math.cos(PI/3.8);
    const hand_width = armThick * Math.cos(PI/5);
    const fing_thick = armThick / 4.5;
    let handThick = new Array(pipeNode);
    let handWidth= new Array(pipeNode);
    let fingThick = new Array(pipeNode);
    const numFing = 4;
    //thick
    for(let i=0; i<node; i++){
        let t = i / (node-1);
        upperArmThick[i] = armThick;
        lowerArmThick[i] = armThick * Math.cos(Math.pow(t,2.5)*PI/3.8);
        lowerArmWidth[i] = armThick * Math.cos(Math.pow(t,2.5)*PI/5);
        handThick[i] = hand_thick * Math.cos(t*PI/3);
        handWidth[i] = hand_width * Math.cos(t*PI/5);
        fingThick[i] = fing_thick * Math.cos(t*PI/2.5);
    }
    //make hand obj
    const hand_len = armLength / 5;
    const hp = new THREE.Vector2( hand_len, 0 );
    let hand_pt = makePipe(CLOSE, node, edge, hp, hp, handThick, handWidth);
    let geoHand = makeGeometry(node+1, edge, hand_pt);
    geoHand = mergeGeometry(geoHand);
    let objHand = new THREE.Mesh(geoHand, model.skinMat);
    model.handGL.add(objHand);
    //make fingers obj
    const fp = hp.multiplyScalar(0.85);
    let fing_pt = makePipe(CLOSE, node, edge, fp, fp, fingThick, fingThick);
    let geoFing = makeGeometry(node+1, edge, fing_pt);
    geoFing = mergeGeometry(geoFing);
    let obj_fing = new THREE.Mesh(geoFing, model.skinMat);
    for(let i=0; i<numFing; i++){
      let obj = obj_fing.clone();
      let angle = [-PI/6, -PI/18, PI/16, PI/5];
      let z = hand_len/0.7 * Math.sin(angle[i]);
      let x = hand_len/1.1 * Math.cos(angle[i]);
      let pos = new THREE.Vector3(x, 0, z);
      obj.rotation.y = -angle[i];
      obj.position.set(pos.x, pos.y, pos.z);
      model.handGL.add(obj);
    }
    model.handGR = model.handGL.clone();
    //meke upper arm
    let ep = new THREE.Vector2( armLength,0 );
    let arm_pt = makePipe(OPEN, node, edge, ep, ep, upperArmThick, upperArmThick);
    let arm_geo = makeGeometry(node, edge, arm_pt);
    arm_geo = mergeGeometry(arm_geo);
    model.upperArmGeoL = arm_geo.clone();
    model.upperArmGeoR = arm_geo.clone();
    model.lowerArmGeoL = arm_geo.clone();
    model.lowerArmGeoR = arm_geo.clone();
    let uarm_objL = new THREE.Mesh(model.upperArmGeoL, model.bodyMat);
    let uarm_objR = new THREE.Mesh(model.upperArmGeoR, model.bodyMat);
    let larm_objL = new THREE.Mesh(model.lowerArmGeoL, model.bodyMat);
    let larm_objR = new THREE.Mesh(model.lowerArmGeoR, model.bodyMat);
    //make joint
    let elbow_pt = makeJoint(node, edge, upperArmThick, -PI/100);
    let elbow_geo = makeGeometry(node, edge, elbow_pt);
    elbow_geo = mergeGeometry(elbow_geo);
    model.elbowGeoL = elbow_geo.clone();
    model.elbowGeoR = elbow_geo.clone();
    let elbow_objL = new THREE.Mesh(model.elbowGeoL, model.bodyMat);
    let elbow_objR = new THREE.Mesh(model.elbowGeoR, model.bodyMat);
    //Grouping-L
    model.armGL.add(uarm_objL);
    model.lowerArmGL.add(larm_objL);
    model.lowerArmGL.add(model.handGL);
    model.elbowGL.add(elbow_objL);
    model.elbowGL.add(model.lowerArmGL);
    model.armGL.add(model.elbowGL);
    //Grouping-R
    model.armGR.add(uarm_objR);
    model.lowerArmGR.add(larm_objR);
    model.lowerArmGR.add(model.handGR);
    model.elbowGR.add(elbow_objR);
    model.elbowGR.add(model.lowerArmGR);
    model.armGR.add(model.elbowGR);
    //Grouping-LR
    model.armG.add(model.armGR);
    model.armG.add(model.armGL);
    model.bodyG.add(model.armG);
    scene.add(model.bodyG);
  }






  function armUpdate( model, side, v1, v2, rot1, rot2){
    //clear
    lowerPipePos.set(0,0);
    pipeRad = 0;
    //defs
    let node = pipeNode;
    let edge = pipeEdge;
    //value mapping
    const bend1 = mapping(v1, -1.0, 2.0, PI/4, -PI/2);
    const bend2 = mapping(v2, 0.0, 1.5, -0.01, -3*PI/4);
    let {ep1, cp1, ep2, cp2} = getBezierPt(armLength, armLength2, bend1, bend2);
    let upper_geo = side ? model.upperArmGeoR : model.upperArmGeoL;
    let joint_geo = side ? model.elbowGeoR : model.elbowGeoL;
    let lower_geo = side ? model.lowerArmGeoR : model.lowerArmGeoL;
    let hand = side ? model.handGR : model.handGL;
    let joint = side ? model.elbowGR : model.elbowGL;
    let lower_arm = side ? model.lowerArmGR : model.lowerArmGL;
    let arm = side ? model.armGR : model.armGL;
    let rot = side ? PI : 0;
    //arm_geoUpdate
    let upper_pt = makePipe(OPEN, node, edge, ep1, cp1, upperArmThick, upperArmThick);
    updateGeometry(node, edge, upper_pt, upper_geo);
    let upper_rad = pipeRad;
    let joint_pt = makeJoint(node, edge, upperArmThick, bend2);
    updateGeometry(node, edge, joint_pt, joint_geo);
    joint.position.set(ep1.x, ep1.y, 0);
    let lower_pt = makePipe(OPEN, node, edge, ep2, cp2, lowerArmThick, lowerArmWidth);
    updateGeometry(node, edge, lower_pt, lower_geo);
    lower_arm.position.set(lowerPipePos.x,lowerPipePos.y,0);
    //hand
    hand.position.set(ep2.x, ep2.y, 0);
    hand.rotation.z = pipeRad;
    //rotation
    joint.quaternion.set(0,0,0,1);
    arm.quaternion.set(0,0,0,1);
    let axis1 = new THREE.Vector3(1,0,0);
    let x = Math.cos(upper_rad);
    let y = Math.sin(upper_rad);
    let axis2 = new THREE.Vector3(x,y,0).normalize();
    let q1 = new THREE.Quaternion();
    let q2 = new THREE.Quaternion();
    q1.setFromAxisAngle(axis1,rot1);
    q2.setFromAxisAngle(axis2,rot2);
    joint.quaternion.multiply(q2);
    arm.quaternion.multiply(q1);
    arm.rotation.y = rot;
  }



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
