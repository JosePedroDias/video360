(function(w) {
    'use strict';

    /*global THREE:false*/


    // CONSTANTS
    var L = 12;
    var l = L / 2 * (99/100);
    var RAD180 = Math.PI;
    var RAD90 = Math.PI/2;



    var raf = w.requestAnimationFrame       ||
              w.webkitRequestAnimationFrame ||
              w.mozRequestAnimationFrame;



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



    var createPlaneFactory = function(mat, scene) {
        return function(ui, vi) {
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
    };



    var createCubeMapVideo = function(mat, scene) {
        var createPlane = createPlaneFactory(mat, scene);

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
    };



    var createEquilateralVideo = function(mat, scene) {
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(L/2, 32, 32),
            mat
        );
        sphere.scale.x = -1;

        scene.add(sphere);
    };



    w.video360 = function video360(cfg) {
        if (!cfg.format) {    throw 'format is required!'; }
        if (!cfg.url) {       throw 'url is required!'; }
        if (!cfg.container) { throw 'container is required!'; }

        var options = {
            autoplay    : true,
            loop        : false,
            autoResize  : true,
            crossorigin : 'anonymous',
            poster      : 'http://www.kamik.com/skin/frontend/enterprise/kamik/images/catalog/product/360.1439909661.png'
        };

        if ('options' in cfg) {
            for (var k in cfg.options) {
                options[k] = cfg.options[k];
            }
        }

        var el  = cfg.container;
        var W, H, FOV = 90;
        var subscribers = {};
        var instance;



        var measureContainer = function() {
            W = el.offsetWidth;
            H = el.offsetHeight;
        };

        var fire = function(evName) {
            var cb = subscribers[evName];
            if (!cb) { return; }
            cb.apply(instance);
        };



        measureContainer();



        var scene = new THREE.Scene();

        var cam = new THREE.PerspectiveCamera(FOV, W/H, 1, 100);
        cam.position.z = 0.01; // Orbit controls don't work from 0,0,0?!

        var renderer = new THREE.WebGLRenderer({
            antialias: false
        });
        renderer.setPixelRatio( w.devicePixelRatio );
        renderer.setSize(W, H);
        el.appendChild(renderer.domElement);



        var controls = new THREE.OrbitControls(cam, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;



        var video = document.createElement('video');

        if (options.autoplay) {
            video.setAttribute('autoplay', '');
        }

        if (options.loop) {
            video.setAttribute('loop', '');
        }

        if (options.crossorigin) {
            video.setAttribute('crossorigin', options.crossorigin);
        }

        video.addEventListener('loadedmetadata', function() { fire('loadedmetadata'); });
        video.addEventListener('timeupdate',     function() { fire('timeupdate'); });
        video.addEventListener('play',           function() { fire('play'); });
        video.addEventListener('pause',          function() { fire('pause'); });
        video.addEventListener('volumechange',   function() { fire('volumechange'); });

        video.setAttribute('type', 'video/mp4');
        video.setAttribute('src', cfg.url);



        var tex = new THREE.VideoTexture(video);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.format = THREE.RGBFormat;

        var mat = new THREE.MeshBasicMaterial({
            color : 0xffffff,
            map   : tex
        });



        if (cfg.format === 'cube') {
            createCubeMapVideo(mat, scene);
        }
        else {
            createEquilateralVideo(mat, scene);
        }



        var onMouseWheel = function(ev) {
            var fov = instance.getFOV();

            if (ev.wheelDeltaY) { // WebKit
                fov -= ev.wheelDeltaY * 0.05;
            }
            else if (ev.wheelDelta) { // Opera / IE9
                fov -= ev.wheelDelta * 0.05;
            }
            else if (ev.detail) { // Firefox
                fov += ev.detail * 1.0;
            }

            if      (fov <  20) { fov =  20; }
            else if (fov > 150) { fov = 150; }
            instance.setFOV(fov);
        };

        document.addEventListener('mousewheel', onMouseWheel, false);
        document.addEventListener('DOMMouseScroll', onMouseWheel, false);



        if (options.autoResize) {
            window.addEventListener('resize', function() {
                instance.resize();
            });
        }



        var render = function render() {
            raf(render);
            controls.update();
            renderer.render(scene, cam);
        };
        render();



        var instance = {
            on: function on(evName, cb) {
                subscribers[evName] = cb;
                return this;
            },
            play: function play() {
                video.play();
                return this;
            },
            pause: function pause() {
                video.pause();
                return this;
            },
            isPlaying: function isPlaying() {
                return !video.paused && !video.ended;
            },
            /*stop: function stop() {
                video.pause();
                video.currentTime = 0;
                return this;
            },*/
            getCurrentTime: function getCurrentTime() {
                return video.currentTime;
            },
            setCurrentTime: function setCurrentTime(t) {
                video.currentTime = t;
                return this;
            },
            getDuration: function getDuration() {
                return video.duration;
            },
            /*getDimensions: function getDimensions() {
                return [W, H];
            },*/
            setFOV: function setFOV(fov) {
                FOV = fov;
                cam.fov = fov;
                cam.updateProjectionMatrix();
                return this;
            },
            getFOV: function getFOV() {
                return FOV;
            },
            resize: function resize() {
                measureContainer();
                cam.aspect = W / H;
                cam.updateProjectionMatrix();
                renderer.setSize(W, H);
                return this;
            }
        };

        return instance;
    };

})(this);
