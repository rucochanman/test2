window.addEventListener("load", init);

function init() {

  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  ////////////////画面設定

  // サイズを指定
  const width = 800;
  const height = 400;

  // レンダラーを作成
  let renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
      });

  renderer.setClearColor(new THREE.Color('grey'));//背景色の設定
  document.body.appendChild( renderer.domElement );
  renderer.setSize(width, height);

  // シーンを作成
  let scene = new THREE.Scene();

  // カメラを作成
  let camera = new THREE.PerspectiveCamera(10, width / height, 1, 10);
  //const camera = new THREE.OrthographicCamera(-480, +480, 270, -270, 1, 1000);
  camera.position.set(0, 0, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  let ambLight = 1;
  const envlight = new THREE.AmbientLight(0xffffff, ambLight);
  scene.add(envlight);


  sceneUpdate();

  function sceneUpdate(){
    requestAnimationFrame( sceneUpdate );
    //animate(cr, moves1, 40);
    renderer.render( scene, camera );
  }


}
