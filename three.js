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

  //pipe var
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
  //		render the whole thing on the page
  //////////////////////////////////////////////////////////////////////////////////

  function sceneUpdate(){
    requestAnimationFrame( sceneUpdate );
    //animate(cr, moves1, 40);
    renderer.render( scene, camera );
  }

  sceneUpdate();

}
