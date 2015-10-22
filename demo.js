(function() {
    'use strict';

    /*global THREE:false*/




    var url = 'http://127.0.0.1:3000/stream/7ma03n';



    var raf = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;



    var pad0 = function(n) {
        return (n < 10 ? '0'+n : n);
    };



    var toMMSS = function(t) {
        t = Math.round(t);
        var mins = Math.floor( t / 60 );
        var secs = t - mins * 60;
        return [mins, pad0(secs)].join(':');
    };



    // SETUP THREE SCENE WITH 6 PLANES MAPPED TO THE VIDEO TEXTURE

    var W = window.innerWidth;
    var H = window.innerHeight;

    var el = document.querySelector('.screen');

    var scene = new THREE.Scene();

    var cam = new THREE.PerspectiveCamera(90, W/H, 1, 100);
    cam.position.z = 0.01; // Orbit controls don't work from 0,0,0?!

    var renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(W, H);
    el.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(cam, renderer.domElement);
    //controls.enableZoom = false;
    controls.enablePan = false;

    var video = document.querySelector('video');

    var tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.format = THREE.RGBFormat;

    var mat = new THREE.MeshBasicMaterial({
        color : 0xffffff,
        map   : tex
    });

    var updateUvs = function(geo, uvs) {
        var a = new THREE.Vector2(uvs[0][0], uvs[0][1]);
        var b = new THREE.Vector2(uvs[1][0], uvs[1][1]);
        var c = new THREE.Vector2(uvs[2][0], uvs[2][1]);
        var d = new THREE.Vector2(uvs[3][0], uvs[3][1]);
        var tri0 = geo.faceVertexUvs[0][0];
        var tri1 = geo.faceVertexUvs[0][1];
        tri0[0] = a;
        tri0[1] = b;
        tri0[2] = c;
        tri1[0] = b;
        tri1[1] = d;
        tri1[2] = c;
        geo.uvNeedsUpdate = true;
    };

    var L = 12;
    //var l = L / 2;
    var l = L / 2 * (99/100);
    var RAD180 = Math.PI;
    var RAD90 = Math.PI/2;

    var createPlane = function(ui, vi) {
        var geo = new THREE.PlaneGeometry(L, L, 1, 1); //w,h,sw,sh
        updateUvs(geo, [
            [(ui+0)/3, (vi+1)/2], // A -+
            [(ui+0)/3, (vi+0)/2], // B ++
            [(ui+1)/3, (vi+1)/2], // C --
            [(ui+1)/3, (vi+0)/2]  // D +-
        ]);

        var plane = new THREE.Mesh(geo, mat);
        scene.add(plane);

        return plane;
    };

    var plF = createPlane(1, 0); // front
    plF.position.z = -l;

    var plD = createPlane(0, 0); // down
    plD.position.y = -l;
    plD.rotateX(-RAD90);

    var plT = createPlane(2, 1); // top
    plT.position.y = l;
    plT.rotateX(RAD90);

    var plB = createPlane(2, 0); // back
    plB.position.z = l;
    plB.rotateY(RAD180);

    var plL = createPlane(1, 1); // left
    plL.position.x = -l;
    plL.rotateY(RAD90);

    var plR = createPlane(0, 1); // right
    plR.position.x = l;
    plR.rotateY(-RAD90);



    // SETUP RESIZE AND RENDER
    window.addEventListener('resize', function() {
        W = window.innerWidth;
        H = window.innerHeight;
        cam.aspect = W / H;
        cam.updateProjectionMatrix();
        renderer.setSize(W, H);
    });

    var render = function render() {
        raf(render);
        controls.update();
        renderer.render(scene, cam);
    };

    render();



    // VIDEO CONTROLS

    var ctEl = document.querySelector('.ct');
    var durEl = document.querySelector('.dur');

    var input = document.querySelector('input');
    video.addEventListener('loadedmetadata', function() {
        //video.volume = 0;
        //video.currentTime = 10;
        var dur = Math.ceil(video.duration);
        durEl.firstChild.nodeValue = toMMSS(dur);
        input.setAttribute('max', dur);
    });
    var isInputDown = false;
    video.addEventListener('timeupdate', function() {
        if (isInputDown) { return; }

        var ct = video.currentTime;
        input.value = ct;
        ctEl.firstChild.nodeValue = toMMSS(ct);
    });
    var onInput = function(valToSet) {
        return function() {
            isInputDown = valToSet;
        };
    };
    var onDown = onInput(true);
    var onUp   = onInput(false);
    input.addEventListener('mousedown',  onDown);
    input.addEventListener('touchstart', onDown);
    input.addEventListener('mouseup',    onUp);
    input.addEventListener('touchend',   onUp);

    input.addEventListener('change', function() {
        video.currentTime = input.value;
    });

    var source = document.querySelector('source');
    source.setAttribute('src', url);

    var button = document.querySelector('button');
    button.addEventListener('click', function() {
        var isPlaying = (button.firstChild.nodeValue === 'pause');
        video[ isPlaying ? 'pause' : 'play' ]();
        button.firstChild.nodeValue = (isPlaying ? 'play' : 'pause');
    });
})();