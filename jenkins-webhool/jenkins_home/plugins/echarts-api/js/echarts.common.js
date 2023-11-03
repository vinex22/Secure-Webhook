
/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.echarts = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var Browser = (function () {
        function Browser() {
            this.firefox = false;
            this.ie = false;
            this.edge = false;
            this.newEdge = false;
            this.weChat = false;
        }
        return Browser;
    }());
    var Env = (function () {
        function Env() {
            this.browser = new Browser();
            this.node = false;
            this.wxa = false;
            this.worker = false;
            this.svgSupported = false;
            this.touchEventsSupported = false;
            this.pointerEventsSupported = false;
            this.domSupported = false;
            this.transformSupported = false;
            this.transform3dSupported = false;
            this.hasGlobalWindow = typeof window !== 'undefined';
        }
        return Env;
    }());
    var env = new Env();
    if (typeof wx === 'object' && typeof wx.getSystemInfoSync === 'function') {
        env.wxa = true;
        env.touchEventsSupported = true;
    }
    else if (typeof document === 'undefined' && typeof self !== 'undefined') {
        env.worker = true;
    }
    else if (typeof navigator === 'undefined') {
        env.node = true;
        env.svgSupported = true;
    }
    else {
        detect(navigator.userAgent, env);
    }
    function detect(ua, env) {
        var browser = env.browser;
        var firefox = ua.match(/Firefox\/([\d.]+)/);
        var ie = ua.match(/MSIE\s([\d.]+)/)
            || ua.match(/Trident\/.+?rv:(([\d.]+))/);
        var edge = ua.match(/Edge?\/([\d.]+)/);
        var weChat = (/micromessenger/i).test(ua);
        if (firefox) {
            browser.firefox = true;
            browser.version = firefox[1];
        }
        if (ie) {
            browser.ie = true;
            browser.version = ie[1];
        }
        if (edge) {
            browser.edge = true;
            browser.version = edge[1];
            browser.newEdge = +edge[1].split('.')[0] > 18;
        }
        if (weChat) {
            browser.weChat = true;
        }
        env.svgSupported = typeof SVGRect !== 'undefined';
        env.touchEventsSupported = 'ontouchstart' in window && !browser.ie && !browser.edge;
        env.pointerEventsSupported = 'onpointerdown' in window
            && (browser.edge || (browser.ie && +browser.version >= 11));
        env.domSupported = typeof document !== 'undefined';
        var style = document.documentElement.style;
        env.transform3dSupported = ((browser.ie && 'transition' in style)
            || browser.edge
            || (('WebKitCSSMatrix' in window) && ('m11' in new WebKitCSSMatrix()))
            || 'MozPerspective' in style)
            && !('OTransition' in style);
        env.transformSupported = env.transform3dSupported
            || (browser.ie && +browser.version >= 9);
    }

    var DEFAULT_FONT_SIZE = 12;
    var DEFAULT_FONT_FAMILY = 'sans-serif';
    var DEFAULT_FONT = DEFAULT_FONT_SIZE + "px " + DEFAULT_FONT_FAMILY;
    var OFFSET = 20;
    var SCALE = 100;
    var defaultWidthMapStr = "007LLmW'55;N0500LLLLLLLLLL00NNNLzWW\\\\WQb\\0FWLg\\bWb\\WQ\\WrWWQ000CL5LLFLL0LL**F*gLLLL5F0LF\\FFF5.5N";
    function getTextWidthMap(mapStr) {
        var map = {};
        if (typeof JSON === 'undefined') {
            return map;
        }
        for (var i = 0; i < mapStr.length; i++) {
            var char = String.fromCharCode(i + 32);
            var size = (mapStr.charCodeAt(i) - OFFSET) / SCALE;
            map[char] = size;
        }
        return map;
    }
    var DEFAULT_TEXT_WIDTH_MAP = getTextWidthMap(defaultWidthMapStr);
    var platformApi = {
        createCanvas: function () {
            return typeof document !== 'undefined'
                && document.createElement('canvas');
        },
        measureText: (function () {
            var _ctx;
            var _cachedFont;
            return function (text, font) {
                if (!_ctx) {
                    var canvas = platformApi.createCanvas();
                    _ctx = canvas && canvas.getContext('2d');
                }
                if (_ctx) {
                    if (_cachedFont !== font) {
                        _cachedFont = _ctx.font = font || DEFAULT_FONT;
                    }
                    return _ctx.measureText(text);
                }
                else {
                    text = text || '';
                    font = font || DEFAULT_FONT;
                    var res = /^([0-9]*?)px$/.exec(font);
                    var fontSize = +(res && res[1]) || DEFAULT_FONT_SIZE;
                    var width = 0;
                    if (font.indexOf('mono') >= 0) {
                        width = fontSize * text.length;
                    }
                    else {
                        for (var i = 0; i < text.length; i++) {
                            var preCalcWidth = DEFAULT_TEXT_WIDTH_MAP[text[i]];
                            width += preCalcWidth == null ? fontSize : (preCalcWidth * fontSize);
                        }
                    }
                    return { width: width };
                }
            };
        })(),
        loadImage: function (src, onload, onerror) {
            var image = new Image();
            image.onload = onload;
            image.onerror = onerror;
            image.src = src;
            return image;
        }
    };
    function setPlatformAPI(newPlatformApis) {
        for (var key in platformApi) {
            if (newPlatformApis[key]) {
                platformApi[key] = newPlatformApis[key];
            }
        }
    }

    var BUILTIN_OBJECT = reduce([
        'Function',
        'RegExp',
        'Date',
        'Error',
        'CanvasGradient',
        'CanvasPattern',
        'Image',
        'Canvas'
    ], function (obj, val) {
        obj['[object ' + val + ']'] = true;
        return obj;
    }, {});
    var TYPED_ARRAY = reduce([
        'Int8',
        'Uint8',
        'Uint8Clamped',
        'Int16',
        'Uint16',
        'Int32',
        'Uint32',
        'Float32',
        'Float64'
    ], function (obj, val) {
        obj['[object ' + val + 'Array]'] = true;
        return obj;
    }, {});
    var objToString = Object.prototype.toString;
    var arrayProto = Array.prototype;
    var nativeForEach = arrayProto.forEach;
    var nativeFilter = arrayProto.filter;
    var nativeSlice = arrayProto.slice;
    var nativeMap = arrayProto.map;
    var ctorFunction = function () { }.constructor;
    var protoFunction = ctorFunction ? ctorFunction.prototype : null;
    var protoKey = '__proto__';
    var idStart = 0x0907;
    function guid() {
        return idStart++;
    }
    function logError() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof console !== 'undefined') {
            console.error.apply(console, args);
        }
    }
    function clone(source) {
        if (source == null || typeof source !== 'object') {
            return source;
        }
        var result = source;
        var typeStr = objToString.call(source);
        if (typeStr === '[object Array]') {
            if (!isPrimitive(source)) {
                result = [];
                for (var i = 0, len = source.length; i < len; i++) {
                    result[i] = clone(source[i]);
                }
            }
        }
        else if (TYPED_ARRAY[typeStr]) {
            if (!isPrimitive(source)) {
                var Ctor = source.constructor;
                if (Ctor.from) {
                    result = Ctor.from(source);
                }
                else {
                    result = new Ctor(source.length);
                    for (var i = 0, len = source.length; i < len; i++) {
                        result[i] = source[i];
                    }
                }
            }
        }
        else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
            result = {};
            for (var key in source) {
                if (source.hasOwnProperty(key) && key !== protoKey) {
                    result[key] = clone(source[key]);
                }
            }
        }
        return result;
    }
    function merge(target, source, overwrite) {
        if (!isObject(source) || !isObject(target)) {
            return overwrite ? clone(source) : target;
        }
        for (var key in source) {
            if (source.hasOwnProperty(key) && key !== protoKey) {
                var targetProp = target[key];
                var sourceProp = source[key];
                if (isObject(sourceProp)
                    && isObject(targetProp)
                    && !isArray(sourceProp)
                    && !isArray(targetProp)
                    && !isDom(sourceProp)
                    && !isDom(targetProp)
                    && !isBuiltInObject(sourceProp)
                    && !isBuiltInObject(targetProp)
                    && !isPrimitive(sourceProp)
                    && !isPrimitive(targetProp)) {
                    merge(targetProp, sourceProp, overwrite);
                }
                else if (overwrite || !(key in target)) {
                    target[key] = clone(source[key]);
                }
            }
        }
        return target;
    }
    function mergeAll(targetAndSources, overwrite) {
        var result = targetAndSources[0];
        for (var i = 1, len = targetAndSources.length; i < len; i++) {
            result = merge(result, targetAndSources[i], overwrite);
        }
        return result;
    }
    function extend(target, source) {
        if (