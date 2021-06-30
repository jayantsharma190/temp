var cc = cc || {};
cc._tmp = cc._tmp || {};
cc._LogInfos = {};
var _p = window,
    _p = Object.prototype,
    _p = null;
cc._drawingUtil = null;
cc._renderContext = null;
cc._supportRender = !1;
cc._canvas = null;
cc.container = null;
cc._gameDiv = null;
cc.each = function(a, b, c) {
    if (a)
        if (a instanceof Array)
            for (var d = 0, e = a.length; d < e && !1 !== b.call(c, a[d], d); d++);
        else
            for (d in a)
                if (!1 === b.call(c, a[d], d)) break
};
cc.extend = function(a) {
    var b = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
    cc.each(b, function(b) {
        for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d])
    });
    return a
};
cc.inherits = function(a, b) {
    function c() {}
    c.prototype = b.prototype;
    a.superClass_ = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a
};
cc.isFunction = function(a) {
    return "function" === typeof a
};
cc.isNumber = function(a) {
    return "number" === typeof a || "[object Number]" === Object.prototype.toString.call(a)
};
cc.isString = function(a) {
    return "string" === typeof a || "[object String]" === Object.prototype.toString.call(a)
};
cc.isArray = function(a) {
    return Array.isArray(a) || "object" === typeof a && "[object Array]" === Object.prototype.toString.call(a)
};
cc.isUndefined = function(a) {
    return "undefined" === typeof a
};
cc.isObject = function(a) {
    return "object" === typeof a && "[object Object]" === Object.prototype.toString.call(a)
};
cc.isCrossOrigin = function(a) {
    if (!a) return cc.log("invalid URL"), !1;
    var b = a.indexOf("://");
    if (-1 === b) return !1;
    b = a.indexOf("/", b + 3);
    return (-1 === b ? a : a.substring(0, b)) !== location.origin
};
cc.AsyncPool = function(a, b, c, d, e) {
    var f = this;
    f._finished = !1;
    f._srcObj = a;
    f._limit = b;
    f._pool = [];
    f._iterator = c;
    f._iteratorTarget = e;
    f._onEnd = d;
    f._onEndTarget = e;
    f._results = a instanceof Array ? [] : {};
    f._errors = a instanceof Array ? [] : {};
    cc.each(a, function(a, b) {
        f._pool.push({
            index: b,
            value: a
        })
    });
    f.size = f._pool.length;
    f.finishedSize = 0;
    f._workingSize = 0;
    f._limit = f._limit || f.size;
    f.onIterator = function(a, b) {
        f._iterator = a;
        f._iteratorTarget = b
    };
    f.onEnd = function(a, b) {
        f._onEnd = a;
        f._onEndTarget = b
    };
    f._handleItem = function() {
        var a =
            this;
        if (!(0 === a._pool.length || a._workingSize >= a._limit)) {
            var b = a._pool.shift(),
                c = b.value,
                d = b.index;
            a._workingSize++;
            a._iterator.call(a._iteratorTarget, c, d, function(b, c) {
                if (!a._finished)
                    if (b ? a._errors[this.index] = b : a._results[this.index] = c, a.finishedSize++, a._workingSize--, a.finishedSize === a.size) a.onEnd(0 === a._errors.length ? null : a._errors, a._results);
                    else a._handleItem()
            }.bind(b), a)
        }
    };
    f.flow = function() {
        if (0 === this._pool.length) this._onEnd && this._onEnd.call(this._onEndTarget, null, []);
        else
            for (var a =
                    0; a < this._limit; a++) this._handleItem()
    };
    f.onEnd = function(a, b) {
        f._finished = !0;
        if (f._onEnd) {
            var c = f._onEnd,
                d = f._onEndTarget;
            f._onEnd = null;
            f._onEndTarget = null;
            c.call(d, a, b)
        }
    }
};
cc.async = {
    series: function(a, b, c) {
        a = new cc.AsyncPool(a, 1, function(a, b, f) {
            a.call(c, f)
        }, b, c);
        a.flow();
        return a
    },
    parallel: function(a, b, c) {
        a = new cc.AsyncPool(a, 0, function(a, b, f) {
            a.call(c, f)
        }, b, c);
        a.flow();
        return a
    },
    waterfall: function(a, b, c) {
        var d = [],
            e = [null],
            f = new cc.AsyncPool(a, 1, function(b, f, k) {
                d.push(function(b) {
                    d = Array.prototype.slice.call(arguments, 1);
                    a.length - 1 === f && (e = e.concat(d));
                    k.apply(null, arguments)
                });
                b.apply(c, d)
            }, function(a) {
                if (b) {
                    if (a) return b.call(c, a);
                    b.apply(c, e)
                }
            });
        f.flow();
        return f
    },
    map: function(a, b, c, d) {
        var e = b;
        "object" === typeof b && (c = b.cb, d = b.iteratorTarget, e = b.iterator);
        a = new cc.AsyncPool(a, 0, e, c, d);
        a.flow();
        return a
    },
    mapLimit: function(a, b, c, d, e) {
        a = new cc.AsyncPool(a, b, c, d, e);
        a.flow();
        return a
    }
};
cc.path = {
    normalizeRE: /[^\.\/]+\/\.\.\//,
    join: function() {
        for (var a = arguments.length, b = "", c = 0; c < a; c++) b = (b + ("" === b ? "" : "/") + arguments[c]).replace(/(\/|\\\\)$/, "");
        return b
    },
    extname: function(a) {
        return (a = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(a)) ? a[1] : null
    },
    mainFileName: function(a) {
        if (a) {
            var b = a.lastIndexOf(".");
            if (-1 !== b) return a.substring(0, b)
        }
        return a
    },
    basename: function(a, b) {
        var c = a.indexOf("?");
        0 < c && (a = a.substring(0, c));
        c = /(\/|\\\\)([^(\/|\\\\)]+)$/g.exec(a.replace(/(\/|\\\\)$/, ""));
        if (!c) return null;
        c = c[2];
        return b && a.substring(a.length - b.length).toLowerCase() === b.toLowerCase() ? c.substring(0, c.length - b.length) : c
    },
    dirname: function(a) {
        return a.replace(/((.*)(\/|\\|\\\\))?(.*?\..*$)?/, "$2")
    },
    changeExtname: function(a, b) {
        b = b || "";
        var c = a.indexOf("?"),
            d = "";
        0 < c && (d = a.substring(c), a = a.substring(0, c));
        c = a.lastIndexOf(".");
        return 0 > c ? a + b + d : a.substring(0, c) + b + d
    },
    changeBasename: function(a, b, c) {
        if (0 === b.indexOf(".")) return this.changeExtname(a, b);
        var d = a.indexOf("?"),
            e = "";
        c = c ? this.extname(a) : "";
        0 < d && (e = a.substring(d),
            a = a.substring(0, d));
        d = a.lastIndexOf("/");
        return a.substring(0, 0 >= d ? 0 : d + 1) + b + c + e
    },
    _normalize: function(a) {
        var b = a = String(a);
        do b = a, a = a.replace(this.normalizeRE, ""); while (b.length !== a.length);
        return a
    }
};
cc.loader = function() {
    var a = {},
        b = {},
        c = {},
        d = {},
        e = {},
        f = /^(?:https?|ftp):\/\/\S*$/i;
    return {
        resPath: "",
        audioPath: "",
        cache: {},
        getXMLHttpRequest: function() {
            var a = window.XMLHttpRequest ? new window.XMLHttpRequest : new ActiveXObject("MSXML2.XMLHTTP");
            a.timeout = 1E4;
            void 0 === a.ontimeout && (a._timeoutId = -1);
            return a
        },
        _getArgs4Js: function(a) {
            var b = a[0],
                c = a[1],
                d = a[2],
                e = ["", null, null];
            if (1 === a.length) e[1] = b instanceof Array ? b : [b];
            else if (2 === a.length) "function" === typeof c ? (e[1] = b instanceof Array ? b : [b], e[2] = c) : (e[0] =
                b || "", e[1] = c instanceof Array ? c : [c]);
            else if (3 === a.length) e[0] = b || "", e[1] = c instanceof Array ? c : [c], e[2] = d;
            else throw Error("arguments error to load js!");
            return e
        },
        isLoading: function(a) {
            return void 0 !== e[a]
        },
        loadJs: function(b, c, d) {
            var e = this,
                f = e._getArgs4Js(arguments),
                p = f[0],
                r = f[1],
                f = f[2]; - 1 < navigator.userAgent.indexOf("Trident/5") ? e._loadJs4Dependency(p, r, 0, f) : cc.async.map(r, function(b, c, d) {
                b = cc.path.join(p, b);
                if (a[b]) return d(null);
                e._createScript(b, !1, d)
            }, f)
        },
        loadJsWithImg: function(a, b, c) {
            var d =
                this._loadJsImg(),
                e = this._getArgs4Js(arguments);
            this.loadJs(e[0], e[1], function(a) {
                if (a) throw Error(a);
                d.parentNode.removeChild(d);
                if (e[2]) e[2]()
            })
        },
        _createScript: function(b, c, d) {
            var e = document,
                f = document.createElement("script");
            f.async = c;
            a[b] = !0;
            cc.game.config.noCache && "string" === typeof b ? this._noCacheRex.test(b) ? f.src = b + "\x26_t\x3d" + (new Date - 0) : f.src = b + "?_t\x3d" + (new Date - 0) : f.src = b;
            f.addEventListener("load", function() {
                f.parentNode.removeChild(f);
                this.removeEventListener("load", arguments.callee, !1);
                d()
            }, !1);
            f.addEventListener("error", function() {
                f.parentNode.removeChild(f);
                d("Load " + b + " failed!")
            }, !1);
            e.body.appendChild(f)
        },
        _loadJs4Dependency: function(a, b, c, d) {
            if (c >= b.length) d && d();
            else {
                var e = this;
                e._createScript(cc.path.join(a, b[c]), !1, function(f) {
                    if (f) return d(f);
                    e._loadJs4Dependency(a, b, c + 1, d)
                })
            }
        },
        _loadJsImg: function() {
            var a = document,
                b = a.getElementById("cocos2d_loadJsImg");
            if (!b) {
                b = document.createElement("img");
                cc._loadingImage && (b.src = cc._loadingImage);
                a = a.getElementById(cc.game.config.id);
                a.style.backgroundColor = "transparent";
                a.parentNode.appendChild(b);
                var c = getComputedStyle ? getComputedStyle(a) : a.currentStyle;
                c || (c = {
                    width: a.width,
                    height: a.height
                });
                b.style.left = a.offsetLeft + (parseFloat(c.width) - b.width) / 2 + "px";
                b.style.top = a.offsetTop + (parseFloat(c.height) - b.height) / 2 + "px";
                b.style.position = "absolute"
            }
            return b
        },
        loadTxt: function(a, b) {
            if (cc._isNodeJs) require("fs").readFile(a, function(a, c) {
                a ? b(a) : b(null, c.toString())
            });
            else {
                var c = this.getXMLHttpRequest(),
                    d = "load " + a + " failed!";
                c.open("GET",
                    a, !0);
                /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? (c.setRequestHeader("Accept-Charset", "utf-8"), c.onreadystatechange = function() {
                    4 === c.readyState && (200 === c.status ? b(null, c.responseText) : b({
                        status: c.status,
                        errorMessage: d
                    }, null))
                }) : (c.overrideMimeType && c.overrideMimeType("text/plain; charset\x3dutf-8"), c.onload = function() {
                        0 <= c._timeoutId && clearTimeout(c._timeoutId);
                        4 === c.readyState && (200 === c.status ? b(null, c.responseText) : b({
                            status: c.status,
                            errorMessage: d
                        }, null))
                    }, c.onerror =
                    function() {
                        b({
                            status: c.status,
                            errorMessage: d
                        }, null)
                    }, void 0 === c.ontimeout && (c._timeoutId = setTimeout(function() {
                        c.ontimeout()
                    }, c.timeout)), c.ontimeout = function() {
                        b({
                            status: c.status,
                            errorMessage: "Request timeout: " + d
                        }, null)
                    });
                c.send(null)
            }
        },
        loadCsb: function(a, b) {
            var c = cc.loader.getXMLHttpRequest(),
                d = "load " + a + " failed!";
            c.open("GET", a, !0);
            c.responseType = "arraybuffer";
            c.onload = function() {
                0 <= c._timeoutId && clearTimeout(c._timeoutId);
                var a = c.response;
                a && (window.msg = a);
                4 === c.readyState && (200 === c.status ?
                    b(null, c.response) : b({
                        status: c.status,
                        errorMessage: d
                    }, null))
            };
            c.onerror = function() {
                b({
                    status: c.status,
                    errorMessage: d
                }, null)
            };
            void 0 === c.ontimeout && (c._timeoutId = setTimeout(function() {
                c.ontimeout()
            }, c.timeout));
            c.ontimeout = function() {
                b({
                    status: c.status,
                    errorMessage: "Request timeout: " + d
                }, null)
            };
            c.send(null)
        },
        loadJson: function(a, b) {
            this.loadTxt(a, function(c, d) {
                if (c) b(c);
                else {
                    try {
                        var e = JSON.parse(d)
                    } catch (f) {
                        throw Error("parse json [" + a + "] failed : " + f);
                    }
                    b(null, e)
                }
            })
        },
        _checkIsImageURL: function(a) {
            return null !=
                /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(a)
        },
        loadImg: function(a, b, c) {
            var d = {
                isCrossOrigin: !0
            };
            void 0 !== c ? d.isCrossOrigin = void 0 === b.isCrossOrigin ? d.isCrossOrigin : b.isCrossOrigin : void 0 !== b && (c = b);
            var n = this.getRes(a);
            if (n) return c && c(null, n), n;
            if (b = e[a]) return b.callbacks.push(c), b.img;
            n = new Image;
            d.isCrossOrigin && "file://" !== location.origin && (n.crossOrigin = "Anonymous");
            var p = function() {
                    this.removeEventListener("load", p, !1);
                    this.removeEventListener("error", s, !1);
                    f.test(a) || (cc.loader.cache[a] =
                        n);
                    var b = e[a];
                    if (b) {
                        for (var c = b.callbacks, d = 0; d < c.length; ++d) {
                            var h = c[d];
                            h && h(null, n)
                        }
                        b.img = null;
                        delete e[a]
                    }
                },
                r = this,
                s = function() {
                    this.removeEventListener("error", s, !1);
                    if (n.crossOrigin && "anonymous" === n.crossOrigin.toLowerCase()) d.isCrossOrigin = !1, r.release(a), cc.loader.loadImg(a, d, c);
                    else {
                        var b = e[a];
                        if (b) {
                            for (var f = b.callbacks, h = 0; h < f.length; ++h) {
                                var p = f[h];
                                p && p("load image failed")
                            }
                            b.img = null;
                            delete e[a]
                        }
                    }
                };
            e[a] = {
                img: n,
                callbacks: c ? [c] : []
            };
            n.addEventListener("load", p);
            n.addEventListener("error",
                s);
            n.src = a;
            return n
        },
        _loadResIterator: function(a, c, d) {
            var e = this,
                n = null,
                p = a.type;
            p ? (p = "." + p.toLowerCase(), n = a.src ? a.src : a.name + p) : (n = a, p = cc.path.extname(n));
            if (c = e.getRes(n)) return d(null, c);
            c = null;
            p && (c = b[p.toLowerCase()]);
            if (!c) return cc.error("loader for [" + p + "] not exists!"), d();
            p = n;
            f.test(n) || (p = c.getBasePath ? c.getBasePath() : e.resPath, p = e.getUrl(p, n));
            cc.game.config.noCache && "string" === typeof p && (p = e._noCacheRex.test(p) ? p + ("\x26_t\x3d" + (new Date - 0)) : p + ("?_t\x3d" + (new Date - 0)));
            c.load(p, n, a, function(a,
                b) {
                a ? (cc.log(a), e.cache[n] = null, delete e.cache[n], d({
                    status: 520,
                    errorMessage: a
                }, null)) : (e.cache[n] = b, d(null, b))
            })
        },
        _noCacheRex: /\?/,
        getUrl: function(a, d) {
            var e = cc.path;
            if (void 0 !== a && void 0 === d) {
                d = a;
                var f = e.extname(d),
                    f = f ? f.toLowerCase() : "";
                a = (f = b[f]) ? f.getBasePath ? f.getBasePath() : this.resPath : this.resPath
            }
            d = cc.path.join(a || "", d);
            if (d.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
                if (c[d]) return c[d];
                e = e.extname(d) || "";
                d = c[d] = d.substring(0, d.length - e.length) + "_" + cc.sys.language + e
            }
            return d
        },
        load: function(a, b,
            c) {
            var d = this,
                e = arguments.length;
            if (0 === e) throw Error("arguments error!");
            3 === e ? "function" === typeof b && (b = "function" === typeof c ? {
                trigger: b,
                cb: c
            } : {
                cb: b,
                cbTarget: c
            }) : 2 === e ? "function" === typeof b && (b = {
                cb: b
            }) : 1 === e && (b = {});
            a instanceof Array || (a = [a]);
            e = new cc.AsyncPool(a, cc.CONCURRENCY_HTTP_REQUEST_COUNT, function(a, c, e, f) {
                d._loadResIterator(a, c, function(a) {
                    var c = Array.prototype.slice.call(arguments, 1);
                    b.trigger && b.trigger.call(b.triggerTarget, c[0], f.size, f.finishedSize);
                    e(a, c[0])
                })
            }, b.cb, b.cbTarget);
            e.flow();
            return e
        },
        _handleAliases: function(a, b) {
            var c = [],
                e;
            for (e in a) {
                var f = a[e];
                d[e] = f;
                c.push(f)
            }
            this.load(c, b)
        },
        loadAliases: function(a, b) {
            var c = this,
                d = c.getRes(a);
            d ? c._handleAliases(d.filenames, b) : c.load(a, function(a, d) {
                c._handleAliases(d[0].filenames, b)
            })
        },
        register: function(a, c) {
            if (a && c) {
                if ("string" === typeof a) return b[a.trim().toLowerCase()] = c;
                for (var d = 0, e = a.length; d < e; d++) b["." + a[d].trim().toLowerCase()] = c
            }
        },
        getRes: function(a) {
            return this.cache[a] || this.cache[d[a]]
        },
        _getAliase: function(a) {
            return d[a]
        },
        release: function(a) {
            var b = this.cache,
                c = e[a];
            c && (c.img = null, delete e[a]);
            delete b[a];
            delete b[d[a]];
            delete d[a]
        },
        releaseAll: function() {
            var a = this.cache,
                b;
            for (b in a) delete a[b];
            for (b in d) delete d[b]
        }
    }
}();
cc.formatStr = function() {
    var a = arguments,
        b = a.length;
    if (1 > b) return "";
    var c = a[0],
        d = !0;
    "object" === typeof c && (d = !1);
    for (var e = 1; e < b; ++e) {
        var f = a[e];
        if (d)
            for (;;) {
                var g = null;
                if ("number" === typeof f && (g = c.match(/(%d)|(%s)/))) {
                    c = c.replace(/(%d)|(%s)/, f);
                    break
                }
                c = (g = c.match(/%s/)) ? c.replace(/%s/, f) : c + ("    " + f);
                break
            } else c += "    " + f
    }
    return c
};
(function() {
    function a(a) {
        var b = cc.game.CONFIG_KEY,
            c = parseInt(a[b.renderMode]) || 0;
        if (isNaN(c) || 2 < c || 0 > c) a[b.renderMode] = 0;
        cc._renderType = cc.game.RENDER_TYPE_CANVAS;
        cc._supportRender = !1;
        0 === c ? cc.sys.capabilities.opengl ? (cc._renderType = cc.game.RENDER_TYPE_WEBGL, cc._supportRender = !0) : cc.sys.capabilities.canvas && (cc._renderType = cc.game.RENDER_TYPE_CANVAS, cc._supportRender = !0) : 1 === c && cc.sys.capabilities.canvas ? (cc._renderType = cc.game.RENDER_TYPE_CANVAS, cc._supportRender = !0) : 2 === c && cc.sys.capabilities.opengl &&
            (cc._renderType = cc.game.RENDER_TYPE_WEBGL, cc._supportRender = !0)
    }

    function b(a, c, d) {
        if (h[c]) return null;
        d = d || "";
        var e = [],
            f = a[c];
        if (!f) throw Error("can not find module [" + c + "]");
        c = cc.path;
        for (var g = 0, k = f.length; g < k; g++) {
            var m = f[g];
            if (!h[m]) {
                var x = c.extname(m);
                x ? ".js" === x.toLowerCase() && e.push(c.join(d, m)) : (x = b(a, m, d)) && (e = e.concat(x));
                h[m] = 1
            }
        }
        return e
    }

    function c(a) {
        cc._initDebugSetting && cc._initDebugSetting(a[cc.game.CONFIG_KEY.debugMode]);
        cc._engineLoaded = !0;
        console.log(cc.ENGINE_VERSION);
        m && m()
    }

    function d(a) {
        var d =
            a[cc.game.CONFIG_KEY.engineDir],
            e = cc.loader;
        if (cc.Class) c(a);
        else {
            var f = cc.path.join(d, "moduleConfig.json");
            e.loadJson(f, function(e, f) {
                if (e) throw Error(e);
                var g = a.modules || [],
                    h = f.module,
                    k = [];
                cc.sys.capabilities.opengl && 0 > g.indexOf("base4webgl") ? g.splice(0, 0, "base4webgl") : 0 > g.indexOf("core") && g.splice(0, 0, "core");
                for (var m = 0, s = g.length; m < s; m++) {
                    var r = b(h, g[m], d);
                    r && (k = k.concat(r))
                }
                cc.loader.loadJsWithImg(k, function(b) {
                    if (b) throw b;
                    c(a)
                })
            })
        }
    }

    function e() {
        this.removeEventListener("load", e, !1);
        d(cc.game.config)
    }
    var f = document.createElement("canvas"),
        g = document.createElement("canvas");
    cc.create3DContext = function(a, b) {
        for (var c = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], d = null, e = 0; e < c.length; ++e) {
            try {
                d = a.getContext(c[e], b)
            } catch (f) {}
            if (d) break
        }
        return d
    };
    (function() {
        cc.sys = {};
        var a = cc.sys;
        a.LANGUAGE_ENGLISH = "en";
        a.LANGUAGE_CHINESE = "zh";
        a.LANGUAGE_FRENCH = "fr";
        a.LANGUAGE_ITALIAN = "it";
        a.LANGUAGE_GERMAN = "de";
        a.LANGUAGE_SPANISH = "es";
        a.LANGUAGE_DUTCH = "du";
        a.LANGUAGE_RUSSIAN = "ru";
        a.LANGUAGE_KOREAN = "ko";
        a.LANGUAGE_JAPANESE = "ja";
        a.LANGUAGE_HUNGARIAN = "hu";
        a.LANGUAGE_PORTUGUESE = "pt";
        a.LANGUAGE_ARABIC = "ar";
        a.LANGUAGE_NORWEGIAN = "no";
        a.LANGUAGE_POLISH = "pl";
        a.LANGUAGE_UNKNOWN = "unkonwn";
        a.OS_IOS = "iOS";
        a.OS_ANDROID = "Android";
        a.OS_WINDOWS = "Windows";
        a.OS_MARMALADE = "Marmalade";
        a.OS_LINUX = "Linux";
        a.OS_BADA = "Bada";
        a.OS_BLACKBERRY = "Blackberry";
        a.OS_OSX = "OS X";
        a.OS_WP8 = "WP8";
        a.OS_WINRT = "WINRT";
        a.OS_UNKNOWN = "Unknown";
        a.UNKNOWN = -1;
        a.WIN32 = 0;
        a.LINUX = 1;
        a.MACOS = 2;
        a.ANDROID = 3;
        a.IPHONE = 4;
        a.IPAD = 5;
        a.BLACKBERRY = 6;
        a.NACL =
            7;
        a.EMSCRIPTEN = 8;
        a.TIZEN = 9;
        a.WINRT = 10;
        a.WP8 = 11;
        a.MOBILE_BROWSER = 100;
        a.DESKTOP_BROWSER = 101;
        a.BROWSER_TYPE_WECHAT = "wechat";
        a.BROWSER_TYPE_ANDROID = "androidbrowser";
        a.BROWSER_TYPE_IE = "ie";
        a.BROWSER_TYPE_QQ_APP = "qq";
        a.BROWSER_TYPE_QQ = "qqbrowser";
        a.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
        a.BROWSER_TYPE_UC = "ucbrowser";
        a.BROWSER_TYPE_360 = "360browser";
        a.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
        a.BROWSER_TYPE_BAIDU = "baidubrowser";
        a.BROWSER_TYPE_MAXTHON = "maxthon";
        a.BROWSER_TYPE_OPERA = "opera";
        a.BROWSER_TYPE_OUPENG = "oupeng";
        a.BROWSER_TYPE_MIUI = "miuibrowser";
        a.BROWSER_TYPE_FIREFOX = "firefox";
        a.BROWSER_TYPE_SAFARI = "safari";
        a.BROWSER_TYPE_CHROME = "chrome";
        a.BROWSER_TYPE_LIEBAO = "liebao";
        a.BROWSER_TYPE_QZONE = "qzone";
        a.BROWSER_TYPE_SOUGOU = "sogou";
        a.BROWSER_TYPE_UNKNOWN = "unknown";
        a.isNative = !1;
        var b = window,
            c = b.navigator,
            d = document,
            e = d.documentElement,
            h = c.userAgent.toLowerCase();
        a.isMobile = /mobile|android|iphone|ipad/.test(h);
        a.platform = a.isMobile ? a.MOBILE_BROWSER : a.DESKTOP_BROWSER;
        var k = c.language,
            k = (k = k ? k : c.browserLanguage) ?
            k.split("-")[0] : a.LANGUAGE_ENGLISH;
        a.language = k;
        var m = !1,
            k = !1,
            x = "",
            A = 0,
            y = /android (\d+(?:\.\d+)+)/i.exec(h) || /android (\d+(?:\.\d+)+)/i.exec(c.platform);
        y && (m = !0, x = y[1] || "", A = parseInt(x) || 0);
        (y = /(iPad|iPhone|iPod).*OS ((\d+_?){2,3})/i.exec(h)) ? (k = !0, x = y[2] || "", A = parseInt(x) || 0) : /(iPhone|iPad|iPod)/.exec(c.platform) && (k = !0, x = "", A = 0);
        y = a.OS_UNKNOWN; - 1 !== c.appVersion.indexOf("Win") ? y = a.OS_WINDOWS : k ? y = a.OS_IOS : -1 !== c.appVersion.indexOf("Mac") ? y = a.OS_OSX : -1 !== c.appVersion.indexOf("X11") && -1 === c.appVersion.indexOf("Linux") ?
            y = a.OS_UNIX : m ? y = a.OS_ANDROID : -1 !== c.appVersion.indexOf("Linux") && (y = a.OS_LINUX);
        a.os = y;
        a.osVersion = x;
        a.osMainVersion = A;
        a.browserType = a.BROWSER_TYPE_UNKNOWN;
        (function() {
            var b = /qqbrowser|qq|chrome|safari|firefox|opr|oupeng|opera/i,
                c = /micromessenger|mqqbrowser|sogou|qzone|liebao|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|trident|miuibrowser/i.exec(h);
            c || (c = b.exec(h));
            b = c ? c[0] : a.BROWSER_TYPE_UNKNOWN;
            "micromessenger" === b ? b = a.BROWSER_TYPE_WECHAT : "safari" === b && m ? b = a.BROWSER_TYPE_ANDROID :
                "trident" === b ? b = a.BROWSER_TYPE_IE : "360 aphone" === b ? b = a.BROWSER_TYPE_360 : "mxbrowser" === b ? b = a.BROWSER_TYPE_MAXTHON : "opr" === b && (b = a.BROWSER_TYPE_OPERA);
            a.browserType = b
        })();
        a.browserVersion = "";
        (function() {
            var b = /(msie |rv:|firefox|chrome|ucbrowser|oupeng|opera|opr|safari|miui)(mobile)?(browser)?\/?([\d.]+)/i,
                c = h.match(/(micromessenger|qq|mx|maxthon|baidu|sogou)(mobile)?(browser)?\/?([\d.]+)/i);
            c || (c = h.match(b));
            a.browserVersion = c ? c[4] : ""
        })();
        k = window.devicePixelRatio || 1;
        a.windowPixelResolution = {
            width: k *
                (window.innerWidth || document.documentElement.clientWidth),
            height: k * (window.innerHeight || document.documentElement.clientHeight)
        };
        a._checkWebGLRenderMode = function() {
            if (cc._renderType !== cc.game.RENDER_TYPE_WEBGL) throw Error("This feature supports WebGL render mode only.");
        };
        a._supportCanvasNewBlendModes = function() {
            var a = f;
            a.width = 1;
            a.height = 1;
            a = a.getContext("2d");
            a.fillStyle = "#000";
            a.fillRect(0, 0, 1, 1);
            a.globalCompositeOperation = "multiply";
            var b = g;
            b.width = 1;
            b.height = 1;
            var c = b.getContext("2d");
            c.fillStyle =
                "#fff";
            c.fillRect(0, 0, 1, 1);
            a.drawImage(b, 0, 0, 1, 1);
            return 0 === a.getImageData(0, 0, 1, 1).data[0]
        }();
        cc.sys.isMobile && (k = document.createElement("style"), k.type = "text/css", document.body.appendChild(k), k.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;-webkit-tap-highlight-color:rgba(0,0,0,0);}");
        try {
            var z = a.localStorage = b.localStorage;
            z.setItem("storage", "");
            z.removeItem("storage");
            z = null
        } catch (B) {
            z = function() {
                    cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option")
                },
                a.localStorage = {
                    getItem: z,
                    setItem: z,
                    removeItem: z,
                    clear: z
                }
        }
        z = !!f.getContext("2d");
        k = !1;
        if (b.WebGLRenderingContext) {
            x = document.createElement("CANVAS");
            try {
                var C = cc.create3DContext(x);
                C && C.getShaderPrecisionFormat && (k = !0);
                k && a.os === a.OS_IOS && 9 === a.osMainVersion && (window.indexedDB || (k = !1));
                if (k && a.os === a.OS_ANDROID) {
                    var D = parseFloat(a.browserVersion);
                    switch (a.browserType) {
                        case a.BROWSER_TYPE_MOBILE_QQ:
                        case a.BROWSER_TYPE_BAIDU:
                        case a.BROWSER_TYPE_BAIDU_APP:
                            k = 6.2 <= D ? !0 : !1;
                            break;
                        case a.BROWSER_TYPE_CHROME:
                            k =
                                30 <= D ? !0 : !1;
                            break;
                        case a.BROWSER_TYPE_ANDROID:
                            a.osMainVersion && 5 <= a.osMainVersion && (k = !0);
                            break;
                        case a.BROWSER_TYPE_UNKNOWN:
                        case a.BROWSER_TYPE_360:
                        case a.BROWSER_TYPE_MIUI:
                        case a.BROWSER_TYPE_UC:
                            k = !1
                    }
                }
            } catch (E) {}
            x = null
        }
        C = a.capabilities = {
            canvas: z,
            opengl: k
        };
        if (void 0 !== e.ontouchstart || void 0 !== d.ontouchstart || c.msPointerEnabled) C.touches = !0;
        void 0 !== e.onmouseup && (C.mouse = !0);
        void 0 !== e.onkeyup && (C.keyboard = !0);
        if (b.DeviceMotionEvent || b.DeviceOrientationEvent) C.accelerometer = !0;
        a.garbageCollect = function() {};
        a.dumpRoot = function() {};
        a.restartVM = function() {};
        a.cleanScript = function(a) {};
        a.isObjectValid = function(a) {
            return a ? !0 : !1
        };
        a.dump = function() {
            var a;
            a = "" + ("isMobile : " + this.isMobile + "\r\n");
            a += "language : " + this.language + "\r\n";
            a += "browserType : " + this.browserType + "\r\n";
            a += "browserVersion : " + this.browserVersion + "\r\n";
            a += "capabilities : " + JSON.stringify(this.capabilities) + "\r\n";
            a += "os : " + this.os + "\r\n";
            a += "osVersion : " + this.osVersion + "\r\n";
            a += "platform : " + this.platform + "\r\n";
            a += "Using " + (cc._renderType ===
                cc.game.RENDER_TYPE_WEBGL ? "WEBGL" : "CANVAS") + " renderer.\r\n";
            cc.log(a)
        };
        a.openURL = function(a) {
            window.open(a)
        };
        a.now = function() {
            return Date.now ? Date.now() : +new Date
        }
    })();
    g = f = null;
    cc.log = cc.warn = cc.error = cc.assert = function() {};
    var h = {},
        k = !1,
        m = null;
    cc._engineLoaded = !1;
    cc.initEngine = function(b, c) {
        if (k) {
            var f = m;
            m = function() {
                f && f();
                c && c()
            }
        } else m = c, !cc.game.config && b ? cc.game.config = b : cc.game.config || cc.game._loadConfig(), b = cc.game.config, a(b), document.body ? d(b) : cc._addEventListener(window, "load", e, !1),
            k = !0
    }
})();
cc.game = {
    DEBUG_MODE_NONE: 0,
    DEBUG_MODE_INFO: 1,
    DEBUG_MODE_WARN: 2,
    DEBUG_MODE_ERROR: 3,
    DEBUG_MODE_INFO_FOR_WEB_PAGE: 4,
    DEBUG_MODE_WARN_FOR_WEB_PAGE: 5,
    DEBUG_MODE_ERROR_FOR_WEB_PAGE: 6,
    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    EVENT_RESIZE: "game_on_resize",
    EVENT_RENDERER_INITED: "renderer_inited",
    RENDER_TYPE_CANVAS: 0,
    RENDER_TYPE_WEBGL: 1,
    RENDER_TYPE_OPENGL: 2,
    _eventHide: null,
    _eventShow: null,
    CONFIG_KEY: {
        width: "width",
        height: "height",
        engineDir: "engineDir",
        modules: "modules",
        debugMode: "debugMode",
        exposeClassName: "exposeClassName",
        showFPS: "showFPS",
        frameRate: "frameRate",
        id: "id",
        renderMode: "renderMode",
        jsList: "jsList"
    },
    _paused: !0,
    _configLoaded: !1,
    _prepareCalled: !1,
    _prepared: !1,
    _rendererInitialized: !1,
    _renderContext: null,
    _intervalId: null,
    _lastTime: null,
    _frameTime: null,
    frame: null,
    container: null,
    canvas: null,
    config: null,
    onStart: null,
    onStop: null,
    setFrameRate: function(a) {
        this.config[this.CONFIG_KEY.frameRate] = a;
        this._intervalId && window.cancelAnimationFrame(this._intervalId);
        this._paused = !0;
        this._setAnimFrame();
        this._runMainLoop()
    },
    step: function() {
        cc.director.mainLoop()
    },
    pause: function() {
        this._paused || (this._paused = !0, cc.audioEngine && cc.audioEngine._pausePlaying(), this._intervalId && window.cancelAnimationFrame(this._intervalId), this._intervalId = 0)
    },
    resume: function() {
        this._paused && (this._paused = !1, cc.audioEngine && cc.audioEngine._resumePlaying(), this._runMainLoop())
    },
    isPaused: function() {
        return this._paused
    },
    restart: function() {
        cc.director.popToSceneStackLevel(0);
        cc.audioEngine && cc.audioEngine.end();
        cc.game.onStart()
    },
    end: function() {
        close()
    },
    prepare: function(a) {
        var b = this,
            c = b.config,
            d = b.CONFIG_KEY;
        this._configLoaded ? this._prepared ? a && a() : this._prepareCalled || (cc._engineLoaded ? (this._prepareCalled = !0, this._initRenderer(c[d.width], c[d.height]), cc.view = cc.EGLView._getInstance(), cc.director = cc.Director._getInstance(), cc.director.setOpenGLView && cc.director.setOpenGLView(cc.view), cc.winSize = cc.director.getWinSize(), this._initEvents(), this._setAnimFrame(), this._runMainLoop(), (c = c[d.jsList]) ? cc.loader.loadJsWithImg(c, function(c) {
            if (c) throw Error(c);
            b._prepared = !0;
            a && a()
        }) : a && a()) : cc.initEngine(this.config, function() {
            b.prepare(a)
        })) : this._loadConfig(function() {
            b.prepare(a)
        })
    },
    run: function(a, b) {
        "function" === typeof a ? cc.game.onStart = a : (a && ("string" === typeof a ? (cc.game.config || this._loadConfig(), cc.game.config[cc.game.CONFIG_KEY.id] = a) : cc.game.config = a), "function" === typeof b && (cc.game.onStart = b));
        this.prepare(cc.game.onStart && cc.game.onStart.bind(cc.game))
    },
    _setAnimFrame: function() {
        this._lastTime = new Date;
        this._frameTime = 1E3 / cc.game.config[cc.game.CONFIG_KEY.frameRate];
        cc.sys.os === cc.sys.OS_IOS && cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT || 60 !== cc.game.config[cc.game.CONFIG_KEY.frameRate] ? (window.requestAnimFrame = this._stTime, window.cancelAnimationFrame = this._ctTime) : (window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || this._stTime, window.cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.msCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.oCancelAnimationFrame || this._ctTime)
    },
    _stTime: function(a) {
        var b = (new Date).getTime(),
            c = Math.max(0, cc.game._frameTime - (b - cc.game._lastTime)),
            d = window.setTimeout(function() {
                a()
            }, c);
        cc.game._lastTime = b + c;
        return d
    },
    _ctTime: function(a) {
        window.clearTimeout(a)
    },
    _runMainLoop: function() {
        var a =
            this,
            b, c = cc.director;
        c.setDisplayStats(a.config[a.CONFIG_KEY.showFPS]);
        b = function() {
            a._paused || (c.mainLoop(), a._intervalId && window.cancelAnimationFrame(a._intervalId), a._intervalId = window.requestAnimFrame(b))
        };
        window.requestAnimFrame(b);
        a._paused = !1
    },
    _loadConfig: function(a) {
        var b = this.config || document.ccConfig;
        if (b) this._initConfig(b), a && a();
        else {
            for (var c = document.getElementsByTagName("script"), d = 0; d < c.length && (b = c[d].getAttribute("cocos"), "" !== b && !b); d++);
            var e = this,
                b = function(b, c) {
                    var d = JSON.parse(c);
                    e._initConfig(d);
                    a && a()
                };
            if (d < c.length) {
                if (c = c[d].src) c = /(.*)\//.exec(c)[0], cc.loader.resPath = c, c = cc.path.join(c, "project.json");
                cc.loader.loadTxt(c, b)
            }
            cc.loader.loadTxt("project.json", b)
        }
    },
    _initConfig: function(a) {
        var b = this.CONFIG_KEY,
            c = a[b.modules];
        a[b.showFPS] = "undefined" === typeof a[b.showFPS] ? !0 : a[b.showFPS];
        a[b.engineDir] = a[b.engineDir] || "frameworks/cocos2d-html5";
        null == a[b.debugMode] && (a[b.debugMode] = 0);
        a[b.exposeClassName] = !!a[b.exposeClassName];
        a[b.frameRate] = a[b.frameRate] || 60;
        null == a[b.renderMode] &&
            (a[b.renderMode] = 0);
        null == a[b.registerSystemEvent] && (a[b.registerSystemEvent] = !0);
        c && 0 > c.indexOf("core") && c.splice(0, 0, "core");
        c && (a[b.modules] = c);
        this.config = a;
        this._configLoaded = !0
    },
    _initRenderer: function(a, b) {
        if (!this._rendererInitialized) {
            if (!cc._supportRender) throw Error("The renderer doesn't support the renderMode " + this.config[this.CONFIG_KEY.renderMode]);
            var c = this.config[cc.game.CONFIG_KEY.id],
                d = window,
                c = cc.$(c) || cc.$("#" + c),
                e, f;
            "CANVAS" === c.tagName ? (a = a || c.width, b = b || c.height, this.canvas =
                cc._canvas = e = c, this.container = cc.container = f = document.createElement("DIV"), e.parentNode && e.parentNode.insertBefore(f, e)) : ("DIV" !== c.tagName && cc.log("Warning: target element is not a DIV or CANVAS"), a = a || c.clientWidth, b = b || c.clientHeight, this.canvas = cc._canvas = e = document.createElement("CANVAS"), this.container = cc.container = f = document.createElement("DIV"), c.appendChild(f));
            f.setAttribute("id", "Cocos2dGameContainer");
            f.appendChild(e);
            this.frame = f.parentNode === document.body ? document.documentElement : f.parentNode;
            e.addClass("gameCanvas");
            e.setAttribute("width", a || 480);
            e.setAttribute("height", b || 320);
            e.setAttribute("tabindex", 99);
            cc._renderType === cc.game.RENDER_TYPE_WEBGL && (this._renderContext = cc._renderContext = cc.webglContext = cc.create3DContext(e, {
                stencil: !0,
                alpha: !1
            }));
            this._renderContext ? (cc.renderer = cc.rendererWebGL, d.gl = this._renderContext, cc.renderer.init(), cc._drawingUtil = new cc.DrawingPrimitiveWebGL(this._renderContext), cc.textureCache._initializingRenderer(), cc.glExt = {}, cc.glExt.instanced_arrays = d.gl.getExtension("ANGLE_instanced_arrays"),
                cc.glExt.element_uint = d.gl.getExtension("OES_element_index_uint")) : (cc._renderType = cc.game.RENDER_TYPE_CANVAS, cc.renderer = cc.rendererCanvas, this._renderContext = cc._renderContext = new cc.CanvasContextWrapper(e.getContext("2d")), cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(this._renderContext) : null);
            cc._gameDiv = f;
            cc.game.canvas.oncontextmenu = function() {
                if (!cc._isContextMenuEnable) return !1
            };
            this.dispatchEvent(this.EVENT_RENDERER_INITED, !0);
            this._rendererInitialized = !0
        }
    },
    _initEvents: function() {
        var a =
            window,
            b;
        this._eventHide = this._eventHide || new cc.EventCustom(this.EVENT_HIDE);
        this._eventHide.setUserData(this);
        this._eventShow = this._eventShow || new cc.EventCustom(this.EVENT_SHOW);
        this._eventShow.setUserData(this);
        this.config[this.CONFIG_KEY.registerSystemEvent] && cc.inputManager.registerSystemEvent(this.canvas);
        cc.isUndefined(document.hidden) ? cc.isUndefined(document.mozHidden) ? cc.isUndefined(document.msHidden) ? cc.isUndefined(document.webkitHidden) || (b = "webkitHidden") : b = "msHidden" : b = "mozHidden" : b =
            "hidden";
        var c = ["visibilitychange", "mozvisibilitychange", "msvisibilitychange", "webkitvisibilitychange", "qbrowserVisibilityChange"],
            d = function() {
                cc.eventManager && cc.game._eventHide && cc.eventManager.dispatchEvent(cc.game._eventHide)
            },
            e = function() {
                cc.eventManager && cc.game._eventShow && cc.eventManager.dispatchEvent(cc.game._eventShow)
            };
        if (b)
            for (var f = 0; f < c.length; f++) document.addEventListener(c[f], function(a) {
                var c = document[b];
                (c = c || a.hidden) ? d(): e()
            }, !1);
        else a.addEventListener("blur", d, !1), a.addEventListener("focus",
            e, !1); - 1 < navigator.userAgent.indexOf("MicroMessenger") && (a.onfocus = function() {
            e()
        });
        "onpageshow" in window && "onpagehide" in window && (a.addEventListener("pagehide", d, !1), a.addEventListener("pageshow", e, !1));
        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function() {
            cc.game.pause()
        });
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function() {
            cc.game.resume()
        })
    }
};
Function.prototype.bind = Function.prototype.bind || function(a) {
    if (!cc.isFunction(this)) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var b = Array.prototype.slice.call(arguments, 1),
        c = this,
        d = function() {},
        e = function() {
            return c.apply(this instanceof d && a ? this : a, b.concat(Array.prototype.slice.call(arguments)))
        };
    d.prototype = this.prototype;
    e.prototype = new d;
    return e
};
cc.EventHelper = function() {};
cc.EventHelper.prototype = {
    constructor: cc.EventHelper,
    apply: function(a) {
        a.addEventListener = cc.EventHelper.prototype.addEventListener;
        a.hasEventListener = cc.EventHelper.prototype.hasEventListener;
        a.removeEventListener = cc.EventHelper.prototype.removeEventListener;
        a.dispatchEvent = cc.EventHelper.prototype.dispatchEvent
    },
    addEventListener: function(a, b, c) {
        if ("load" === a && this._textureLoaded) setTimeout(function() {
            b.call(c)
        }, 0);
        else {
            void 0 === this._listeners && (this._listeners = {});
            var d = this._listeners;
            void 0 ===
                d[a] && (d[a] = []);
            this.hasEventListener(a, b, c) || d[a].push({
                callback: b,
                eventTarget: c
            })
        }
    },
    hasEventListener: function(a, b, c) {
        if (void 0 === this._listeners) return !1;
        var d = this._listeners;
        if (void 0 !== d[a]) {
            a = 0;
            for (var e = d.length; a < e; a++) {
                var f = d[a];
                if (f.callback === b && f.eventTarget === c) return !0
            }
        }
        return !1
    },
    removeEventListener: function(a, b, c) {
        if (void 0 !== this._listeners && (a = this._listeners[a], void 0 !== a))
            for (var d = 0; d < a.length;) {
                var e = a[d];
                e.eventTarget === c && e.callback === b ? a.splice(d, 1) : d++
            }
    },
    removeEventTarget: function(a,
        b, c) {
        if (void 0 !== this._listeners && (a = this._listeners[a], void 0 !== a))
            for (b = 0; b < a.length;) a[b].eventTarget === c ? a.splice(b, 1) : b++
    },
    dispatchEvent: function(a, b) {
        if (void 0 !== this._listeners) {
            null == b && (b = !0);
            var c = this._listeners[a];
            if (void 0 !== c) {
                for (var d = [], e = c.length, f = 0; f < e; f++) d[f] = c[f];
                for (f = 0; f < e; f++) d[f].callback.call(d[f].eventTarget, this);
                b && (c.length = 0)
            }
        }
    }
};
cc.EventHelper.prototype.apply(cc.game);
cc._LogInfos = {
    ActionManager_addAction: "cc.ActionManager.addAction(): action must be non-null",
    ActionManager_removeAction: "cocos2d: removeAction: Target not found",
    ActionManager_removeActionByTag: "cc.ActionManager.removeActionByTag(): an invalid tag",
    ActionManager_removeActionByTag_2: "cc.ActionManager.removeActionByTag(): target must be non-null",
    ActionManager_getActionByTag: "cc.ActionManager.getActionByTag(): an invalid tag",
    ActionManager_getActionByTag_2: "cocos2d : getActionByTag(tag \x3d %s): Action not found",
    configuration_dumpInfo: "cocos2d: **** WARNING **** CC_ENABLE_PROFILERS is defined. Disable it when you finish profiling (from ccConfig.js)",
    configuration_loadConfigFile: "Expected 'data' dict, but not found. Config file: %s",
    configuration_loadConfigFile_2: "Please load the resource first : %s",
    Director_resume: "cocos2d: Director: Error in gettimeofday",
    Director_setProjection: "cocos2d: Director: unrecognized projection",
    Director_popToSceneStackLevel: "cocos2d: Director: unrecognized projection",
    Director_popToSceneStackLevel_2: "cocos2d: Director: Error in gettimeofday",
    Director_popScene: "running scene should not null",
    Director_pushScene: "the scene should not null",
    arrayVerifyType: "element type is wrong!",
    Scheduler_scheduleCallbackForTarget: "CCSheduler#scheduleCallback. Callback already scheduled. Updating interval from:%s to %s",
    Scheduler_scheduleCallbackForTarget_2: "cc.scheduler.scheduleCallbackForTarget(): callback_fn should be non-null.",
    Scheduler_scheduleCallbackForTarget_3: "cc.scheduler.scheduleCallbackForTarget(): target should be non-null.",
    Scheduler_pauseTarget: "cc.Scheduler.pauseTarget():target should be non-null",
    Scheduler_resumeTarget: "cc.Scheduler.resumeTarget():target should be non-null",
    Scheduler_isTargetPaused: "cc.Scheduler.isTargetPaused():target should be non-null",
    Node_getZOrder: "getZOrder is deprecated. Please use getLocalZOrder instead.",
    Node_setZOrder: "setZOrder is deprecated. Please use setLocalZOrder instead.",
    Node_getRotation: "RotationX !\x3d RotationY. Don't know which one to return",
    Node_getScale: "ScaleX !\x3d ScaleY. Don't know which one to return",
    Node_addChild: "An Node can't be added as a child of itself.",
    Node_addChild_2: "child already added. It can't be added again",
    Node_addChild_3: "child must be non-null",
    Node_removeFromParentAndCleanup: "removeFromParentAndCleanup is deprecated. Use removeFromParent instead",
    Node_boundingBox: "boundingBox is deprecated. Use getBoundingBox instead",
    Node_removeChildByTag: "argument tag is an invalid tag",
    Node_removeChildByTag_2: "cocos2d: removeChildByTag(tag \x3d %s): child not found!",
    Node_removeAllChildrenWithCleanup: "removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead",
    Node_stopActionByTag: "cc.Node.stopActionBy(): argument tag an invalid tag",
    Node_getActionByTag: "cc.Node.getActionByTag(): argument tag is an invalid tag",
    Node_resumeSchedulerAndActions: "resumeSchedulerAndActions is deprecated, please use resume instead.",
    Node_pauseSchedulerAndActions: "pauseSchedulerAndActions is deprecated, please use pause instead.",
    Node__arrayMakeObjectsPerformSelector: "Unknown callback function",
    Node_reorderChild: "cc.Node.reorderChild(): child must be non-null",
    Node_reorderChild_2: "cc.Node.reorderChild(): this child is not in children list",
    Node_runAction: "cc.Node.runAction(): action must be non-null",
    Node_schedule: "callback function must be non-null",
    Node_schedule_2: "interval must be positive",
    Node_initWithTexture: "cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.",
    AtlasNode_updateAtlasValues: "cc.AtlasNode.updateAtlasValues(): Shall be overridden in subclasses",
    AtlasNode_initWithTileFile: "",
    AtlasNode__initWithTexture: "cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.",
    _EventListenerKeyboard_checkAvailable: "cc._EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!",
    _EventListenerTouchOneByOne_checkAvailable: "cc._EventListenerTouchOneByOne.checkAvailable(): Invalid EventListenerTouchOneByOne!",
    _EventListenerTouchAllAtOnce_checkAvailable: "cc._EventListenerTouchAllAtOnce.checkAvailable(): Invalid EventListenerTouchAllAtOnce!",
    _EventListenerAcceleration_checkAvailable: "cc._EventListenerAcceleration.checkAvailable(): _onAccelerationEvent must be non-nil",
    EventListener_create: "Invalid parameter.",
    __getListenerID: "Don't call this method if the event is for touch.",
    eventManager__forceAddEventListener: "Invalid scene graph priority!",
    eventManager_addListener: "0 priority is forbidden for fixed priority since it's used for scene graph based priority.",
    eventManager_removeListeners: "Invalid listener type!",
    eventManager_setPriority: "Can't set fixed priority with scene graph based listener.",
    eventManager_addListener_2: "Invalid parameters.",
    eventManager_addListener_3: "listener must be a cc.EventListener object when adding a fixed priority listener",
    eventManager_addListener_4: "The listener has been registered, please don't register it again.",
    LayerMultiplex_initWithLayers: "parameters should not be ending with null in Javascript",
    LayerMultiplex_switchTo: "Invalid index in MultiplexLayer switchTo message",
    LayerMultiplex_switchToAndReleaseMe: "Invalid index in MultiplexLayer switchTo message",
    LayerMultiplex_addLayer: "cc.Layer.addLayer(): layer should be non-null",
    EGLView_setDesignResolutionSize: "Resolution not valid",
    EGLView_setDesignResolutionSize_2: "should set resolutionPolicy",
    inputManager_handleTouchesBegin: "The touches is more than MAX_TOUCHES, nUnusedIndex \x3d %s",
    swap: "cc.swap is being modified from original macro, please check usage",
    checkGLErrorDebug: "WebGL error %s",
    animationCache__addAnimationsWithDictionary: "cocos2d: cc.AnimationCache: No animations were found in provided dictionary.",
    animationCache__addAnimationsWithDictionary_2: "cc.AnimationCache. Invalid animation format",
    animationCache_addAnimations: "cc.AnimationCache.addAnimations(): File could not be found",
    animationCache__parseVersion1: "cocos2d: cc.AnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
    animationCache__parseVersion1_2: "cocos2d: cc.AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.",
    animationCache__parseVersion1_3: "cocos2d: cc.AnimationCache: None of the frames for animation '%s' were found in the cc.SpriteFrameCache. Animation is not being added to the Animation Cache.",
    animationCache__parseVersion1_4: "cocos2d: cc.AnimationCache: An animation in your dictionary refers to a frame which is not in the cc.SpriteFrameCache. Some or all of the frames for the animation '%s' may be missing.",
    animationCache__parseVersion2: "cocos2d: CCAnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
    animationCache__parseVersion2_2: "cocos2d: cc.AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.",
    animationCache_addAnimations_2: "cc.AnimationCache.addAnimations(): Invalid texture file name",
    Sprite_ignoreAnchorPointForPosition: "cc.Sprite.ignoreAnchorPointForPosition(): it is invalid in cc.Sprite when using SpriteBatchNode",
    Sprite_setDisplayFrameWithAnimationName: "cc.Sprite.setDisplayFrameWithAnimationName(): Frame not found",
    Sprite_setDisplayFrameWithAnimationName_2: "cc.Sprite.setDisplayFrameWithAnimationName(): Invalid frame index",
    Sprite_setDisplayFrame: "setDisplayFrame is deprecated, please use setSpriteFrame instead.",
    Sprite__updateBlendFunc: "cc.Sprite._updateBlendFunc(): _updateBlendFunc doesn't work when the sprite is rendered using a cc.CCSpriteBatchNode",
    Sprite_initWithSpriteFrame: "cc.Sprite.initWithSpriteFrame(): spriteFrame should be non-null",
    Sprite_initWithSpriteFrameName: "cc.Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null",
    Sprite_initWithSpriteFrameName1: " is null, please check.",
    Sprite_initWithFile: "cc.Sprite.initWithFile(): filename should be non-null",
    Sprite_setDisplayFrameWithAnimationName_3: "cc.Sprite.setDisplayFrameWithAnimationName(): animationName must be non-null",
    Sprite_addChild: "cc.Sprite.addChild(): cc.Sprite only supports cc.Sprites as children when using cc.SpriteBatchNode",
    Sprite_addChild_2: "cc.Sprite.addChild(): cc.Sprite only supports a sprite using same texture as children when using cc.SpriteBatchNode",
    Sprite_addChild_3: "cc.Sprite.addChild(): child should be non-null",
    Sprite_setTexture: "cc.Sprite.texture setter: Batched sprites should use the same texture as the batchnode",
    Sprite_updateQuadFromSprite: "cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    Sprite_insertQuadFromSprite: "cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    Sprite_addChild_4: "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children",
    Sprite_addChild_5: "cc.SpriteBatchNode.addChild(): cc.Sprite is not using the same texture",
    Sprite_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
    Sprite_setSpriteFrame: "Invalid spriteFrameName",
    Sprite_setTexture_2: "Invalid argument: cc.Sprite.texture setter expects a CCTexture2D.",
    Sprite_updateQuadFromSprite_2: "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
    Sprite_insertQuadFromSprite_2: "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
    SpriteBatchNode_addSpriteWithoutQuad: "cc.SpriteBatchNode.addQuadFromSprite(): SpriteBatchNode only supports cc.Sprites as children",
    SpriteBatchNode_increaseAtlasCapacity: "cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from %s to %s.",
    SpriteBatchNode_increaseAtlasCapacity_2: "cocos2d: WARNING: Not enough memory to resize the atlas",
    SpriteBatchNode_reorderChild: "cc.SpriteBatchNode.addChild(): Child doesn't belong to Sprite",
    SpriteBatchNode_removeChild: "cc.SpriteBatchNode.addChild(): sprite batch node should contain the child",
    SpriteBatchNode_addSpriteWithoutQuad_2: "cc.SpriteBatchNode.addQuadFromSprite(): child should be non-null",
    SpriteBatchNode_reorderChild_2: "cc.SpriteBatchNode.addChild(): child should be non-null",
    spriteFrameCache__getFrameConfig: "cocos2d: WARNING: originalWidth/Height not found on the cc.SpriteFrame. AnchorPoint won't work as expected. Regenrate the .plist",
    spriteFrameCache_addSpriteFrames: "cocos2d: WARNING: an alias with name %s already exists",
    spriteFrameCache__checkConflict: "cocos2d: WARNING: Sprite frame: %s has already been added by another source, please fix name conflit",
    spriteFrameCache_getSpriteFrame: "cocos2d: cc.SpriteFrameCahce: Frame %s not found",
    spriteFrameCache__getFrameConfig_2: "Please load the resource first : %s",
    spriteFrameCache_addSpriteFrames_2: "cc.SpriteFrameCache.addSpriteFrames(): plist should be non-null",
    spriteFrameCache_addSpriteFrames_3: "Argument must be non-nil",
    CCSpriteBatchNode_updateQuadFromSprite: "cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    CCSpriteBatchNode_insertQuadFromSprite: "cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    CCSpriteBatchNode_addChild: "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children",
    CCSpriteBatchNode_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
    CCSpriteBatchNode_addChild_2: "cc.Sprite.addChild(): child should be non-null",
    CCSpriteBatchNode_setSpriteFrame: "Invalid spriteFrameName",
    CCSpriteBatchNode_setTexture: "Invalid argument: cc.Sprite texture setter expects a CCTexture2D.",
    CCSpriteBatchNode_updateQuadFromSprite_2: "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
    CCSpriteBatchNode_insertQuadFromSprite_2: "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
    CCSpriteBatchNode_addChild_3: "cc.SpriteBatchNode.addChild(): child should be non-null",
    TextureAtlas_initWithFile: "cocos2d: Could not open file: %s",
    TextureAtlas_insertQuad: "cc.TextureAtlas.insertQuad(): invalid totalQuads",
    TextureAtlas_initWithTexture: "cc.TextureAtlas.initWithTexture():texture should be non-null",
    TextureAtlas_updateQuad: "cc.TextureAtlas.updateQuad(): quad should be non-null",
    TextureAtlas_updateQuad_2: "cc.TextureAtlas.updateQuad(): Invalid index",
    TextureAtlas_insertQuad_2: "cc.TextureAtlas.insertQuad(): Invalid index",
    TextureAtlas_insertQuads: "cc.TextureAtlas.insertQuad(): Invalid index + amount",
    TextureAtlas_insertQuadFromIndex: "cc.TextureAtlas.insertQuadFromIndex(): Invalid newIndex",
    TextureAtlas_insertQuadFromIndex_2: "cc.TextureAtlas.insertQuadFromIndex(): Invalid fromIndex",
    TextureAtlas_removeQuadAtIndex: "cc.TextureAtlas.removeQuadAtIndex(): Invalid index",
    TextureAtlas_removeQuadsAtIndex: "cc.TextureAtlas.removeQuadsAtIndex(): index + amount out of bounds",
    TextureAtlas_moveQuadsFromIndex: "cc.TextureAtlas.moveQuadsFromIndex(): move is out of bounds",
    TextureAtlas_moveQuadsFromIndex_2: "cc.TextureAtlas.moveQuadsFromIndex(): Invalid newIndex",
    TextureAtlas_moveQuadsFromIndex_3: "cc.TextureAtlas.moveQuadsFromIndex(): Invalid oldIndex",
    textureCache_addPVRTCImage: "TextureCache:addPVRTCImage does not support on HTML5",
    textureCache_addETCImage: "TextureCache:addPVRTCImage does not support on HTML5",
    textureCache_textureForKey: "textureForKey is deprecated. Please use getTextureForKey instead.",
    textureCache_addPVRImage: "addPVRImage does not support on HTML5",
    textureCache_addUIImage: "cocos2d: Couldn't add UIImage in TextureCache",
    textureCache_dumpCachedTextureInfo: "cocos2d: '%s' id\x3d%s %s x %s",
    textureCache_dumpCachedTextureInfo_2: "cocos2d: '%s' id\x3d HTMLCanvasElement %s x %s",
    textureCache_dumpCachedTextureInfo_3: "cocos2d: TextureCache dumpDebugInfo: %s textures, HTMLCanvasElement for %s KB (%s MB)",
    textureCache_addUIImage_2: "cc.Texture.addUIImage(): image should be non-null",
    Texture2D_initWithETCFile: "initWithETCFile does not support on HTML5",
    Texture2D_initWithPVRFile: "initWithPVRFile does not support on HTML5",
    Texture2D_initWithPVRTCData: "initWithPVRTCData does not support on HTML5",
    Texture2D_addImage: "cc.Texture.addImage(): path should be non-null",
    Texture2D_initWithImage: "cocos2d: cc.Texture2D. Can't create Texture. UIImage is nil",
    Texture2D_initWithImage_2: "cocos2d: WARNING: Image (%s x %s) is bigger than the supported %s x %s",
    Texture2D_initWithString: "initWithString isn't supported on cocos2d-html5",
    Texture2D_initWithETCFile_2: "initWithETCFile does not support on HTML5",
    Texture2D_initWithPVRFile_2: "initWithPVRFile does not support on HTML5",
    Texture2D_initWithPVRTCData_2: "initWithPVRTCData does not support on HTML5",
    Texture2D_bitsPerPixelForFormat: "bitsPerPixelForFormat: %s, cannot give useful result, it's a illegal pixel format",
    Texture2D__initPremultipliedATextureWithImage: "cocos2d: cc.Texture2D: Using RGB565 texture since image has no alpha",
    Texture2D_addImage_2: "cc.Texture.addImage(): path should be non-null",
    Texture2D_initWithData: "NSInternalInconsistencyException",
    MissingFile: "Missing file: %s",
    radiansToDegress: "cc.radiansToDegress() should be called cc.radiansToDegrees()",
    RectWidth: "Rect width exceeds maximum margin: %s",
    RectHeight: "Rect height exceeds maximum margin: %s",
    EventManager__updateListeners: "If program goes here, there should be event in dispatch.",
    EventManager__updateListeners_2: "_inDispatch should be 1 here."
};
cc._logToWebPage = function(a) {
    if (cc._canvas) {
        var b = cc._logList,
            c = document;
        if (!b) {
            var d = c.createElement("Div"),
                b = d.style;
            d.setAttribute("id", "logInfoDiv");
            cc._canvas.parentNode.appendChild(d);
            d.setAttribute("width", "200");
            d.setAttribute("height", cc._canvas.height);
            b.zIndex = "99999";
            b.position = "absolute";
            b.top = "0";
            b.left = "0";
            b = cc._logList = c.createElement("textarea");
            c = b.style;
            b.setAttribute("rows", "20");
            b.setAttribute("cols", "30");
            b.setAttribute("disabled", !0);
            d.appendChild(b);
            c.backgroundColor = "transparent";
            c.borderBottom = "1px solid #cccccc";
            c.borderRightWidth = "0px";
            c.borderLeftWidth = "0px";
            c.borderTopWidth = "0px";
            c.borderTopStyle = "none";
            c.borderRightStyle = "none";
            c.borderLeftStyle = "none";
            c.padding = "0px";
            c.margin = 0
        }
        b.value = b.value + a + "\r\n";
        b.scrollTop = b.scrollHeight
    }
};
cc._formatString = function(a) {
    if (cc.isObject(a)) try {
        return JSON.stringify(a)
    } catch (b) {
        return ""
    } else return a
};
cc._initDebugSetting = function(a) {
    var b = cc.game;
    if (a !== b.DEBUG_MODE_NONE) {
        var c;
        a > b.DEBUG_MODE_ERROR ? (c = cc._logToWebPage.bind(cc), cc.error = function() {
            c("ERROR :  " + cc.formatStr.apply(cc, arguments))
        }, cc.assert = function(a, b) {
            if (!a && b) {
                for (var f = 2; f < arguments.length; f++) b = b.replace(/(%s)|(%d)/, cc._formatString(arguments[f]));
                c("Assert: " + b)
            }
        }, a !== b.DEBUG_MODE_ERROR_FOR_WEB_PAGE && (cc.warn = function() {
            c("WARN :  " + cc.formatStr.apply(cc, arguments))
        }), a === b.DEBUG_MODE_INFO_FOR_WEB_PAGE && (cc.log = function() {
            c(cc.formatStr.apply(cc,
                arguments))
        })) : console && console.log.apply && (cc.error = Function.prototype.bind.call(console.error, console), cc.assert = console.assert ? Function.prototype.bind.call(console.assert, console) : function(a, b) {
            if (!a && b) {
                for (var c = 2; c < arguments.length; c++) b = b.replace(/(%s)|(%d)/, cc._formatString(arguments[c]));
                throw Error(b);
            }
        }, a !== b.DEBUG_MODE_ERROR && (cc.warn = Function.prototype.bind.call(console.warn, console)), a === b.DEBUG_MODE_INFO && (cc.log = Function.prototype.bind.call(console.log, console)))
    }
};
cc.loader.loadBinary = function(a, b) {
    var c = this,
        d = this.getXMLHttpRequest(),
        e = "load " + a + " failed!";
    d.open("GET", a, !0);
    cc.loader.loadBinary._IEFilter ? (d.setRequestHeader("Accept-Charset", "x-user-defined"), d.onreadystatechange = function() {
        if (4 === d.readyState && 200 === d.status) {
            var a = cc._convertResponseBodyToText(d.responseBody);
            b(null, c._str2Uint8Array(a))
        } else b(e)
    }) : (d.overrideMimeType && d.overrideMimeType("text/plain; charset\x3dx-user-defined"), d.onload = function() {
        4 === d.readyState && 200 === d.status ? b(null,
            c._str2Uint8Array(d.responseText)) : b(e)
    });
    d.send(null)
};
cc.loader.loadBinary._IEFilter = /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) && window.IEBinaryToArray_ByteStr && window.IEBinaryToArray_ByteStr_Last;
cc.loader._str2Uint8Array = function(a) {
    if (!a) return null;
    for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) b[c] = a.charCodeAt(c) & 255;
    return b
};
cc.loader.loadBinarySync = function(a) {
    var b = this.getXMLHttpRequest();
    b.timeout = 0;
    var c = "load " + a + " failed!";
    b.open("GET", a, !1);
    a = null;
    if (cc.loader.loadBinary._IEFilter) {
        b.setRequestHeader("Accept-Charset", "x-user-defined");
        b.send(null);
        if (200 !== b.status) return cc.log(c), null;
        (b = cc._convertResponseBodyToText(b.responseBody)) && (a = this._str2Uint8Array(b))
    } else {
        b.overrideMimeType && b.overrideMimeType("text/plain; charset\x3dx-user-defined");
        b.send(null);
        if (200 !== b.status) return cc.log(c), null;
        a = this._str2Uint8Array(b.responseText)
    }
    return a
};
window.Uint8Array = window.Uint8Array || window.Array;
if (cc.loader.loadBinary._IEFilter) {
    var IEBinaryToArray_ByteStr_Script = '\x3c!-- IEBinaryToArray_ByteStr --\x3e\r\nFunction IEBinaryToArray_ByteStr(Binary)\r\n   IEBinaryToArray_ByteStr \x3d CStr(Binary)\r\nEnd Function\r\nFunction IEBinaryToArray_ByteStr_Last(Binary)\r\n   Dim lastIndex\r\n   lastIndex \x3d LenB(Binary)\r\n   if lastIndex mod 2 Then\r\n       IEBinaryToArray_ByteStr_Last \x3d Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n   Else\r\n       IEBinaryToArray_ByteStr_Last \x3d ""\r\n   End If\r\nEnd Function\r\n',
        myVBScript =
        document.createElement("script");
    myVBScript.type = "text/vbscript";
    myVBScript.textContent = IEBinaryToArray_ByteStr_Script;
    document.body.appendChild(myVBScript);
    cc._convertResponseBodyToText = function(a) {
        for (var b = {}, c = 0; 256 > c; c++)
            for (var d = 0; 256 > d; d++) b[String.fromCharCode(c + 256 * d)] = String.fromCharCode(c) + String.fromCharCode(d);
        c = IEBinaryToArray_ByteStr(a);
        a = IEBinaryToArray_ByteStr_Last(a);
        return c.replace(/[\s\S]/g, function(a) {
            return b[a]
        }) + a
    }
};
cc = cc || {};
cc._loadingImage = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";
cc._fpsImage = "data:image/png;base64,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\x3d";
cc._loaderImage = "data:image/png;base64,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";
cc = cc || {};
cc.defineGetterSetter = function(a, b, c, d, e, f) {
    if (a.__defineGetter__) c && a.__defineGetter__(b, c), d && a.__defineSetter__(b, d);
    else if (Object.defineProperty) {
        var g = {
            enumerable: !1,
            configurable: !0
        };
        c && (g.get = c);
        d && (g.set = d);
        Object.defineProperty(a, b, g)
    } else throw Error("browser does not support getters");
    if (!e && !f)
        for (var g = null != c, h = void 0 != d, k = Object.getOwnPropertyNames(a), m = 0; m < k.length; m++) {
            var n = k[m];
            if ((a.__lookupGetter__ ? !a.__lookupGetter__(n) : !Object.getOwnPropertyDescriptor(a, n)) && "function" === typeof a[n]) {
                var p =
                    a[n];
                if (g && p === c && (e = n, !h || f)) break;
                if (h && p === d && (f = n, !g || e)) break
            }
        }
    a = a.constructor;
    e && (a.__getters__ || (a.__getters__ = {}), a.__getters__[e] = b);
    f && (a.__setters__ || (a.__setters__ = {}), a.__setters__[f] = b)
};
cc.clone = function(a) {
    var b = a.constructor ? new a.constructor : {},
        c;
    for (c in a) {
        var d = a[c];
        b[c] = "object" !== typeof d || !d || d instanceof cc.Node || d instanceof HTMLElement ? d : cc.clone(d)
    }
    return b
};
cc.inject = function(a, b) {
    for (var c in a) b[c] = a[c]
};
var ClassManager = {
    id: 0 | 998 * Math.random(),
    instanceId: 0 | 998 * Math.random(),
    getNewID: function() {
        return this.id++
    },
    getNewInstanceId: function() {
        return this.instanceId++
    }
};
(function() {
    var a = /\b_super\b/;
    cc.Class = function() {};
    cc.Class.extend = function(b) {
        var c = this.prototype,
            d = Object.create(c),
            e = {
                writable: !0,
                enumerable: !1,
                configurable: !0
            },
            f;
        cc.game.config && cc.game.config[cc.game.CONFIG_KEY.exposeClassName] ? (f = "(function " + (b._className || "Class") + " (arg0, arg1, arg2, arg3, arg4, arg5) {\n", f += "    this.__instanceId \x3d ClassManager.getNewInstanceId();\n    if (this.ctor) {\n", f += "        switch (arguments.length) {\n", f += "        case 0: this.ctor(); break;\n", f += "        case 1: this.ctor(arg0); break;\n",
            f += "        case 3: this.ctor(arg0, arg1, arg2); break;\n", f += "        case 4: this.ctor(arg0, arg1, arg2, arg3); break;\n", f += "        case 5: this.ctor(arg0, arg1, arg2, arg3, arg4); break;\n", f += "        default: this.ctor.apply(this, arguments);\n", f += "        }\n", f += "    }\n", f += "})", f = eval(f)) : f = function(a, b, c, d, e) {
            this.__instanceId = ClassManager.getNewInstanceId();
            if (this.ctor) switch (arguments.length) {
                case 0:
                    this.ctor();
                    break;
                case 1:
                    this.ctor(a);
                    break;
                case 2:
                    this.ctor(a, b);
                    break;
                case 3:
                    this.ctor(a,
                        b, c);
                    break;
                case 4:
                    this.ctor(a, b, c, d);
                    break;
                case 5:
                    this.ctor(a, b, c, d, e);
                    break;
                default:
                    this.ctor.apply(this, arguments)
            }
        };
        e.value = ClassManager.getNewID();
        Object.defineProperty(d, "__pid", e);
        f.prototype = d;
        e.value = f;
        Object.defineProperty(d, "constructor", e);
        this.__getters__ && (f.__getters__ = cc.clone(this.__getters__));
        this.__setters__ && (f.__setters__ = cc.clone(this.__setters__));
        for (var g = 0, h = arguments.length; g < h; ++g) {
            var k = arguments[g],
                m;
            for (m in k) {
                var n = "function" === typeof k[m],
                    p = "function" === typeof c[m],
                    r = a.test(k[m]);
                n && p && r ? (e.value = function(a, b) {
                    return function() {
                        var d = this._super;
                        this._super = c[a];
                        var e = b.apply(this, arguments);
                        this._super = d;
                        return e
                    }
                }(m, k[m]), Object.defineProperty(d, m, e)) : n ? (e.value = k[m], Object.defineProperty(d, m, e)) : d[m] = k[m];
                if (n) {
                    var s, u;
                    if (this.__getters__ && this.__getters__[m]) {
                        var n = this.__getters__[m],
                            t;
                        for (t in this.__setters__)
                            if (this.__setters__[t] === n) {
                                u = t;
                                break
                            }
                        cc.defineGetterSetter(d, n, k[m], k[u] ? k[u] : d[u], m, u)
                    }
                    if (this.__setters__ && this.__setters__[m]) {
                        n = this.__setters__[m];
                        for (t in this.__getters__)
                            if (this.__getters__[t] === n) {
                                s = t;
                                break
                            }
                        cc.defineGetterSetter(d, n, k[s] ? k[s] : d[s], k[m], s, m)
                    }
                }
            }
        }
        f.extend = cc.Class.extend;
        f.implement = function(a) {
            for (var b in a) d[b] = a[b]
        };
        return f
    }
})();
cc = cc || {};
cc._tmp = cc._tmp || {};
cc.associateWithNative = function(a, b) {};
cc.KEY = {
    none: 0,
    back: 6,
    menu: 18,
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    capslock: 20,
    escape: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    select: 41,
    insert: 45,
    Delete: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    num0: 96,
    num1: 97,
    num2: 98,
    num3: 99,
    num4: 100,
    num5: 101,
    num6: 102,
    num7: 103,
    num8: 104,
    num9: 105,
    "*": 106,
    "+": 107,
    "-": 109,
    numdel: 110,
    "/": 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numlock: 144,
    scrolllock: 145,
    ";": 186,
    semicolon: 186,
    equal: 187,
    "\x3d": 187,
    ",": 188,
    comma: 188,
    dash: 189,
    ".": 190,
    period: 190,
    forwardslash: 191,
    grave: 192,
    "[": 219,
    openbracket: 219,
    backslash: 220,
    "]": 221,
    closebracket: 221,
    quote: 222,
    dpadLeft: 1E3,
    dpadRight: 1001,
    dpadUp: 1003,
    dpadDown: 1004,
    dpadCenter: 1005
};
cc.FMT_JPG = 0;
cc.FMT_PNG = 1;
cc.FMT_TIFF = 2;
cc.FMT_RAWDATA = 3;
cc.FMT_WEBP = 4;
cc.FMT_UNKNOWN = 5;
cc.getImageFormatByData = function(a) {
    return 8 < a.length && 137 === a[0] && 80 === a[1] && 78 === a[2] && 71 === a[3] && 13 === a[4] && 10 === a[5] && 26 === a[6] && 10 === a[7] ? cc.FMT_PNG : 2 < a.length && (73 === a[0] && 73 === a[1] || 77 === a[0] && 77 === a[1] || 255 === a[0] && 216 === a[1]) ? cc.FMT_TIFF : cc.FMT_UNKNOWN
};
cc.Point = function(a, b) {
    this.x = a || 0;
    this.y = b || 0
};
cc.p = function(a, b) {
    return void 0 === a ? {
        x: 0,
        y: 0
    } : void 0 === b ? {
        x: a.x,
        y: a.y
    } : {
        x: a,
        y: b
    }
};
cc.pointEqualToPoint = function(a, b) {
    return a && b && a.x === b.x && a.y === b.y
};
cc.Size = function(a, b) {
    this.width = a || 0;
    this.height = b || 0
};
cc.size = function(a, b) {
    return void 0 === a ? {
        width: 0,
        height: 0
    } : void 0 === b ? {
        width: a.width,
        height: a.height
    } : {
        width: a,
        height: b
    }
};
cc.sizeEqualToSize = function(a, b) {
    return a && b && a.width === b.width && a.height === b.height
};
cc.Rect = function(a, b, c, d) {
    this.x = a || 0;
    this.y = b || 0;
    this.width = c || 0;
    this.height = d || 0
};
cc.rect = function(a, b, c, d) {
    return void 0 === a ? {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    } : void 0 === b ? {
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height
    } : {
        x: a,
        y: b,
        width: c,
        height: d
    }
};
cc.rectEqualToRect = function(a, b) {
    return a && b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
};
cc._rectEqualToZero = function(a) {
    return a && 0 === a.x && 0 === a.y && 0 === a.width && 0 === a.height
};
cc.rectContainsRect = function(a, b) {
    return a && b ? !(a.x >= b.x || a.y >= b.y || a.x + a.width <= b.x + b.width || a.y + a.height <= b.y + b.height) : !1
};
cc.rectGetMaxX = function(a) {
    return a.x + a.width
};
cc.rectGetMidX = function(a) {
    return a.x + a.width / 2
};
cc.rectGetMinX = function(a) {
    return a.x
};
cc.rectGetMaxY = function(a) {
    return a.y + a.height
};
cc.rectGetMidY = function(a) {
    return a.y + a.height / 2
};
cc.rectGetMinY = function(a) {
    return a.y
};
cc.rectContainsPoint = function(a, b) {
    return b.x >= cc.rectGetMinX(a) && b.x <= cc.rectGetMaxX(a) && b.y >= cc.rectGetMinY(a) && b.y <= cc.rectGetMaxY(a)
};
cc.rectIntersectsRect = function(a, b) {
    var c = a.y + a.height,
        d = b.x + b.width,
        e = b.y + b.height;
    return !(a.x + a.width < b.x || d < a.x || c < b.y || e < a.y)
};
cc.rectOverlapsRect = function(a, b) {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y)
};
cc.rectUnion = function(a, b) {
    var c = cc.rect(0, 0, 0, 0);
    c.x = Math.min(a.x, b.x);
    c.y = Math.min(a.y, b.y);
    c.width = Math.max(a.x + a.width, b.x + b.width) - c.x;
    c.height = Math.max(a.y + a.height, b.y + b.height) - c.y;
    return c
};
cc.rectIntersection = function(a, b) {
    var c = cc.rect(Math.max(cc.rectGetMinX(a), cc.rectGetMinX(b)), Math.max(cc.rectGetMinY(a), cc.rectGetMinY(b)), 0, 0);
    c.width = Math.min(cc.rectGetMaxX(a), cc.rectGetMaxX(b)) - cc.rectGetMinX(c);
    c.height = Math.min(cc.rectGetMaxY(a), cc.rectGetMaxY(b)) - cc.rectGetMinY(c);
    return c
};
cc.SAXParser = cc.Class.extend({
    _parser: null,
    _isSupportDOMParser: null,
    ctor: function() {
        window.DOMParser ? (this._isSupportDOMParser = !0, this._parser = new DOMParser) : this._isSupportDOMParser = !1
    },
    parse: function(a) {
        return this._parseXML(a)
    },
    _parseXML: function(a) {
        var b;
        this._isSupportDOMParser ? b = this._parser.parseFromString(a, "text/xml") : (b = new ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a));
        return b
    }
});
cc.PlistParser = cc.SAXParser.extend({
    parse: function(a) {
        a = this._parseXML(a).documentElement;
        if ("plist" !== a.tagName) return cc.warn("Not a plist file!"), {};
        for (var b = null, c = 0, d = a.childNodes.length; c < d && (b = a.childNodes[c], 1 !== b.nodeType); c++);
        return this._parseNode(b)
    },
    _parseNode: function(a) {
        var b = null,
            c = a.tagName;
        if ("dict" === c) b = this._parseDict(a);
        else if ("array" === c) b = this._parseArray(a);
        else if ("string" === c)
            if (1 === a.childNodes.length) b = a.firstChild.nodeValue;
            else
                for (b = "", c = 0; c < a.childNodes.length; c++) b +=
                    a.childNodes[c].nodeValue;
        else "false" === c ? b = !1 : "true" === c ? b = !0 : "real" === c ? b = parseFloat(a.firstChild.nodeValue) : "integer" === c && (b = parseInt(a.firstChild.nodeValue, 10));
        return b
    },
    _parseArray: function(a) {
        for (var b = [], c = 0, d = a.childNodes.length; c < d; c++) {
            var e = a.childNodes[c];
            1 === e.nodeType && b.push(this._parseNode(e))
        }
        return b
    },
    _parseDict: function(a) {
        for (var b = {}, c = null, d = 0, e = a.childNodes.length; d < e; d++) {
            var f = a.childNodes[d];
            1 === f.nodeType && ("key" === f.tagName ? c = f.firstChild.nodeValue : b[c] = this._parseNode(f))
        }
        return b
    }
});
cc.saxParser = new cc.SAXParser;
cc.plistParser = new cc.PlistParser;
cc._txtLoader = {
    load: function(a, b, c, d) {
        cc.loader.loadTxt(a, d)
    }
};
cc.loader.register(["txt", "xml", "vsh", "fsh", "atlas"], cc._txtLoader);
cc._jsonLoader = {
    load: function(a, b, c, d) {
        cc.loader.loadJson(a, d)
    }
};
cc.loader.register(["json", "ExportJson"], cc._jsonLoader);
cc._jsLoader = {
    load: function(a, b, c, d) {
        cc.loader.loadJs(a, d)
    }
};
cc.loader.register(["js"], cc._jsLoader);
cc._imgLoader = {
    load: function(a, b, c, d) {
        c = cc.loader.isLoading(a) ? d : function(a, c) {
            if (a) return d(a);
            cc.loader.cache[b] = c;
            cc.textureCache.handleLoadedTexture(b);
            d(null, c)
        };
        cc.loader.loadImg(a, c)
    }
};
cc.loader.register("png jpg bmp jpeg gif ico tiff webp".split(" "), cc._imgLoader);
cc._serverImgLoader = {
    load: function(a, b, c, d) {
        cc._imgLoader.load(c.src, b, c, d)
    }
};
cc.loader.register(["serverImg"], cc._serverImgLoader);
cc._plistLoader = {
    load: function(a, b, c, d) {
        cc.loader.loadTxt(a, function(a, b) {
            if (a) return d(a);
            d(null, cc.plistParser.parse(b))
        })
    }
};
cc.loader.register(["plist"], cc._plistLoader);
cc._fontLoader = {
    TYPE: {
        ".eot": "embedded-opentype",
        ".ttf": "truetype",
        ".ttc": "truetype",
        ".woff": "woff",
        ".svg": "svg"
    },
    _loadFont: function(a, b, c) {
        var d = document,
            e = cc.path,
            f = this.TYPE,
            g = document.createElement("style");
        g.type = "text/css";
        d.body.appendChild(g);
        var h = "",
            h = isNaN(a - 0) ? h + ("@font-face { font-family:" + a + "; src:") : h + ("@font-face { font-family:'" + a + "'; src:");
        if (b instanceof Array)
            for (var k = 0, m = b.length; k < m; k++) c = e.extname(b[k]).toLowerCase(), h += "url('" + b[k] + "') format('" + f[c] + "')", h += k === m - 1 ? ";" :
                ",";
        else c = c.toLowerCase(), h += "url('" + b + "') format('" + f[c] + "');";
        g.textContent += h + "}";
        b = document.createElement("div");
        c = b.style;
        c.fontFamily = a;
        b.innerHTML = ".";
        c.position = "absolute";
        c.left = "-100px";
        c.top = "-100px";
        d.body.appendChild(b)
    },
    load: function(a, b, c, d) {
        b = c.type;
        a = c.name;
        b = c.srcs;
        cc.isString(c) ? (b = cc.path.extname(c), a = cc.path.basename(c, b), this._loadFont(a, c, b)) : this._loadFont(a, b);
        document.fonts ? document.fonts.load("1em " + a).then(function() {
            d(null, !0)
        }, function(a) {
            d(a)
        }) : d(null, !0)
    }
};
cc.loader.register("font eot ttf woff svg ttc".split(" "), cc._fontLoader);
cc._binaryLoader = {
    load: function(a, b, c, d) {
        cc.loader.loadBinary(a, d)
    }
};
cc._csbLoader = {
    load: function(a, b, c, d) {
        cc.loader.loadCsb(a, d)
    }
};
cc.loader.register(["csb"], cc._csbLoader);
window.CocosEngine = cc.ENGINE_VERSION = "Cocos2d-JS v3.14";
cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0;
cc.DIRECTOR_STATS_POSITION = cc.p(0, 0);
cc.DIRECTOR_FPS_INTERVAL = 0.5;
cc.COCOSNODE_RENDER_SUBPIXEL = 1;
cc.SPRITEBATCHNODE_RENDER_SUBPIXEL = 1;
cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA = 1;
cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP = 0;
cc.TEXTURE_ATLAS_USE_VAO = 0;
cc.TEXTURE_NPOT_SUPPORT = 0;
cc.RETINA_DISPLAY_SUPPORT = 1;
cc.RETINA_DISPLAY_FILENAME_SUFFIX = "-hd";
cc.USE_LA88_LABELS = 1;
cc.SPRITE_DEBUG_DRAW = 0;
cc.SPRITEBATCHNODE_DEBUG_DRAW = 0;
cc.LABELBMFONT_DEBUG_DRAW = 0;
cc.LABELATLAS_DEBUG_DRAW = 0;
cc.DRAWNODE_TOTAL_VERTICES = 2E4;
cc.IS_RETINA_DISPLAY_SUPPORTED = 0;
cc.DEFAULT_ENGINE = cc.ENGINE_VERSION + "-canvas";
cc.ENABLE_STACKABLE_ACTIONS = 1;
cc.ENABLE_GL_STATE_CACHE = 1;
cc.$ = function(a) {
    var b = this === cc ? document : this;
    if (a = a instanceof HTMLElement ? a : b.querySelector(a)) a.find = a.find || cc.$, a.hasClass = a.hasClass || function(a) {
            return this.className.match(RegExp("(\\s|^)" + a + "(\\s|$)"))
        }, a.addClass = a.addClass || function(a) {
            this.hasClass(a) || (this.className && (this.className += " "), this.className += a);
            return this
        }, a.removeClass = a.removeClass || function(a) {
            this.hasClass(a) && (this.className = this.className.replace(a, ""));
            return this
        }, a.remove = a.remove || function() {
            this.parentNode &&
                this.parentNode.removeChild(this);
            return this
        }, a.appendTo = a.appendTo || function(a) {
            a.appendChild(this);
            return this
        }, a.prependTo = a.prependTo || function(a) {
            a.childNodes[0] ? a.insertBefore(this, a.childNodes[0]) : a.appendChild(this);
            return this
        }, a.transforms = a.transforms || function() {
            this.style[cc.$.trans] = cc.$.translate(this.position) + cc.$.rotate(this.rotation) + cc.$.scale(this.scale) + cc.$.skew(this.skew);
            return this
        }, a.position = a.position || {
            x: 0,
            y: 0
        }, a.rotation = a.rotation || 0, a.scale = a.scale || {
            x: 1,
            y: 1
        }, a.skew =
        a.skew || {
            x: 0,
            y: 0
        }, a.translates = function(a, b) {
            this.position.x = a;
            this.position.y = b;
            this.transforms();
            return this
        }, a.rotate = function(a) {
            this.rotation = a;
            this.transforms();
            return this
        }, a.resize = function(a, b) {
            this.scale.x = a;
            this.scale.y = b;
            this.transforms();
            return this
        }, a.setSkew = function(a, b) {
            this.skew.x = a;
            this.skew.y = b;
            this.transforms();
            return this
        };
    return a
};
switch (cc.sys.browserType) {
    case cc.sys.BROWSER_TYPE_FIREFOX:
        cc.$.pfx = "Moz";
        cc.$.hd = !0;
        break;
    case cc.sys.BROWSER_TYPE_CHROME:
    case cc.sys.BROWSER_TYPE_SAFARI:
        cc.$.pfx = "webkit";
        cc.$.hd = !0;
        break;
    case cc.sys.BROWSER_TYPE_OPERA:
        cc.$.pfx = "O";
        cc.$.hd = !1;
        break;
    case cc.sys.BROWSER_TYPE_IE:
        cc.$.pfx = "ms";
        cc.$.hd = !1;
        break;
    default:
        cc.$.pfx = "webkit", cc.$.hd = !0
}
cc.$.trans = cc.$.pfx + "Transform";
cc.$.translate = cc.$.hd ? function(a) {
    return "translate3d(" + a.x + "px, " + a.y + "px, 0) "
} : function(a) {
    return "translate(" + a.x + "px, " + a.y + "px) "
};
cc.$.rotate = cc.$.hd ? function(a) {
    return "rotateZ(" + a + "deg) "
} : function(a) {
    return "rotate(" + a + "deg) "
};
cc.$.scale = function(a) {
    return "scale(" + a.x + ", " + a.y + ") "
};
cc.$.skew = function(a) {
    return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)"
};
cc.$new = function(a) {
    return cc.$(document.createElement(a))
};
cc.$.findpos = function(a) {
    var b = 0,
        c = 0;
    do b += a.offsetLeft, c += a.offsetTop; while (a = a.offsetParent);
    return {
        x: b,
        y: c
    }
};
cc.INVALID_INDEX = -1;
cc.PI = Math.PI;
cc.FLT_MAX = parseFloat("3.402823466e+38F");
cc.FLT_MIN = parseFloat("1.175494351e-38F");
cc.RAD = cc.PI / 180;
cc.DEG = 180 / cc.PI;
cc.UINT_MAX = 4294967295;
cc.swap = function(a, b, c) {
    if (!cc.isObject(c) || cc.isUndefined(c.x) || cc.isUndefined(c.y)) cc.log(cc._LogInfos.swap);
    else {
        var d = c[a];
        c[a] = c[b];
        c[b] = d
    }
};
cc.lerp = function(a, b, c) {
    return a + (b - a) * c
};
cc.rand = function() {
    return 16777215 * Math.random()
};
cc.randomMinus1To1 = function() {
    return 2 * (Math.random() - 0.5)
};
cc.random0To1 = Math.random;
cc.degreesToRadians = function(a) {
    return a * cc.RAD
};
cc.radiansToDegrees = function(a) {
    return a * cc.DEG
};
cc.radiansToDegress = function(a) {
    cc.log(cc._LogInfos.radiansToDegress);
    return a * cc.DEG
};
cc.REPEAT_FOREVER = Number.MAX_VALUE - 1;
cc.nodeDrawSetup = function(a) {
    a._shaderProgram && (a._shaderProgram.use(), a._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4())
};
cc.enableDefaultGLStates = function() {};
cc.disableDefaultGLStates = function() {};
cc.incrementGLDraws = function(a) {
    cc.g_NumberOfDraws += a
};
cc.FLT_EPSILON = 1.192092896E-7;
cc.contentScaleFactor = cc.IS_RETINA_DISPLAY_SUPPORTED ? function() {
    return cc.director._contentScaleFactor
} : function() {
    return 1
};
cc.pointPointsToPixels = function(a) {
    var b = cc.contentScaleFactor();
    return cc.p(a.x * b, a.y * b)
};
cc.pointPixelsToPoints = function(a) {
    var b = cc.contentScaleFactor();
    return cc.p(a.x / b, a.y / b)
};
cc._pointPixelsToPointsOut = function(a, b) {
    var c = cc.contentScaleFactor();
    b.x = a.x / c;
    b.y = a.y / c
};
cc.sizePointsToPixels = function(a) {
    var b = cc.contentScaleFactor();
    return cc.size(a.width * b, a.height * b)
};
cc.sizePixelsToPoints = function(a) {
    var b = cc.contentScaleFactor();
    return cc.size(a.width / b, a.height / b)
};
cc._sizePixelsToPointsOut = function(a, b) {
    var c = cc.contentScaleFactor();
    b.width = a.width / c;
    b.height = a.height / c
};
cc.rectPixelsToPoints = cc.IS_RETINA_DISPLAY_SUPPORTED ? function(a) {
    var b = cc.contentScaleFactor();
    return cc.rect(a.x / b, a.y / b, a.width / b, a.height / b)
} : function(a) {
    return a
};
cc.rectPointsToPixels = cc.IS_RETINA_DISPLAY_SUPPORTED ? function(a) {
    var b = cc.contentScaleFactor();
    return cc.rect(a.x * b, a.y * b, a.width * b, a.height * b)
} : function(a) {
    return a
};
cc.ONE = 1;
cc.ZERO = 0;
cc.SRC_ALPHA = 770;
cc.SRC_ALPHA_SATURATE = 776;
cc.SRC_COLOR = 768;
cc.DST_ALPHA = 772;
cc.DST_COLOR = 774;
cc.ONE_MINUS_SRC_ALPHA = 771;
cc.ONE_MINUS_SRC_COLOR = 769;
cc.ONE_MINUS_DST_ALPHA = 773;
cc.ONE_MINUS_DST_COLOR = 775;
cc.ONE_MINUS_CONSTANT_ALPHA = 32772;
cc.ONE_MINUS_CONSTANT_COLOR = 32770;
cc.LINEAR = 9729;
cc.REPEAT = 10497;
cc.CLAMP_TO_EDGE = 33071;
cc.MIRRORED_REPEAT = 33648;
cc.BLEND_SRC = cc.SRC_ALPHA;
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    cc._renderType === cc.game.RENDER_TYPE_WEBGL && cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA && (cc.BLEND_SRC = cc.ONE)
});
cc.BLEND_DST = cc.ONE_MINUS_SRC_ALPHA;
cc.checkGLErrorDebug = function() {
    if (cc.renderMode === cc.game.RENDER_TYPE_WEBGL) {
        var a = cc._renderContext.getError();
        a && cc.log(cc._LogInfos.checkGLErrorDebug, a)
    }
};
cc.ORIENTATION_PORTRAIT = 1;
cc.ORIENTATION_LANDSCAPE = 2;
cc.ORIENTATION_AUTO = 3;
cc.CONCURRENCY_HTTP_REQUEST_COUNT = cc.sys.isMobile ? 20 : 0;
cc.VERTEX_ATTRIB_FLAG_NONE = 0;
cc.VERTEX_ATTRIB_FLAG_POSITION = 1;
cc.VERTEX_ATTRIB_FLAG_COLOR = 2;
cc.VERTEX_ATTRIB_FLAG_TEX_COORDS = 4;
cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX = cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS;
cc.GL_ALL = 0;
cc.VERTEX_ATTRIB_POSITION = 0;
cc.VERTEX_ATTRIB_COLOR = 1;
cc.VERTEX_ATTRIB_TEX_COORDS = 2;
cc.VERTEX_ATTRIB_MAX = 7;
cc.UNIFORM_PMATRIX = 0;
cc.UNIFORM_MVMATRIX = 1;
cc.UNIFORM_MVPMATRIX = 2;
cc.UNIFORM_TIME = 3;
cc.UNIFORM_SINTIME = 4;
cc.UNIFORM_COSTIME = 5;
cc.UNIFORM_RANDOM01 = 6;
cc.UNIFORM_SAMPLER = 7;
cc.UNIFORM_MAX = 8;
cc.SHADER_POSITION_TEXTURECOLOR = "ShaderPositionTextureColor";
cc.SHADER_SPRITE_POSITION_TEXTURECOLOR = "ShaderSpritePositionTextureColor";
cc.SHADER_SPRITE_POSITION_TEXTURECOLOR_GRAY = "ShaderSpritePositionTextureColorGray";
cc.SHADER_POSITION_TEXTURECOLORALPHATEST = "ShaderPositionTextureColorAlphaTest";
cc.SHADER_SPRITE_POSITION_TEXTURECOLORALPHATEST = "ShaderSpritePositionTextureColorAlphaTest";
cc.SHADER_POSITION_COLOR = "ShaderPositionColor";
cc.SHADER_SPRITE_POSITION_COLOR = "ShaderSpritePositionColor";
cc.SHADER_POSITION_TEXTURE = "ShaderPositionTexture";
cc.SHADER_POSITION_TEXTURE_UCOLOR = "ShaderPositionTextureUColor";
cc.SHADER_POSITION_TEXTUREA8COLOR = "ShaderPositionTextureA8Color";
cc.SHADER_POSITION_UCOLOR = "ShaderPositionUColor";
cc.SHADER_POSITION_LENGTHTEXTURECOLOR = "ShaderPositionLengthTextureColor";
cc.UNIFORM_PMATRIX_S = "CC_PMatrix";
cc.UNIFORM_MVMATRIX_S = "CC_MVMatrix";
cc.UNIFORM_MVPMATRIX_S = "CC_MVPMatrix";
cc.UNIFORM_TIME_S = "CC_Time";
cc.UNIFORM_SINTIME_S = "CC_SinTime";
cc.UNIFORM_COSTIME_S = "CC_CosTime";
cc.UNIFORM_RANDOM01_S = "CC_Random01";
cc.UNIFORM_SAMPLER_S = "CC_Texture0";
cc.UNIFORM_ALPHA_TEST_VALUE_S = "CC_alpha_value";
cc.ATTRIBUTE_NAME_COLOR = "a_color";
cc.ATTRIBUTE_NAME_POSITION = "a_position";
cc.ATTRIBUTE_NAME_TEX_COORD = "a_texCoord";
cc.ATTRIBUTE_NAME_MVMAT = "a_mvMatrix";
cc.ITEM_SIZE = 32;
cc.CURRENT_ITEM = 3233828865;
cc.ZOOM_ACTION_TAG = 3233828866;
cc.NORMAL_TAG = 8801;
cc.SELECTED_TAG = 8802;
cc.DISABLE_TAG = 8803;
cc.arrayVerifyType = function(a, b) {
    if (a && 0 < a.length)
        for (var c = 0; c < a.length; c++)
            if (!(a[c] instanceof b)) return cc.log("element type is wrong!"), !1;
    return !0
};
cc.arrayRemoveObject = function(a, b) {
    for (var c = 0, d = a.length; c < d; c++)
        if (a[c] === b) {
            a.splice(c, 1);
            break
        }
};
cc.arrayRemoveArray = function(a, b) {
    for (var c = 0, d = b.length; c < d; c++) cc.arrayRemoveObject(a, b[c])
};
cc.arrayAppendObjectsToIndex = function(a, b, c) {
    a.splice.apply(a, [c, 0].concat(b));
    return a
};
cc.copyArray = function(a) {
    var b, c = a.length,
        d = Array(c);
    for (b = 0; b < c; b += 1) d[b] = a[b];
    return d
};
cc.Color = function(a, b, c, d) {
    this._val = ((a || 0) << 24 >>> 0) + ((b || 0) << 16) + ((c || 0) << 8) + (d || 0)
};
_p = cc.Color.prototype;
_p._getR = function() {
    return (this._val & 4278190080) >>> 24
};
_p._setR = function(a) {
    this._val = this._val & 16777215 | a << 24 >>> 0
};
_p._getG = function() {
    return (this._val & 16711680) >> 16
};
_p._setG = function(a) {
    this._val = this._val & 4278255615 | a << 16
};
_p._getB = function() {
    return (this._val & 65280) >> 8
};
_p._setB = function(a) {
    this._val = this._val & 4294902015 | a << 8
};
_p._getA = function() {
    return this._val & 255
};
_p._setA = function(a) {
    this._val = this._val & 4294967040 | a
};
cc.defineGetterSetter(_p, "r", _p._getR, _p._setR);
cc.defineGetterSetter(_p, "g", _p._getG, _p._setG);
cc.defineGetterSetter(_p, "b", _p._getB, _p._setB);
cc.defineGetterSetter(_p, "a", _p._getA, _p._setA);
cc.color = function(a, b, c, d) {
    return void 0 === a ? new cc.Color(0, 0, 0, 255) : "object" === typeof a ? new cc.Color(a.r, a.g, a.b, null == a.a ? 255 : a.a) : "string" === typeof a ? cc.hexToColor(a) : new cc.Color(a, b, c, null == d ? 255 : d)
};
cc.colorEqual = function(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b
};
cc.Acceleration = function(a, b, c, d) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0;
    this.timestamp = d || 0
};
cc.Vertex2F = function(a, b, c, d) {
    this._arrayBuffer = c || new ArrayBuffer(cc.Vertex2F.BYTES_PER_ELEMENT);
    this._offset = d || 0;
    this._view = new Float32Array(this._arrayBuffer, this._offset, 2);
    this._view[0] = a || 0;
    this._view[1] = b || 0
};
cc.Vertex2F.BYTES_PER_ELEMENT = 8;
_p = cc.Vertex2F.prototype;
_p._getX = function() {
    return this._view[0]
};
_p._setX = function(a) {
    this._view[0] = a
};
_p._getY = function() {
    return this._view[1]
};
_p._setY = function(a) {
    this._view[1] = a
};
cc.defineGetterSetter(_p, "x", _p._getX, _p._setX);
cc.defineGetterSetter(_p, "y", _p._getY, _p._setY);
cc.Vertex3F = function(a, b, c, d, e) {
    this._arrayBuffer = d || new ArrayBuffer(cc.Vertex3F.BYTES_PER_ELEMENT);
    this._offset = e || 0;
    this._view = new Float32Array(this._arrayBuffer, this._offset, 3);
    this._view[0] = a || 0;
    this._view[1] = b || 0;
    this._view[2] = c || 0
};
cc.Vertex3F.BYTES_PER_ELEMENT = 12;
_p = cc.Vertex3F.prototype;
_p._getX = function() {
    return this._view[0]
};
_p._setX = function(a) {
    this._view[0] = a
};
_p._getY = function() {
    return this._view[1]
};
_p._setY = function(a) {
    this._view[1] = a
};
_p._getZ = function() {
    return this._view[2]
};
_p._setZ = function(a) {
    this._view[2] = a
};
cc.defineGetterSetter(_p, "x", _p._getX, _p._setX);
cc.defineGetterSetter(_p, "y", _p._getY, _p._setY);
cc.defineGetterSetter(_p, "z", _p._getZ, _p._setZ);
cc.Tex2F = function(a, b, c, d) {
    this._arrayBuffer = c || new ArrayBuffer(cc.Tex2F.BYTES_PER_ELEMENT);
    this._offset = d || 0;
    this._view = new Float32Array(this._arrayBuffer, this._offset, 2);
    this._view[0] = a || 0;
    this._view[1] = b || 0
};
cc.Tex2F.BYTES_PER_ELEMENT = 8;
_p = cc.Tex2F.prototype;
_p._getU = function() {
    return this._view[0]
};
_p._setU = function(a) {
    this._view[0] = a
};
_p._getV = function() {
    return this._view[1]
};
_p._setV = function(a) {
    this._view[1] = a
};
cc.defineGetterSetter(_p, "u", _p._getU, _p._setU);
cc.defineGetterSetter(_p, "v", _p._getV, _p._setV);
cc.Quad2 = function(a, b, c, d, e, f) {
    this._arrayBuffer = e || new ArrayBuffer(cc.Quad2.BYTES_PER_ELEMENT);
    this._offset = f || 0;
    e = this._arrayBuffer;
    f = this._offset;
    var g = cc.Vertex2F.BYTES_PER_ELEMENT;
    this._tl = a ? new cc.Vertex2F(a.x, a.y, e, f) : new cc.Vertex2F(0, 0, e, f);
    f += g;
    this._tr = b ? new cc.Vertex2F(b.x, b.y, e, f) : new cc.Vertex2F(0, 0, e, f);
    f += g;
    this._bl = c ? new cc.Vertex2F(c.x, c.y, e, f) : new cc.Vertex2F(0, 0, e, f);
    f += g;
    this._br = d ? new cc.Vertex2F(d.x, d.y, e, f) : new cc.Vertex2F(0, 0, e, f)
};
cc.Quad2.BYTES_PER_ELEMENT = 32;
_p = cc.Quad2.prototype;
_p._getTL = function() {
    return this._tl
};
_p._setTL = function(a) {
    this._tl._view[0] = a.x;
    this._tl._view[1] = a.y
};
_p._getTR = function() {
    return this._tr
};
_p._setTR = function(a) {
    this._tr._view[0] = a.x;
    this._tr._view[1] = a.y
};
_p._getBL = function() {
    return this._bl
};
_p._setBL = function(a) {
    this._bl._view[0] = a.x;
    this._bl._view[1] = a.y
};
_p._getBR = function() {
    return this._br
};
_p._setBR = function(a) {
    this._br._view[0] = a.x;
    this._br._view[1] = a.y
};
cc.defineGetterSetter(_p, "tl", _p._getTL, _p._setTL);
cc.defineGetterSetter(_p, "tr", _p._getTR, _p._setTR);
cc.defineGetterSetter(_p, "bl", _p._getBL, _p._setBL);
cc.defineGetterSetter(_p, "br", _p._getBR, _p._setBR);
cc.Quad3 = function(a, b, c, d, e, f) {
    this._arrayBuffer = e || new ArrayBuffer(cc.Quad3.BYTES_PER_ELEMENT);
    this._offset = f || 0;
    e = this._arrayBuffer;
    f = this._offset;
    var g = cc.Vertex3F.BYTES_PER_ELEMENT;
    this.bl = a ? new cc.Vertex3F(a.x, a.y, a.z, e, f) : new cc.Vertex3F(0, 0, 0, e, f);
    f += g;
    this.br = b ? new cc.Vertex3F(b.x, b.y, b.z, e, f) : new cc.Vertex3F(0, 0, 0, e, f);
    f += g;
    this.tl = c ? new cc.Vertex3F(c.x, c.y, c.z, e, f) : new cc.Vertex3F(0, 0, 0, e, f);
    f += g;
    this.tr = d ? new cc.Vertex3F(d.x, d.y, d.z, e, f) : new cc.Vertex3F(0, 0, 0, e, f)
};
cc.Quad3.BYTES_PER_ELEMENT = 48;
cc.V3F_C4B_T2F = function(a, b, c, d, e) {
    this._arrayBuffer = d || new ArrayBuffer(cc.V3F_C4B_T2F.BYTES_PER_ELEMENT);
    this._offset = e || 0;
    d = this._arrayBuffer;
    e = this._offset;
    this._vertices = a ? new cc.Vertex3F(a.x, a.y, a.z, d, e) : new cc.Vertex3F(0, 0, 0, d, e);
    e += cc.Vertex3F.BYTES_PER_ELEMENT;
    this._colors = b ? new cc._WebGLColor(b.r, b.g, b.b, b.a, d, e) : new cc._WebGLColor(0, 0, 0, 0, d, e);
    e += cc._WebGLColor.BYTES_PER_ELEMENT;
    this._texCoords = c ? new cc.Tex2F(c.u, c.v, d, e) : new cc.Tex2F(0, 0, d, e)
};
cc.V3F_C4B_T2F.BYTES_PER_ELEMENT = 24;
_p = cc.V3F_C4B_T2F.prototype;
_p._getVertices = function() {
    return this._vertices
};
_p._setVertices = function(a) {
    var b = this._vertices;
    b._view[0] = a.x;
    b._view[1] = a.y;
    b._view[2] = a.z
};
_p._getColor = function() {
    return this._colors
};
_p._setColor = function(a) {
    var b = this._colors;
    b._view[0] = a.r;
    b._view[1] = a.g;
    b._view[2] = a.b;
    b._view[3] = a.a
};
_p._getTexCoords = function() {
    return this._texCoords
};
_p._setTexCoords = function(a) {
    this._texCoords._view[0] = a.u;
    this._texCoords._view[1] = a.v
};
cc.defineGetterSetter(_p, "vertices", _p._getVertices, _p._setVertices);
cc.defineGetterSetter(_p, "colors", _p._getColor, _p._setColor);
cc.defineGetterSetter(_p, "texCoords", _p._getTexCoords, _p._setTexCoords);
cc.V3F_C4B_T2F_Quad = function(a, b, c, d, e, f) {
    this._arrayBuffer = e || new ArrayBuffer(cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
    this._offset = f || 0;
    e = this._arrayBuffer;
    f = this._offset;
    var g = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;
    this._tl = a ? new cc.V3F_C4B_T2F(a.vertices, a.colors, a.texCoords, e, f) : new cc.V3F_C4B_T2F(null, null, null, e, f);
    f += g;
    this._bl = b ? new cc.V3F_C4B_T2F(b.vertices, b.colors, b.texCoords, e, f) : new cc.V3F_C4B_T2F(null, null, null, e, f);
    f += g;
    this._tr = c ? new cc.V3F_C4B_T2F(c.vertices, c.colors, c.texCoords, e, f) : new cc.V3F_C4B_T2F(null,
        null, null, e, f);
    f += g;
    this._br = d ? new cc.V3F_C4B_T2F(d.vertices, d.colors, d.texCoords, e, f) : new cc.V3F_C4B_T2F(null, null, null, e, f)
};
cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96;
_p = cc.V3F_C4B_T2F_Quad.prototype;
_p._getTL = function() {
    return this._tl
};
_p._setTL = function(a) {
    var b = this._tl;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
_p._getBL = function() {
    return this._bl
};
_p._setBL = function(a) {
    var b = this._bl;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
_p._getTR = function() {
    return this._tr
};
_p._setTR = function(a) {
    var b = this._tr;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
_p._getBR = function() {
    return this._br
};
_p._setBR = function(a) {
    var b = this._br;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
_p._getArrayBuffer = function() {
    return this._arrayBuffer
};
cc.defineGetterSetter(_p, "tl", _p._getTL, _p._setTL);
cc.defineGetterSetter(_p, "tr", _p._getTR, _p._setTR);
cc.defineGetterSetter(_p, "bl", _p._getBL, _p._setBL);
cc.defineGetterSetter(_p, "br", _p._getBR, _p._setBR);
cc.defineGetterSetter(_p, "arrayBuffer", _p._getArrayBuffer, null);
cc.V3F_C4B_T2F_QuadZero = function() {
    return new cc.V3F_C4B_T2F_Quad
};
cc.V3F_C4B_T2F_QuadCopy = function(a) {
    if (!a) return cc.V3F_C4B_T2F_QuadZero();
    var b = a.tl,
        c = a.bl,
        d = a.tr;
    a = a.br;
    return {
        tl: {
            vertices: {
                x: b.vertices.x,
                y: b.vertices.y,
                z: b.vertices.z
            },
            colors: {
                r: b.colors.r,
                g: b.colors.g,
                b: b.colors.b,
                a: b.colors.a
            },
            texCoords: {
                u: b.texCoords.u,
                v: b.texCoords.v
            }
        },
        bl: {
            vertices: {
                x: c.vertices.x,
                y: c.vertices.y,
                z: c.vertices.z
            },
            colors: {
                r: c.colors.r,
                g: c.colors.g,
                b: c.colors.b,
                a: c.colors.a
            },
            texCoords: {
                u: c.texCoords.u,
                v: c.texCoords.v
            }
        },
        tr: {
            vertices: {
                x: d.vertices.x,
                y: d.vertices.y,
                z: d.vertices.z
            },
            colors: {
                r: d.colors.r,
                g: d.colors.g,
                b: d.colors.b,
                a: d.colors.a
            },
            texCoords: {
                u: d.texCoords.u,
                v: d.texCoords.v
            }
        },
        br: {
            vertices: {
                x: a.vertices.x,
                y: a.vertices.y,
                z: a.vertices.z
            },
            colors: {
                r: a.colors.r,
                g: a.colors.g,
                b: a.colors.b,
                a: a.colors.a
            },
            texCoords: {
                u: a.texCoords.u,
                v: a.texCoords.v
            }
        }
    }
};
cc.V3F_C4B_T2F_QuadsCopy = function(a) {
    if (!a) return [];
    for (var b = [], c = 0; c < a.length; c++) b.push(cc.V3F_C4B_T2F_QuadCopy(a[c]));
    return b
};
cc.V2F_C4B_T2F = function(a, b, c, d, e) {
    this._arrayBuffer = d || new ArrayBuffer(cc.V2F_C4B_T2F.BYTES_PER_ELEMENT);
    this._offset = e || 0;
    d = this._arrayBuffer;
    e = this._offset;
    this._vertices = a ? new cc.Vertex2F(a.x, a.y, d, e) : new cc.Vertex2F(0, 0, d, e);
    e += cc.Vertex2F.BYTES_PER_ELEMENT;
    this._colors = b ? new cc._WebGLColor(b.r, b.g, b.b, b.a, d, e) : new cc._WebGLColor(0, 0, 0, 0, d, e);
    e += cc._WebGLColor.BYTES_PER_ELEMENT;
    this._texCoords = c ? new cc.Tex2F(c.u, c.v, d, e) : new cc.Tex2F(0, 0, d, e)
};
cc.V2F_C4B_T2F.BYTES_PER_ELEMENT = 20;
_p = cc.V2F_C4B_T2F.prototype;
_p._getVertices = function() {
    return this._vertices
};
_p._setVertices = function(a) {
    this._vertices._view[0] = a.x;
    this._vertices._view[1] = a.y
};
_p._getColor = function() {
    return this._colors
};
_p._setColor = function(a) {
    var b = this._colors;
    b._view[0] = a.r;
    b._view[1] = a.g;
    b._view[2] = a.b;
    b._view[3] = a.a
};
_p._getTexCoords = function() {
    return this._texCoords
};
_p._setTexCoords = function(a) {
    this._texCoords._view[0] = a.u;
    this._texCoords._view[1] = a.v
};
cc.defineGetterSetter(_p, "vertices", _p._getVertices, _p._setVertices);
cc.defineGetterSetter(_p, "colors", _p._getColor, _p._setColor);
cc.defineGetterSetter(_p, "texCoords", _p._getTexCoords, _p._setTexCoords);
cc.V2F_C4B_T2F_Triangle = function(a, b, c, d, e) {
    this._arrayBuffer = d || new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
    this._offset = e || 0;
    d = this._arrayBuffer;
    e = this._offset;
    var f = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
    this._a = a ? new cc.V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, d, e) : new cc.V2F_C4B_T2F(null, null, null, d, e);
    e += f;
    this._b = b ? new cc.V2F_C4B_T2F(b.vertices, b.colors, b.texCoords, d, e) : new cc.V2F_C4B_T2F(null, null, null, d, e);
    e += f;
    this._c = c ? new cc.V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, d, e) :
        new cc.V2F_C4B_T2F(null, null, null, d, e)
};
cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60;
_p = cc.V2F_C4B_T2F_Triangle.prototype;
_p._getA = function() {
    return this._a
};
_p._setA = function(a) {
    var b = this._a;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
_p._getB = function() {
    return this._b
};
_p._setB = function(a) {
    var b = this._b;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
_p._getC = function() {
    return this._c
};
_p._setC = function(a) {
    var b = this._c;
    b.vertices = a.vertices;
    b.colors = a.colors;
    b.texCoords = a.texCoords
};
cc.defineGetterSetter(_p, "a", _p._getA, _p._setA);
cc.defineGetterSetter(_p, "b", _p._getB, _p._setB);
cc.defineGetterSetter(_p, "c", _p._getC, _p._setC);
cc.vertex2 = function(a, b) {
    return new cc.Vertex2F(a, b)
};
cc.vertex3 = function(a, b, c) {
    return new cc.Vertex3F(a, b, c)
};
cc.tex2 = function(a, b) {
    return new cc.Tex2F(a, b)
};
cc.BlendFunc = function(a, b) {
    this.src = a;
    this.dst = b
};
cc.blendFuncDisable = function() {
    return new cc.BlendFunc(cc.ONE, cc.ZERO)
};
cc.hexToColor = function(a) {
    a = a.replace(/^#?/, "0x");
    a = parseInt(a);
    return new cc.Color(a >> 16, (a >> 8) % 256, a % 256)
};
cc.colorToHex = function(a) {
    var b = a.r.toString(16),
        c = a.g.toString(16),
        d = a.b.toString(16);
    return "#" + (16 > a.r ? "0" + b : b) + (16 > a.g ? "0" + c : c) + (16 > a.b ? "0" + d : d)
};
cc.TEXT_ALIGNMENT_LEFT = 0;
cc.TEXT_ALIGNMENT_CENTER = 1;
cc.TEXT_ALIGNMENT_RIGHT = 2;
cc.VERTICAL_TEXT_ALIGNMENT_TOP = 0;
cc.VERTICAL_TEXT_ALIGNMENT_CENTER = 1;
cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM = 2;
cc._Dictionary = cc.Class.extend({
    _keyMapTb: null,
    _valueMapTb: null,
    __currId: 0,
    ctor: function() {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | 10 * Math.random())
    },
    __getKey: function() {
        this.__currId++;
        return "key_" + this.__currId
    },
    setObject: function(a, b) {
        if (null != b) {
            var c = this.__getKey();
            this._keyMapTb[c] = b;
            this._valueMapTb[c] = a
        }
    },
    objectForKey: function(a) {
        if (null == a) return null;
        var b = this._keyMapTb,
            c;
        for (c in b)
            if (b[c] === a) return this._valueMapTb[c];
        return null
    },
    valueForKey: function(a) {
        return this.objectForKey(a)
    },
    removeObjectForKey: function(a) {
        if (null != a) {
            var b = this._keyMapTb,
                c;
            for (c in b)
                if (b[c] === a) {
                    delete this._valueMapTb[c];
                    delete b[c];
                    break
                }
        }
    },
    removeObjectsForKeys: function(a) {
        if (null != a)
            for (var b = 0; b < a.length; b++) this.removeObjectForKey(a[b])
    },
    allKeys: function() {
        var a = [],
            b = this._keyMapTb,
            c;
        for (c in b) a.push(b[c]);
        return a
    },
    removeAllObjects: function() {
        this._keyMapTb = {};
        this._valueMapTb = {}
    },
    count: function() {
        return this.allKeys().length
    }
});
cc.FontDefinition = function(a) {
    this.fontName = "Arial";
    this.fontSize = 12;
    this.textAlign = cc.TEXT_ALIGNMENT_CENTER;
    this.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
    this.fillStyle = cc.color(255, 255, 255, 255);
    this.boundingHeight = this.boundingWidth = 0;
    this.strokeEnabled = !1;
    this.strokeStyle = cc.color(255, 255, 255, 255);
    this.lineWidth = 1;
    this.fontWeight = this.fontStyle = this.lineHeight = "normal";
    this.shadowEnabled = !1;
    this.shadowBlur = this.shadowOffsetY = this.shadowOffsetX = 0;
    this.shadowOpacity = 1;
    if (a && a instanceof Object)
        for (var b in a) this[b] =
            a[b]
};
cc.FontDefinition.prototype._getCanvasFontStr = function() {
    return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + "px/" + (this.lineHeight.charAt ? this.lineHeight : this.lineHeight + "px") + " '" + this.fontName + "'"
};
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    cc._renderType === cc.game.RENDER_TYPE_WEBGL && (cc._WebGLColor = function(a, b, c, d, e, f) {
            this._arrayBuffer = e || new ArrayBuffer(cc._WebGLColor.BYTES_PER_ELEMENT);
            this._offset = f || 0;
            this._view = new Uint8Array(this._arrayBuffer, this._offset, 4);
            this._view[0] = a || 0;
            this._view[1] = b || 0;
            this._view[2] = c || 0;
            this._view[3] = null == d ? 255 : d;
            void 0 === d && (this.a_undefined = !0)
        }, cc._WebGLColor.BYTES_PER_ELEMENT = 4, _p = cc._WebGLColor.prototype, _p._getR = function() {
            return this._view[0]
        },
        _p._setR = function(a) {
            this._view[0] = 0 > a ? 0 : a
        }, _p._getG = function() {
            return this._view[1]
        }, _p._setG = function(a) {
            this._view[1] = 0 > a ? 0 : a
        }, _p._getB = function() {
            return this._view[2]
        }, _p._setB = function(a) {
            this._view[2] = 0 > a ? 0 : a
        }, _p._getA = function() {
            return this._view[3]
        }, _p._setA = function(a) {
            this._view[3] = 0 > a ? 0 : a
        }, cc.defineGetterSetter(_p, "r", _p._getR, _p._setR), cc.defineGetterSetter(_p, "g", _p._getG, _p._setG), cc.defineGetterSetter(_p, "b", _p._getB, _p._setB), cc.defineGetterSetter(_p, "a", _p._getA, _p._setA))
});
_p = cc.color;
_p._getWhite = function() {
    return cc.color(255, 255, 255)
};
_p._getYellow = function() {
    return cc.color(255, 255, 0)
};
_p._getBlue = function() {
    return cc.color(0, 0, 255)
};
_p._getGreen = function() {
    return cc.color(0, 255, 0)
};
_p._getRed = function() {
    return cc.color(255, 0, 0)
};
_p._getMagenta = function() {
    return cc.color(255, 0, 255)
};
_p._getBlack = function() {
    return cc.color(0, 0, 0)
};
_p._getOrange = function() {
    return cc.color(255, 127, 0)
};
_p._getGray = function() {
    return cc.color(166, 166, 166)
};
cc.defineGetterSetter(_p, "WHITE", _p._getWhite);
cc.defineGetterSetter(_p, "YELLOW", _p._getYellow);
cc.defineGetterSetter(_p, "BLUE", _p._getBlue);
cc.defineGetterSetter(_p, "GREEN", _p._getGreen);
cc.defineGetterSetter(_p, "RED", _p._getRed);
cc.defineGetterSetter(_p, "MAGENTA", _p._getMagenta);
cc.defineGetterSetter(_p, "BLACK", _p._getBlack);
cc.defineGetterSetter(_p, "ORANGE", _p._getOrange);
cc.defineGetterSetter(_p, "GRAY", _p._getGray);
cc.BlendFunc._disable = function() {
    return new cc.BlendFunc(cc.ONE, cc.ZERO)
};
cc.BlendFunc._alphaPremultiplied = function() {
    return new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA)
};
cc.BlendFunc._alphaNonPremultiplied = function() {
    return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)
};
cc.BlendFunc._additive = function() {
    return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE)
};
cc.defineGetterSetter(cc.BlendFunc, "DISABLE", cc.BlendFunc._disable);
cc.defineGetterSetter(cc.BlendFunc, "ALPHA_PREMULTIPLIED", cc.BlendFunc._alphaPremultiplied);
cc.defineGetterSetter(cc.BlendFunc, "ALPHA_NON_PREMULTIPLIED", cc.BlendFunc._alphaNonPremultiplied);
cc.defineGetterSetter(cc.BlendFunc, "ADDITIVE", cc.BlendFunc._additive);
cc.Touches = [];
cc.TouchesIntergerDict = {};
cc.DENSITYDPI_DEVICE = "device-dpi";
cc.DENSITYDPI_HIGH = "high-dpi";
cc.DENSITYDPI_MEDIUM = "medium-dpi";
cc.DENSITYDPI_LOW = "low-dpi";
var __BrowserGetter = {
    init: function() {
        this.html = document.getElementsByTagName("html")[0]
    },
    availWidth: function(a) {
        return a && a !== this.html ? a.clientWidth : window.innerWidth
    },
    availHeight: function(a) {
        return a && a !== this.html ? a.clientHeight : window.innerHeight
    },
    meta: {
        width: "device-width"
    },
    adaptationType: cc.sys.browserType
}; - 1 < window.navigator.userAgent.indexOf("OS 8_1_") && (__BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_MIUI);
cc.sys.os === cc.sys.OS_IOS && (__BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_SAFARI);
switch (__BrowserGetter.adaptationType) {
    case cc.sys.BROWSER_TYPE_SAFARI:
        __BrowserGetter.meta["minimal-ui"] = "true";
        __BrowserGetter.availWidth = function(a) {
            return a.clientWidth
        };
        __BrowserGetter.availHeight = function(a) {
            return a.clientHeight
        };
        break;
    case cc.sys.BROWSER_TYPE_CHROME:
        __BrowserGetter.__defineGetter__("target-densitydpi", function() {
            return cc.view._targetDensityDPI
        });
    case cc.sys.BROWSER_TYPE_SOUGOU:
    case cc.sys.BROWSER_TYPE_UC:
        __BrowserGetter.availWidth = function(a) {
            return a.clientWidth
        };
        __BrowserGetter.availHeight =
            function(a) {
                return a.clientHeight
            };
        break;
    case cc.sys.BROWSER_TYPE_MIUI:
        __BrowserGetter.init = function(a) {
            if (!a.__resizeWithBrowserSize) {
                var b = function() {
                    a.setDesignResolutionSize(a._designResolutionSize.width, a._designResolutionSize.height, a._resolutionPolicy);
                    window.removeEventListener("resize", b, !1)
                };
                window.addEventListener("resize", b, !1)
            }
        }
}
var _scissorRect = null;
cc.EGLView = cc.Class.extend({
    _delegate: null,
    _frameSize: null,
    _designResolutionSize: null,
    _originalDesignResolutionSize: null,
    _viewPortRect: null,
    _visibleRect: null,
    _retinaEnabled: !1,
    _autoFullScreen: !1,
    _devicePixelRatio: 1,
    _viewName: "",
    _resizeCallback: null,
    _orientationChanging: !0,
    _scaleX: 1,
    _originalScaleX: 1,
    _scaleY: 1,
    _originalScaleY: 1,
    _isRotated: !1,
    _orientation: 3,
    _resolutionPolicy: null,
    _rpExactFit: null,
    _rpShowAll: null,
    _rpNoBorder: null,
    _rpFixedHeight: null,
    _rpFixedWidth: null,
    _initialized: !1,
    _contentTranslateLeftTop: null,
    _frame: null,
    _frameZoomFactor: 1,
    __resizeWithBrowserSize: !1,
    _isAdjustViewPort: !0,
    _targetDensityDPI: null,
    ctor: function() {
        var a = document,
            b = cc.ContainerStrategy,
            c = cc.ContentStrategy;
        __BrowserGetter.init(this);
        this._frame = cc.container.parentNode === a.body ? a.documentElement : cc.container.parentNode;
        this._frameSize = cc.size(0, 0);
        this._initFrameSize();
        var a = cc._canvas.width,
            d = cc._canvas.height;
        this._designResolutionSize = cc.size(a, d);
        this._originalDesignResolutionSize = cc.size(a, d);
        this._viewPortRect = cc.rect(0,
            0, a, d);
        this._visibleRect = cc.rect(0, 0, a, d);
        this._contentTranslateLeftTop = {
            left: 0,
            top: 0
        };
        this._viewName = "Cocos2dHTML5";
        a = cc.sys;
        this.enableRetina(a.os === a.OS_IOS || a.os === a.OS_OSX);
        this.enableAutoFullScreen(a.isMobile && a.browserType !== a.BROWSER_TYPE_BAIDU);
        cc.visibleRect && cc.visibleRect.init(this._visibleRect);
        this._rpExactFit = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.EXACT_FIT);
        this._rpShowAll = new cc.ResolutionPolicy(b.PROPORTION_TO_FRAME, c.SHOW_ALL);
        this._rpNoBorder = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME,
            c.NO_BORDER);
        this._rpFixedHeight = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.FIXED_HEIGHT);
        this._rpFixedWidth = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.FIXED_WIDTH);
        this._targetDensityDPI = cc.DENSITYDPI_HIGH
    },
    _resizeEvent: function() {
        var a;
        a = this.setDesignResolutionSize ? this : cc.view;
        var b = a._frameSize.width,
            c = a._frameSize.height,
            d = a._isRotated;
        a._initFrameSize();
        if (a._isRotated !== d || a._frameSize.width !== b || a._frameSize.height !== c) b = a._originalDesignResolutionSize.width, c = a._originalDesignResolutionSize.height,
            0 < b && a.setDesignResolutionSize(b, c, a._resolutionPolicy), cc.eventManager.dispatchCustomEvent("canvas-resize"), a._resizeCallback && a._resizeCallback.call()
    },
    _orientationChange: function() {
        cc.view._orientationChanging = !0;
        cc.view._resizeEvent()
    },
    setTargetDensityDPI: function(a) {
        this._targetDensityDPI = a;
        this._adjustViewportMeta()
    },
    getTargetDensityDPI: function() {
        return this._targetDensityDPI
    },
    resizeWithBrowserSize: function(a) {
        a ? this.__resizeWithBrowserSize || (this.__resizeWithBrowserSize = !0, window.addEventListener("resize",
            this._resizeEvent), window.addEventListener("orientationchange", this._orientationChange)) : this.__resizeWithBrowserSize && (this.__resizeWithBrowserSize = !1, window.removeEventListener("resize", this._resizeEvent), window.removeEventListener("orientationchange", this._orientationChange))
    },
    setResizeCallback: function(a) {
        if ("function" === typeof a || null == a) this._resizeCallback = a
    },
    setOrientation: function(a) {
        (a &= cc.ORIENTATION_AUTO) && this._orientation !== a && (this._orientation = a, this.setDesignResolutionSize(this._originalDesignResolutionSize.width,
            this._originalDesignResolutionSize.height, this._resolutionPolicy))
    },
    setDocumentPixelWidth: function(a) {
        this._setViewportMeta({
            width: a
        }, !0);
        document.documentElement.style.width = a + "px";
        document.body.style.width = "100%";
        this.setDesignResolutionSize(this._designResolutionSize.width, this._designResolutionSize.height, this._resolutionPolicy)
    },
    _initFrameSize: function() {
        var a = this._frameSize,
            b = __BrowserGetter.availWidth(this._frame),
            c = __BrowserGetter.availHeight(this._frame),
            d = b >= c;
        !this._orientationChanging ||
            !cc.sys.isMobile || d && this._orientation & cc.ORIENTATION_LANDSCAPE || !d && this._orientation & cc.ORIENTATION_PORTRAIT ? (a.width = b, a.height = c, cc.container.style["-webkit-transform"] = "rotate(0deg)", cc.container.style.transform = "rotate(0deg)", this._isRotated = !1) : (a.width = c, a.height = b, cc.container.style["-webkit-transform"] = "rotate(90deg)", cc.container.style.transform = "rotate(90deg)", cc.container.style["-webkit-transform-origin"] = "0px 0px 0px", cc.container.style.transformOrigin = "0px 0px 0px", this._isRotated = !0);
        setTimeout(function() {
            cc.view._orientationChanging = !1
        }, 1E3)
    },
    _adjustSizeKeepCanvasSize: function() {
        var a = this._originalDesignResolutionSize.width,
            b = this._originalDesignResolutionSize.height;
        0 < a && this.setDesignResolutionSize(a, b, this._resolutionPolicy)
    },
    _setViewportMeta: function(a, b) {
        var c = document.getElementById("cocosMetaElement");
        c && b && document.head.removeChild(c);
        var d = document.getElementsByName("viewport"),
            d = d ? d[0] : null,
            e, f, g;
        e = d ? d.content : "";
        c = c || document.createElement("meta");
        c.id = "cocosMetaElement";
        c.name = "viewport";
        c.content = "";
        for (f in a) - 1 == e.indexOf(f) ? e += "," + f + "\x3d" + a[f] : b && (g = RegExp(f + "s*\x3ds*[^,]+"), e.replace(g, f + "\x3d" + a[f]));
        /^,/.test(e) && (e = e.substr(1));
        c.content = e;
        d && (d.content = e);
        document.head.appendChild(c)
    },
    _adjustViewportMeta: function() {
        this._isAdjustViewPort && (this._setViewportMeta(__BrowserGetter.meta, !1), this._isAdjustViewPort = !1)
    },
    _setScaleXYForRenderTexture: function() {
        var a = cc.contentScaleFactor();
        this._scaleY = this._scaleX = a
    },
    _resetScale: function() {
        this._scaleX = this._originalScaleX;
        this._scaleY = this._originalScaleY
    },
    _adjustSizeToBrowser: function() {},
    initialize: function() {
        this._initialized = !0
    },
    adjustViewPort: function(a) {
        this._isAdjustViewPort = a
    },
    enableRetina: function(a) {
        this._retinaEnabled = !!a
    },
    isRetinaEnabled: function() {
        return this._retinaEnabled
    },
    enableAutoFullScreen: function(a) {
        a && a !== this._autoFullScreen && cc.sys.isMobile && this._frame === document.documentElement ? (this._autoFullScreen = !0, cc.screen.autoFullScreen(this._frame)) : this._autoFullScreen = !1
    },
    isAutoFullScreenEnabled: function() {
        return this._autoFullScreen
    },
    end: function() {},
    isOpenGLReady: function() {
        return cc.game.canvas && cc._renderContext
    },
    setFrameZoomFactor: function(a) {
        this._frameZoomFactor = a;
        this.centerWindow();
        cc.director.setProjection(cc.director.getProjection())
    },
    swapBuffers: function() {},
    setIMEKeyboardState: function(a) {},
    setContentTranslateLeftTop: function(a, b) {
        this._contentTranslateLeftTop = {
            left: a,
            top: b
        }
    },
    getContentTranslateLeftTop: function() {
        return this._contentTranslateLeftTop
    },
    getCanvasSize: function() {
        return cc.size(cc._canvas.width, cc._canvas.height)
    },
    getFrameSize: function() {
        return cc.size(this._frameSize.width, this._frameSize.height)
    },
    setFrameSize: function(a, b) {
        this._frameSize.width = a;
        this._frameSize.height = b;
        this._frame.style.width = a + "px";
        this._frame.style.height = b + "px";
        this._resizeEvent();
        cc.director.setProjection(cc.director.getProjection())
    },
    centerWindow: function() {},
    getVisibleSize: function() {
        return cc.size(this._visibleRect.width, this._visibleRect.height)
    },
    getVisibleSizeInPixel: function() {
        return cc.size(this._visibleRect.width * this._scaleX,
            this._visibleRect.height * this._scaleY)
    },
    getVisibleOrigin: function() {
        return cc.p(this._visibleRect.x, this._visibleRect.y)
    },
    getVisibleOriginInPixel: function() {
        return cc.p(this._visibleRect.x * this._scaleX, this._visibleRect.y * this._scaleY)
    },
    canSetContentScaleFactor: function() {
        return !0
    },
    getResolutionPolicy: function() {
        return this._resolutionPolicy
    },
    setResolutionPolicy: function(a) {
        if (a instanceof cc.ResolutionPolicy) this._resolutionPolicy = a;
        else {
            var b = cc.ResolutionPolicy;
            a === b.EXACT_FIT && (this._resolutionPolicy =
                this._rpExactFit);
            a === b.SHOW_ALL && (this._resolutionPolicy = this._rpShowAll);
            a === b.NO_BORDER && (this._resolutionPolicy = this._rpNoBorder);
            a === b.FIXED_HEIGHT && (this._resolutionPolicy = this._rpFixedHeight);
            a === b.FIXED_WIDTH && (this._resolutionPolicy = this._rpFixedWidth)
        }
    },
    setDesignResolutionSize: function(a, b, c) {
        if (0 < a || 0 < b)
            if (this.setResolutionPolicy(c), (c = this._resolutionPolicy) && c.preApply(this), cc.sys.isMobile && this._adjustViewportMeta(), this._orientationChanging = !0, this._initFrameSize(), c) {
                this._originalDesignResolutionSize.width =
                    this._designResolutionSize.width = a;
                this._originalDesignResolutionSize.height = this._designResolutionSize.height = b;
                var d = c.apply(this, this._designResolutionSize);
                d.scale && 2 === d.scale.length && (this._scaleX = d.scale[0], this._scaleY = d.scale[1]);
                d.viewport && (a = this._viewPortRect, b = this._visibleRect, d = d.viewport, a.x = d.x, a.y = d.y, a.width = d.width, a.height = d.height, b.x = -a.x / this._scaleX, b.y = -a.y / this._scaleY, b.width = cc._canvas.width / this._scaleX, b.height = cc._canvas.height / this._scaleY, cc._renderContext.setOffset &&
                    cc._renderContext.setOffset(a.x, -a.y));
                a = cc.director;
                a._winSizeInPoints.width = this._designResolutionSize.width;
                a._winSizeInPoints.height = this._designResolutionSize.height;
                c.postApply(this);
                cc.winSize.width = a._winSizeInPoints.width;
                cc.winSize.height = a._winSizeInPoints.height;
                cc._renderType === cc.game.RENDER_TYPE_WEBGL ? a.setGLDefaultValues() : cc._renderType === cc.game.RENDER_TYPE_CANVAS && (cc.renderer._allNeedDraw = !0);
                this._originalScaleX = this._scaleX;
                this._originalScaleY = this._scaleY;
                cc.visibleRect && cc.visibleRect.init(this._visibleRect)
            } else cc.log(cc._LogInfos.EGLView_setDesignResolutionSize_2);
        else cc.log(cc._LogInfos.EGLView_setDesignResolutionSize)
    },
    getDesignResolutionSize: function() {
        return cc.size(this._designResolutionSize.width, this._designResolutionSize.height)
    },
    setRealPixelResolution: function(a, b, c) {
        this._setViewportMeta({
            width: a
        }, !0);
        document.documentElement.style.width = a + "px";
        document.body.style.width = "100%";
        this.setDesignResolutionSize(a, b, c)
    },
    setViewPortInPoints: function(a, b, c, d) {
        var e = this._frameZoomFactor,
            f = this._scaleX,
            g = this._scaleY;
        cc._renderContext.viewport(a * f * e + this._viewPortRect.x *
            e, b * g * e + this._viewPortRect.y * e, c * f * e, d * g * e)
    },
    setScissorInPoints: function(a, b, c, d) {
        var e = this._frameZoomFactor,
            f = this._scaleX,
            g = this._scaleY;
        a = Math.ceil(a * f * e + this._viewPortRect.x * e);
        b = Math.ceil(b * g * e + this._viewPortRect.y * e);
        c = Math.ceil(c * f * e);
        d = Math.ceil(d * g * e);
        _scissorRect || (e = gl.getParameter(gl.SCISSOR_BOX), _scissorRect = cc.rect(e[0], e[1], e[2], e[3]));
        if (_scissorRect.x != a || _scissorRect.y != b || _scissorRect.width != c || _scissorRect.height != d) _scissorRect.x = a, _scissorRect.y = b, _scissorRect.width = c, _scissorRect.height =
            d, cc._renderContext.scissor(a, b, c, d)
    },
    isScissorEnabled: function() {
        return cc._renderContext.isEnabled(gl.SCISSOR_TEST)
    },
    getScissorRect: function() {
        if (!_scissorRect) {
            var a = gl.getParameter(gl.SCISSOR_BOX);
            _scissorRect = cc.rect(a[0], a[1], a[2], a[3])
        }
        var a = this._scaleX,
            b = this._scaleY;
        return cc.rect((_scissorRect.x - this._viewPortRect.x) / a, (_scissorRect.y - this._viewPortRect.y) / b, _scissorRect.width / a, _scissorRect.height / b)
    },
    setViewName: function(a) {
        null != a && 0 < a.length && (this._viewName = a)
    },
    getViewName: function() {
        return this._viewName
    },
    getViewPortRect: function() {
        return this._viewPortRect
    },
    getScaleX: function() {
        return this._scaleX
    },
    getScaleY: function() {
        return this._scaleY
    },
    getDevicePixelRatio: function() {
        return this._devicePixelRatio
    },
    convertToLocationInView: function(a, b, c) {
        a = this._devicePixelRatio * (a - c.left);
        b = this._devicePixelRatio * (c.top + c.height - b);
        return this._isRotated ? {
            x: this._viewPortRect.width - b,
            y: a
        } : {
            x: a,
            y: b
        }
    },
    _convertMouseToLocationInView: function(a, b) {
        var c = this._viewPortRect;
        a.x = (this._devicePixelRatio * (a.x - b.left) - c.x) /
            this._scaleX;
        a.y = (this._devicePixelRatio * (b.top + b.height - a.y) - c.y) / this._scaleY
    },
    _convertPointWithScale: function(a) {
        var b = this._viewPortRect;
        a.x = (a.x - b.x) / this._scaleX;
        a.y = (a.y - b.y) / this._scaleY
    },
    _convertTouchesWithScale: function(a) {
        for (var b = this._viewPortRect, c = this._scaleX, d = this._scaleY, e, f, g = 0; g < a.length; g++) e = a[g], f = e._point, e = e._prevPoint, f.x = (f.x - b.x) / c, f.y = (f.y - b.y) / d, e.x = (e.x - b.x) / c, e.y = (e.y - b.y) / d
    }
});
cc.EGLView._getInstance = function() {
    this._instance || (this._instance = this._instance || new cc.EGLView, this._instance.initialize());
    return this._instance
};
cc.ContainerStrategy = cc.Class.extend({
    preApply: function(a) {},
    apply: function(a, b) {},
    postApply: function(a) {},
    _setupContainer: function(a, b, c) {
        var d = cc.game.canvas,
            e = cc.game.container;
        cc.sys.isMobile && (document.body.style.width = (a._isRotated ? c : b) + "px", document.body.style.height = (a._isRotated ? b : c) + "px");
        e.style.width = d.style.width = b + "px";
        e.style.height = d.style.height = c + "px";
        e = a._devicePixelRatio = 1;
        a.isRetinaEnabled() && (e = a._devicePixelRatio = Math.min(2, window.devicePixelRatio || 1));
        d.width = b * e;
        d.height =
            c * e;
        cc._renderContext.resetCache && cc._renderContext.resetCache()
    },
    _fixContainer: function() {
        document.body.insertBefore(cc.container, document.body.firstChild);
        var a = document.body.style;
        a.width = window.innerWidth + "px";
        a.height = window.innerHeight + "px";
        a.overflow = "hidden";
        a = cc.container.style;
        a.position = "fixed";
        a.left = a.top = "0px";
        document.body.scrollTop = 0
    }
});
cc.ContentStrategy = cc.Class.extend({
    _result: {
        scale: [1, 1],
        viewport: null
    },
    _buildResult: function(a, b, c, d, e, f) {
        2 > Math.abs(a - c) && (c = a);
        2 > Math.abs(b - d) && (d = b);
        a = cc.rect(Math.round((a - c) / 2), Math.round((b - d) / 2), c, d);
        this._result.scale = [e, f];
        this._result.viewport = a;
        return this._result
    },
    preApply: function(a) {},
    apply: function(a, b) {
        return {
            scale: [1, 1]
        }
    },
    postApply: function(a) {}
});
(function() {
    var a = cc.ContainerStrategy.extend({
            apply: function(a) {
                var b = a._frameSize.height,
                    c = cc.container.style;
                this._setupContainer(a, a._frameSize.width, a._frameSize.height);
                a._isRotated ? c.marginLeft = b + "px" : c.margin = "0px"
            }
        }),
        b = cc.ContainerStrategy.extend({
            apply: function(a, b) {
                var c = a._frameSize.width,
                    d = a._frameSize.height,
                    e = cc.container.style,
                    n = b.width,
                    p = b.height,
                    r = c / n,
                    s = d / p,
                    u, t;
                r < s ? (u = c, t = p * r) : (u = n * s, t = d);
                n = Math.round((c - u) / 2);
                t = Math.round((d - t) / 2);
                this._setupContainer(a, c - 2 * n, d - 2 * t);
                a._isRotated ?
                    e.marginLeft = d + "px" : e.margin = "0px";
                e.paddingLeft = n + "px";
                e.paddingRight = n + "px";
                e.paddingTop = t + "px";
                e.paddingBottom = t + "px"
            }
        });
    a.extend({
        preApply: function(a) {
            this._super(a);
            a._frame = document.documentElement
        },
        apply: function(a) {
            this._super(a);
            this._fixContainer()
        }
    });
    b.extend({
        preApply: function(a) {
            this._super(a);
            a._frame = document.documentElement
        },
        apply: function(a, b) {
            this._super(a, b);
            this._fixContainer()
        }
    });
    var c = cc.ContainerStrategy.extend({
        apply: function(a) {
            this._setupContainer(a, cc._canvas.width, cc._canvas.height)
        }
    });
    cc.ContainerStrategy.EQUAL_TO_FRAME = new a;
    cc.ContainerStrategy.PROPORTION_TO_FRAME = new b;
    cc.ContainerStrategy.ORIGINAL_CONTAINER = new c;
    var a = cc.ContentStrategy.extend({
            apply: function(a, b) {
                var c = cc._canvas.width,
                    d = cc._canvas.height;
                return this._buildResult(c, d, c, d, c / b.width, d / b.height)
            }
        }),
        b = cc.ContentStrategy.extend({
            apply: function(a, b) {
                var c = cc._canvas.width,
                    d = cc._canvas.height,
                    e = b.width,
                    n = b.height,
                    p = c / e,
                    r = d / n,
                    s = 0,
                    u, t;
                p < r ? (s = p, u = c, t = n * s) : (s = r, u = e * s, t = d);
                return this._buildResult(c, d, u, t, s, s)
            }
        }),
        c =
        cc.ContentStrategy.extend({
            apply: function(a, b) {
                var c = cc._canvas.width,
                    d = cc._canvas.height,
                    e = b.width,
                    n = b.height,
                    p = c / e,
                    r = d / n,
                    s, u, t;
                p < r ? (s = r, u = e * s, t = d) : (s = p, u = c, t = n * s);
                return this._buildResult(c, d, u, t, s, s)
            }
        }),
        d = cc.ContentStrategy.extend({
            apply: function(a, b) {
                var c = cc._canvas.width,
                    d = cc._canvas.height,
                    e = d / b.height;
                return this._buildResult(c, d, c, d, e, e)
            },
            postApply: function(a) {
                cc.director._winSizeInPoints = a.getVisibleSize()
            }
        }),
        e = cc.ContentStrategy.extend({
            apply: function(a, b) {
                var c = cc._canvas.width,
                    d = cc._canvas.height,
                    e = c / b.width;
                return this._buildResult(c, d, c, d, e, e)
            },
            postApply: function(a) {
                cc.director._winSizeInPoints = a.getVisibleSize()
            }
        });
    cc.ContentStrategy.EXACT_FIT = new a;
    cc.ContentStrategy.SHOW_ALL = new b;
    cc.ContentStrategy.NO_BORDER = new c;
    cc.ContentStrategy.FIXED_HEIGHT = new d;
    cc.ContentStrategy.FIXED_WIDTH = new e
})();
cc.ResolutionPolicy = cc.Class.extend({
    _containerStrategy: null,
    _contentStrategy: null,
    ctor: function(a, b) {
        this.setContainerStrategy(a);
        this.setContentStrategy(b)
    },
    preApply: function(a) {
        this._containerStrategy.preApply(a);
        this._contentStrategy.preApply(a)
    },
    apply: function(a, b) {
        this._containerStrategy.apply(a, b);
        return this._contentStrategy.apply(a, b)
    },
    postApply: function(a) {
        this._containerStrategy.postApply(a);
        this._contentStrategy.postApply(a)
    },
    setContainerStrategy: function(a) {
        a instanceof cc.ContainerStrategy &&
            (this._containerStrategy = a)
    },
    setContentStrategy: function(a) {
        a instanceof cc.ContentStrategy && (this._contentStrategy = a)
    }
});
cc.ResolutionPolicy.EXACT_FIT = 0;
cc.ResolutionPolicy.NO_BORDER = 1;
cc.ResolutionPolicy.SHOW_ALL = 2;
cc.ResolutionPolicy.FIXED_HEIGHT = 3;
cc.ResolutionPolicy.FIXED_WIDTH = 4;
cc.ResolutionPolicy.UNKNOWN = 5;
cc.screen = {
    _supportsFullScreen: !1,
    _preOnFullScreenChange: null,
    _touchEvent: "",
    _fn: null,
    _fnMap: [
        ["requestFullscreen", "exitFullscreen", "fullscreenchange", "fullscreenEnabled", "fullscreenElement"],
        ["requestFullScreen", "exitFullScreen", "fullScreenchange", "fullScreenEnabled", "fullScreenElement"],
        ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitIsFullScreen", "webkitCurrentFullScreenElement"],
        ["mozRequestFullScreen", "mozCancelFullScreen", "mozfullscreenchange", "mozFullScreen",
            "mozFullScreenElement"
        ],
        ["msRequestFullscreen", "msExitFullscreen", "MSFullscreenChange", "msFullscreenEnabled", "msFullscreenElement"]
    ],
    init: function() {
        this._fn = {};
        var a, b, c = this._fnMap,
            d;
        a = 0;
        for (l = c.length; a < l; a++)
            if ((b = c[a]) && b[1] in document) {
                a = 0;
                for (d = b.length; a < d; a++) this._fn[c[0][a]] = b[a];
                break
            }
        this._supportsFullScreen = "undefined" !== typeof this._fn.requestFullscreen;
        this._touchEvent = "ontouchstart" in window ? "touchstart" : "mousedown"
    },
    fullScreen: function() {
        return this._supportsFullScreen ? void 0 ===
            document[this._fn.fullscreenElement] || null === document[this._fn.fullscreenElement] ? !1 : !0 : !1
    },
    requestFullScreen: function(a, b) {
        if (this._supportsFullScreen) {
            a = a || document.documentElement;
            if (b) {
                var c = this._fn.fullscreenchange;
                this._preOnFullScreenChange && document.removeEventListener(c, this._preOnFullScreenChange);
                this._preOnFullScreenChange = b;
                document.addEventListener(c, b, !1)
            }
            return a[this._fn.requestFullscreen]()
        }
    },
    exitFullScreen: function() {
        return this._supportsFullScreen ? document[this._fn.exitFullscreen]() :
            !0
    },
    autoFullScreen: function(a, b) {
        function c() {
            d.removeEventListener(e._touchEvent, c);
            e.requestFullScreen(a, b)
        }
        a = a || document.body;
        var d = cc.game.canvas || a,
            e = this;
        this.requestFullScreen(a, b);
        d.addEventListener(this._touchEvent, c)
    }
};
cc.screen.init();
cc.visibleRect = {
    topLeft: cc.p(0, 0),
    topRight: cc.p(0, 0),
    top: cc.p(0, 0),
    bottomLeft: cc.p(0, 0),
    bottomRight: cc.p(0, 0),
    bottom: cc.p(0, 0),
    center: cc.p(0, 0),
    left: cc.p(0, 0),
    right: cc.p(0, 0),
    width: 0,
    height: 0,
    init: function(a) {
        var b = this.width = a.width,
            c = this.height = a.height,
            d = a.x;
        a = a.y;
        var e = a + c,
            f = d + b;
        this.topLeft.x = d;
        this.topLeft.y = e;
        this.topRight.x = f;
        this.topRight.y = e;
        this.top.x = d + b / 2;
        this.top.y = e;
        this.bottomLeft.x = d;
        this.bottomLeft.y = a;
        this.bottomRight.x = f;
        this.bottomRight.y = a;
        this.bottom.x = d + b / 2;
        this.bottom.y =
            a;
        this.center.x = d + b / 2;
        this.center.y = a + c / 2;
        this.left.x = d;
        this.left.y = a + c / 2;
        this.right.x = f;
        this.right.y = a + c / 2
    }
};
cc.UIInterfaceOrientationLandscapeLeft = -90;
cc.UIInterfaceOrientationLandscapeRight = 90;
cc.UIInterfaceOrientationPortraitUpsideDown = 180;
cc.UIInterfaceOrientationPortrait = 0;
cc.inputManager = {
    TOUCH_TIMEOUT: 5E3,
    _mousePressed: !1,
    _isRegisterEvent: !1,
    _preTouchPoint: cc.p(0, 0),
    _prevMousePoint: cc.p(0, 0),
    _preTouchPool: [],
    _preTouchPoolPointer: 0,
    _touches: [],
    _touchesIntegerDict: {},
    _indexBitsUsed: 0,
    _maxTouches: 5,
    _accelEnabled: !1,
    _accelInterval: 1 / 30,
    _accelMinus: 1,
    _accelCurTime: 0,
    _acceleration: null,
    _accelDeviceEvent: null,
    _getUnUsedIndex: function() {
        for (var a = this._indexBitsUsed, b = cc.sys.now(), c = 0; c < this._maxTouches; c++) {
            if (a & 1) {
                var d = this._touches[c];
                if (b - d._lastModified > this.TOUCH_TIMEOUT) return this._removeUsedIndexBit(c),
                    delete this._touchesIntegerDict[d.getID()], c
            } else return this._indexBitsUsed |= 1 << c, c;
            a >>= 1
        }
        return -1
    },
    _removeUsedIndexBit: function(a) {
        0 > a || a >= this._maxTouches || (a = ~(1 << a), this._indexBitsUsed &= a)
    },
    _glView: null,
    handleTouchesBegin: function(a) {
        for (var b, c, d, e = [], f = this._touchesIntegerDict, g = cc.sys.now(), h = 0, k = a.length; h < k; h++)
            if (b = a[h], d = b.getID(), c = f[d], null == c) {
                var m = this._getUnUsedIndex(); - 1 === m ? cc.log(cc._LogInfos.inputManager_handleTouchesBegin, m) : (c = this._touches[m] = new cc.Touch(b._point.x, b._point.y,
                    b.getID()), c._lastModified = g, c._setPrevPoint(b._prevPoint), f[d] = m, e.push(c))
            }
        0 < e.length && (this._glView._convertTouchesWithScale(e), a = new cc.EventTouch(e), a._eventCode = cc.EventTouch.EventCode.BEGAN, cc.eventManager.dispatchEvent(a))
    },
    handleTouchesMove: function(a) {
        for (var b, c, d = [], e = this._touches, f = cc.sys.now(), g = 0, h = a.length; g < h; g++) b = a[g], c = b.getID(), c = this._touchesIntegerDict[c], null != c && e[c] && (e[c]._setPoint(b._point), e[c]._setPrevPoint(b._prevPoint), e[c]._lastModified = f, d.push(e[c]));
        0 < d.length &&
            (this._glView._convertTouchesWithScale(d), a = new cc.EventTouch(d), a._eventCode = cc.EventTouch.EventCode.MOVED, cc.eventManager.dispatchEvent(a))
    },
    handleTouchesEnd: function(a) {
        a = this.getSetOfTouchesEndOrCancel(a);
        0 < a.length && (this._glView._convertTouchesWithScale(a), a = new cc.EventTouch(a), a._eventCode = cc.EventTouch.EventCode.ENDED, cc.eventManager.dispatchEvent(a))
    },
    handleTouchesCancel: function(a) {
        a = this.getSetOfTouchesEndOrCancel(a);
        0 < a.length && (this._glView._convertTouchesWithScale(a), a = new cc.EventTouch(a),
            a._eventCode = cc.EventTouch.EventCode.CANCELLED, cc.eventManager.dispatchEvent(a))
    },
    getSetOfTouchesEndOrCancel: function(a) {
        for (var b, c, d, e = [], f = this._touches, g = this._touchesIntegerDict, h = 0, k = a.length; h < k; h++) b = a[h], d = b.getID(), c = g[d], null != c && f[c] && (f[c]._setPoint(b._point), f[c]._setPrevPoint(b._prevPoint), e.push(f[c]), this._removeUsedIndexBit(c), delete g[d]);
        return e
    },
    getHTMLElementPosition: function(a) {
        var b = document.documentElement,
            c = window,
            d = null,
            d = cc.isFunction(a.getBoundingClientRect) ? a.getBoundingClientRect() : {
                left: 0,
                top: 0,
                width: parseInt(a.style.width),
                height: parseInt(a.style.height)
            };
        return {
            left: d.left + c.pageXOffset - b.clientLeft,
            top: d.top + c.pageYOffset - b.clientTop,
            width: d.width,
            height: d.height
        }
    },
    getPreTouch: function(a) {
        for (var b = null, c = this._preTouchPool, d = a.getID(), e = c.length - 1; 0 <= e; e--)
            if (c[e].getID() === d) {
                b = c[e];
                break
            }
        b || (b = a);
        return b
    },
    setPreTouch: function(a) {
        for (var b = !1, c = this._preTouchPool, d = a.getID(), e = c.length - 1; 0 <= e; e--)
            if (c[e].getID() === d) {
                c[e] = a;
                b = !0;
                break
            }
        b || (50 >= c.length ? c.push(a) : (c[this._preTouchPoolPointer] =
            a, this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50))
    },
    getTouchByXY: function(a, b, c) {
        var d = this._preTouchPoint;
        a = this._glView.convertToLocationInView(a, b, c);
        b = new cc.Touch(a.x, a.y);
        b._setPrevPoint(d.x, d.y);
        d.x = a.x;
        d.y = a.y;
        return b
    },
    getMouseEvent: function(a, b, c) {
        var d = this._prevMousePoint;
        this._glView._convertMouseToLocationInView(a, b);
        b = new cc.EventMouse(c);
        b.setLocation(a.x, a.y);
        b._setPrevCursor(d.x, d.y);
        d.x = a.x;
        d.y = a.y;
        return b
    },
    getPointByEvent: function(a, b) {
        if (null != a.pageX) return {
            x: a.pageX,
            y: a.pageY
        };
        b.left -= document.body.scrollLeft;
        b.top -= document.body.scrollTop;
        return {
            x: a.clientX,
            y: a.clientY
        }
    },
    getTouchesByEvent: function(a, b) {
        for (var c = [], d = this._glView, e, f, g = this._preTouchPoint, h = a.changedTouches.length, k = 0; k < h; k++)
            if (e = a.changedTouches[k]) {
                var m;
                m = cc.sys.BROWSER_TYPE_FIREFOX === cc.sys.browserType ? d.convertToLocationInView(e.pageX, e.pageY, b) : d.convertToLocationInView(e.clientX, e.clientY, b);
                null != e.identifier ? (e = new cc.Touch(m.x, m.y, e.identifier), f = this.getPreTouch(e).getLocation(),
                    e._setPrevPoint(f.x, f.y), this.setPreTouch(e)) : (e = new cc.Touch(m.x, m.y), e._setPrevPoint(g.x, g.y));
                g.x = m.x;
                g.y = m.y;
                c.push(e)
            }
        return c
    },
    registerSystemEvent: function(a) {
        if (!this._isRegisterEvent) {
            this._glView = cc.view;
            var b = this,
                c = "mouse" in cc.sys.capabilities,
                d = "touches" in cc.sys.capabilities,
                e = !1;
            cc.sys.isMobile && (e = !0);
            c && (window.addEventListener("mousedown", function() {
                b._mousePressed = !0
            }, !1), window.addEventListener("mouseup", function(c) {
                if (!e) {
                    var d = b._mousePressed;
                    b._mousePressed = !1;
                    if (d) {
                        var d = b.getHTMLElementPosition(a),
                            f = b.getPointByEvent(c, d);
                        cc.rectContainsPoint(new cc.Rect(d.left, d.top, d.width, d.height), f) || (b.handleTouchesEnd([b.getTouchByXY(f.x, f.y, d)]), d = b.getMouseEvent(f, d, cc.EventMouse.UP), d.setButton(c.button), cc.eventManager.dispatchEvent(d))
                    }
                }
            }, !1), a.addEventListener("mousedown", function(c) {
                if (!e) {
                    b._mousePressed = !0;
                    var d = b.getHTMLElementPosition(a),
                        f = b.getPointByEvent(c, d);
                    b.handleTouchesBegin([b.getTouchByXY(f.x, f.y, d)]);
                    d = b.getMouseEvent(f, d, cc.EventMouse.DOWN);
                    d.setButton(c.button);
                    cc.eventManager.dispatchEvent(d);
                    c.stopPropagation();
                    c.preventDefault();
                    a.focus()
                }
            }, !1), a.addEventListener("mouseup", function(c) {
                if (!e) {
                    b._mousePressed = !1;
                    var d = b.getHTMLElementPosition(a),
                        f = b.getPointByEvent(c, d);
                    b.handleTouchesEnd([b.getTouchByXY(f.x, f.y, d)]);
                    d = b.getMouseEvent(f, d, cc.EventMouse.UP);
                    d.setButton(c.button);
                    cc.eventManager.dispatchEvent(d);
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), a.addEventListener("mousemove", function(c) {
                if (!e) {
                    var d = b.getHTMLElementPosition(a),
                        f = b.getPointByEvent(c, d);
                    b.handleTouchesMove([b.getTouchByXY(f.x,
                        f.y, d)]);
                    d = b.getMouseEvent(f, d, cc.EventMouse.MOVE);
                    b._mousePressed ? d.setButton(c.button) : d.setButton(null);
                    cc.eventManager.dispatchEvent(d);
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), a.addEventListener("mousewheel", function(c) {
                var d = b.getHTMLElementPosition(a),
                    e = b.getPointByEvent(c, d),
                    d = b.getMouseEvent(e, d, cc.EventMouse.SCROLL);
                d.setButton(c.button);
                d.setScrollData(0, c.wheelDelta);
                cc.eventManager.dispatchEvent(d);
                c.stopPropagation();
                c.preventDefault()
            }, !1), a.addEventListener("DOMMouseScroll", function(c) {
                var d =
                    b.getHTMLElementPosition(a),
                    e = b.getPointByEvent(c, d),
                    d = b.getMouseEvent(e, d, cc.EventMouse.SCROLL);
                d.setButton(c.button);
                d.setScrollData(0, -120 * c.detail);
                cc.eventManager.dispatchEvent(d);
                c.stopPropagation();
                c.preventDefault()
            }, !1));
            if (window.navigator.msPointerEnabled) {
                var c = {
                        MSPointerDown: b.handleTouchesBegin,
                        MSPointerMove: b.handleTouchesMove,
                        MSPointerUp: b.handleTouchesEnd,
                        MSPointerCancel: b.handleTouchesCancel
                    },
                    f;
                for (f in c)(function(c, d) {
                    a.addEventListener(c, function(c) {
                        var e = b.getHTMLElementPosition(a);
                        e.left -= document.documentElement.scrollLeft;
                        e.top -= document.documentElement.scrollTop;
                        d.call(b, [b.getTouchByXY(c.clientX, c.clientY, e)]);
                        c.stopPropagation()
                    }, !1)
                })(f, c[f])
            }
            d && (a.addEventListener("touchstart", function(c) {
                if (c.changedTouches) {
                    var d = b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesBegin(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault();
                    a.focus()
                }
            }, !1), a.addEventListener("touchmove", function(c) {
                if (c.changedTouches) {
                    var d =
                        b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesMove(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), a.addEventListener("touchend", function(c) {
                if (c.changedTouches) {
                    var d = b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesEnd(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), a.addEventListener("touchcancel", function(c) {
                if (c.changedTouches) {
                    var d =
                        b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesCancel(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1));
            this._registerKeyboardEvent();
            this._registerAccelerometerEvent();
            this._isRegisterEvent = !0
        }
    },
    _registerKeyboardEvent: function() {},
    _registerAccelerometerEvent: function() {},
    update: function(a) {
        this._accelCurTime > this._accelInterval && (this._accelCurTime -= this._accelInterval, cc.eventManager.dispatchEvent(new cc.EventAcceleration(this._acceleration)));
        this._accelCurTime += a
    }
};
_p = cc.inputManager;
_p.setAccelerometerEnabled = function(a) {
    this._accelEnabled !== a && (this._accelEnabled = a, a = cc.director.getScheduler(), this._accelCurTime = 0, a.scheduleUpdate(this))
};
_p.setAccelerometerInterval = function(a) {
    this._accelInterval !== a && (this._accelInterval = a)
};
_p._registerKeyboardEvent = function() {
    cc._canvas.addEventListener("keydown", function(a) {
        cc.eventManager.dispatchEvent(new cc.EventKeyboard(a.keyCode, !0));
        a.stopPropagation();
        a.preventDefault()
    }, !1);
    cc._canvas.addEventListener("keyup", function(a) {
        cc.eventManager.dispatchEvent(new cc.EventKeyboard(a.keyCode, !1));
        a.stopPropagation();
        a.preventDefault()
    }, !1)
};
_p._registerAccelerometerEvent = function() {
    var a = window;
    this._acceleration = new cc.Acceleration;
    this._accelDeviceEvent = a.DeviceMotionEvent || a.DeviceOrientationEvent;
    cc.sys.browserType === cc.sys.BROWSER_TYPE_MOBILE_QQ && (this._accelDeviceEvent = window.DeviceOrientationEvent);
    var b = this._accelDeviceEvent === a.DeviceMotionEvent ? "devicemotion" : "deviceorientation",
        c = navigator.userAgent;
    if (/Android/.test(c) || /Adr/.test(c) && cc.sys.browserType === cc.BROWSER_TYPE_UC) this._minus = -1;
    a.addEventListener(b, this.didAccelerate.bind(this), !1)
};
_p.didAccelerate = function(a) {
    var b = window;
    if (this._accelEnabled) {
        var c = this._acceleration,
            d, e, f;
        this._accelDeviceEvent === window.DeviceMotionEvent ? (f = a.accelerationIncludingGravity, d = this._accelMinus * f.x * 0.1, e = this._accelMinus * f.y * 0.1, f = 0.1 * f.z) : (d = a.gamma / 90 * 0.981, e = 0.981 * -(a.beta / 90), f = a.alpha / 90 * 0.981);
        c.x = d;
        c.y = e;
        c.z = f;
        c.timestamp = a.timeStamp || Date.now();
        a = c.x;
        b.orientation === cc.UIInterfaceOrientationLandscapeRight ? (c.x = -c.y, c.y = a) : b.orientation === cc.UIInterfaceOrientationLandscapeLeft ? (c.x = c.y,
            c.y = -a) : b.orientation === cc.UIInterfaceOrientationPortraitUpsideDown && (c.x = -c.x, c.y = -c.y)
    }
};
delete _p;
cc.AffineTransform = function(a, b, c, d, e, f) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = e;
    this.ty = f
};
cc.affineTransformMake = function(a, b, c, d, e, f) {
    return {
        a: a,
        b: b,
        c: c,
        d: d,
        tx: e,
        ty: f
    }
};
cc.pointApplyAffineTransform = function(a, b, c) {
    var d;
    void 0 === c ? (c = b, d = a.x, a = a.y) : (d = a, a = b);
    return {
        x: c.a * d + c.c * a + c.tx,
        y: c.b * d + c.d * a + c.ty
    }
};
cc._pointApplyAffineTransform = function(a, b, c) {
    return cc.pointApplyAffineTransform(a, b, c)
};
cc.sizeApplyAffineTransform = function(a, b) {
    return {
        width: b.a * a.width + b.c * a.height,
        height: b.b * a.width + b.d * a.height
    }
};
cc.affineTransformMakeIdentity = function() {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: 0,
        ty: 0
    }
};
cc.affineTransformIdentity = function() {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: 0,
        ty: 0
    }
};
cc.rectApplyAffineTransform = function(a, b) {
    var c = cc.rectGetMinY(a),
        d = cc.rectGetMinX(a),
        e = cc.rectGetMaxX(a),
        f = cc.rectGetMaxY(a),
        g = cc.pointApplyAffineTransform(d, c, b),
        c = cc.pointApplyAffineTransform(e, c, b),
        d = cc.pointApplyAffineTransform(d, f, b),
        h = cc.pointApplyAffineTransform(e, f, b),
        e = Math.min(g.x, c.x, d.x, h.x),
        f = Math.max(g.x, c.x, d.x, h.x),
        k = Math.min(g.y, c.y, d.y, h.y),
        g = Math.max(g.y, c.y, d.y, h.y);
    return cc.rect(e, k, f - e, g - k)
};
cc._rectApplyAffineTransformIn = function(a, b) {
    var c = cc.rectGetMinY(a),
        d = cc.rectGetMinX(a),
        e = cc.rectGetMaxX(a),
        f = cc.rectGetMaxY(a),
        g = cc.pointApplyAffineTransform(d, c, b),
        c = cc.pointApplyAffineTransform(e, c, b),
        d = cc.pointApplyAffineTransform(d, f, b),
        h = cc.pointApplyAffineTransform(e, f, b),
        e = Math.min(g.x, c.x, d.x, h.x),
        f = Math.max(g.x, c.x, d.x, h.x),
        k = Math.min(g.y, c.y, d.y, h.y),
        g = Math.max(g.y, c.y, d.y, h.y);
    a.x = e;
    a.y = k;
    a.width = f - e;
    a.height = g - k;
    return a
};
cc.affineTransformTranslate = function(a, b, c) {
    return {
        a: a.a,
        b: a.b,
        c: a.c,
        d: a.d,
        tx: a.tx + a.a * b + a.c * c,
        ty: a.ty + a.b * b + a.d * c
    }
};
cc.affineTransformScale = function(a, b, c) {
    return {
        a: a.a * b,
        b: a.b * b,
        c: a.c * c,
        d: a.d * c,
        tx: a.tx,
        ty: a.ty
    }
};
cc.affineTransformRotate = function(a, b) {
    var c = Math.sin(b),
        d = Math.cos(b);
    return {
        a: a.a * d + a.c * c,
        b: a.b * d + a.d * c,
        c: a.c * d - a.a * c,
        d: a.d * d - a.b * c,
        tx: a.tx,
        ty: a.ty
    }
};
cc.affineTransformConcat = function(a, b) {
    return {
        a: a.a * b.a + a.b * b.c,
        b: a.a * b.b + a.b * b.d,
        c: a.c * b.a + a.d * b.c,
        d: a.c * b.b + a.d * b.d,
        tx: a.tx * b.a + a.ty * b.c + b.tx,
        ty: a.tx * b.b + a.ty * b.d + b.ty
    }
};
cc.affineTransformConcatIn = function(a, b) {
    var c = a.a,
        d = a.b,
        e = a.c,
        f = a.d,
        g = a.tx,
        h = a.ty;
    a.a = c * b.a + d * b.c;
    a.b = c * b.b + d * b.d;
    a.c = e * b.a + f * b.c;
    a.d = e * b.b + f * b.d;
    a.tx = g * b.a + h * b.c + b.tx;
    a.ty = g * b.b + h * b.d + b.ty;
    return a
};
cc.affineTransformEqualToTransform = function(a, b) {
    return a.a === b.a && a.b === b.b && a.c === b.c && a.d === b.d && a.tx === b.tx && a.ty === b.ty
};
cc.affineTransformInvert = function(a) {
    var b = 1 / (a.a * a.d - a.b * a.c);
    return {
        a: b * a.d,
        b: -b * a.b,
        c: -b * a.c,
        d: b * a.a,
        tx: b * (a.c * a.ty - a.d * a.tx),
        ty: b * (a.b * a.tx - a.a * a.ty)
    }
};
cc.affineTransformInvertOut = function(a, b) {
    var c = a.a,
        d = a.b,
        e = a.c,
        f = a.d,
        g = 1 / (c * f - d * e);
    b.a = g * f;
    b.b = -g * d;
    b.c = -g * e;
    b.d = g * c;
    b.tx = g * (e * a.ty - f * a.tx);
    b.ty = g * (d * a.tx - c * a.ty)
};
cc.POINT_EPSILON = parseFloat("1.192092896e-07F");
cc.pNeg = function(a) {
    return cc.p(-a.x, -a.y)
};
cc.pAdd = function(a, b) {
    return cc.p(a.x + b.x, a.y + b.y)
};
cc.pSub = function(a, b) {
    return cc.p(a.x - b.x, a.y - b.y)
};
cc.pMult = function(a, b) {
    return cc.p(a.x * b, a.y * b)
};
cc.pMidpoint = function(a, b) {
    return cc.pMult(cc.pAdd(a, b), 0.5)
};
cc.pDot = function(a, b) {
    return a.x * b.x + a.y * b.y
};
cc.pCross = function(a, b) {
    return a.x * b.y - a.y * b.x
};
cc.pPerp = function(a) {
    return cc.p(-a.y, a.x)
};
cc.pRPerp = function(a) {
    return cc.p(a.y, -a.x)
};
cc.pProject = function(a, b) {
    return cc.pMult(b, cc.pDot(a, b) / cc.pDot(b, b))
};
cc.pRotate = function(a, b) {
    return cc.p(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x)
};
cc.pUnrotate = function(a, b) {
    return cc.p(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y)
};
cc.pLengthSQ = function(a) {
    return cc.pDot(a, a)
};
cc.pDistanceSQ = function(a, b) {
    return cc.pLengthSQ(cc.pSub(a, b))
};
cc.pLength = function(a) {
    return Math.sqrt(cc.pLengthSQ(a))
};
cc.pDistance = function(a, b) {
    return cc.pLength(cc.pSub(a, b))
};
cc.pNormalize = function(a) {
    var b = cc.pLength(a);
    return 0 === b ? cc.p(a) : cc.pMult(a, 1 / b)
};
cc.pForAngle = function(a) {
    return cc.p(Math.cos(a), Math.sin(a))
};
cc.pToAngle = function(a) {
    return Math.atan2(a.y, a.x)
};
cc.clampf = function(a, b, c) {
    if (b > c) {
        var d = b;
        b = c;
        c = d
    }
    return a < b ? b : a < c ? a : c
};
cc.pClamp = function(a, b, c) {
    return cc.p(cc.clampf(a.x, b.x, c.x), cc.clampf(a.y, b.y, c.y))
};
cc.pFromSize = function(a) {
    return cc.p(a.width, a.height)
};
cc.pCompOp = function(a, b) {
    return cc.p(b(a.x), b(a.y))
};
cc.pLerp = function(a, b, c) {
    return cc.pAdd(cc.pMult(a, 1 - c), cc.pMult(b, c))
};
cc.pFuzzyEqual = function(a, b, c) {
    return a.x - c <= b.x && b.x <= a.x + c && a.y - c <= b.y && b.y <= a.y + c ? !0 : !1
};
cc.pCompMult = function(a, b) {
    return cc.p(a.x * b.x, a.y * b.y)
};
cc.pAngleSigned = function(a, b) {
    var c = cc.pNormalize(a),
        d = cc.pNormalize(b),
        c = Math.atan2(c.x * d.y - c.y * d.x, cc.pDot(c, d));
    return Math.abs(c) < cc.POINT_EPSILON ? 0 : c
};
cc.pAngle = function(a, b) {
    var c = Math.acos(cc.pDot(cc.pNormalize(a), cc.pNormalize(b)));
    return Math.abs(c) < cc.POINT_EPSILON ? 0 : c
};
cc.pRotateByAngle = function(a, b, c) {
    a = cc.pSub(a, b);
    var d = Math.cos(c);
    c = Math.sin(c);
    var e = a.x;
    a.x = e * d - a.y * c + b.x;
    a.y = e * c + a.y * d + b.y;
    return a
};
cc.pLineIntersect = function(a, b, c, d, e) {
    if (a.x === b.x && a.y === b.y || c.x === d.x && c.y === d.y) return !1;
    var f = b.x - a.x;
    b = b.y - a.y;
    var g = d.x - c.x;
    d = d.y - c.y;
    var h = a.x - c.x;
    a = a.y - c.y;
    c = d * f - g * b;
    e.x = g * a - d * h;
    e.y = f * a - b * h;
    if (0 === c) return 0 === e.x || 0 === e.y ? !0 : !1;
    e.x /= c;
    e.y /= c;
    return !0
};
cc.pSegmentIntersect = function(a, b, c, d) {
    var e = cc.p(0, 0);
    return cc.pLineIntersect(a, b, c, d, e) && 0 <= e.x && 1 >= e.x && 0 <= e.y && 1 >= e.y ? !0 : !1
};
cc.pIntersectPoint = function(a, b, c, d) {
    var e = cc.p(0, 0);
    return cc.pLineIntersect(a, b, c, d, e) ? (c = cc.p(0, 0), c.x = a.x + e.x * (b.x - a.x), c.y = a.y + e.x * (b.y - a.y), c) : cc.p(0, 0)
};
cc.pSameAs = function(a, b) {
    return null != a && null != b ? a.x === b.x && a.y === b.y : !1
};
cc.pZeroIn = function(a) {
    a.x = 0;
    a.y = 0
};
cc.pIn = function(a, b) {
    a.x = b.x;
    a.y = b.y
};
cc.pMultIn = function(a, b) {
    a.x *= b;
    a.y *= b
};
cc.pSubIn = function(a, b) {
    a.x -= b.x;
    a.y -= b.y
};
cc.pAddIn = function(a, b) {
    a.x += b.x;
    a.y += b.y
};
cc.pNormalizeIn = function(a) {
    cc.pMultIn(a, 1 / Math.sqrt(a.x * a.x + a.y * a.y))
};
cc.vertexLineToPolygon = function(a, b, c, d, e) {
    e += d;
    if (!(1 >= e)) {
        b *= 0.5;
        for (var f, g = e - 1, h = d; h < e; h++) {
            f = 2 * h;
            var k = cc.p(a[2 * h], a[2 * h + 1]),
                m;
            if (0 === h) m = cc.pPerp(cc.pNormalize(cc.pSub(k, cc.p(a[2 * (h + 1)], a[2 * (h + 1) + 1]))));
            else if (h === g) m = cc.pPerp(cc.pNormalize(cc.pSub(cc.p(a[2 * (h - 1)], a[2 * (h - 1) + 1]), k)));
            else {
                m = cc.p(a[2 * (h - 1)], a[2 * (h - 1) + 1]);
                var n = cc.p(a[2 * (h + 1)], a[2 * (h + 1) + 1]),
                    p = cc.pNormalize(cc.pSub(n, k)),
                    r = cc.pNormalize(cc.pSub(m, k)),
                    s = Math.acos(cc.pDot(p, r));
                m = s < cc.degreesToRadians(70) ? cc.pPerp(cc.pNormalize(cc.pMidpoint(p,
                    r))) : s < cc.degreesToRadians(170) ? cc.pNormalize(cc.pMidpoint(p, r)) : cc.pPerp(cc.pNormalize(cc.pSub(n, m)))
            }
            m = cc.pMult(m, b);
            c[2 * f] = k.x + m.x;
            c[2 * f + 1] = k.y + m.y;
            c[2 * (f + 1)] = k.x - m.x;
            c[2 * (f + 1) + 1] = k.y - m.y
        }
        for (h = 0 === d ? 0 : d - 1; h < g; h++) f = 2 * h, a = f + 2, b = cc.vertex2(c[2 * f], c[2 * f + 1]), e = cc.vertex2(c[2 * (f + 1)], c[2 * (f + 1) + 1]), f = cc.vertex2(c[2 * a], c[2 * a]), d = cc.vertex2(c[2 * (a + 1)], c[2 * (a + 1) + 1]), b = !cc.vertexLineIntersect(b.x, b.y, d.x, d.y, e.x, e.y, f.x, f.y), !b.isSuccess && (0 > b.value || 1 < b.value) && (b.isSuccess = !0), b.isSuccess && (c[2 * a] = d.x,
            c[2 * a + 1] = d.y, c[2 * (a + 1)] = f.x, c[2 * (a + 1) + 1] = f.y)
    }
};
cc.vertexLineIntersect = function(a, b, c, d, e, f, g, h) {
    if (a === c && b === d || e === g && f === h) return {
        isSuccess: !1,
        value: 0
    };
    c -= a;
    d -= b;
    e -= a;
    f -= b;
    g -= a;
    h -= b;
    a = Math.sqrt(c * c + d * d);
    c /= a;
    d /= a;
    b = e * c + f * d;
    f = f * c - e * d;
    e = b;
    b = g * c + h * d;
    h = h * c - g * d;
    g = b;
    return f === h ? {
        isSuccess: !1,
        value: 0
    } : {
        isSuccess: !0,
        value: (g + (e - g) * h / (h - f)) / a
    }
};
cc.vertexListIsClockwise = function(a) {
    for (var b = 0, c = a.length; b < c; b++) {
        var d = a[(b + 1) % c],
            e = a[(b + 2) % c];
        if (0 < cc.pCross(cc.pSub(d, a[b]), cc.pSub(e, d))) return !1
    }
    return !0
};
cc.CGAffineToGL = function(a, b) {
    b[2] = b[3] = b[6] = b[7] = b[8] = b[9] = b[11] = b[14] = 0;
    b[10] = b[15] = 1;
    b[0] = a.a;
    b[4] = a.c;
    b[12] = a.tx;
    b[1] = a.b;
    b[5] = a.d;
    b[13] = a.ty
};
cc.GLToCGAffine = function(a, b) {
    b.a = a[0];
    b.c = a[4];
    b.tx = a[12];
    b.b = a[1];
    b.d = a[5];
    b.ty = a[13]
};
cc.Touch = cc.Class.extend({
    _lastModified: 0,
    _point: null,
    _prevPoint: null,
    _id: 0,
    _startPointCaptured: !1,
    _startPoint: null,
    ctor: function(a, b, c) {
        this.setTouchInfo(c, a, b)
    },
    getLocation: function() {
        return {
            x: this._point.x,
            y: this._point.y
        }
    },
    getLocationX: function() {
        return this._point.x
    },
    getLocationY: function() {
        return this._point.y
    },
    getPreviousLocation: function() {
        return {
            x: this._prevPoint.x,
            y: this._prevPoint.y
        }
    },
    getStartLocation: function() {
        return {
            x: this._startPoint.x,
            y: this._startPoint.y
        }
    },
    getDelta: function() {
        return cc.pSub(this._point,
            this._prevPoint)
    },
    getLocationInView: function() {
        return {
            x: this._point.x,
            y: this._point.y
        }
    },
    getPreviousLocationInView: function() {
        return {
            x: this._prevPoint.x,
            y: this._prevPoint.y
        }
    },
    getStartLocationInView: function() {
        return {
            x: this._startPoint.x,
            y: this._startPoint.y
        }
    },
    getID: function() {
        return this._id
    },
    getId: function() {
        cc.log("getId is deprecated. Please use getID instead.");
        return this._id
    },
    setTouchInfo: function(a, b, c) {
        this._prevPoint = this._point;
        this._point = cc.p(b || 0, c || 0);
        this._id = a;
        this._startPointCaptured ||
            (this._startPoint = cc.p(this._point), cc.view._convertPointWithScale(this._startPoint), this._startPointCaptured = !0)
    },
    _setPoint: function(a, b) {
        void 0 === b ? (this._point.x = a.x, this._point.y = a.y) : (this._point.x = a, this._point.y = b)
    },
    _setPrevPoint: function(a, b) {
        this._prevPoint = void 0 === b ? cc.p(a.x, a.y) : cc.p(a || 0, b || 0)
    }
});
cc.Event = cc.Class.extend({
    _type: 0,
    _isStopped: !1,
    _currentTarget: null,
    _setCurrentTarget: function(a) {
        this._currentTarget = a
    },
    ctor: function(a) {
        this._type = a
    },
    getType: function() {
        return this._type
    },
    stopPropagation: function() {
        this._isStopped = !0
    },
    isStopped: function() {
        return this._isStopped
    },
    getCurrentTarget: function() {
        return this._currentTarget
    }
});
cc.Event.TOUCH = 0;
cc.Event.KEYBOARD = 1;
cc.Event.ACCELERATION = 2;
cc.Event.MOUSE = 3;
cc.Event.FOCUS = 4;
cc.Event.CUSTOM = 6;
cc.EventCustom = cc.Event.extend({
    _eventName: null,
    _userData: null,
    ctor: function(a) {
        cc.Event.prototype.ctor.call(this, cc.Event.CUSTOM);
        this._eventName = a
    },
    setUserData: function(a) {
        this._userData = a
    },
    getUserData: function() {
        return this._userData
    },
    getEventName: function() {
        return this._eventName
    }
});
cc.EventMouse = cc.Event.extend({
    _eventType: 0,
    _button: 0,
    _x: 0,
    _y: 0,
    _prevX: 0,
    _prevY: 0,
    _scrollX: 0,
    _scrollY: 0,
    ctor: function(a) {
        cc.Event.prototype.ctor.call(this, cc.Event.MOUSE);
        this._eventType = a
    },
    setScrollData: function(a, b) {
        this._scrollX = a;
        this._scrollY = b
    },
    getScrollX: function() {
        return this._scrollX
    },
    getScrollY: function() {
        return this._scrollY
    },
    setLocation: function(a, b) {
        this._x = a;
        this._y = b
    },
    getLocation: function() {
        return {
            x: this._x,
            y: this._y
        }
    },
    getLocationInView: function() {
        return {
            x: this._x,
            y: cc.view._designResolutionSize.height -
                this._y
        }
    },
    _setPrevCursor: function(a, b) {
        this._prevX = a;
        this._prevY = b
    },
    getDelta: function() {
        return {
            x: this._x - this._prevX,
            y: this._y - this._prevY
        }
    },
    getDeltaX: function() {
        return this._x - this._prevX
    },
    getDeltaY: function() {
        return this._y - this._prevY
    },
    setButton: function(a) {
        this._button = a
    },
    getButton: function() {
        return this._button
    },
    getLocationX: function() {
        return this._x
    },
    getLocationY: function() {
        return this._y
    }
});
cc.EventMouse.NONE = 0;
cc.EventMouse.DOWN = 1;
cc.EventMouse.UP = 2;
cc.EventMouse.MOVE = 3;
cc.EventMouse.SCROLL = 4;
cc.EventMouse.BUTTON_LEFT = 0;
cc.EventMouse.BUTTON_RIGHT = 2;
cc.EventMouse.BUTTON_MIDDLE = 1;
cc.EventMouse.BUTTON_4 = 3;
cc.EventMouse.BUTTON_5 = 4;
cc.EventMouse.BUTTON_6 = 5;
cc.EventMouse.BUTTON_7 = 6;
cc.EventMouse.BUTTON_8 = 7;
cc.EventTouch = cc.Event.extend({
    _eventCode: 0,
    _touches: null,
    ctor: function(a) {
        cc.Event.prototype.ctor.call(this, cc.Event.TOUCH);
        this._touches = a || []
    },
    getEventCode: function() {
        return this._eventCode
    },
    getTouches: function() {
        return this._touches
    },
    _setEventCode: function(a) {
        this._eventCode = a
    },
    _setTouches: function(a) {
        this._touches = a
    }
});
cc.EventTouch.MAX_TOUCHES = 5;
cc.EventTouch.EventCode = {
    BEGAN: 0,
    MOVED: 1,
    ENDED: 2,
    CANCELLED: 3
};
cc.EventFocus = cc.Event.extend({
    _widgetGetFocus: null,
    _widgetLoseFocus: null,
    ctor: function(a, b) {
        cc.Event.prototype.ctor.call(this, cc.Event.FOCUS);
        this._widgetGetFocus = b;
        this._widgetLoseFocus = a
    }
});
cc.EventListener = cc.Class.extend({
    _onEvent: null,
    _type: 0,
    _listenerID: null,
    _registered: !1,
    _fixedPriority: 0,
    _node: null,
    _paused: !0,
    _isEnabled: !0,
    ctor: function(a, b, c) {
        this._onEvent = c;
        this._type = a || 0;
        this._listenerID = b || ""
    },
    _setPaused: function(a) {
        this._paused = a
    },
    _isPaused: function() {
        return this._paused
    },
    _setRegistered: function(a) {
        this._registered = a
    },
    _isRegistered: function() {
        return this._registered
    },
    _getType: function() {
        return this._type
    },
    _getListenerID: function() {
        return this._listenerID
    },
    _setFixedPriority: function(a) {
        this._fixedPriority =
            a
    },
    _getFixedPriority: function() {
        return this._fixedPriority
    },
    _setSceneGraphPriority: function(a) {
        this._node = a
    },
    _getSceneGraphPriority: function() {
        return this._node
    },
    checkAvailable: function() {
        return null !== this._onEvent
    },
    clone: function() {
        return null
    },
    setEnabled: function(a) {
        this._isEnabled = a
    },
    isEnabled: function() {
        return this._isEnabled
    },
    retain: function() {},
    release: function() {}
});
cc.EventListener.UNKNOWN = 0;
cc.EventListener.TOUCH_ONE_BY_ONE = 1;
cc.EventListener.TOUCH_ALL_AT_ONCE = 2;
cc.EventListener.KEYBOARD = 3;
cc.EventListener.MOUSE = 4;
cc.EventListener.ACCELERATION = 6;
cc.EventListener.FOCUS = 7;
cc.EventListener.CUSTOM = 8;
cc._EventListenerCustom = cc.EventListener.extend({
    _onCustomEvent: null,
    ctor: function(a, b) {
        this._onCustomEvent = b;
        var c = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, a, function(a) {
            null !== c._onCustomEvent && c._onCustomEvent(a)
        })
    },
    checkAvailable: function() {
        return cc.EventListener.prototype.checkAvailable.call(this) && null !== this._onCustomEvent
    },
    clone: function() {
        return new cc._EventListenerCustom(this._listenerID, this._onCustomEvent)
    }
});
cc._EventListenerCustom.create = function(a, b) {
    return new cc._EventListenerCustom(a, b)
};
cc._EventListenerMouse = cc.EventListener.extend({
    onMouseDown: null,
    onMouseUp: null,
    onMouseMove: null,
    onMouseScroll: null,
    ctor: function() {
        var a = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc._EventListenerMouse.LISTENER_ID, function(b) {
            var c = cc.EventMouse;
            switch (b._eventType) {
                case c.DOWN:
                    if (a.onMouseDown) a.onMouseDown(b);
                    break;
                case c.UP:
                    if (a.onMouseUp) a.onMouseUp(b);
                    break;
                case c.MOVE:
                    if (a.onMouseMove) a.onMouseMove(b);
                    break;
                case c.SCROLL:
                    if (a.onMouseScroll) a.onMouseScroll(b)
            }
        })
    },
    clone: function() {
        var a = new cc._EventListenerMouse;
        a.onMouseDown = this.onMouseDown;
        a.onMouseUp = this.onMouseUp;
        a.onMouseMove = this.onMouseMove;
        a.onMouseScroll = this.onMouseScroll;
        return a
    },
    checkAvailable: function() {
        return !0
    }
});
cc._EventListenerMouse.LISTENER_ID = "__cc_mouse";
cc._EventListenerMouse.create = function() {
    return new cc._EventListenerMouse
};
cc._EventListenerTouchOneByOne = cc.EventListener.extend({
    _claimedTouches: null,
    swallowTouches: !1,
    onTouchBegan: null,
    onTouchMoved: null,
    onTouchEnded: null,
    onTouchCancelled: null,
    ctor: function() {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc._EventListenerTouchOneByOne.LISTENER_ID, null);
        this._claimedTouches = []
    },
    setSwallowTouches: function(a) {
        this.swallowTouches = a
    },
    isSwallowTouches: function() {
        return this.swallowTouches
    },
    clone: function() {
        var a = new cc._EventListenerTouchOneByOne;
        a.onTouchBegan = this.onTouchBegan;
        a.onTouchMoved = this.onTouchMoved;
        a.onTouchEnded = this.onTouchEnded;
        a.onTouchCancelled = this.onTouchCancelled;
        a.swallowTouches = this.swallowTouches;
        return a
    },
    checkAvailable: function() {
        return this.onTouchBegan ? !0 : (cc.log(cc._LogInfos._EventListenerTouchOneByOne_checkAvailable), !1)
    }
});
cc._EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";
cc._EventListenerTouchOneByOne.create = function() {
    return new cc._EventListenerTouchOneByOne
};
cc._EventListenerTouchAllAtOnce = cc.EventListener.extend({
    onTouchesBegan: null,
    onTouchesMoved: null,
    onTouchesEnded: null,
    onTouchesCancelled: null,
    ctor: function() {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc._EventListenerTouchAllAtOnce.LISTENER_ID, null)
    },
    clone: function() {
        var a = new cc._EventListenerTouchAllAtOnce;
        a.onTouchesBegan = this.onTouchesBegan;
        a.onTouchesMoved = this.onTouchesMoved;
        a.onTouchesEnded = this.onTouchesEnded;
        a.onTouchesCancelled = this.onTouchesCancelled;
        return a
    },
    checkAvailable: function() {
        return null === this.onTouchesBegan && null === this.onTouchesMoved && null === this.onTouchesEnded && null === this.onTouchesCancelled ? (cc.log(cc._LogInfos._EventListenerTouchAllAtOnce_checkAvailable), !1) : !0
    }
});
cc._EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";
cc._EventListenerTouchAllAtOnce.create = function() {
    return new cc._EventListenerTouchAllAtOnce
};
cc.EventListener.create = function(a) {
    cc.assert(a && a.event, cc._LogInfos.EventListener_create);
    var b = a.event;
    delete a.event;
    var c = null;
    b === cc.EventListener.TOUCH_ONE_BY_ONE ? c = new cc._EventListenerTouchOneByOne : b === cc.EventListener.TOUCH_ALL_AT_ONCE ? c = new cc._EventListenerTouchAllAtOnce : b === cc.EventListener.MOUSE ? c = new cc._EventListenerMouse : b === cc.EventListener.CUSTOM ? (c = new cc._EventListenerCustom(a.eventName, a.callback), delete a.eventName, delete a.callback) : b === cc.EventListener.KEYBOARD ? c = new cc._EventListenerKeyboard :
        b === cc.EventListener.ACCELERATION ? (c = new cc._EventListenerAcceleration(a.callback), delete a.callback) : b === cc.EventListener.FOCUS && (c = new cc._EventListenerFocus);
    for (var d in a) c[d] = a[d];
    return c
};
cc._EventListenerFocus = cc.EventListener.extend({
    clone: function() {
        var a = new cc._EventListenerFocus;
        a.onFocusChanged = this.onFocusChanged;
        return a
    },
    checkAvailable: function() {
        return this.onFocusChanged ? !0 : (cc.log("Invalid EventListenerFocus!"), !1)
    },
    onFocusChanged: null,
    ctor: function() {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.FOCUS, cc._EventListenerFocus.LISTENER_ID, function(a) {
            if (this.onFocusChanged) this.onFocusChanged(a._widgetLoseFocus, a._widgetGetFocus)
        })
    }
});
cc._EventListenerFocus.LISTENER_ID = "__cc_focus_event";
(function() {
    function a(a) {
        var c = cc.Event,
            d = a._type;
        if (d === c.ACCELERATION) return cc._EventListenerAcceleration.LISTENER_ID;
        if (d === c.CUSTOM) return a._eventName;
        if (d === c.KEYBOARD) return cc._EventListenerKeyboard.LISTENER_ID;
        if (d === c.MOUSE) return cc._EventListenerMouse.LISTENER_ID;
        if (d === c.FOCUS) return cc._EventListenerFocus.LISTENER_ID;
        d === c.TOUCH && cc.log(cc._LogInfos.__getListenerID);
        return ""
    }
    cc._EventListenerVector = cc.Class.extend({
        _fixedListeners: null,
        _sceneGraphListeners: null,
        gt0Index: 0,
        ctor: function() {
            this._fixedListeners = [];
            this._sceneGraphListeners = []
        },
        size: function() {
            return this._fixedListeners.length + this._sceneGraphListeners.length
        },
        empty: function() {
            return 0 === this._fixedListeners.length && 0 === this._sceneGraphListeners.length
        },
        push: function(a) {
            0 === a._getFixedPriority() ? this._sceneGraphListeners.push(a) : this._fixedListeners.push(a)
        },
        clearSceneGraphListeners: function() {
            this._sceneGraphListeners.length = 0
        },
        clearFixedListeners: function() {
            this._fixedListeners.length = 0
        },
        clear: function() {
            this._sceneGraphListeners.length =
                0;
            this._fixedListeners.length = 0
        },
        getFixedPriorityListeners: function() {
            return this._fixedListeners
        },
        getSceneGraphPriorityListeners: function() {
            return this._sceneGraphListeners
        }
    });
    cc.eventManager = {
        DIRTY_NONE: 0,
        DIRTY_FIXED_PRIORITY: 1,
        DIRTY_SCENE_GRAPH_PRIORITY: 2,
        DIRTY_ALL: 3,
        _listenersMap: {},
        _priorityDirtyFlagMap: {},
        _nodeListenersMap: {},
        _nodePriorityMap: {},
        _globalZOrderNodeMap: {},
        _toAddedListeners: [],
        _toRemovedListeners: [],
        _dirtyNodes: [],
        _inDispatch: 0,
        _isEnabled: !1,
        _nodePriorityIndex: 0,
        _internalCustomListenerIDs: [cc.game.EVENT_HIDE,
            cc.game.EVENT_SHOW
        ],
        _setDirtyForNode: function(a) {
            null != this._nodeListenersMap[a.__instanceId] && this._dirtyNodes.push(a);
            a = a.getChildren();
            for (var c = 0, d = a.length; c < d; c++) this._setDirtyForNode(a[c])
        },
        pauseTarget: function(a, c) {
            var d = this._nodeListenersMap[a.__instanceId],
                e, f;
            if (d)
                for (e = 0, f = d.length; e < f; e++) d[e]._setPaused(!0);
            if (!0 === c)
                for (d = a.getChildren(), e = 0, f = d.length; e < f; e++) this.pauseTarget(d[e], !0)
        },
        resumeTarget: function(a, c) {
            var d = this._nodeListenersMap[a.__instanceId],
                e, f;
            if (d)
                for (e = 0, f = d.length; e <
                    f; e++) d[e]._setPaused(!1);
            this._setDirtyForNode(a);
            if (!0 === c)
                for (d = a.getChildren(), e = 0, f = d.length; e < f; e++) this.resumeTarget(d[e], !0)
        },
        _addListener: function(a) {
            0 === this._inDispatch ? this._forceAddEventListener(a) : this._toAddedListeners.push(a)
        },
        _forceAddEventListener: function(a) {
            var c = a._getListenerID(),
                d = this._listenersMap[c];
            d || (d = new cc._EventListenerVector, this._listenersMap[c] = d);
            d.push(a);
            0 === a._getFixedPriority() ? (this._setDirty(c, this.DIRTY_SCENE_GRAPH_PRIORITY), c = a._getSceneGraphPriority(),
                null === c && cc.log(cc._LogInfos.eventManager__forceAddEventListener), this._associateNodeAndEventListener(c, a), c.isRunning() && this.resumeTarget(c)) : this._setDirty(c, this.DIRTY_FIXED_PRIORITY)
        },
        _getListeners: function(a) {
            return this._listenersMap[a]
        },
        _updateDirtyFlagForSceneGraph: function() {
            if (0 !== this._dirtyNodes.length) {
                for (var a = this._dirtyNodes, c, d, e = this._nodeListenersMap, f = 0, g = a.length; f < g; f++)
                    if (c = e[a[f].__instanceId])
                        for (var h = 0, k = c.length; h < k; h++)(d = c[h]) && this._setDirty(d._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
                this._dirtyNodes.length = 0
            }
        },
        _removeAllListenersInVector: function(a) {
            if (a)
                for (var c, d = 0; d < a.length;) c = a[d], c._setRegistered(!1), null != c._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(c._getSceneGraphPriority(), c), c._setSceneGraphPriority(null)), 0 === this._inDispatch ? cc.arrayRemoveObject(a, c) : ++d
        },
        _removeListenersForListenerID: function(a) {
            var c = this._listenersMap[a];
            if (c) {
                var d = c.getFixedPriorityListeners(),
                    e = c.getSceneGraphPriorityListeners();
                this._removeAllListenersInVector(e);
                this._removeAllListenersInVector(d);
                delete this._priorityDirtyFlagMap[a];
                this._inDispatch || (c.clear(), delete this._listenersMap[a])
            }
            d = this._toAddedListeners;
            for (c = 0; c < d.length;)(e = d[c]) && e._getListenerID() === a ? cc.arrayRemoveObject(d, e) : ++c
        },
        _sortEventListeners: function(a) {
            var c = this.DIRTY_NONE,
                d = this._priorityDirtyFlagMap;
            d[a] && (c = d[a]);
            c !== this.DIRTY_NONE && (d[a] = this.DIRTY_NONE, c & this.DIRTY_FIXED_PRIORITY && this._sortListenersOfFixedPriority(a), c & this.DIRTY_SCENE_GRAPH_PRIORITY && ((c = cc.director.getRunningScene()) ? this._sortListenersOfSceneGraphPriority(a,
                c) : d[a] = this.DIRTY_SCENE_GRAPH_PRIORITY))
        },
        _sortListenersOfSceneGraphPriority: function(a, c) {
            var d = this._getListeners(a);
            if (d) {
                var e = d.getSceneGraphPriorityListeners();
                e && 0 !== e.length && (this._nodePriorityIndex = 0, this._nodePriorityMap = {}, this._visitTarget(c, !0), d.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes))
            }
        },
        _sortEventListenersOfSceneGraphPriorityDes: function(a, c) {
            var d = cc.eventManager._nodePriorityMap,
                e = a._getSceneGraphPriority(),
                f = c._getSceneGraphPriority();
            return c && f && d[f.__instanceId] ? a && e && d[e.__instanceId] ? d[c._getSceneGraphPriority().__instanceId] - d[a._getSceneGraphPriority().__instanceId] : 1 : -1
        },
        _sortListenersOfFixedPriority: function(a) {
            if (a = this._listenersMap[a]) {
                var c = a.getFixedPriorityListeners();
                if (c && 0 !== c.length) {
                    c.sort(this._sortListenersOfFixedPriorityAsc);
                    for (var d = 0, e = c.length; d < e && !(0 <= c[d]._getFixedPriority());) ++d;
                    a.gt0Index = d
                }
            }
        },
        _sortListenersOfFixedPriorityAsc: function(a, c) {
            return a._getFixedPriority() - c._getFixedPriority()
        },
        _onUpdateListeners: function(a) {
            var c =
                a.getFixedPriorityListeners(),
                d = a.getSceneGraphPriorityListeners(),
                e, f, g = this._toRemovedListeners;
            if (d)
                for (e = 0; e < d.length;) f = d[e], f._isRegistered() ? ++e : (cc.arrayRemoveObject(d, f), f = g.indexOf(f), -1 !== f && g.splice(f, 1));
            if (c)
                for (e = 0; e < c.length;) f = c[e], f._isRegistered() ? ++e : (cc.arrayRemoveObject(c, f), f = g.indexOf(f), -1 !== f && g.splice(f, 1));
            d && 0 === d.length && a.clearSceneGraphListeners();
            c && 0 === c.length && a.clearFixedListeners()
        },
        frameUpdateListeners: function() {
            var a = this._listenersMap,
                c = this._priorityDirtyFlagMap,
                d;
            for (d in a) a[d].empty() && (delete c[d], delete a[d]);
            a = this._toAddedListeners;
            if (0 !== a.length) {
                c = 0;
                for (d = a.length; c < d; c++) this._forceAddEventListener(a[c]);
                a.length = 0
            }
            0 !== this._toRemovedListeners.length && this._cleanToRemovedListeners()
        },
        _updateTouchListeners: function(a) {
            a = this._inDispatch;
            cc.assert(0 < a, cc._LogInfos.EventManager__updateListeners);
            if (!(1 < a)) {
                var c;
                (c = this._listenersMap[cc._EventListenerTouchOneByOne.LISTENER_ID]) && this._onUpdateListeners(c);
                (c = this._listenersMap[cc._EventListenerTouchAllAtOnce.LISTENER_ID]) &&
                this._onUpdateListeners(c);
                cc.assert(1 === a, cc._LogInfos.EventManager__updateListeners_2);
                a = this._toAddedListeners;
                if (0 !== a.length) {
                    c = 0;
                    for (var d = a.length; c < d; c++) this._forceAddEventListener(a[c]);
                    a.length = 0
                }
                0 !== this._toRemovedListeners.length && this._cleanToRemovedListeners()
            }
        },
        _cleanToRemovedListeners: function() {
            for (var a = this._toRemovedListeners, c = 0; c < a.length; c++) {
                var d = a[c],
                    e = this._listenersMap[d._getListenerID()];
                if (e) {
                    var f = e.getFixedPriorityListeners(),
                        g = e.getSceneGraphPriorityListeners();
                    g &&
                        (e = g.indexOf(d), -1 !== e && g.splice(e, 1));
                    f && (e = f.indexOf(d), -1 !== e && f.splice(e, 1))
                }
            }
            a.length = 0
        },
        _onTouchEventCallback: function(a, c) {
            if (!a._isRegistered) return !1;
            var d = c.event,
                e = c.selTouch;
            d._setCurrentTarget(a._node);
            var f = !1,
                g, h = d.getEventCode(),
                k = cc.EventTouch.EventCode;
            if (h === k.BEGAN) a.onTouchBegan && (f = a.onTouchBegan(e, d)) && a._registered && a._claimedTouches.push(e);
            else if (0 < a._claimedTouches.length && -1 !== (g = a._claimedTouches.indexOf(e)))
                if (f = !0, h === k.MOVED && a.onTouchMoved) a.onTouchMoved(e, d);
                else if (h ===
                k.ENDED) {
                if (a.onTouchEnded) a.onTouchEnded(e, d);
                a._registered && a._claimedTouches.splice(g, 1)
            } else if (h === k.CANCELLED) {
                if (a.onTouchCancelled) a.onTouchCancelled(e, d);
                a._registered && a._claimedTouches.splice(g, 1)
            }
            return d.isStopped() ? (cc.eventManager._updateTouchListeners(d), !0) : f && a._registered && a.swallowTouches ? (c.needsMutableSet && c.touches.splice(e, 1), !0) : !1
        },
        _dispatchTouchEvent: function(a) {
            this._sortEventListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
            this._sortEventListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
            var c = this._getListeners(cc._EventListenerTouchOneByOne.LISTENER_ID),
                d = this._getListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
            if (null !== c || null !== d) {
                var e = a.getTouches(),
                    f = cc.copyArray(e),
                    g = {
                        event: a,
                        needsMutableSet: c && d,
                        touches: f,
                        selTouch: null
                    };
                if (c)
                    for (var h = 0; h < e.length; h++)
                        if (g.selTouch = e[h], this._dispatchEventToListeners(c, this._onTouchEventCallback, g), a.isStopped()) return;
                if (d && 0 < f.length && (this._dispatchEventToListeners(d, this._onTouchesEventCallback, {
                        event: a,
                        touches: f
                    }), a.isStopped())) return;
                this._updateTouchListeners(a)
            }
        },
        _onTouchesEventCallback: function(a, c) {
            if (!a._registered) return !1;
            var d = cc.EventTouch.EventCode,
                e = c.event,
                f = c.touches,
                g = e.getEventCode();
            e._setCurrentTarget(a._node);
            if (g === d.BEGAN && a.onTouchesBegan) a.onTouchesBegan(f, e);
            else if (g === d.MOVED && a.onTouchesMoved) a.onTouchesMoved(f, e);
            else if (g === d.ENDED && a.onTouchesEnded) a.onTouchesEnded(f, e);
            else if (g === d.CANCELLED && a.onTouchesCancelled) a.onTouchesCancelled(f, e);
            return e.isStopped() ? (cc.eventManager._updateTouchListeners(e), !0) : !1
        },
        _associateNodeAndEventListener: function(a, c) {
            var d = this._nodeListenersMap[a.__instanceId];
            d || (d = [], this._nodeListenersMap[a.__instanceId] = d);
            d.push(c)
        },
        _dissociateNodeAndEventListener: function(a, c) {
            var d = this._nodeListenersMap[a.__instanceId];
            d && (cc.arrayRemoveObject(d, c), 0 === d.length && delete this._nodeListenersMap[a.__instanceId])
        },
        _dispatchEventToListeners: function(a, c, d) {
            var e = !1,
                f = a.getFixedPriorityListeners(),
                g = a.getSceneGraphPriorityListeners(),
                h = 0,
                k;
            if (f && 0 !== f.length)
                for (; h < a.gt0Index; ++h)
                    if (k =
                        f[h], k.isEnabled() && !k._isPaused() && k._isRegistered() && c(k, d)) {
                        e = !0;
                        break
                    }
            if (g && !e)
                for (a = 0; a < g.length; a++)
                    if (k = g[a], k.isEnabled() && !k._isPaused() && k._isRegistered() && c(k, d)) {
                        e = !0;
                        break
                    }
            if (f && !e)
                for (; h < f.length && (k = f[h], !k.isEnabled() || k._isPaused() || !k._isRegistered() || !c(k, d)); ++h);
        },
        _setDirty: function(a, c) {
            var d = this._priorityDirtyFlagMap;
            d[a] = null == d[a] ? c : c | d[a]
        },
        _visitTarget: function(a, c) {
            var d = a.getChildren(),
                e = 0,
                f = d.length,
                g = this._globalZOrderNodeMap,
                h = this._nodeListenersMap;
            if (0 < f) {
                for (var k; e <
                    f; e++)
                    if ((k = d[e]) && 0 > k.getLocalZOrder()) this._visitTarget(k, !1);
                    else break;
                null != h[a.__instanceId] && (g[a.getGlobalZOrder()] || (g[a.getGlobalZOrder()] = []), g[a.getGlobalZOrder()].push(a.__instanceId));
                for (; e < f; e++)(k = d[e]) && this._visitTarget(k, !1)
            } else null != h[a.__instanceId] && (g[a.getGlobalZOrder()] || (g[a.getGlobalZOrder()] = []), g[a.getGlobalZOrder()].push(a.__instanceId));
            if (c) {
                var d = [],
                    m;
                for (m in g) d.push(m);
                d.sort(this._sortNumberAsc);
                m = d.length;
                k = this._nodePriorityMap;
                for (e = 0; e < m; e++)
                    for (f = g[d[e]],
                        h = 0; h < f.length; h++) k[f[h]] = ++this._nodePriorityIndex;
                this._globalZOrderNodeMap = {}
            }
        },
        _sortNumberAsc: function(a, c) {
            return a - c
        },
        addListener: function(a, c) {
            cc.assert(a && c, cc._LogInfos.eventManager_addListener_2);
            if (!(a instanceof cc.EventListener)) cc.assert(!cc.isNumber(c), cc._LogInfos.eventManager_addListener_3), a = cc.EventListener.create(a);
            else if (a._isRegistered()) {
                cc.log(cc._LogInfos.eventManager_addListener_4);
                return
            }
            if (a.checkAvailable()) {
                if (cc.isNumber(c)) {
                    if (0 === c) {
                        cc.log(cc._LogInfos.eventManager_addListener);
                        return
                    }
                    a._setSceneGraphPriority(null);
                    a._setFixedPriority(c);
                    a._setRegistered(!0);
                    a._setPaused(!1)
                } else a._setSceneGraphPriority(c), a._setFixedPriority(0), a._setRegistered(!0);
                this._addListener(a);
                return a
            }
        },
        addCustomListener: function(a, c) {
            var d = new cc._EventListenerCustom(a, c);
            this.addListener(d, 1);
            return d
        },
        removeListener: function(a) {
            if (null != a) {
                var c, d = this._listenersMap,
                    e;
                for (e in d) {
                    var f = d[e],
                        g = f.getFixedPriorityListeners();
                    c = f.getSceneGraphPriorityListeners();
                    (c = this._removeListenerInVector(c,
                        a)) ? this._setDirty(a._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY): (c = this._removeListenerInVector(g, a)) && this._setDirty(a._getListenerID(), this.DIRTY_FIXED_PRIORITY);
                    f.empty() && (delete this._priorityDirtyFlagMap[a._getListenerID()], delete d[e]);
                    if (c) break
                }
                if (!c)
                    for (d = this._toAddedListeners, e = 0, f = d.length; e < f; e++)
                        if (g = d[e], g === a) {
                            cc.arrayRemoveObject(d, g);
                            g._setRegistered(!1);
                            break
                        }
            }
        },
        _removeListenerInCallback: function(a, c) {
            if (null == a) return !1;
            for (var d = 0, e = a.length; d < e; d++) {
                var f = a[d];
                if (f._onCustomEvent ===
                    c || f._onEvent === c) return f._setRegistered(!1), null != f._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(f._getSceneGraphPriority(), f), f._setSceneGraphPriority(null)), 0 === this._inDispatch && cc.arrayRemoveObject(a, f), !0
            }
            return !1
        },
        _removeListenerInVector: function(a, c) {
            if (null == a) return !1;
            for (var d = 0, e = a.length; d < e; d++) {
                var f = a[d];
                if (f === c) return f._setRegistered(!1), null != f._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(f._getSceneGraphPriority(), f), f._setSceneGraphPriority(null)),
                    0 === this._inDispatch ? cc.arrayRemoveObject(a, f) : this._toRemovedListeners.push(f), !0
            }
            return !1
        },
        removeListeners: function(a, c) {
            if (a instanceof cc.Node) {
                delete this._nodePriorityMap[a.__instanceId];
                cc.arrayRemoveObject(this._dirtyNodes, a);
                var d = this._nodeListenersMap[a.__instanceId];
                if (d) {
                    for (var e = cc.copyArray(d), d = 0; d < e.length; d++) this.removeListener(e[d]);
                    e.length = 0
                }
                e = this._toAddedListeners;
                for (d = 0; d < e.length;) {
                    var f = e[d];
                    f._getSceneGraphPriority() === a ? (f._setSceneGraphPriority(null), f._setRegistered(!1),
                        e.splice(d, 1)) : ++d
                }
                if (!0 === c)
                    for (e = a.getChildren(), d = 0, f = e.length; d < f; d++) this.removeListeners(e[d], !0)
            } else a === cc.EventListener.TOUCH_ONE_BY_ONE ? this._removeListenersForListenerID(cc._EventListenerTouchOneByOne.LISTENER_ID) : a === cc.EventListener.TOUCH_ALL_AT_ONCE ? this._removeListenersForListenerID(cc._EventListenerTouchAllAtOnce.LISTENER_ID) : a === cc.EventListener.MOUSE ? this._removeListenersForListenerID(cc._EventListenerMouse.LISTENER_ID) : a === cc.EventListener.ACCELERATION ? this._removeListenersForListenerID(cc._EventListenerAcceleration.LISTENER_ID) :
                a === cc.EventListener.KEYBOARD ? this._removeListenersForListenerID(cc._EventListenerKeyboard.LISTENER_ID) : cc.log(cc._LogInfos.eventManager_removeListeners)
        },
        removeCustomListeners: function(a) {
            this._removeListenersForListenerID(a)
        },
        removeAllListeners: function() {
            var a = this._listenersMap,
                c = this._internalCustomListenerIDs,
                d;
            for (d in a) - 1 === c.indexOf(d) && this._removeListenersForListenerID(d)
        },
        setPriority: function(a, c) {
            if (null != a) {
                var d = this._listenersMap,
                    e;
                for (e in d) {
                    var f = d[e].getFixedPriorityListeners();
                    if (f && -1 !== f.indexOf(a)) {
                        null != a._getSceneGraphPriority() && cc.log(cc._LogInfos.eventManager_setPriority);
                        a._getFixedPriority() !== c && (a._setFixedPriority(c), this._setDirty(a._getListenerID(), this.DIRTY_FIXED_PRIORITY));
                        break
                    }
                }
            }
        },
        setEnabled: function(a) {
            this._isEnabled = a
        },
        isEnabled: function() {
            return this._isEnabled
        },
        dispatchEvent: function(b) {
            if (this._isEnabled) {
                this._updateDirtyFlagForSceneGraph();
                this._inDispatch++;
                if (!b || !b.getType) throw Error("event is undefined");
                if (b._type === cc.Event.TOUCH) this._dispatchTouchEvent(b);
                else {
                    var c = a(b);
                    this._sortEventListeners(c);
                    if (c = this._listenersMap[c]) this._dispatchEventToListeners(c, this._onListenerCallback, b), this._onUpdateListeners(c)
                }
                this._inDispatch--
            }
        },
        _onListenerCallback: function(a, c) {
            c._setCurrentTarget(a._getSceneGraphPriority());
            a._onEvent(c);
            return c.isStopped()
        },
        dispatchCustomEvent: function(a, c) {
            var d = new cc.EventCustom(a);
            d.setUserData(c);
            this.dispatchEvent(d)
        }
    }
})();
cc.EventAcceleration = cc.Event.extend({
    _acc: null,
    ctor: function(a) {
        cc.Event.prototype.ctor.call(this, cc.Event.ACCELERATION);
        this._acc = a
    }
});
cc.EventKeyboard = cc.Event.extend({
    _keyCode: 0,
    _isPressed: !1,
    ctor: function(a, b) {
        cc.Event.prototype.ctor.call(this, cc.Event.KEYBOARD);
        this._keyCode = a;
        this._isPressed = b
    }
});
cc._EventListenerAcceleration = cc.EventListener.extend({
    _onAccelerationEvent: null,
    ctor: function(a) {
        this._onAccelerationEvent = a;
        var b = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.ACCELERATION, cc._EventListenerAcceleration.LISTENER_ID, function(a) {
            b._onAccelerationEvent(a._acc, a)
        })
    },
    checkAvailable: function() {
        cc.assert(this._onAccelerationEvent, cc._LogInfos._EventListenerAcceleration_checkAvailable);
        return !0
    },
    clone: function() {
        return new cc._EventListenerAcceleration(this._onAccelerationEvent)
    }
});
cc._EventListenerAcceleration.LISTENER_ID = "__cc_acceleration";
cc._EventListenerAcceleration.create = function(a) {
    return new cc._EventListenerAcceleration(a)
};
cc._EventListenerKeyboard = cc.EventListener.extend({
    onKeyPressed: null,
    onKeyReleased: null,
    ctor: function() {
        var a = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.KEYBOARD, cc._EventListenerKeyboard.LISTENER_ID, function(b) {
            if (b._isPressed) {
                if (a.onKeyPressed) a.onKeyPressed(b._keyCode, b)
            } else if (a.onKeyReleased) a.onKeyReleased(b._keyCode, b)
        })
    },
    clone: function() {
        var a = new cc._EventListenerKeyboard;
        a.onKeyPressed = this.onKeyPressed;
        a.onKeyReleased = this.onKeyReleased;
        return a
    },
    checkAvailable: function() {
        return null ===
            this.onKeyPressed && null === this.onKeyReleased ? (cc.log(cc._LogInfos._EventListenerKeyboard_checkAvailable), !1) : !0
    }
});
cc._EventListenerKeyboard.LISTENER_ID = "__cc_keyboard";
cc._EventListenerKeyboard.create = function() {
    return new cc._EventListenerKeyboard
};
var GlobalVertexBuffer = function() {
    var a = function(a, c) {
        this.gl = a;
        this.vertexBuffer = a.createBuffer();
        this.size = 888;
        this.byteLength = c || 3552 * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this.data = new ArrayBuffer(this.byteLength);
        this.dataArray = new Float32Array(this.data);
        a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer);
        a.bufferData(a.ARRAY_BUFFER, this.dataArray, a.DYNAMIC_DRAW);
        this._dirty = !1;
        this._spaces = {
            0: this.byteLength
        }
    };
    a.prototype = {
        constructor: a,
        allocBuffer: function(a, c) {
            var d = this._spaces[a];
            return d &&
                d >= c ? (delete this._spaces[a], d > c && (this._spaces[a + c] = d - c), !0) : !1
        },
        requestBuffer: function(a) {
            var c, d, e;
            for (c in this._spaces)
                if (d = parseInt(c), e = this._spaces[c], e >= a && this.allocBuffer(d, a)) return d;
            return -1
        },
        freeBuffer: function(a, c) {
            var d = this._spaces,
                e, f;
            for (f in d) {
                e = parseInt(f);
                if (e > a) break;
                if (e + d[f] >= a) {
                    c = c + a - e;
                    a = e;
                    break
                }
            }
            d = a + c;
            this._spaces[d] && (c += this._spaces[d], delete this._spaces[d]);
            this._spaces[a] = c
        },
        setDirty: function() {
            this._dirty = !0
        },
        update: function() {
            this._dirty && (this.gl.bindBuffer(gl.ARRAY_BUFFER,
                this.vertexBuffer), this.gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dataArray), this._dirty = !1)
        },
        updateSubData: function(a, c) {
            this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.bufferSubData(gl.ARRAY_BUFFER, a, c)
        },
        destroy: function() {
            this.gl.deleteBuffer(this.vertexBuffer);
            this.vertexBuffer = this.texCoords = this.colors = this.positions = this.data = null
        }
    };
    return a
}();
cc.rendererCanvas = {
    childrenOrderDirty: !0,
    assignedZ: 0,
    assignedZStep: 1E-4,
    _transformNodePool: [],
    _renderCmds: [],
    _isCacheToCanvasOn: !1,
    _cacheToCanvasCmds: {},
    _cacheInstanceIds: [],
    _currentID: 0,
    _clearColor: cc.color(),
    _clearFillStyle: "rgb(0, 0, 0)",
    _dirtyRegion: null,
    _allNeedDraw: !0,
    _enableDirtyRegion: !1,
    _debugDirtyRegion: !1,
    _canUseDirtyRegion: !1,
    _dirtyRegionCountThreshold: 10,
    getRenderCmd: function(a) {
        return a._createRenderCmd()
    },
    enableDirtyRegion: function(a) {
        this._enableDirtyRegion = a
    },
    isDirtyRegionEnabled: function() {
        return this._enableDirtyRegion
    },
    setDirtyRegionCountThreshold: function(a) {
        this._dirtyRegionCountThreshold = a
    },
    _collectDirtyRegion: function() {
        var a = this._renderCmds,
            b, c, d = this._dirtyRegion,
            e = 0,
            f = !0,
            g = cc.Node.CanvasRenderCmd.RegionStatus;
        b = 0;
        for (c = a.length; b < c; b++) {
            var h = a[b],
                k = h._oldRegion,
                m = h._currentRegion;
            h._regionFlag > g.NotDirty && (++e, e > this._dirtyRegionCountThreshold && (f = !1), f && (!m.isEmpty() && d.addRegion(m), h._regionFlag > g.Dirty && !k.isEmpty() && d.addRegion(k)), h._regionFlag = g.NotDirty)
        }
        return f
    },
    _beginDrawDirtyRegion: function(a) {
        var b =
            a.getContext(),
            c = this._dirtyRegion.getDirtyRegions();
        b.save();
        a.setTransform({
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            tx: 0,
            ty: 0
        }, a._scaleX, a._scaleY);
        b.beginPath();
        a = 0;
        for (var d = c.length; a < d; ++a) {
            var e = c[a];
            b.rect(e._minX, -e._maxY, e._width, e._height)
        }
        b.clip()
    },
    _endDrawDirtyRegion: function(a) {
        a.restore()
    },
    _debugDrawDirtyRegion: function(a) {
        if (this._debugDirtyRegion) {
            var b = a.getContext(),
                c = this._dirtyRegion.getDirtyRegions();
            a.setTransform({
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: 0,
                ty: 0
            }, a._scaleX, a._scaleY);
            b.beginPath();
            a = 0;
            for (var d = c.length; a <
                d; ++a) {
                var e = c[a];
                b.rect(e._minX, -e._maxY, e._width, e._height)
            }
            c = b.fillStyle;
            b.fillStyle = "green";
            b.fill();
            b.fillStyle = c
        }
    },
    rendering: function(a) {
        var b = this._dirtyRegion = this._dirtyRegion || new cc.DirtyRegion,
            c = cc._canvas;
        a = a || cc._renderContext;
        var d = a.getContext(),
            e = cc.view.getScaleX(),
            f = cc.view.getScaleY();
        a.setViewScale(e, f);
        a.computeRealOffsetY();
        var g = this._dirtyRegion.getDirtyRegions(),
            h = this._renderCmds,
            k, m = this._allNeedDraw || !this._enableDirtyRegion || !this._canUseDirtyRegion;
        k = !0;
        m || (k = this._collectDirtyRegion());
        (m = m || !k) || this._beginDrawDirtyRegion(a);
        d.setTransform(1, 0, 0, 1, 0, 0);
        d.clearRect(0, 0, c.width, c.height);
        if (0 !== this._clearColor.r || 0 !== this._clearColor.g || 0 !== this._clearColor.b) a.setFillStyle(this._clearFillStyle), a.setGlobalAlpha(this._clearColor.a), d.fillRect(0, 0, c.width, c.height);
        c = 0;
        for (k = h.length; c < k; c++) {
            var n = h[c],
                p = !1,
                r = n._currentRegion;
            if (!r || m) p = !0;
            else
                for (var s = 0, u = g.length; s < u; ++s)
                    if (g[s].intersects(r)) {
                        p = !0;
                        break
                    }
            p && n.rendering(a, e, f)
        }
        m || (this._debugDrawDirtyRegion(a), this._endDrawDirtyRegion(d));
        b.clear();
        this._allNeedDraw = !1
    },
    _renderingToCacheCanvas: function(a, b, c, d) {
        a || cc.log("The context of RenderTexture is invalid.");
        c = cc.isUndefined(c) ? 1 : c;
        d = cc.isUndefined(d) ? 1 : d;
        b = b || this._currentID;
        var e, f = this._cacheToCanvasCmds[b],
            g;
        a.computeRealOffsetY();
        e = 0;
        for (g = f.length; e < g; e++) f[e].rendering(a, c, d);
        this._removeCache(b);
        a = this._cacheInstanceIds;
        0 === a.length ? this._isCacheToCanvasOn = !1 : this._currentID = a[a.length - 1]
    },
    _turnToCacheMode: function(a) {
        this._isCacheToCanvasOn = !0;
        a = a || 0;
        this._cacheToCanvasCmds[a] = []; - 1 === this._cacheInstanceIds.indexOf(a) && this._cacheInstanceIds.push(a);
        this._currentID = a
    },
    _turnToNormalMode: function() {
        this._isCacheToCanvasOn = !1
    },
    _removeCache: function(a) {
        a = a || this._currentID;
        var b = this._cacheToCanvasCmds[a];
        b && (b.length = 0, delete this._cacheToCanvasCmds[a]);
        cc.arrayRemoveObject(this._cacheInstanceIds, a)
    },
    resetFlag: function() {
        this.childrenOrderDirty = !1;
        this._transformNodePool.length = 0
    },
    transform: function() {
        var a = this._transformNodePool;
        a.sort(this._sortNodeByLevelAsc);
        for (var b =
                0, c = a.length; b < c; b++) 0 !== a[b]._dirtyFlag && a[b].updateStatus();
        a.length = 0
    },
    transformDirty: function() {
        return 0 < this._transformNodePool.length
    },
    _sortNodeByLevelAsc: function(a, b) {
        return a._curLevel - b._curLevel
    },
    pushDirtyNode: function(a) {
        this._transformNodePool.push(a)
    },
    clear: function() {},
    clearRenderCommands: function() {
        this._renderCmds.length = 0;
        this._cacheInstanceIds.length = 0;
        this._isCacheToCanvasOn = !1;
        this._canUseDirtyRegion = this._allNeedDraw = !0
    },
    pushRenderCommand: function(a) {
        if (a.needDraw())
            if (a._canUseDirtyRegion ||
                (this._canUseDirtyRegion = !1), this._isCacheToCanvasOn) {
                var b = this._cacheToCanvasCmds[this._currentID]; - 1 === b.indexOf(a) && b.push(a)
            } else -1 === this._renderCmds.indexOf(a) && this._renderCmds.push(a)
    }
};
(function() {
    cc.CanvasContextWrapper = function(a) {
        this._context = a;
        this._saveCount = 0;
        this._currentAlpha = a.globalAlpha;
        this._currentCompositeOperation = a.globalCompositeOperation;
        this._currentFillStyle = a.fillStyle;
        this._currentStrokeStyle = a.strokeStyle;
        this._offsetY = this._offsetX = 0;
        this._realOffsetY = this.height;
        this._armatureMode = 0
    };
    var a = cc.CanvasContextWrapper.prototype;
    a.resetCache = function() {
        var a = this._context;
        this._currentAlpha = a.globalAlpha;
        this._currentCompositeOperation = a.globalCompositeOperation;
        this._currentFillStyle = a.fillStyle;
        this._currentStrokeStyle = a.strokeStyle;
        this._realOffsetY = this._context.canvas.height + this._offsetY
    };
    a.setOffset = function(a, c) {
        this._offsetX = a;
        this._offsetY = c;
        this._realOffsetY = this._context.canvas.height + this._offsetY
    };
    a.computeRealOffsetY = function() {
        this._realOffsetY = this._context.canvas.height + this._offsetY
    };
    a.setViewScale = function(a, c) {
        this._scaleX = a;
        this._scaleY = c
    };
    a.getContext = function() {
        return this._context
    };
    a.save = function() {
        this._context.save();
        this._saveCount++
    };
    a.restore = function() {
        this._context.restore();
        this._saveCount--
    };
    a.setGlobalAlpha = function(a) {
        0 < this._saveCount ? this._context.globalAlpha = a : this._currentAlpha !== a && (this._currentAlpha = a, this._context.globalAlpha = a)
    };
    a.setCompositeOperation = function(a) {
        0 < this._saveCount ? this._context.globalCompositeOperation = a : this._currentCompositeOperation !== a && (this._currentCompositeOperation = a, this._context.globalCompositeOperation = a)
    };
    a.setFillStyle = function(a) {
        0 < this._saveCount ? this._context.fillStyle = a : this._currentFillStyle !==
            a && (this._currentFillStyle = a, this._context.fillStyle = a)
    };
    a.setStrokeStyle = function(a) {
        0 < this._saveCount ? this._context.strokeStyle = a : this._currentStrokeStyle !== a && (this._currentStrokeStyle = a, this._context.strokeStyle = a)
    };
    a.setTransform = function(a, c, d) {
        0 < this._armatureMode ? (this.restore(), this.save(), this._context.transform(a.a * c, -a.b * d, -a.c * c, a.d * d, a.tx * c, -(a.ty * d))) : this._context.setTransform(a.a * c, -a.b * d, -a.c * c, a.d * d, this._offsetX + a.tx * c, this._realOffsetY - a.ty * d)
    };
    a._switchToArmatureMode = function(a,
        c, d, e) {
        a ? (this._armatureMode++, this._context.setTransform(c.a, c.c, c.b, c.d, this._offsetX + c.tx * d, this._realOffsetY - c.ty * e), this.save()) : (this._armatureMode--, this.restore())
    }
})();
cc.rendererWebGL = function() {
    var a = {
            texture: null,
            blendSrc: null,
            blendDst: null,
            shader: null
        },
        b = null,
        c = null,
        d = 0,
        e = 0,
        f = null,
        g = 0,
        h = null,
        k = null;
    return {
        mat4Identity: null,
        childrenOrderDirty: !0,
        assignedZ: 0,
        assignedZStep: 0.01,
        _transformNodePool: [],
        _renderCmds: [],
        _isCacheToBufferOn: !1,
        _cacheToBufferCmds: {},
        _cacheInstanceIds: [],
        _currentID: 0,
        _clearColor: cc.color(),
        init: function() {
            var a = cc._renderContext;
            a.disable(a.CULL_FACE);
            a.disabl
e(a.DEPTH_TEST);
            this.mat4Identity = new cc.math.Matrix4;
            this.mat4Identity.identity();
            a = cc._renderContext;
            null === b && (c = a.createBuffer(), b = a.createBuffer());
            a = cc._renderContext;
            if (b) {
                a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, b);
                for (var e = new Uint16Array(3E3), p = 0, r = 0; 3E3 > r; r += 6) e[r] = p + 0, e[r + 1] = p + 1, e[r + 2] = p + 2, e[r + 3] = p + 1, e[r + 4] = p + 2, e[r + 5] = p + 3, p += 4;
                a.bufferData(a.ELEMENT_ARRAY_BUFFER, e, a.STATIC_DRAW)
            }
            c && (g = 12E3, f = new ArrayBuffer(4 * g), h = new Float32Array(f), k = new Uint32Array(f), a.bindBuffer(a.ARRAY_BUFFER, c), a.bufferData(a.ARRAY_BUFFER, h, a.DYNAMIC_DRAW));
            d = 2E3
        },
        getVertexSize: function() {
            return d
        },
        getRenderCmd: function(a) {
            return a._createRenderCmd()
        },
        _turnToCacheMode: function(a) {
            this._isCacheToBufferOn = !0;
            a = a || 0;
            this._cacheToBufferCmds[a] ? this._cacheToBufferCmds[a].length = 0 : this._cacheToBufferCmds[a] = []; - 1 === this._cacheInstanceIds.indexOf(a) && this._cacheInstanceIds.push(a);
            this._currentID = a
        },
        _turnToNormalMode: function() {
            this._isCacheToBufferOn = !1
        },
        _removeCache: function(a) {
            a = a || this._currentID;
            var b = this._cacheToBufferCmds[a];
            b && (b.length = 0, delete this._cacheToBufferCmds[a]);
            cc.arrayRemoveObject(this._cacheInstanceIds,
                a)
        },
        _renderingToBuffer: function(a) {
            a = a || this._currentID;
            this.rendering(cc._renderContext, this._cacheToBufferCmds[a]);
            this._removeCache(a);
            a = this._cacheInstanceIds;
            0 === a.length ? this._isCacheToBufferOn = !1 : this._currentID = a[a.length - 1]
        },
        resetFlag: function() {
            this.childrenOrderDirty && (this.childrenOrderDirty = !1);
            this._transformNodePool.length = 0
        },
        transform: function() {
            var a = this._transformNodePool;
            a.sort(this._sortNodeByLevelAsc);
            var b, c, d;
            b = 0;
            for (c = a.length; b < c; b++) d = a[b], d.updateStatus();
            a.length = 0
        },
        transformDirty: function() {
            return 0 <
                this._transformNodePool.length
        },
        _sortNodeByLevelAsc: function(a, b) {
            return a._curLevel - b._curLevel
        },
        pushDirtyNode: function(a) {
            this._transformNodePool.push(a)
        },
        clearRenderCommands: function() {
            this._renderCmds.length = 0
        },
        clear: function() {
            var a = cc._renderContext;
            a.clearColor(this._clearColor.r / 255, this._clearColor.g / 255, this._clearColor.b / 255, this._clearColor.a / 255);
            a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT)
        },
        setDepthTest: function(a) {
            var b = cc._renderContext;
            a ? (b.clearDepth(1), b.enable(b.DEPTH_TEST),
                b.depthFunc(b.LEQUAL)) : b.disable(b.DEPTH_TEST)
        },
        pushRenderCommand: function(a) {
            if (a.needDraw())
                if (this._isCacheToBufferOn) {
                    var b = this._cacheToBufferCmds[this._currentID]; - 1 === b.indexOf(a) && b.push(a)
                } else -1 === this._renderCmds.indexOf(a) && this._renderCmds.push(a)
        },
        _increaseBatchingSize: function(a) {
            e += a
        },
        _uploadBufferData: function(b) {
            e >= d && this._batchRendering();
            var c = b._node,
                f = c._texture || (c._spriteFrame ? c._spriteFrame._texture : null);
            if (f) {
                var g = c._blendFunc.src,
                    c = c._blendFunc.dst,
                    s = b._shaderProgram;
                if (a.texture !== f || a.blendSrc !== g || a.blendDst !== c || a.shader !== s) this._batchRendering(), a.texture = f, a.blendSrc = g, a.blendDst = c, a.shader = s;
                b = b.uploadData(h, k, 6 * e);
                0 < b && (e += b)
            }
        },
        _batchRendering: function() {
            if (0 !== e && a.texture) {
                var f = cc._renderContext,
                    g = a.texture,
                    k = a.shader,
                    r = e / 4;
                k && (k.use(), k._updateProjectionUniform());
                cc.glBlendFunc(a.blendSrc, a.blendDst);
                cc.glBindTexture2DN(0, g);
                f.bindBuffer(f.ARRAY_BUFFER, c);
                e > 0.5 * d ? f.bufferData(f.ARRAY_BUFFER, h, f.DYNAMIC_DRAW) : (g = h.subarray(0, 6 * e), f.bufferData(f.ARRAY_BUFFER,
                    g, f.DYNAMIC_DRAW));
                f.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
                f.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
                f.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
                f.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, f.FLOAT, !1, 24, 0);
                f.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, f.UNSIGNED_BYTE, !0, 24, 12);
                f.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, f.FLOAT, !1, 24, 16);
                f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, b);
                f.drawElements(f.TRIANGLES, 6 * r, f.UNSIGNED_SHORT, 0);
                cc.g_NumberOfDraws++;
                e = 0
            }
        },
        rendering: function(b, c) {
            var d = c || this._renderCmds,
                f, g, h, k = b || cc._renderContext;
            k.bindBuffer(gl.ARRAY_BUFFER, null);
            f = 0;
            for (g = d.length; f < g; ++f) h = d[f], h.uploadData ? this._uploadBufferData(h) : (0 < e && this._batchRendering(), h.rendering(k));
            this._batchRendering();
            a.texture = null
        }
    }
}();
var Region = function() {
        this._area = this._height = this._width = this._maxY = this._maxX = this._minY = this._minX = 0
    },
    regionProto = Region.prototype,
    regionPool = [];

function regionCreate() {
    var a = regionPool.pop();
    a || (a = new Region);
    return a
}

function regionRelease(a) {
    regionPool.push(a)
}
regionProto.setTo = function(a, b, c, d) {
    this._minX = a;
    this._minY = b;
    this._maxX = c;
    this._maxY = d;
    this.updateArea();
    return this
};
regionProto.intValues = function() {
    this._minX = Math.floor(this._minX);
    this._minY = Math.floor(this._minY);
    this._maxX = Math.ceil(this._maxX);
    this._maxY = Math.ceil(this._maxY);
    this.updateArea()
};
regionProto.updateArea = function() {
    this._width = this._maxX - this._minX;
    this._height = this._maxY - this._minY;
    this._area = this._width * this._height
};
regionProto.union = function(a) {
    0 >= this._width || 0 >= this._height ? this.setTo(a._minX, a._minY, a._maxX, a._maxY) : (this._minX > a._minX && (this._minX = a._minX), this._minY > a._minY && (this._minY = a._minY), this._maxX < a._maxX && (this._maxX = a._maxX), this._maxY < a._maxY && (this._maxY = a._maxY), this.updateArea())
};
regionProto.setEmpty = function() {
    this._area = this._height = this._width = this._maxY = this._maxX = this._minY = this._minX = 0
};
regionProto.isEmpty = function() {
    return 0 >= this._width || 0 >= this._height
};
regionProto.intersects = function(a) {
    if (0 >= this._width || 0 >= this._height || 0 >= a._width || 0 >= a._height) return !1;
    var b = this._minX > a._minX ? this._minX : a._minX,
        c = this._maxX < a._maxX ? this._maxX : a._maxX;
    if (b > c) return !1;
    b = this._minY > a._minY ? this._minY : a._minY;
    c = this._maxY < a._maxY ? this._maxY : a._maxY;
    return b <= c
};
regionProto.updateRegion = function(a, b) {
    if (0 == a.width || 0 == a.height) this.setEmpty();
    else {
        var c = b.a,
            d = b.b,
            e = b.c,
            f = b.d,
            g = b.tx,
            h = b.ty,
            k = a.x,
            m = a.y,
            n = k + a.width,
            p = m + a.height,
            r, s, u;
        if (1 == c && 0 == d && 0 == e && 1 == f) r = k + g - 1, s = m + h - 1, u = n + g + 1, m = p + h + 1;
        else {
            r = c * k + e * m + g;
            s = d * k + f * m + h;
            u = c * n + e * m + g;
            var m = d * n + f * m + h,
                t = c * n + e * p + g,
                n = d * n + f * p + h,
                g = c * k + e * p + g,
                h = d * k + f * p + h,
                p = 0;
            r > u && (p = r, r = u, u = p);
            t > g && (p = t, t = g, g = p);
            r = (r < t ? r : t) - 1;
            u = (u > g ? u : g) + 1;
            s > m && (p = s, s = m, m = p);
            n > h && (p = n, n = h, h = p);
            s = (s < n ? s : n) - 1;
            m = (m > h ? m : h) + 1
        }
        this._minX = r;
        this._minY = s;
        this._maxX =
            u;
        this._maxY = m;
        this._width = u - r;
        this._height = m - s;
        this._area = this._width * this._height
    }
};

function unionArea(a, b) {
    return ((a._maxX > b._maxX ? a._maxX : b._maxX) - (a._minX < b._minX ? a._minX : b._minX)) * ((a._maxY > b._maxY ? a._maxY : b._maxY) - (a._minY < b._minY ? a._minY : b._minY))
}
var DirtyRegion = function() {
        this.dirtyList = [];
        this.hasClipRect = !1;
        this.clipArea = this.clipHeight = this.clipWidth = 0;
        this.clipRectChanged = !1
    },
    dirtyRegionProto = DirtyRegion.prototype;
dirtyRegionProto.setClipRect = function(a, b) {
    this.clipRectChanged = this.hasClipRect = !0;
    this.clipWidth = Math.ceil(a);
    this.clipHeight = Math.ceil(b);
    this.clipArea = this.clipWidth * this.clipHeight
};
dirtyRegionProto.addRegion = function(a) {
    var b = a._minX,
        c = a._minY,
        d = a._maxX;
    a = a._maxY;
    this.hasClipRect && (0 > b && (b = 0), 0 > c && (c = 0), d > this.clipWidth && (d = this.clipWidth), a > this.clipHeight && (a = this.clipHeight));
    if (b >= d || c >= a) return !1;
    if (this.clipRectChanged) return !0;
    var e = this.dirtyList,
        f = regionCreate();
    e.push(f.setTo(b, c, d, a));
    this.mergeDirtyList(e);
    return !0
};
dirtyRegionProto.clear = function() {
    for (var a = this.dirtyList, b = a.length, c = 0; c < b; c++) regionRelease(a[c]);
    a.length = 0
};
dirtyRegionProto.getDirtyRegions = function() {
    var a = this.dirtyList;
    if (this.clipRectChanged) {
        this.clipRectChanged = !1;
        this.clear();
        var b = regionCreate();
        a.push(b.setTo(0, 0, this.clipWidth, this.clipHeight))
    } else
        for (; this.mergeDirtyList(a););
    a = this.dirtyList.length;
    if (0 < a)
        for (b = 0; b < a; b++) this.dirtyList[b].intValues();
    return this.dirtyList
};
dirtyRegionProto.mergeDirtyList = function(a) {
    var b = a.length;
    if (2 > b) return !1;
    for (var c = this.hasClipRect, d = 3 < b ? Number.POSITIVE_INFINITY : 0, e = 0, f = 0, g = 0, h = 0; h < b - 1; h++) {
        var k = a[h];
        c && (g += k.area);
        for (var m = h + 1; m < b; m++) {
            var n = a[m],
                n = unionArea(k, n) - k.area - n.area;
            d > n && (e = h, f = m, d = n)
        }
    }
    c && 0.95 < g / this.clipArea && (this.clipRectChanged = !0);
    return e != f ? (b = a[f], a[e].union(b), regionRelease(b), a.splice(f, 1), !0) : !1
};
cc.Region = Region;
cc.DirtyRegion = DirtyRegion;
cc._tmp.PrototypeCCNode = function() {
    var a = cc.Node.prototype;
    cc.defineGetterSetter(a, "x", a.getPositionX, a.setPositionX);
    cc.defineGetterSetter(a, "y", a.getPositionY, a.setPositionY);
    cc.defineGetterSetter(a, "width", a._getWidth, a._setWidth);
    cc.defineGetterSetter(a, "height", a._getHeight, a._setHeight);
    cc.defineGetterSetter(a, "anchorX", a._getAnchorX, a._setAnchorX);
    cc.defineGetterSetter(a, "anchorY", a._getAnchorY, a._setAnchorY);
    cc.defineGetterSetter(a, "skewX", a.getSkewX, a.setSkewX);
    cc.defineGetterSetter(a, "skewY",
        a.getSkewY, a.setSkewY);
    cc.defineGetterSetter(a, "zIndex", a.getLocalZOrder, a.setLocalZOrder);
    cc.defineGetterSetter(a, "vertexZ", a.getVertexZ, a.setVertexZ);
    cc.defineGetterSetter(a, "rotation", a.getRotation, a.setRotation);
    cc.defineGetterSetter(a, "rotationX", a.getRotationX, a.setRotationX);
    cc.defineGetterSetter(a, "rotationY", a.getRotationY, a.setRotationY);
    cc.defineGetterSetter(a, "scale", a.getScale, a.setScale);
    cc.defineGetterSetter(a, "scaleX", a.getScaleX, a.setScaleX);
    cc.defineGetterSetter(a, "scaleY", a.getScaleY,
        a.setScaleY);
    cc.defineGetterSetter(a, "children", a.getChildren);
    cc.defineGetterSetter(a, "childrenCount", a.getChildrenCount);
    cc.defineGetterSetter(a, "parent", a.getParent, a.setParent);
    cc.defineGetterSetter(a, "visible", a.isVisible, a.setVisible);
    cc.defineGetterSetter(a, "running", a.isRunning);
    cc.defineGetterSetter(a, "ignoreAnchor", a.isIgnoreAnchorPointForPosition, a.ignoreAnchorPointForPosition);
    cc.defineGetterSetter(a, "actionManager", a.getActionManager, a.setActionManager);
    cc.defineGetterSetter(a, "scheduler",
        a.getScheduler, a.setScheduler);
    cc.defineGetterSetter(a, "shaderProgram", a.getShaderProgram, a.setShaderProgram);
    cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
    cc.defineGetterSetter(a, "opacityModifyRGB", a.isOpacityModifyRGB);
    cc.defineGetterSetter(a, "cascadeOpacity", a.isCascadeOpacityEnabled, a.setCascadeOpacityEnabled);
    cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
    cc.defineGetterSetter(a, "cascadeColor", a.isCascadeColorEnabled, a.setCascadeColorEnabled)
};
cc.NODE_TAG_INVALID = -1;
cc.s_globalOrderOfArrival = 1;
cc.Node = cc.Class.extend({
    _localZOrder: 0,
    _globalZOrder: 0,
    _vertexZ: 0,
    _customZ: NaN,
    _rotationX: 0,
    _rotationY: 0,
    _scaleX: 1,
    _scaleY: 1,
    _position: null,
    _normalizedPosition: null,
    _usingNormalizedPosition: !1,
    _normalizedPositionDirty: !1,
    _skewX: 0,
    _skewY: 0,
    _children: null,
    _visible: !0,
    _anchorPoint: null,
    _contentSize: null,
    _running: !1,
    _parent: null,
    _ignoreAnchorPointForPosition: !1,
    tag: cc.NODE_TAG_INVALID,
    userData: null,
    userObject: null,
    _reorderChildDirty: !1,
    arrivalOrder: 0,
    _actionManager: null,
    _scheduler: null,
    _additionalTransformDirty: !1,
    _additionalTransform: null,
    _componentContainer: null,
    _isTransitionFinished: !1,
    _className: "Node",
    _showNode: !1,
    _name: "",
    _realOpacity: 255,
    _realColor: null,
    _cascadeColorEnabled: !1,
    _cascadeOpacityEnabled: !1,
    _renderCmd: null,
    ctor: function() {
        this._anchorPoint = cc.p(0, 0);
        this._contentSize = cc.size(0, 0);
        this._position = cc.p(0, 0);
        this._normalizedPosition = cc.p(0, 0);
        this._children = [];
        this._additionalTransform = cc.affineTransformMakeIdentity();
        cc.ComponentContainer && (this._componentContainer = new cc.ComponentContainer(this));
        this._realColor = cc.color(255, 255, 255, 255);
        this._renderCmd = this._createRenderCmd()
    },
    init: function() {
        return !0
    },
    attr: function(a) {
        for (var b in a) this[b] = a[b]
    },
    getSkewX: function() {
        return this._skewX
    },
    setSkewX: function(a) {
        this._skewX = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getSkewY: function() {
        return this._skewY
    },
    setSkewY: function(a) {
        this._skewY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setLocalZOrder: function(a) {
        this._parent ? this._parent.reorderChild(this,
            a) : this._localZOrder = a;
        cc.eventManager._setDirtyForNode(this)
    },
    _setLocalZOrder: function(a) {
        this._localZOrder = a
    },
    getLocalZOrder: function() {
        return this._localZOrder
    },
    getZOrder: function() {
        cc.log(cc._LogInfos.Node_getZOrder);
        return this.getLocalZOrder()
    },
    setZOrder: function(a) {
        cc.log(cc._LogInfos.Node_setZOrder);
        this.setLocalZOrder(a)
    },
    setGlobalZOrder: function(a) {
        this._globalZOrder !== a && (this._globalZOrder = a, cc.eventManager._setDirtyForNode(this))
    },
    getGlobalZOrder: function() {
        return this._globalZOrder
    },
    getVertexZ: function() {
        return this._vertexZ
    },
    setVertexZ: function(a) {
        this._customZ = this._vertexZ = a
    },
    getRotation: function() {
        this._rotationX !== this._rotationY && cc.log(cc._LogInfos.Node_getRotation);
        return this._rotationX
    },
    setRotation: function(a) {
        this._rotationX = this._rotationY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getRotationX: function() {
        return this._rotationX
    },
    setRotationX: function(a) {
        this._rotationX = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getRotationY: function() {
        return this._rotationY
    },
    setRotationY: function(a) {
        this._rotationY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getScale: function() {
        this._scaleX !== this._scaleY && cc.log(cc._LogInfos.Node_getScale);
        return this._scaleX
    },
    setScale: function(a, b) {
        this._scaleX = a;
        this._scaleY = b || 0 === b ? b : a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getScaleX: function() {
        return this._scaleX
    },
    setScaleX: function(a) {
        this._scaleX = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getScaleY: function() {
        return this._scaleY
    },
    setScaleY: function(a) {
        this._scaleY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setPosition: function(a, b) {
        var c = this._position;
        if (void 0 === b) {
            if (c.x === a.x && c.y === a.y) return;
            c.x = a.x;
            c.y = a.y
        } else {
            if (c.x === a && c.y === b) return;
            c.x = a;
            c.y = b
        }
        this._usingNormalizedPosition = !1;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setNormalizedPosition: function(a, b) {
        var c = this._normalizedPosition;
        void 0 === b ? (c.x = a.x, c.y = a.y) : (c.x = a, c.y = b);
        this._normalizedPositionDirty = this._usingNormalizedPosition = !0;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getPosition: function() {
        return cc.p(this._position)
    },
    getNormalizedPosition: function() {
        return cc.p(this._normalizedPosition)
    },
    getPositionX: function() {
        return this._position.x
    },
    setPositionX: function(a) {
        this._position.x = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getPositionY: function() {
        return this._position.y
    },
    setPositionY: function(a) {
        this._position.y = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getChildrenCount: function() {
        return this._children.length
    },
    getChildren: function() {
        return this._children
    },
    isVisible: function() {
        return this._visible
    },
    setVisible: function(a) {
        this._visible !== a && (this._visible = a, this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty), cc.renderer.childrenOrderDirty = !0)
    },
    getAnchorPoint: function() {
        return cc.p(this._anchorPoint)
    },
    setAnchorPoint: function(a, b) {
        var c = this._anchorPoint;
        if (void 0 === b) {
            if (a.x === c.x && a.y === c.y) return;
            c.x = a.x;
            c.y = a.y
        } else {
            if (a === c.x && b ===
                c.y) return;
            c.x = a;
            c.y = b
        }
        this._renderCmd._updateAnchorPointInPoint()
    },
    _getAnchorX: function() {
        return this._anchorPoint.x
    },
    _setAnchorX: function(a) {
        this._anchorPoint.x !== a && (this._anchorPoint.x = a, this._renderCmd._updateAnchorPointInPoint())
    },
    _getAnchorY: function() {
        return this._anchorPoint.y
    },
    _setAnchorY: function(a) {
        this._anchorPoint.y !== a && (this._anchorPoint.y = a, this._renderCmd._updateAnchorPointInPoint())
    },
    getAnchorPointInPoints: function() {
        return this._renderCmd.getAnchorPointInPoints()
    },
    _getWidth: function() {
        return this._contentSize.width
    },
    _setWidth: function(a) {
        this._contentSize.width = a;
        this._renderCmd._updateAnchorPointInPoint()
    },
    _getHeight: function() {
        return this._contentSize.height
    },
    _setHeight: function(a) {
        this._contentSize.height = a;
        this._renderCmd._updateAnchorPointInPoint()
    },
    getContentSize: function() {
        return cc.size(this._contentSize)
    },
    setContentSize: function(a, b) {
        var c = this._contentSize;
        if (void 0 === b) {
            if (a.width === c.width && a.height === c.height) return;
            c.width = a.width;
            c.height = a.height
        } else {
            if (a === c.width && b === c.height) return;
            c.width =
                a;
            c.height = b
        }
        this._renderCmd._updateAnchorPointInPoint()
    },
    isRunning: function() {
        return this._running
    },
    getParent: function() {
        return this._parent
    },
    setParent: function(a) {
        this._parent = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    isIgnoreAnchorPointForPosition: function() {
        return this._ignoreAnchorPointForPosition
    },
    ignoreAnchorPointForPosition: function(a) {
        a !== this._ignoreAnchorPointForPosition && (this._ignoreAnchorPointForPosition = a, this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty))
    },
    getTag: function() {
        return this.tag
    },
    setTag: function(a) {
        this.tag = a
    },
    setName: function(a) {
        this._name = a
    },
    getName: function() {
        return this._name
    },
    getUserData: function() {
        return this.userData
    },
    setUserData: function(a) {
        this.userData = a
    },
    getUserObject: function() {
        return this.userObject
    },
    setUserObject: function(a) {
        this.userObject !== a && (this.userObject = a)
    },
    getOrderOfArrival: function() {
        return this.arrivalOrder
    },
    setOrderOfArrival: function(a) {
        this.arrivalOrder = a
    },
    getActionManager: function() {
        return this._actionManager ||
            cc.director.getActionManager()
    },
    setActionManager: function(a) {
        this._actionManager !== a && (this.stopAllActions(), this._actionManager = a)
    },
    getScheduler: function() {
        return this._scheduler || cc.director.getScheduler()
    },
    setScheduler: function(a) {
        this._scheduler !== a && (this.unscheduleAllCallbacks(), this._scheduler = a)
    },
    boundingBox: function() {
        cc.log(cc._LogInfos.Node_boundingBox);
        return this.getBoundingBox()
    },
    getBoundingBox: function() {
        var a = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc._rectApplyAffineTransformIn(a,
            this.getNodeToParentTransform())
    },
    cleanup: function() {
        this.stopAllActions();
        this.unscheduleAllCallbacks();
        cc.eventManager.removeListeners(this)
    },
    getChildByTag: function(a) {
        var b = this._children;
        if (null !== b)
            for (var c = 0; c < b.length; c++) {
                var d = b[c];
                if (d && d.tag === a) return d
            }
        return null
    },
    getChildByName: function(a) {
        if (!a) return cc.log("Invalid name"), null;
        for (var b = this._children, c = 0, d = b.length; c < d; c++)
            if (b[c]._name === a) return b[c];
        return null
    },
    addChild: function(a, b, c) {
        b = void 0 === b ? a._localZOrder : b;
        var d, e = !1;
        void 0 === c ? d = a._name : "string" === typeof c ? (d = c, c = void 0) : "number" === typeof c && (e = !0, d = "");
        cc.assert(a, cc._LogInfos.Node_addChild_3);
        cc.assert(null === a._parent, "child already added. It can't be added again");
        this._addChildHelper(a, b, c, d, e)
    },
    _addChildHelper: function(a, b, c, d, e) {
        this._children || (this._children = []);
        this._insertChild(a, b);
        e ? a.setTag(c) : a.setName(d);
        a.setParent(this);
        a.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        this._running && (a._performRecursive(cc.Node._stateCallbackType.onEnter),
            this._isTransitionFinished && a._performRecursive(cc.Node._stateCallbackType.onEnterTransitionDidFinish));
        a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        this._cascadeColorEnabled && a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
        this._cascadeOpacityEnabled && a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    removeFromParent: function(a) {
        this._parent && (void 0 === a && (a = !0), this._parent.removeChild(this, a))
    },
    removeFromParentAndCleanup: function(a) {
        cc.log(cc._LogInfos.Node_removeFromParentAndCleanup);
        this.removeFromParent(a)
    },
    removeChild: function(a, b) {
        0 !== this._children.length && (void 0 === b && (b = !0), -1 < this._children.indexOf(a) && this._detachChild(a, b), cc.renderer.childrenOrderDirty = !0)
    },
    removeChildByTag: function(a, b) {
        a === cc.NODE_TAG_INVALID && cc.log(cc._LogInfos.Node_removeChildByTag);
        var c = this.getChildByTag(a);
        c ? this.removeChild(c, b) : cc.log(cc._LogInfos.Node_removeChildByTag_2, a)
    },
    removeAllChildrenWithCleanup: function(a) {
        this.removeAllChildren(a)
    },
    removeAllChildren: function(a) {
        var b = this._children;
        if (null !== b) {
            void 0 === a && (a = !0);
            for (var c = 0; c < b.length; c++) {
                var d = b[c];
                d && (this._running && (d._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart), d._performRecursive(cc.Node._stateCallbackType.onExit)), a && d._performRecursive(cc.Node._stateCallbackType.cleanup), d.parent = null, d._renderCmd.detachFromParent())
            }
            this._children.length = 0;
            cc.renderer.childrenOrderDirty = !0
        }
    },
    _detachChild: function(a, b) {
        this._running && (a._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart),
            a._performRecursive(cc.Node._stateCallbackType.onExit));
        b && a._performRecursive(cc.Node._stateCallbackType.cleanup);
        a.parent = null;
        a._renderCmd.detachFromParent();
        cc.arrayRemoveObject(this._children, a)
    },
    _insertChild: function(a, b) {
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = !0;
        this._children.push(a);
        a._setLocalZOrder(b)
    },
    setNodeDirty: function() {
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    reorderChild: function(a, b) {
        cc.assert(a, cc._LogInfos.Node_reorderChild); - 1 === this._children.indexOf(a) ?
            cc.log(cc._LogInfos.Node_reorderChild_2) : b !== a.zIndex && (cc.renderer.childrenOrderDirty = this._reorderChildDirty = !0, a.arrivalOrder = cc.s_globalOrderOfArrival, cc.s_globalOrderOfArrival++, a._setLocalZOrder(b), this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.orderDirty))
    },
    sortAllChildren: function() {
        if (this._reorderChildDirty) {
            var a = this._children,
                b = a.length,
                c, d, e;
            for (c = 1; c < b; c++) {
                e = a[c];
                for (d = c - 1; 0 <= d;) {
                    if (e._localZOrder < a[d]._localZOrder) a[d + 1] = a[d];
                    else if (e._localZOrder === a[d]._localZOrder && e.arrivalOrder <
                        a[d].arrivalOrder) a[d + 1] = a[d];
                    else break;
                    d--
                }
                a[d + 1] = e
            }
            this._reorderChildDirty = !1
        }
    },
    draw: function(a) {},
    transformAncestors: function() {
        null !== this._parent && (this._parent.transformAncestors(), this._parent.transform())
    },
    onEnter: function() {
        this._isTransitionFinished = !1;
        this._running = !0;
        this.resume()
    },
    _performRecursive: function(a) {
        var b = cc.Node._stateCallbackType;
        if (!(a >= b.max)) {
            var c = 0,
                d, e, f, g, h, k = cc.Node._performStacks[cc.Node._performing];
            k || (k = [], cc.Node._performStacks.push(k));
            k.length = 0;
            cc.Node._performing++;
            for (f = k[0] = this; f;) {
                if ((d = f._children) && 0 < d.length)
                    for (g = 0, h = d.length; g < h; ++g) e = d[g], k.push(e);
                if ((d = f._protectedChildren) && 0 < d.length)
                    for (g = 0, h = d.length; g < h; ++g) e = d[g], k.push(e);
                c++;
                f = k[c]
            }
            for (g = k.length - 1; 0 <= g; --g)
                if (f = k[g], k[g] = null, f) switch (a) {
                    case b.onEnter:
                        f.onEnter();
                        break;
                    case b.onExit:
                        f.onExit();
                        break;
                    case b.onEnterTransitionDidFinish:
                        f.onEnterTransitionDidFinish();
                        break;
                    case b.cleanup:
                        f.cleanup();
                        break;
                    case b.onExitTransitionDidStart:
                        f.onExitTransitionDidStart()
                }
                cc.Node._performing--
        }
    },
    onEnterTransitionDidFinish: function() {
        this._isTransitionFinished = !0
    },
    onExitTransitionDidStart: function() {},
    onExit: function() {
        this._running = !1;
        this.pause();
        this.removeAllComponents()
    },
    runAction: function(a) {
        cc.assert(a, cc._LogInfos.Node_runAction);
        this.actionManager.addAction(a, this, !this._running);
        return a
    },
    stopAllActions: function() {
        this.actionManager && this.actionManager.removeAllActionsFromTarget(this)
    },
    stopAction: function(a) {
        this.actionManager.removeAction(a)
    },
    stopActionByTag: function(a) {
        a === cc.ACTION_TAG_INVALID ?
            cc.log(cc._LogInfos.Node_stopActionByTag) : this.actionManager.removeActionByTag(a, this)
    },
    getActionByTag: function(a) {
        return a === cc.ACTION_TAG_INVALID ? (cc.log(cc._LogInfos.Node_getActionByTag), null) : this.actionManager.getActionByTag(a, this)
    },
    getNumberOfRunningActions: function() {
        return this.actionManager.numberOfRunningActionsInTarget(this)
    },
    scheduleUpdate: function() {
        this.scheduleUpdateWithPriority(0)
    },
    scheduleUpdateWithPriority: function(a) {
        this.scheduler.scheduleUpdate(this, a, !this._running)
    },
    unscheduleUpdate: function() {
        this.scheduler.unscheduleUpdate(this)
    },
    schedule: function(a, b, c, d, e) {
        var f = arguments.length;
        "function" === typeof a ? 1 === f ? (b = 0, c = cc.REPEAT_FOREVER, d = 0, e = this.__instanceId) : 2 === f ? "number" === typeof b ? (c = cc.REPEAT_FOREVER, d = 0, e = this.__instanceId) : (e = b, b = 0, c = cc.REPEAT_FOREVER, d = 0) : 3 === f ? ("string" === typeof c ? (e = c, c = cc.REPEAT_FOREVER) : e = this.__instanceId, d = 0) : 4 === f && (e = this.__instanceId) : 1 === f ? (b = 0, c = cc.REPEAT_FOREVER, d = 0) : 2 === f && (c = cc.REPEAT_FOREVER, d = 0);
        cc.assert(a, cc._LogInfos.Node_schedule);
        cc.assert(0 <= b, cc._LogInfos.Node_schedule_2);
        b = b ||
            0;
        c = isNaN(c) ? cc.REPEAT_FOREVER : c;
        this.scheduler.schedule(a, this, b, c, d || 0, !this._running, e)
    },
    scheduleOnce: function(a, b, c) {
        void 0 === c && (c = this.__instanceId);
        this.schedule(a, 0, 0, b, c)
    },
    unschedule: function(a) {
        a && this.scheduler.unschedule(a, this)
    },
    unscheduleAllCallbacks: function() {
        this.scheduler.unscheduleAllForTarget(this)
    },
    resumeSchedulerAndActions: function() {
        cc.log(cc._LogInfos.Node_resumeSchedulerAndActions);
        this.resume()
    },
    resume: function() {
        this.scheduler.resumeTarget(this);
        this.actionManager && this.actionManager.resumeTarget(this);
        cc.eventManager.resumeTarget(this)
    },
    pauseSchedulerAndActions: function() {
        cc.log(cc._LogInfos.Node_pauseSchedulerAndActions);
        this.pause()
    },
    pause: function() {
        this.scheduler.pauseTarget(this);
        this.actionManager && this.actionManager.pauseTarget(this);
        cc.eventManager.pauseTarget(this)
    },
    setAdditionalTransform: function(a) {
        if (void 0 === a) return this._additionalTransformDirty = !1;
        this._additionalTransform = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        this._additionalTransformDirty = !0
    },
    getParentToNodeTransform: function() {
        return this._renderCmd.getParentToNodeTransform()
    },
    parentToNodeTransform: function() {
        return this.getParentToNodeTransform()
    },
    getNodeToWorldTransform: function() {
        for (var a = this.getNodeToParentTransform(), b = this._parent; null !== b; b = b.parent) a = cc.affineTransformConcat(a, b.getNodeToParentTransform());
        return a
    },
    nodeToWorldTransform: function() {
        return this.getNodeToWorldTransform()
    },
    getWorldToNodeTransform: function() {
        return cc.affineTransformInvert(this.getNodeToWorldTransform())
    },
    worldToNodeTransform: function() {
        return this.getWorldToNodeTransform()
    },
    convertToNodeSpace: function(a) {
        return cc.pointApplyAffineTransform(a,
            this.getWorldToNodeTransform())
    },
    convertToWorldSpace: function(a) {
        a = a || cc.p(0, 0);
        return cc.pointApplyAffineTransform(a, this.getNodeToWorldTransform())
    },
    convertToNodeSpaceAR: function(a) {
        return cc.pSub(this.convertToNodeSpace(a), this._renderCmd.getAnchorPointInPoints())
    },
    convertToWorldSpaceAR: function(a) {
        a = a || cc.p(0, 0);
        a = cc.pAdd(a, this._renderCmd.getAnchorPointInPoints());
        return this.convertToWorldSpace(a)
    },
    _convertToWindowSpace: function(a) {
        a = this.convertToWorldSpace(a);
        return cc.director.convertToUI(a)
    },
    convertTouchToNodeSpace: function(a) {
        a = a.getLocation();
        return this.convertToNodeSpace(a)
    },
    convertTouchToNodeSpaceAR: function(a) {
        a = cc.director.convertToGL(a.getLocation());
        return this.convertToNodeSpaceAR(a)
    },
    update: function(a) {
        this._componentContainer && !this._componentContainer.isEmpty() && this._componentContainer.visit(a)
    },
    updateTransform: function() {
        for (var a = this._children, b = 0; b < a.length; b++) varnode = a[b]
    },
    retain: function() {},
    release: function() {},
    getComponent: function(a) {
        return this._componentContainer ?
            this._componentContainer.getComponent(a) : null
    },
    addComponent: function(a) {
        this._componentContainer && this._componentContainer.add(a)
    },
    removeComponent: function(a) {
        return this._componentContainer ? this._componentContainer.remove(a) : !1
    },
    removeAllComponents: function() {
        this._componentContainer && this._componentContainer.removeAll()
    },
    grid: null,
    visit: function(a) {
        if (this._visible) {
            var b = cc.renderer,
                c = this._renderCmd;
            c.visit(a && a._renderCmd);
            var d = this._children,
                e = d.length,
                f;
            if (0 < e) {
                this._reorderChildDirty && this.sortAllChildren();
                for (a = 0; a < e; a++)
                    if (f = d[a], 0 > f._localZOrder) f.visit(this);
                    else break;
                for (b.pushRenderCommand(c); a < e; a++) d[a].visit(this)
            } else b.pushRenderCommand(c);
            c._dirtyFlag = 0
        }
    },
    transform: function(a, b) {
        this._renderCmd.transform(a, b)
    },
    nodeToParentTransform: function() {
        return this.getNodeToParentTransform()
    },
    getNodeToParentTransform: function(a) {
        var b = this._renderCmd.getNodeToParentTransform();
        if (a)
            for (var b = {
                    a: b.a,
                    b: b.b,
                    c: b.c,
                    d: b.d,
                    tx: b.tx,
                    ty: b.ty
                }, c = this._parent; null != c && c != a; c = c.getParent()) cc.affineTransformConcatIn(b,
                c.getNodeToParentTransform());
        return b
    },
    getNodeToParentAffineTransform: function(a) {
        return this.getNodeToParentTransform(a)
    },
    getCamera: function() {
        return null
    },
    getGrid: function() {
        return this.grid
    },
    setGrid: function(a) {
        this.grid = a
    },
    getShaderProgram: function() {
        return this._renderCmd.getShaderProgram()
    },
    setShaderProgram: function(a) {
        this._renderCmd.setShaderProgram(a)
    },
    getGLServerState: function() {
        return 0
    },
    setGLServerState: function(a) {},
    getBoundingBoxToWorld: function() {
        var a = cc.rect(0, 0, this._contentSize.width,
                this._contentSize.height),
            b = this.getNodeToWorldTransform(),
            a = cc.rectApplyAffineTransform(a, b);
        if (!this._children) return a;
        for (var c = this._children, d = 0; d < c.length; d++) {
            var e = c[d];
            e && e._visible && (e = e._getBoundingBoxToCurrentNode(b)) && (a = cc.rectUnion(a, e))
        }
        return a
    },
    _getBoundingBoxToCurrentNode: function(a) {
        var b = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        a = void 0 === a ? this.getNodeToParentTransform() : cc.affineTransformConcat(this.getNodeToParentTransform(), a);
        b = cc.rectApplyAffineTransform(b,
            a);
        if (!this._children) return b;
        for (var c = this._children, d = 0; d < c.length; d++) {
            var e = c[d];
            e && e._visible && (e = e._getBoundingBoxToCurrentNode(a)) && (b = cc.rectUnion(b, e))
        }
        return b
    },
    getOpacity: function() {
        return this._realOpacity
    },
    getDisplayedOpacity: function() {
        return this._renderCmd.getDisplayedOpacity()
    },
    setOpacity: function(a) {
        this._realOpacity = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    updateDisplayedOpacity: function(a) {
        this._renderCmd._updateDisplayOpacity(a)
    },
    isCascadeOpacityEnabled: function() {
        return this._cascadeOpacityEnabled
    },
    setCascadeOpacityEnabled: function(a) {
        this._cascadeOpacityEnabled !== a && (this._cascadeOpacityEnabled = a, this._renderCmd.setCascadeOpacityEnabledDirty())
    },
    getColor: function() {
        var a = this._realColor;
        return cc.color(a.r, a.g, a.b, a.a)
    },
    getDisplayedColor: function() {
        return this._renderCmd.getDisplayedColor()
    },
    setColor: function(a) {
        var b = this._realColor;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty)
    },
    updateDisplayedColor: function(a) {
        this._renderCmd._updateDisplayColor(a)
    },
    isCascadeColorEnabled: function() {
        return this._cascadeColorEnabled
    },
    setCascadeColorEnabled: function(a) {
        this._cascadeColorEnabled !== a && (this._cascadeColorEnabled = a, this._renderCmd.setCascadeColorEnabledDirty())
    },
    setOpacityModifyRGB: function(a) {},
    isOpacityModifyRGB: function() {
        return !1
    },
    _createRenderCmd: function() {
        return cc._renderType === cc.game.RENDER_TYPE_CANVAS ? new cc.Node.CanvasRenderCmd(this) : new cc.Node.WebGLRenderCmd(this)
    },
    enumerateChildren: function(a, b) {
        cc.assert(a && 0 != a.length, "Invalid name");
        cc.assert(null != b, "Invalid callback function");
        var c = a.length,
            d = 0,
            e = c,
            f = !1;
        2 < c && "/" === a[0] && "/" === a[1] && (f = !0, d = 2, e -= 2);
        var g = !1;
        3 < c && "/" === a[c - 3] && "." === a[c - 2] && "." === a[c - 1] && (g = !0, e -= 3);
        c = a.substr(d, e);
        g && (c = "[[:alnum:]]+/" + c);
        f ? this.doEnumerateRecursive(this, c, b) : this.doEnumerate(c, b)
    },
    doEnumerateRecursive: function(a, b, c) {
        var d = !1;
        if (a.doEnumerate(b, c)) d = !0;
        else
            for (var e = a.getChildren(), f = e.length, g = 0; g < f; g++)
                if (a = e[g], this.doEnumerateRecursive(a, b, c)) {
                    d = !0;
                    break
                } return d
    },
    doEnumerate: function(a,
        b) {
        var c = a.indexOf("/"),
            d = a,
            e = !1; - 1 !== c && (d = a.substr(0, c), e = !0);
        for (var c = !1, f, g = this._children, h = g.length, k = 0; k < h; k++)
            if (f = g[k], -1 !== f._name.indexOf(d))
                if (e) {
                    if (c = f.doEnumerate(a, b)) break
                } else if (b(f)) {
            c = !0;
            break
        }
        return c
    }
});
cc.Node.create = function() {
    return new cc.Node
};
cc.Node._stateCallbackType = {
    onEnter: 1,
    onExit: 2,
    cleanup: 3,
    onEnterTransitionDidFinish: 4,
    onExitTransitionDidStart: 5,
    max: 6
};
cc.Node._performStacks = [
    []
];
cc.Node._performing = 0;
cc.assert(cc.isFunction(cc._tmp.PrototypeCCNode), cc._LogInfos.MissingFile, "BaseNodesPropertyDefine.js");
cc._tmp.PrototypeCCNode();
delete cc._tmp.PrototypeCCNode;
cc.CustomRenderCmd = function(a, b) {
    this._needDraw = !0;
    this._target = a;
    this._callback = b
};
cc.CustomRenderCmd.prototype.rendering = function(a, b, c) {
    this._callback && this._callback.call(this._target, a, b, c)
};
cc.CustomRenderCmd.prototype.needDraw = function() {
    return this._needDraw
};
var dirtyFlags = cc.Node._dirtyFlags = {
        transformDirty: 1,
        visibleDirty: 2,
        colorDirty: 4,
        opacityDirty: 8,
        cacheDirty: 16,
        orderDirty: 32,
        textDirty: 64,
        gradientDirty: 128,
        textureDirty: 256,
        contentDirty: 512,
        COUNT: 10,
        all: 1023
    },
    ONE_DEGREE = Math.PI / 180;

function transformChildTree(a) {
    var b = 1,
        c, d, e, f, g, h = cc.Node._performStacks[cc.Node._performing];
    h || (h = [], cc.Node._performStacks.push(h));
    h.length = 0;
    cc.Node._performing++;
    for (h[0] = a; b;)
        if (b--, d = h[b], h[b] = null, d) {
            if ((c = d._children) && 0 < c.length)
                for (e = d._renderCmd, f = 0, g = c.length; f < g; ++f) a = c[f], h[b] = a, b++, a._renderCmd.transform(e);
            if ((c = d._protectedChildren) && 0 < c.length)
                for (e = d._renderCmd, f = 0, g = c.length; f < g; ++f) a = c[f], h[b] = a, b++, a._renderCmd.transform(e)
        }
    cc.Node._performing--
}
cc.Node.RenderCmd = function(a) {
    this._node = a;
    this._anchorPointInPoints = {
        x: 0,
        y: 0
    };
    this._displayedColor = cc.color(255, 255, 255, 255)
};
cc.Node.RenderCmd.prototype = {
    constructor: cc.Node.RenderCmd,
    _needDraw: !1,
    _dirtyFlag: 1,
    _curLevel: -1,
    _displayedOpacity: 255,
    _cascadeColorEnabledDirty: !1,
    _cascadeOpacityEnabledDirty: !1,
    _transform: null,
    _worldTransform: null,
    _inverse: null,
    needDraw: function() {
        return this._needDraw
    },
    getAnchorPointInPoints: function() {
        return cc.p(this._anchorPointInPoints)
    },
    getDisplayedColor: function() {
        var a = this._displayedColor;
        return cc.color(a.r, a.g, a.b, a.a)
    },
    getDisplayedOpacity: function() {
        return this._displayedOpacity
    },
    setCascadeColorEnabledDirty: function() {
        this._cascadeColorEnabledDirty = !0;
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty)
    },
    setCascadeOpacityEnabledDirty: function() {
        this._cascadeOpacityEnabledDirty = !0;
        this.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    getParentToNodeTransform: function() {
        this._inverse || (this._inverse = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            tx: 0,
            ty: 0
        });
        this._dirtyFlag & cc.Node._dirtyFlags.transformDirty && cc.affineTransformInvertOut(this.getNodeToParentTransform(), this._inverse);
        return this._inverse
    },
    detachFromParent: function() {},
    _updateAnchorPointInPoint: function() {
        var a =
            this._anchorPointInPoints,
            b = this._node._contentSize,
            c = this._node._anchorPoint;
        a.x = b.width * c.x;
        a.y = b.height * c.y;
        this.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setDirtyFlag: function(a) {
        0 === this._dirtyFlag && 0 !== a && cc.renderer.pushDirtyNode(this);
        this._dirtyFlag |= a
    },
    getParentRenderCmd: function() {
        return this._node && this._node._parent && this._node._parent._renderCmd ? this._node._parent._renderCmd : null
    },
    transform: function(a, b) {
        this._transform || (this._transform = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            tx: 0,
            ty: 0
        }, this._worldTransform = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            tx: 0,
            ty: 0
        });
        var c = this._node,
            d = a ? a._worldTransform : null,
            e = this._transform,
            f = this._worldTransform;
        if (c._usingNormalizedPosition && c._parent) {
            var g = c._parent._contentSize;
            c._position.x = c._normalizedPosition.x * g.width;
            c._position.y = c._normalizedPosition.y * g.height;
            c._normalizedPositionDirty = !1
        }
        var h = c._rotationX || c._rotationY,
            k = c._skewX || c._skewY,
            m = c._scaleX,
            n = c._scaleY,
            g = this._anchorPointInPoints.x,
            p = this._anchorPointInPoints.y,
            r = 1,
            s = 0,
            u = 0,
            t = 1;
        if (h || k) {
            e.tx = c._position.x;
            e.ty = c._position.y;
            h && (r = c._rotationX * ONE_DEGREE, u = Math.sin(r), t = Math.cos(r), c._rotationY === c._rotationX ? (r = t, s = -u) : (s = c._rotationY * ONE_DEGREE, r = Math.cos(s), s = -Math.sin(s)));
            e.a = r *= m;
            e.b = s *= m;
            e.c = u *= n;
            e.d = t *= n;
            k && (k = Math.tan(c._skewX * ONE_DEGREE), m = Math.tan(c._skewY * ONE_DEGREE), Infinity === k && (k = 99999999), Infinity === m && (m = 99999999), e.a = r + u * m, e.b = s + t * m, e.c = u + r * k, e.d = t + s * k);
            if (g || p) e.tx -= e.a * g + e.c * p, e.ty -= e.b * g + e.d * p, c._ignoreAnchorPointForPosition && (e.tx += g, e.ty += p);
            c._additionalTransformDirty && cc.affineTransformConcatIn(e,
                c._additionalTransform);
            d ? (f.a = e.a * d.a + e.b * d.c, f.b = e.a * d.b + e.b * d.d, f.c = e.c * d.a + e.d * d.c, f.d = e.c * d.b + e.d * d.d, f.tx = d.a * e.tx + d.c * e.ty + d.tx, f.ty = d.d * e.ty + d.ty + d.b * e.tx) : (f.a = e.a, f.b = e.b, f.c = e.c, f.d = e.d, f.tx = e.tx, f.ty = e.ty)
        } else {
            e.a = m;
            e.b = 0;
            e.c = 0;
            e.d = n;
            e.tx = c._position.x;
            e.ty = c._position.y;
            if (g || p) e.tx -= e.a * g, e.ty -= e.d * p, c._ignoreAnchorPointForPosition && (e.tx += g, e.ty += p);
            c._additionalTransformDirty && cc.affineTransformConcatIn(e, c._additionalTransform);
            d ? (f.a = e.a * d.a + e.b * d.c, f.b = e.a * d.b + e.b * d.d, f.c = e.c *
                d.a + e.d * d.c, f.d = e.c * d.b + e.d * d.d, f.tx = e.tx * d.a + e.ty * d.c + d.tx, f.ty = e.tx * d.b + e.ty * d.d + d.ty) : (f.a = e.a, f.b = e.b, f.c = e.c, f.d = e.d, f.tx = e.tx, f.ty = e.ty)
        }
        this._updateCurrentRegions && (this._updateCurrentRegions(), this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.DirtyDouble));
        b && transformChildTree(c);
        this._cacheDirty = !0
    },
    getNodeToParentTransform: function() {
        (!this._transform || this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) && this.transform();
        return this._transform
    },
    visit: function(a) {
        var b =
            this._node,
            c = cc.renderer;
        if (a = a || this.getParentRenderCmd()) this._curLevel = a._curLevel + 1;
        isNaN(b._customZ) && (b._vertexZ = c.assignedZ, c.assignedZ += c.assignedZStep);
        this._syncStatus(a)
    },
    _updateDisplayColor: function(a) {
        var b = this._node,
            c = this._displayedColor,
            d = b._realColor,
            e;
        this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.Dirty);
        if (this._cascadeColorEnabledDirty && !b._cascadeColorEnabled) {
            c.r = d.r;
            c.g = d.g;
            c.b = d.b;
            c = new cc.Color(255, 255, 255, 255);
            a = b._children;
            b = 0;
            for (d =
                a.length; b < d; b++)(e = a[b]) && e._renderCmd && e._renderCmd._updateDisplayColor(c);
            this._cascadeColorEnabledDirty = !1
        } else if (void 0 === a && (a = (a = b._parent) && a._cascadeColorEnabled ? a.getDisplayedColor() : cc.color.WHITE), c.r = 0 | d.r * a.r / 255, c.g = 0 | d.g * a.g / 255, c.b = 0 | d.b * a.b / 255, b._cascadeColorEnabled)
            for (a = b._children, b = 0, d = a.length; b < d; b++)(e = a[b]) && e._renderCmd && (e._renderCmd._updateDisplayColor(c), e._renderCmd._updateColor());
        this._dirtyFlag &= ~dirtyFlags.colorDirty
    },
    _updateDisplayOpacity: function(a) {
        var b = this._node,
            c, d;
        this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.Dirty);
        if (this._cascadeOpacityEnabledDirty && !b._cascadeOpacityEnabled) {
            this._displayedOpacity = b._realOpacity;
            c = b._children;
            a = 0;
            for (b = c.length; a < b; a++)(d = c[a]) && d._renderCmd && d._renderCmd._updateDisplayOpacity(255);
            this._cascadeOpacityEnabledDirty = !1
        } else if (void 0 === a && (c = b._parent, a = 255, c && c._cascadeOpacityEnabled && (a = c.getDisplayedOpacity())), this._displayedOpacity = b._realOpacity * a / 255, b._cascadeOpacityEnabled)
            for (c =
                b._children, a = 0, b = c.length; a < b; a++)(d = c[a]) && d._renderCmd && (d._renderCmd._updateDisplayOpacity(this._displayedOpacity), d._renderCmd._updateColor());
        this._dirtyFlag &= ~dirtyFlags.opacityDirty
    },
    _syncDisplayColor: function(a) {
        var b = this._node,
            c = this._displayedColor,
            d = b._realColor;
        void 0 === a && (a = (a = b._parent) && a._cascadeColorEnabled ? a.getDisplayedColor() : cc.color.WHITE);
        c.r = 0 | d.r * a.r / 255;
        c.g = 0 | d.g * a.g / 255;
        c.b = 0 | d.b * a.b / 255
    },
    _syncDisplayOpacity: function(a) {
        var b = this._node;
        if (void 0 === a) {
            var c = b._parent;
            a = 255;
            c && c._cascadeOpacityEnabled && (a = c.getDisplayedOpacity())
        }
        this._displayedOpacity = b._realOpacity * a / 255
    },
    _updateColor: function() {},
    updateStatus: function() {
        var a = this._dirtyFlag,
            b = a & dirtyFlags.colorDirty,
            c = a & dirtyFlags.opacityDirty;
        a & dirtyFlags.contentDirty && (this._notifyRegionStatus && this._notifyRegionStatus(cc.Node.CanvasRenderCmd.RegionStatus.Dirty), this._dirtyFlag &= ~dirtyFlags.contentDirty);
        b && this._updateDisplayColor();
        c && this._updateDisplayOpacity();
        (b || c) && this._updateColor();
        a & dirtyFlags.transformDirty &&
            (this.transform(this.getParentRenderCmd(), !0), this._dirtyFlag &= ~dirtyFlags.transformDirty);
        a & dirtyFlags.orderDirty && (this._dirtyFlag &= ~dirtyFlags.orderDirty)
    },
    _syncStatus: function(a) {
        var b = this._dirtyFlag,
            c = a ? a._node : null;
        c && c._cascadeColorEnabled && a._dirtyFlag & dirtyFlags.colorDirty && (b |= dirtyFlags.colorDirty);
        c && c._cascadeOpacityEnabled && a._dirtyFlag & dirtyFlags.opacityDirty && (b |= dirtyFlags.opacityDirty);
        a && a._dirtyFlag & dirtyFlags.transformDirty && (b |= dirtyFlags.transformDirty);
        this._dirtyFlag = b;
        var c =
            b & dirtyFlags.colorDirty,
            d = b & dirtyFlags.opacityDirty;
        c && this._syncDisplayColor();
        d && this._syncDisplayOpacity();
        (c || d) && this._updateColor();
        b & dirtyFlags.transformDirty && this.transform(a);
        b & dirtyFlags.orderDirty && (this._dirtyFlag &= ~dirtyFlags.orderDirty)
    }
};
cc.Node.RenderCmd.prototype.originTransform = cc.Node.RenderCmd.prototype.transform;
cc.Node.RenderCmd.prototype.originUpdateStatus = cc.Node.RenderCmd.prototype.updateStatus;
cc.Node.RenderCmd.prototype._originSyncStatus = cc.Node.RenderCmd.prototype._syncStatus;
(function() {
    cc.Node.CanvasRenderCmd = function(a) {
        this._node = a;
        this._anchorPointInPoints = {
            x: 0,
            y: 0
        };
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._cachedParent = null;
        this._cacheDirty = !1;
        this._currentRegion = new cc.Region;
        this._oldRegion = new cc.Region;
        this._regionFlag = 0;
        this._canUseDirtyRegion = !1
    };
    cc.Node.CanvasRenderCmd.RegionStatus = {
        NotDirty: 0,
        Dirty: 1,
        DirtyDouble: 2
    };
    var a = cc.Node.CanvasRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    a.constructor = cc.Node.CanvasRenderCmd;
    a._rootCtor =
        cc.Node.CanvasRenderCmd;
    a._notifyRegionStatus = function(a) {
        this._needDraw && this._regionFlag < a && (this._regionFlag = a)
    };
    var b = new cc.Rect;
    a.getLocalBB = function() {
        var a = this._node;
        b.x = b.y = 0;
        b.width = a._contentSize.width;
        b.height = a._contentSize.height;
        return b
    };
    a._updateCurrentRegions = function() {
        var a = this._currentRegion;
        this._currentRegion = this._oldRegion;
        this._oldRegion = a;
        cc.Node.CanvasRenderCmd.RegionStatus.DirtyDouble !== this._regionFlag || this._currentRegion.isEmpty() || this._oldRegion.union(this._currentRegion);
        this._currentRegion.updateRegion(this.getLocalBB(), this._worldTransform)
    };
    a.setDirtyFlag = function(a, b) {
        cc.Node.RenderCmd.prototype.setDirtyFlag.call(this, a, b);
        this._setCacheDirty(b);
        this._cachedParent && this._cachedParent.setDirtyFlag(a, !0)
    };
    a._setCacheDirty = function() {
        if (!1 === this._cacheDirty) {
            this._cacheDirty = !0;
            var a = this._cachedParent;
            a && a !== this && a._setNodeDirtyForCache && a._setNodeDirtyForCache()
        }
    };
    a._setCachedParent = function(a) {
        if (this._cachedParent !== a) {
            this._cachedParent = a;
            for (var b = this._node._children,
                    e = 0, f = b.length; e < f; e++) b[e]._renderCmd._setCachedParent(a)
        }
    };
    a.detachFromParent = function() {
        this._cachedParent = null;
        for (var a = this._node._children, b, e = 0, f = a.length; e < f; e++)(b = a[e]) && b._renderCmd && b._renderCmd.detachFromParent()
    };
    a.setShaderProgram = function(a) {};
    a.getShaderProgram = function() {
        return null
    };
    cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc = function(a) {
        return a ? a.src === cc.SRC_ALPHA && a.dst === cc.ONE || a.src === cc.ONE && a.dst === cc.ONE ? "lighter" : a.src === cc.ZERO && a.dst === cc.SRC_ALPHA ? "destination-in" :
            a.src === cc.ZERO && a.dst === cc.ONE_MINUS_SRC_ALPHA ? "destination-out" : "source-over" : "source-over"
    }
})();
(function() {
    cc.Node.WebGLRenderCmd = function(a) {
        this._node = a;
        this._anchorPointInPoints = {
            x: 0,
            y: 0
        };
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._shaderProgram = null
    };
    var a = cc.Node.WebGLRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    a.constructor = cc.Node.WebGLRenderCmd;
    a._rootCtor = cc.Node.WebGLRenderCmd;
    a._updateColor = function() {};
    a.setShaderProgram = function(a) {
        this._shaderProgram = a
    };
    a.getShaderProgram = function() {
        return this._shaderProgram
    }
})();
cc.AtlasNode = cc.Node.extend({
    textureAtlas: null,
    quadsToDraw: 0,
    _itemsPerRow: 0,
    _itemsPerColumn: 0,
    _itemWidth: 0,
    _itemHeight: 0,
    _opacityModifyRGB: !1,
    _blendFunc: null,
    _ignoreContentScaleFactor: !1,
    _className: "AtlasNode",
    _texture: null,
    _textureForCanvas: null,
    ctor: function(a, b, c, d) {
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = {
            src: cc.BLEND_SRC,
            dst: cc.BLEND_DST
        };
        this._ignoreContentScaleFactor = !1;
        void 0 !== d && this.initWithTileFile(a, b, c, d)
    },
    _createRenderCmd: function() {
        this._renderCmd = cc._renderType === cc.game.RENDER_TYPE_CANVAS ?
            new cc.AtlasNode.CanvasRenderCmd(this) : new cc.AtlasNode.WebGLRenderCmd(this)
    },
    updateAtlasValues: function() {
        cc.log(cc._LogInfos.AtlasNode_updateAtlasValues)
    },
    getColor: function() {
        return this._opacityModifyRGB ? this._renderCmd._colorUnmodified : cc.Node.prototype.getColor.call(this)
    },
    setOpacityModifyRGB: function(a) {
        var b = this.color;
        this._opacityModifyRGB = a;
        this.setColor(b)
    },
    isOpacityModifyRGB: function() {
        return this._opacityModifyRGB
    },
    getBlendFunc: function() {
        return this._blendFunc
    },
    setBlendFunc: function(a,
        b) {
        this._blendFunc = void 0 === b ? a : {
            src: a,
            dst: b
        }
    },
    setTextureAtlas: function(a) {
        this.textureAtlas = a
    },
    getTextureAtlas: function() {
        return this.textureAtlas
    },
    getQuadsToDraw: function() {
        return this.quadsToDraw
    },
    setQuadsToDraw: function(a) {
        this.quadsToDraw = a
    },
    initWithTileFile: function(a, b, c, d) {
        if (!a) throw Error("cc.AtlasNode.initWithTileFile(): title should not be null");
        a = cc.textureCache.addImage(a);
        return this.initWithTexture(a, b, c, d)
    },
    initWithTexture: function(a, b, c, d) {
        return this._renderCmd.initWithTexture(a,
            b, c, d)
    },
    setColor: function(a) {
        this._renderCmd.setColor(a)
    },
    setOpacity: function(a) {
        this._renderCmd.setOpacity(a)
    },
    getTexture: function() {
        return this._texture
    },
    setTexture: function(a) {
        this._texture = a
    },
    _setIgnoreContentScaleFactor: function(a) {
        this._ignoreContentScaleFactor = a
    }
});
_p = cc.AtlasNode.prototype;
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.EventHelper.prototype.apply(_p);
cc.AtlasNode.create = function(a, b, c, d) {
    return new cc.AtlasNode(a, b, c, d)
};
(function() {
    cc.AtlasNode.CanvasRenderCmd = function(a) {
        this._rootCtor(a);
        this._needDraw = !1;
        this._colorUnmodified = cc.color.WHITE;
        this._textureToRender = null
    };
    var a = cc.AtlasNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.AtlasNode.CanvasRenderCmd;
    a.initWithTexture = function(a, c, d, e) {
        var f = this._node;
        f._itemWidth = c;
        f._itemHeight = d;
        f._opacityModifyRGB = !0;
        f._texture = a;
        if (!f._texture) return cc.log(cc._LogInfos.AtlasNode__initWithTexture), !1;
        this._textureToRender =
            a;
        this._calculateMaxItems();
        f.quadsToDraw = e;
        return !0
    };
    a.setColor = function(a) {
        var c = this._node._realColor;
        if (c.r !== a.r || c.g !== a.g || c.b !== a.b) this._colorUnmodified = a, this._changeTextureColor()
    };
    a._changeTextureColor = function() {
        var a = this._node._texture,
            c = this._colorUnmodified,
            d = a.getHtmlElementObj(),
            d = cc.rect(0, 0, d.width, d.height);
        a === this._textureToRender ? this._textureToRender = a._generateColorTexture(c.r, c.g, c.b, d) : a._generateColorTexture(c.r, c.g, c.b, d, this._textureToRender.getHtmlElementObj())
    };
    a.setOpacity =
        function(a) {
            cc.Node.prototype.setOpacity.call(this._node, a)
        };
    a._calculateMaxItems = function() {
        var a = this._node,
            c = a._texture.getContentSize();
        a._itemsPerColumn = 0 | c.height / a._itemHeight;
        a._itemsPerRow = 0 | c.width / a._itemWidth
    }
})();
(function() {
    cc.AtlasNode.WebGLRenderCmd = function(a) {
        this._rootCtor(a);
        this._needDraw = !0;
        this._textureAtlas = null;
        this._colorUnmodified = cc.color.WHITE;
        this._uniformColor = this._colorF32Array = null;
        this._matrix = new cc.math.Matrix4;
        this._matrix.identity();
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        this._uniformColor = cc._renderContext.getUniformLocation(this._shaderProgram.getProgram(), "u_color")
    };
    var a = cc.AtlasNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.AtlasNode.WebGLRenderCmd;
    a._updateBlendFunc = function() {
        var a = this._node;
        this._textureAtlas.texture.hasPremultipliedAlpha() || (a._blendFunc.src = cc.SRC_ALPHA, a._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA)
    };
    a._updateOpacityModifyRGB = function() {
        this._node._opacityModifyRGB = this._textureAtlas.texture.hasPremultipliedAlpha()
    };
    a.rendering = function(a) {
        a = a || cc._renderContext;
        var c = this._node,
            d = this._worldTransform;
        this._matrix.mat[0] = d.a;
        this._matrix.mat[4] = d.c;
        this._matrix.mat[12] = d.tx;
        this._matrix.mat[1] =
            d.b;
        this._matrix.mat[5] = d.d;
        this._matrix.mat[13] = d.ty;
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._matrix);
        cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst);
        this._uniformColor && this._colorF32Array && (a.uniform4fv(this._uniformColor, this._colorF32Array), this._textureAtlas.drawNumberOfQuads(c.quadsToDraw, 0))
    };
    a.initWithTexture = function(a, c, d, e) {
        var f = this._node;
        f._itemWidth = c;
        f._itemHeight = d;
        this._colorUnmodified = cc.color.WHITE;
        f._opacityModifyRGB = !0;
        f._blendFunc.src =
            cc.BLEND_SRC;
        f._blendFunc.dst = cc.BLEND_DST;
        c = f._realColor;
        this._colorF32Array = new Float32Array([c.r / 255, c.g / 255, c.b / 255, f._realOpacity / 255]);
        this._textureAtlas = new cc.TextureAtlas;
        this._textureAtlas.initWithTexture(a, e);
        if (!this._textureAtlas) return cc.log(cc._LogInfos.AtlasNode__initWithTexture), !1;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
        this._calculateMaxItems();
        f.quadsToDraw = e;
        return !0
    };
    a.setColor = function(a) {
        var c = cc.color(a.r, a.g, a.b),
            d = this._node;
        this._colorUnmodified = a;
        a = this._displayedOpacity;
        d._opacityModifyRGB && (c.r = c.r * a / 255, c.g = c.g * a / 255, c.b = c.b * a / 255);
        cc.Node.prototype.setColor.call(d, c)
    };
    a.setOpacity = function(a) {
        var c = this._node;
        cc.Node.prototype.setOpacity.call(c, a);
        c._opacityModifyRGB && (c.color = this._colorUnmodified)
    };
    a._updateColor = function() {
        if (this._colorF32Array) {
            var a = this._displayedColor;
            this._colorF32Array[0] = a.r / 255;
            this._colorF32Array[1] = a.g / 255;
            this._colorF32Array[2] = a.b / 255;
            this._colorF32Array[3] = this._displayedOpacity / 255
        }
    };
    a.getTexture = function() {
        return this._textureAtlas.texture
    };
    a.setTexture = function(a) {
        this._textureAtlas.texture = a;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB()
    };
    a._calculateMaxItems = function() {
        var a = this._node,
            c = this._textureAtlas.texture,
            d = c.getContentSize();
        a._ignoreContentScaleFactor && (d = c.getContentSizeInPixels());
        a._itemsPerColumn = 0 | d.height / a._itemHeight;
        a._itemsPerRow = 0 | d.width / a._itemWidth
    }
})();
cc._tmp.WebGLTexture2D = function() {
    cc.Texture2D = cc.Class.extend({
        _pVRHaveAlphaPremultiplied: !0,
        _pixelFormat: null,
        _pixelsWide: 0,
        _pixelsHigh: 0,
        _name: "",
        _contentSize: null,
        maxS: 0,
        maxT: 0,
        _hasPremultipliedAlpha: !1,
        _hasMipmaps: !1,
        shaderProgram: null,
        _textureLoaded: !1,
        _htmlElementObj: null,
        _webTextureObj: null,
        url: null,
        ctor: function() {
            this._contentSize = cc.size(0, 0);
            this._pixelFormat = cc.Texture2D.defaultPixelFormat
        },
        releaseTexture: function() {
            this._webTextureObj && cc._renderContext.deleteTexture(this._webTextureObj);
            cc.loader.release(this.url)
        },
        getPixelFormat: function() {
            return this._pixelFormat
        },
        getPixelsWide: function() {
            return this._pixelsWide
        },
        getPixelsHigh: function() {
            return this._pixelsHigh
        },
        getName: function() {
            return this._webTextureObj
        },
        getContentSize: function() {
            return cc.size(this._contentSize.width / cc.contentScaleFactor(), this._contentSize.height / cc.contentScaleFactor())
        },
        _getWidth: function() {
            return this._contentSize.width / cc.contentScaleFactor()
        },
        _getHeight: function() {
            return this._contentSize.height / cc.contentScaleFactor()
        },
        getContentSizeInPixels: function() {
            return this._contentSize
        },
        getMaxS: function() {
            return this.maxS
        },
        setMaxS: function(a) {
            this.maxS = a
        },
        getMaxT: function() {
            return this.maxT
        },
        setMaxT: function(a) {
            this.maxT = a
        },
        getShaderProgram: function() {
            return this.shaderProgram
        },
        setShaderProgram: function(a) {
            this.shaderProgram = a
        },
        hasPremultipliedAlpha: function() {
            return this._hasPremultipliedAlpha
        },
        hasMipmaps: function() {
            return this._hasMipmaps
        },
        description: function() {
            return "\x3ccc.Texture2D | Name \x3d " + this._name + " | Dimensions \x3d " +
                this._pixelsWide + " x " + this._pixelsHigh + " | Coordinates \x3d (" + this.maxS + ", " + this.maxT + ")\x3e"
        },
        releaseData: function(a) {},
        keepData: function(a, b) {
            return a
        },
        initWithData: function(a, b, c, d, e) {
            var f = cc.Texture2D,
                g = cc._renderContext,
                h = g.RGBA,
                k = g.UNSIGNED_BYTE,
                m = c * cc.Texture2D._B[b] / 8;
            0 === m % 8 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 8) : 0 === m % 4 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 4) : 0 === m % 2 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 2) : g.pixelStorei(g.UNPACK_ALIGNMENT, 1);
            this._webTextureObj = g.createTexture();
            cc.glBindTexture2D(this);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
            switch (b) {
                case f.PIXEL_FORMAT_RGBA8888:
                    h = g.RGBA;
                    break;
                case f.PIXEL_FORMAT_RGB888:
                    h = g.RGB;
                    break;
                case f.PIXEL_FORMAT_RGBA4444:
                    k = g.UNSIGNED_SHORT_4_4_4_4;
                    break;
                case f.PIXEL_FORMAT_RGB5A1:
                    k = g.UNSIGNED_SHORT_5_5_5_1;
                    break;
                case f.PIXEL_FORMAT_RGB565:
                    k = g.UNSIGNED_SHORT_5_6_5;
                    break;
                case f.PIXEL_FORMAT_AI88:
                    h = g.LUMINANCE_ALPHA;
                    break;
                case f.PIXEL_FORMAT_A8:
                    h = g.ALPHA;
                    break;
                case f.PIXEL_FORMAT_I8:
                    h = g.LUMINANCE;
                    break;
                default:
                    cc.assert(0, cc._LogInfos.Texture2D_initWithData)
            }
            g.texImage2D(g.TEXTURE_2D, 0, h, c, d, 0, h, k, a);
            this._contentSize.width = e.width;
            this._contentSize.height = e.height;
            this._pixelsWide = c;
            this._pixelsHigh = d;
            this._pixelFormat = b;
            this.maxS = e.width / c;
            this.maxT = e.height / d;
            this._hasMipmaps = this._hasPremultipliedAlpha = !1;
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
            return this._textureLoaded = !0
        },
        drawAtPoint: function(a) {
            var b = [0, this.maxT, this.maxS, this.maxT, 0, 0, this.maxS, 0],
                c = cc._renderContext,
                d = this._pixelsWide * this.maxS,
                e = this._pixelsHigh * this.maxT;
            a = [a.x, a.y, 0, d + a.x, a.y, 0, a.x, e + a.y, 0, d + a.x, e + a.y, 0];
            this._shaderProgram.use();
            this._shaderProgram.setUniformsForBuiltins();
            cc.glBindTexture2D(this);
            c.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            c.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, a);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, c.FLOAT, !1, 0, b);
            c.drawArrays(c.TRIANGLE_STRIP, 0, 4)
        },
        drawInRect: function(a) {
            var b = [0, this.maxT, this.maxS, this.maxT, 0, 0, this.maxS, 0];
            a = [a.x, a.y, a.x + a.width, a.y, a.x, a.y + a.height, a.x + a.width, a.y + a.height];
            this._shaderProgram.use();
            this._shaderProgram.setUniformsForBuiltins();
            cc.glBindTexture2D(this);
            var c = cc._renderContext;
            c.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            c.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION,
                2, c.FLOAT, !1, 0, a);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, c.FLOAT, !1, 0, b);
            c.drawArrays(c.TRIANGLE_STRIP, 0, 4)
        },
        initWithImage: function(a) {
            if (null == a) return cc.log(cc._LogInfos.Texture2D_initWithImage), !1;
            var b = a.getWidth(),
                c = a.getHeight(),
                d = cc.configuration.getMaxTextureSize();
            if (b > d || c > d) return cc.log(cc._LogInfos.Texture2D_initWithImage_2, b, c, d, d), !1;
            this._textureLoaded = !0;
            return this._initPremultipliedATextureWithImage(a, b, c)
        },
        initWithElement: function(a) {
            a && (this._webTextureObj = cc._renderContext.createTexture(),
                this._htmlElementObj = a, this._hasPremultipliedAlpha = this._textureLoaded = !0)
        },
        getHtmlElementObj: function() {
            return this._htmlElementObj
        },
        isLoaded: function() {
            return this._textureLoaded
        },
        handleLoadedTexture: function(a) {
            a = void 0 !== a ? a : this._hasPremultipliedAlpha;
            if (cc.game._rendererInitialized) {
                if (!this._htmlElementObj) {
                    var b = cc.loader.getRes(this.url);
                    if (!b) return;
                    this.initWithElement(b)
                }
                this._htmlElementObj.width && this._htmlElementObj.height && (b = cc._renderContext, cc.glBindTexture2D(this), b.pixelStorei(b.UNPACK_ALIGNMENT,
                    4), a && b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1), b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, this._htmlElementObj), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.LINEAR), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_S, b.CLAMP_TO_EDGE), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, b.CLAMP_TO_EDGE), this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE), cc.glBindTexture2D(null), a && b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
                    0), b = this._htmlElementObj.height, this._pixelsWide = this._contentSize.width = this._htmlElementObj.width, this._pixelsHigh = this._contentSize.height = b, this._pixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888, this.maxT = this.maxS = 1, this._hasPremultipliedAlpha = a, this._hasMipmaps = !1, this.dispatchEvent("load"))
            }
        },
        initWithString: function(a, b, c, d, e, f) {
            cc.log(cc._LogInfos.Texture2D_initWithString);
            return null
        },
        initWithETCFile: function(a) {
            cc.log(cc._LogInfos.Texture2D_initWithETCFile_2);
            return !1
        },
        initWithPVRFile: function(a) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRFile_2);
            return !1
        },
        initWithPVRTCData: function(a, b, c, d, e, f) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRTCData_2);
            return !1
        },
        setTexParameters: function(a, b, c, d) {
            var e = cc._renderContext;
            void 0 !== b && (a = {
                minFilter: a,
                magFilter: b,
                wrapS: c,
                wrapT: d
            });
            cc.assert(this._pixelsWide === cc.NextPOT(this._pixelsWide) && this._pixelsHigh === cc.NextPOT(this._pixelsHigh) || a.wrapS === e.CLAMP_TO_EDGE && a.wrapT === e.CLAMP_TO_EDGE, "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");
            cc.glBindTexture2D(this);
            e.texParameteri(e.TEXTURE_2D,
                e.TEXTURE_MIN_FILTER, a.minFilter);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, a.magFilter);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, a.wrapS);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, a.wrapT)
        },
        setAntiAliasTexParameters: function() {
            var a = cc._renderContext;
            cc.glBindTexture2D(this);
            this._hasMipmaps ? a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_NEAREST) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
            a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR)
        },
        setAliasTexParameters: function() {
            var a = cc._renderContext;
            cc.glBindTexture2D(this);
            this._hasMipmaps ? a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.NEAREST_MIPMAP_NEAREST) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.NEAREST);
            a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.NEAREST)
        },
        generateMipmap: function() {
            cc.assert(this._pixelsWide === cc.NextPOT(this._pixelsWide) && this._pixelsHigh === cc.NextPOT(this._pixelsHigh), "Mimpap texture only works in POT textures");
            cc.glBindTexture2D(this);
            cc._renderContext.generateMipmap(cc._renderContext.TEXTURE_2D);
            this._hasMipmaps = !0
        },
        stringForFormat: function() {
            return cc.Texture2D._M[this._pixelFormat]
        },
        bitsPerPixelForFormat: function(a) {
            a = a || this._pixelFormat;
            var b = cc.Texture2D._B[a];
            if (null != b) return b;
            cc.log(cc._LogInfos.Texture2D_bitsPerPixelForFormat, a);
            return -1
        },
        _initPremultipliedATextureWithImage: function(a, b, c) {
            var d = cc.Texture2D,
                e = a.getData(),
                f = null,
                f = null,
                g = a.hasAlpha(),
                h = cc.size(a.getWidth(), a.getHeight()),
                k = d.defaultPixelFormat,
                m = a.getBitsPerComponent();
            g || (8 <= m ? k = d.PIXEL_FORMAT_RGB888 : (cc.log(cc._LogInfos.Texture2D__initPremultipliedATextureWithImage), k = d.PIXEL_FORMAT_RGB565));
            var n = b * c;
            if (k === d.PIXEL_FORMAT_RGB565)
                if (g)
                    for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] >> 0 & 255) >> 3 << 11 | (f[m] >> 8 & 255) >> 2 << 5 | (f[m] >> 16 & 255) >> 3 << 0;
                else
                    for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] & 255) >> 3 << 11 | (f[m] & 255) >> 2 << 5 | (f[m] & 255) >> 3 << 0;
            else if (k === d.PIXEL_FORMAT_RGBA4444)
                for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] >>
                    0 & 255) >> 4 << 12 | (f[m] >> 8 & 255) >> 4 << 8 | (f[m] >> 16 & 255) >> 4 << 4 | (f[m] >> 24 & 255) >> 4 << 0;
            else if (k === d.PIXEL_FORMAT_RGB5A1)
                for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] >> 0 & 255) >> 3 << 11 | (f[m] >> 8 & 255) >> 3 << 6 | (f[m] >> 16 & 255) >> 3 << 1 | (f[m] >> 24 & 255) >> 7 << 0;
            else if (k === d.PIXEL_FORMAT_A8)
                for (e = new Uint8Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = f >> 24 & 255;
            if (g && k === d.PIXEL_FORMAT_RGB888)
                for (f = a.getData(), e = new Uint8Array(b * c * 3), m = 0; m < n; ++m) e[3 * m] = f >> 0 & 255, e[3 * m + 1] = f >> 8 & 255, e[3 * m + 2] = f >> 16 & 255;
            this.initWithData(e,
                k, b, c, h);
            a.getData();
            this._hasPremultipliedAlpha = a.isPremultipliedAlpha();
            return !0
        },
        addLoadedEventListener: function(a, b) {
            this.addEventListener("load", a, b)
        },
        removeLoadedEventListener: function(a) {
            this.removeEventTarget("load", a)
        }
    })
};
cc._tmp.WebGLTextureAtlas = function() {
    var a = cc.TextureAtlas.prototype;
    a._setupVBO = function() {
        var a = cc._renderContext;
        this._buffersVBO[0] = a.createBuffer();
        this._buffersVBO[1] = a.createBuffer();
        this._quadsWebBuffer = a.createBuffer();
        this._mapBuffers()
    };
    a._mapBuffers = function() {
        var a = cc._renderContext;
        a.bindBuffer(a.ARRAY_BUFFER, this._quadsWebBuffer);
        a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        a.bufferData(a.ELEMENT_ARRAY_BUFFER,
            this._indices, a.STATIC_DRAW)
    };
    a.drawNumberOfQuads = function(a, c) {
        c = c || 0;
        if (0 !== a && this.texture && this.texture.isLoaded()) {
            var d = cc._renderContext;
            cc.glBindTexture2D(this.texture);
            d.bindBuffer(d.ARRAY_BUFFER, this._quadsWebBuffer);
            this.dirty && (d.bufferData(d.ARRAY_BUFFER, this._quadsArrayBuffer, d.DYNAMIC_DRAW), this.dirty = !1);
            d.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            d.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
            d.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
            d.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION,
                3, d.FLOAT, !1, 24, 0);
            d.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, d.UNSIGNED_BYTE, !0, 24, 12);
            d.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, d.FLOAT, !1, 24, 16);
            d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
            cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP ? d.drawElements(d.TRIANGLE_STRIP, 6 * a, d.UNSIGNED_SHORT, 6 * c * this._indices.BYTES_PER_ELEMENT) : d.drawElements(d.TRIANGLES, 6 * a, d.UNSIGNED_SHORT, 6 * c * this._indices.BYTES_PER_ELEMENT);
            cc.g_NumberOfDraws++
        }
    }
};
cc._tmp.WebGLTextureCache = function() {
    var a = cc.textureCache;
    a.handleLoadedTexture = function(a) {
        var c = this._textures,
            d;
        cc.game._rendererInitialized || (c = this._loadedTexturesBefore);
        d = c[a];
        d || (d = c[a] = new cc.Texture2D, d.url = a);
        ".png" === cc.path.extname(a) ? d.handleLoadedTexture(!0) : d.handleLoadedTexture()
    };
    a.addImage = function(a, c, d) {
        cc.assert(a, cc._LogInfos.Texture2D_addImage_2);
        var e = this._textures;
        cc.game._rendererInitialized || (e = this._loadedTexturesBefore);
        var f = e[a] || e[cc.loader._getAliase(a)];
        if (f) return f.isLoaded() ?
            c && c.call(d, f) : f.addEventListener("load", function() {
                c && c.call(d, f)
            }, d), f;
        f = e[a] = new cc.Texture2D;
        f.url = a;
        var g = cc.loader.getBasePath ? cc.loader.getBasePath() : cc.loader.resPath;
        cc.loader.loadImg(cc.path.join(g || "", a), function(f, g) {
            if (f) return c && c.call(d, f);
            cc.loader.cache[a] || (cc.loader.cache[a] = g);
            cc.textureCache.handleLoadedTexture(a);
            var m = e[a];
            c && c.call(d, m)
        });
        return f
    };
    a.addImageAsync = a.addImage;
    a = null
};
cc._tmp.PrototypeTexture2D = function() {
    var a = cc.Texture2D;
    a.PVRImagesHavePremultipliedAlpha = function(a) {
        cc.PVRHaveAlphaPremultiplied_ = a
    };
    a.PIXEL_FORMAT_RGBA8888 = 2;
    a.PIXEL_FORMAT_RGB888 = 3;
    a.PIXEL_FORMAT_RGB565 = 4;
    a.PIXEL_FORMAT_A8 = 5;
    a.PIXEL_FORMAT_I8 = 6;
    a.PIXEL_FORMAT_AI88 = 7;
    a.PIXEL_FORMAT_RGBA4444 = 8;
    a.PIXEL_FORMAT_RGB5A1 = 7;
    a.PIXEL_FORMAT_PVRTC4 = 9;
    a.PIXEL_FORMAT_PVRTC2 = 10;
    a.PIXEL_FORMAT_DEFAULT = a.PIXEL_FORMAT_RGBA8888;
    a.defaultPixelFormat = a.PIXEL_FORMAT_DEFAULT;
    var b = cc.Texture2D._M = {};
    b[a.PIXEL_FORMAT_RGBA8888] =
        "RGBA8888";
    b[a.PIXEL_FORMAT_RGB888] = "RGB888";
    b[a.PIXEL_FORMAT_RGB565] = "RGB565";
    b[a.PIXEL_FORMAT_A8] = "A8";
    b[a.PIXEL_FORMAT_I8] = "I8";
    b[a.PIXEL_FORMAT_AI88] = "AI88";
    b[a.PIXEL_FORMAT_RGBA4444] = "RGBA4444";
    b[a.PIXEL_FORMAT_RGB5A1] = "RGB5A1";
    b[a.PIXEL_FORMAT_PVRTC4] = "PVRTC4";
    b[a.PIXEL_FORMAT_PVRTC2] = "PVRTC2";
    b = cc.Texture2D._B = {};
    b[a.PIXEL_FORMAT_RGBA8888] = 32;
    b[a.PIXEL_FORMAT_RGB888] = 24;
    b[a.PIXEL_FORMAT_RGB565] = 16;
    b[a.PIXEL_FORMAT_A8] = 8;
    b[a.PIXEL_FORMAT_I8] = 8;
    b[a.PIXEL_FORMAT_AI88] = 16;
    b[a.PIXEL_FORMAT_RGBA4444] =
        16;
    b[a.PIXEL_FORMAT_RGB5A1] = 16;
    b[a.PIXEL_FORMAT_PVRTC4] = 4;
    b[a.PIXEL_FORMAT_PVRTC2] = 3;
    a = cc.Texture2D.prototype;
    cc.defineGetterSetter(a, "name", a.getName);
    cc.defineGetterSetter(a, "pixelFormat", a.getPixelFormat);
    cc.defineGetterSetter(a, "pixelsWidth", a.getPixelsWide);
    cc.defineGetterSetter(a, "pixelsHeight", a.getPixelsHigh);
    cc.defineGetterSetter(a, "width", a._getWidth);
    cc.defineGetterSetter(a, "height", a._getHeight)
};
cc._tmp.PrototypeTextureAtlas = function() {
    var a = cc.TextureAtlas.prototype;
    cc.defineGetterSetter(a, "totalQuads", a.getTotalQuads);
    cc.defineGetterSetter(a, "capacity", a.getCapacity);
    cc.defineGetterSetter(a, "quads", a.getQuads, a.setQuads)
};
cc.ALIGN_CENTER = 51;
cc.ALIGN_TOP = 19;
cc.ALIGN_TOP_RIGHT = 18;
cc.ALIGN_RIGHT = 50;
cc.ALIGN_BOTTOM_RIGHT = 34;
cc.ALIGN_BOTTOM = 35;
cc.ALIGN_BOTTOM_LEFT = 33;
cc.ALIGN_LEFT = 49;
cc.ALIGN_TOP_LEFT = 17;
cc.PVRHaveAlphaPremultiplied_ = !1;
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
        var a = {
            _contentSize: null,
            _textureLoaded: !1,
            _htmlElementObj: null,
            url: null,
            _pattern: null,
            ctor: function() {
                this._contentSize = cc.size(0, 0);
                this._textureLoaded = !1;
                this._htmlElementObj = null;
                this._pattern = "";
                this._pixelsHigh = this._pixelsWide = 0
            },
            getPixelsWide: function() {
                return this._pixelsWide
            },
            getPixelsHigh: function() {
                return this._pixelsHigh
            },
            getContentSize: function() {
                var a = cc.contentScaleFactor();
                return cc.size(this._contentSize.width / a, this._contentSize.height / a)
            },
            _getWidth: function() {
                return this._contentSize.width / cc.contentScaleFactor()
            },
            _getHeight: function() {
                return this._contentSize.height / cc.contentScaleFactor()
            },
            getContentSizeInPixels: function() {
                return this._contentSize
            },
            initWithElement: function(a) {
                a && (this._htmlElementObj = a, this._pixelsWide = this._contentSize.width = a.width, this._pixelsHigh = this._contentSize.height = a.height, this._textureLoaded = !0)
            },
            getHtmlElementObj: function() {
                return this._htmlElementObj
            },
            isLoaded: function() {
                return this._textureLoaded
            },
            handleLoadedTexture: function() {
                if (!this._textureLoaded) {
                    if (!this._htmlElementObj) {
                        var a = cc.loader.getRes(this.url);
                        if (!a) return;
                        this.initWithElement(a)
                    }
                    a = this._htmlElementObj;
                    this._pixelsWide = this._contentSize.width = a.width;
                    this._pixelsHigh = this._contentSize.height = a.height;
                    this.dispatchEvent("load")
                }
            },
            description: function() {
                return "\x3ccc.Texture2D | width \x3d " + this._contentSize.width + " height " + this._contentSize.height + "\x3e"
            },
            initWithData: function(a,
                c, d, e, f) {
                return !1
            },
            initWithImage: function(a) {
                return !1
            },
            initWithString: function(a, c, d, e, f, g) {
                return !1
            },
            releaseTexture: function() {
                cc.loader.release(this.url)
            },
            getName: function() {
                return null
            },
            getMaxS: function() {
                return 1
            },
            setMaxS: function(a) {},
            getMaxT: function() {
                return 1
            },
            setMaxT: function(a) {},
            getPixelFormat: function() {
                return null
            },
            getShaderProgram: function() {
                return null
            },
            setShaderProgram: function(a) {},
            hasPremultipliedAlpha: function() {
                return !1
            },
            hasMipmaps: function() {
                return !1
            },
            releaseData: function(a) {},
            keepData: function(a, c) {
                return a
            },
            drawAtPoint: function(a) {},
            drawInRect: function(a) {},
            initWithETCFile: function(a) {
                cc.log(cc._LogInfos.Texture2D_initWithETCFile);
                return !1
            },
            initWithPVRFile: function(a) {
                cc.log(cc._LogInfos.Texture2D_initWithPVRFile);
                return !1
            },
            initWithPVRTCData: function(a, c, d, e, f, g) {
                cc.log(cc._LogInfos.Texture2D_initWithPVRTCData);
                return !1
            },
            setTexParameters: function(a, c, d, e) {
                void 0 !== c && (a = {
                    minFilter: a,
                    magFilter: c,
                    wrapS: d,
                    wrapT: e
                });
                this._pattern = a.wrapS === cc.REPEAT && a.wrapT === cc.REPEAT ?
                    "repeat" : a.wrapS === cc.REPEAT ? "repeat-x" : a.wrapT === cc.REPEAT ? "repeat-y" : ""
            },
            setAntiAliasTexParameters: function() {},
            setAliasTexParameters: function() {},
            generateMipmap: function() {},
            stringForFormat: function() {
                return ""
            },
            bitsPerPixelForFormat: function(a) {
                return -1
            },
            addLoadedEventListener: function(a, c) {
                this.addEventListener("load", a, c)
            },
            removeLoadedEventListener: function(a) {
                this.removeEventTarget("load", a)
            },
            _generateColorTexture: function() {},
            _generateTextureCacheForColor: function() {
                if (this.channelCache) return this.channelCache;
                var a = [document.createElement("canvas"), document.createElement("canvas"), document.createElement("canvas"), document.createElement("canvas")],
                    c = this._htmlElementObj,
                    d = c.width,
                    e = c.height;
                a[0].width = d;
                a[0].height = e;
                a[1].width = d;
                a[1].height = e;
                a[2].width = d;
                a[2].height = e;
                a[3].width = d;
                a[3].height = e;
                var f = a[3].getContext("2d");
                f.drawImage(c, 0, 0);
                for (var f = f.getImageData(0, 0, d, e).data, g, h = 0; 4 > h; h++) {
                    g = a[h].getContext("2d");
                    for (var k = g.getImageData(0, 0, d, e), m = k.data, n = 0; n < f.length; n += 4) m[n] = 0 === h ? f[n] : 0, m[n +
                        1] = 1 === h ? f[n + 1] : 0, m[n + 2] = 2 === h ? f[n + 2] : 0, m[n + 3] = f[n + 3];
                    g.putImageData(k, 0, 0)
                }
                c.onload = null;
                return this.channelCache = a
            },
            _grayElementObj: null,
            _backupElement: null,
            _isGray: !1,
            _switchToGray: function(a) {
                this._textureLoaded && this._isGray !== a && ((this._isGray = a) ? (this._backupElement = this._htmlElementObj, this._grayElementObj || (this._grayElementObj = cc.Texture2D._generateGrayTexture(this._htmlElementObj)), this._htmlElementObj = this._grayElementObj) : null !== this._backupElement && (this._htmlElementObj = this._backupElement))
            },
            _generateGrayTexture: function() {
                if (!this._textureLoaded) return null;
                var a = cc.Texture2D._generateGrayTexture(this._htmlElementObj),
                    c = new cc.Texture2D;
                c.initWithElement(a);
                c.handleLoadedTexture();
                return c
            }
        };
        a._generateColorTexture = cc.sys._supportCanvasNewBlendModes ? function(a, c, d, e, f) {
            var g = !1;
            f ? g = !0 : f = document.createElement("canvas");
            var h = this._htmlElementObj;
            e || (e = cc.rect(0, 0, h.width, h.height));
            f.width = e.width;
            f.height = e.height;
            var k = f.getContext("2d");
            k.globalCompositeOperation = "source-over";
            k.fillStyle =
                "rgb(" + (a | 0) + "," + (c | 0) + "," + (d | 0) + ")";
            k.fillRect(0, 0, e.width, e.height);
            k.globalCompositeOperation = "multiply";
            k.drawImage(h, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
            k.globalCompositeOperation = "destination-atop";
            k.drawImage(h, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
            if (g) return f;
            a = new cc.Texture2D;
            a.initWithElement(f);
            a.handleLoadedTexture();
            return a
        } : function(a, c, d, e, f) {
            var g = !1;
            f ? g = !0 : f = document.createElement("canvas");
            var h = this._htmlElementObj;
            e || (e = cc.rect(0, 0, h.width, h.height));
            var k,
                m, h = e.x;
            k = e.y;
            m = e.width;
            e = e.height;
            if (m && e) {
                f.width = m;
                f.height = e;
                var n = f.getContext("2d"),
                    p = cc.textureCache.getTextureColors(this);
                n.globalCompositeOperation = "lighter";
                n.drawImage(p[3], h, k, m, e, 0, 0, m, e);
                0 < a && (n.globalAlpha = a / 255, n.drawImage(p[0], h, k, m, e, 0, 0, m, e));
                0 < c && (n.globalAlpha = c / 255, n.drawImage(p[1], h, k, m, e, 0, 0, m, e));
                0 < d && (n.globalAlpha = d / 255, n.drawImage(p[2], h, k, m, e, 0, 0, m, e));
                if (g) return f;
                a = new cc.Texture2D;
                a.initWithElement(f);
                a.handleLoadedTexture();
                return a
            }
        };
        cc.Texture2D = cc.Class.extend(a);
        cc.Texture2D._generateGrayTexture = function(a, c, d) {
            if (null === a) return null;
            d = d || document.createElement("canvas");
            c = c || cc.rect(0, 0, a.width, a.height);
            d.width = c.width;
            d.height = c.height;
            var e = d.getContext("2d");
            e.drawImage(a, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
            a = e.getImageData(0, 0, c.width, c.height);
            c = a.data;
            for (var f = 0, g = c.length; f < g; f += 4) c[f] = c[f + 1] = c[f + 2] = 0.34 * c[f] + 0.5 * c[f + 1] + 0.16 * c[f + 2];
            e.putImageData(a, 0, 0);
            return d
        }
    } else cc._renderType === cc.game.RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLTexture2D),
        cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTexture2D(), delete cc._tmp.WebGLTexture2D);
    cc.EventHelper.prototype.apply(cc.Texture2D.prototype);
    cc.assert(cc.isFunction(cc._tmp.PrototypeTexture2D), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
    cc._tmp.PrototypeTexture2D();
    delete cc._tmp.PrototypeTexture2D
});
cc.textureCache = {
    _textures: {},
    _textureColorsCache: {},
    _textureKeySeq: 0 | 1E3 * Math.random(),
    _loadedTexturesBefore: {},
    _initializingRenderer: function() {
        var a, b = this._loadedTexturesBefore,
            c = this._textures;
        for (a in b) {
            var d = b[a];
            d.handleLoadedTexture();
            c[a] = d
        }
        this._loadedTexturesBefore = {}
    },
    addPVRTCImage: function(a) {
        cc.log(cc._LogInfos.textureCache_addPVRTCImage)
    },
    addETCImage: function(a) {
        cc.log(cc._LogInfos.textureCache_addETCImage)
    },
    description: function() {
        return "\x3cTextureCache | Number of textures \x3d " +
            this._textures.length + "\x3e"
    },
    textureForKey: function(a) {
        cc.log(cc._LogInfos.textureCache_textureForKey);
        return this.getTextureForKey(a)
    },
    getTextureForKey: function(a) {
        return this._textures[a] || this._textures[cc.loader._getAliase(a)]
    },
    getKeyByTexture: function(a) {
        for (var b in this._textures)
            if (this._textures[b] === a) return b;
        return null
    },
    _generalTextureKey: function(a) {
        return "_textureKey_" + a
    },
    getTextureColors: function(a) {
        var b = a._htmlElementObj,
            c = this.getKeyByTexture(b);
        c || (c = b instanceof HTMLImageElement ?
            b.src : this._generalTextureKey(a.__instanceId));
        this._textureColorsCache[c] || (this._textureColorsCache[c] = a._generateTextureCacheForColor());
        return this._textureColorsCache[c]
    },
    addPVRImage: function(a) {
        cc.log(cc._LogInfos.textureCache_addPVRImage)
    },
    removeAllTextures: function() {
        var a = this._textures,
            b;
        for (b in a) a[b] && a[b].releaseTexture();
        this._textures = {}
    },
    removeTexture: function(a) {
        if (a) {
            var b = this._textures,
                c;
            for (c in b) b[c] === a && (b[c].releaseTexture(), delete b[c])
        }
    },
    removeTextureForKey: function(a) {
        if (null !=
            a) {
            var b = this._textures[a];
            b && (b.releaseTexture(), delete this._textures[a])
        }
    },
    cacheImage: function(a, b) {
        if (b instanceof cc.Texture2D) this._textures[a] = b;
        else {
            var c = new cc.Texture2D;
            c.initWithElement(b);
            c.handleLoadedTexture();
            this._textures[a] = c
        }
    },
    addUIImage: function(a, b) {
        cc.assert(a, cc._LogInfos.textureCache_addUIImage_2);
        if (b && this._textures[b]) return this._textures[b];
        var c = new cc.Texture2D;
        c.initWithImage(a);
        null != b ? this._textures[b] = c : cc.log(cc._LogInfos.textureCache_addUIImage);
        return c
    },
    dumpCachedTextureInfo: function() {
        var a =
            0,
            b = 0,
            c = this._textures,
            d;
        for (d in c) {
            var e = c[d];
            a++;
            e.getHtmlElementObj() instanceof HTMLImageElement ? cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo, d, e.getHtmlElementObj().src, e.pixelsWidth, e.pixelsHeight) : cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, d, e.pixelsWidth, e.pixelsHeight);
            b += e.pixelsWidth * e.pixelsHeight * 4
        }
        c = this._textureColorsCache;
        for (d in c) {
            var e = c[d],
                f;
            for (f in e) {
                var g = e[f];
                a++;
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, d, g.width, g.height);
                b += g.width *
                    g.height * 4
            }
        }
        cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_3, a, b / 1024, (b / 1048576).toFixed(2))
    },
    _clear: function() {
        this._textures = {};
        this._textureColorsCache = {};
        this._textureKeySeq = 0 | 1E3 * Math.random();
        this._loadedTexturesBefore = {}
    }
};
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
        var a = cc.textureCache;
        a.handleLoadedTexture = function(a) {
            var c = this._textures,
                d = c[a];
            d || (d = c[a] = new cc.Texture2D, d.url = a);
            d.handleLoadedTexture()
        };
        a.addImage = function(a, c, d) {
            cc.assert(a, cc._LogInfos.Texture2D_addImage);
            var e = this._textures,
                f = e[a] || e[cc.loader._getAliase(a)];
            if (f) return f.isLoaded() ? c && c.call(d, f) : f.addEventListener("load", function() {
                c && c.call(d, f)
            }, d), f;
            f = e[a] = new cc.Texture2D;
            f.url = a;
            var g = cc.loader.getBasePath ? cc.loader.getBasePath() : cc.loader.resPath;
            cc.loader.loadImg(cc.path.join(g || "", a), function(f, g) {
                if (f) return c && c.call(d, f);
                cc.loader.cache[a] || (cc.loader.cache[a] = g);
                cc.textureCache.handleLoadedTexture(a);
                var m = e[a];
                c && c.call(d, m)
            });
            return f
        };
        a.addImageAsync = a.addImage;
        a = null
    } else cc._renderType === cc.game.RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLTextureCache), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTextureCache(), delete cc._tmp.WebGLTextureCache)
});
cc.TextureAtlas = cc.Class.extend({
    dirty: !1,
    texture: null,
    _indices: null,
    _buffersVBO: null,
    _capacity: 0,
    _quads: null,
    _quadsArrayBuffer: null,
    _quadsWebBuffer: null,
    _quadsReader: null,
    ctor: function(a, b) {
        this._buffersVBO = [];
        cc.isString(a) ? this.initWithFile(a, b) : a instanceof cc.Texture2D && this.initWithTexture(a, b)
    },
    getTotalQuads: function() {
        return this._totalQuads
    },
    getCapacity: function() {
        return this._capacity
    },
    getTexture: function() {
        return this.texture
    },
    setTexture: function(a) {
        this.texture = a
    },
    setDirty: function(a) {
        this.dirty =
            a
    },
    isDirty: function() {
        return this.dirty
    },
    getQuads: function() {
        return this._quads
    },
    setQuads: function(a) {
        this._quads = a
    },
    _copyQuadsToTextureAtlas: function(a, b) {
        if (a)
            for (var c = 0; c < a.length; c++) this._setQuadToArray(a[c], b + c)
    },
    _setQuadToArray: function(a, b) {
        var c = this._quads;
        c[b] ? (c[b].bl = a.bl, c[b].br = a.br, c[b].tl = a.tl, c[b].tr = a.tr) : c[b] = new cc.V3F_C4B_T2F_Quad(a.tl, a.bl, a.tr, a.br, this._quadsArrayBuffer, b * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT)
    },
    description: function() {
        return "\x3ccc.TextureAtlas | totalQuads \x3d" +
            this._totalQuads + "\x3e"
    },
    _setupIndices: function() {
        if (0 !== this._capacity)
            for (var a = this._indices, b = this._capacity, c = 0; c < b; c++) cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP ? (a[6 * c + 0] = 4 * c + 0, a[6 * c + 1] = 4 * c + 0, a[6 * c + 2] = 4 * c + 2, a[6 * c + 3] = 4 * c + 1, a[6 * c + 4] = 4 * c + 3, a[6 * c + 5] = 4 * c + 3) : (a[6 * c + 0] = 4 * c + 0, a[6 * c + 1] = 4 * c + 1, a[6 * c + 2] = 4 * c + 2, a[6 * c + 3] = 4 * c + 3, a[6 * c + 4] = 4 * c + 2, a[6 * c + 5] = 4 * c + 1)
    },
    _setupVBO: function() {
        var a = cc._renderContext;
        this._buffersVBO[0] = a.createBuffer();
        this._buffersVBO[1] = a.createBuffer();
        this._quadsWebBuffer = a.createBuffer();
        this._mapBuffers()
    },
    _mapBuffers: function() {
        var a = cc._renderContext;
        a.bindBuffer(a.ARRAY_BUFFER, this._quadsWebBuffer);
        a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW)
    },
    initWithFile: function(a, b) {
        var c = cc.textureCache.addImage(a);
        if (c) return this.initWithTexture(c, b);
        cc.log(cc._LogInfos.TextureAtlas_initWithFile, a);
        return !1
    },
    initWithTexture: function(a, b) {
        cc.assert(a,
            cc._LogInfos.TextureAtlas_initWithTexture);
        this._capacity = b |= 0;
        this._totalQuads = 0;
        this.texture = a;
        this._quads = [];
        this._indices = new Uint16Array(6 * b);
        var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._quadsArrayBuffer = new ArrayBuffer(c * b);
        this._quadsReader = new Uint8Array(this._quadsArrayBuffer);
        if ((!this._quads || !this._indices) && 0 < b) return !1;
        for (var d = this._quads, e = 0; e < b; e++) d[e] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, e * c);
        this._setupIndices();
        this._setupVBO();
        return this.dirty = !0
    },
    updateQuad: function(a, b) {
        cc.assert(a, cc._LogInfos.TextureAtlas_updateQuad);
        cc.assert(0 <= b && b < this._capacity, cc._LogInfos.TextureAtlas_updateQuad_2);
        this._totalQuads = Math.max(b + 1, this._totalQuads);
        this._setQuadToArray(a, b);
        this.dirty = !0
    },
    insertQuad: function(a, b) {
        cc.assert(b < this._capacity, cc._LogInfos.TextureAtlas_insertQuad_2);
        this._totalQuads++;
        if (this._totalQuads > this._capacity) cc.log(cc._LogInfos.TextureAtlas_insertQuad);
        else {
            var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
                d = b * c,
                e = (this._totalQuads -
                    1 - b) * c;
            this._quads[this._totalQuads - 1] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * c);
            this._quadsReader.set(this._quadsReader.subarray(d, d + e), d + c);
            this._setQuadToArray(a, b);
            this.dirty = !0
        }
    },
    insertQuads: function(a, b, c) {
        c = c || a.length;
        cc.assert(b + c <= this._capacity, cc._LogInfos.TextureAtlas_insertQuads);
        var d = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads += c;
        if (this._totalQuads > this._capacity) cc.log(cc._LogInfos.TextureAtlas_insertQuad);
        else {
            var e = b *
                d,
                f = (this._totalQuads - 1 - b - c) * d,
                g = this._totalQuads - 1 - c,
                h;
            for (h = 0; h < c; h++) this._quads[g + h] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * d);
            this._quadsReader.set(this._quadsReader.subarray(e, e + f), e + d * c);
            for (h = 0; h < c; h++) this._setQuadToArray(a[h], b + h);
            this.dirty = !0
        }
    },
    insertQuadFromIndex: function(a, b) {
        if (a !== b) {
            cc.assert(0 <= b || b < this._totalQuads, cc._LogInfos.TextureAtlas_insertQuadFromIndex);
            cc.assert(0 <= a || a < this._totalQuads, cc._LogInfos.TextureAtlas_insertQuadFromIndex_2);
            var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
                d = this._quadsReader,
                e = d.subarray(a * c, c),
                f;
            a > b ? (f = b * c, d.set(d.subarray(f, f + (a - b) * c), f + c), d.set(e, f)) : (f = (a + 1) * c, d.set(d.subarray(f, f + (b - a) * c), f - c), d.set(e, b * c));
            this.dirty = !0
        }
    },
    removeQuadAtIndex: function(a) {
        cc.assert(a < this._totalQuads, cc._LogInfos.TextureAtlas_removeQuadAtIndex);
        var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads--;
        this._quads.length = this._totalQuads;
        if (a !== this._totalQuads) {
            var c = (a + 1) * b;
            this._quadsReader.set(this._quadsReader.subarray(c,
                c + (this._totalQuads - a) * b), c - b)
        }
        this.dirty = !0
    },
    removeQuadsAtIndex: function(a, b) {
        cc.assert(a + b <= this._totalQuads, cc._LogInfos.TextureAtlas_removeQuadsAtIndex);
        this._totalQuads -= b;
        if (a !== this._totalQuads) {
            var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
                d = (a + b) * c,
                e = a * c;
            this._quadsReader.set(this._quadsReader.subarray(d, d + (this._totalQuads - a) * c), e)
        }
        this.dirty = !0
    },
    removeAllQuads: function() {
        this._totalQuads = this._quads.length = 0
    },
    _setDirty: function(a) {
        this.dirty = a
    },
    resizeCapacity: function(a) {
        if (a === this._capacity) return !0;
        var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
            c = this._capacity;
        this._totalQuads = Math.min(this._totalQuads, a);
        var d = this._capacity = 0 | a,
            e = this._totalQuads;
        if (null === this._quads)
            for (this._quads = [], this._quadsArrayBuffer = new ArrayBuffer(b * d), this._quadsReader = new Uint8Array(this._quadsArrayBuffer), a = 0; a < d; a++) this._quads = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, a * b);
        else {
            var f, g, h = this._quads;
            if (d > c) {
                f = [];
                g = new ArrayBuffer(b * d);
                for (a = 0; a < e; a++) f[a] = new cc.V3F_C4B_T2F_Quad(h[a].tl,
                    h[a].bl, h[a].tr, h[a].br, g, a * b);
                for (; a < d; a++) f[a] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, g, a * b)
            } else
                for (e = Math.max(e, d), f = [], g = new ArrayBuffer(b * d), a = 0; a < e; a++) f[a] = new cc.V3F_C4B_T2F_Quad(h[a].tl, h[a].bl, h[a].tr, h[a].br, g, a * b);
            this._quadsReader = new Uint8Array(g);
            this._quads = f;
            this._quadsArrayBuffer = g
        }
        null === this._indices ? this._indices = new Uint16Array(6 * d) : d > c ? (b = new Uint16Array(6 * d), b.set(this._indices, 0), this._indices = b) : this._indices = this._indices.subarray(0, 6 * d);
        this._setupIndices();
        this._mapBuffers();
        return this.dirty = !0
    },
    increaseTotalQuadsWith: function(a) {
        this._totalQuads += a
    },
    moveQuadsFromIndex: function(a, b, c) {
        if (void 0 === c) {
            if (c = b, b = this._totalQuads - a, cc.assert(c + (this._totalQuads - a) <= this._capacity, cc._LogInfos.TextureAtlas_moveQuadsFromIndex), 0 === b) return
        } else if (cc.assert(c + b <= this._totalQuads, cc._LogInfos.TextureAtlas_moveQuadsFromIndex_2), cc.assert(a < this._totalQuads, cc._LogInfos.TextureAtlas_moveQuadsFromIndex_3), a === c) return;
        var d = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
            e = a * d,
            f = b * d,
            g = this._quadsReader,
            h = g.subarray(e, e + f),
            k = c * d;
        c < a ? (b = c * d, g.set(g.subarray(b, b + (a - c) * d), b + f)) : (b = (a + b) * d, g.set(g.subarray(b, b + (c - a) * d), e));
        g.set(h, k);
        this.dirty = !0
    },
    fillWithEmptyQuadsFromIndex: function(a, b) {
        for (var c = b * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, d = new Uint8Array(this._quadsArrayBuffer, a * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, c), e = 0; e < c; e++) d[e] = 0
    },
    drawQuads: function() {
        this.drawNumberOfQuads(this._totalQuads, 0)
    },
    _releaseBuffer: function() {
        var a = cc._renderContext;
        this._buffersVBO && (this._buffersVBO[0] && a.deleteBuffer(this._buffersVBO[0]),
            this._buffersVBO[1] && a.deleteBuffer(this._buffersVBO[1]));
        this._quadsWebBuffer && a.deleteBuffer(this._quadsWebBuffer)
    }
});
_p = cc.TextureAtlas.prototype;
cc.defineGetterSetter(_p, "totalQuads", _p.getTotalQuads);
cc.defineGetterSetter(_p, "capacity", _p.getCapacity);
cc.defineGetterSetter(_p, "quads", _p.getQuads, _p.setQuads);
cc.TextureAtlas.create = function(a, b) {
    return new cc.TextureAtlas(a, b)
};
cc.TextureAtlas.createWithTexture = cc.TextureAtlas.create;
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    cc._renderType === cc.game.RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLTextureAtlas), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTextureAtlas(), delete cc._tmp.WebGLTextureAtlas)
});
cc.assert(cc.isFunction(cc._tmp.PrototypeTextureAtlas), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
cc._tmp.PrototypeTextureAtlas();
delete cc._tmp.PrototypeTextureAtlas;
cc.Scene = cc.Node.extend({
    _className: "Scene",
    ctor: function() {
        cc.Node.prototype.ctor.call(this);
        this._ignoreAnchorPointForPosition = !0;
        this.setAnchorPoint(0.5, 0.5);
        this.setContentSize(cc.director.getWinSize())
    }
});
cc.Scene.create = function() {
    return new cc.Scene
};
cc.LoaderScene = cc.Scene.extend({
    _interval: null,
    _label: null,
    _className: "LoaderScene",
    cb: null,
    target: null,
    init: function() {
        var a = this,
            b = 200,
            c = a._bgLayer = new cc.LayerColor(cc.color(32, 32, 32, 255));
        a.addChild(c, 0);
        var d = 24,
            e = -b / 2 + 100;
        cc._loaderImage && (cc.loader.loadImg(cc._loaderImage, {
            isCrossOrigin: !1
        }, function(c, d) {
            b = d.height;
            a._initStage(d, cc.visibleRect.center)
        }), d = 14, e = -b / 2 - 10);
        d = a._label = new cc.LabelTTF("Loading... 0%", "Arial", d);
        d.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, e)));
        d.setColor(cc.color(180,
            180, 180));
        c.addChild(this._label, 10);
        return !0
    },
    _initStage: function(a, b) {
        var c = this._texture2d = new cc.Texture2D;
        c.initWithElement(a);
        c.handleLoadedTexture();
        c = this._logo = new cc.Sprite(c);
        c.setScale(cc.contentScaleFactor());
        c.x = b.x;
        c.y = b.y;
        this._bgLayer.addChild(c, 10)
    },
    onEnter: function() {
        cc.Node.prototype.onEnter.call(this);
        this.schedule(this._startLoading, 0.3)
    },
    onExit: function() {
        cc.Node.prototype.onExit.call(this);
        this._label.setString("Loading... 0%")
    },
    initWithResources: function(a, b, c) {
        cc.isString(a) &&
            (a = [a]);
        this.resources = a || [];
        this.cb = b;
        this.target = c
    },
    _startLoading: function() {
        var a = this;
        a.unschedule(a._startLoading);
        cc.loader.load(a.resources, function(b, c, d) {
            b = Math.min(d / c * 100 | 0, 100);
            a._label.setString("Loading... " + b + "%")
        }, function() {
            a.cb && a.cb.call(a.target)
        })
    },
    _updateTransform: function() {
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        this._bgLayer._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        this._label._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        this._logo._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    }
});
cc.LoaderScene.preload = function(a, b, c) {
    var d = cc;
    d.loaderScene || (d.loaderScene = new cc.LoaderScene, d.loaderScene.init(), cc.eventManager.addCustomListener(cc.Director.EVENT_PROJECTION_CHANGED, function() {
        d.loaderScene._updateTransform()
    }));
    d.loaderScene.initWithResources(a, b, c);
    cc.director.runScene(d.loaderScene);
    return d.loaderScene
};
cc.Layer = cc.Node.extend({
    _className: "Layer",
    ctor: function() {
        cc.Node.prototype.ctor.call(this);
        this._ignoreAnchorPointForPosition = !0;
        this.setAnchorPoint(0.5, 0.5);
        this.setContentSize(cc.winSize);
        this._cascadeOpacityEnabled = this._cascadeColorEnabled = !1
    },
    bake: function() {
        this._renderCmd.bake()
    },
    unbake: function() {
        this._renderCmd.unbake()
    },
    isBaked: function() {
        return this._renderCmd._isBaked
    },
    visit: function(a) {
        if (this._visible) {
            var b = cc.renderer,
                c = this._renderCmd;
            c.visit(a && a._renderCmd);
            if (c._isBaked) b.pushRenderCommand(c),
                c._bakeSprite.visit(this);
            else {
                var d = this._children,
                    e = d.length,
                    f;
                if (0 < e) {
                    this._reorderChildDirty && this.sortAllChildren();
                    for (a = 0; a < e; a++)
                        if (f = d[a], 0 > f._localZOrder) f.visit(this);
                        else break;
                    for (b.pushRenderCommand(c); a < e; a++) d[a].visit(this)
                } else b.pushRenderCommand(c)
            }
            c._dirtyFlag = 0
        }
    },
    addChild: function(a, b, c) {
        cc.Node.prototype.addChild.call(this, a, b, c);
        this._renderCmd._bakeForAddChild(a)
    },
    _createRenderCmd: function() {
        return cc._renderType === cc.game.RENDER_TYPE_CANVAS ? new cc.Layer.CanvasRenderCmd(this) :
            new cc.Layer.WebGLRenderCmd(this)
    }
});
cc.Layer.create = function() {
    return new cc.Layer
};
cc.LayerColor = cc.Layer.extend({
    _blendFunc: null,
    _className: "LayerColor",
    getBlendFunc: function() {
        return this._blendFunc
    },
    changeWidthAndHeight: function(a, b) {
        this.width = a;
        this.height = b
    },
    changeWidth: function(a) {
        this.width = a
    },
    changeHeight: function(a) {
        this.height = a
    },
    setOpacityModifyRGB: function(a) {},
    isOpacityModifyRGB: function() {
        return !1
    },
    ctor: function(a, b, c) {
        cc.Layer.prototype.ctor.call(this);
        this._blendFunc = cc.BlendFunc._alphaNonPremultiplied();
        cc.LayerColor.prototype.init.call(this, a, b, c)
    },
    init: function(a,
        b, c) {
        var d = cc.director.getWinSize();
        a = a || cc.color(0, 0, 0, 255);
        b = void 0 === b ? d.width : b;
        c = void 0 === c ? d.height : c;
        d = this._realColor;
        d.r = a.r;
        d.g = a.g;
        d.b = a.b;
        this._realOpacity = a.a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty);
        cc.LayerColor.prototype.setContentSize.call(this, b, c);
        return !0
    },
    visit: function() {
        if (this._visible) {
            var a = cc.renderer,
                b = this._renderCmd;
            b.visit(parent && parent._renderCmd);
            if (b._isBaked) a.pushRenderCommand(b._bakeRenderCmd), b._bakeSprite._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty),
                b._bakeSprite.visit(this);
            else {
                var c, d = this._children,
                    e = d.length;
                if (0 < e) {
                    this._reorderChildDirty && this.sortAllChildren();
                    for (c = 0; c < e; c++)
                        if (child = d[c], 0 > child._localZOrder) child.visit(this);
                        else break;
                    for (a.pushRenderCommand(b); c < e; c++) d[c].visit(this)
                } else a.pushRenderCommand(b)
            }
            b._dirtyFlag = 0
        }
    },
    setBlendFunc: function(a, b) {
        var c = this._blendFunc;
        void 0 === b ? (c.src = a.src, c.dst = a.dst) : (c.src = a, c.dst = b);
        this._renderCmd.updateBlendFunc(c)
    },
    _createRenderCmd: function() {
        return cc._renderType === cc.game.RENDER_TYPE_CANVAS ?
            new cc.LayerColor.CanvasRenderCmd(this) : new cc.LayerColor.WebGLRenderCmd(this)
    }
});
cc.LayerColor.create = function(a, b, c) {
    return new cc.LayerColor(a, b, c)
};
(function() {
    var a = cc.LayerColor.prototype;
    cc.defineGetterSetter(a, "width", a._getWidth, a._setWidth);
    cc.defineGetterSetter(a, "height", a._getHeight, a._setHeight)
})();
cc.LayerGradient = cc.LayerColor.extend({
    _endColor: null,
    _startOpacity: 255,
    _endOpacity: 255,
    _alongVector: null,
    _compressedInterpolation: !1,
    _className: "LayerGradient",
    _colorStops: [],
    ctor: function(a, b, c, d) {
        cc.LayerColor.prototype.ctor.call(this);
        this._endColor = cc.color(0, 0, 0, 255);
        this._alongVector = cc.p(0, -1);
        this._endOpacity = this._startOpacity = 255;
        d && d instanceof Array ? (this._colorStops = d, d.splice(0, 0, {
            p: 0,
            color: a || cc.color.BLACK
        }), d.push({
            p: 1,
            color: b || cc.color.BLACK
        })) : this._colorStops = [{
            p: 0,
            color: a || cc.color.BLACK
        }, {
            p: 1,
            color: b || cc.color.BLACK
        }];
        cc.LayerGradient.prototype.init.call(this, a, b, c, d)
    },
    init: function(a, b, c, d) {
        a = a || cc.color(0, 0, 0, 255);
        b = b || cc.color(0, 0, 0, 255);
        c = c || cc.p(0, -1);
        d = this._endColor;
        this._startOpacity = a.a;
        d.r = b.r;
        d.g = b.g;
        d.b = b.b;
        this._endOpacity = b.a;
        this._alongVector = c;
        this._compressedInterpolation = !0;
        cc.LayerColor.prototype.init.call(this, cc.color(a.r, a.g, a.b, 255));
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty | cc.Node._dirtyFlags.gradientDirty);
        return !0
    },
    setContentSize: function(a, b) {
        cc.LayerColor.prototype.setContentSize.call(this, a, b);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    _setWidth: function(a) {
        cc.LayerColor.prototype._setWidth.call(this, a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    _setHeight: function(a) {
        cc.LayerColor.prototype._setHeight.call(this, a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    getStartColor: function() {
        return cc.color(this._realColor)
    },
    setStartColor: function(a) {
        this.color =
            a;
        var b = this._colorStops;
        b && 0 < b.length && (b = b[0].color, b.r = a.r, b.g = a.g, b.b = a.b)
    },
    setEndColor: function(a) {
        var b = this._endColor;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        (b = this._colorStops) && 0 < b.length && (b = b[b.length - 1].color, b.r = a.r, b.g = a.g, b.b = a.b);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty)
    },
    getEndColor: function() {
        return cc.color(this._endColor)
    },
    setStartOpacity: function(a) {
        this._startOpacity = a;
        var b = this._colorStops;
        b && 0 < b.length && (b[0].color.a = a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    getStartOpacity: function() {
        return this._startOpacity
    },
    setEndOpacity: function(a) {
        this._endOpacity = a;
        var b = this._colorStops;
        b && 0 < b.length && (b[b.length - 1].color.a = a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    getEndOpacity: function() {
        return this._endOpacity
    },
    setVector: function(a) {
        this._alongVector.x = a.x;
        this._alongVector.y = a.y;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    getVector: function() {
        return cc.p(this._alongVector.x, this._alongVector.y)
    },
    isCompressedInterpolation: function() {
        return this._compressedInterpolation
    },
    setCompressedInterpolation: function(a) {
        this._compressedInterpolation = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    getColorStops: function() {
        return this._colorStops
    },
    setColorStops: function(a) {
        this._colorStops = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty | cc.Node._dirtyFlags.gradientDirty)
    },
    _createRenderCmd: function() {
        return cc._renderType === cc.game.RENDER_TYPE_CANVAS ? new cc.LayerGradient.CanvasRenderCmd(this) : new cc.LayerGradient.WebGLRenderCmd(this)
    }
});
cc.LayerGradient.create = function(a, b, c, d) {
    return new cc.LayerGradient(a, b, c, d)
};
(function() {
    var a = cc.LayerGradient.prototype;
    cc.defineGetterSetter(a, "startColor", a.getStartColor, a.setStartColor);
    cc.defineGetterSetter(a, "endColor", a.getEndColor, a.setEndColor);
    cc.defineGetterSetter(a, "startOpacity", a.getStartOpacity, a.setStartOpacity);
    cc.defineGetterSetter(a, "endOpacity", a.getEndOpacity, a.setEndOpacity);
    cc.defineGetterSetter(a, "vector", a.getVector, a.setVector);
    cc.defineGetterSetter(a, "colorStops", a.getColorStops, a.setColorStops)
})();
cc.LayerMultiplex = cc.Layer.extend({
    _enabledLayer: 0,
    _layers: null,
    _className: "LayerMultiplex",
    ctor: function(a) {
        cc.Layer.prototype.ctor.call(this);
        a instanceof Array ? cc.LayerMultiplex.prototype.initWithLayers.call(this, a) : cc.LayerMultiplex.prototype.initWithLayers.call(this, Array.prototype.slice.call(arguments))
    },
    initWithLayers: function(a) {
        0 < a.length && null == a[a.length - 1] && cc.log(cc._LogInfos.LayerMultiplex_initWithLayers);
        this._layers = a;
        this._enabledLayer = 0;
        this.addChild(this._layers[this._enabledLayer]);
        return !0
    },
    switchTo: function(a) {
        a >= this._layers.length ? cc.log(cc._LogInfos.LayerMultiplex_switchTo) : (this.removeChild(this._layers[this._enabledLayer], !0), this._enabledLayer = a, this.addChild(this._layers[a]))
    },
    switchToAndReleaseMe: function(a) {
        a >= this._layers.length ? cc.log(cc._LogInfos.LayerMultiplex_switchToAndReleaseMe) : (this.removeChild(this._layers[this._enabledLayer], !0), this._layers[this._enabledLayer] = null, this._enabledLayer = a, this.addChild(this._layers[a]))
    },
    addLayer: function(a) {
        a ? this._layers.push(a) :
            cc.log(cc._LogInfos.LayerMultiplex_addLayer)
    }
});
cc.LayerMultiplex.create = function() {
    return new cc.LayerMultiplex(Array.prototype.slice.call(arguments))
};
(function() {
    cc.Layer.CanvasRenderCmd = function(a) {
        this._rootCtor(a);
        this._isBaked = !1;
        this._bakeSprite = null;
        this._canUseDirtyRegion = !0;
        this._updateCache = 2
    };
    var a = cc.Layer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.Layer.CanvasRenderCmd;
    a._layerCmdCtor = cc.Layer.CanvasRenderCmd;
    a._setCacheDirty = function(a) {
        a && 0 === this._updateCache && (this._updateCache = 2);
        !1 === this._cacheDirty && (this._cacheDirty = !0, (a = this._cachedParent) && a !== this && a._setNodeDirtyForCache &&
            a._setNodeDirtyForCache())
    };
    a.updateStatus = function() {
        var a = cc.Node._dirtyFlags;
        this._dirtyFlag & a.orderDirty && (this._cacheDirty = !0, 0 === this._updateCache && (this._updateCache = 2), this._dirtyFlag &= ~a.orderDirty);
        this.originUpdateStatus()
    };
    a._syncStatus = function(a) {
        var c = cc.Node._dirtyFlags,
            d = this._dirtyFlag;
        if (this._isBaked || d & c.orderDirty) this._cacheDirty = !0, 0 === this._updateCache && (this._updateCache = 2), this._dirtyFlag &= ~c.orderDirty;
        this._originSyncStatus(a)
    };
    a.transform = function(a, c) {
        this._worldTransform ||
            (this._worldTransform = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: 0,
                ty: 0
            });
        var d = this._worldTransform,
            e = d.a,
            f = d.b,
            g = d.c,
            h = d.d;
        this.originTransform(a, c);
        d.a === e && d.b === f && d.c === g && d.d === h || 0 !== this._updateCache || (this._updateCache = 2)
    };
    a.bake = function() {
        if (!this._isBaked) {
            this._needDraw = !0;
            this._isBaked = this._cacheDirty = cc.renderer.childrenOrderDirty = !0;
            0 === this._updateCache && (this._updateCache = 2);
            for (var a = this._node._children, c = 0, d = a.length; c < d; c++) a[c]._renderCmd._setCachedParent(this);
            this._bakeSprite || (this._bakeSprite =
                new cc.BakeSprite, this._bakeSprite.setAnchorPoint(0, 0))
        }
    };
    a.unbake = function() {
        if (this._isBaked) {
            cc.renderer.childrenOrderDirty = !0;
            this._isBaked = this._needDraw = !1;
            this._cacheDirty = !0;
            0 === this._updateCache && (this._updateCache = 2);
            for (var a = this._node._children, c = 0, d = a.length; c < d; c++) a[c]._renderCmd._setCachedParent(null)
        }
    };
    a.isBaked = function() {
        return this._isBaked
    };
    a.rendering = function() {
        if (this._cacheDirty) {
            var a = this._node,
                c = a._children,
                d = this._bakeSprite;
            this.transform(this.getParentRenderCmd(), !0);
            var e = this._getBoundingBoxForBake();
            e.width = 0 | e.width + 0.5;
            e.height = 0 | e.height + 0.5;
            var f = d.getCacheContext(),
                g = f.getContext();
            d.setPosition(e.x, e.y);
            if (0 < this._updateCache) {
                d.resetCanvasSize(e.width, e.height);
                f.setOffset(0 - e.x, g.canvas.height - e.height + e.y);
                a.sortAllChildren();
                cc.renderer._turnToCacheMode(this.__instanceId);
                a = 0;
                for (e = c.length; a < e; a++) c[a].visit(this);
                cc.renderer._renderingToCacheCanvas(f, this.__instanceId);
                d.transform();
                this._updateCache--
            }
            this._cacheDirty = !1
        }
    };
    a._bakeForAddChild = function(a) {
        a._parent ===
            this._node && this._isBaked && a._renderCmd._setCachedParent(this)
    };
    a._getBoundingBoxForBake = function() {
        var a = null,
            c = this._node;
        if (!c._children || 0 === c._children.length) return cc.rect(0, 0, 10, 10);
        for (var d = c.getNodeToWorldTransform(), c = c._children, e = 0, f = c.length; e < f; e++) {
            var g = c[e];
            g && g._visible && (a ? (g = g._getBoundingBoxToCurrentNode(d)) && (a = cc.rectUnion(a, g)) : a = g._getBoundingBoxToCurrentNode(d))
        }
        return a
    }
})();
(function() {
    cc.LayerColor.CanvasRenderCmd = function(a) {
        this._layerCmdCtor(a);
        this._needDraw = !0;
        this._blendFuncStr = "source-over";
        this._bakeRenderCmd = new cc.CustomRenderCmd(this, this._bakeRendering)
    };
    var a = cc.LayerColor.CanvasRenderCmd.prototype = Object.create(cc.Layer.CanvasRenderCmd.prototype);
    a.constructor = cc.LayerColor.CanvasRenderCmd;
    a.unbake = function() {
        cc.Layer.CanvasRenderCmd.prototype.unbake.call(this);
        this._needDraw = !0
    };
    a.rendering = function(a, c, d) {
        a = a || cc._renderContext;
        var e = a.getContext(),
            f = this._node,
            g = this._displayedColor,
            h = this._displayedOpacity / 255,
            k = f._contentSize.width,
            f = f._contentSize.height;
        0 !== h && (a.setCompositeOperation(this._blendFuncStr), a.setGlobalAlpha(h), a.setFillStyle("rgba(" + (0 | g.r) + "," + (0 | g.g) + "," + (0 | g.b) + ", 1)"), a.setTransform(this._worldTransform, c, d), e.fillRect(0, 0, k, -f), cc.g_NumberOfDraws++)
    };
    a.updateBlendFunc = function(a) {
        this._blendFuncStr = cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc(a)
    };
    a._updateSquareVertices = a._updateSquareVerticesWidth = a._updateSquareVerticesHeight =
        function() {};
    a._bakeRendering = function() {
        if (this._cacheDirty) {
            var a = this._node,
                c = this._bakeSprite,
                d = a._children,
                e, f = d.length;
            this.transform(this.getParentRenderCmd(), !0);
            e = this._getBoundingBoxForBake();
            e.width = 0 | e.width + 0.5;
            e.height = 0 | e.height + 0.5;
            var g = c.getCacheContext(),
                h = g.getContext();
            c.setPosition(e.x, e.y);
            if (0 < this._updateCache) {
                h.fillStyle = g._currentFillStyle;
                c.resetCanvasSize(e.width, e.height);
                g.setOffset(0 - e.x, h.canvas.height - e.height + e.y);
                cc.renderer._turnToCacheMode(this.__instanceId);
                if (0 < f) {
                    a.sortAllChildren();
                    for (e = 0; e < f; e++)
                        if (h = d[e], 0 > h._localZOrder) h.visit(a);
                        else break;
                    for (cc.renderer.pushRenderCommand(this); e < f; e++) d[e].visit(a)
                } else cc.renderer.pushRenderCommand(this);
                cc.renderer._renderingToCacheCanvas(g, this.__instanceId);
                c.transform();
                this._updateCache--
            }
            this._cacheDirty = !1
        }
    };
    a._getBoundingBoxForBake = function() {
        var a = this._node,
            c = cc.rect(0, 0, a._contentSize.width, a._contentSize.height),
            d = a.getNodeToWorldTransform(),
            c = cc.rectApplyAffineTransform(c, a.getNodeToWorldTransform());
        if (!a._children || 0 === a._children.length) return c;
        for (var a = a._children, e = 0; e < a.length; e++) {
            var f = a[e];
            f && f._visible && (f = f._getBoundingBoxToCurrentNode(d), c = cc.rectUnion(c, f))
        }
        return c
    }
})();
(function() {
    cc.LayerGradient.CanvasRenderCmd = function(a) {
        cc.LayerColor.CanvasRenderCmd.call(this, a);
        this._needDraw = !0;
        this._startPoint = cc.p(0, 0);
        this._endPoint = cc.p(0, 0);
        this._endStopStr = this._startStopStr = null
    };
    var a = cc.LayerGradient.CanvasRenderCmd.prototype = Object.create(cc.LayerColor.CanvasRenderCmd.prototype);
    a.constructor = cc.LayerGradient.CanvasRenderCmd;
    a.rendering = function(a, c, d) {
        a = a || cc._renderContext;
        var e = a.getContext(),
            f = this._node,
            g = this._displayedOpacity / 255;
        if (0 !== g) {
            var h = f._contentSize.width,
                k = f._contentSize.height;
            a.setCompositeOperation(this._blendFuncStr);
            a.setGlobalAlpha(g);
            g = e.createLinearGradient(this._startPoint.x, this._startPoint.y, this._endPoint.x, this._endPoint.y);
            if (f._colorStops)
                for (var m = 0; m < f._colorStops.length; m++) g.addColorStop(f._colorStops[m].p, this._colorStopsStr[m]);
            else g.addColorStop(0, this._startStopStr), g.addColorStop(1, this._endStopStr);
            a.setFillStyle(g);
            a.setTransform(this._worldTransform, c, d);
            e.fillRect(0, 0, h, -k);
            cc.g_NumberOfDraws++
        }
    };
    a.updateStatus = function() {
        var a =
            cc.Node._dirtyFlags;
        this._dirtyFlag & a.gradientDirty && (this._dirtyFlag |= a.colorDirty, this._dirtyFlag &= ~a.gradientDirty);
        this.originUpdateStatus()
    };
    a._syncStatus = function(a) {
        var c = cc.Node._dirtyFlags;
        this._dirtyFlag & c.gradientDirty && (this._dirtyFlag |= c.colorDirty, this._dirtyFlag &= ~c.gradientDirty);
        this._originSyncStatus(a)
    };
    a._updateColor = function() {
        var a = this._node,
            c = a._contentSize,
            d = 0.5 * c.width,
            c = 0.5 * c.height,
            e = cc.pAngleSigned(cc.p(0, -1), a._alongVector),
            e = cc.pRotateByAngle(cc.p(0, -1), cc.p(0, 0), e),
            f = Math.min(Math.abs(1 / e.x), Math.abs(1 / e.y));
        this._startPoint.x = d * -e.x * f + d;
        this._startPoint.y = c * e.y * f - c;
        this._endPoint.x = d * e.x * f + d;
        this._endPoint.y = c * -e.y * f - c;
        d = this._displayedColor;
        c = a._endColor;
        e = a._startOpacity / 255;
        f = a._endOpacity / 255;
        this._startStopStr = "rgba(" + Math.round(d.r) + "," + Math.round(d.g) + "," + Math.round(d.b) + "," + e.toFixed(4) + ")";
        this._endStopStr = "rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + f.toFixed(4) + ")";
        if (a._colorStops)
            for (this._endOpacity = this._startOpacity = 0,
                this._colorStopsStr = [], d = 0; d < a._colorStops.length; d++) c = a._colorStops[d].color, e = null == c.a ? 1 : c.a / 255, this._colorStopsStr.push("rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + e.toFixed(4) + ")")
    }
})();
(function() {
    cc.Layer.WebGLRenderCmd = function(a) {
        this._rootCtor(a);
        this._isBaked = !1
    };
    var a = cc.Layer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.Layer.WebGLRenderCmd;
    a._layerCmdCtor = cc.Layer.WebGLRenderCmd;
    a.bake = function() {};
    a.unbake = function() {};
    a._bakeForAddChild = function() {}
})();
(function() {
    cc.LayerColor.WebGLRenderCmd = function(a) {
        this._layerCmdCtor(a);
        this._needDraw = !0;
        this._matrix = null;
        this.initData(4);
        this._color = new Uint32Array(1);
        this._vertexBuffer = null;
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR)
    };
    var a = cc.LayerColor.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);
    a.constructor = cc.LayerColor.WebGLRenderCmd;
    a.initData = function(a) {
        this._data = new ArrayBuffer(16 * a);
        this._positionView = new Float32Array(this._data);
        this._colorView =
            new Uint32Array(this._data);
        this._dataDirty = !0
    };
    a.transform = function(a, c) {
        this.originTransform(a, c);
        var d = this._node,
            e = d._contentSize.width,
            f = d._contentSize.height,
            g = this._positionView;
        g[4] = e;
        g[9] = f;
        g[12] = e;
        g[13] = f;
        g[2].z = g[6] = g[10] = g[14] = d._vertexZ;
        this._dataDirty = !0
    };
    a._updateColor = function() {
        var a = this._displayedColor;
        this._color[0] = this._displayedOpacity << 24 | a.b << 16 | a.g << 8 | a.r;
        for (var a = this._colorView, c = 0; 4 > c; c++) a[4 * c + 3] = this._color[0];
        this._dataDirty = !0
    };
    a.rendering = function(a) {
        a = a || cc._renderContext;
        var c = this._node;
        this._matrix || (this._matrix = new cc.math.Matrix4, this._matrix.identity());
        var d = this._worldTransform;
        this._matrix.mat[0] = d.a;
        this._matrix.mat[4] = d.c;
        this._matrix.mat[12] = d.tx;
        this._matrix.mat[1] = d.b;
        this._matrix.mat[5] = d.d;
        this._matrix.mat[13] = d.ty;
        this._dataDirty && (this._vertexBuffer || (this._vertexBuffer = a.createBuffer()), a.bindBuffer(a.ARRAY_BUFFER, this._vertexBuffer), a.bufferData(a.ARRAY_BUFFER, this._data, a.DYNAMIC_DRAW), this._dataDirty = !1);
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._matrix);
        cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst);
        a.bindBuffer(a.ARRAY_BUFFER, this._vertexBuffer);
        a.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        a.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, a.FLOAT, !1, 16, 0);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 16, 12);
        a.drawArrays(a.TRIANGLE_STRIP, 0, 4)
    };
    a.updateBlendFunc = function(a) {}
})();
(function() {
    cc.LayerGradient.WebGLRenderCmd = function(a) {
        cc.LayerColor.WebGLRenderCmd.call(this, a);
        this._needDraw = !0;
        this._clipRect = new cc.Rect;
        this._clippingRectDirty = !1
    };
    var a = cc.LayerGradient.WebGLRenderCmd.prototype = Object.create(cc.LayerColor.WebGLRenderCmd.prototype);
    a.constructor = cc.LayerGradient.WebGLRenderCmd;
    a.updateStatus = function() {
        var a = cc.Node._dirtyFlags;
        this._dirtyFlag & a.gradientDirty && (this._dirtyFlag |= a.colorDirty, this._updateVertex(), this._dirtyFlag &= ~a.gradientDirty);
        this.originUpdateStatus()
    };
    a._syncStatus = function(a) {
        var c = cc.Node._dirtyFlags;
        this._dirtyFlag & c.gradientDirty && (this._dirtyFlag |= c.colorDirty, this._updateVertex(), this._dirtyFlag &= ~c.gradientDirty);
        this._originSyncStatus(a)
    };
    a.transform = function(a, c) {
        this.originTransform(a, c);
        this._updateVertex()
    };
    a._updateVertex = function() {
        var a = this._node,
            c = a._colorStops;
        if (c && !(2 > c.length)) {
            this._clippingRectDirty = !0;
            var d, e = c.length,
                f = 2 * e,
                g = a._contentSize;
            this._positionView.length / 4 < f && this.initData(f);
            var h = Math.PI + cc.pAngleSigned(cc.p(0, -1), a._alongVector),
                f = cc.p(g.width / 2, g.height / 2);
            d = Math.round(cc.radiansToDegrees(h));
            var k = cc.affineTransformMake(1, 0, 0, 1, f.x, f.y),
                k = cc.affineTransformRotate(k, h),
                m;
            90 > d ? (m = cc.p(-f.x, f.y), d = cc.p(f.x, f.y)) : 180 > d ? (m = cc.p(f.x, f.y), d = cc.p(f.x, -f.y)) : 270 > d ? (m = cc.p(f.x, -f.y), d = cc.p(-f.x, -f.y)) : (m = cc.p(-f.x, -f.y), d = cc.p(-f.x, f.y));
            var n = Math.sin(h),
                h = Math.cos(h);
            m = Math.abs((m.x * h - m.y * n) / f.x);
            d = Math.abs((d.x * n + d.y * h) / f.y);
            k = cc.affineTransformScale(k, m, d);
            n = this._positionView;
            for (d = 0; d < e; d++) {
                m = c[d].p * g.height;
                var p = cc.pointApplyAffineTransform(-f.x, m - f.y, k),
                    h = 8 * d;
                n[h] = p.x;
                n[h + 1] = p.y;
                n[h + 2] = a._vertexZ;
                m = cc.pointApplyAffineTransform(g.width - f.x, m - f.y, k);
                h += 4;
                n[h] = m.x;
                n[h + 1] = m.y;
                n[h + 2] = a._vertexZ
            }
            this._dataDirty = !0
        }
    };
    a._updateColor = function() {
        var a = this._node._colorStops;
        if (a && !(2 > a.length)) {
            var c = a.length,
                d, e = this._colorView,
                f = this._displayedOpacity / 255;
            for (i = 0; i < c; i++) d = a[i].color, this._color[0] = d.a * f << 24 | d.b << 16 | d.g << 8 | d.r, d = 8 * i, e[d + 3] = this._color[0], d += 4, e[d + 3] = this._color[0];
            this._dataDirty = !0
        }
    };
    a.rendering =
        function(a) {
            a = a || cc._renderContext;
            var c = this._node;
            this._matrix || (this._matrix = new cc.math.Matrix4, this._matrix.identity());
            var d = this._getClippingRect();
            a.enable(a.SCISSOR_TEST);
            cc.view.setScissorInPoints(d.x, d.y, d.width, d.height);
            d = this._worldTransform;
            this._matrix.mat[0] = d.a;
            this._matrix.mat[4] = d.c;
            this._matrix.mat[12] = d.tx;
            this._matrix.mat[1] = d.b;
            this._matrix.mat[5] = d.d;
            this._matrix.mat[13] = d.ty;
            this._dataDirty && (this._vertexBuffer || (this._vertexBuffer = gl.createBuffer()), gl.bindBuffer(gl.ARRAY_BUFFER,
                this._vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW), this._dataDirty = !1);
            this._shaderProgram.use();
            this._shaderProgram._setUniformForMVPMatrixWithMat4(this._matrix);
            cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, !1, 16, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR,
                4, gl.UNSIGNED_BYTE, !0, 16, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            a.disable(a.SCISSOR_TEST)
        };
    a._getClippingRect = function() {
        if (this._clippingRectDirty) {
            var a = this._node,
                c = cc.rect(0, 0, a._contentSize.width, a._contentSize.height),
                a = a.getNodeToWorldTransform();
            this._clipRect = cc._rectApplyAffineTransformIn(c, a)
        }
        return this._clipRect
    }
})();
cc._tmp.PrototypeSprite = function() {
    var a = cc.Sprite.prototype;
    cc.defineGetterSetter(a, "opacityModifyRGB", a.isOpacityModifyRGB, a.setOpacityModifyRGB);
    cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
    cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
    cc.defineGetterSetter(a, "flippedX", a.isFlippedX, a.setFlippedX);
    cc.defineGetterSetter(a, "flippedY", a.isFlippedY, a.setFlippedY);
    cc.defineGetterSetter(a, "offsetX", a._getOffsetX);
    cc.defineGetterSetter(a, "offsetY", a._getOffsetY);
    cc.defineGetterSetter(a,
        "texture", a.getTexture, a.setTexture);
    cc.defineGetterSetter(a, "textureRectRotated", a.isTextureRectRotated);
    cc.defineGetterSetter(a, "batchNode", a.getBatchNode, a.setBatchNode);
    cc.defineGetterSetter(a, "quad", a.getQuad)
};
cc.Sprite = cc.Node.extend({
    dirty: !1,
    atlasIndex: 0,
    textureAtlas: null,
    _batchNode: null,
    _recursiveDirty: null,
    _hasChildren: null,
    _shouldBeHidden: !1,
    _transformToBatch: null,
    _blendFunc: null,
    _texture: null,
    _rect: null,
    _rectRotated: !1,
    _offsetPosition: null,
    _unflippedOffsetPositionFromCenter: null,
    _opacityModifyRGB: !1,
    _flippedX: !1,
    _flippedY: !1,
    _textureLoaded: !1,
    _className: "Sprite",
    ctor: function(a, b, c) {
        cc.Node.prototype.ctor.call(this);
        this.setAnchorPoint(0.5, 0.5);
        this._loader = new cc.Sprite.LoadManager;
        this._shouldBeHidden = !1;
        this._offsetPosition = cc.p(0, 0);
        this._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        this._blendFunc = {
            src: cc.BLEND_SRC,
            dst: cc.BLEND_DST
        };
        this._rect = cc.rect(0, 0, 0, 0);
        this._softInit(a, b, c)
    },
    textureLoaded: function() {
        return this._textureLoaded
    },
    addLoadedEventListener: function(a, b) {
        this.addEventListener("load", a, b)
    },
    isDirty: function() {
        return this.dirty
    },
    setDirty: function(a) {
        this.dirty = a
    },
    isTextureRectRotated: function() {
        return this._rectRotated
    },
    getAtlasIndex: function() {
        return this.atlasIndex
    },
    setAtlasIndex: function(a) {
        this.atlasIndex =
            a
    },
    getTextureRect: function() {
        return cc.rect(this._rect)
    },
    getTextureAtlas: function() {
        return this.textureAtlas
    },
    setTextureAtlas: function(a) {
        this.textureAtlas = a
    },
    getOffsetPosition: function() {
        return cc.p(this._offsetPosition)
    },
    _getOffsetX: function() {
        return this._offsetPosition.x
    },
    _getOffsetY: function() {
        return this._offsetPosition.y
    },
    getBlendFunc: function() {
        return this._blendFunc
    },
    initWithSpriteFrame: function(a) {
        cc.assert(a, cc._LogInfos.Sprite_initWithSpriteFrame);
        return this.setSpriteFrame(a)
    },
    initWithSpriteFrameName: function(a) {
        cc.assert(a,
            cc._LogInfos.Sprite_initWithSpriteFrameName);
        var b = cc.spriteFrameCache.getSpriteFrame(a);
        cc.assert(b, a + cc._LogInfos.Sprite_initWithSpriteFrameName1);
        return this.initWithSpriteFrame(b)
    },
    useBatchNode: function(a) {},
    setVertexRect: function(a) {
        var b = this._rect;
        b.x = a.x;
        b.y = a.y;
        b.width = a.width;
        b.height = a.height;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setFlippedX: function(a) {
        this._flippedX !== a && (this._flippedX = a, this.setTextureRect(this._rect, this._rectRotated, this._contentSize),
            this.setNodeDirty(!0))
    },
    setFlippedY: function(a) {
        this._flippedY !== a && (this._flippedY = a, this.setTextureRect(this._rect, this._rectRotated, this._contentSize), this.setNodeDirty(!0))
    },
    isFlippedX: function() {
        return this._flippedX
    },
    isFlippedY: function() {
        return this._flippedY
    },
    setOpacityModifyRGB: function(a) {
        this._opacityModifyRGB !== a && (this._opacityModifyRGB = a, this._renderCmd._setColorDirty())
    },
    isOpacityModifyRGB: function() {
        return this._opacityModifyRGB
    },
    setDisplayFrameWithAnimationName: function(a, b) {
        cc.assert(a,
            cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_3);
        var c = cc.animationCache.getAnimation(a);
        c ? (c = c.getFrames()[b]) ? this.setSpriteFrame(c.getSpriteFrame()) : cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_2) : cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName)
    },
    getBatchNode: function() {
        return this._batchNode
    },
    getTexture: function() {
        return this._texture
    },
    _softInit: function(a, b, c) {
        if (void 0 === a) cc.Sprite.prototype.init.call(this);
        else if ("string" === typeof a) "#" === a[0] ? (b = a.substr(1,
            a.length - 1), (b = cc.spriteFrameCache.getSpriteFrame(b)) ? this.initWithSpriteFrame(b) : cc.log("%s does not exist", a)) : cc.Sprite.prototype.init.call(this, a, b);
        else if ("object" === typeof a)
            if (a instanceof cc.Texture2D) this.initWithTexture(a, b, c);
            else if (a instanceof cc.SpriteFrame) this.initWithSpriteFrame(a);
        else if (a instanceof HTMLImageElement || a instanceof HTMLCanvasElement) b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture(), this.initWithTexture(b)
    },
    getQuad: function() {
        return null
    },
    setBlendFunc: function(a,
        b) {
        var c = this._blendFunc;
        void 0 === b ? (c.src = a.src, c.dst = a.dst) : (c.src = a, c.dst = b);
        this._renderCmd.updateBlendFunc(c)
    },
    init: function() {
        if (0 < arguments.length) return this.initWithFile(arguments[0], arguments[1]);
        cc.Node.prototype.init.call(this);
        this.dirty = this._recursiveDirty = !1;
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this.texture = null;
        this._flippedX = this._flippedY = !1;
        this.anchorY = this.anchorX = 0.5;
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;
        this._hasChildren = !1;
        this.setTextureRect(cc.rect(0,
            0, 0, 0), !1, cc.size(0, 0));
        return !0
    },
    initWithFile: function(a, b) {
        cc.assert(a, cc._LogInfos.Sprite_initWithFile);
        var c = cc.textureCache.getTextureForKey(a);
        c || (c = cc.textureCache.addImage(a));
        if (!c.isLoaded()) return this._loader.clear(), this._loader.once(c, function() {
            this.initWithFile(a, b);
            this.dispatchEvent("load")
        }, this), !1;
        if (!b) {
            var d = c.getContentSize();
            b = cc.rect(0, 0, d.width, d.height)
        }
        return this.initWithTexture(c, b)
    },
    initWithTexture: function(a, b, c, d) {
        cc.assert(0 !== arguments.length, cc._LogInfos.CCSpriteBatchNode_initWithTexture);
        this._loader.clear();
        this._textureLoaded = a.isLoaded();
        if (!this._textureLoaded) return this._loader.once(a, function() {
            this.initWithTexture(a, b, c, d);
            this.dispatchEvent("load")
        }, this), !1;
        c = c || !1;
        a = this._renderCmd._handleTextureForRotatedTexture(a, b, c, d);
        if (!cc.Node.prototype.init.call(this)) return !1;
        this._batchNode = null;
        this.dirty = this._recursiveDirty = !1;
        this._opacityModifyRGB = !0;
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this._flippedX = this._flippedY = !1;
        this._offsetPosition.x =
            0;
        this._offsetPosition.y = 0;
        this._hasChildren = !1;
        this._rectRotated = c;
        b && (this._rect.x = b.x, this._rect.y = b.y, this._rect.width = b.width, this._rect.height = b.height);
        b || (b = cc.rect(0, 0, a.width, a.height));
        this._renderCmd._checkTextureBoundary(a, b, c);
        this.setTexture(a);
        this.setTextureRect(b, c);
        this.setBatchNode(null);
        return !0
    },
    setTextureRect: function(a, b, c, d) {
        this._rectRotated = b || !1;
        this.setContentSize(c || a);
        this.setVertexRect(a);
        this._renderCmd._setTextureCoords(a, d);
        a = this._unflippedOffsetPositionFromCenter.x;
        b = this._unflippedOffsetPositionFromCenter.y;
        this._flippedX && (a = -a);
        this._flippedY && (b = -b);
        c = this._rect;
        this._offsetPosition.x = a + (this._contentSize.width - c.width) / 2;
        this._offsetPosition.y = b + (this._contentSize.height - c.height) / 2
    },
    addChild: function(a, b, c) {
        cc.assert(a, cc._LogInfos.CCSpriteBatchNode_addChild_2);
        null == b && (b = a._localZOrder);
        null == c && (c = a.tag);
        this._renderCmd._setBatchNodeForAddChild(a) && (cc.Node.prototype.addChild.call(this, a, b, c), this._hasChildren = !0)
    },
    setSpriteFrame: function(a) {
        "string" ===
        typeof a && (a = cc.spriteFrameCache.getSpriteFrame(a), cc.assert(a, cc._LogInfos.Sprite_setSpriteFrame));
        this._loader.clear();
        this.setNodeDirty(!0);
        var b = a.getTexture();
        this._textureLoaded = a.textureLoaded();
        this._loader.clear();
        if (!this._textureLoaded) return this._loader.once(b, function() {
            this.setSpriteFrame(a);
            this.dispatchEvent("load")
        }, this), !1;
        var c = a.getOffset();
        this._unflippedOffsetPositionFromCenter.x = c.x;
        this._unflippedOffsetPositionFromCenter.y = c.y;
        b !== this._texture && (this._renderCmd._setTexture(b),
            this.setColor(this._realColor));
        this.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize())
    },
    setDisplayFrame: function(a) {
        cc.log(cc._LogInfos.Sprite_setDisplayFrame);
        this.setSpriteFrame(a)
    },
    isFrameDisplayed: function(a) {
        return this._renderCmd.isFrameDisplayed(a)
    },
    displayFrame: function() {
        return this.getSpriteFrame()
    },
    getSpriteFrame: function() {
        return new cc.SpriteFrame(this._texture, cc.rectPointsToPixels(this._rect), this._rectRotated, cc.pointPointsToPixels(this._unflippedOffsetPositionFromCenter),
            cc.sizePointsToPixels(this._contentSize))
    },
    setBatchNode: function(a) {},
    setTexture: function(a) {
        if (!a) return this._renderCmd._setTexture(null);
        var b = "string" === typeof a;
        b && (a = cc.textureCache.addImage(a));
        this._loader.clear();
        if (!a._textureLoaded) return this._loader.once(a, function() {
            this.setTexture(a);
            this.dispatchEvent("load")
        }, this), !1;
        this._renderCmd._setTexture(a);
        b && this._changeRectWithTexture(a);
        this.setColor(this._realColor);
        this._textureLoaded = !0
    },
    _changeRectWithTexture: function(a) {
        a = a._contentSize;
        a = cc.rect(0, 0, a.width, a.height);
        this.setTextureRect(a)
    },
    _createRenderCmd: function() {
        return cc._renderType === cc.game.RENDER_TYPE_CANVAS ? new cc.Sprite.CanvasRenderCmd(this) : new cc.Sprite.WebGLRenderCmd(this)
    }
});
cc.Sprite.create = function(a, b, c) {
    return new cc.Sprite(a, b, c)
};
cc.Sprite.createWithTexture = cc.Sprite.create;
cc.Sprite.createWithSpriteFrameName = cc.Sprite.create;
cc.Sprite.createWithSpriteFrame = cc.Sprite.create;
cc.Sprite.INDEX_NOT_INITIALIZED = -1;
cc.EventHelper.prototype.apply(cc.Sprite.prototype);
cc.assert(cc.isFunction(cc._tmp.PrototypeSprite), cc._LogInfos.MissingFile, "SpritesPropertyDefine.js");
cc._tmp.PrototypeSprite();
delete cc._tmp.PrototypeSprite;
(function() {
    var a = cc.Sprite.LoadManager = function() {
        this.list = []
    };
    a.prototype.add = function(a, c, d) {
        a && a.addEventListener && (a.addEventListener("load", c, d), this.list.push({
            source: a,
            listener: c,
            target: d
        }))
    };
    a.prototype.once = function(a, c, d) {
        if (a && a.addEventListener) {
            var e = function(f) {
                a.removeEventListener("load", e, d);
                c.call(d, f)
            };
            a.addEventListener("load", e, d);
            this.list.push({
                source: a,
                listener: e,
                target: d
            })
        }
    };
    a.prototype.clear = function() {
        for (; 0 < this.list.length;) {
            var a = this.list.pop();
            a.source.removeEventListener("load",
                a.listener, a.target)
        }
    }
})();
(function() {
    cc.Sprite.CanvasRenderCmd = function(a) {
        this._rootCtor(a);
        this._needDraw = !0;
        this._textureCoord = {
            renderX: 0,
            renderY: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            validRect: !1
        };
        this._blendFuncStr = "source-over";
        this._colorized = !1;
        this._canUseDirtyRegion = !0;
        this._textureToRender = null
    };
    var a = cc.Sprite.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.Sprite.CanvasRenderCmd;
    a._spriteCmdCtor = cc.Sprite.CanvasRenderCmd;
    a.setDirtyRecursively = function(a) {};
    a._setTexture = function(a) {
        var c =
            this._node;
        c._texture !== a && (c._textureLoaded = a ? a._textureLoaded : !1, c._texture = a, a = a._contentSize, a = cc.rect(0, 0, a.width, a.height), c.setTextureRect(a), this._updateColor())
    };
    a._setColorDirty = function() {
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty)
    };
    a.isFrameDisplayed = function(a) {
        var c = this._node;
        return a.getTexture() !== c._texture ? !1 : cc.rectEqualToRect(a.getRect(), c._rect)
    };
    a.updateBlendFunc = function(a) {
        this._blendFuncStr = cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc(a)
    };
    a._setBatchNodeForAddChild = function(a) {
        return !0
    };
    a._handleTextureForRotatedTexture = function(a, c, d, e) {
        d && a.isLoaded() && (a = a.getHtmlElementObj(), a = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(a, c, e), e = new cc.Texture2D, e.initWithElement(a), e.handleLoadedTexture(), a = e, c.x = c.y = 0, this._node._rect = cc.rect(0, 0, c.width, c.height));
        return a
    };
    a._checkTextureBoundary = function(a, c, d) {
        a && a.url && (d = c.y + c.height, c.x + c.width > a.width && cc.error(cc._LogInfos.RectWidth, a.url), d > a.height && cc.error(cc._LogInfos.RectHeight,
            a.url))
    };
    a.rendering = function(a, c, d) {
        var e = this._node,
            f = this._textureCoord,
            g = this._displayedOpacity / 255,
            h = this._textureToRender || e._texture;
        if ((!h || 0 !== f.width && 0 !== f.height && h._textureLoaded) && 0 !== g) {
            a = a || cc._renderContext;
            var k = a.getContext(),
                m = e._offsetPosition.x,
                n = e._rect.height,
                p = e._rect.width,
                r = -e._offsetPosition.y - n;
            a.setTransform(this._worldTransform, c, d);
            a.setCompositeOperation(this._blendFuncStr);
            a.setGlobalAlpha(g);
            (e._flippedX || e._flippedY) && a.save();
            e._flippedX && (m = -m - p, k.scale(-1, 1));
            e._flippedY && (r = e._offsetPosition.y, k.scale(1, -1));
            var s, u, t;
            this._colorized ? s = g = 0 : (g = f.renderX, s = f.renderY);
            u = f.width;
            t = f.height;
            h && h._htmlElementObj ? (c = h._htmlElementObj, "" !== h._pattern ? (a.setFillStyle(k.createPattern(c, h._pattern)), k.fillRect(m, r, p, n)) : k.drawImage(c, g, s, u, t, m, r, p, n)) : (h = e._contentSize, f.validRect && (f = this._displayedColor, a.setFillStyle("rgba(" + f.r + "," + f.g + "," + f.b + ",1)"), k.fillRect(m, r, h.width * c, h.height * d)));
            (e._flippedX || e._flippedY) && a.restore();
            cc.g_NumberOfDraws++
        }
    };
    a._updateColor =
        function() {
            var a = this._node._texture,
                c = this._textureCoord,
                d = this._displayedColor;
            a && (255 !== d.r || 255 !== d.g || 255 !== d.b ? (this._textureToRender = a._generateColorTexture(d.r, d.g, d.b, c), this._colorized = !0) : a && (this._textureToRender = a, this._colorized = !1))
        };
    a._textureLoadedCallback = function(a) {
        if (!this._textureLoaded) {
            this._textureLoaded = !0;
            var c = this._rect,
                d = this._renderCmd;
            c ? cc._rectEqualToZero(c) && (c.width = a.width, c.height = a.height) : c = cc.rect(0, 0, a.width, a.height);
            this.texture = a;
            this.setTextureRect(c, this._rectRotated);
            a = d._displayedColor;
            255 === a.r && 255 === a.g && 255 === a.b || d._updateColor();
            this.setBatchNode(this._batchNode);
            this.dispatchEvent("load")
        }
    };
    a._setTextureCoords = function(a, c) {
        void 0 === c && (c = !0);
        var d = this._textureCoord,
            e = c ? cc.contentScaleFactor() : 1;
        d.renderX = d.x = 0 | a.x * e;
        d.renderY = d.y = 0 | a.y * e;
        d.width = 0 | a.width * e;
        d.height = 0 | a.height * e;
        d.validRect = !(0 === d.width || 0 === d.height || 0 > d.x || 0 > d.y)
    };
    cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas = function(a, c, d) {
        if (!a) return null;
        if (!c) return a;
        d = null == d ? !0 : d;
        var e =
            document.createElement("canvas");
        e.width = c.width;
        e.height = c.height;
        var f = e.getContext("2d");
        f.translate(e.width / 2, e.height / 2);
        d ? f.rotate(-1.5707963267948966) : f.rotate(1.5707963267948966);
        f.drawImage(a, c.x, c.y, c.height, c.width, -c.height / 2, -c.width / 2, c.height, c.width);
        return e
    }
})();
(function() {
    cc.Sprite.WebGLRenderCmd = function(a) {
        this._rootCtor(a);
        this._needDraw = !0;
        this._vertices = [{
            x: 0,
            y: 0,
            u: 0,
            v: 0
        }, {
            x: 0,
            y: 0,
            u: 0,
            v: 0
        }, {
            x: 0,
            y: 0,
            u: 0,
            v: 0
        }, {
            x: 0,
            y: 0,
            u: 0,
            v: 0
        }];
        this._color = new Uint32Array(1);
        this._recursiveDirty = this._dirty = !1;
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_SPRITE_POSITION_TEXTURECOLOR)
    };
    var a = cc.Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.Sprite.WebGLRenderCmd;
    a._spriteCmdCtor = cc.Sprite.WebGLRenderCmd;
    a.updateBlendFunc = function(a) {};
    a.setDirtyFlag = function(a) {
        cc.Node.WebGLRenderCmd.prototype.setDirtyFlag.call(this, a);
        this._dirty = !0
    };
    a.setDirtyRecursively = function(a) {
        this._dirty = this._recursiveDirty = a;
        for (var c = this._node._children, d, e = c ? c.length : 0, f = 0; f < e; f++) d = c[f], d instanceof cc.Sprite && d._renderCmd.setDirtyRecursively(a)
    };
    a._setBatchNodeForAddChild = function(a) {
        var c = this._node;
        if (c._batchNode) {
            if (!(a instanceof cc.Sprite)) return cc.log(cc._LogInfos.Sprite_addChild), !1;
            a.texture._webTextureObj !==
                c.textureAtlas.texture._webTextureObj && cc.log(cc._LogInfos.Sprite_addChild_2);
            c._batchNode.appendChild(a);
            c._reorderChildDirty || c._setReorderChildDirtyRecursively()
        }
        return !0
    };
    a._handleTextureForRotatedTexture = function(a) {
        return a
    };
    a.isFrameDisplayed = function(a) {
        var c = this._node;
        return cc.rectEqualToRect(a.getRect(), c._rect) && a.getTexture().getName() === c._texture.getName() && cc.pointEqualToPoint(a.getOffset(), c._unflippedOffsetPositionFromCenter)
    };
    a._textureLoadedCallback = function(a) {
        if (!this._textureLoaded) {
            this._textureLoaded = !0;
            var c = this._rect;
            c ? cc._rectEqualToZero(c) && (c.width = a.width, c.height = a.height) : c = cc.rect(0, 0, a.width, a.height);
            this.texture = a;
            this.setTextureRect(c, this._rectRotated);
            this.setBatchNode(this._batchNode);
            this.dispatchEvent("load");
            cc.renderer.childrenOrderDirty = !0
        }
    };
    a._setTextureCoords = function(a, c) {
        void 0 === c && (c = !0);
        c && (a = cc.rectPointsToPixels(a));
        var d = this._node,
            e = d._batchNode ? d.textureAtlas.texture : d._texture,
            f = this._vertices;
        if (e) {
            var g = e.pixelsWidth,
                h = e.pixelsHeight,
                k, m;
            d._rectRotated ? (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ?
                (e = (2 * a.x + 1) / (2 * g), g = e + (2 * a.height - 2) / (2 * g), k = (2 * a.y + 1) / (2 * h), h = k + (2 * a.width - 2) / (2 * h)) : (e = a.x / g, g = (a.x + a.height) / g, k = a.y / h, h = (a.y + a.width) / h), d._flippedX && (m = k, k = h, h = m), d._flippedY && (m = e, e = g, g = m), f[0].u = g, f[0].v = k, f[1].u = e, f[1].v = k, f[2].u = g, f[2].v = h, f[3].u = e) : (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (e = (2 * a.x + 1) / (2 * g), g = e + (2 * a.width - 2) / (2 * g), k = (2 * a.y + 1) / (2 * h), h = k + (2 * a.height - 2) / (2 * h)) : (e = a.x / g, g = (a.x + a.width) / g, k = a.y / h, h = (a.y + a.height) / h), d._flippedX && (m = e, e = g, g = m), d._flippedY && (m = k, k = h, h = m), f[0].u = e,
                f[0].v = k, f[1].u = e, f[1].v = h, f[2].u = g, f[2].v = k, f[3].u = g);
            f[3].v = h
        }
    };
    a._setColorDirty = function() {};
    a._updateBlendFunc = function() {
        if (this._batchNode) cc.log(cc._LogInfos.Sprite__updateBlendFunc);
        else {
            var a = this._node,
                c = a._blendFunc;
            a._texture && a._texture.hasPremultipliedAlpha() ? (c.src === cc.SRC_ALPHA && c.dst === cc.BLEND_DST && (c.src = cc.ONE), a.opacityModifyRGB = !0) : (c.src === cc.ONE && c.dst === cc.BLEND_DST && (c.src = cc.SRC_ALPHA), a.opacityModifyRGB = !1)
        }
    };
    a._setTexture = function(a) {
        var c = this._node;
        c._texture !== a &&
            (c._textureLoaded = a ? a._textureLoaded : !1, c._texture = a, a = a._contentSize, a = cc.rect(0, 0, a.width, a.height), c.setTextureRect(a), this._updateBlendFunc(), c._textureLoaded && (cc.renderer.childrenOrderDirty = !0))
    };
    a._checkTextureBoundary = function(a, c, d) {
        a && a.url && (d ? (d = c.x + c.height, c = c.y + c.width) : (d = c.x + c.width, c = c.y + c.height), d > a.width && cc.error(cc._LogInfos.RectWidth, a.url), c > a.height && cc.error(cc._LogInfos.RectHeight, a.url))
    };
    a.transform = function(a, c) {
        this.originTransform(a, c);
        var d = this._node,
            e = d._offsetPosition.x,
            f = e + d._rect.width,
            g = d._offsetPosition.y,
            h = g + d._rect.height,
            k = this._worldTransform,
            d = k.tx,
            m = k.ty,
            n = e * k.a,
            e = e * k.b,
            p = f * k.a,
            f = f * k.b,
            r = h * k.c,
            h = h * k.d,
            s = g * k.c,
            g = g * k.d,
            k = this._vertices;
        k[0].x = n + r + d;
        k[0].y = e + h + m;
        k[1].x = n + s + d;
        k[1].y = e + g + m;
        k[2].x = p + r + d;
        k[2].y = f + h + m;
        k[3].x = p + s + d;
        k[3].y = f + g + m
    };
    a.needDraw = function() {
        var a = this._node._texture;
        return this._needDraw && a
    };
    a.uploadData = function(a, c, d) {
        var e = this._node,
            f = e._texture;
        if (!(f && f._textureLoaded && e._rect.width && e._rect.height && this._displayedOpacity)) return !1;
        var f = this._displayedOpacity,
            g = this._displayedColor.r,
            h = this._displayedColor.g,
            k = this._displayedColor.b;
        if (e._opacityModifyRGB) var m = f / 255,
            g = g * m,
            h = h * m,
            k = k * m;
        this._color[0] = f << 24 | k << 16 | h << 8 | g;
        e = e._vertexZ;
        f = this._vertices;
        g = f.length;
        k = d;
        for (d = 0; d < g; ++d) h = f[d], a[k] = h.x, a[k + 1] = h.y, a[k + 2] = e, c[k + 3] = this._color[0], a[k + 4] = h.u, a[k + 5] = h.v, k += 6;
        return g
    }
})();
cc.SpriteBatchNode = cc.Node.extend({
    _blendFunc: null,
    _texture: null,
    _className: "SpriteBatchNode",
    ctor: function(a) {
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        var b;
        cc.isString(a) ? (b = cc.textureCache.getTextureForKey(a)) || (b = cc.textureCache.addImage(a)) : a instanceof cc.Texture2D && (b = a);
        b && this.initWithTexture(b)
    },
    addSpriteWithoutQuad: function(a, b, c) {
        this.addChild(a, b, c);
        return this
    },
    getTextureAtlas: function() {
        return null
    },
    setTextureAtlas: function(a) {},
    getDescendants: function() {
        return this._children
    },
    initWithFile: function(a, b) {
        var c = cc.textureCache.getTextureForKey(a);
        c || (c = cc.textureCache.addImage(a));
        return this.initWithTexture(c, b)
    },
    init: function(a, b) {
        var c = cc.textureCache.getTextureForKey(a);
        c || (c = cc.textureCache.addImage(a));
        return this.initWithTexture(c, b)
    },
    increaseAtlasCapacity: function() {},
    removeChildAtIndex: function(a, b) {
        this.removeChild(this._children[a], b)
    },
    rebuildIndexInOrder: function(a, b) {
        return b
    },
    highestAtlasIndexInChild: function(a) {
        var b =
            a.children;
        return b && 0 !== b.length ? this.highestAtlasIndexInChild(b[b.length - 1]) : a.zIndex
    },
    lowestAtlasIndexInChild: function(a) {
        var b = a.children;
        return b && 0 !== b.length ? this.lowestAtlasIndexInChild(b[b.length - 1]) : a.zIndex
    },
    atlasIndexForChild: function(a) {
        return a.zIndex
    },
    reorderBatch: function(a) {
        this._reorderChildDirty = a
    },
    setBlendFunc: function(a, b) {
        this._blendFunc = void 0 === b ? a : {
            src: a,
            dst: b
        }
    },
    getBlendFunc: function() {
        return new cc.BlendFunc(this._blendFunc.src, this._blendFunc.dst)
    },
    updateQuadFromSprite: function(a,
        b) {
        cc.assert(a, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2);
        a instanceof cc.Sprite ? (a.dirty = !0, a._renderCmd.transform(this._renderCmd, !0)) : cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite)
    },
    insertQuadFromSprite: function(a, b) {
        this.addChild(a, b)
    },
    insertChild: function(a, b) {
        this.addChild(a, b)
    },
    appendChild: function(a) {
        this.sortAllChildren();
        this.addChild(a.lastLocalZOrder + 1)
    },
    removeSpriteFromAtlas: function(a, b) {
        this.removeChild(a, b)
    },
    initWithTexture: function(a) {
        this.setTexture(a);
        return !0
    },
    getTexture: function() {
        return this._texture
    },
    setTexture: function(a) {
        this._texture = a;
        if (a._textureLoaded) {
            var b, c = this._children,
                d = c.length;
            for (b = 0; b < d; ++b) c[b].setTexture(a)
        } else a.addEventListener("load", function() {
            var b, c = this._children,
                d = c.length;
            for (b = 0; b < d; ++b) c[b].setTexture(a)
        }, this)
    },
    setShaderProgram: function(a) {
        this._renderCmd.setShaderProgram(a);
        var b, c = this._children,
            d = c.length;
        for (b = 0; b < d; ++b) c[b].setShaderProgram(a)
    },
    addChild: function(a, b, c) {
        cc.assert(void 0 !== a, cc._LogInfos.CCSpriteBatchNode_addChild_3);
        this._isValidChild(a) && (b = void 0 === b ? a.zIndex : b, c = void 0 === c ? a.tag : c, cc.Node.prototype.addChild.call(this, a, b, c), this._renderCmd._shaderProgram && (a.shaderProgram = this._renderCmd._shaderProgram))
    },
    _isValidChild: function(a) {
        return a instanceof cc.Sprite ? a.texture !== this._texture ? (cc.log(cc._LogInfos.Sprite_addChild_5), !1) : !0 : (cc.log(cc._LogInfos.Sprite_addChild_4), !1)
    }
});
_p = cc.SpriteBatchNode.prototype;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.defineGetterSetter(_p, "shaderProgram", _p.getShaderProgram, _p.setShaderProgram);
cc.SpriteBatchNode.create = function(a) {
    return new cc.SpriteBatchNode(a)
};
cc.SpriteBatchNode.createWithTexture = cc.SpriteBatchNode.create;
cc.BakeSprite = cc.Sprite.extend({
    _cacheCanvas: null,
    _cacheContext: null,
    ctor: function() {
        cc.Sprite.prototype.ctor.call(this);
        var a = document.createElement("canvas");
        a.width = a.height = 10;
        this._cacheCanvas = a;
        this._cacheContext = new cc.CanvasContextWrapper(a.getContext("2d"));
        var b = new cc.Texture2D;
        b.initWithElement(a);
        b.handleLoadedTexture();
        this.setTexture(b)
    },
    getCacheContext: function() {
        return this._cacheContext
    },
    getCacheCanvas: function() {
        return this._cacheCanvas
    },
    resetCanvasSize: function(a, b) {
        var c = this._cacheCanvas,
            d = this._cacheContext,
            e = d._context.strokeStyle,
            f = d._context.fillStyle;
        void 0 === b && (b = a.height, a = a.width);
        c.width = a;
        c.height = b;
        e !== d._context.strokeStyle && (d._context.strokeStyle = e);
        f !== d._context.fillStyle && (d._context.fillStyle = f);
        this.getTexture().handleLoadedTexture();
        this.setTextureRect(cc.rect(0, 0, a, b), !1, null, !1)
    }
});
cc.AnimationFrame = cc.Class.extend({
    _spriteFrame: null,
    _delayPerUnit: 0,
    _userInfo: null,
    ctor: function(a, b, c) {
        this._spriteFrame = a || null;
        this._delayPerUnit = b || 0;
        this._userInfo = c || null
    },
    clone: function() {
        var a = new cc.AnimationFrame;
        a.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return a
    },
    copyWithZone: function(a) {
        return cc.clone(this)
    },
    copy: function(a) {
        a = new cc.AnimationFrame;
        a.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return a
    },
    initWithSpriteFrame: function(a,
        b, c) {
        this._spriteFrame = a;
        this._delayPerUnit = b;
        this._userInfo = c;
        return !0
    },
    getSpriteFrame: function() {
        return this._spriteFrame
    },
    setSpriteFrame: function(a) {
        this._spriteFrame = a
    },
    getDelayUnits: function() {
        return this._delayPerUnit
    },
    setDelayUnits: function(a) {
        this._delayPerUnit = a
    },
    getUserInfo: function() {
        return this._userInfo
    },
    setUserInfo: function(a) {
        this._userInfo = a
    }
});
cc.AnimationFrame.create = function(a, b, c) {
    return new cc.AnimationFrame(a, b, c)
};
cc.Animation = cc.Class.extend({
    _frames: null,
    _loops: 0,
    _restoreOriginalFrame: !1,
    _duration: 0,
    _delayPerUnit: 0,
    _totalDelayUnits: 0,
    ctor: function(a, b, c) {
        this._frames = [];
        if (void 0 === a) this.initWithSpriteFrames(null, 0);
        else {
            var d = a[0];
            d && (d instanceof cc.SpriteFrame ? this.initWithSpriteFrames(a, b, c) : d instanceof cc.AnimationFrame && this.initWithAnimationFrames(a, b, c))
        }
    },
    getFrames: function() {
        return this._frames
    },
    setFrames: function(a) {
        this._frames = a
    },
    addSpriteFrame: function(a) {
        var b = new cc.AnimationFrame;
        b.initWithSpriteFrame(a,
            1, null);
        this._frames.push(b);
        this._totalDelayUnits++
    },
    addSpriteFrameWithFile: function(a) {
        a = cc.textureCache.addImage(a);
        var b = cc.rect(0, 0, 0, 0);
        b.width = a.width;
        b.height = a.height;
        a = new cc.SpriteFrame(a, b);
        this.addSpriteFrame(a)
    },
    addSpriteFrameWithTexture: function(a, b) {
        var c = new cc.SpriteFrame(a, b);
        this.addSpriteFrame(c)
    },
    initWithAnimationFrames: function(a, b, c) {
        cc.arrayVerifyType(a, cc.AnimationFrame);
        this._delayPerUnit = b;
        this._loops = void 0 === c ? 1 : c;
        this._totalDelayUnits = 0;
        b = this._frames;
        for (c = b.length =
            0; c < a.length; c++) {
            var d = a[c];
            b.push(d);
            this._totalDelayUnits += d.getDelayUnits()
        }
        return !0
    },
    clone: function() {
        var a = new cc.Animation;
        a.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        a.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return a
    },
    copyWithZone: function(a) {
        a = new cc.Animation;
        a.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        a.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return a
    },
    _copyFrames: function() {
        for (var a = [], b = 0; b < this._frames.length; b++) a.push(this._frames[b].clone());
        return a
    },
    copy: function(a) {
        return this.copyWithZone(null)
    },
    getLoops: function() {
        return this._loops
    },
    setLoops: function(a) {
        this._loops = a
    },
    setRestoreOriginalFrame: function(a) {
        this._restoreOriginalFrame = a
    },
    getRestoreOriginalFrame: function() {
        return this._restoreOriginalFrame
    },
    getDuration: function() {
        return this._totalDelayUnits * this._delayPerUnit
    },
    getDelayPerUnit: function() {
        return this._delayPerUnit
    },
    setDelayPerUnit: function(a) {
        this._delayPerUnit = a
    },
    getTotalDelayUnits: function() {
        return this._totalDelayUnits
    },
    initWithSpriteFrames: function(a, b, c) {
        cc.arrayVerifyType(a, cc.SpriteFrame);
        this._loops = void 0 === c ? 1 : c;
        this._delayPerUnit = b || 0;
        this._totalDelayUnits = 0;
        b = this._frames;
        b.length = 0;
        if (a) {
            for (c = 0; c < a.length; c++) {
                var d = a[c],
                    e = new cc.AnimationFrame;
                e.initWithSpriteFrame(d, 1, null);
                b.push(e)
            }
            this._totalDelayUnits += a.length
        }
        return !0
    },
    retain: function() {},
    release: function() {}
});
cc.Animation.create = function(a, b, c) {
    return new cc.Animation(a, b, c)
};
cc.Animation.createWithAnimationFrames = cc.Animation.create;
cc.animationCache = {
    _animations: {},
    addAnimation: function(a, b) {
        this._animations[b] = a
    },
    removeAnimation: function(a) {
        a && this._animations[a] && delete this._animations[a]
    },
    getAnimation: function(a) {
        return this._animations[a] ? this._animations[a] : null
    },
    _addAnimationsWithDictionary: function(a, b) {
        var c = a.animations;
        if (c) {
            var d = 1,
                e = a.properties;
            if (e)
                for (var d = null != e.format ? parseInt(e.format) : d, e = e.spritesheets, f = cc.spriteFrameCache, g = cc.path, h = 0; h < e.length; h++) f.addSpriteFrames(g.changeBasename(b, e[h]));
            switch (d) {
                case 1:
                    this._parseVersion1(c);
                    break;
                case 2:
                    this._parseVersion2(c);
                    break;
                default:
                    cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary_2)
            }
        } else cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary)
    },
    addAnimations: function(a) {
        cc.assert(a, cc._LogInfos.animationCache_addAnimations_2);
        var b = cc.loader.getRes(a);
        b ? this._addAnimationsWithDictionary(b, a) : cc.log(cc._LogInfos.animationCache_addAnimations)
    },
    _parseVersion1: function(a) {
        var b = cc.spriteFrameCache,
            c;
        for (c in a) {
            var d = a[c],
                e = d.frames,
                d = parseFloat(d.delay) ||
                0,
                f = null;
            if (e) {
                for (var f = [], g = 0; g < e.length; g++) {
                    var h = b.getSpriteFrame(e[g]);
                    if (h) {
                        var k = new cc.AnimationFrame;
                        k.initWithSpriteFrame(h, 1, null);
                        f.push(k)
                    } else cc.log(cc._LogInfos.animationCache__parseVersion1_2, c, e[g])
                }
                0 === f.length ? cc.log(cc._LogInfos.animationCache__parseVersion1_3, c) : (f.length !== e.length && cc.log(cc._LogInfos.animationCache__parseVersion1_4, c), f = new cc.Animation(f, d, 1), cc.animationCache.addAnimation(f, c))
            } else cc.log(cc._LogInfos.animationCache__parseVersion1, c)
        }
    },
    _parseVersion2: function(a) {
        var b =
            cc.spriteFrameCache,
            c;
        for (c in a) {
            var d = a[c],
                e = d.loop,
                f = parseInt(d.loops),
                e = e ? cc.REPEAT_FOREVER : isNaN(f) ? 1 : f,
                f = d.restoreOriginalFrame && !0 == d.restoreOriginalFrame ? !0 : !1,
                g = d.frames;
            if (g) {
                for (var h = [], k = 0; k < g.length; k++) {
                    var m = g[k],
                        n = m.spriteframe,
                        p = b.getSpriteFrame(n);
                    if (p) {
                        var n = parseFloat(m.delayUnits) || 0,
                            m = m.notification,
                            r = new cc.AnimationFrame;
                        r.initWithSpriteFrame(p, n, m);
                        h.push(r)
                    } else cc.log(cc._LogInfos.animationCache__parseVersion2_2, c, n)
                }
                d = parseFloat(d.delayPerUnit) || 0;
                g = new cc.Animation;
                g.initWithAnimationFrames(h,
                    d, e);
                g.setRestoreOriginalFrame(f);
                cc.animationCache.addAnimation(g, c)
            } else cc.log(cc._LogInfos.animationCache__parseVersion2, c)
        }
    },
    _clear: function() {
        this._animations = {}
    }
};
cc.SpriteFrame = cc.Class.extend({
    _offset: null,
    _originalSize: null,
    _rectInPixels: null,
    _rotated: !1,
    _rect: null,
    _offsetInPixels: null,
    _originalSizeInPixels: null,
    _texture: null,
    _textureFilename: "",
    _textureLoaded: !1,
    ctor: function(a, b, c, d, e) {
        this._offset = cc.p(0, 0);
        this._offsetInPixels = cc.p(0, 0);
        this._originalSize = cc.size(0, 0);
        this._rotated = !1;
        this._originalSizeInPixels = cc.size(0, 0);
        this._textureFilename = "";
        this._texture = null;
        this._textureLoaded = !1;
        void 0 !== a && void 0 !== b && (void 0 === c || void 0 === d || void 0 === e ?
            this.initWithTexture(a, b) : this.initWithTexture(a, b, c, d, e))
    },
    textureLoaded: function() {
        return this._textureLoaded
    },
    addLoadedEventListener: function(a, b) {
        this.addEventListener("load", a, b)
    },
    getRectInPixels: function() {
        var a = this._rectInPixels;
        return cc.rect(a.x, a.y, a.width, a.height)
    },
    setRectInPixels: function(a) {
        this._rectInPixels || (this._rectInPixels = cc.rect(0, 0, 0, 0));
        this._rectInPixels.x = a.x;
        this._rectInPixels.y = a.y;
        this._rectInPixels.width = a.width;
        this._rectInPixels.height = a.height;
        this._rect = cc.rectPixelsToPoints(a)
    },
    isRotated: function() {
        return this._rotated
    },
    setRotated: function(a) {
        this._rotated = a
    },
    getRect: function() {
        var a = this._rect;
        return cc.rect(a.x, a.y, a.width, a.height)
    },
    setRect: function(a) {
        this._rect || (this._rect = cc.rect(0, 0, 0, 0));
        this._rect.x = a.x;
        this._rect.y = a.y;
        this._rect.width = a.width;
        this._rect.height = a.height;
        this._rectInPixels = cc.rectPointsToPixels(this._rect)
    },
    getOffsetInPixels: function() {
        return cc.p(this._offsetInPixels)
    },
    setOffsetInPixels: function(a) {
        this._offsetInPixels.x = a.x;
        this._offsetInPixels.y =
            a.y;
        cc._pointPixelsToPointsOut(this._offsetInPixels, this._offset)
    },
    getOriginalSizeInPixels: function() {
        return cc.size(this._originalSizeInPixels)
    },
    setOriginalSizeInPixels: function(a) {
        this._originalSizeInPixels.width = a.width;
        this._originalSizeInPixels.height = a.height
    },
    getOriginalSize: function() {
        return cc.size(this._originalSize)
    },
    setOriginalSize: function(a) {
        this._originalSize.width = a.width;
        this._originalSize.height = a.height
    },
    getTexture: function() {
        if (this._texture) return this._texture;
        if ("" !== this._textureFilename) {
            var a =
                cc.textureCache.addImage(this._textureFilename);
            a && (this._textureLoaded = a.isLoaded());
            return a
        }
        return null
    },
    setTexture: function(a) {
        if (this._texture !== a) {
            var b = a.isLoaded();
            this._textureLoaded = b;
            this._texture = a;
            b || a.addEventListener("load", function(a) {
                this._textureLoaded = !0;
                if (this._rotated && cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
                    var b = a.getHtmlElementObj(),
                        b = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(b, this.getRect()),
                        e = new cc.Texture2D;
                    e.initWithElement(b);
                    e.handleLoadedTexture();
                    this.setTexture(e);
                    b = this.getRect();
                    this.setRect(cc.rect(0, 0, b.width, b.height))
                }
                b = this._rect;
                0 === b.width && 0 === b.height && (b = a.width, a = a.height, this._rect.width = b, this._rect.height = a, this._rectInPixels = cc.rectPointsToPixels(this._rect), this._originalSizeInPixels.width = this._rectInPixels.width, this._originalSizeInPixels.height = this._rectInPixels.height, this._originalSize.width = b, this._originalSize.height = a);
                this.dispatchEvent("load")
            }, this)
        }
    },
    getOffset: function() {
        return cc.p(this._offset)
    },
    setOffset: function(a) {
        this._offset.x =
            a.x;
        this._offset.y = a.y
    },
    clone: function() {
        var a = new cc.SpriteFrame;
        a.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        a.setTexture(this._texture);
        return a
    },
    copyWithZone: function() {
        var a = new cc.SpriteFrame;
        a.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        a.setTexture(this._texture);
        return a
    },
    copy: function() {
        return this.copyWithZone()
    },
    initWithTexture: function(a,
        b, c, d, e) {
        2 === arguments.length && (b = cc.rectPointsToPixels(b));
        d = d || cc.p(0, 0);
        e = e || b;
        c = c || !1;
        "string" === typeof a ? (this._texture = null, this._textureFilename = a) : a instanceof cc.Texture2D && this.setTexture(a);
        a = this.getTexture();
        this._rectInPixels = b;
        this._rect = cc.rectPixelsToPoints(b);
        if (a && a.url && a.isLoaded()) {
            var f, g;
            c ? (f = b.x + b.height, g = b.y + b.width) : (f = b.x + b.width, g = b.y + b.height);
            f > a.getPixelsWide() && cc.error(cc._LogInfos.RectWidth, a.url);
            g > a.getPixelsHigh() && cc.error(cc._LogInfos.RectHeight, a.url)
        }
        this._offsetInPixels.x =
            d.x;
        this._offsetInPixels.y = d.y;
        cc._pointPixelsToPointsOut(d, this._offset);
        this._originalSizeInPixels.width = e.width;
        this._originalSizeInPixels.height = e.height;
        cc._sizePixelsToPointsOut(e, this._originalSize);
        this._rotated = c;
        return !0
    }
});
cc.EventHelper.prototype.apply(cc.SpriteFrame.prototype);
cc.SpriteFrame.create = function(a, b, c, d, e) {
    return new cc.SpriteFrame(a, b, c, d, e)
};
cc.SpriteFrame.createWithTexture = cc.SpriteFrame.create;
cc.SpriteFrame._frameWithTextureForCanvas = function(a, b, c, d, e) {
    var f = new cc.SpriteFrame;
    f._texture = a;
    f._rectInPixels = b;
    f._rect = cc.rectPixelsToPoints(b);
    f._offsetInPixels.x = d.x;
    f._offsetInPixels.y = d.y;
    cc._pointPixelsToPointsOut(f._offsetInPixels, f._offset);
    f._originalSizeInPixels.width = e.width;
    f._originalSizeInPixels.height = e.height;
    cc._sizePixelsToPointsOut(f._originalSizeInPixels, f._originalSize);
    f._rotated = c;
    return f
};
cc.spriteFrameCache = {
    _CCNS_REG1: /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
    _CCNS_REG2: /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,
    _spriteFrames: {},
    _spriteFramesAliases: {},
    _frameConfigCache: {},
    _rectFromString: function(a) {
        return (a = this._CCNS_REG2.exec(a)) ? cc.rect(parseFloat(a[1]), parseFloat(a[2]), parseFloat(a[3]), parseFloat(a[4])) : cc.rect(0, 0, 0, 0)
    },
    _pointFromString: function(a) {
        return (a = this._CCNS_REG1.exec(a)) ?
            cc.p(parseFloat(a[1]), parseFloat(a[2])) : cc.p(0, 0)
    },
    _sizeFromString: function(a) {
        return (a = this._CCNS_REG1.exec(a)) ? cc.size(parseFloat(a[1]), parseFloat(a[2])) : cc.size(0, 0)
    },
    _getFrameConfig: function(a) {
        var b = cc.loader.getRes(a);
        cc.assert(b, cc._LogInfos.spriteFrameCache__getFrameConfig_2, a);
        cc.loader.release(a);
        if (b._inited) return this._frameConfigCache[a] = b;
        this._frameConfigCache[a] = this._parseFrameConfig(b);
        return this._frameConfigCache[a]
    },
    _getFrameConfigByJsonObject: function(a, b) {
        cc.assert(b, cc._LogInfos.spriteFrameCache__getFrameConfig_2,
            a);
        this._frameConfigCache[a] = this._parseFrameConfig(b);
        return this._frameConfigCache[a]
    },
    _parseFrameConfig: function(a) {
        var b = a.frames,
            c = a.metadata || a.meta;
        a = {};
        var d = {},
            e = 0;
        c && (e = c.format, e = 1 >= e.length ? parseInt(e) : e, d.image = c.textureFileName || c.textureFileName || c.image);
        for (var f in b) {
            var g = b[f];
            if (g) {
                c = {};
                if (0 == e) {
                    c.rect = cc.rect(g.x, g.y, g.width, g.height);
                    c.rotated = !1;
                    c.offset = cc.p(g.offsetX, g.offsetY);
                    var h = g.originalWidth,
                        g = g.originalHeight;
                    h && g || cc.log(cc._LogInfos.spriteFrameCache__getFrameConfig);
                    h = Math.abs(h);
                    g = Math.abs(g);
                    c.size = cc.size(h, g)
                } else if (1 == e || 2 == e) c.rect = this._rectFromString(g.frame), c.rotated = g.rotated || !1, c.offset = this._pointFromString(g.offset), c.size = this._sizeFromString(g.sourceSize);
                else if (3 == e) {
                    var h = this._sizeFromString(g.spriteSize),
                        k = this._rectFromString(g.textureRect);
                    h && (k = cc.rect(k.x, k.y, h.width, h.height));
                    c.rect = k;
                    c.rotated = g.textureRotated || !1;
                    c.offset = this._pointFromString(g.spriteOffset);
                    c.size = this._sizeFromString(g.spriteSourceSize);
                    c.aliases = g.aliases
                } else h =
                    g.frame, k = g.sourceSize, f = g.filename || f, c.rect = cc.rect(h.x, h.y, h.w, h.h), c.rotated = g.rotated || !1, c.offset = cc.p(0, 0), c.size = cc.size(k.w, k.h);
                a[f] = c
            }
        }
        return {
            _inited: !0,
            frames: a,
            meta: d
        }
    },
    _addSpriteFramesByObject: function(a, b, c) {
        cc.assert(a, cc._LogInfos.spriteFrameCache_addSpriteFrames_2);
        b && b.frames && (b = this._frameConfigCache[a] || this._getFrameConfigByJsonObject(a, b), this._createSpriteFrames(a, b, c))
    },
    _createSpriteFrames: function(a, b, c) {
        var d = b.frames;
        b = b.meta;
        c ? c instanceof cc.Texture2D || (cc.isString(c) ?
            c = cc.textureCache.addImage(c) : cc.assert(0, cc._LogInfos.spriteFrameCache_addSpriteFrames_3)) : (c = cc.path.changeBasename(a, b.image || ".png"), c = cc.textureCache.addImage(c));
        a = this._spriteFramesAliases;
        b = this._spriteFrames;
        for (var e in d) {
            var f = d[e],
                g = b[e];
            if (!g) {
                g = new cc.SpriteFrame(c, f.rect, f.rotated, f.offset, f.size);
                if (f = f.aliases)
                    for (var h = 0, k = f.length; h < k; h++) {
                        var m = f[h];
                        a[m] && cc.log(cc._LogInfos.spriteFrameCache_addSpriteFrames, m);
                        a[m] = e
                    }
                cc._renderType === cc.game.RENDER_TYPE_CANVAS && g.isRotated() &&
                    g.getTexture().isLoaded() && (f = g.getTexture().getHtmlElementObj(), f = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(f, g.getRectInPixels()), h = new cc.Texture2D, h.initWithElement(f), h.handleLoadedTexture(), g.setTexture(h), g.setRotated(!1), f = g._rect, g.setRect(cc.rect(0, 0, f.width, f.height)));
                b[e] = g
            }
        }
    },
    addSpriteFrames: function(a, b) {
        cc.assert(a, cc._LogInfos.spriteFrameCache_addSpriteFrames_2);
        var c = this._frameConfigCache[a] || cc.loader.getRes(a);
        c && c.frames && (c = this._frameConfigCache[a] || this._getFrameConfig(a),
            this._createSpriteFrames(a, c, b))
    },
    _checkConflict: function(a) {
        a = a.frames;
        for (var b in a) this._spriteFrames[b] && cc.log(cc._LogInfos.spriteFrameCache__checkConflict, b)
    },
    addSpriteFrame: function(a, b) {
        this._spriteFrames[b] = a
    },
    removeSpriteFrames: function() {
        this._spriteFrames = {};
        this._spriteFramesAliases = {}
    },
    removeSpriteFrameByName: function(a) {
        a && (this._spriteFramesAliases[a] && delete this._spriteFramesAliases[a], this._spriteFrames[a] && delete this._spriteFrames[a])
    },
    removeSpriteFramesFromFile: function(a) {
        var b =
            this._spriteFrames,
            c = this._spriteFramesAliases;
        if (a = this._frameConfigCache[a]) {
            a = a.frames;
            for (var d in a)
                if (b[d]) {
                    delete b[d];
                    for (var e in c) c[e] === d && delete c[e]
                }
        }
    },
    removeSpriteFramesFromTexture: function(a) {
        var b = this._spriteFrames,
            c = this._spriteFramesAliases,
            d;
        for (d in b) {
            var e = b[d];
            if (e && e.getTexture() === a) {
                delete b[d];
                for (var f in c) c[f] === d && delete c[f]
            }
        }
    },
    getSpriteFrame: function(a) {
        var b = this._spriteFrames[a];
        if (!b) {
            var c = this._spriteFramesAliases[a];
            c && ((b = this._spriteFrames[c.toString()]) ||
                delete this._spriteFramesAliases[a])
        }
        return b
    },
    _clear: function() {
        this._spriteFrames = {};
        this._spriteFramesAliases = {};
        this._frameConfigCache = {}
    }
};
cc.configuration = {
    ERROR: 0,
    STRING: 1,
    INT: 2,
    DOUBLE: 3,
    BOOLEAN: 4,
    _maxTextureSize: 0,
    _maxModelviewStackDepth: 0,
    _supportsPVRTC: !1,
    _supportsNPOT: !1,
    _supportsBGRA8888: !1,
    _supportsDiscardFramebuffer: !1,
    _supportsShareableVAO: !1,
    _maxSamplesAllowed: 0,
    _maxTextureUnits: 0,
    _GlExtensions: "",
    _valueDict: {},
    _inited: !1,
    _init: function() {
        var a = this._valueDict;
        a["cocos2d.x.version"] = cc.ENGINE_VERSION;
        a["cocos2d.x.compiled_with_profiler"] = !1;
        a["cocos2d.x.compiled_with_gl_state_cache"] = cc.ENABLE_GL_STATE_CACHE;
        this._inited = !0
    },
    getMaxTextureSize: function() {
        return this._maxTextureSize
    },
    getMaxModelviewStackDepth: function() {
        return this._maxModelviewStackDepth
    },
    getMaxTextureUnits: function() {
        return this._maxTextureUnits
    },
    supportsNPOT: function() {
        return this._supportsNPOT
    },
    supportsPVRTC: function() {
        return this._supportsPVRTC
    },
    supportsETC: function() {
        return !1
    },
    supportsS3TC: function() {
        return !1
    },
    supportsATITC: function() {
        return !1
    },
    supportsBGRA8888: function() {
        return this._supportsBGRA8888
    },
    supportsDiscardFramebuffer: function() {
        return this._supportsDiscardFramebuffer
    },
    supportsShareableVAO: function() {
        return this._supportsShareableVAO
    },
    checkForGLExtension: function(a) {
        return -1 < this._GlExtensions.indexOf(a)
    },
    getValue: function(a, b) {
        this._inited || this._init();
        var c = this._valueDict;
        return c[a] ? c[a] : b
    },
    setValue: function(a, b) {
        this._valueDict[a] = b
    },
    dumpInfo: function() {
        0 === cc.ENABLE_GL_STATE_CACHE && (cc.log(""), cc.log(cc._LogInfos.configuration_dumpInfo), cc.log(""))
    },
    gatherGPUInfo: function() {
        if (cc._renderType !== cc.game.RENDER_TYPE_CANVAS) {
            this._inited || this._init();
            var a =
                cc._renderContext,
                b = this._valueDict;
            b["gl.vendor"] = a.getParameter(a.VENDOR);
            b["gl.renderer"] = a.getParameter(a.RENDERER);
            b["gl.version"] = a.getParameter(a.VERSION);
            this._GlExtensions = "";
            for (var c = a.getSupportedExtensions(), d = 0; d < c.length; d++) this._GlExtensions += c[d] + " ";
            this._maxTextureSize = a.getParameter(a.MAX_TEXTURE_SIZE);
            b["gl.max_texture_size"] = this._maxTextureSize;
            this._maxTextureUnits = a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            b["gl.max_texture_units"] = this._maxTextureUnits;
            this._supportsPVRTC =
                this.checkForGLExtension("GL_IMG_texture_compression_pvrtc");
            b["gl.supports_PVRTC"] = this._supportsPVRTC;
            this._supportsNPOT = !1;
            b["gl.supports_NPOT"] = this._supportsNPOT;
            this._supportsBGRA8888 = this.checkForGLExtension("GL_IMG_texture_format_BGRA888");
            b["gl.supports_BGRA8888"] = this._supportsBGRA8888;
            this._supportsDiscardFramebuffer = this.checkForGLExtension("GL_EXT_discard_framebuffer");
            b["gl.supports_discard_framebuffer"] = this._supportsDiscardFramebuffer;
            this._supportsShareableVAO = this.checkForGLExtension("vertex_array_object");
            b["gl.supports_vertex_array_object"] = this._supportsShareableVAO;
            cc.checkGLErrorDebug()
        }
    },
    loadConfigFile: function(a) {
        this._inited || this._init();
        var b = cc.loader.getRes(a);
        if (!b) throw Error("Please load the resource first : " + a);
        cc.assert(b, cc._LogInfos.configuration_loadConfigFile_2, a);
        if (b = b.data)
            for (var c in b) this._valueDict[c] = b[c];
        else cc.log(cc._LogInfos.configuration_loadConfigFile, a)
    }
};
cc.g_NumberOfDraws = 0;
cc.Director = cc.Class.extend({
    _landscape: !1,
    _nextDeltaTimeZero: !1,
    _paused: !1,
    _purgeDirectorInNextLoop: !1,
    _sendCleanupToScene: !1,
    _animationInterval: 0,
    _oldAnimationInterval: 0,
    _projection: 0,
    _contentScaleFactor: 1,
    _deltaTime: 0,
    _winSizeInPoints: null,
    _lastUpdate: null,
    _nextScene: null,
    _notificationNode: null,
    _openGLView: null,
    _scenesStack: null,
    _projectionDelegate: null,
    _runningScene: null,
    _totalFrames: 0,
    _secondsPerFrame: 0,
    _dirtyRegion: null,
    _scheduler: null,
    _actionManager: null,
    _eventProjectionChanged: null,
    _eventAfterUpdate: null,
    _eventAfterVisit: null,
    _eventAfterDraw: null,
    ctor: function() {
        var a = this;
        a._lastUpdate = Date.now();
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function() {
            a._lastUpdate = Date.now()
        })
    },
    init: function() {
        this._oldAnimationInterval = this._animationInterval = 1 / cc.defaultFPS;
        this._scenesStack = [];
        this._projection = cc.Director.PROJECTION_DEFAULT;
        this._projectionDelegate = null;
        this._totalFrames = 0;
        this._lastUpdate = Date.now();
        this._purgeDirectorInNextLoop = this._paused = !1;
        this._winSizeInPoints = cc.size(0, 0);
        this._openGLView =
            null;
        this._contentScaleFactor = 1;
        this._scheduler = new cc.Scheduler;
        this._actionManager = cc.ActionManager ? new cc.ActionManager : null;
        this._eventAfterUpdate = new cc.EventCustom(cc.Director.EVENT_AFTER_UPDATE);
        this._eventAfterUpdate.setUserData(this);
        this._eventAfterVisit = new cc.EventCustom(cc.Director.EVENT_AFTER_VISIT);
        this._eventAfterVisit.setUserData(this);
        this._eventAfterDraw = new cc.EventCustom(cc.Director.EVENT_AFTER_DRAW);
        this._eventAfterDraw.setUserData(this);
        this._eventProjectionChanged = new cc.EventCustom(cc.Director.EVENT_PROJECTION_CHANGED);
        this._eventProjectionChanged.setUserData(this);
        return !0
    },
    calculateDeltaTime: function() {
        var a = Date.now();
        this._nextDeltaTimeZero ? (this._deltaTime = 0, this._nextDeltaTimeZero = !1) : this._deltaTime = (a - this._lastUpdate) / 1E3;
        0 < cc.game.config[cc.game.CONFIG_KEY.debugMode] && 0.2 < this._deltaTime && (this._deltaTime = 1 / 60);
        this._lastUpdate = a
    },
    convertToGL: function(a) {
        var b = document.documentElement,
            c = cc.view,
            d = element.getBoundingClientRect();
        d.left += window.pageXOffset - b.clientLeft;
        d.top += window.pageYOffset - b.clientTop;
        b = c._devicePixelRatio * (a.x - d.left);
        a = c._devicePixelRatio * (d.top + d.height - a.y);
        return c._isRotated ? {
            x: c._viewPortRect.width - a,
            y: b
        } : {
            x: b,
            y: a
        }
    },
    convertToUI: function(a) {
        var b = document.documentElement,
            c = cc.view,
            d = element.getBoundingClientRect();
        d.left += window.pageXOffset - b.clientLeft;
        d.top += window.pageYOffset - b.clientTop;
        b = {
            x: 0,
            y: 0
        };
        c._isRotated ? (b.x = d.left + a.y / c._devicePixelRatio, b.y = d.top + d.height - (c._viewPortRect.width - a.x) / c._devicePixelRatio) : (b.x = d.left + a.x / c._devicePixelRatio, b.y = d.top + d.height -
            a.y / c._devicePixelRatio);
        return b
    },
    drawScene: function() {
        var a = cc.renderer;
        this.calculateDeltaTime();
        this._paused || (this._actionManager.update(this._deltaTime), this._scheduler.update(this._deltaTime), cc.eventManager.dispatchEvent(this._eventAfterUpdate));
        this._nextScene && this.setNextScene();
        this._runningScene && (a.childrenOrderDirty ? (cc.renderer.clearRenderCommands(), cc.renderer.assignedZ = 0, this._runningScene._renderCmd._curLevel = 0, this._runningScene.visit(), a.resetFlag()) : a.transformDirty() && a.transform());
        a.clear();
        this._notificationNode && this._notificationNode.visit();
        cc.eventManager.dispatchEvent(this._eventAfterVisit);
        cc.g_NumberOfDraws = 0;
        a.rendering(cc._renderContext);
        this._totalFrames++;
        cc.eventManager.dispatchEvent(this._eventAfterDraw);
        cc.eventManager.frameUpdateListeners();
        this._calculateMPF()
    },
    end: function() {
        this._purgeDirectorInNextLoop = !0
    },
    getContentScaleFactor: function() {
        return this._contentScaleFactor
    },
    getNotificationNode: function() {
        return this._notificationNode
    },
    getWinSize: function() {
        return cc.size(this._winSizeInPoints)
    },
    getWinSizeInPixels: function() {
        return cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor)
    },
    getVisibleSize: null,
    getVisibleOrigin: null,
    getZEye: null,
    pause: function() {
        this._paused || (this._oldAnimationInterval = this._animationInterval, this.setAnimationInterval(0.25), this._paused = !0)
    },
    popScene: function() {
        cc.assert(this._runningScene, cc._LogInfos.Director_popScene);
        this._scenesStack.pop();
        var a = this._scenesStack.length;
        0 === a ? this.end() : (this._sendCleanupToScene = !0, this._nextScene = this._scenesStack[a - 1])
    },
    purgeCachedData: function() {
        cc.animationCache._clear();
        cc.spriteFrameCache._clear();
        cc.textureCache._clear()
    },
    purgeDirector: function() {
        this.getScheduler().unscheduleAll();
        cc.eventManager && cc.eventManager.setEnabled(!1);
        this._runningScene && (this._runningScene._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart), this._runningScene._performRecursive(cc.Node._stateCallbackType.onExit), this._runningScene._performRecursive(cc.Node._stateCallbackType.cleanup));
        this._nextScene = this._runningScene = null;
        this._scenesStack.length = 0;
        this.stopAnimation();
        this.purgeCachedData();
        cc.checkGLErrorDebug()
    },
    pushScene: function(a) {
        cc.assert(a, cc._LogInfos.Director_pushScene);
        this._sendCleanupToScene = !1;
        this._scenesStack.push(a);
        this._nextScene = a
    },
    runScene: function(a) {
        cc.assert(a, cc._LogInfos.Director_pushScene);
        if (this._runningScene) {
            var b = this._scenesStack.length;
            0 === b ? (this._sendCleanupToScene = !0, this._scenesStack[b] = a) : (this._sendCleanupToScene = !0, this._scenesStack[b -
                1] = a);
            this._nextScene = a
        } else this.pushScene(a), this.startAnimation()
    },
    resume: function() {
        this._paused && (this.setAnimationInterval(this._oldAnimationInterval), (this._lastUpdate = Date.now()) || cc.log(cc._LogInfos.Director_resume), this._paused = !1, this._deltaTime = 0)
    },
    setContentScaleFactor: function(a) {
        a !== this._contentScaleFactor && (this._contentScaleFactor = a)
    },
    setDepthTest: null,
    setClearColor: null,
    setDefaultValues: function() {},
    setNextDeltaTimeZero: function(a) {
        this._nextDeltaTimeZero = a
    },
    setNextScene: function() {
        var a = !1,
            b = !1;
        cc.TransitionScene && (a = this._runningScene ? this._runningScene instanceof cc.TransitionScene : !1, b = this._nextScene ? this._nextScene instanceof cc.TransitionScene : !1);
        if (!b) {
            if (b = this._runningScene) b._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart), b._performRecursive(cc.Node._stateCallbackType.onExit);
            this._sendCleanupToScene && b && b._performRecursive(cc.Node._stateCallbackType.cleanup)
        }
        this._runningScene = this._nextScene;
        cc.renderer.childrenOrderDirty = !0;
        this._nextScene = null;
        a || null === this._runningScene || (this._runningScene._performRecursive(cc.Node._stateCallbackType.onEnter), this._runningScene._performRecursive(cc.Node._stateCallbackType.onEnterTransitionDidFinish))
    },
    setNotificationNode: function(a) {
        cc.renderer.childrenOrderDirty = !0;
        this._notificationNode && (this._notificationNode._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart), this._notificationNode._performRecursive(cc.Node._stateCallbackType.onExit), this._notificationNode._performRecursive(cc.Node._stateCallbackType.cleanup));
        if (this._notificationNode = a) this._notificationNode._performRecursive(cc.Node._stateCallbackType.onEnter), this._notificationNode._performRecursive(cc.Node._stateCallbackType.onEnterTransitionDidFinish)
    },
    getDelegate: function() {
        return this._projectionDelegate
    },
    setDelegate: function(a) {
        this._projectionDelegate = a
    },
    setOpenGLView: null,
    setProjection: null,
    setViewport: null,
    getOpenGLView: null,
    getProjection: null,
    setAlphaBlending: null,
    isSendCleanupToScene: function() {
        return this._sendCleanupToScene
    },
    getRunningScene: function() {
        return this._runningScene
    },
    getAnimationInterval: function() {
        return this._animationInterval
    },
    isDisplayStats: function() {
        return cc.profiler ? cc.profiler.isShowingStats() : !1
    },
    setDisplayStats: function(a) {
        cc.profiler && (a ? cc.profiler.showStats() : cc.profiler.hideStats())
    },
    getSecondsPerFrame: function() {
        return this._secondsPerFrame
    },
    isNextDeltaTimeZero: function() {
        return this._nextDeltaTimeZero
    },
    isPaused: function() {
        return this._paused
    },
    getTotalFrames: function() {
        return this._totalFrames
    },
    popToRootScene: function() {
        this.popToSceneStackLevel(1)
    },
    popToSceneStackLevel: function(a) {
        cc.assert(this._runningScene, cc._LogInfos.Director_popToSceneStackLevel_2);
        var b = this._scenesStack,
            c = b.length;
        if (0 === a) this.end();
        else if (!(a >= c)) {
            for (; c > a;) {
                var d = b.pop();
                d.running && (d._performRecursive(cc.Node._stateCallbackType.onExitTransitionDidStart), d._performRecursive(cc.Node._stateCallbackType.onExit));
                d._performRecursive(cc.Node._stateCallbackType.cleanup);
                c--
            }
            this._nextScene = b[b.length - 1];
            this._sendCleanupToScene = !0
        }
    },
    getScheduler: function() {
        return this._scheduler
    },
    setScheduler: function(a) {
        this._scheduler !== a && (this._scheduler = a)
    },
    getActionManager: function() {
        return this._actionManager
    },
    setActionManager: function(a) {
        this._actionManager !== a && (this._actionManager = a)
    },
    getDeltaTime: function() {
        return this._deltaTime
    },
    _calculateMPF: function() {
        this._secondsPerFrame = (Date.now() - this._lastUpdate) / 1E3
    }
});
cc.Director.EVENT_PROJECTION_CHANGED = "director_projection_changed";
cc.Director.EVENT_AFTER_UPDATE = "director_after_update";
cc.Director.EVENT_AFTER_VISIT = "director_after_visit";
cc.Director.EVENT_AFTER_DRAW = "director_after_draw";
cc.DisplayLinkDirector = cc.Director.extend({
    invalid: !1,
    startAnimation: function() {
        this._nextDeltaTimeZero = !0;
        this.invalid = !1
    },
    mainLoop: function() {
        this._purgeDirectorInNextLoop ? (this._purgeDirectorInNextLoop = !1, this.purgeDirector()) : this.invalid || this.drawScene()
    },
    stopAnimation: function() {
        this.invalid = !0
    },
    setAnimationInterval: function(a) {
        this._animationInterval = a;
        this.invalid || (this.stopAnimation(), this.startAnimation())
    }
});
cc.Director.sharedDirector = null;
cc.Director.firstUseDirector = !0;
cc.Director._getInstance = function() {
    cc.Director.firstUseDirector && (cc.Director.firstUseDirector = !1, cc.Director.sharedDirector = new cc.DisplayLinkDirector, cc.Director.sharedDirector.init());
    return cc.Director.sharedDirector
};
cc.defaultFPS = 60;
cc.Director.PROJECTION_2D = 0;
cc.Director.PROJECTION_3D = 1;
cc.Director.PROJECTION_CUSTOM = 3;
cc.Director.PROJECTION_DEFAULT = cc.Director.PROJECTION_2D;
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
        var a = cc.Director.prototype;
        a.getProjection = function(a) {
            return this._projection
        };
        a.setProjection = function(a) {
            this._projection = a;
            cc.eventManager.dispatchEvent(this._eventProjectionChanged)
        };
        a.setDepthTest = function() {};
        a.setClearColor = function(a) {
            cc.renderer._clearColor = a;
            cc.renderer._clearFillStyle = "rgb(" + a.r + "," + a.g + "," + a.b + ")"
        };
        a.setOpenGLView = function(a) {
            this._winSizeInPoints.width =
                cc._canvas.width;
            this._winSizeInPoints.height = cc._canvas.height;
            this._openGLView = a || cc.view;
            cc.eventManager && cc.eventManager.setEnabled(!0)
        };
        a.getVisibleSize = function() {
            return this.getWinSize()
        };
        a.getVisibleOrigin = function() {
            return cc.p(0, 0)
        }
    } else cc.Director._fpsImage = new Image, cc.Director._fpsImage.addEventListener("load", function() {
        cc.Director._fpsImageLoaded = !0
    }), cc._fpsImage && (cc.Director._fpsImage.src = cc._fpsImage)
});
cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function() {
    if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
        cc.DirectorDelegate = cc.Class.extend({
            updateProjection: function() {}
        });
        var a = cc.Director.prototype,
            b = function(a) {
                if (a && a._renderCmd) {
                    a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
                    var d = a._children;
                    for (a = 0; a < d.length; a++) b(d[a])
                }
            };
        cc.eventManager.addCustomListener(cc.Director.EVENT_PROJECTION_CHANGED, function() {
            for (var a = cc.director._scenesStack, d = 0; d < a.length; d++) b(a[d])
        });
        a.setProjection = function(a) {
            var b = this._winSizeInPoints;
            this.setViewport();
            var e = this._openGLView,
                f = e._viewPortRect.x / e._scaleX,
                g = e._viewPortRect.y / e._scaleY;
            switch (a) {
                case cc.Director.PROJECTION_2D:
                    cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                    cc.kmGLLoadIdentity();
                    e = cc.math.Matrix4.createOrthographicProjection(0, b.width, 0, b.height, -1024, 1024);
                    cc.kmGLMultMatrix(e);
                    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                    cc.kmGLLoadIdentity();
                    break;
                case cc.Director.PROJECTION_3D:
                    var h = this.getZEye(),
                        k = new cc.math.Matrix4,
                        e = new cc.math.Matrix4;
                    cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                    cc.kmGLLoadIdentity();
                    k = cc.math.Matrix4.createPerspectiveProjection(60, b.width / b.height, 0.1, 2 * h);
                    cc.kmGLMultMatrix(k);
                    h = new cc.math.Vec3(-f + b.width / 2, -g + b.height / 2, h);
                    b = new cc.math.Vec3(-f + b.width / 2, -g + b.height / 2, 0);
                    f = new cc.math.Vec3(0, 1, 0);
                    e.lookAt(h, b, f);
                    cc.kmGLMultMatrix(e);
                    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                    cc.kmGLLoadIdentity();
                    break;
                case cc.Director.PROJECTION_CUSTOM:
                    this._projectionDelegate && this._projectionDelegate.updateProjection();
                    break;
                default:
                    cc.log(cc._LogInfos.Director_setProjection)
            }
            this._projection = a;
            cc.eventManager.dispatchEvent(this._eventProjectionChanged);
            cc.setProjectionMatrixDirty();
            cc.renderer.childrenOrderDirty = !0
        };
        a.setDepthTest = function(a) {
            cc.renderer.setDepthTest(a)
        };
        a.setClearColor = function(a) {
            cc.renderer._clearColor = a
        };
        a.setOpenGLView = function(a) {
            this._winSizeInPoints.width = cc._canvas.width;
            this._winSizeInPoints.height = cc._canvas.height;
            this._openGLView = a || cc.view;
            a = cc.configuration;
            a.gatherGPUInfo();
            a.dumpInfo();
            this.setGLDefaultValues();
            cc.eventManager && cc.eventManager.setEnabled(!0)
        };
        a.getVisibleSize = function() {
            return this._openGLView.getVisibleSize()
        };
        a.getVisibleOrigin = function() {
            return this._openGLView.getVisibleOrigin()
        };
        a.getZEye = function() {
            return this._winSizeInPoints.height / 1.1546999375
        };
        a.setViewport = function() {
            var a = this._openGLView;
            if (a) {
                var b = this._winSizeInPoints;
                a.setViewPortInPoints(-a._viewPortRect.x / a._scaleX, -a._viewPortRect.y / a._scaleY, b.width, b.height)
            }
        };
        a.getOpenGLView = function() {
            return this._openGLView
        };
        a.getProjection = function() {
            return this._projection
        };
        a.setAlphaBlending = function(a) {
            a ? cc.glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST) : cc.glBlendFunc(cc._renderContext.ONE, cc._renderContext.ZERO)
        };
        a.setGLDefaultValues = function() {
            this.setAlphaBlending(!0);
            this.setProjection(this._projection);
            cc._renderContext.clearColor(0, 0, 0, 0)
        }
    }
});
(function() {
    var a = function(a, b, c, d, e, f, g) {
            this.prev = a;
            this.next = b;
            this.callback = c;
            this.target = d;
            this.priority = e;
            this.paused = f;
            this.markedForDeletion = g
        },
        b = [];
    a.get = function(c, d, e, f, g, h, u) {
        var t = b.pop();
        t ? (t.prev = c, t.next = d, t.callback = e, t.target = f, t.priority = g, t.paused = h, t.markedForDeletion = u) : t = new a(c, d, e, f, g, h, u);
        return t
    };
    a.put = function(a) {
        a.prev = null;
        a.next = null;
        a.callback = null;
        a.target = null;
        a.priority = 0;
        a.paused = !1;
        a.markedForDeletion = !1;
        20 > b.length && b.push(a)
    };
    var c = function(a, b, c, d) {
            this.list =
                a;
            this.entry = b;
            this.target = c;
            this.callback = d
        },
        d = [];
    c.get = function(a, b, e, f) {
        var g = d.pop();
        g ? (g.list = a, g.entry = b, g.target = e, g.callback = f) : g = new c(a, b, e, f);
        return g
    };
    c.put = function(a) {
        a.list = null;
        a.entry = null;
        a.target = null;
        a.callback = null;
        20 > d.length && d.push(a)
    };
    var e = function(a, b, c, d, e, f) {
            this.timers = a;
            this.target = b;
            this.timerIndex = c;
            this.currentTimer = d;
            this.currentTimerSalvaged = e;
            this.paused = f
        },
        f = [];
    e.get = function(a, b, c, d, g, h) {
        var u = f.pop();
        u ? (u.timers = a, u.target = b, u.timerIndex = c, u.currentTimer = d,
            u.currentTimerSalvaged = g, u.paused = h) : u = new e(a, b, c, d, g, h);
        return u
    };
    e.put = function(a) {
        a.timers = null;
        a.target = null;
        a.timerIndex = 0;
        a.currentTimer = null;
        a.currentTimerSalvaged = !1;
        a.paused = !1;
        20 > f.length && f.push(a)
    };
    var g = function() {
        this._scheduler = null;
        this._elapsed = -1;
        this._useDelay = this._runForever = !1;
        this._interval = this._delay = this._repeat = this._timesExecuted = 0;
        this._key = this._callback = this._target = null
    };
    cc.inject({
        initWithCallback: function(a, b, c, d, e, f, g) {
            this._scheduler = a;
            this._target = c;
            this._callback =
                b;
            g && (this._key = g);
            this._elapsed = -1;
            this._interval = d;
            this._delay = f;
            this._useDelay = 0 < this._delay;
            this._repeat = e;
            this._runForever = this._repeat === cc.REPEAT_FOREVER;
            return !0
        },
        getInterval: function() {
            return this._interval
        },
        setInterval: function(a) {
            this._interval = a
        },
        update: function(a) {
            -1 === this._elapsed ? this._timesExecuted = this._elapsed = 0 : (this._elapsed += a, this._runForever && !this._useDelay ? this._elapsed >= this._interval && (this.trigger(), this._elapsed = 0) : (this._useDelay ? this._elapsed >= this._delay && (this.trigger(),
                this._elapsed -= this._delay, this._timesExecuted += 1, this._useDelay = !1) : this._elapsed >= this._interval && (this.trigger(), this._elapsed = 0, this._timesExecuted += 1), this._callback && !this._runForever && this._timesExecuted > this._repeat && this.cancel()))
        },
        getCallback: function() {
            return this._callback
        },
        getKey: function() {
            return this._key
        },
        trigger: function() {
            this._target && this._callback && this._callback.call(this._target, this._elapsed)
        },
        cancel: function() {
            this._scheduler.unschedule(this._callback, this._target)
        }
    }, g.prototype);
    var h = [];
    g.get = function() {
        return h.pop() || new g
    };
    g.put = function(a) {
        a._scheduler = null;
        a._elapsed = -1;
        a._runForever = !1;
        a._useDelay = !1;
        a._timesExecuted = 0;
        a._repeat = 0;
        a._delay = 0;
        a._interval = 0;
        a._target = null;
        a._callback = null;
        a._key = null;
        20 > h.length && h.push(a)
    };
    cc.Scheduler = cc.Class.extend({
        _timeScale: 1,
        _updatesNegList: null,
        _updates0List: null,
        _updatesPosList: null,
        _hashForTimers: null,
        _arrayForTimers: null,
        _hashForUpdates: null,
        _currentTarget: null,
        _currentTargetSalvaged: !1,
        _updateHashLocked: !1,
        ctor: function() {
            this._timeScale =
                1;
            this._updatesNegList = [];
            this._updates0List = [];
            this._updatesPosList = [];
            this._hashForUpdates = {};
            this._hashForTimers = {};
            this._currentTarget = null;
            this._updateHashLocked = this._currentTargetSalvaged = !1;
            this._arrayForTimers = []
        },
        _schedulePerFrame: function(a, b, c, d) {
            var e = this._hashForUpdates[b.__instanceId];
            if (e && e.entry)
                if (e.entry.priority !== c) {
                    if (this._updateHashLocked) {
                        cc.log("warning: you CANNOT change update priority in scheduled function");
                        e.entry.markedForDeletion = !1;
                        e.entry.paused = d;
                        return
                    }
                    this.unscheduleUpdate(b)
                } else {
                    e.entry.markedForDeletion = !1;
                    e.entry.paused = d;
                    return
                }
            0 === c ? this._appendIn(this._updates0List, a, b, d) : 0 > c ? this._priorityIn(this._updatesNegList, a, b, c, d) : this._priorityIn(this._updatesPosList, a, b, c, d)
        },
        _removeHashElement: function(a) {
            delete this._hashForTimers[a.target.__instanceId];
            for (var b = this._arrayForTimers, c = 0, d = b.length; c < d; c++)
                if (b[c] === a) {
                    b.splice(c, 1);
                    break
                }
            e.put(a)
        },
        _removeUpdateFromHash: function(b) {
            if (element = this._hashForUpdates[b.target.__instanceId]) {
                b = element.list;
                for (var d = element.entry, e = 0, f = b.length; e < f; e++)
                    if (b[e] ===
                        d) {
                        b.splice(e, 1);
                        break
                    }
                delete this._hashForUpdates[element.target.__instanceId];
                a.put(d);
                c.put(element)
            }
        },
        _priorityIn: function(b, d, e, f, g) {
            d = a.get(null, null, d, e, f, g, !1);
            if (b) {
                g = b.length - 1;
                for (var h = 0; h <= g && !(f < b[h].priority); h++);
                b.splice(h, 0, d)
            } else b = [], b.push(d);
            this._hashForUpdates[e.__instanceId] = c.get(b, d, e, null);
            return b
        },
        _appendIn: function(b, d, e, f) {
            d = a.get(null, null, d, e, 0, f, !1);
            b.push(d);
            this._hashForUpdates[e.__instanceId] = c.get(b, d, e, null, null)
        },
        setTimeScale: function(a) {
            this._timeScale = a
        },
        getTimeScale: function() {
            return this._timeScale
        },
        update: function(a) {
            this._updateHashLocked = !0;
            1 !== this._timeScale && (a *= this._timeScale);
            var b, c, d, e;
            b = 0;
            c = this._updatesNegList;
            for (d = c.length; b < d; b++) e = c[b], e.paused || e.markedForDeletion || e.callback(a);
            b = 0;
            c = this._updates0List;
            for (d = c.length; b < d; b++) e = c[b], e.paused || e.markedForDeletion || e.callback(a);
            b = 0;
            c = this._updatesPosList;
            for (d = c.length; b < d; b++) e = c[b], e.paused || e.markedForDeletion || e.callback(a);
            d = this._arrayForTimers;
            for (b = 0; b < d.length; b++) {
                this._currentTarget =
                    c = d[b];
                this._currentTargetSalvaged = !1;
                if (!c.paused)
                    for (c.timerIndex = 0; c.timerIndex < c.timers.length; ++c.timerIndex) c.currentTimer = c.timers[c.timerIndex], c.currentTimerSalvaged = !1, c.currentTimer.update(a), c.currentTimer = null;
                this._currentTargetSalvaged && 0 === this._currentTarget.timers.length && this._removeHashElement(this._currentTarget)
            }
            b = 0;
            for (c = this._updatesNegList; b < c.length;) e = c[b], e.markedForDeletion ? this._removeUpdateFromHash(e) : b++;
            b = 0;
            for (c = this._updates0List; b < c.length;) e = c[b], e.markedForDeletion ?
                this._removeUpdateFromHash(e) : b++;
            b = 0;
            for (c = this._updatesPosList; b < c.length;) e = c[b], e.markedForDeletion ? this._removeUpdateFromHash(e) : b++;
            this._updateHashLocked = !1;
            this._currentTarget = null
        },
        scheduleCallbackForTarget: function(a, b, c, d, e, f) {
            this.schedule(b, a, c, d, e, f, a.__instanceId + "")
        },
        schedule: function(a, b, c, d, f, h, u) {
            if ("function" !== typeof a) {
                var t = a;
                a = b;
                b = t
            }
            if (4 === arguments.length || 5 === arguments.length) u = f, h = d, d = cc.REPEAT_FOREVER, f = 0;
            void 0 === u && (u = b.__instanceId + "");
            cc.assert(b, cc._LogInfos.Scheduler_scheduleCallbackForTarget_3);
            (t = this._hashForTimers[b.__instanceId]) ? cc.assert(t.paused === h, ""): (t = e.get(null, b, 0, null, null, h), this._arrayForTimers.push(t), this._hashForTimers[b.__instanceId] = t);
            var w, v;
            if (null == t.timers) t.timers = [];
            else
                for (v = 0; v < t.timers.length; v++)
                    if (w = t.timers[v], a === w._callback) {
                        cc.log(cc._LogInfos.Scheduler_scheduleCallbackForTarget, w.getInterval().toFixed(4), c.toFixed(4));
                        w._interval = c;
                        return
                    }
            w = g.get();
            w.initWithCallback(this, a, b, c, d, f, u);
            t.timers.push(w)
        },
        scheduleUpdate: function(a, b, c) {
            this._schedulePerFrame(function(b) {
                    a.update(b)
                },
                a, b, c)
        },
        _getUnscheduleMark: function(a, b) {
            switch (typeof a) {
                case "number":
                case "string":
                    return a === b._key;
                case "function":
                    return a === b._callback
            }
        },
        unschedule: function(a, b) {
            if (b && a) {
                var c = this._hashForTimers[b.__instanceId];
                if (c)
                    for (var d = c.timers, e = 0, f = d.length; e < f; e++) {
                        var h = d[e];
                        if (this._getUnscheduleMark(a, h)) {
                            h !== c.currentTimer || c.currentTimerSalvaged || (c.currentTimerSalvaged = !0);
                            d.splice(e, 1);
                            g.put(h);
                            c.timerIndex >= e && c.timerIndex--;
                            0 === d.length && (this._currentTarget === c ? this._currentTargetSalvaged = !0 : this._removeHashElement(c));
                            break
                        }
                    }
            }
        },
        unscheduleUpdate: function(a) {
            a && (a = this._hashForUpdates[a.__instanceId]) && (this._updateHashLocked ? a.entry.markedForDeletion = !0 : this._removeUpdateFromHash(a.entry))
        },
        unscheduleAllForTarget: function(a) {
            if (a) {
                var b = this._hashForTimers[a.__instanceId];
                if (b) {
                    var c = b.timers; - 1 < c.indexOf(b.currentTimer) && !b.currentTimerSalvaged && (b.currentTimerSalvaged = !0);
                    for (var d = 0, e = c.length; d < e; d++) g.put(c[d]);
                    c.length = 0;
                    this._currentTarget === b ? this._currentTargetSalvaged = !0 :
                        this._removeHashElement(b)
                }
                this.unscheduleUpdate(a)
            }
        },
        unscheduleAll: function() {
            this.unscheduleAllWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
        },
        unscheduleAllWithMinPriority: function(a) {
            var b, c, d = this._arrayForTimers;
            for (b = d.length - 1; 0 <= b; b--) c = d[b], this.unscheduleAllForTarget(c.target);
            d = 0;
            if (0 > a)
                for (b = 0; b < this._updatesNegList.length;) d = this._updatesNegList.length, (c = this._updatesNegList[b]) && c.priority >= a && this.unscheduleUpdate(c.target), d == this._updatesNegList.length && b++;
            if (0 >= a)
                for (b = 0; b < this._updates0List.length;) d =
                    this._updates0List.length, (c = this._updates0List[b]) && this.unscheduleUpdate(c.target), d == this._updates0List.length && b++;
            for (b = 0; b < this._updatesPosList.length;) d = this._updatesPosList.length, (c = this._updatesPosList[b]) && c.priority >= a && this.unscheduleUpdate(c.target), d == this._updatesPosList.length && b++
        },
        isScheduled: function(a, b) {
            cc.assert(a, "Argument callback must not be empty");
            cc.assert(b, "Argument target must be non-nullptr");
            var c = this._hashForTimers[b.__instanceId];
            if (!c) return !1;
            if (null != c.timers)
                for (var c =
                        c.timers, d = 0; d < c.length; ++d)
                    if (a === c[d]._callback) return !0;
            return !1
        },
        pauseAllTargets: function() {
            return this.pauseAllTargetsWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
        },
        pauseAllTargetsWithMinPriority: function(a) {
            var b = [],
                c, d = this._arrayForTimers,
                e, f;
            e = 0;
            for (f = d.length; e < f; e++)
                if (c = d[e]) c.paused = !0, b.push(c.target);
            if (0 > a)
                for (e = 0; e < this._updatesNegList.length; e++)(c = this._updatesNegList[e]) && c.priority >= a && (c.paused = !0, b.push(c.target));
            if (0 >= a)
                for (e = 0; e < this._updates0List.length; e++)
                    if (c = this._updates0List[e]) c.paused = !0, b.push(c.target);
            for (e = 0; e < this._updatesPosList.length; e++)(c = this._updatesPosList[e]) && c.priority >= a && (c.paused = !0, b.push(c.target));
            return b
        },
        resumeTargets: function(a) {
            if (a)
                for (var b = 0; b < a.length; b++) this.resumeTarget(a[b])
        },
        pauseTarget: function(a) {
            cc.assert(a, cc._LogInfos.Scheduler_pauseTarget);
            var b = this._hashForTimers[a.__instanceId];
            b && (b.paused = !0);
            (a = this._hashForUpdates[a.__instanceId]) && (a.entry.paused = !0)
        },
        resumeTarget: function(a) {
            cc.assert(a, cc._LogInfos.Scheduler_resumeTarget);
            var b =
                this._hashForTimers[a.__instanceId];
            b && (b.paused = !1);
            (a = this._hashForUpdates[a.__instanceId]) && (a.entry.paused = !1)
        },
        isTargetPaused: function(a) {
            cc.assert(a, cc._LogInfos.Scheduler_isTargetPaused);
            var b = this._hashForTimers[a.__instanceId];
            return b ? b.paused : (a = this._hashForUpdates[a.__instanceId]) ? a.entry.paused : !1
        },
        scheduleUpdateForTarget: function(a, b, c) {
            this.scheduleUpdate(a, b, c)
        },
        unscheduleCallbackForTarget: function(a, b) {
            this.unschedule(b, a)
        },
        unscheduleUpdateForTarget: function(a) {
            this.unscheduleUpdate(a)
        },
        unscheduleAllCallbacksForTarget: function(a) {
            this.unschedule(a.__instanceId + "", a)
        },
        unscheduleAllCallbacks: function() {
            this.unscheduleAllWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
        },
        unscheduleAllCallbacksWithMinPriority: function(a) {
            this.unscheduleAllWithMinPriority(a)
        }
    });
    cc.Scheduler.PRIORITY_SYSTEM = -2147483648;
    cc.Scheduler.PRIORITY_NON_SYSTEM = cc.Scheduler.PRIORITY_SYSTEM + 1
})();
cc.PI2 = 2 * Math.PI;
cc.DrawingPrimitiveCanvas = cc.Class.extend({
    _cacheArray: [],
    _renderContext: null,
    ctor: function(a) {
        this._renderContext = a
    },
    drawPoint: function(a, b) {
        b || (b = 1);
        var c = cc.view.getScaleX(),
            d = cc.view.getScaleY(),
            d = cc.p(a.x * c, a.y * d),
            e = this._renderContext.getContext();
        e.beginPath();
        e.arc(d.x, -d.y, b * c, 0, 2 * Math.PI, !1);
        e.closePath();
        e.fill()
    },
    drawPoints: function(a, b, c) {
        if (null != a) {
            c || (c = 1);
            b = this._renderContext.getContext();
            var d = cc.view.getScaleX(),
                e = cc.view.getScaleY();
            b.beginPath();
            for (var f = 0, g = a.length; f < g; f++) b.arc(a[f].x *
                d, -a[f].y * e, c * d, 0, 2 * Math.PI, !1);
            b.closePath();
            b.fill()
        }
    },
    drawLine: function(a, b) {
        var c = this._renderContext.getContext();
        cc.view.getScaleX();
        cc.view.getScaleY();
        c.beginPath();
        c.moveTo(a.x, -a.y);
        c.lineTo(b.x, -b.y);
        c.closePath();
        c.stroke()
    },
    drawRect: function(a, b) {
        this.drawLine(cc.p(a.x, a.y), cc.p(b.x, a.y));
        this.drawLine(cc.p(b.x, a.y), cc.p(b.x, b.y));
        this.drawLine(cc.p(b.x, b.y), cc.p(a.x, b.y));
        this.drawLine(cc.p(a.x, b.y), cc.p(a.x, a.y))
    },
    drawSolidRect: function(a, b, c) {
        a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
        this.drawSolidPoly(a,
            4, c)
    },
    drawPoly: function(a, b, c, d) {
        d = d || !1;
        if (null != a) {
            if (3 > a.length) throw Error("Polygon's point must greater than 2");
            var e = a[0];
            b = this._renderContext.getContext();
            cc.view.getScaleX();
            cc.view.getScaleY();
            b.beginPath();
            b.moveTo(e.x, -e.y);
            for (var e = 1, f = a.length; e < f; e++) b.lineTo(a[e].x, -a[e].y);
            c && b.closePath();
            d ? b.fill() : b.stroke()
        }
    },
    drawSolidPoly: function(a, b, c) {
        this.setDrawColor(c.r, c.g, c.b, c.a);
        this.drawPoly(a, b, !0, !0)
    },
    drawCircle: function(a, b, c, d, e) {
        e = e || !1;
        d = this._renderContext.getContext();
        cc.view.getScaleX();
        cc.view.getScaleY();
        d.beginPath();
        d.arc(0 | a.x, 0 | -a.y, b, -c, -(c - 2 * Math.PI), !1);
        e && d.lineTo(0 | a.x, 0 | -a.y);
        d.stroke()
    },
    drawQuadBezier: function(a, b, c, d) {
        for (var e = this._cacheArray, f = e.length = 0, g = 0; g < d; g++) {
            var h = Math.pow(1 - f, 2) * a.x + 2 * (1 - f) * f * b.x + f * f * c.x,
                k = Math.pow(1 - f, 2) * a.y + 2 * (1 - f) * f * b.y + f * f * c.y;
            e.push(cc.p(h, k));
            f += 1 / d
        }
        e.push(cc.p(c.x, c.y));
        this.drawPoly(e, d + 1, !1, !1)
    },
    drawCubicBezier: function(a, b, c, d, e) {
        for (var f = this._cacheArray, g = f.length = 0, h = 0; h < e; h++) {
            var k = Math.pow(1 - g, 3) * a.x + 3 * Math.pow(1 - g, 2) *
                g * b.x + 3 * (1 - g) * g * g * c.x + g * g * g * d.x,
                m = Math.pow(1 - g, 3) * a.y + 3 * Math.pow(1 - g, 2) * g * b.y + 3 * (1 - g) * g * g * c.y + g * g * g * d.y;
            f.push(cc.p(k, m));
            g += 1 / e
        }
        f.push(cc.p(d.x, d.y));
        this.drawPoly(f, e + 1, !1, !1)
    },
    drawCatmullRom: function(a, b) {
        this.drawCardinalSpline(a, 0.5, b)
    },
    drawCardinalSpline: function(a, b, c) {
        cc._renderContext.setStrokeStyle("rgba(255,255,255,1)");
        var d = this._cacheArray;
        d.length = 0;
        for (var e, f, g = 1 / a.length, h = 0; h < c + 1; h++) f = h / c, 1 === f ? (e = a.length - 1, f = 1) : (e = 0 | f / g, f = (f - g * e) / g), e = cc.CardinalSplineAt(cc.getControlPointAt(a,
            e - 1), cc.getControlPointAt(a, e - 0), cc.getControlPointAt(a, e + 1), cc.getControlPointAt(a, e + 2), b, f), d.push(e);
        this.drawPoly(d, c + 1, !1, !1)
    },
    drawImage: function(a, b, c, d, e) {
        var f = arguments.length,
            g = this._renderContext.getContext();
        switch (f) {
            case 2:
                g.drawImage(a, b.x, -(b.y + a.height));
                break;
            case 3:
                g.drawImage(a, b.x, -(b.y + c.height), c.width, c.height);
                break;
            case 5:
                g.drawImage(a, b.x, b.y, c.width, c.height, d.x, -(d.y + e.height), e.width, e.height);
                break;
            default:
                throw Error("Argument must be non-nil");
        }
    },
    drawStar: function(a,
        b, c) {
        a = a || this._renderContext;
        var d = a.getContext();
        c = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b);
        a.setFillStyle(c + ",1)");
        var e = b / 10;
        d.beginPath();
        d.moveTo(-b, b);
        d.lineTo(0, e);
        d.lineTo(b, b);
        d.lineTo(e, 0);
        d.lineTo(b, -b);
        d.lineTo(0, -e);
        d.lineTo(-b, -b);
        d.lineTo(-e, 0);
        d.lineTo(-b, b);
        d.closePath();
        d.fill();
        var f = d.createRadialGradient(0, 0, e, 0, 0, b);
        f.addColorStop(0, c + ", 1)");
        f.addColorStop(0.3, c + ", 0.8)");
        f.addColorStop(1, c + ", 0.0)");
        a.setFillStyle(f);
        d.beginPath();
        d.arc(0, 0, b - e, 0, cc.PI2, !1);
        d.closePath();
        d.fill()
    },
    drawColorBall: function(a, b, c) {
        a = a || this._renderContext;
        var d = a.getContext();
        b *= cc.view.getScaleX();
        c = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b);
        var e = d.createRadialGradient(0, 0, b / 10, 0, 0, b);
        e.addColorStop(0, c + ", 1)");
        e.addColorStop(0.3, c + ", 0.8)");
        e.addColorStop(0.6, c + ", 0.4)");
        e.addColorStop(1, c + ", 0.0)");
        a.setFillStyle(e);
        d.beginPath();
        d.arc(0, 0, b, 0, cc.PI2, !1);
        d.closePath();
        d.fill()
    },
    fillText: function(a, b, c) {
        this._renderContext.getContext().fillText(a, b, -c)
    },
    setDrawColor: function(a, b, c, d) {
        this._renderContext.setFillStyle("rgba(" +
            a + "," + b + "," + c + "," + d / 255 + ")");
        this._renderContext.setStrokeStyle("rgba(" + a + "," + b + "," + c + "," + d / 255 + ")")
    },
    setPointSize: function(a) {},
    setLineWidth: function(a) {
        this._renderContext.getContext().lineWidth = a * cc.view.getScaleX()
    }
});
cc.DrawingPrimitiveWebGL = cc.Class.extend({
    _renderContext: null,
    _initialized: !1,
    _shader: null,
    _colorLocation: "u_color",
    _colorArray: null,
    _pointSizeLocation: "u_pointSize",
    _pointSize: -1,
    ctor: function(a) {
        null == a && (a = cc._renderContext);
        if (!a instanceof WebGLRenderingContext) throw Error("Can't initialise DrawingPrimitiveWebGL. context need is WebGLRenderingContext");
        this._renderContext = a;
        this._colorArray = new Float32Array([1, 1, 1, 1])
    },
    lazy_init: function() {
        this._initialized || (this._shader = cc.shaderCache.programForKey(cc.SHADER_POSITION_UCOLOR),
            this._shader._addUniformLocation(this._colorLocation), this._shader._addUniformLocation(this._pointSizeLocation), this._initialized = !0)
    },
    drawInit: function() {
        this._initialized = !1
    },
    drawPoint: function(a) {
        this.lazy_init();
        var b = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        b.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation,
            this._pointSize);
        var c = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, c);
        b.bufferData(b.ARRAY_BUFFER, new Float32Array([a.x, a.y]), b.STATIC_DRAW);
        b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
        b.drawArrays(b.POINTS, 0, 1);
        b.deleteBuffer(c);
        cc.incrementGLDraws(1)
    },
    drawPoints: function(a, b) {
        if (a && 0 !== a.length) {
            this.lazy_init();
            var c = this._renderContext;
            this._shader.use();
            this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
            c.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
            this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);
            var d = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, d);
            c.bufferData(c.ARRAY_BUFFER, this._pointsToTypeArray(a), c.STATIC_DRAW);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, 0);
            c.drawArrays(c.POINTS, 0, a.length);
            c.deleteBuffer(d);
            cc.incrementGLDraws(1)
        }
    },
    _pointsToTypeArray: function(a) {
        for (var b = new Float32Array(2 * a.length), c = 0; c < a.length; c++) b[2 *
            c] = a[c].x, b[2 * c + 1] = a[c].y;
        return b
    },
    drawLine: function(a, b) {
        this.lazy_init();
        var c = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        c.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        var d = c.createBuffer();
        c.bindBuffer(c.ARRAY_BUFFER, d);
        c.bufferData(c.ARRAY_BUFFER, this._pointsToTypeArray([a, b]), c.STATIC_DRAW);
        c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, 0);
        c.drawArrays(c.LINES, 0, 2);
        c.deleteBuffer(d);
        cc.incrementGLDraws(1)
    },
    drawRect: function(a, b) {
        this.drawLine(cc.p(a.x, a.y), cc.p(b.x, a.y));
        this.drawLine(cc.p(b.x, a.y), cc.p(b.x, b.y));
        this.drawLine(cc.p(b.x, b.y), cc.p(a.x, b.y));
        this.drawLine(cc.p(a.x, b.y), cc.p(a.x, a.y))
    },
    drawSolidRect: function(a, b, c) {
        a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
        this.drawSolidPoly(a, 4, c)
    },
    drawPoly: function(a, b, c) {
        this.lazy_init();
        b = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        b.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        var d = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, d);
        b.bufferData(b.ARRAY_BUFFER, this._pointsToTypeArray(a), b.STATIC_DRAW);
        b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
        c ? b.drawArrays(b.LINE_LOOP, 0, a.length) : b.drawArrays(b.LINE_STRIP, 0, a.length);
        b.deleteBuffer(d);
        cc.incrementGLDraws(1)
    },
    drawSolidPoly: function(a, b, c) {
        this.lazy_init();
        c && this.setDrawColor(c.r,
            c.g, c.b, c.a);
        b = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        b.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        c = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, c);
        b.bufferData(b.ARRAY_BUFFER, this._pointsToTypeArray(a), b.STATIC_DRAW);
        b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
        b.drawArrays(b.TRIANGLE_FAN, 0, a.length);
        b.deleteBuffer(c);
        cc.incrementGLDraws(1)
    },
    drawCircle: function(a, b, c, d, e) {
        this.lazy_init();
        var f = 1;
        e && f++;
        var g = 2 * Math.PI / d;
        if (e = new Float32Array(2 * (d + 2))) {
            for (var h = 0; h <= d; h++) {
                var k = h * g,
                    m = b * Math.cos(k + c) + a.x,
                    k = b * Math.sin(k + c) + a.y;
                e[2 * h] = m;
                e[2 * h + 1] = k
            }
            e[2 * (d + 1)] = a.x;
            e[2 * (d + 1) + 1] = a.y;
            a = this._renderContext;
            this._shader.use();
            this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
            a.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
            b = a.createBuffer();
            a.bindBuffer(a.ARRAY_BUFFER,
                b);
            a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
            a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
            a.drawArrays(a.LINE_STRIP, 0, d + f);
            a.deleteBuffer(b);
            cc.incrementGLDraws(1)
        }
    },
    drawQuadBezier: function(a, b, c, d) {
        this.lazy_init();
        for (var e = new Float32Array(2 * (d + 1)), f = 0, g = 0; g < d; g++) e[2 * g] = Math.pow(1 - f, 2) * a.x + 2 * (1 - f) * f * b.x + f * f * c.x, e[2 * g + 1] = Math.pow(1 - f, 2) * a.y + 2 * (1 - f) * f * b.y + f * f * c.y, f += 1 / d;
        e[2 * d] = c.x;
        e[2 * d + 1] = c.y;
        a = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        a.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        b = a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER, b);
        a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
        a.drawArrays(a.LINE_STRIP, 0, d + 1);
        a.deleteBuffer(b);
        cc.incrementGLDraws(1)
    },
    drawCubicBezier: function(a, b, c, d, e) {
        this.lazy_init();
        for (var f = new Float32Array(2 * (e + 1)), g = 0, h = 0; h < e; h++) f[2 * h] = Math.pow(1 - g, 3) * a.x + 3 * Math.pow(1 -
            g, 2) * g * b.x + 3 * (1 - g) * g * g * c.x + g * g * g * d.x, f[2 * h + 1] = Math.pow(1 - g, 3) * a.y + 3 * Math.pow(1 - g, 2) * g * b.y + 3 * (1 - g) * g * g * c.y + g * g * g * d.y, g += 1 / e;
        f[2 * e] = d.x;
        f[2 * e + 1] = d.y;
        a = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        a.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        b = a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER, b);
        a.bufferData(a.ARRAY_BUFFER, f, a.STATIC_DRAW);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION,
    },
          
