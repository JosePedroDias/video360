(function(w) {
    'use strict';

    var pad0 = function(s) {
        return ((s < 10) ? '0'+s : s);
    };

    var mmss = function(t) {
        var mm = Math.floor( t / 60);
        var ss = Math.round(t - 60 * mm);
        return [mm, pad0(ss)].join(':');
    };


    w.playerUI = function(el) {
        var instance, subscribers = {};

        var state = {
            duration  : 0,
            isPlaying : false
        };



        var fire = function(evName) {
            var cb = subscribers[evName];
            if (!cb) { return; }
            cb.apply(instance);
        };



        var leftEl = document.createElement('div'); leftEl.className = 'left-ctn';
        var rightEl = document.createElement('div'); rightEl.className = 'right-ctn';

        var ppEl = document.createElement('div'); ppEl.className = 'play-pause no-select';
        var ctEl = document.createElement('div'); ctEl.className = 'current-time no-select';
        var durEl = document.createElement('div'); durEl.className = 'duration no-select';

        var timeEl = document.createElement('div'); timeEl.className = 'time-bar';
        var volEl = document.createElement('div');  volEl.className = 'volume-bar';

        var timePctEl = document.createElement('div'); timePctEl.className = 'time-percent';
        var volPctEl = document.createElement('div'); volPctEl.className = 'volume-percent';



        leftEl.appendChild(ppEl);
        leftEl.appendChild(ctEl);
        leftEl.appendChild(durEl);
        el.appendChild(leftEl);

        timeEl.appendChild(timePctEl);
        volEl.appendChild(volPctEl);
        rightEl.appendChild(timeEl);
        rightEl.appendChild(volEl);
        el.appendChild(rightEl);


        ppEl.appendChild( document.createTextNode('|>') );
        ctEl.appendChild( document.createTextNode('0:00') );
        durEl.appendChild( document.createTextNode('0:00') );

        ppEl.addEventListener('click', function() {
            fire( state.isPlaying ? 'pause' : 'play' );
        });



        instance = {
            on: function on(evName, cb) {
                subscribers[evName] = cb;
                return this;
            },
            play: function play() {
                state.isPlaying = true;
                ppEl.firstChild.nodeValue = '|>';
                return this;
            },
            pause: function pause() {
                state.isPlaying = false;
                ppEl.firstChild.nodeValue = '||';
                return this;
            },
            setDuration: function setDuration(d) {
                state.duration = d;
                durEl.firstChild.nodeValue = mmss(d);
                return this;
            },
            setCurrentTime: function setCurrentTime(ct) {
                if (!state.duration) { return; }
                ctEl.firstChild.nodeValue = mmss(ct);
                var pct = ct / state.duration;
                timePctEl.style.width = (pct * 100).toFixed(2) + '%';
                return this;
            },
            setVolume: function(v) {
                volPctEl.style.width = (v * 100).toFixed(2) + '%';
                return this;
            }
        };

        return instance;
    };

})(this);
