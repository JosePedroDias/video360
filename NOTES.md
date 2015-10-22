plane vertices signs: -+ ++ -- +-
plane geo default uv coords: 01 00 11 | 00 10 11
cube map faces:   Right Left  Top
                  Down  Front Back
                  
                  
                  
            var resolveRedirect = function(url, cb) {
                var redirectSolver = 'http://stage.sl.pt:5566';
                var xhr = new XMLHttpRequest();
                xhr.open('GET', redirectSolver + '/?' + encodeURIComponent(url), true);
                var cbInner = function() {
                    if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
                        return xhr.response;
                    }
                    cb('error requesting ' + url + ' via ' + redirectSolver);
                };
                xhr.onload  = cbInner;
                xhr.onerror = cbInner;
                xhr.send(null);
            };

            resolveRedirect('http://rd3.videos.sapo.pt/VM8WZDw2zB1heeBkK0I7/mov/1', function(err, url) {
                if (err) { return window.alert(err); }
                
                ...
            });