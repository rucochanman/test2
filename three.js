window.addEventListener("load", init);

function init() {

  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  ////////////////画面設定

  // サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;
  //const width = 800;
  //const height = 600;

  // レンダラーを作成
  let renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
      });

  renderer.setClearColor(new THREE.Color('green'));//背景色の設定
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  // シーンを作成
  let scene = new THREE.Scene();

  // カメラを作成
  let camera = new THREE.PerspectiveCamera(15, width / height, 1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //let ambLight = 1;
  //const envlight = new THREE.AmbientLight(0xffffff, ambLight);
  //scene.add(envlight);

  // ライト
  var directionalLight = new THREE.DirectionalLight('#ffffff', 1);
  directionalLight.position.set(10, 10, 0);
  scene.add(directionalLight);

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
  var cube = new THREE.Mesh( geometry, material );
  cube.position.set(0, 0, 0);
  cube.rotation.x = 0.5;
  cube.rotation.z = 0.5;
  scene.add( cube );

  function sceneUpdate(){
    requestAnimationFrame( sceneUpdate );
    //animate(cr, moves1, 40);
    renderer.render( scene, camera );
  }

  sceneUpdate();

}
