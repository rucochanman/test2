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










}
