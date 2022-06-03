#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/content-disposition/index.js
var require_content_disposition = __commonJS({
  "node_modules/content-disposition/index.js"(exports2, module2) {
    "use strict";
    module2.exports = contentDisposition;
    module2.exports.parse = parse;
    var basename = require("path").basename;
    var Buffer2 = require_safe_buffer().Buffer;
    var ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g;
    var HEX_ESCAPE_REGEXP = /%[0-9A-Fa-f]{2}/;
    var HEX_ESCAPE_REPLACE_REGEXP = /%([0-9A-Fa-f]{2})/g;
    var NON_LATIN1_REGEXP = /[^\x20-\x7e\xa0-\xff]/g;
    var QESC_REGEXP = /\\([\u0000-\u007f])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var PARAM_REGEXP = /;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g;
    var TEXT_REGEXP = /^[\x20-\x7e\x80-\xff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/;
    var EXT_VALUE_REGEXP = /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/;
    var DISPOSITION_TYPE_REGEXP = /^([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*(?:$|;)/;
    function contentDisposition(filename, options) {
      var opts = options || {};
      var type = opts.type || "attachment";
      var params = createparams(filename, opts.fallback);
      return format(new ContentDisposition(type, params));
    }
    function createparams(filename, fallback) {
      if (filename === void 0) {
        return;
      }
      var params = {};
      if (typeof filename !== "string") {
        throw new TypeError("filename must be a string");
      }
      if (fallback === void 0) {
        fallback = true;
      }
      if (typeof fallback !== "string" && typeof fallback !== "boolean") {
        throw new TypeError("fallback must be a string or boolean");
      }
      if (typeof fallback === "string" && NON_LATIN1_REGEXP.test(fallback)) {
        throw new TypeError("fallback must be ISO-8859-1 string");
      }
      var name = basename(filename);
      var isQuotedString = TEXT_REGEXP.test(name);
      var fallbackName = typeof fallback !== "string" ? fallback && getlatin1(name) : basename(fallback);
      var hasFallback = typeof fallbackName === "string" && fallbackName !== name;
      if (hasFallback || !isQuotedString || HEX_ESCAPE_REGEXP.test(name)) {
        params["filename*"] = name;
      }
      if (isQuotedString || hasFallback) {
        params.filename = hasFallback ? fallbackName : name;
      }
      return params;
    }
    function format(obj) {
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || typeof type !== "string" || !TOKEN_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = String(type).toLowerCase();
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          var val = param.substr(-1) === "*" ? ustring(parameters[param]) : qstring(parameters[param]);
          string += "; " + param + "=" + val;
        }
      }
      return string;
    }
    function decodefield(str) {
      var match = EXT_VALUE_REGEXP.exec(str);
      if (!match) {
        throw new TypeError("invalid extended field value");
      }
      var charset = match[1].toLowerCase();
      var encoded = match[2];
      var value;
      var binary = encoded.replace(HEX_ESCAPE_REPLACE_REGEXP, pdecode);
      switch (charset) {
        case "iso-8859-1":
          value = getlatin1(binary);
          break;
        case "utf-8":
          value = Buffer2.from(binary, "binary").toString("utf8");
          break;
        default:
          throw new TypeError("unsupported charset in extended field");
      }
      return value;
    }
    function getlatin1(val) {
      return String(val).replace(NON_LATIN1_REGEXP, "?");
    }
    function parse(string) {
      if (!string || typeof string !== "string") {
        throw new TypeError("argument string is required");
      }
      var match = DISPOSITION_TYPE_REGEXP.exec(string);
      if (!match) {
        throw new TypeError("invalid type format");
      }
      var index = match[0].length;
      var type = match[1].toLowerCase();
      var key;
      var names = [];
      var params = {};
      var value;
      index = PARAM_REGEXP.lastIndex = match[0].substr(-1) === ";" ? index - 1 : index;
      while (match = PARAM_REGEXP.exec(string)) {
        if (match.index !== index) {
          throw new TypeError("invalid parameter format");
        }
        index += match[0].length;
        key = match[1].toLowerCase();
        value = match[2];
        if (names.indexOf(key) !== -1) {
          throw new TypeError("invalid duplicate parameter");
        }
        names.push(key);
        if (key.indexOf("*") + 1 === key.length) {
          key = key.slice(0, -1);
          value = decodefield(value);
          params[key] = value;
          continue;
        }
        if (typeof params[key] === "string") {
          continue;
        }
        if (value[0] === '"') {
          value = value.substr(1, value.length - 2).replace(QESC_REGEXP, "$1");
        }
        params[key] = value;
      }
      if (index !== -1 && index !== string.length) {
        throw new TypeError("invalid parameter format");
      }
      return new ContentDisposition(type, params);
    }
    function pdecode(str, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    }
    function pencode(char) {
      return "%" + String(char).charCodeAt(0).toString(16).toUpperCase();
    }
    function qstring(val) {
      var str = String(val);
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ustring(val) {
      var str = String(val);
      var encoded = encodeURIComponent(str).replace(ENCODE_URL_ATTR_CHAR_REGEXP, pencode);
      return "UTF-8''" + encoded;
    }
    function ContentDisposition(type, parameters) {
      this.type = type;
      this.parameters = parameters;
    }
  }
});

// node_modules/archive-type/node_modules/file-type/index.js
var require_file_type = __commonJS({
  "node_modules/archive-type/node_modules/file-type/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (input) => {
      const buf = new Uint8Array(input);
      if (!(buf && buf.length > 1)) {
        return null;
      }
      const check = (header, opts) => {
        opts = Object.assign({
          offset: 0
        }, opts);
        for (let i = 0; i < header.length; i++) {
          if (header[i] !== buf[i + opts.offset]) {
            return false;
          }
        }
        return true;
      };
      if (check([255, 216, 255])) {
        return {
          ext: "jpg",
          mime: "image/jpeg"
        };
      }
      if (check([137, 80, 78, 71, 13, 10, 26, 10])) {
        return {
          ext: "png",
          mime: "image/png"
        };
      }
      if (check([71, 73, 70])) {
        return {
          ext: "gif",
          mime: "image/gif"
        };
      }
      if (check([87, 69, 66, 80], { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (check([70, 76, 73, 70])) {
        return {
          ext: "flif",
          mime: "image/flif"
        };
      }
      if ((check([73, 73, 42, 0]) || check([77, 77, 0, 42])) && check([67, 82], { offset: 8 })) {
        return {
          ext: "cr2",
          mime: "image/x-canon-cr2"
        };
      }
      if (check([73, 73, 42, 0]) || check([77, 77, 0, 42])) {
        return {
          ext: "tif",
          mime: "image/tiff"
        };
      }
      if (check([66, 77])) {
        return {
          ext: "bmp",
          mime: "image/bmp"
        };
      }
      if (check([73, 73, 188])) {
        return {
          ext: "jxr",
          mime: "image/vnd.ms-photo"
        };
      }
      if (check([56, 66, 80, 83])) {
        return {
          ext: "psd",
          mime: "image/vnd.adobe.photoshop"
        };
      }
      if (check([80, 75, 3, 4]) && check([109, 105, 109, 101, 116, 121, 112, 101, 97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 101, 112, 117, 98, 43, 122, 105, 112], { offset: 30 })) {
        return {
          ext: "epub",
          mime: "application/epub+zip"
        };
      }
      if (check([80, 75, 3, 4]) && check([77, 69, 84, 65, 45, 73, 78, 70, 47, 109, 111, 122, 105, 108, 108, 97, 46, 114, 115, 97], { offset: 30 })) {
        return {
          ext: "xpi",
          mime: "application/x-xpinstall"
        };
      }
      if (check([80, 75]) && (buf[2] === 3 || buf[2] === 5 || buf[2] === 7) && (buf[3] === 4 || buf[3] === 6 || buf[3] === 8)) {
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (check([117, 115, 116, 97, 114], { offset: 257 })) {
        return {
          ext: "tar",
          mime: "application/x-tar"
        };
      }
      if (check([82, 97, 114, 33, 26, 7]) && (buf[6] === 0 || buf[6] === 1)) {
        return {
          ext: "rar",
          mime: "application/x-rar-compressed"
        };
      }
      if (check([31, 139, 8])) {
        return {
          ext: "gz",
          mime: "application/gzip"
        };
      }
      if (check([66, 90, 104])) {
        return {
          ext: "bz2",
          mime: "application/x-bzip2"
        };
      }
      if (check([55, 122, 188, 175, 39, 28])) {
        return {
          ext: "7z",
          mime: "application/x-7z-compressed"
        };
      }
      if (check([120, 1])) {
        return {
          ext: "dmg",
          mime: "application/x-apple-diskimage"
        };
      }
      if (check([0, 0, 0]) && (buf[3] === 24 || buf[3] === 32) && check([102, 116, 121, 112], { offset: 4 }) || check([51, 103, 112, 53]) || check([0, 0, 0, 28, 102, 116, 121, 112, 109, 112, 52, 50]) && check([109, 112, 52, 49, 109, 112, 52, 50, 105, 115, 111, 109], { offset: 16 }) || check([0, 0, 0, 28, 102, 116, 121, 112, 105, 115, 111, 109]) || check([0, 0, 0, 28, 102, 116, 121, 112, 109, 112, 52, 50, 0, 0, 0, 0])) {
        return {
          ext: "mp4",
          mime: "video/mp4"
        };
      }
      if (check([0, 0, 0, 28, 102, 116, 121, 112, 77, 52, 86])) {
        return {
          ext: "m4v",
          mime: "video/x-m4v"
        };
      }
      if (check([77, 84, 104, 100])) {
        return {
          ext: "mid",
          mime: "audio/midi"
        };
      }
      if (check([26, 69, 223, 163])) {
        const sliced = buf.subarray(4, 4 + 4096);
        const idPos = sliced.findIndex((el, i, arr) => arr[i] === 66 && arr[i + 1] === 130);
        if (idPos >= 0) {
          const docTypePos = idPos + 3;
          const findDocType = (type) => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));
          if (findDocType("matroska")) {
            return {
              ext: "mkv",
              mime: "video/x-matroska"
            };
          }
          if (findDocType("webm")) {
            return {
              ext: "webm",
              mime: "video/webm"
            };
          }
        }
      }
      if (check([0, 0, 0, 20, 102, 116, 121, 112, 113, 116, 32, 32]) || check([102, 114, 101, 101], { offset: 4 }) || check([102, 116, 121, 112, 113, 116, 32, 32], { offset: 4 }) || check([109, 100, 97, 116], { offset: 4 }) || check([119, 105, 100, 101], { offset: 4 })) {
        return {
          ext: "mov",
          mime: "video/quicktime"
        };
      }
      if (check([82, 73, 70, 70]) && check([65, 86, 73], { offset: 8 })) {
        return {
          ext: "avi",
          mime: "video/x-msvideo"
        };
      }
      if (check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
        return {
          ext: "wmv",
          mime: "video/x-ms-wmv"
        };
      }
      if (check([0, 0, 1, 186])) {
        return {
          ext: "mpg",
          mime: "video/mpeg"
        };
      }
      if (check([73, 68, 51]) || check([255, 251])) {
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      if (check([102, 116, 121, 112, 77, 52, 65], { offset: 4 }) || check([77, 52, 65, 32])) {
        return {
          ext: "m4a",
          mime: "audio/m4a"
        };
      }
      if (check([79, 112, 117, 115, 72, 101, 97, 100], { offset: 28 })) {
        return {
          ext: "opus",
          mime: "audio/opus"
        };
      }
      if (check([79, 103, 103, 83])) {
        return {
          ext: "ogg",
          mime: "audio/ogg"
        };
      }
      if (check([102, 76, 97, 67])) {
        return {
          ext: "flac",
          mime: "audio/x-flac"
        };
      }
      if (check([82, 73, 70, 70]) && check([87, 65, 86, 69], { offset: 8 })) {
        return {
          ext: "wav",
          mime: "audio/x-wav"
        };
      }
      if (check([35, 33, 65, 77, 82, 10])) {
        return {
          ext: "amr",
          mime: "audio/amr"
        };
      }
      if (check([37, 80, 68, 70])) {
        return {
          ext: "pdf",
          mime: "application/pdf"
        };
      }
      if (check([77, 90])) {
        return {
          ext: "exe",
          mime: "application/x-msdownload"
        };
      }
      if ((buf[0] === 67 || buf[0] === 70) && check([87, 83], { offset: 1 })) {
        return {
          ext: "swf",
          mime: "application/x-shockwave-flash"
        };
      }
      if (check([123, 92, 114, 116, 102])) {
        return {
          ext: "rtf",
          mime: "application/rtf"
        };
      }
      if (check([0, 97, 115, 109])) {
        return {
          ext: "wasm",
          mime: "application/wasm"
        };
      }
      if (check([119, 79, 70, 70]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff",
          mime: "application/font-woff"
        };
      }
      if (check([119, 79, 70, 50]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff2",
          mime: "application/font-woff"
        };
      }
      if (check([76, 80], { offset: 34 }) && (check([0, 0, 1], { offset: 8 }) || check([1, 0, 2], { offset: 8 }) || check([2, 0, 2], { offset: 8 }))) {
        return {
          ext: "eot",
          mime: "application/octet-stream"
        };
      }
      if (check([0, 1, 0, 0, 0])) {
        return {
          ext: "ttf",
          mime: "application/font-sfnt"
        };
      }
      if (check([79, 84, 84, 79, 0])) {
        return {
          ext: "otf",
          mime: "application/font-sfnt"
        };
      }
      if (check([0, 0, 1, 0])) {
        return {
          ext: "ico",
          mime: "image/x-icon"
        };
      }
      if (check([70, 76, 86, 1])) {
        return {
          ext: "flv",
          mime: "video/x-flv"
        };
      }
      if (check([37, 33])) {
        return {
          ext: "ps",
          mime: "application/postscript"
        };
      }
      if (check([253, 55, 122, 88, 90, 0])) {
        return {
          ext: "xz",
          mime: "application/x-xz"
        };
      }
      if (check([83, 81, 76, 105])) {
        return {
          ext: "sqlite",
          mime: "application/x-sqlite3"
        };
      }
      if (check([78, 69, 83, 26])) {
        return {
          ext: "nes",
          mime: "application/x-nintendo-nes-rom"
        };
      }
      if (check([67, 114, 50, 52])) {
        return {
          ext: "crx",
          mime: "application/x-google-chrome-extension"
        };
      }
      if (check([77, 83, 67, 70]) || check([73, 83, 99, 40])) {
        return {
          ext: "cab",
          mime: "application/vnd.ms-cab-compressed"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62, 10, 100, 101, 98, 105, 97, 110, 45, 98, 105, 110, 97, 114, 121])) {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62])) {
        return {
          ext: "ar",
          mime: "application/x-unix-archive"
        };
      }
      if (check([237, 171, 238, 219])) {
        return {
          ext: "rpm",
          mime: "application/x-rpm"
        };
      }
      if (check([31, 160]) || check([31, 157])) {
        return {
          ext: "Z",
          mime: "application/x-compress"
        };
      }
      if (check([76, 90, 73, 80])) {
        return {
          ext: "lz",
          mime: "application/x-lzip"
        };
      }
      if (check([208, 207, 17, 224, 161, 177, 26, 225])) {
        return {
          ext: "msi",
          mime: "application/x-msi"
        };
      }
      if (check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
        return {
          ext: "mxf",
          mime: "application/mxf"
        };
      }
      if (check([66, 76, 69, 78, 68, 69, 82])) {
        return {
          ext: "blend",
          mime: "application/x-blender"
        };
      }
      return null;
    };
  }
});

// node_modules/archive-type/index.js
var require_archive_type = __commonJS({
  "node_modules/archive-type/index.js"(exports2, module2) {
    "use strict";
    var fileType2 = require_file_type();
    var exts = /* @__PURE__ */ new Set([
      "7z",
      "bz2",
      "gz",
      "rar",
      "tar",
      "zip",
      "xz",
      "gz"
    ]);
    module2.exports = (input) => {
      const ret = fileType2(input);
      return exts.has(ret && ret.ext) ? ret : null;
    };
  }
});

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/graceful-fs/polyfills.js"(exports2, module2) {
    var constants = require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    if (typeof process.chdir === "function") {
      chdir = process.chdir;
      process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
      };
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(process.chdir, chdir);
    }
    var chdir;
    module2.exports = patch;
    function patch(fs) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs);
      }
      if (!fs.lutimes) {
        patchLutimes(fs);
      }
      fs.chown = chownFix(fs.chown);
      fs.fchown = chownFix(fs.fchown);
      fs.lchown = chownFix(fs.lchown);
      fs.chmod = chmodFix(fs.chmod);
      fs.fchmod = chmodFix(fs.fchmod);
      fs.lchmod = chmodFix(fs.lchmod);
      fs.chownSync = chownFixSync(fs.chownSync);
      fs.fchownSync = chownFixSync(fs.fchownSync);
      fs.lchownSync = chownFixSync(fs.lchownSync);
      fs.chmodSync = chmodFixSync(fs.chmodSync);
      fs.fchmodSync = chmodFixSync(fs.fchmodSync);
      fs.lchmodSync = chmodFixSync(fs.lchmodSync);
      fs.stat = statFix(fs.stat);
      fs.fstat = statFix(fs.fstat);
      fs.lstat = statFix(fs.lstat);
      fs.statSync = statFixSync(fs.statSync);
      fs.fstatSync = statFixSync(fs.fstatSync);
      fs.lstatSync = statFixSync(fs.lstatSync);
      if (fs.chmod && !fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs.lchmodSync = function() {
        };
      }
      if (fs.chown && !fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
          function rename(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb)
                cb(er);
            });
          }
          if (Object.setPrototypeOf)
            Object.setPrototypeOf(rename, fs$rename);
          return rename;
        }(fs.rename);
      }
      fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(read, fs$read);
        return read;
      }(fs.read);
      fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      }(fs.readSync);
      function patchLchmod(fs2) {
        fs2.lchmod = function(path, mode, callback) {
          fs2.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
            if (err) {
              if (callback)
                callback(err);
              return;
            }
            fs2.fchmod(fd, mode, function(err2) {
              fs2.close(fd, function(err22) {
                if (callback)
                  callback(err2 || err22);
              });
            });
          });
        };
        fs2.lchmodSync = function(path, mode) {
          var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs2.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs2) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
          fs2.lutimes = function(path, at, mt, cb) {
            fs2.open(path, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb)
                  cb(er);
                return;
              }
              fs2.futimes(fd, at, mt, function(er2) {
                fs2.close(fd, function(er22) {
                  if (cb)
                    cb(er2 || er22);
                });
              });
            });
          };
          fs2.lutimesSync = function(path, at, mt) {
            var fd = fs2.openSync(path, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs2.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs2.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs2.closeSync(fd);
              }
            }
            return ret;
          };
        } else if (fs2.futimes) {
          fs2.lutimes = function(_a, _b, _c, cb) {
            if (cb)
              process.nextTick(cb);
          };
          fs2.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig)
          return orig;
        return function(target, mode, cb) {
          return orig.call(fs, target, mode, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, mode) {
          try {
            return orig.call(fs, target, mode);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs, target, uid, gid, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig)
          return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0)
                stats.uid += 4294967296;
              if (stats.gid < 0)
                stats.gid += 4294967296;
            }
            if (cb)
              cb.apply(this, arguments);
          }
          return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "node_modules/graceful-fs/legacy-streams.js"(exports2, module2) {
    var Stream = require("stream").Stream;
    module2.exports = legacy;
    function legacy(fs) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path, options) {
        if (!(this instanceof ReadStream))
          return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding)
          this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if (typeof this.start !== "number") {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if (typeof this.end !== "number") {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self._read();
          });
          return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self.emit("error", err);
            self.readable = false;
            return;
          }
          self.fd = fd;
          self.emit("open", fd);
          self._read();
        });
      }
      function WriteStream(path, options) {
        if (!(this instanceof WriteStream))
          return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if (typeof this.start !== "number") {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "node_modules/graceful-fs/clone.js"(exports2, module2) {
    "use strict";
    module2.exports = clone;
    var getPrototypeOf = Object.getPrototypeOf || function(obj) {
      return obj.__proto__;
    };
    function clone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: getPrototypeOf(obj) };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "node_modules/graceful-fs/graceful-fs.js"(exports2, module2) {
    var fs = require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone = require_clone();
    var util = require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = Symbol.for("graceful-fs.queue");
      previousSymbol = Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    function publishQueue(context, queue2) {
      Object.defineProperty(context, gracefulQueue, {
        get: function() {
          return queue2;
        }
      });
    }
    var debug = noop;
    if (util.debuglog)
      debug = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!fs[gracefulQueue]) {
      queue = global[gracefulQueue] || [];
      publishQueue(fs, queue);
      fs.close = function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs, fd, function(err) {
            if (!err) {
              resetQueue();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      }(fs.close);
      fs.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs, arguments);
          resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      }(fs.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug(fs[gracefulQueue]);
          require("assert").equal(fs[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    if (!global[gracefulQueue]) {
      publishQueue(global, fs[gracefulQueue]);
    }
    module2.exports = patch(clone(fs));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
      module2.exports = patch(fs);
      fs.__patched = true;
    }
    function patch(fs2) {
      polyfills(fs2);
      fs2.gracefulify = patch;
      fs2.createReadStream = createReadStream;
      fs2.createWriteStream = createWriteStream;
      var fs$readFile = fs2.readFile;
      fs2.readFile = readFile;
      function readFile(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path2, options2, cb2, startTime) {
          return fs$readFile(path2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$writeFile = fs2.writeFile;
      fs2.writeFile = writeFile;
      function writeFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path2, data2, options2, cb2, startTime) {
          return fs$writeFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$appendFile = fs2.appendFile;
      if (fs$appendFile)
        fs2.appendFile = appendFile;
      function appendFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path2, data2, options2, cb2, startTime) {
          return fs$appendFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$copyFile = fs2.copyFile;
      if (fs$copyFile)
        fs2.copyFile = copyFile;
      function copyFile(src, dest, flags, cb) {
        if (typeof flags === "function") {
          cb = flags;
          flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src2, dest2, flags2, cb2, startTime) {
          return fs$copyFile(src2, dest2, flags2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$readdir = fs2.readdir;
      fs2.readdir = readdir;
      var noReaddirOptionVersions = /^v[0-5]\./;
      function readdir(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, fs$readdirCallback(path2, options2, cb2, startTime));
        } : function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, options2, fs$readdirCallback(path2, options2, cb2, startTime));
        };
        return go$readdir(path, options, cb);
        function fs$readdirCallback(path2, options2, cb2, startTime) {
          return function(err, files) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([
                go$readdir,
                [path2, options2, cb2],
                err,
                startTime || Date.now(),
                Date.now()
              ]);
            else {
              if (files && files.sort)
                files.sort();
              if (typeof cb2 === "function")
                cb2.call(this, err, files);
            }
          };
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs2);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs2.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs2.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs2, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs2, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs2, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs2, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream(path, options) {
        return new fs2.ReadStream(path, options);
      }
      function createWriteStream(path, options) {
        return new fs2.WriteStream(path, options);
      }
      var fs$open = fs2.open;
      fs2.open = open;
      function open(path, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path2, flags2, mode2, cb2, startTime) {
          return fs$open(path2, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      return fs2;
    }
    function enqueue(elem) {
      debug("ENQUEUE", elem[0].name, elem[1]);
      fs[gracefulQueue].push(elem);
      retry();
    }
    var retryTimer;
    function resetQueue() {
      var now = Date.now();
      for (var i = 0; i < fs[gracefulQueue].length; ++i) {
        if (fs[gracefulQueue][i].length > 2) {
          fs[gracefulQueue][i][3] = now;
          fs[gracefulQueue][i][4] = now;
        }
      }
      retry();
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = void 0;
      if (fs[gracefulQueue].length === 0)
        return;
      var elem = fs[gracefulQueue].shift();
      var fn = elem[0];
      var args = elem[1];
      var err = elem[2];
      var startTime = elem[3];
      var lastTime = elem[4];
      if (startTime === void 0) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args);
      } else if (Date.now() - startTime >= 6e4) {
        debug("TIMEOUT", fn.name, args);
        var cb = args.pop();
        if (typeof cb === "function")
          cb.call(null, err);
      } else {
        var sinceAttempt = Date.now() - lastTime;
        var sinceStart = Math.max(lastTime - startTime, 1);
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        if (sinceAttempt >= desiredDelay) {
          debug("RETRY", fn.name, args);
          fn.apply(null, args.concat([startTime]));
        } else {
          fs[gracefulQueue].push(elem);
        }
      }
      if (retryTimer === void 0) {
        retryTimer = setTimeout(retry, 0);
      }
    }
  }
});

// node_modules/file-type/index.js
var require_file_type2 = __commonJS({
  "node_modules/file-type/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (input) => {
      const buf = new Uint8Array(input);
      if (!(buf && buf.length > 1)) {
        return null;
      }
      const check = (header, opts) => {
        opts = Object.assign({
          offset: 0
        }, opts);
        for (let i = 0; i < header.length; i++) {
          if (header[i] !== buf[i + opts.offset]) {
            return false;
          }
        }
        return true;
      };
      if (check([255, 216, 255])) {
        return {
          ext: "jpg",
          mime: "image/jpeg"
        };
      }
      if (check([137, 80, 78, 71, 13, 10, 26, 10])) {
        return {
          ext: "png",
          mime: "image/png"
        };
      }
      if (check([71, 73, 70])) {
        return {
          ext: "gif",
          mime: "image/gif"
        };
      }
      if (check([87, 69, 66, 80], { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (check([70, 76, 73, 70])) {
        return {
          ext: "flif",
          mime: "image/flif"
        };
      }
      if ((check([73, 73, 42, 0]) || check([77, 77, 0, 42])) && check([67, 82], { offset: 8 })) {
        return {
          ext: "cr2",
          mime: "image/x-canon-cr2"
        };
      }
      if (check([73, 73, 42, 0]) || check([77, 77, 0, 42])) {
        return {
          ext: "tif",
          mime: "image/tiff"
        };
      }
      if (check([66, 77])) {
        return {
          ext: "bmp",
          mime: "image/bmp"
        };
      }
      if (check([73, 73, 188])) {
        return {
          ext: "jxr",
          mime: "image/vnd.ms-photo"
        };
      }
      if (check([56, 66, 80, 83])) {
        return {
          ext: "psd",
          mime: "image/vnd.adobe.photoshop"
        };
      }
      if (check([80, 75, 3, 4]) && check([109, 105, 109, 101, 116, 121, 112, 101, 97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 101, 112, 117, 98, 43, 122, 105, 112], { offset: 30 })) {
        return {
          ext: "epub",
          mime: "application/epub+zip"
        };
      }
      if (check([80, 75, 3, 4]) && check([77, 69, 84, 65, 45, 73, 78, 70, 47, 109, 111, 122, 105, 108, 108, 97, 46, 114, 115, 97], { offset: 30 })) {
        return {
          ext: "xpi",
          mime: "application/x-xpinstall"
        };
      }
      if (check([80, 75]) && (buf[2] === 3 || buf[2] === 5 || buf[2] === 7) && (buf[3] === 4 || buf[3] === 6 || buf[3] === 8)) {
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (check([117, 115, 116, 97, 114], { offset: 257 })) {
        return {
          ext: "tar",
          mime: "application/x-tar"
        };
      }
      if (check([82, 97, 114, 33, 26, 7]) && (buf[6] === 0 || buf[6] === 1)) {
        return {
          ext: "rar",
          mime: "application/x-rar-compressed"
        };
      }
      if (check([31, 139, 8])) {
        return {
          ext: "gz",
          mime: "application/gzip"
        };
      }
      if (check([66, 90, 104])) {
        return {
          ext: "bz2",
          mime: "application/x-bzip2"
        };
      }
      if (check([55, 122, 188, 175, 39, 28])) {
        return {
          ext: "7z",
          mime: "application/x-7z-compressed"
        };
      }
      if (check([120, 1])) {
        return {
          ext: "dmg",
          mime: "application/x-apple-diskimage"
        };
      }
      if (check([0, 0, 0]) && (buf[3] === 24 || buf[3] === 32) && check([102, 116, 121, 112], { offset: 4 }) || check([51, 103, 112, 53]) || check([0, 0, 0, 28, 102, 116, 121, 112, 109, 112, 52, 50]) && check([109, 112, 52, 49, 109, 112, 52, 50, 105, 115, 111, 109], { offset: 16 }) || check([0, 0, 0, 28, 102, 116, 121, 112, 105, 115, 111, 109]) || check([0, 0, 0, 28, 102, 116, 121, 112, 109, 112, 52, 50, 0, 0, 0, 0])) {
        return {
          ext: "mp4",
          mime: "video/mp4"
        };
      }
      if (check([0, 0, 0, 28, 102, 116, 121, 112, 77, 52, 86])) {
        return {
          ext: "m4v",
          mime: "video/x-m4v"
        };
      }
      if (check([77, 84, 104, 100])) {
        return {
          ext: "mid",
          mime: "audio/midi"
        };
      }
      if (check([26, 69, 223, 163])) {
        const sliced = buf.subarray(4, 4 + 4096);
        const idPos = sliced.findIndex((el, i, arr) => arr[i] === 66 && arr[i + 1] === 130);
        if (idPos >= 0) {
          const docTypePos = idPos + 3;
          const findDocType = (type) => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));
          if (findDocType("matroska")) {
            return {
              ext: "mkv",
              mime: "video/x-matroska"
            };
          }
          if (findDocType("webm")) {
            return {
              ext: "webm",
              mime: "video/webm"
            };
          }
        }
      }
      if (check([0, 0, 0, 20, 102, 116, 121, 112, 113, 116, 32, 32]) || check([102, 114, 101, 101], { offset: 4 }) || check([102, 116, 121, 112, 113, 116, 32, 32], { offset: 4 }) || check([109, 100, 97, 116], { offset: 4 }) || check([119, 105, 100, 101], { offset: 4 })) {
        return {
          ext: "mov",
          mime: "video/quicktime"
        };
      }
      if (check([82, 73, 70, 70]) && check([65, 86, 73], { offset: 8 })) {
        return {
          ext: "avi",
          mime: "video/x-msvideo"
        };
      }
      if (check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
        return {
          ext: "wmv",
          mime: "video/x-ms-wmv"
        };
      }
      if (check([0, 0, 1, 186])) {
        return {
          ext: "mpg",
          mime: "video/mpeg"
        };
      }
      if (check([73, 68, 51]) || check([255, 251])) {
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      if (check([102, 116, 121, 112, 77, 52, 65], { offset: 4 }) || check([77, 52, 65, 32])) {
        return {
          ext: "m4a",
          mime: "audio/m4a"
        };
      }
      if (check([79, 112, 117, 115, 72, 101, 97, 100], { offset: 28 })) {
        return {
          ext: "opus",
          mime: "audio/opus"
        };
      }
      if (check([79, 103, 103, 83])) {
        return {
          ext: "ogg",
          mime: "audio/ogg"
        };
      }
      if (check([102, 76, 97, 67])) {
        return {
          ext: "flac",
          mime: "audio/x-flac"
        };
      }
      if (check([82, 73, 70, 70]) && check([87, 65, 86, 69], { offset: 8 })) {
        return {
          ext: "wav",
          mime: "audio/x-wav"
        };
      }
      if (check([35, 33, 65, 77, 82, 10])) {
        return {
          ext: "amr",
          mime: "audio/amr"
        };
      }
      if (check([37, 80, 68, 70])) {
        return {
          ext: "pdf",
          mime: "application/pdf"
        };
      }
      if (check([77, 90])) {
        return {
          ext: "exe",
          mime: "application/x-msdownload"
        };
      }
      if ((buf[0] === 67 || buf[0] === 70) && check([87, 83], { offset: 1 })) {
        return {
          ext: "swf",
          mime: "application/x-shockwave-flash"
        };
      }
      if (check([123, 92, 114, 116, 102])) {
        return {
          ext: "rtf",
          mime: "application/rtf"
        };
      }
      if (check([0, 97, 115, 109])) {
        return {
          ext: "wasm",
          mime: "application/wasm"
        };
      }
      if (check([119, 79, 70, 70]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff",
          mime: "font/woff"
        };
      }
      if (check([119, 79, 70, 50]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff2",
          mime: "font/woff2"
        };
      }
      if (check([76, 80], { offset: 34 }) && (check([0, 0, 1], { offset: 8 }) || check([1, 0, 2], { offset: 8 }) || check([2, 0, 2], { offset: 8 }))) {
        return {
          ext: "eot",
          mime: "application/octet-stream"
        };
      }
      if (check([0, 1, 0, 0, 0])) {
        return {
          ext: "ttf",
          mime: "font/ttf"
        };
      }
      if (check([79, 84, 84, 79, 0])) {
        return {
          ext: "otf",
          mime: "font/otf"
        };
      }
      if (check([0, 0, 1, 0])) {
        return {
          ext: "ico",
          mime: "image/x-icon"
        };
      }
      if (check([70, 76, 86, 1])) {
        return {
          ext: "flv",
          mime: "video/x-flv"
        };
      }
      if (check([37, 33])) {
        return {
          ext: "ps",
          mime: "application/postscript"
        };
      }
      if (check([253, 55, 122, 88, 90, 0])) {
        return {
          ext: "xz",
          mime: "application/x-xz"
        };
      }
      if (check([83, 81, 76, 105])) {
        return {
          ext: "sqlite",
          mime: "application/x-sqlite3"
        };
      }
      if (check([78, 69, 83, 26])) {
        return {
          ext: "nes",
          mime: "application/x-nintendo-nes-rom"
        };
      }
      if (check([67, 114, 50, 52])) {
        return {
          ext: "crx",
          mime: "application/x-google-chrome-extension"
        };
      }
      if (check([77, 83, 67, 70]) || check([73, 83, 99, 40])) {
        return {
          ext: "cab",
          mime: "application/vnd.ms-cab-compressed"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62, 10, 100, 101, 98, 105, 97, 110, 45, 98, 105, 110, 97, 114, 121])) {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62])) {
        return {
          ext: "ar",
          mime: "application/x-unix-archive"
        };
      }
      if (check([237, 171, 238, 219])) {
        return {
          ext: "rpm",
          mime: "application/x-rpm"
        };
      }
      if (check([31, 160]) || check([31, 157])) {
        return {
          ext: "Z",
          mime: "application/x-compress"
        };
      }
      if (check([76, 90, 73, 80])) {
        return {
          ext: "lz",
          mime: "application/x-lzip"
        };
      }
      if (check([208, 207, 17, 224, 161, 177, 26, 225])) {
        return {
          ext: "msi",
          mime: "application/x-msi"
        };
      }
      if (check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
        return {
          ext: "mxf",
          mime: "application/mxf"
        };
      }
      if (check([71], { offset: 4 }) && (check([71], { offset: 192 }) || check([71], { offset: 196 }))) {
        return {
          ext: "mts",
          mime: "video/mp2t"
        };
      }
      if (check([66, 76, 69, 78, 68, 69, 82])) {
        return {
          ext: "blend",
          mime: "application/x-blender"
        };
      }
      if (check([66, 80, 71, 251])) {
        return {
          ext: "bpg",
          mime: "image/bpg"
        };
      }
      return null;
    };
  }
});

// node_modules/is-stream/index.js
var require_is_stream = __commonJS({
  "node_modules/is-stream/index.js"(exports2, module2) {
    "use strict";
    var isStream = module2.exports = function(stream2) {
      return stream2 !== null && typeof stream2 === "object" && typeof stream2.pipe === "function";
    };
    isStream.writable = function(stream2) {
      return isStream(stream2) && stream2.writable !== false && typeof stream2._write === "function" && typeof stream2._writableState === "object";
    };
    isStream.readable = function(stream2) {
      return isStream(stream2) && stream2.readable !== false && typeof stream2._read === "function" && typeof stream2._readableState === "object";
    };
    isStream.duplex = function(stream2) {
      return isStream.writable(stream2) && isStream.readable(stream2);
    };
    isStream.transform = function(stream2) {
      return isStream.duplex(stream2) && typeof stream2._transform === "function" && typeof stream2._transformState === "object";
    };
  }
});

// node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  "node_modules/process-nextick-args/index.js"(exports2, module2) {
    "use strict";
    if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
      module2.exports = { nextTick };
    } else {
      module2.exports = process;
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== "function") {
        throw new TypeError('"callback" argument must be a function');
      }
      var len = arguments.length;
      var args, i;
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn);
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1);
          });
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2);
          });
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3);
          });
        default:
          args = new Array(len - 1);
          i = 0;
          while (i < args.length) {
            args[i++] = arguments[i];
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args);
          });
      }
    }
  }
});

// node_modules/isarray/index.js
var require_isarray = __commonJS({
  "node_modules/isarray/index.js"(exports2, module2) {
    var toString = {}.toString;
    module2.exports = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/stream.js"(exports2, module2) {
    module2.exports = require("stream");
  }
});

// node_modules/readable-stream/node_modules/safe-buffer/index.js
var require_safe_buffer2 = __commonJS({
  "node_modules/readable-stream/node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/core-util-is/lib/util.js
var require_util = __commonJS({
  "node_modules/core-util-is/lib/util.js"(exports2) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      }
      return objectToString(arg) === "[object Array]";
    }
    exports2.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports2.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports2.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports2.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports2.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports2.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports2.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports2.isUndefined = isUndefined;
    function isRegExp(re) {
      return objectToString(re) === "[object RegExp]";
    }
    exports2.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports2.isObject = isObject;
    function isDate(d) {
      return objectToString(d) === "[object Date]";
    }
    exports2.isDate = isDate;
    function isError(e) {
      return objectToString(e) === "[object Error]" || e instanceof Error;
    }
    exports2.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports2.isFunction = isFunction;
    function isPrimitive(arg) {
      return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
    }
    exports2.isPrimitive = isPrimitive;
    exports2.isBuffer = require("buffer").Buffer.isBuffer;
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports2, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/inherits/inherits.js"(exports2, module2) {
    try {
      util = require("util");
      if (typeof util.inherits !== "function")
        throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/BufferList.js"(exports2, module2) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = require_safe_buffer2().Buffer;
    var util = require("util");
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module2.exports = function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList.prototype.shift = function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList.prototype.join = function join2(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList.prototype.concat = function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        if (this.length === 1)
          return this.head.data;
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList;
    }();
    if (util && util.inspect && util.inspect.custom) {
      module2.exports.prototype[util.inspect.custom] = function() {
        var obj = util.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
          pna.nextTick(emitErrorNT, this, err);
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          pna.nextTick(emitErrorNT, _this, err2);
          if (_this._writableState) {
            _this._writableState.errorEmitted = true;
          }
        } else if (cb) {
          cb(err2);
        }
      });
      return this;
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self, err) {
      self.emit("error", err);
    }
    module2.exports = {
      destroy,
      undestroy
    };
  }
});

// node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "node_modules/util-deprecate/node.js"(exports2, module2) {
    module2.exports = require("util").deprecate;
  }
});

// node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "node_modules/readable-stream/lib/_stream_writable.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    module2.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
    var Duplex;
    Writable.WritableState = WritableState;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var internalUtil = {
      deprecate: require_node()
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer2().Buffer;
    var OurUint8Array = global.Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    util.inherits(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream2) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream2 instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex)
        this.objectMode = this.objectMode || !!options.writableObjectMode;
      var hwm = options.highWaterMark;
      var writableHwm = options.writableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0)
        this.highWaterMark = hwm;
      else if (isDuplex && (writableHwm || writableHwm === 0))
        this.highWaterMark = writableHwm;
      else
        this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream2, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function(object) {
          if (realHasInstance.call(this, object))
            return true;
          if (this !== Writable)
            return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options);
      }
      this._writableState = new WritableState(options, this);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function")
          this._write = options.write;
        if (typeof options.writev === "function")
          this._writev = options.writev;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
        if (typeof options.final === "function")
          this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      this.emit("error", new Error("Cannot pipe, not readable"));
    };
    function writeAfterEnd(stream2, cb) {
      var er = new Error("write after end");
      stream2.emit("error", er);
      pna.nextTick(cb, er);
    }
    function validChunk(stream2, state, chunk, cb) {
      var valid = true;
      var er = false;
      if (chunk === null) {
        er = new TypeError("May not write null values to stream");
      } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      if (er) {
        stream2.emit("error", er);
        pna.nextTick(cb, er);
        valid = false;
      }
      return valid;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf)
        encoding = "buffer";
      else if (!encoding)
        encoding = state.defaultEncoding;
      if (typeof cb !== "function")
        cb = nop;
      if (state.ended)
        writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      var state = this._writableState;
      state.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest)
          clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string")
        encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
        throw new TypeError("Unknown encoding: " + encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream2, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret)
        state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream2, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream2, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (writev)
        stream2._writev(chunk, state.onwrite);
      else
        stream2._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream2, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        pna.nextTick(cb, er);
        pna.nextTick(finishMaybe, stream2, state);
        stream2._writableState.errorEmitted = true;
        stream2.emit("error", er);
      } else {
        cb(er);
        stream2._writableState.errorEmitted = true;
        stream2.emit("error", er);
        finishMaybe(stream2, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream2, er) {
      var state = stream2._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      onwriteStateUpdate(state);
      if (er)
        onwriteError(stream2, state, sync, er, cb);
      else {
        var finished = needFinish(state);
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream2, state);
        }
        if (sync) {
          asyncWrite(afterWrite, stream2, state, finished, cb);
        } else {
          afterWrite(stream2, state, finished, cb);
        }
      }
    }
    function afterWrite(stream2, state, finished, cb) {
      if (!finished)
        onwriteDrain(stream2, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream2, state);
    }
    function onwriteDrain(stream2, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream2.emit("drain");
      }
    }
    function clearBuffer(stream2, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream2._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf)
            allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream2, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream2, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null)
          state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new Error("_write() is not implemented"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0)
        this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending && !state.finished)
        endWritable(this, state, cb);
    };
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream2, state) {
      stream2._final(function(err) {
        state.pendingcb--;
        if (err) {
          stream2.emit("error", err);
        }
        state.prefinished = true;
        stream2.emit("prefinish");
        finishMaybe(stream2, state);
      });
    }
    function prefinish(stream2, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream2._final === "function") {
          state.pendingcb++;
          state.finalCalled = true;
          pna.nextTick(callFinal, stream2, state);
        } else {
          state.prefinished = true;
          stream2.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream2, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream2, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream2.emit("finish");
        }
      }
      return need;
    }
    function endWritable(stream2, state, cb) {
      state.ending = true;
      finishMaybe(stream2, state);
      if (cb) {
        if (state.finished)
          pna.nextTick(cb);
        else
          stream2.once("finish", cb);
      }
      state.ended = true;
      stream2.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      if (state.corkedRequestsFree) {
        state.corkedRequestsFree.next = corkReq;
      } else {
        state.corkedRequestsFree = corkReq;
      }
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      get: function() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      this.end();
      cb(err);
    };
  }
});

// node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "node_modules/readable-stream/lib/_stream_duplex.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) {
        keys2.push(key);
      }
      return keys2;
    };
    module2.exports = Duplex;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var Readable = require_stream_readable();
    var Writable = require_stream_writable();
    util.inherits(Duplex, Readable);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method])
          Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex))
        return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options && options.readable === false)
        this.readable = false;
      if (options && options.writable === false)
        this.writable = false;
      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false)
        this.allowHalfOpen = false;
      this.once("end", onend);
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended)
        return;
      pna.nextTick(onEndNT, this);
    }
    function onEndNT(self) {
      self.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
    Duplex.prototype._destroy = function(err, cb) {
      this.push(null);
      this.end();
      pna.nextTick(cb, err);
    };
  }
});

// node_modules/string_decoder/node_modules/safe-buffer/index.js
var require_safe_buffer3 = __commonJS({
  "node_modules/string_decoder/node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "node_modules/string_decoder/lib/string_decoder.js"(exports2) {
    "use strict";
    var Buffer2 = require_safe_buffer3().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc)
        return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried)
              return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
        throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports2.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0)
        return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0)
          return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length)
        return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127)
        return 0;
      else if (byte >> 5 === 6)
        return 2;
      else if (byte >> 4 === 14)
        return 3;
      else if (byte >> 3 === 30)
        return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self, buf, i) {
      var j = buf.length - 1;
      if (j < i)
        return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2)
            nb = 0;
          else
            self.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self.lastNeed = 0;
        return "\uFFFD";
      }
      if (self.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self.lastNeed = 1;
          return "\uFFFD";
        }
        if (self.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0)
        return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed)
        return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0)
        return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "node_modules/readable-stream/lib/_stream_readable.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    module2.exports = Readable;
    var isArray = require_isarray();
    var Duplex;
    Readable.ReadableState = ReadableState;
    var EE = require("events").EventEmitter;
    var EElistenerCount = function(emitter, type) {
      return emitter.listeners(type).length;
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer2().Buffer;
    var OurUint8Array = global.Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var debugUtil = require("util");
    var debug = void 0;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function() {
      };
    }
    var BufferList = require_BufferList();
    var destroyImpl = require_destroy();
    var StringDecoder;
    util.inherits(Readable, Stream);
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function")
        return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event])
        emitter.on(event, fn);
      else if (isArray(emitter._events[event]))
        emitter._events[event].unshift(fn);
      else
        emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream2) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream2 instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex)
        this.objectMode = this.objectMode || !!options.readableObjectMode;
      var hwm = options.highWaterMark;
      var readableHwm = options.readableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0)
        this.highWaterMark = hwm;
      else if (isDuplex && (readableHwm || readableHwm === 0))
        this.highWaterMark = readableHwm;
      else
        this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder)
          StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable))
        return new Readable(options);
      this._readableState = new ReadableState(options, this);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function")
          this._read = options.read;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      this.push(null);
      cb(err);
    };
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream2, chunk, encoding, addToFront, skipChunkCheck) {
      var state = stream2._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream2, state);
      } else {
        var er;
        if (!skipChunkCheck)
          er = chunkInvalid(state, chunk);
        if (er) {
          stream2.emit("error", er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted)
              stream2.emit("error", new Error("stream.unshift() after end event"));
            else
              addChunk(stream2, state, chunk, true);
          } else if (state.ended) {
            stream2.emit("error", new Error("stream.push() after EOF"));
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0)
                addChunk(stream2, state, chunk, false);
              else
                maybeReadMore(stream2, state);
            } else {
              addChunk(stream2, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
        }
      }
      return needMoreData(state);
    }
    function addChunk(stream2, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        stream2.emit("data", chunk);
        stream2.read(0);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);
        if (state.needReadable)
          emitReadable(stream2);
      }
      maybeReadMore(stream2, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      return er;
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
    }
    Readable.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder)
        StringDecoder = require_string_decoder().StringDecoder;
      this._readableState.decoder = new StringDecoder(enc);
      this._readableState.encoding = enc;
      return this;
    };
    var MAX_HWM = 8388608;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended)
        return 0;
      if (state.objectMode)
        return 1;
      if (n !== n) {
        if (state.flowing && state.length)
          return state.buffer.head.data.length;
        else
          return state.length;
      }
      if (n > state.highWaterMark)
        state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length)
        return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0)
        state.emittedReadable = false;
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended)
          endReadable(this);
        else
          emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0)
          endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0)
          state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading)
          n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0)
        ret = fromList(n, state);
      else
        ret = null;
      if (ret === null) {
        state.needReadable = true;
        n = 0;
      } else {
        state.length -= n;
      }
      if (state.length === 0) {
        if (!state.ended)
          state.needReadable = true;
        if (nOrig !== n && state.ended)
          endReadable(this);
      }
      if (ret !== null)
        this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream2, state) {
      if (state.ended)
        return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      emitReadable(stream2);
    }
    function emitReadable(stream2) {
      var state = stream2._readableState;
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        if (state.sync)
          pna.nextTick(emitReadable_, stream2);
        else
          emitReadable_(stream2);
      }
    }
    function emitReadable_(stream2) {
      debug("emit readable");
      stream2.emit("readable");
      flow(stream2);
    }
    function maybeReadMore(stream2, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        pna.nextTick(maybeReadMore_, stream2, state);
      }
    }
    function maybeReadMore_(stream2, state) {
      var len = state.length;
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug("maybeReadMore read 0");
        stream2.read(0);
        if (len === state.length)
          break;
        else
          len = state.length;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      this.emit("error", new Error("_read() is not implemented"));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted)
        pna.nextTick(endFn);
      else
        src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
          ondrain();
      }
      var increasedAwaitDrain = false;
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        increasedAwaitDrain = false;
        var ret = dest.write(chunk);
        if (ret === false && !increasedAwaitDrain) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", src._readableState.awaitDrain);
            src._readableState.awaitDrain++;
            increasedAwaitDrain = true;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0)
          dest.emit("error", er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain)
          state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = { hasUnpiped: false };
      if (state.pipesCount === 0)
        return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes)
          return this;
        if (!dest)
          dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest)
          dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) {
          dests[i].emit("unpipe", this, unpipeInfo);
        }
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1)
        return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1)
        state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      if (ev === "data") {
        if (this._readableState.flowing !== false)
          this.resume();
      } else if (ev === "readable") {
        var state = this._readableState;
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.emittedReadable = false;
          if (!state.reading) {
            pna.nextTick(nReadingNextTick, this);
          } else if (state.length) {
            emitReadable(this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    function nReadingNextTick(self) {
      debug("readable nexttick read 0");
      self.read(0);
    }
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = true;
        resume(this, state);
      }
      return this;
    };
    function resume(stream2, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        pna.nextTick(resume_, stream2, state);
      }
    }
    function resume_(stream2, state) {
      if (!state.reading) {
        debug("resume read 0");
        stream2.read(0);
      }
      state.resumeScheduled = false;
      state.awaitDrain = 0;
      stream2.emit("resume");
      flow(stream2);
      if (state.flowing && !state.reading)
        stream2.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      return this;
    };
    function flow(stream2) {
      var state = stream2._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream2.read() !== null) {
      }
    }
    Readable.prototype.wrap = function(stream2) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream2.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length)
            _this.push(chunk);
        }
        _this.push(null);
      });
      stream2.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder)
          chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0))
          return;
        else if (!state.objectMode && (!chunk || !chunk.length))
          return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream2.pause();
        }
      });
      for (var i in stream2) {
        if (this[i] === void 0 && typeof stream2[i] === "function") {
          this[i] = function(method) {
            return function() {
              return stream2[method].apply(stream2, arguments);
            };
          }(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream2.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream2.resume();
        }
      };
      return this;
    };
    Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
      enumerable: false,
      get: function() {
        return this._readableState.highWaterMark;
      }
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0)
        return null;
      var ret;
      if (state.objectMode)
        ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder)
          ret = state.buffer.join("");
        else if (state.buffer.length === 1)
          ret = state.buffer.head.data;
        else
          ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = fromListPartial(n, state.buffer, state.decoder);
      }
      return ret;
    }
    function fromListPartial(n, list, hasStrings) {
      var ret;
      if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n);
        list.head.data = list.head.data.slice(n);
      } else if (n === list.head.data.length) {
        ret = list.shift();
      } else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
      }
      return ret;
    }
    function copyFromBufferString(n, list) {
      var p = list.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length)
          ret += str;
        else
          ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next)
              list.head = p.next;
            else
              list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function copyFromBuffer(n, list) {
      var ret = Buffer2.allocUnsafe(n);
      var p = list.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next)
              list.head = p.next;
            else
              list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function endReadable(stream2) {
      var state = stream2._readableState;
      if (state.length > 0)
        throw new Error('"endReadable()" called on non-empty stream');
      if (!state.endEmitted) {
        state.ended = true;
        pna.nextTick(endReadableNT, state, stream2);
      }
    }
    function endReadableNT(state, stream2) {
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream2.readable = false;
        stream2.emit("end");
      }
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x)
          return i;
      }
      return -1;
    }
  }
});

// node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "node_modules/readable-stream/lib/_stream_transform.js"(exports2, module2) {
    "use strict";
    module2.exports = Transform;
    var Duplex = require_stream_duplex();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(Transform, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (!cb) {
        return this.emit("error", new Error("write callback called multiple times"));
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform))
        return new Transform(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function")
          this._transform = options.transform;
        if (typeof options.flush === "function")
          this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function") {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      throw new Error("_transform() is not implemented");
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
          this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform.prototype._destroy = function(err, cb) {
      var _this2 = this;
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
        _this2.emit("close");
      });
    };
    function done(stream2, er, data) {
      if (er)
        return stream2.emit("error", er);
      if (data != null)
        stream2.push(data);
      if (stream2._writableState.length)
        throw new Error("Calling transform done when ws.length != 0");
      if (stream2._transformState.transforming)
        throw new Error("Calling transform done when still transforming");
      return stream2.push(null);
    }
  }
});

// node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "node_modules/readable-stream/lib/_stream_passthrough.js"(exports2, module2) {
    "use strict";
    module2.exports = PassThrough;
    var Transform = require_stream_transform();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough))
        return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "node_modules/readable-stream/readable.js"(exports2, module2) {
    var Stream = require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module2.exports = Stream;
      exports2 = module2.exports = Stream.Readable;
      exports2.Readable = Stream.Readable;
      exports2.Writable = Stream.Writable;
      exports2.Duplex = Stream.Duplex;
      exports2.Transform = Stream.Transform;
      exports2.PassThrough = Stream.PassThrough;
      exports2.Stream = Stream;
    } else {
      exports2 = module2.exports = require_stream_readable();
      exports2.Stream = Stream || exports2;
      exports2.Readable = exports2;
      exports2.Writable = require_stream_writable();
      exports2.Duplex = require_stream_duplex();
      exports2.Transform = require_stream_transform();
      exports2.PassThrough = require_stream_passthrough();
    }
  }
});

// node_modules/readable-stream/duplex.js
var require_duplex = __commonJS({
  "node_modules/readable-stream/duplex.js"(exports2, module2) {
    module2.exports = require_readable().Duplex;
  }
});

// node_modules/bl/bl.js
var require_bl = __commonJS({
  "node_modules/bl/bl.js"(exports2, module2) {
    var DuplexStream = require_duplex();
    var util = require("util");
    var Buffer2 = require_safe_buffer().Buffer;
    function BufferList(callback) {
      if (!(this instanceof BufferList))
        return new BufferList(callback);
      this._bufs = [];
      this.length = 0;
      if (typeof callback == "function") {
        this._callback = callback;
        var piper = function piper2(err) {
          if (this._callback) {
            this._callback(err);
            this._callback = null;
          }
        }.bind(this);
        this.on("pipe", function onPipe(src) {
          src.on("error", piper);
        });
        this.on("unpipe", function onUnpipe(src) {
          src.removeListener("error", piper);
        });
      } else {
        this.append(callback);
      }
      DuplexStream.call(this);
    }
    util.inherits(BufferList, DuplexStream);
    BufferList.prototype._offset = function _offset(offset) {
      var tot = 0, i = 0, _t;
      if (offset === 0)
        return [0, 0];
      for (; i < this._bufs.length; i++) {
        _t = tot + this._bufs[i].length;
        if (offset < _t || i == this._bufs.length - 1)
          return [i, offset - tot];
        tot = _t;
      }
    };
    BufferList.prototype.append = function append(buf) {
      var i = 0;
      if (Buffer2.isBuffer(buf)) {
        this._appendBuffer(buf);
      } else if (Array.isArray(buf)) {
        for (; i < buf.length; i++)
          this.append(buf[i]);
      } else if (buf instanceof BufferList) {
        for (; i < buf._bufs.length; i++)
          this.append(buf._bufs[i]);
      } else if (buf != null) {
        if (typeof buf == "number")
          buf = buf.toString();
        this._appendBuffer(Buffer2.from(buf));
      }
      return this;
    };
    BufferList.prototype._appendBuffer = function appendBuffer(buf) {
      this._bufs.push(buf);
      this.length += buf.length;
    };
    BufferList.prototype._write = function _write(buf, encoding, callback) {
      this._appendBuffer(buf);
      if (typeof callback == "function")
        callback();
    };
    BufferList.prototype._read = function _read(size) {
      if (!this.length)
        return this.push(null);
      size = Math.min(size, this.length);
      this.push(this.slice(0, size));
      this.consume(size);
    };
    BufferList.prototype.end = function end(chunk) {
      DuplexStream.prototype.end.call(this, chunk);
      if (this._callback) {
        this._callback(null, this.slice());
        this._callback = null;
      }
    };
    BufferList.prototype.get = function get(index) {
      return this.slice(index, index + 1)[0];
    };
    BufferList.prototype.slice = function slice(start, end) {
      if (typeof start == "number" && start < 0)
        start += this.length;
      if (typeof end == "number" && end < 0)
        end += this.length;
      return this.copy(null, 0, start, end);
    };
    BufferList.prototype.copy = function copy(dst, dstStart, srcStart, srcEnd) {
      if (typeof srcStart != "number" || srcStart < 0)
        srcStart = 0;
      if (typeof srcEnd != "number" || srcEnd > this.length)
        srcEnd = this.length;
      if (srcStart >= this.length)
        return dst || Buffer2.alloc(0);
      if (srcEnd <= 0)
        return dst || Buffer2.alloc(0);
      var copy2 = !!dst, off = this._offset(srcStart), len = srcEnd - srcStart, bytes = len, bufoff = copy2 && dstStart || 0, start = off[1], l, i;
      if (srcStart === 0 && srcEnd == this.length) {
        if (!copy2) {
          return this._bufs.length === 1 ? this._bufs[0] : Buffer2.concat(this._bufs, this.length);
        }
        for (i = 0; i < this._bufs.length; i++) {
          this._bufs[i].copy(dst, bufoff);
          bufoff += this._bufs[i].length;
        }
        return dst;
      }
      if (bytes <= this._bufs[off[0]].length - start) {
        return copy2 ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes) : this._bufs[off[0]].slice(start, start + bytes);
      }
      if (!copy2)
        dst = Buffer2.allocUnsafe(len);
      for (i = off[0]; i < this._bufs.length; i++) {
        l = this._bufs[i].length - start;
        if (bytes > l) {
          this._bufs[i].copy(dst, bufoff, start);
          bufoff += l;
        } else {
          this._bufs[i].copy(dst, bufoff, start, start + bytes);
          bufoff += l;
          break;
        }
        bytes -= l;
        if (start)
          start = 0;
      }
      if (dst.length > bufoff)
        return dst.slice(0, bufoff);
      return dst;
    };
    BufferList.prototype.shallowSlice = function shallowSlice(start, end) {
      start = start || 0;
      end = end || this.length;
      if (start < 0)
        start += this.length;
      if (end < 0)
        end += this.length;
      var startOffset = this._offset(start), endOffset = this._offset(end), buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1);
      if (endOffset[1] == 0)
        buffers.pop();
      else
        buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOffset[1]);
      if (startOffset[1] != 0)
        buffers[0] = buffers[0].slice(startOffset[1]);
      return new BufferList(buffers);
    };
    BufferList.prototype.toString = function toString(encoding, start, end) {
      return this.slice(start, end).toString(encoding);
    };
    BufferList.prototype.consume = function consume(bytes) {
      bytes = Math.trunc(bytes);
      if (Number.isNaN(bytes) || bytes <= 0)
        return this;
      while (this._bufs.length) {
        if (bytes >= this._bufs[0].length) {
          bytes -= this._bufs[0].length;
          this.length -= this._bufs[0].length;
          this._bufs.shift();
        } else {
          this._bufs[0] = this._bufs[0].slice(bytes);
          this.length -= bytes;
          break;
        }
      }
      return this;
    };
    BufferList.prototype.duplicate = function duplicate() {
      var i = 0, copy = new BufferList();
      for (; i < this._bufs.length; i++)
        copy.append(this._bufs[i]);
      return copy;
    };
    BufferList.prototype.destroy = function destroy() {
      this._bufs.length = 0;
      this.length = 0;
      this.push(null);
    };
    (function() {
      var methods = {
        "readDoubleBE": 8,
        "readDoubleLE": 8,
        "readFloatBE": 4,
        "readFloatLE": 4,
        "readInt32BE": 4,
        "readInt32LE": 4,
        "readUInt32BE": 4,
        "readUInt32LE": 4,
        "readInt16BE": 2,
        "readInt16LE": 2,
        "readUInt16BE": 2,
        "readUInt16LE": 2,
        "readInt8": 1,
        "readUInt8": 1
      };
      for (var m in methods) {
        (function(m2) {
          BufferList.prototype[m2] = function(offset) {
            return this.slice(offset, offset + methods[m2])[m2](0);
          };
        })(m);
      }
    })();
    module2.exports = BufferList;
  }
});

// node_modules/xtend/immutable.js
var require_immutable = __commonJS({
  "node_modules/xtend/immutable.js"(exports2, module2) {
    module2.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend() {
      var target = {};
      for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
  }
});

// node_modules/to-buffer/index.js
var require_to_buffer = __commonJS({
  "node_modules/to-buffer/index.js"(exports2, module2) {
    module2.exports = toBuffer;
    var makeBuffer = Buffer.from && Buffer.from !== Uint8Array.from ? Buffer.from : bufferFrom;
    function bufferFrom(buf, enc) {
      return new Buffer(buf, enc);
    }
    function toBuffer(buf, enc) {
      if (Buffer.isBuffer(buf))
        return buf;
      if (typeof buf === "string")
        return makeBuffer(buf, enc);
      if (Array.isArray(buf))
        return makeBuffer(buf);
      throw new Error("Input should be a buffer or a string");
    }
  }
});

// node_modules/buffer-fill/index.js
var require_buffer_fill = __commonJS({
  "node_modules/buffer-fill/index.js"(exports2, module2) {
    var hasFullSupport = function() {
      try {
        if (!Buffer.isEncoding("latin1")) {
          return false;
        }
        var buf = Buffer.alloc ? Buffer.alloc(4) : new Buffer(4);
        buf.fill("ab", "ucs2");
        return buf.toString("hex") === "61006200";
      } catch (_) {
        return false;
      }
    }();
    function isSingleByte(val) {
      return val.length === 1 && val.charCodeAt(0) < 256;
    }
    function fillWithNumber(buffer, val, start, end) {
      if (start < 0 || end > buffer.length) {
        throw new RangeError("Out of range index");
      }
      start = start >>> 0;
      end = end === void 0 ? buffer.length : end >>> 0;
      if (end > start) {
        buffer.fill(val, start, end);
      }
      return buffer;
    }
    function fillWithBuffer(buffer, val, start, end) {
      if (start < 0 || end > buffer.length) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return buffer;
      }
      start = start >>> 0;
      end = end === void 0 ? buffer.length : end >>> 0;
      var pos = start;
      var len = val.length;
      while (pos <= end - len) {
        val.copy(buffer, pos);
        pos += len;
      }
      if (pos !== end) {
        val.copy(buffer, pos, 0, end - pos);
      }
      return buffer;
    }
    function fill(buffer, val, start, end, encoding) {
      if (hasFullSupport) {
        return buffer.fill(val, start, end, encoding);
      }
      if (typeof val === "number") {
        return fillWithNumber(buffer, val, start, end);
      }
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = buffer.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = buffer.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (encoding === "latin1") {
          encoding = "binary";
        }
        if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val === "") {
          return fillWithNumber(buffer, 0, start, end);
        }
        if (isSingleByte(val)) {
          return fillWithNumber(buffer, val.charCodeAt(0), start, end);
        }
        val = new Buffer(val, encoding);
      }
      if (Buffer.isBuffer(val)) {
        return fillWithBuffer(buffer, val, start, end);
      }
      return fillWithNumber(buffer, 0, start, end);
    }
    module2.exports = fill;
  }
});

// node_modules/buffer-alloc-unsafe/index.js
var require_buffer_alloc_unsafe = __commonJS({
  "node_modules/buffer-alloc-unsafe/index.js"(exports2, module2) {
    function allocUnsafe(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
      }
      if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
      }
      if (Buffer.allocUnsafe) {
        return Buffer.allocUnsafe(size);
      } else {
        return new Buffer(size);
      }
    }
    module2.exports = allocUnsafe;
  }
});

// node_modules/buffer-alloc/index.js
var require_buffer_alloc = __commonJS({
  "node_modules/buffer-alloc/index.js"(exports2, module2) {
    var bufferFill = require_buffer_fill();
    var allocUnsafe = require_buffer_alloc_unsafe();
    module2.exports = function alloc(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
      }
      if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
      }
      if (Buffer.alloc) {
        return Buffer.alloc(size, fill, encoding);
      }
      var buffer = allocUnsafe(size);
      if (size === 0) {
        return buffer;
      }
      if (fill === void 0) {
        return bufferFill(buffer, 0);
      }
      if (typeof encoding !== "string") {
        encoding = void 0;
      }
      return bufferFill(buffer, fill, encoding);
    };
  }
});

// node_modules/tar-stream/headers.js
var require_headers = __commonJS({
  "node_modules/tar-stream/headers.js"(exports2) {
    var toBuffer = require_to_buffer();
    var alloc = require_buffer_alloc();
    var ZEROS = "0000000000000000000";
    var SEVENS = "7777777777777777777";
    var ZERO_OFFSET = "0".charCodeAt(0);
    var USTAR = "ustar\x0000";
    var MASK = parseInt("7777", 8);
    var clamp = function(index, len, defaultValue) {
      if (typeof index !== "number")
        return defaultValue;
      index = ~~index;
      if (index >= len)
        return len;
      if (index >= 0)
        return index;
      index += len;
      if (index >= 0)
        return index;
      return 0;
    };
    var toType = function(flag) {
      switch (flag) {
        case 0:
          return "file";
        case 1:
          return "link";
        case 2:
          return "symlink";
        case 3:
          return "character-device";
        case 4:
          return "block-device";
        case 5:
          return "directory";
        case 6:
          return "fifo";
        case 7:
          return "contiguous-file";
        case 72:
          return "pax-header";
        case 55:
          return "pax-global-header";
        case 27:
          return "gnu-long-link-path";
        case 28:
        case 30:
          return "gnu-long-path";
      }
      return null;
    };
    var toTypeflag = function(flag) {
      switch (flag) {
        case "file":
          return 0;
        case "link":
          return 1;
        case "symlink":
          return 2;
        case "character-device":
          return 3;
        case "block-device":
          return 4;
        case "directory":
          return 5;
        case "fifo":
          return 6;
        case "contiguous-file":
          return 7;
        case "pax-header":
          return 72;
      }
      return 0;
    };
    var indexOf = function(block, num, offset, end) {
      for (; offset < end; offset++) {
        if (block[offset] === num)
          return offset;
      }
      return end;
    };
    var cksum = function(block) {
      var sum = 8 * 32;
      for (var i = 0; i < 148; i++)
        sum += block[i];
      for (var j = 156; j < 512; j++)
        sum += block[j];
      return sum;
    };
    var encodeOct = function(val, n) {
      val = val.toString(8);
      if (val.length > n)
        return SEVENS.slice(0, n) + " ";
      else
        return ZEROS.slice(0, n - val.length) + val + " ";
    };
    function parse256(buf) {
      var positive;
      if (buf[0] === 128)
        positive = true;
      else if (buf[0] === 255)
        positive = false;
      else
        return null;
      var zero = false;
      var tuple = [];
      for (var i = buf.length - 1; i > 0; i--) {
        var byte = buf[i];
        if (positive)
          tuple.push(byte);
        else if (zero && byte === 0)
          tuple.push(0);
        else if (zero) {
          zero = false;
          tuple.push(256 - byte);
        } else
          tuple.push(255 - byte);
      }
      var sum = 0;
      var l = tuple.length;
      for (i = 0; i < l; i++) {
        sum += tuple[i] * Math.pow(256, i);
      }
      return positive ? sum : -1 * sum;
    }
    var decodeOct = function(val, offset, length) {
      val = val.slice(offset, offset + length);
      offset = 0;
      if (val[offset] & 128) {
        return parse256(val);
      } else {
        while (offset < val.length && val[offset] === 32)
          offset++;
        var end = clamp(indexOf(val, 32, offset, val.length), val.length, val.length);
        while (offset < end && val[offset] === 0)
          offset++;
        if (end === offset)
          return 0;
        return parseInt(val.slice(offset, end).toString(), 8);
      }
    };
    var decodeStr = function(val, offset, length, encoding) {
      return val.slice(offset, indexOf(val, 0, offset, offset + length)).toString(encoding);
    };
    var addLength = function(str) {
      var len = Buffer.byteLength(str);
      var digits = Math.floor(Math.log(len) / Math.log(10)) + 1;
      if (len + digits >= Math.pow(10, digits))
        digits++;
      return len + digits + str;
    };
    exports2.decodeLongPath = function(buf, encoding) {
      return decodeStr(buf, 0, buf.length, encoding);
    };
    exports2.encodePax = function(opts) {
      var result = "";
      if (opts.name)
        result += addLength(" path=" + opts.name + "\n");
      if (opts.linkname)
        result += addLength(" linkpath=" + opts.linkname + "\n");
      var pax = opts.pax;
      if (pax) {
        for (var key in pax) {
          result += addLength(" " + key + "=" + pax[key] + "\n");
        }
      }
      return toBuffer(result);
    };
    exports2.decodePax = function(buf) {
      var result = {};
      while (buf.length) {
        var i = 0;
        while (i < buf.length && buf[i] !== 32)
          i++;
        var len = parseInt(buf.slice(0, i).toString(), 10);
        if (!len)
          return result;
        var b = buf.slice(i + 1, len - 1).toString();
        var keyIndex = b.indexOf("=");
        if (keyIndex === -1)
          return result;
        result[b.slice(0, keyIndex)] = b.slice(keyIndex + 1);
        buf = buf.slice(len);
      }
      return result;
    };
    exports2.encode = function(opts) {
      var buf = alloc(512);
      var name = opts.name;
      var prefix = "";
      if (opts.typeflag === 5 && name[name.length - 1] !== "/")
        name += "/";
      if (Buffer.byteLength(name) !== name.length)
        return null;
      while (Buffer.byteLength(name) > 100) {
        var i = name.indexOf("/");
        if (i === -1)
          return null;
        prefix += prefix ? "/" + name.slice(0, i) : name.slice(0, i);
        name = name.slice(i + 1);
      }
      if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155)
        return null;
      if (opts.linkname && Buffer.byteLength(opts.linkname) > 100)
        return null;
      buf.write(name);
      buf.write(encodeOct(opts.mode & MASK, 6), 100);
      buf.write(encodeOct(opts.uid, 6), 108);
      buf.write(encodeOct(opts.gid, 6), 116);
      buf.write(encodeOct(opts.size, 11), 124);
      buf.write(encodeOct(opts.mtime.getTime() / 1e3 | 0, 11), 136);
      buf[156] = ZERO_OFFSET + toTypeflag(opts.type);
      if (opts.linkname)
        buf.write(opts.linkname, 157);
      buf.write(USTAR, 257);
      if (opts.uname)
        buf.write(opts.uname, 265);
      if (opts.gname)
        buf.write(opts.gname, 297);
      buf.write(encodeOct(opts.devmajor || 0, 6), 329);
      buf.write(encodeOct(opts.devminor || 0, 6), 337);
      if (prefix)
        buf.write(prefix, 345);
      buf.write(encodeOct(cksum(buf), 6), 148);
      return buf;
    };
    exports2.decode = function(buf, filenameEncoding) {
      var typeflag = buf[156] === 0 ? 0 : buf[156] - ZERO_OFFSET;
      var name = decodeStr(buf, 0, 100, filenameEncoding);
      var mode = decodeOct(buf, 100, 8);
      var uid = decodeOct(buf, 108, 8);
      var gid = decodeOct(buf, 116, 8);
      var size = decodeOct(buf, 124, 12);
      var mtime = decodeOct(buf, 136, 12);
      var type = toType(typeflag);
      var linkname = buf[157] === 0 ? null : decodeStr(buf, 157, 100, filenameEncoding);
      var uname = decodeStr(buf, 265, 32);
      var gname = decodeStr(buf, 297, 32);
      var devmajor = decodeOct(buf, 329, 8);
      var devminor = decodeOct(buf, 337, 8);
      if (buf[345])
        name = decodeStr(buf, 345, 155, filenameEncoding) + "/" + name;
      if (typeflag === 0 && name && name[name.length - 1] === "/")
        typeflag = 5;
      var c = cksum(buf);
      if (c === 8 * 32)
        return null;
      if (c !== decodeOct(buf, 148, 8))
        throw new Error("Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?");
      return {
        name,
        mode,
        uid,
        gid,
        size,
        mtime: new Date(1e3 * mtime),
        type,
        linkname,
        uname,
        gname,
        devmajor,
        devminor
      };
    };
  }
});

// node_modules/tar-stream/extract.js
var require_extract = __commonJS({
  "node_modules/tar-stream/extract.js"(exports2, module2) {
    var util = require("util");
    var bl = require_bl();
    var xtend = require_immutable();
    var headers = require_headers();
    var Writable = require_readable().Writable;
    var PassThrough = require_readable().PassThrough;
    var noop = function() {
    };
    var overflow = function(size) {
      size &= 511;
      return size && 512 - size;
    };
    var emptyStream = function(self, offset) {
      var s = new Source(self, offset);
      s.end();
      return s;
    };
    var mixinPax = function(header, pax) {
      if (pax.path)
        header.name = pax.path;
      if (pax.linkpath)
        header.linkname = pax.linkpath;
      if (pax.size)
        header.size = parseInt(pax.size, 10);
      header.pax = pax;
      return header;
    };
    var Source = function(self, offset) {
      this._parent = self;
      this.offset = offset;
      PassThrough.call(this);
    };
    util.inherits(Source, PassThrough);
    Source.prototype.destroy = function(err) {
      this._parent.destroy(err);
    };
    var Extract = function(opts) {
      if (!(this instanceof Extract))
        return new Extract(opts);
      Writable.call(this, opts);
      opts = opts || {};
      this._offset = 0;
      this._buffer = bl();
      this._missing = 0;
      this._partial = false;
      this._onparse = noop;
      this._header = null;
      this._stream = null;
      this._overflow = null;
      this._cb = null;
      this._locked = false;
      this._destroyed = false;
      this._pax = null;
      this._paxGlobal = null;
      this._gnuLongPath = null;
      this._gnuLongLinkPath = null;
      var self = this;
      var b = self._buffer;
      var oncontinue = function() {
        self._continue();
      };
      var onunlock = function(err) {
        self._locked = false;
        if (err)
          return self.destroy(err);
        if (!self._stream)
          oncontinue();
      };
      var onstreamend = function() {
        self._stream = null;
        var drain = overflow(self._header.size);
        if (drain)
          self._parse(drain, ondrain);
        else
          self._parse(512, onheader);
        if (!self._locked)
          oncontinue();
      };
      var ondrain = function() {
        self._buffer.consume(overflow(self._header.size));
        self._parse(512, onheader);
        oncontinue();
      };
      var onpaxglobalheader = function() {
        var size = self._header.size;
        self._paxGlobal = headers.decodePax(b.slice(0, size));
        b.consume(size);
        onstreamend();
      };
      var onpaxheader = function() {
        var size = self._header.size;
        self._pax = headers.decodePax(b.slice(0, size));
        if (self._paxGlobal)
          self._pax = xtend(self._paxGlobal, self._pax);
        b.consume(size);
        onstreamend();
      };
      var ongnulongpath = function() {
        var size = self._header.size;
        this._gnuLongPath = headers.decodeLongPath(b.slice(0, size), opts.filenameEncoding);
        b.consume(size);
        onstreamend();
      };
      var ongnulonglinkpath = function() {
        var size = self._header.size;
        this._gnuLongLinkPath = headers.decodeLongPath(b.slice(0, size), opts.filenameEncoding);
        b.consume(size);
        onstreamend();
      };
      var onheader = function() {
        var offset = self._offset;
        var header;
        try {
          header = self._header = headers.decode(b.slice(0, 512), opts.filenameEncoding);
        } catch (err) {
          self.emit("error", err);
        }
        b.consume(512);
        if (!header) {
          self._parse(512, onheader);
          oncontinue();
          return;
        }
        if (header.type === "gnu-long-path") {
          self._parse(header.size, ongnulongpath);
          oncontinue();
          return;
        }
        if (header.type === "gnu-long-link-path") {
          self._parse(header.size, ongnulonglinkpath);
          oncontinue();
          return;
        }
        if (header.type === "pax-global-header") {
          self._parse(header.size, onpaxglobalheader);
          oncontinue();
          return;
        }
        if (header.type === "pax-header") {
          self._parse(header.size, onpaxheader);
          oncontinue();
          return;
        }
        if (self._gnuLongPath) {
          header.name = self._gnuLongPath;
          self._gnuLongPath = null;
        }
        if (self._gnuLongLinkPath) {
          header.linkname = self._gnuLongLinkPath;
          self._gnuLongLinkPath = null;
        }
        if (self._pax) {
          self._header = header = mixinPax(header, self._pax);
          self._pax = null;
        }
        self._locked = true;
        if (!header.size || header.type === "directory") {
          self._parse(512, onheader);
          self.emit("entry", header, emptyStream(self, offset), onunlock);
          return;
        }
        self._stream = new Source(self, offset);
        self.emit("entry", header, self._stream, onunlock);
        self._parse(header.size, onstreamend);
        oncontinue();
      };
      this._onheader = onheader;
      this._parse(512, onheader);
    };
    util.inherits(Extract, Writable);
    Extract.prototype.destroy = function(err) {
      if (this._destroyed)
        return;
      this._destroyed = true;
      if (err)
        this.emit("error", err);
      this.emit("close");
      if (this._stream)
        this._stream.emit("close");
    };
    Extract.prototype._parse = function(size, onparse) {
      if (this._destroyed)
        return;
      this._offset += size;
      this._missing = size;
      if (onparse === this._onheader)
        this._partial = false;
      this._onparse = onparse;
    };
    Extract.prototype._continue = function() {
      if (this._destroyed)
        return;
      var cb = this._cb;
      this._cb = noop;
      if (this._overflow)
        this._write(this._overflow, void 0, cb);
      else
        cb();
    };
    Extract.prototype._write = function(data, enc, cb) {
      if (this._destroyed)
        return;
      var s = this._stream;
      var b = this._buffer;
      var missing = this._missing;
      if (data.length)
        this._partial = true;
      if (data.length < missing) {
        this._missing -= data.length;
        this._overflow = null;
        if (s)
          return s.write(data, cb);
        b.append(data);
        return cb();
      }
      this._cb = cb;
      this._missing = 0;
      var overflow2 = null;
      if (data.length > missing) {
        overflow2 = data.slice(missing);
        data = data.slice(0, missing);
      }
      if (s)
        s.end(data);
      else
        b.append(data);
      this._overflow = overflow2;
      this._onparse();
    };
    Extract.prototype._final = function(cb) {
      if (this._partial)
        return this.destroy(new Error("Unexpected end of data"));
      cb();
    };
    module2.exports = Extract;
  }
});

// node_modules/fs-constants/index.js
var require_fs_constants = __commonJS({
  "node_modules/fs-constants/index.js"(exports2, module2) {
    module2.exports = require("fs").constants || require("constants");
  }
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "node_modules/wrappy/wrappy.js"(exports2, module2) {
    module2.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb)
        return wrappy(fn)(cb);
      if (typeof fn !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn).forEach(function(k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS({
  "node_modules/once/once.js"(exports2, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = function() {
        if (f.called)
          return f.value;
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      var name = fn.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS({
  "node_modules/end-of-stream/index.js"(exports2, module2) {
    var once = require_once();
    var noop = function() {
    };
    var isRequest = function(stream2) {
      return stream2.setHeader && typeof stream2.abort === "function";
    };
    var isChildProcess = function(stream2) {
      return stream2.stdio && Array.isArray(stream2.stdio) && stream2.stdio.length === 3;
    };
    var eos = function(stream2, opts, callback) {
      if (typeof opts === "function")
        return eos(stream2, null, opts);
      if (!opts)
        opts = {};
      callback = once(callback || noop);
      var ws = stream2._writableState;
      var rs = stream2._readableState;
      var readable = opts.readable || opts.readable !== false && stream2.readable;
      var writable = opts.writable || opts.writable !== false && stream2.writable;
      var cancelled = false;
      var onlegacyfinish = function() {
        if (!stream2.writable)
          onfinish();
      };
      var onfinish = function() {
        writable = false;
        if (!readable)
          callback.call(stream2);
      };
      var onend = function() {
        readable = false;
        if (!writable)
          callback.call(stream2);
      };
      var onexit = function(exitCode) {
        callback.call(stream2, exitCode ? new Error("exited with error code: " + exitCode) : null);
      };
      var onerror = function(err) {
        callback.call(stream2, err);
      };
      var onclose = function() {
        process.nextTick(onclosenexttick);
      };
      var onclosenexttick = function() {
        if (cancelled)
          return;
        if (readable && !(rs && (rs.ended && !rs.destroyed)))
          return callback.call(stream2, new Error("premature close"));
        if (writable && !(ws && (ws.ended && !ws.destroyed)))
          return callback.call(stream2, new Error("premature close"));
      };
      var onrequest = function() {
        stream2.req.on("finish", onfinish);
      };
      if (isRequest(stream2)) {
        stream2.on("complete", onfinish);
        stream2.on("abort", onclose);
        if (stream2.req)
          onrequest();
        else
          stream2.on("request", onrequest);
      } else if (writable && !ws) {
        stream2.on("end", onlegacyfinish);
        stream2.on("close", onlegacyfinish);
      }
      if (isChildProcess(stream2))
        stream2.on("exit", onexit);
      stream2.on("end", onend);
      stream2.on("finish", onfinish);
      if (opts.error !== false)
        stream2.on("error", onerror);
      stream2.on("close", onclose);
      return function() {
        cancelled = true;
        stream2.removeListener("complete", onfinish);
        stream2.removeListener("abort", onclose);
        stream2.removeListener("request", onrequest);
        if (stream2.req)
          stream2.req.removeListener("finish", onfinish);
        stream2.removeListener("end", onlegacyfinish);
        stream2.removeListener("close", onlegacyfinish);
        stream2.removeListener("finish", onfinish);
        stream2.removeListener("exit", onexit);
        stream2.removeListener("end", onend);
        stream2.removeListener("error", onerror);
        stream2.removeListener("close", onclose);
      };
    };
    module2.exports = eos;
  }
});

// node_modules/tar-stream/pack.js
var require_pack = __commonJS({
  "node_modules/tar-stream/pack.js"(exports2, module2) {
    var constants = require_fs_constants();
    var eos = require_end_of_stream();
    var util = require("util");
    var alloc = require_buffer_alloc();
    var toBuffer = require_to_buffer();
    var Readable = require_readable().Readable;
    var Writable = require_readable().Writable;
    var StringDecoder = require("string_decoder").StringDecoder;
    var headers = require_headers();
    var DMODE = parseInt("755", 8);
    var FMODE = parseInt("644", 8);
    var END_OF_TAR = alloc(1024);
    var noop = function() {
    };
    var overflow = function(self, size) {
      size &= 511;
      if (size)
        self.push(END_OF_TAR.slice(0, 512 - size));
    };
    function modeToType(mode) {
      switch (mode & constants.S_IFMT) {
        case constants.S_IFBLK:
          return "block-device";
        case constants.S_IFCHR:
          return "character-device";
        case constants.S_IFDIR:
          return "directory";
        case constants.S_IFIFO:
          return "fifo";
        case constants.S_IFLNK:
          return "symlink";
      }
      return "file";
    }
    var Sink = function(to) {
      Writable.call(this);
      this.written = 0;
      this._to = to;
      this._destroyed = false;
    };
    util.inherits(Sink, Writable);
    Sink.prototype._write = function(data, enc, cb) {
      this.written += data.length;
      if (this._to.push(data))
        return cb();
      this._to._drain = cb;
    };
    Sink.prototype.destroy = function() {
      if (this._destroyed)
        return;
      this._destroyed = true;
      this.emit("close");
    };
    var LinkSink = function() {
      Writable.call(this);
      this.linkname = "";
      this._decoder = new StringDecoder("utf-8");
      this._destroyed = false;
    };
    util.inherits(LinkSink, Writable);
    LinkSink.prototype._write = function(data, enc, cb) {
      this.linkname += this._decoder.write(data);
      cb();
    };
    LinkSink.prototype.destroy = function() {
      if (this._destroyed)
        return;
      this._destroyed = true;
      this.emit("close");
    };
    var Void = function() {
      Writable.call(this);
      this._destroyed = false;
    };
    util.inherits(Void, Writable);
    Void.prototype._write = function(data, enc, cb) {
      cb(new Error("No body allowed for this entry"));
    };
    Void.prototype.destroy = function() {
      if (this._destroyed)
        return;
      this._destroyed = true;
      this.emit("close");
    };
    var Pack = function(opts) {
      if (!(this instanceof Pack))
        return new Pack(opts);
      Readable.call(this, opts);
      this._drain = noop;
      this._finalized = false;
      this._finalizing = false;
      this._destroyed = false;
      this._stream = null;
    };
    util.inherits(Pack, Readable);
    Pack.prototype.entry = function(header, buffer, callback) {
      if (this._stream)
        throw new Error("already piping an entry");
      if (this._finalized || this._destroyed)
        return;
      if (typeof buffer === "function") {
        callback = buffer;
        buffer = null;
      }
      if (!callback)
        callback = noop;
      var self = this;
      if (!header.size || header.type === "symlink")
        header.size = 0;
      if (!header.type)
        header.type = modeToType(header.mode);
      if (!header.mode)
        header.mode = header.type === "directory" ? DMODE : FMODE;
      if (!header.uid)
        header.uid = 0;
      if (!header.gid)
        header.gid = 0;
      if (!header.mtime)
        header.mtime = new Date();
      if (typeof buffer === "string")
        buffer = toBuffer(buffer);
      if (Buffer.isBuffer(buffer)) {
        header.size = buffer.length;
        this._encode(header);
        this.push(buffer);
        overflow(self, header.size);
        process.nextTick(callback);
        return new Void();
      }
      if (header.type === "symlink" && !header.linkname) {
        var linkSink = new LinkSink();
        eos(linkSink, function(err) {
          if (err) {
            self.destroy();
            return callback(err);
          }
          header.linkname = linkSink.linkname;
          self._encode(header);
          callback();
        });
        return linkSink;
      }
      this._encode(header);
      if (header.type !== "file" && header.type !== "contiguous-file") {
        process.nextTick(callback);
        return new Void();
      }
      var sink = new Sink(this);
      this._stream = sink;
      eos(sink, function(err) {
        self._stream = null;
        if (err) {
          self.destroy();
          return callback(err);
        }
        if (sink.written !== header.size) {
          self.destroy();
          return callback(new Error("size mismatch"));
        }
        overflow(self, header.size);
        if (self._finalizing)
          self.finalize();
        callback();
      });
      return sink;
    };
    Pack.prototype.finalize = function() {
      if (this._stream) {
        this._finalizing = true;
        return;
      }
      if (this._finalized)
        return;
      this._finalized = true;
      this.push(END_OF_TAR);
      this.push(null);
    };
    Pack.prototype.destroy = function(err) {
      if (this._destroyed)
        return;
      this._destroyed = true;
      if (err)
        this.emit("error", err);
      this.emit("close");
      if (this._stream && this._stream.destroy)
        this._stream.destroy();
    };
    Pack.prototype._encode = function(header) {
      if (!header.pax) {
        var buf = headers.encode(header);
        if (buf) {
          this.push(buf);
          return;
        }
      }
      this._encodePax(header);
    };
    Pack.prototype._encodePax = function(header) {
      var paxHeader = headers.encodePax({
        name: header.name,
        linkname: header.linkname,
        pax: header.pax
      });
      var newHeader = {
        name: "PaxHeader",
        mode: header.mode,
        uid: header.uid,
        gid: header.gid,
        size: paxHeader.length,
        mtime: header.mtime,
        type: "pax-header",
        linkname: header.linkname && "PaxHeader",
        uname: header.uname,
        gname: header.gname,
        devmajor: header.devmajor,
        devminor: header.devminor
      };
      this.push(headers.encode(newHeader));
      this.push(paxHeader);
      overflow(this, paxHeader.length);
      newHeader.size = header.size;
      newHeader.type = header.type;
      this.push(headers.encode(newHeader));
    };
    Pack.prototype._read = function(n) {
      var drain = this._drain;
      this._drain = noop;
      drain();
    };
    module2.exports = Pack;
  }
});

// node_modules/tar-stream/index.js
var require_tar_stream = __commonJS({
  "node_modules/tar-stream/index.js"(exports2) {
    exports2.extract = require_extract();
    exports2.pack = require_pack();
  }
});

// node_modules/decompress-tar/index.js
var require_decompress_tar = __commonJS({
  "node_modules/decompress-tar/index.js"(exports2, module2) {
    "use strict";
    var fileType2 = require_file_type2();
    var isStream = require_is_stream();
    var tarStream = require_tar_stream();
    module2.exports = () => (input) => {
      if (!Buffer.isBuffer(input) && !isStream(input)) {
        return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
      }
      if (Buffer.isBuffer(input) && (!fileType2(input) || fileType2(input).ext !== "tar")) {
        return Promise.resolve([]);
      }
      const extract = tarStream.extract();
      const files = [];
      extract.on("entry", (header, stream2, cb) => {
        const chunk = [];
        stream2.on("data", (data) => chunk.push(data));
        stream2.on("end", () => {
          const file = {
            data: Buffer.concat(chunk),
            mode: header.mode,
            mtime: header.mtime,
            path: header.name,
            type: header.type
          };
          if (header.type === "symlink" || header.type === "link") {
            file.linkname = header.linkname;
          }
          files.push(file);
          cb();
        });
      });
      const promise = new Promise((resolve2, reject2) => {
        if (!Buffer.isBuffer(input)) {
          input.on("error", reject2);
        }
        extract.on("finish", () => resolve2(files));
        extract.on("error", reject2);
      });
      extract.then = promise.then.bind(promise);
      extract.catch = promise.catch.bind(promise);
      if (Buffer.isBuffer(input)) {
        extract.end(input);
      } else {
        input.pipe(extract);
      }
      return extract;
    };
  }
});

// node_modules/decompress-tarbz2/node_modules/file-type/index.js
var require_file_type3 = __commonJS({
  "node_modules/decompress-tarbz2/node_modules/file-type/index.js"(exports2, module2) {
    "use strict";
    var toBytes = (s) => Array.from(s).map((c) => c.charCodeAt(0));
    var xpiZipFilename2 = toBytes("META-INF/mozilla.rsa");
    var oxmlContentTypes2 = toBytes("[Content_Types].xml");
    var oxmlRels2 = toBytes("_rels/.rels");
    module2.exports = (input) => {
      const buf = new Uint8Array(input);
      if (!(buf && buf.length > 1)) {
        return null;
      }
      const check = (header, opts) => {
        opts = Object.assign({
          offset: 0
        }, opts);
        for (let i = 0; i < header.length; i++) {
          if (opts.mask) {
            if (header[i] !== (opts.mask[i] & buf[i + opts.offset])) {
              return false;
            }
          } else if (header[i] !== buf[i + opts.offset]) {
            return false;
          }
        }
        return true;
      };
      if (check([255, 216, 255])) {
        return {
          ext: "jpg",
          mime: "image/jpeg"
        };
      }
      if (check([137, 80, 78, 71, 13, 10, 26, 10])) {
        return {
          ext: "png",
          mime: "image/png"
        };
      }
      if (check([71, 73, 70])) {
        return {
          ext: "gif",
          mime: "image/gif"
        };
      }
      if (check([87, 69, 66, 80], { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (check([70, 76, 73, 70])) {
        return {
          ext: "flif",
          mime: "image/flif"
        };
      }
      if ((check([73, 73, 42, 0]) || check([77, 77, 0, 42])) && check([67, 82], { offset: 8 })) {
        return {
          ext: "cr2",
          mime: "image/x-canon-cr2"
        };
      }
      if (check([73, 73, 42, 0]) || check([77, 77, 0, 42])) {
        return {
          ext: "tif",
          mime: "image/tiff"
        };
      }
      if (check([66, 77])) {
        return {
          ext: "bmp",
          mime: "image/bmp"
        };
      }
      if (check([73, 73, 188])) {
        return {
          ext: "jxr",
          mime: "image/vnd.ms-photo"
        };
      }
      if (check([56, 66, 80, 83])) {
        return {
          ext: "psd",
          mime: "image/vnd.adobe.photoshop"
        };
      }
      if (check([80, 75, 3, 4])) {
        if (check([109, 105, 109, 101, 116, 121, 112, 101, 97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 101, 112, 117, 98, 43, 122, 105, 112], { offset: 30 })) {
          return {
            ext: "epub",
            mime: "application/epub+zip"
          };
        }
        if (check(xpiZipFilename2, { offset: 30 })) {
          return {
            ext: "xpi",
            mime: "application/x-xpinstall"
          };
        }
        if (check(oxmlContentTypes2, { offset: 30 }) || check(oxmlRels2, { offset: 30 })) {
          const sliced = buf.subarray(4, 4 + 2e3);
          const nextZipHeaderIndex = (arr) => arr.findIndex((el, i, arr2) => arr2[i] === 80 && arr2[i + 1] === 75 && arr2[i + 2] === 3 && arr2[i + 3] === 4);
          const header2Pos = nextZipHeaderIndex(sliced);
          if (header2Pos !== -1) {
            const slicedAgain = buf.subarray(header2Pos + 8, header2Pos + 8 + 1e3);
            const header3Pos = nextZipHeaderIndex(slicedAgain);
            if (header3Pos !== -1) {
              const offset = 8 + header2Pos + header3Pos + 30;
              if (check(toBytes("word/"), { offset })) {
                return {
                  ext: "docx",
                  mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                };
              }
              if (check(toBytes("ppt/"), { offset })) {
                return {
                  ext: "pptx",
                  mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                };
              }
              if (check(toBytes("xl/"), { offset })) {
                return {
                  ext: "xlsx",
                  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                };
              }
            }
          }
        }
      }
      if (check([80, 75]) && (buf[2] === 3 || buf[2] === 5 || buf[2] === 7) && (buf[3] === 4 || buf[3] === 6 || buf[3] === 8)) {
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (check([117, 115, 116, 97, 114], { offset: 257 })) {
        return {
          ext: "tar",
          mime: "application/x-tar"
        };
      }
      if (check([82, 97, 114, 33, 26, 7]) && (buf[6] === 0 || buf[6] === 1)) {
        return {
          ext: "rar",
          mime: "application/x-rar-compressed"
        };
      }
      if (check([31, 139, 8])) {
        return {
          ext: "gz",
          mime: "application/gzip"
        };
      }
      if (check([66, 90, 104])) {
        return {
          ext: "bz2",
          mime: "application/x-bzip2"
        };
      }
      if (check([55, 122, 188, 175, 39, 28])) {
        return {
          ext: "7z",
          mime: "application/x-7z-compressed"
        };
      }
      if (check([120, 1])) {
        return {
          ext: "dmg",
          mime: "application/x-apple-diskimage"
        };
      }
      if (check([51, 103, 112, 53]) || check([0, 0, 0]) && check([102, 116, 121, 112], { offset: 4 }) && (check([109, 112, 52, 49], { offset: 8 }) || check([109, 112, 52, 50], { offset: 8 }) || check([105, 115, 111, 109], { offset: 8 }) || check([105, 115, 111, 50], { offset: 8 }) || check([109, 109, 112, 52], { offset: 8 }) || check([77, 52, 86], { offset: 8 }) || check([100, 97, 115, 104], { offset: 8 }))) {
        return {
          ext: "mp4",
          mime: "video/mp4"
        };
      }
      if (check([77, 84, 104, 100])) {
        return {
          ext: "mid",
          mime: "audio/midi"
        };
      }
      if (check([26, 69, 223, 163])) {
        const sliced = buf.subarray(4, 4 + 4096);
        const idPos = sliced.findIndex((el, i, arr) => arr[i] === 66 && arr[i + 1] === 130);
        if (idPos !== -1) {
          const docTypePos = idPos + 3;
          const findDocType = (type) => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));
          if (findDocType("matroska")) {
            return {
              ext: "mkv",
              mime: "video/x-matroska"
            };
          }
          if (findDocType("webm")) {
            return {
              ext: "webm",
              mime: "video/webm"
            };
          }
        }
      }
      if (check([0, 0, 0, 20, 102, 116, 121, 112, 113, 116, 32, 32]) || check([102, 114, 101, 101], { offset: 4 }) || check([102, 116, 121, 112, 113, 116, 32, 32], { offset: 4 }) || check([109, 100, 97, 116], { offset: 4 }) || check([119, 105, 100, 101], { offset: 4 })) {
        return {
          ext: "mov",
          mime: "video/quicktime"
        };
      }
      if (check([82, 73, 70, 70]) && check([65, 86, 73], { offset: 8 })) {
        return {
          ext: "avi",
          mime: "video/x-msvideo"
        };
      }
      if (check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
        return {
          ext: "wmv",
          mime: "video/x-ms-wmv"
        };
      }
      if (check([0, 0, 1, 186])) {
        return {
          ext: "mpg",
          mime: "video/mpeg"
        };
      }
      for (let start = 0; start < 2 && start < buf.length - 16; start++) {
        if (check([73, 68, 51], { offset: start }) || check([255, 226], { offset: start, mask: [255, 226] })) {
          return {
            ext: "mp3",
            mime: "audio/mpeg"
          };
        }
      }
      if (check([102, 116, 121, 112, 77, 52, 65], { offset: 4 }) || check([77, 52, 65, 32])) {
        return {
          ext: "m4a",
          mime: "audio/m4a"
        };
      }
      if (check([79, 112, 117, 115, 72, 101, 97, 100], { offset: 28 })) {
        return {
          ext: "opus",
          mime: "audio/opus"
        };
      }
      if (check([79, 103, 103, 83])) {
        return {
          ext: "ogg",
          mime: "audio/ogg"
        };
      }
      if (check([102, 76, 97, 67])) {
        return {
          ext: "flac",
          mime: "audio/x-flac"
        };
      }
      if (check([82, 73, 70, 70]) && check([87, 65, 86, 69], { offset: 8 })) {
        return {
          ext: "wav",
          mime: "audio/x-wav"
        };
      }
      if (check([35, 33, 65, 77, 82, 10])) {
        return {
          ext: "amr",
          mime: "audio/amr"
        };
      }
      if (check([37, 80, 68, 70])) {
        return {
          ext: "pdf",
          mime: "application/pdf"
        };
      }
      if (check([77, 90])) {
        return {
          ext: "exe",
          mime: "application/x-msdownload"
        };
      }
      if ((buf[0] === 67 || buf[0] === 70) && check([87, 83], { offset: 1 })) {
        return {
          ext: "swf",
          mime: "application/x-shockwave-flash"
        };
      }
      if (check([123, 92, 114, 116, 102])) {
        return {
          ext: "rtf",
          mime: "application/rtf"
        };
      }
      if (check([0, 97, 115, 109])) {
        return {
          ext: "wasm",
          mime: "application/wasm"
        };
      }
      if (check([119, 79, 70, 70]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff",
          mime: "font/woff"
        };
      }
      if (check([119, 79, 70, 50]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff2",
          mime: "font/woff2"
        };
      }
      if (check([76, 80], { offset: 34 }) && (check([0, 0, 1], { offset: 8 }) || check([1, 0, 2], { offset: 8 }) || check([2, 0, 2], { offset: 8 }))) {
        return {
          ext: "eot",
          mime: "application/octet-stream"
        };
      }
      if (check([0, 1, 0, 0, 0])) {
        return {
          ext: "ttf",
          mime: "font/ttf"
        };
      }
      if (check([79, 84, 84, 79, 0])) {
        return {
          ext: "otf",
          mime: "font/otf"
        };
      }
      if (check([0, 0, 1, 0])) {
        return {
          ext: "ico",
          mime: "image/x-icon"
        };
      }
      if (check([70, 76, 86, 1])) {
        return {
          ext: "flv",
          mime: "video/x-flv"
        };
      }
      if (check([37, 33])) {
        return {
          ext: "ps",
          mime: "application/postscript"
        };
      }
      if (check([253, 55, 122, 88, 90, 0])) {
        return {
          ext: "xz",
          mime: "application/x-xz"
        };
      }
      if (check([83, 81, 76, 105])) {
        return {
          ext: "sqlite",
          mime: "application/x-sqlite3"
        };
      }
      if (check([78, 69, 83, 26])) {
        return {
          ext: "nes",
          mime: "application/x-nintendo-nes-rom"
        };
      }
      if (check([67, 114, 50, 52])) {
        return {
          ext: "crx",
          mime: "application/x-google-chrome-extension"
        };
      }
      if (check([77, 83, 67, 70]) || check([73, 83, 99, 40])) {
        return {
          ext: "cab",
          mime: "application/vnd.ms-cab-compressed"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62, 10, 100, 101, 98, 105, 97, 110, 45, 98, 105, 110, 97, 114, 121])) {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62])) {
        return {
          ext: "ar",
          mime: "application/x-unix-archive"
        };
      }
      if (check([237, 171, 238, 219])) {
        return {
          ext: "rpm",
          mime: "application/x-rpm"
        };
      }
      if (check([31, 160]) || check([31, 157])) {
        return {
          ext: "Z",
          mime: "application/x-compress"
        };
      }
      if (check([76, 90, 73, 80])) {
        return {
          ext: "lz",
          mime: "application/x-lzip"
        };
      }
      if (check([208, 207, 17, 224, 161, 177, 26, 225])) {
        return {
          ext: "msi",
          mime: "application/x-msi"
        };
      }
      if (check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
        return {
          ext: "mxf",
          mime: "application/mxf"
        };
      }
      if (check([71], { offset: 4 }) && (check([71], { offset: 192 }) || check([71], { offset: 196 }))) {
        return {
          ext: "mts",
          mime: "video/mp2t"
        };
      }
      if (check([66, 76, 69, 78, 68, 69, 82])) {
        return {
          ext: "blend",
          mime: "application/x-blender"
        };
      }
      if (check([66, 80, 71, 251])) {
        return {
          ext: "bpg",
          mime: "image/bpg"
        };
      }
      return null;
    };
  }
});

// node_modules/seek-bzip/lib/bitreader.js
var require_bitreader = __commonJS({
  "node_modules/seek-bzip/lib/bitreader.js"(exports2, module2) {
    var BITMASK = [0, 1, 3, 7, 15, 31, 63, 127, 255];
    var BitReader = function(stream2) {
      this.stream = stream2;
      this.bitOffset = 0;
      this.curByte = 0;
      this.hasByte = false;
    };
    BitReader.prototype._ensureByte = function() {
      if (!this.hasByte) {
        this.curByte = this.stream.readByte();
        this.hasByte = true;
      }
    };
    BitReader.prototype.read = function(bits) {
      var result = 0;
      while (bits > 0) {
        this._ensureByte();
        var remaining = 8 - this.bitOffset;
        if (bits >= remaining) {
          result <<= remaining;
          result |= BITMASK[remaining] & this.curByte;
          this.hasByte = false;
          this.bitOffset = 0;
          bits -= remaining;
        } else {
          result <<= bits;
          var shift = remaining - bits;
          result |= (this.curByte & BITMASK[bits] << shift) >> shift;
          this.bitOffset += bits;
          bits = 0;
        }
      }
      return result;
    };
    BitReader.prototype.seek = function(pos) {
      var n_bit = pos % 8;
      var n_byte = (pos - n_bit) / 8;
      this.bitOffset = n_bit;
      this.stream.seek(n_byte);
      this.hasByte = false;
    };
    BitReader.prototype.pi = function() {
      var buf = new Buffer(6), i;
      for (i = 0; i < buf.length; i++) {
        buf[i] = this.read(8);
      }
      return buf.toString("hex");
    };
    module2.exports = BitReader;
  }
});

// node_modules/seek-bzip/lib/stream.js
var require_stream2 = __commonJS({
  "node_modules/seek-bzip/lib/stream.js"(exports2, module2) {
    var Stream = function() {
    };
    Stream.prototype.readByte = function() {
      throw new Error("abstract method readByte() not implemented");
    };
    Stream.prototype.read = function(buffer, bufOffset, length) {
      var bytesRead = 0;
      while (bytesRead < length) {
        var c = this.readByte();
        if (c < 0) {
          return bytesRead === 0 ? -1 : bytesRead;
        }
        buffer[bufOffset++] = c;
        bytesRead++;
      }
      return bytesRead;
    };
    Stream.prototype.seek = function(new_pos) {
      throw new Error("abstract method seek() not implemented");
    };
    Stream.prototype.writeByte = function(_byte) {
      throw new Error("abstract method readByte() not implemented");
    };
    Stream.prototype.write = function(buffer, bufOffset, length) {
      var i;
      for (i = 0; i < length; i++) {
        this.writeByte(buffer[bufOffset++]);
      }
      return length;
    };
    Stream.prototype.flush = function() {
    };
    module2.exports = Stream;
  }
});

// node_modules/seek-bzip/lib/crc32.js
var require_crc32 = __commonJS({
  "node_modules/seek-bzip/lib/crc32.js"(exports2, module2) {
    module2.exports = function() {
      var crc32Lookup = new Uint32Array([
        0,
        79764919,
        159529838,
        222504665,
        319059676,
        398814059,
        445009330,
        507990021,
        638119352,
        583659535,
        797628118,
        726387553,
        890018660,
        835552979,
        1015980042,
        944750013,
        1276238704,
        1221641927,
        1167319070,
        1095957929,
        1595256236,
        1540665371,
        1452775106,
        1381403509,
        1780037320,
        1859660671,
        1671105958,
        1733955601,
        2031960084,
        2111593891,
        1889500026,
        1952343757,
        2552477408,
        2632100695,
        2443283854,
        2506133561,
        2334638140,
        2414271883,
        2191915858,
        2254759653,
        3190512472,
        3135915759,
        3081330742,
        3009969537,
        2905550212,
        2850959411,
        2762807018,
        2691435357,
        3560074640,
        3505614887,
        3719321342,
        3648080713,
        3342211916,
        3287746299,
        3467911202,
        3396681109,
        4063920168,
        4143685023,
        4223187782,
        4286162673,
        3779000052,
        3858754371,
        3904687514,
        3967668269,
        881225847,
        809987520,
        1023691545,
        969234094,
        662832811,
        591600412,
        771767749,
        717299826,
        311336399,
        374308984,
        453813921,
        533576470,
        25881363,
        88864420,
        134795389,
        214552010,
        2023205639,
        2086057648,
        1897238633,
        1976864222,
        1804852699,
        1867694188,
        1645340341,
        1724971778,
        1587496639,
        1516133128,
        1461550545,
        1406951526,
        1302016099,
        1230646740,
        1142491917,
        1087903418,
        2896545431,
        2825181984,
        2770861561,
        2716262478,
        3215044683,
        3143675388,
        3055782693,
        3001194130,
        2326604591,
        2389456536,
        2200899649,
        2280525302,
        2578013683,
        2640855108,
        2418763421,
        2498394922,
        3769900519,
        3832873040,
        3912640137,
        3992402750,
        4088425275,
        4151408268,
        4197601365,
        4277358050,
        3334271071,
        3263032808,
        3476998961,
        3422541446,
        3585640067,
        3514407732,
        3694837229,
        3640369242,
        1762451694,
        1842216281,
        1619975040,
        1682949687,
        2047383090,
        2127137669,
        1938468188,
        2001449195,
        1325665622,
        1271206113,
        1183200824,
        1111960463,
        1543535498,
        1489069629,
        1434599652,
        1363369299,
        622672798,
        568075817,
        748617968,
        677256519,
        907627842,
        853037301,
        1067152940,
        995781531,
        51762726,
        131386257,
        177728840,
        240578815,
        269590778,
        349224269,
        429104020,
        491947555,
        4046411278,
        4126034873,
        4172115296,
        4234965207,
        3794477266,
        3874110821,
        3953728444,
        4016571915,
        3609705398,
        3555108353,
        3735388376,
        3664026991,
        3290680682,
        3236090077,
        3449943556,
        3378572211,
        3174993278,
        3120533705,
        3032266256,
        2961025959,
        2923101090,
        2868635157,
        2813903052,
        2742672763,
        2604032198,
        2683796849,
        2461293480,
        2524268063,
        2284983834,
        2364738477,
        2175806836,
        2238787779,
        1569362073,
        1498123566,
        1409854455,
        1355396672,
        1317987909,
        1246755826,
        1192025387,
        1137557660,
        2072149281,
        2135122070,
        1912620623,
        1992383480,
        1753615357,
        1816598090,
        1627664531,
        1707420964,
        295390185,
        358241886,
        404320391,
        483945776,
        43990325,
        106832002,
        186451547,
        266083308,
        932423249,
        861060070,
        1041341759,
        986742920,
        613929101,
        542559546,
        756411363,
        701822548,
        3316196985,
        3244833742,
        3425377559,
        3370778784,
        3601682597,
        3530312978,
        3744426955,
        3689838204,
        3819031489,
        3881883254,
        3928223919,
        4007849240,
        4037393693,
        4100235434,
        4180117107,
        4259748804,
        2310601993,
        2373574846,
        2151335527,
        2231098320,
        2596047829,
        2659030626,
        2470359227,
        2550115596,
        2947551409,
        2876312838,
        2788305887,
        2733848168,
        3165939309,
        3094707162,
        3040238851,
        2985771188
      ]);
      var CRC32 = function() {
        var crc = 4294967295;
        this.getCRC = function() {
          return ~crc >>> 0;
        };
        this.updateCRC = function(value) {
          crc = crc << 8 ^ crc32Lookup[(crc >>> 24 ^ value) & 255];
        };
        this.updateCRCRun = function(value, count) {
          while (count-- > 0) {
            crc = crc << 8 ^ crc32Lookup[(crc >>> 24 ^ value) & 255];
          }
        };
      };
      return CRC32;
    }();
  }
});

// node_modules/seek-bzip/package.json
var require_package = __commonJS({
  "node_modules/seek-bzip/package.json"(exports2, module2) {
    module2.exports = {
      name: "seek-bzip",
      version: "1.0.6",
      contributors: [
        "C. Scott Ananian (http://cscott.net)",
        "Eli Skeggs",
        "Kevin Kwok",
        "Rob Landley (http://landley.net)"
      ],
      description: "a pure-JavaScript Node.JS module for random-access decoding bzip2 data",
      main: "./lib/index.js",
      repository: {
        type: "git",
        url: "https://github.com/cscott/seek-bzip.git"
      },
      license: "MIT",
      bin: {
        "seek-bunzip": "./bin/seek-bunzip",
        "seek-table": "./bin/seek-bzip-table"
      },
      directories: {
        test: "test"
      },
      dependencies: {
        commander: "^2.8.1"
      },
      devDependencies: {
        fibers: "~1.0.6",
        mocha: "~2.2.5"
      },
      scripts: {
        test: "mocha"
      }
    };
  }
});

// node_modules/seek-bzip/lib/index.js
var require_lib = __commonJS({
  "node_modules/seek-bzip/lib/index.js"(exports2, module2) {
    var BitReader = require_bitreader();
    var Stream = require_stream2();
    var CRC32 = require_crc32();
    var pjson = require_package();
    var MAX_HUFCODE_BITS = 20;
    var MAX_SYMBOLS = 258;
    var SYMBOL_RUNA = 0;
    var SYMBOL_RUNB = 1;
    var MIN_GROUPS = 2;
    var MAX_GROUPS = 6;
    var GROUP_SIZE = 50;
    var WHOLEPI = "314159265359";
    var SQRTPI = "177245385090";
    var mtf = function(array, index) {
      var src = array[index], i;
      for (i = index; i > 0; i--) {
        array[i] = array[i - 1];
      }
      array[0] = src;
      return src;
    };
    var Err = {
      OK: 0,
      LAST_BLOCK: -1,
      NOT_BZIP_DATA: -2,
      UNEXPECTED_INPUT_EOF: -3,
      UNEXPECTED_OUTPUT_EOF: -4,
      DATA_ERROR: -5,
      OUT_OF_MEMORY: -6,
      OBSOLETE_INPUT: -7,
      END_OF_BLOCK: -8
    };
    var ErrorMessages = {};
    ErrorMessages[Err.LAST_BLOCK] = "Bad file checksum";
    ErrorMessages[Err.NOT_BZIP_DATA] = "Not bzip data";
    ErrorMessages[Err.UNEXPECTED_INPUT_EOF] = "Unexpected input EOF";
    ErrorMessages[Err.UNEXPECTED_OUTPUT_EOF] = "Unexpected output EOF";
    ErrorMessages[Err.DATA_ERROR] = "Data error";
    ErrorMessages[Err.OUT_OF_MEMORY] = "Out of memory";
    ErrorMessages[Err.OBSOLETE_INPUT] = "Obsolete (pre 0.9.5) bzip format not supported.";
    var _throw = function(status, optDetail) {
      var msg = ErrorMessages[status] || "unknown error";
      if (optDetail) {
        msg += ": " + optDetail;
      }
      var e = new TypeError(msg);
      e.errorCode = status;
      throw e;
    };
    var Bunzip = function(inputStream, outputStream) {
      this.writePos = this.writeCurrent = this.writeCount = 0;
      this._start_bunzip(inputStream, outputStream);
    };
    Bunzip.prototype._init_block = function() {
      var moreBlocks = this._get_next_block();
      if (!moreBlocks) {
        this.writeCount = -1;
        return false;
      }
      this.blockCRC = new CRC32();
      return true;
    };
    Bunzip.prototype._start_bunzip = function(inputStream, outputStream) {
      var buf = new Buffer(4);
      if (inputStream.read(buf, 0, 4) !== 4 || String.fromCharCode(buf[0], buf[1], buf[2]) !== "BZh")
        _throw(Err.NOT_BZIP_DATA, "bad magic");
      var level = buf[3] - 48;
      if (level < 1 || level > 9)
        _throw(Err.NOT_BZIP_DATA, "level out of range");
      this.reader = new BitReader(inputStream);
      this.dbufSize = 1e5 * level;
      this.nextoutput = 0;
      this.outputStream = outputStream;
      this.streamCRC = 0;
    };
    Bunzip.prototype._get_next_block = function() {
      var i, j, k;
      var reader = this.reader;
      var h = reader.pi();
      if (h === SQRTPI) {
        return false;
      }
      if (h !== WHOLEPI)
        _throw(Err.NOT_BZIP_DATA);
      this.targetBlockCRC = reader.read(32) >>> 0;
      this.streamCRC = (this.targetBlockCRC ^ (this.streamCRC << 1 | this.streamCRC >>> 31)) >>> 0;
      if (reader.read(1))
        _throw(Err.OBSOLETE_INPUT);
      var origPointer = reader.read(24);
      if (origPointer > this.dbufSize)
        _throw(Err.DATA_ERROR, "initial position out of bounds");
      var t = reader.read(16);
      var symToByte = new Buffer(256), symTotal = 0;
      for (i = 0; i < 16; i++) {
        if (t & 1 << 15 - i) {
          var o = i * 16;
          k = reader.read(16);
          for (j = 0; j < 16; j++)
            if (k & 1 << 15 - j)
              symToByte[symTotal++] = o + j;
        }
      }
      var groupCount = reader.read(3);
      if (groupCount < MIN_GROUPS || groupCount > MAX_GROUPS)
        _throw(Err.DATA_ERROR);
      var nSelectors = reader.read(15);
      if (nSelectors === 0)
        _throw(Err.DATA_ERROR);
      var mtfSymbol = new Buffer(256);
      for (i = 0; i < groupCount; i++)
        mtfSymbol[i] = i;
      var selectors = new Buffer(nSelectors);
      for (i = 0; i < nSelectors; i++) {
        for (j = 0; reader.read(1); j++)
          if (j >= groupCount)
            _throw(Err.DATA_ERROR);
        selectors[i] = mtf(mtfSymbol, j);
      }
      var symCount = symTotal + 2;
      var groups = [], hufGroup;
      for (j = 0; j < groupCount; j++) {
        var length = new Buffer(symCount), temp = new Uint16Array(MAX_HUFCODE_BITS + 1);
        t = reader.read(5);
        for (i = 0; i < symCount; i++) {
          for (; ; ) {
            if (t < 1 || t > MAX_HUFCODE_BITS)
              _throw(Err.DATA_ERROR);
            if (!reader.read(1))
              break;
            if (!reader.read(1))
              t++;
            else
              t--;
          }
          length[i] = t;
        }
        var minLen, maxLen;
        minLen = maxLen = length[0];
        for (i = 1; i < symCount; i++) {
          if (length[i] > maxLen)
            maxLen = length[i];
          else if (length[i] < minLen)
            minLen = length[i];
        }
        hufGroup = {};
        groups.push(hufGroup);
        hufGroup.permute = new Uint16Array(MAX_SYMBOLS);
        hufGroup.limit = new Uint32Array(MAX_HUFCODE_BITS + 2);
        hufGroup.base = new Uint32Array(MAX_HUFCODE_BITS + 1);
        hufGroup.minLen = minLen;
        hufGroup.maxLen = maxLen;
        var pp = 0;
        for (i = minLen; i <= maxLen; i++) {
          temp[i] = hufGroup.limit[i] = 0;
          for (t = 0; t < symCount; t++)
            if (length[t] === i)
              hufGroup.permute[pp++] = t;
        }
        for (i = 0; i < symCount; i++)
          temp[length[i]]++;
        pp = t = 0;
        for (i = minLen; i < maxLen; i++) {
          pp += temp[i];
          hufGroup.limit[i] = pp - 1;
          pp <<= 1;
          t += temp[i];
          hufGroup.base[i + 1] = pp - t;
        }
        hufGroup.limit[maxLen + 1] = Number.MAX_VALUE;
        hufGroup.limit[maxLen] = pp + temp[maxLen] - 1;
        hufGroup.base[minLen] = 0;
      }
      var byteCount = new Uint32Array(256);
      for (i = 0; i < 256; i++)
        mtfSymbol[i] = i;
      var runPos = 0, dbufCount = 0, selector = 0, uc;
      var dbuf = this.dbuf = new Uint32Array(this.dbufSize);
      symCount = 0;
      for (; ; ) {
        if (!symCount--) {
          symCount = GROUP_SIZE - 1;
          if (selector >= nSelectors) {
            _throw(Err.DATA_ERROR);
          }
          hufGroup = groups[selectors[selector++]];
        }
        i = hufGroup.minLen;
        j = reader.read(i);
        for (; ; i++) {
          if (i > hufGroup.maxLen) {
            _throw(Err.DATA_ERROR);
          }
          if (j <= hufGroup.limit[i])
            break;
          j = j << 1 | reader.read(1);
        }
        j -= hufGroup.base[i];
        if (j < 0 || j >= MAX_SYMBOLS) {
          _throw(Err.DATA_ERROR);
        }
        var nextSym = hufGroup.permute[j];
        if (nextSym === SYMBOL_RUNA || nextSym === SYMBOL_RUNB) {
          if (!runPos) {
            runPos = 1;
            t = 0;
          }
          if (nextSym === SYMBOL_RUNA)
            t += runPos;
          else
            t += 2 * runPos;
          runPos <<= 1;
          continue;
        }
        if (runPos) {
          runPos = 0;
          if (dbufCount + t > this.dbufSize) {
            _throw(Err.DATA_ERROR);
          }
          uc = symToByte[mtfSymbol[0]];
          byteCount[uc] += t;
          while (t--)
            dbuf[dbufCount++] = uc;
        }
        if (nextSym > symTotal)
          break;
        if (dbufCount >= this.dbufSize) {
          _throw(Err.DATA_ERROR);
        }
        i = nextSym - 1;
        uc = mtf(mtfSymbol, i);
        uc = symToByte[uc];
        byteCount[uc]++;
        dbuf[dbufCount++] = uc;
      }
      if (origPointer < 0 || origPointer >= dbufCount) {
        _throw(Err.DATA_ERROR);
      }
      j = 0;
      for (i = 0; i < 256; i++) {
        k = j + byteCount[i];
        byteCount[i] = j;
        j = k;
      }
      for (i = 0; i < dbufCount; i++) {
        uc = dbuf[i] & 255;
        dbuf[byteCount[uc]] |= i << 8;
        byteCount[uc]++;
      }
      var pos = 0, current = 0, run = 0;
      if (dbufCount) {
        pos = dbuf[origPointer];
        current = pos & 255;
        pos >>= 8;
        run = -1;
      }
      this.writePos = pos;
      this.writeCurrent = current;
      this.writeCount = dbufCount;
      this.writeRun = run;
      return true;
    };
    Bunzip.prototype._read_bunzip = function(outputBuffer, len) {
      var copies, previous, outbyte;
      if (this.writeCount < 0) {
        return 0;
      }
      var gotcount = 0;
      var dbuf = this.dbuf, pos = this.writePos, current = this.writeCurrent;
      var dbufCount = this.writeCount, outputsize = this.outputsize;
      var run = this.writeRun;
      while (dbufCount) {
        dbufCount--;
        previous = current;
        pos = dbuf[pos];
        current = pos & 255;
        pos >>= 8;
        if (run++ === 3) {
          copies = current;
          outbyte = previous;
          current = -1;
        } else {
          copies = 1;
          outbyte = current;
        }
        this.blockCRC.updateCRCRun(outbyte, copies);
        while (copies--) {
          this.outputStream.writeByte(outbyte);
          this.nextoutput++;
        }
        if (current != previous)
          run = 0;
      }
      this.writeCount = dbufCount;
      if (this.blockCRC.getCRC() !== this.targetBlockCRC) {
        _throw(Err.DATA_ERROR, "Bad block CRC (got " + this.blockCRC.getCRC().toString(16) + " expected " + this.targetBlockCRC.toString(16) + ")");
      }
      return this.nextoutput;
    };
    var coerceInputStream = function(input) {
      if ("readByte" in input) {
        return input;
      }
      var inputStream = new Stream();
      inputStream.pos = 0;
      inputStream.readByte = function() {
        return input[this.pos++];
      };
      inputStream.seek = function(pos) {
        this.pos = pos;
      };
      inputStream.eof = function() {
        return this.pos >= input.length;
      };
      return inputStream;
    };
    var coerceOutputStream = function(output) {
      var outputStream = new Stream();
      var resizeOk = true;
      if (output) {
        if (typeof output === "number") {
          outputStream.buffer = new Buffer(output);
          resizeOk = false;
        } else if ("writeByte" in output) {
          return output;
        } else {
          outputStream.buffer = output;
          resizeOk = false;
        }
      } else {
        outputStream.buffer = new Buffer(16384);
      }
      outputStream.pos = 0;
      outputStream.writeByte = function(_byte) {
        if (resizeOk && this.pos >= this.buffer.length) {
          var newBuffer = new Buffer(this.buffer.length * 2);
          this.buffer.copy(newBuffer);
          this.buffer = newBuffer;
        }
        this.buffer[this.pos++] = _byte;
      };
      outputStream.getBuffer = function() {
        if (this.pos !== this.buffer.length) {
          if (!resizeOk)
            throw new TypeError("outputsize does not match decoded input");
          var newBuffer = new Buffer(this.pos);
          this.buffer.copy(newBuffer, 0, 0, this.pos);
          this.buffer = newBuffer;
        }
        return this.buffer;
      };
      outputStream._coerced = true;
      return outputStream;
    };
    Bunzip.Err = Err;
    Bunzip.decode = function(input, output, multistream) {
      var inputStream = coerceInputStream(input);
      var outputStream = coerceOutputStream(output);
      var bz = new Bunzip(inputStream, outputStream);
      while (true) {
        if ("eof" in inputStream && inputStream.eof())
          break;
        if (bz._init_block()) {
          bz._read_bunzip();
        } else {
          var targetStreamCRC = bz.reader.read(32) >>> 0;
          if (targetStreamCRC !== bz.streamCRC) {
            _throw(Err.DATA_ERROR, "Bad stream CRC (got " + bz.streamCRC.toString(16) + " expected " + targetStreamCRC.toString(16) + ")");
          }
          if (multistream && "eof" in inputStream && !inputStream.eof()) {
            bz._start_bunzip(inputStream, outputStream);
          } else
            break;
        }
      }
      if ("getBuffer" in outputStream)
        return outputStream.getBuffer();
    };
    Bunzip.decodeBlock = function(input, pos, output) {
      var inputStream = coerceInputStream(input);
      var outputStream = coerceOutputStream(output);
      var bz = new Bunzip(inputStream, outputStream);
      bz.reader.seek(pos);
      var moreBlocks = bz._get_next_block();
      if (moreBlocks) {
        bz.blockCRC = new CRC32();
        bz.writeCopies = 0;
        bz._read_bunzip();
      }
      if ("getBuffer" in outputStream)
        return outputStream.getBuffer();
    };
    Bunzip.table = function(input, callback, multistream) {
      var inputStream = new Stream();
      inputStream.delegate = coerceInputStream(input);
      inputStream.pos = 0;
      inputStream.readByte = function() {
        this.pos++;
        return this.delegate.readByte();
      };
      if (inputStream.delegate.eof) {
        inputStream.eof = inputStream.delegate.eof.bind(inputStream.delegate);
      }
      var outputStream = new Stream();
      outputStream.pos = 0;
      outputStream.writeByte = function() {
        this.pos++;
      };
      var bz = new Bunzip(inputStream, outputStream);
      var blockSize = bz.dbufSize;
      while (true) {
        if ("eof" in inputStream && inputStream.eof())
          break;
        var position = inputStream.pos * 8 + bz.reader.bitOffset;
        if (bz.reader.hasByte) {
          position -= 8;
        }
        if (bz._init_block()) {
          var start = outputStream.pos;
          bz._read_bunzip();
          callback(position, outputStream.pos - start);
        } else {
          var crc = bz.reader.read(32);
          if (multistream && "eof" in inputStream && !inputStream.eof()) {
            bz._start_bunzip(inputStream, outputStream);
            console.assert(bz.dbufSize === blockSize, "shouldn't change block size within multistream file");
          } else
            break;
        }
      }
    };
    Bunzip.Stream = Stream;
    Bunzip.version = pjson.version;
    Bunzip.license = pjson.license;
    module2.exports = Bunzip;
  }
});

// node_modules/through/index.js
var require_through = __commonJS({
  "node_modules/through/index.js"(exports2, module2) {
    var Stream = require("stream");
    exports2 = module2.exports = through;
    through.through = through;
    function through(write, end, opts) {
      write = write || function(data) {
        this.queue(data);
      };
      end = end || function() {
        this.queue(null);
      };
      var ended = false, destroyed = false, buffer = [], _ended = false;
      var stream2 = new Stream();
      stream2.readable = stream2.writable = true;
      stream2.paused = false;
      stream2.autoDestroy = !(opts && opts.autoDestroy === false);
      stream2.write = function(data) {
        write.call(this, data);
        return !stream2.paused;
      };
      function drain() {
        while (buffer.length && !stream2.paused) {
          var data = buffer.shift();
          if (data === null)
            return stream2.emit("end");
          else
            stream2.emit("data", data);
        }
      }
      stream2.queue = stream2.push = function(data) {
        if (_ended)
          return stream2;
        if (data === null)
          _ended = true;
        buffer.push(data);
        drain();
        return stream2;
      };
      stream2.on("end", function() {
        stream2.readable = false;
        if (!stream2.writable && stream2.autoDestroy)
          process.nextTick(function() {
            stream2.destroy();
          });
      });
      function _end() {
        stream2.writable = false;
        end.call(stream2);
        if (!stream2.readable && stream2.autoDestroy)
          stream2.destroy();
      }
      stream2.end = function(data) {
        if (ended)
          return;
        ended = true;
        if (arguments.length)
          stream2.write(data);
        _end();
        return stream2;
      };
      stream2.destroy = function() {
        if (destroyed)
          return;
        destroyed = true;
        ended = true;
        buffer.length = 0;
        stream2.writable = stream2.readable = false;
        stream2.emit("close");
        return stream2;
      };
      stream2.pause = function() {
        if (stream2.paused)
          return;
        stream2.paused = true;
        return stream2;
      };
      stream2.resume = function() {
        if (stream2.paused) {
          stream2.paused = false;
          stream2.emit("resume");
        }
        drain();
        if (!stream2.paused)
          stream2.emit("drain");
        return stream2;
      };
      return stream2;
    }
  }
});

// node_modules/unbzip2-stream/lib/bzip2.js
var require_bzip2 = __commonJS({
  "node_modules/unbzip2-stream/lib/bzip2.js"(exports2, module2) {
    function Bzip2Error(message2) {
      this.name = "Bzip2Error";
      this.message = message2;
      this.stack = new Error().stack;
    }
    Bzip2Error.prototype = new Error();
    var message = {
      Error: function(message2) {
        throw new Bzip2Error(message2);
      }
    };
    var bzip2 = {};
    bzip2.Bzip2Error = Bzip2Error;
    bzip2.crcTable = [
      0,
      79764919,
      159529838,
      222504665,
      319059676,
      398814059,
      445009330,
      507990021,
      638119352,
      583659535,
      797628118,
      726387553,
      890018660,
      835552979,
      1015980042,
      944750013,
      1276238704,
      1221641927,
      1167319070,
      1095957929,
      1595256236,
      1540665371,
      1452775106,
      1381403509,
      1780037320,
      1859660671,
      1671105958,
      1733955601,
      2031960084,
      2111593891,
      1889500026,
      1952343757,
      2552477408,
      2632100695,
      2443283854,
      2506133561,
      2334638140,
      2414271883,
      2191915858,
      2254759653,
      3190512472,
      3135915759,
      3081330742,
      3009969537,
      2905550212,
      2850959411,
      2762807018,
      2691435357,
      3560074640,
      3505614887,
      3719321342,
      3648080713,
      3342211916,
      3287746299,
      3467911202,
      3396681109,
      4063920168,
      4143685023,
      4223187782,
      4286162673,
      3779000052,
      3858754371,
      3904687514,
      3967668269,
      881225847,
      809987520,
      1023691545,
      969234094,
      662832811,
      591600412,
      771767749,
      717299826,
      311336399,
      374308984,
      453813921,
      533576470,
      25881363,
      88864420,
      134795389,
      214552010,
      2023205639,
      2086057648,
      1897238633,
      1976864222,
      1804852699,
      1867694188,
      1645340341,
      1724971778,
      1587496639,
      1516133128,
      1461550545,
      1406951526,
      1302016099,
      1230646740,
      1142491917,
      1087903418,
      2896545431,
      2825181984,
      2770861561,
      2716262478,
      3215044683,
      3143675388,
      3055782693,
      3001194130,
      2326604591,
      2389456536,
      2200899649,
      2280525302,
      2578013683,
      2640855108,
      2418763421,
      2498394922,
      3769900519,
      3832873040,
      3912640137,
      3992402750,
      4088425275,
      4151408268,
      4197601365,
      4277358050,
      3334271071,
      3263032808,
      3476998961,
      3422541446,
      3585640067,
      3514407732,
      3694837229,
      3640369242,
      1762451694,
      1842216281,
      1619975040,
      1682949687,
      2047383090,
      2127137669,
      1938468188,
      2001449195,
      1325665622,
      1271206113,
      1183200824,
      1111960463,
      1543535498,
      1489069629,
      1434599652,
      1363369299,
      622672798,
      568075817,
      748617968,
      677256519,
      907627842,
      853037301,
      1067152940,
      995781531,
      51762726,
      131386257,
      177728840,
      240578815,
      269590778,
      349224269,
      429104020,
      491947555,
      4046411278,
      4126034873,
      4172115296,
      4234965207,
      3794477266,
      3874110821,
      3953728444,
      4016571915,
      3609705398,
      3555108353,
      3735388376,
      3664026991,
      3290680682,
      3236090077,
      3449943556,
      3378572211,
      3174993278,
      3120533705,
      3032266256,
      2961025959,
      2923101090,
      2868635157,
      2813903052,
      2742672763,
      2604032198,
      2683796849,
      2461293480,
      2524268063,
      2284983834,
      2364738477,
      2175806836,
      2238787779,
      1569362073,
      1498123566,
      1409854455,
      1355396672,
      1317987909,
      1246755826,
      1192025387,
      1137557660,
      2072149281,
      2135122070,
      1912620623,
      1992383480,
      1753615357,
      1816598090,
      1627664531,
      1707420964,
      295390185,
      358241886,
      404320391,
      483945776,
      43990325,
      106832002,
      186451547,
      266083308,
      932423249,
      861060070,
      1041341759,
      986742920,
      613929101,
      542559546,
      756411363,
      701822548,
      3316196985,
      3244833742,
      3425377559,
      3370778784,
      3601682597,
      3530312978,
      3744426955,
      3689838204,
      3819031489,
      3881883254,
      3928223919,
      4007849240,
      4037393693,
      4100235434,
      4180117107,
      4259748804,
      2310601993,
      2373574846,
      2151335527,
      2231098320,
      2596047829,
      2659030626,
      2470359227,
      2550115596,
      2947551409,
      2876312838,
      2788305887,
      2733848168,
      3165939309,
      3094707162,
      3040238851,
      2985771188
    ];
    bzip2.array = function(bytes) {
      var bit = 0, byte = 0;
      var BITMASK = [0, 1, 3, 7, 15, 31, 63, 127, 255];
      return function(n) {
        var result = 0;
        while (n > 0) {
          var left = 8 - bit;
          if (n >= left) {
            result <<= left;
            result |= BITMASK[left] & bytes[byte++];
            bit = 0;
            n -= left;
          } else {
            result <<= n;
            result |= (bytes[byte] & BITMASK[n] << 8 - n - bit) >> 8 - n - bit;
            bit += n;
            n = 0;
          }
        }
        return result;
      };
    };
    bzip2.simple = function(srcbuffer, stream2) {
      var bits = bzip2.array(srcbuffer);
      var size = bzip2.header(bits);
      var ret = false;
      var bufsize = 1e5 * size;
      var buf = new Int32Array(bufsize);
      do {
        ret = bzip2.decompress(bits, stream2, buf, bufsize);
      } while (!ret);
    };
    bzip2.header = function(bits) {
      this.byteCount = new Int32Array(256);
      this.symToByte = new Uint8Array(256);
      this.mtfSymbol = new Int32Array(256);
      this.selectors = new Uint8Array(32768);
      if (bits(8 * 3) != 4348520)
        message.Error("No magic number found");
      var i = bits(8) - 48;
      if (i < 1 || i > 9)
        message.Error("Not a BZIP archive");
      return i;
    };
    bzip2.decompress = function(bits, stream2, buf, bufsize, streamCRC) {
      var MAX_HUFCODE_BITS = 20;
      var MAX_SYMBOLS = 258;
      var SYMBOL_RUNA = 0;
      var SYMBOL_RUNB = 1;
      var GROUP_SIZE = 50;
      var crc = 0 ^ -1;
      for (var h = "", i = 0; i < 6; i++)
        h += bits(8).toString(16);
      if (h == "177245385090") {
        var finalCRC = bits(32) | 0;
        if (finalCRC !== streamCRC)
          message.Error("Error in bzip2: crc32 do not match");
        bits(null);
        return null;
      }
      if (h != "314159265359")
        message.Error("eek not valid bzip data");
      var crcblock = bits(32) | 0;
      if (bits(1))
        message.Error("unsupported obsolete version");
      var origPtr = bits(24);
      if (origPtr > bufsize)
        message.Error("Initial position larger than buffer size");
      var t = bits(16);
      var symTotal = 0;
      for (i = 0; i < 16; i++) {
        if (t & 1 << 15 - i) {
          var k = bits(16);
          for (j = 0; j < 16; j++) {
            if (k & 1 << 15 - j) {
              this.symToByte[symTotal++] = 16 * i + j;
            }
          }
        }
      }
      var groupCount = bits(3);
      if (groupCount < 2 || groupCount > 6)
        message.Error("another error");
      var nSelectors = bits(15);
      if (nSelectors == 0)
        message.Error("meh");
      for (var i = 0; i < groupCount; i++)
        this.mtfSymbol[i] = i;
      for (var i = 0; i < nSelectors; i++) {
        for (var j = 0; bits(1); j++)
          if (j >= groupCount)
            message.Error("whoops another error");
        var uc = this.mtfSymbol[j];
        for (var k = j - 1; k >= 0; k--) {
          this.mtfSymbol[k + 1] = this.mtfSymbol[k];
        }
        this.mtfSymbol[0] = uc;
        this.selectors[i] = uc;
      }
      var symCount = symTotal + 2;
      var groups = [];
      var length = new Uint8Array(MAX_SYMBOLS), temp = new Uint16Array(MAX_HUFCODE_BITS + 1);
      var hufGroup;
      for (var j = 0; j < groupCount; j++) {
        t = bits(5);
        for (var i = 0; i < symCount; i++) {
          while (true) {
            if (t < 1 || t > MAX_HUFCODE_BITS)
              message.Error("I gave up a while ago on writing error messages");
            if (!bits(1))
              break;
            if (!bits(1))
              t++;
            else
              t--;
          }
          length[i] = t;
        }
        var minLen, maxLen;
        minLen = maxLen = length[0];
        for (var i = 1; i < symCount; i++) {
          if (length[i] > maxLen)
            maxLen = length[i];
          else if (length[i] < minLen)
            minLen = length[i];
        }
        hufGroup = groups[j] = {};
        hufGroup.permute = new Int32Array(MAX_SYMBOLS);
        hufGroup.limit = new Int32Array(MAX_HUFCODE_BITS + 1);
        hufGroup.base = new Int32Array(MAX_HUFCODE_BITS + 1);
        hufGroup.minLen = minLen;
        hufGroup.maxLen = maxLen;
        var base = hufGroup.base;
        var limit = hufGroup.limit;
        var pp = 0;
        for (var i = minLen; i <= maxLen; i++)
          for (var t = 0; t < symCount; t++)
            if (length[t] == i)
              hufGroup.permute[pp++] = t;
        for (i = minLen; i <= maxLen; i++)
          temp[i] = limit[i] = 0;
        for (i = 0; i < symCount; i++)
          temp[length[i]]++;
        pp = t = 0;
        for (i = minLen; i < maxLen; i++) {
          pp += temp[i];
          limit[i] = pp - 1;
          pp <<= 1;
          base[i + 1] = pp - (t += temp[i]);
        }
        limit[maxLen] = pp + temp[maxLen] - 1;
        base[minLen] = 0;
      }
      for (var i = 0; i < 256; i++) {
        this.mtfSymbol[i] = i;
        this.byteCount[i] = 0;
      }
      var runPos, count, symCount, selector;
      runPos = count = symCount = selector = 0;
      while (true) {
        if (!symCount--) {
          symCount = GROUP_SIZE - 1;
          if (selector >= nSelectors)
            message.Error("meow i'm a kitty, that's an error");
          hufGroup = groups[this.selectors[selector++]];
          base = hufGroup.base;
          limit = hufGroup.limit;
        }
        i = hufGroup.minLen;
        j = bits(i);
        while (true) {
          if (i > hufGroup.maxLen)
            message.Error("rawr i'm a dinosaur");
          if (j <= limit[i])
            break;
          i++;
          j = j << 1 | bits(1);
        }
        j -= base[i];
        if (j < 0 || j >= MAX_SYMBOLS)
          message.Error("moo i'm a cow");
        var nextSym = hufGroup.permute[j];
        if (nextSym == SYMBOL_RUNA || nextSym == SYMBOL_RUNB) {
          if (!runPos) {
            runPos = 1;
            t = 0;
          }
          if (nextSym == SYMBOL_RUNA)
            t += runPos;
          else
            t += 2 * runPos;
          runPos <<= 1;
          continue;
        }
        if (runPos) {
          runPos = 0;
          if (count + t > bufsize)
            message.Error("Boom.");
          uc = this.symToByte[this.mtfSymbol[0]];
          this.byteCount[uc] += t;
          while (t--)
            buf[count++] = uc;
        }
        if (nextSym > symTotal)
          break;
        if (count >= bufsize)
          message.Error("I can't think of anything. Error");
        i = nextSym - 1;
        uc = this.mtfSymbol[i];
        for (var k = i - 1; k >= 0; k--) {
          this.mtfSymbol[k + 1] = this.mtfSymbol[k];
        }
        this.mtfSymbol[0] = uc;
        uc = this.symToByte[uc];
        this.byteCount[uc]++;
        buf[count++] = uc;
      }
      if (origPtr < 0 || origPtr >= count)
        message.Error("I'm a monkey and I'm throwing something at someone, namely you");
      var j = 0;
      for (var i = 0; i < 256; i++) {
        k = j + this.byteCount[i];
        this.byteCount[i] = j;
        j = k;
      }
      for (var i = 0; i < count; i++) {
        uc = buf[i] & 255;
        buf[this.byteCount[uc]] |= i << 8;
        this.byteCount[uc]++;
      }
      var pos = 0, current = 0, run = 0;
      if (count) {
        pos = buf[origPtr];
        current = pos & 255;
        pos >>= 8;
        run = -1;
      }
      count = count;
      var copies, previous, outbyte;
      while (count) {
        count--;
        previous = current;
        pos = buf[pos];
        current = pos & 255;
        pos >>= 8;
        if (run++ == 3) {
          copies = current;
          outbyte = previous;
          current = -1;
        } else {
          copies = 1;
          outbyte = current;
        }
        while (copies--) {
          crc = (crc << 8 ^ this.crcTable[(crc >> 24 ^ outbyte) & 255]) & 4294967295;
          stream2(outbyte);
        }
        if (current != previous)
          run = 0;
      }
      crc = (crc ^ -1) >>> 0;
      if ((crc | 0) != (crcblock | 0))
        message.Error("Error in bzip2: crc32 do not match");
      streamCRC = (crc ^ (streamCRC << 1 | streamCRC >>> 31)) & 4294967295;
      return streamCRC;
    };
    module2.exports = bzip2;
  }
});

// node_modules/unbzip2-stream/lib/bit_iterator.js
var require_bit_iterator = __commonJS({
  "node_modules/unbzip2-stream/lib/bit_iterator.js"(exports2, module2) {
    var BITMASK = [0, 1, 3, 7, 15, 31, 63, 127, 255];
    module2.exports = function bitIterator(nextBuffer) {
      var bit = 0, byte = 0;
      var bytes = nextBuffer();
      var f = function(n) {
        if (n === null && bit != 0) {
          bit = 0;
          byte++;
          return;
        }
        var result = 0;
        while (n > 0) {
          if (byte >= bytes.length) {
            byte = 0;
            bytes = nextBuffer();
          }
          var left = 8 - bit;
          if (bit === 0 && n > 0)
            f.bytesRead++;
          if (n >= left) {
            result <<= left;
            result |= BITMASK[left] & bytes[byte++];
            bit = 0;
            n -= left;
          } else {
            result <<= n;
            result |= (bytes[byte] & BITMASK[n] << 8 - n - bit) >> 8 - n - bit;
            bit += n;
            n = 0;
          }
        }
        return result;
      };
      f.bytesRead = 0;
      return f;
    };
  }
});

// node_modules/unbzip2-stream/index.js
var require_unbzip2_stream = __commonJS({
  "node_modules/unbzip2-stream/index.js"(exports2, module2) {
    var through = require_through();
    var bz2 = require_bzip2();
    var bitIterator = require_bit_iterator();
    module2.exports = unbzip2Stream;
    function unbzip2Stream() {
      var bufferQueue = [];
      var hasBytes = 0;
      var blockSize = 0;
      var broken = false;
      var done = false;
      var bitReader = null;
      var streamCRC = null;
      function decompressBlock(push) {
        if (!blockSize) {
          blockSize = bz2.header(bitReader);
          streamCRC = 0;
          return true;
        } else {
          var bufsize = 1e5 * blockSize;
          var buf = new Int32Array(bufsize);
          var chunk = [];
          var f = function(b) {
            chunk.push(b);
          };
          streamCRC = bz2.decompress(bitReader, f, buf, bufsize, streamCRC);
          if (streamCRC === null) {
            blockSize = 0;
            return false;
          } else {
            push(Buffer.from(chunk));
            return true;
          }
        }
      }
      var outlength = 0;
      function decompressAndQueue(stream2) {
        if (broken)
          return;
        try {
          return decompressBlock(function(d) {
            stream2.queue(d);
            if (d !== null) {
              outlength += d.length;
            } else {
            }
          });
        } catch (e) {
          stream2.emit("error", e);
          broken = true;
          return false;
        }
      }
      return through(function write(data) {
        bufferQueue.push(data);
        hasBytes += data.length;
        if (bitReader === null) {
          bitReader = bitIterator(function() {
            return bufferQueue.shift();
          });
        }
        while (!broken && hasBytes - bitReader.bytesRead + 1 >= (25e3 + 1e5 * blockSize || 4)) {
          decompressAndQueue(this);
        }
      }, function end(x) {
        while (!broken && bitReader && hasBytes > bitReader.bytesRead) {
          decompressAndQueue(this);
        }
        if (!broken) {
          if (streamCRC !== null)
            this.emit("error", new Error("input stream ended prematurely"));
          this.queue(null);
        }
      });
    }
  }
});

// node_modules/decompress-tarbz2/index.js
var require_decompress_tarbz2 = __commonJS({
  "node_modules/decompress-tarbz2/index.js"(exports2, module2) {
    "use strict";
    var decompressTar = require_decompress_tar();
    var fileType2 = require_file_type3();
    var isStream = require_is_stream();
    var seekBzip = require_lib();
    var unbzip2Stream = require_unbzip2_stream();
    module2.exports = () => (input) => {
      if (!Buffer.isBuffer(input) && !isStream(input)) {
        return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
      }
      if (Buffer.isBuffer(input) && (!fileType2(input) || fileType2(input).ext !== "bz2")) {
        return Promise.resolve([]);
      }
      if (Buffer.isBuffer(input)) {
        return decompressTar()(seekBzip.decode(input));
      }
      return decompressTar()(input.pipe(unbzip2Stream()));
    };
  }
});

// node_modules/decompress-targz/index.js
var require_decompress_targz = __commonJS({
  "node_modules/decompress-targz/index.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var decompressTar = require_decompress_tar();
    var fileType2 = require_file_type2();
    var isStream = require_is_stream();
    module2.exports = () => (input) => {
      if (!Buffer.isBuffer(input) && !isStream(input)) {
        return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
      }
      if (Buffer.isBuffer(input) && (!fileType2(input) || fileType2(input).ext !== "gz")) {
        return Promise.resolve([]);
      }
      const unzip = zlib.createGunzip();
      const result = decompressTar()(unzip);
      if (Buffer.isBuffer(input)) {
        unzip.end(input);
      } else {
        input.pipe(unzip);
      }
      return result;
    };
  }
});

// node_modules/decompress-unzip/node_modules/file-type/index.js
var require_file_type4 = __commonJS({
  "node_modules/decompress-unzip/node_modules/file-type/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(buf) {
      if (!(buf && buf.length > 1)) {
        return null;
      }
      if (buf[0] === 255 && buf[1] === 216 && buf[2] === 255) {
        return {
          ext: "jpg",
          mime: "image/jpeg"
        };
      }
      if (buf[0] === 137 && buf[1] === 80 && buf[2] === 78 && buf[3] === 71) {
        return {
          ext: "png",
          mime: "image/png"
        };
      }
      if (buf[0] === 71 && buf[1] === 73 && buf[2] === 70) {
        return {
          ext: "gif",
          mime: "image/gif"
        };
      }
      if (buf[8] === 87 && buf[9] === 69 && buf[10] === 66 && buf[11] === 80) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (buf[0] === 70 && buf[1] === 76 && buf[2] === 73 && buf[3] === 70) {
        return {
          ext: "flif",
          mime: "image/flif"
        };
      }
      if ((buf[0] === 73 && buf[1] === 73 && buf[2] === 42 && buf[3] === 0 || buf[0] === 77 && buf[1] === 77 && buf[2] === 0 && buf[3] === 42) && buf[8] === 67 && buf[9] === 82) {
        return {
          ext: "cr2",
          mime: "image/x-canon-cr2"
        };
      }
      if (buf[0] === 73 && buf[1] === 73 && buf[2] === 42 && buf[3] === 0 || buf[0] === 77 && buf[1] === 77 && buf[2] === 0 && buf[3] === 42) {
        return {
          ext: "tif",
          mime: "image/tiff"
        };
      }
      if (buf[0] === 66 && buf[1] === 77) {
        return {
          ext: "bmp",
          mime: "image/bmp"
        };
      }
      if (buf[0] === 73 && buf[1] === 73 && buf[2] === 188) {
        return {
          ext: "jxr",
          mime: "image/vnd.ms-photo"
        };
      }
      if (buf[0] === 56 && buf[1] === 66 && buf[2] === 80 && buf[3] === 83) {
        return {
          ext: "psd",
          mime: "image/vnd.adobe.photoshop"
        };
      }
      if (buf[0] === 80 && buf[1] === 75 && buf[2] === 3 && buf[3] === 4 && buf[30] === 109 && buf[31] === 105 && buf[32] === 109 && buf[33] === 101 && buf[34] === 116 && buf[35] === 121 && buf[36] === 112 && buf[37] === 101 && buf[38] === 97 && buf[39] === 112 && buf[40] === 112 && buf[41] === 108 && buf[42] === 105 && buf[43] === 99 && buf[44] === 97 && buf[45] === 116 && buf[46] === 105 && buf[47] === 111 && buf[48] === 110 && buf[49] === 47 && buf[50] === 101 && buf[51] === 112 && buf[52] === 117 && buf[53] === 98 && buf[54] === 43 && buf[55] === 122 && buf[56] === 105 && buf[57] === 112) {
        return {
          ext: "epub",
          mime: "application/epub+zip"
        };
      }
      if (buf[0] === 80 && buf[1] === 75 && buf[2] === 3 && buf[3] === 4 && buf[30] === 77 && buf[31] === 69 && buf[32] === 84 && buf[33] === 65 && buf[34] === 45 && buf[35] === 73 && buf[36] === 78 && buf[37] === 70 && buf[38] === 47 && buf[39] === 109 && buf[40] === 111 && buf[41] === 122 && buf[42] === 105 && buf[43] === 108 && buf[44] === 108 && buf[45] === 97 && buf[46] === 46 && buf[47] === 114 && buf[48] === 115 && buf[49] === 97) {
        return {
          ext: "xpi",
          mime: "application/x-xpinstall"
        };
      }
      if (buf[0] === 80 && buf[1] === 75 && (buf[2] === 3 || buf[2] === 5 || buf[2] === 7) && (buf[3] === 4 || buf[3] === 6 || buf[3] === 8)) {
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (buf[257] === 117 && buf[258] === 115 && buf[259] === 116 && buf[260] === 97 && buf[261] === 114) {
        return {
          ext: "tar",
          mime: "application/x-tar"
        };
      }
      if (buf[0] === 82 && buf[1] === 97 && buf[2] === 114 && buf[3] === 33 && buf[4] === 26 && buf[5] === 7 && (buf[6] === 0 || buf[6] === 1)) {
        return {
          ext: "rar",
          mime: "application/x-rar-compressed"
        };
      }
      if (buf[0] === 31 && buf[1] === 139 && buf[2] === 8) {
        return {
          ext: "gz",
          mime: "application/gzip"
        };
      }
      if (buf[0] === 66 && buf[1] === 90 && buf[2] === 104) {
        return {
          ext: "bz2",
          mime: "application/x-bzip2"
        };
      }
      if (buf[0] === 55 && buf[1] === 122 && buf[2] === 188 && buf[3] === 175 && buf[4] === 39 && buf[5] === 28) {
        return {
          ext: "7z",
          mime: "application/x-7z-compressed"
        };
      }
      if (buf[0] === 120 && buf[1] === 1) {
        return {
          ext: "dmg",
          mime: "application/x-apple-diskimage"
        };
      }
      if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && (buf[3] === 24 || buf[3] === 32) && buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112 || buf[0] === 51 && buf[1] === 103 && buf[2] === 112 && buf[3] === 53 || buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && buf[3] === 28 && buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112 && buf[8] === 109 && buf[9] === 112 && buf[10] === 52 && buf[11] === 50 && buf[16] === 109 && buf[17] === 112 && buf[18] === 52 && buf[19] === 49 && buf[20] === 109 && buf[21] === 112 && buf[22] === 52 && buf[23] === 50 && buf[24] === 105 && buf[25] === 115 && buf[26] === 111 && buf[27] === 109 || buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && buf[3] === 28 && buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112 && buf[8] === 105 && buf[9] === 115 && buf[10] === 111 && buf[11] === 109 || buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && buf[3] === 28 && buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112 && buf[8] === 109 && buf[9] === 112 && buf[10] === 52 && buf[11] === 50 && buf[12] === 0 && buf[13] === 0 && buf[14] === 0 && buf[15] === 0) {
        return {
          ext: "mp4",
          mime: "video/mp4"
        };
      }
      if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && buf[3] === 28 && buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112 && buf[8] === 77 && buf[9] === 52 && buf[10] === 86) {
        return {
          ext: "m4v",
          mime: "video/x-m4v"
        };
      }
      if (buf[0] === 77 && buf[1] === 84 && buf[2] === 104 && buf[3] === 100) {
        return {
          ext: "mid",
          mime: "audio/midi"
        };
      }
      if (buf[31] === 109 && buf[32] === 97 && buf[33] === 116 && buf[34] === 114 && buf[35] === 111 && buf[36] === 115 && buf[37] === 107 && buf[38] === 97) {
        return {
          ext: "mkv",
          mime: "video/x-matroska"
        };
      }
      if (buf[0] === 26 && buf[1] === 69 && buf[2] === 223 && buf[3] === 163) {
        return {
          ext: "webm",
          mime: "video/webm"
        };
      }
      if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && buf[3] === 20 && buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112) {
        return {
          ext: "mov",
          mime: "video/quicktime"
        };
      }
      if (buf[0] === 82 && buf[1] === 73 && buf[2] === 70 && buf[3] === 70 && buf[8] === 65 && buf[9] === 86 && buf[10] === 73) {
        return {
          ext: "avi",
          mime: "video/x-msvideo"
        };
      }
      if (buf[0] === 48 && buf[1] === 38 && buf[2] === 178 && buf[3] === 117 && buf[4] === 142 && buf[5] === 102 && buf[6] === 207 && buf[7] === 17 && buf[8] === 166 && buf[9] === 217) {
        return {
          ext: "wmv",
          mime: "video/x-ms-wmv"
        };
      }
      if (buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3].toString(16)[0] === "b") {
        return {
          ext: "mpg",
          mime: "video/mpeg"
        };
      }
      if (buf[0] === 73 && buf[1] === 68 && buf[2] === 51 || buf[0] === 255 && buf[1] === 251) {
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      if (buf[4] === 102 && buf[5] === 116 && buf[6] === 121 && buf[7] === 112 && buf[8] === 77 && buf[9] === 52 && buf[10] === 65 || buf[0] === 77 && buf[1] === 52 && buf[2] === 65 && buf[3] === 32) {
        return {
          ext: "m4a",
          mime: "audio/m4a"
        };
      }
      if (buf[28] === 79 && buf[29] === 112 && buf[30] === 117 && buf[31] === 115 && buf[32] === 72 && buf[33] === 101 && buf[34] === 97 && buf[35] === 100) {
        return {
          ext: "opus",
          mime: "audio/opus"
        };
      }
      if (buf[0] === 79 && buf[1] === 103 && buf[2] === 103 && buf[3] === 83) {
        return {
          ext: "ogg",
          mime: "audio/ogg"
        };
      }
      if (buf[0] === 102 && buf[1] === 76 && buf[2] === 97 && buf[3] === 67) {
        return {
          ext: "flac",
          mime: "audio/x-flac"
        };
      }
      if (buf[0] === 82 && buf[1] === 73 && buf[2] === 70 && buf[3] === 70 && buf[8] === 87 && buf[9] === 65 && buf[10] === 86 && buf[11] === 69) {
        return {
          ext: "wav",
          mime: "audio/x-wav"
        };
      }
      if (buf[0] === 35 && buf[1] === 33 && buf[2] === 65 && buf[3] === 77 && buf[4] === 82 && buf[5] === 10) {
        return {
          ext: "amr",
          mime: "audio/amr"
        };
      }
      if (buf[0] === 37 && buf[1] === 80 && buf[2] === 68 && buf[3] === 70) {
        return {
          ext: "pdf",
          mime: "application/pdf"
        };
      }
      if (buf[0] === 77 && buf[1] === 90) {
        return {
          ext: "exe",
          mime: "application/x-msdownload"
        };
      }
      if ((buf[0] === 67 || buf[0] === 70) && buf[1] === 87 && buf[2] === 83) {
        return {
          ext: "swf",
          mime: "application/x-shockwave-flash"
        };
      }
      if (buf[0] === 123 && buf[1] === 92 && buf[2] === 114 && buf[3] === 116 && buf[4] === 102) {
        return {
          ext: "rtf",
          mime: "application/rtf"
        };
      }
      if (buf[0] === 119 && buf[1] === 79 && buf[2] === 70 && buf[3] === 70 && (buf[4] === 0 && buf[5] === 1 && buf[6] === 0 && buf[7] === 0 || buf[4] === 79 && buf[5] === 84 && buf[6] === 84 && buf[7] === 79)) {
        return {
          ext: "woff",
          mime: "application/font-woff"
        };
      }
      if (buf[0] === 119 && buf[1] === 79 && buf[2] === 70 && buf[3] === 50 && (buf[4] === 0 && buf[5] === 1 && buf[6] === 0 && buf[7] === 0 || buf[4] === 79 && buf[5] === 84 && buf[6] === 84 && buf[7] === 79)) {
        return {
          ext: "woff2",
          mime: "application/font-woff"
        };
      }
      if (buf[34] === 76 && buf[35] === 80 && (buf[8] === 0 && buf[9] === 0 && buf[10] === 1 || buf[8] === 1 && buf[9] === 0 && buf[10] === 2 || buf[8] === 2 && buf[9] === 0 && buf[10] === 2)) {
        return {
          ext: "eot",
          mime: "application/octet-stream"
        };
      }
      if (buf[0] === 0 && buf[1] === 1 && buf[2] === 0 && buf[3] === 0 && buf[4] === 0) {
        return {
          ext: "ttf",
          mime: "application/font-sfnt"
        };
      }
      if (buf[0] === 79 && buf[1] === 84 && buf[2] === 84 && buf[3] === 79 && buf[4] === 0) {
        return {
          ext: "otf",
          mime: "application/font-sfnt"
        };
      }
      if (buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0) {
        return {
          ext: "ico",
          mime: "image/x-icon"
        };
      }
      if (buf[0] === 70 && buf[1] === 76 && buf[2] === 86 && buf[3] === 1) {
        return {
          ext: "flv",
          mime: "video/x-flv"
        };
      }
      if (buf[0] === 37 && buf[1] === 33) {
        return {
          ext: "ps",
          mime: "application/postscript"
        };
      }
      if (buf[0] === 253 && buf[1] === 55 && buf[2] === 122 && buf[3] === 88 && buf[4] === 90 && buf[5] === 0) {
        return {
          ext: "xz",
          mime: "application/x-xz"
        };
      }
      if (buf[0] === 83 && buf[1] === 81 && buf[2] === 76 && buf[3] === 105) {
        return {
          ext: "sqlite",
          mime: "application/x-sqlite3"
        };
      }
      if (buf[0] === 78 && buf[1] === 69 && buf[2] === 83 && buf[3] === 26) {
        return {
          ext: "nes",
          mime: "application/x-nintendo-nes-rom"
        };
      }
      if (buf[0] === 67 && buf[1] === 114 && buf[2] === 50 && buf[3] === 52) {
        return {
          ext: "crx",
          mime: "application/x-google-chrome-extension"
        };
      }
      if (buf[0] === 77 && buf[1] === 83 && buf[2] === 67 && buf[3] === 70 || buf[0] === 73 && buf[1] === 83 && buf[2] === 99 && buf[3] === 40) {
        return {
          ext: "cab",
          mime: "application/vnd.ms-cab-compressed"
        };
      }
      if (buf[0] === 33 && buf[1] === 60 && buf[2] === 97 && buf[3] === 114 && buf[4] === 99 && buf[5] === 104 && buf[6] === 62 && buf[7] === 10 && buf[8] === 100 && buf[9] === 101 && buf[10] === 98 && buf[11] === 105 && buf[12] === 97 && buf[13] === 110 && buf[14] === 45 && buf[15] === 98 && buf[16] === 105 && buf[17] === 110 && buf[18] === 97 && buf[19] === 114 && buf[20] === 121) {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      if (buf[0] === 33 && buf[1] === 60 && buf[2] === 97 && buf[3] === 114 && buf[4] === 99 && buf[5] === 104 && buf[6] === 62) {
        return {
          ext: "ar",
          mime: "application/x-unix-archive"
        };
      }
      if (buf[0] === 237 && buf[1] === 171 && buf[2] === 238 && buf[3] === 219) {
        return {
          ext: "rpm",
          mime: "application/x-rpm"
        };
      }
      if (buf[0] === 31 && buf[1] === 160 || buf[0] === 31 && buf[1] === 157) {
        return {
          ext: "Z",
          mime: "application/x-compress"
        };
      }
      if (buf[0] === 76 && buf[1] === 90 && buf[2] === 73 && buf[3] === 80) {
        return {
          ext: "lz",
          mime: "application/x-lzip"
        };
      }
      if (buf[0] === 208 && buf[1] === 207 && buf[2] === 17 && buf[3] === 224 && buf[4] === 161 && buf[5] === 177 && buf[6] === 26 && buf[7] === 225) {
        return {
          ext: "msi",
          mime: "application/x-msi"
        };
      }
      return null;
    };
  }
});

// node_modules/pinkie/index.js
var require_pinkie = __commonJS({
  "node_modules/pinkie/index.js"(exports2, module2) {
    "use strict";
    var PENDING = "pending";
    var SETTLED = "settled";
    var FULFILLED = "fulfilled";
    var REJECTED = "rejected";
    var NOOP = function() {
    };
    var isNode = typeof global !== "undefined" && typeof global.process !== "undefined" && typeof global.process.emit === "function";
    var asyncSetTimer = typeof setImmediate === "undefined" ? setTimeout : setImmediate;
    var asyncQueue = [];
    var asyncTimer;
    function asyncFlush() {
      for (var i = 0; i < asyncQueue.length; i++) {
        asyncQueue[i][0](asyncQueue[i][1]);
      }
      asyncQueue = [];
      asyncTimer = false;
    }
    function asyncCall(callback, arg) {
      asyncQueue.push([callback, arg]);
      if (!asyncTimer) {
        asyncTimer = true;
        asyncSetTimer(asyncFlush, 0);
      }
    }
    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve2(promise, value);
      }
      function rejectPromise(reason) {
        reject2(promise, reason);
      }
      try {
        resolver(resolvePromise, rejectPromise);
      } catch (e) {
        rejectPromise(e);
      }
    }
    function invokeCallback(subscriber) {
      var owner = subscriber.owner;
      var settled = owner._state;
      var value = owner._data;
      var callback = subscriber[settled];
      var promise = subscriber.then;
      if (typeof callback === "function") {
        settled = FULFILLED;
        try {
          value = callback(value);
        } catch (e) {
          reject2(promise, e);
        }
      }
      if (!handleThenable(promise, value)) {
        if (settled === FULFILLED) {
          resolve2(promise, value);
        }
        if (settled === REJECTED) {
          reject2(promise, value);
        }
      }
    }
    function handleThenable(promise, value) {
      var resolved;
      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }
        if (value && (typeof value === "function" || typeof value === "object")) {
          var then = value.then;
          if (typeof then === "function") {
            then.call(value, function(val) {
              if (!resolved) {
                resolved = true;
                if (value === val) {
                  fulfill(promise, val);
                } else {
                  resolve2(promise, val);
                }
              }
            }, function(reason) {
              if (!resolved) {
                resolved = true;
                reject2(promise, reason);
              }
            });
            return true;
          }
        }
      } catch (e) {
        if (!resolved) {
          reject2(promise, e);
        }
        return true;
      }
      return false;
    }
    function resolve2(promise, value) {
      if (promise === value || !handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }
    function fulfill(promise, value) {
      if (promise._state === PENDING) {
        promise._state = SETTLED;
        promise._data = value;
        asyncCall(publishFulfillment, promise);
      }
    }
    function reject2(promise, reason) {
      if (promise._state === PENDING) {
        promise._state = SETTLED;
        promise._data = reason;
        asyncCall(publishRejection, promise);
      }
    }
    function publish(promise) {
      promise._then = promise._then.forEach(invokeCallback);
    }
    function publishFulfillment(promise) {
      promise._state = FULFILLED;
      publish(promise);
    }
    function publishRejection(promise) {
      promise._state = REJECTED;
      publish(promise);
      if (!promise._handled && isNode) {
        global.process.emit("unhandledRejection", promise._data, promise);
      }
    }
    function notifyRejectionHandled(promise) {
      global.process.emit("rejectionHandled", promise);
    }
    function Promise2(resolver) {
      if (typeof resolver !== "function") {
        throw new TypeError("Promise resolver " + resolver + " is not a function");
      }
      if (this instanceof Promise2 === false) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }
      this._then = [];
      invokeResolver(resolver, this);
    }
    Promise2.prototype = {
      constructor: Promise2,
      _state: PENDING,
      _then: null,
      _data: void 0,
      _handled: false,
      then: function(onFulfillment, onRejection) {
        var subscriber = {
          owner: this,
          then: new this.constructor(NOOP),
          fulfilled: onFulfillment,
          rejected: onRejection
        };
        if ((onRejection || onFulfillment) && !this._handled) {
          this._handled = true;
          if (this._state === REJECTED && isNode) {
            asyncCall(notifyRejectionHandled, this);
          }
        }
        if (this._state === FULFILLED || this._state === REJECTED) {
          asyncCall(invokeCallback, subscriber);
        } else {
          this._then.push(subscriber);
        }
        return subscriber.then;
      },
      catch: function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    Promise2.all = function(promises) {
      if (!Array.isArray(promises)) {
        throw new TypeError("You must pass an array to Promise.all().");
      }
      return new Promise2(function(resolve3, reject3) {
        var results = [];
        var remaining = 0;
        function resolver(index) {
          remaining++;
          return function(value) {
            results[index] = value;
            if (!--remaining) {
              resolve3(results);
            }
          };
        }
        for (var i = 0, promise; i < promises.length; i++) {
          promise = promises[i];
          if (promise && typeof promise.then === "function") {
            promise.then(resolver(i), reject3);
          } else {
            results[i] = promise;
          }
        }
        if (!remaining) {
          resolve3(results);
        }
      });
    };
    Promise2.race = function(promises) {
      if (!Array.isArray(promises)) {
        throw new TypeError("You must pass an array to Promise.race().");
      }
      return new Promise2(function(resolve3, reject3) {
        for (var i = 0, promise; i < promises.length; i++) {
          promise = promises[i];
          if (promise && typeof promise.then === "function") {
            promise.then(resolve3, reject3);
          } else {
            resolve3(promise);
          }
        }
      });
    };
    Promise2.resolve = function(value) {
      if (value && typeof value === "object" && value.constructor === Promise2) {
        return value;
      }
      return new Promise2(function(resolve3) {
        resolve3(value);
      });
    };
    Promise2.reject = function(reason) {
      return new Promise2(function(resolve3, reject3) {
        reject3(reason);
      });
    };
    module2.exports = Promise2;
  }
});

// node_modules/pinkie-promise/index.js
var require_pinkie_promise = __commonJS({
  "node_modules/pinkie-promise/index.js"(exports2, module2) {
    "use strict";
    module2.exports = typeof Promise === "function" ? Promise : require_pinkie();
  }
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports2, module2) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/decompress-unzip/node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS({
  "node_modules/decompress-unzip/node_modules/get-stream/buffer-stream.js"(exports2, module2) {
    var PassThrough = require("stream").PassThrough;
    var objectAssign = require_object_assign();
    module2.exports = function(opts) {
      opts = objectAssign({}, opts);
      var array = opts.array;
      var encoding = opts.encoding;
      var buffer = encoding === "buffer";
      var objectMode = false;
      if (array) {
        objectMode = !(encoding || buffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (buffer) {
        encoding = null;
      }
      var len = 0;
      var ret = [];
      var stream2 = new PassThrough({ objectMode });
      if (encoding) {
        stream2.setEncoding(encoding);
      }
      stream2.on("data", function(chunk) {
        ret.push(chunk);
        if (objectMode) {
          len = ret.length;
        } else {
          len += chunk.length;
        }
      });
      stream2.getBufferedValue = function() {
        if (array) {
          return ret;
        }
        return buffer ? Buffer.concat(ret, len) : ret.join("");
      };
      stream2.getBufferedLength = function() {
        return len;
      };
      return stream2;
    };
  }
});

// node_modules/decompress-unzip/node_modules/get-stream/index.js
var require_get_stream = __commonJS({
  "node_modules/decompress-unzip/node_modules/get-stream/index.js"(exports2, module2) {
    "use strict";
    var Promise2 = require_pinkie_promise();
    var objectAssign = require_object_assign();
    var bufferStream = require_buffer_stream();
    function getStream(inputStream, opts) {
      if (!inputStream) {
        return Promise2.reject(new Error("Expected a stream"));
      }
      opts = objectAssign({ maxBuffer: Infinity }, opts);
      var maxBuffer = opts.maxBuffer;
      var stream2;
      var clean;
      var p = new Promise2(function(resolve2, reject2) {
        stream2 = bufferStream(opts);
        inputStream.once("error", error);
        inputStream.pipe(stream2);
        stream2.on("data", function() {
          if (stream2.getBufferedLength() > maxBuffer) {
            reject2(new Error("maxBuffer exceeded"));
          }
        });
        stream2.once("error", error);
        stream2.on("end", resolve2);
        clean = function() {
          if (inputStream.unpipe) {
            inputStream.unpipe(stream2);
          }
        };
        function error(err) {
          if (err) {
            err.bufferedData = stream2.getBufferedValue();
          }
          reject2(err);
        }
      });
      p.then(clean, clean);
      return p.then(function() {
        return stream2.getBufferedValue();
      });
    }
    module2.exports = getStream;
    module2.exports.buffer = function(stream2, opts) {
      return getStream(stream2, objectAssign({}, opts, { encoding: "buffer" }));
    };
    module2.exports.array = function(stream2, opts) {
      return getStream(stream2, objectAssign({}, opts, { array: true }));
    };
  }
});

// node_modules/pify/index.js
var require_pify = __commonJS({
  "node_modules/pify/index.js"(exports2, module2) {
    "use strict";
    var processFn = function(fn, P, opts) {
      return function() {
        var that = this;
        var args = new Array(arguments.length);
        for (var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }
        return new P(function(resolve2, reject2) {
          args.push(function(err, result) {
            if (err) {
              reject2(err);
            } else if (opts.multiArgs) {
              var results = new Array(arguments.length - 1);
              for (var i2 = 1; i2 < arguments.length; i2++) {
                results[i2 - 1] = arguments[i2];
              }
              resolve2(results);
            } else {
              resolve2(result);
            }
          });
          fn.apply(that, args);
        });
      };
    };
    var pify = module2.exports = function(obj, P, opts) {
      if (typeof P !== "function") {
        opts = P;
        P = Promise;
      }
      opts = opts || {};
      opts.exclude = opts.exclude || [/.+Sync$/];
      var filter = function(key) {
        var match = function(pattern) {
          return typeof pattern === "string" ? key === pattern : pattern.test(key);
        };
        return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
      };
      var ret = typeof obj === "function" ? function() {
        if (opts.excludeMain) {
          return obj.apply(this, arguments);
        }
        return processFn(obj, P, opts).apply(this, arguments);
      } : {};
      return Object.keys(obj).reduce(function(ret2, key) {
        var x = obj[key];
        ret2[key] = typeof x === "function" && filter(key) ? processFn(x, P, opts) : x;
        return ret2;
      }, ret);
    };
    pify.all = pify;
  }
});

// node_modules/pend/index.js
var require_pend = __commonJS({
  "node_modules/pend/index.js"(exports2, module2) {
    module2.exports = Pend;
    function Pend() {
      this.pending = 0;
      this.max = Infinity;
      this.listeners = [];
      this.waiting = [];
      this.error = null;
    }
    Pend.prototype.go = function(fn) {
      if (this.pending < this.max) {
        pendGo(this, fn);
      } else {
        this.waiting.push(fn);
      }
    };
    Pend.prototype.wait = function(cb) {
      if (this.pending === 0) {
        cb(this.error);
      } else {
        this.listeners.push(cb);
      }
    };
    Pend.prototype.hold = function() {
      return pendHold(this);
    };
    function pendHold(self) {
      self.pending += 1;
      var called = false;
      return onCb;
      function onCb(err) {
        if (called)
          throw new Error("callback called twice");
        called = true;
        self.error = self.error || err;
        self.pending -= 1;
        if (self.waiting.length > 0 && self.pending < self.max) {
          pendGo(self, self.waiting.shift());
        } else if (self.pending === 0) {
          var listeners = self.listeners;
          self.listeners = [];
          listeners.forEach(cbListener);
        }
      }
      function cbListener(listener) {
        listener(self.error);
      }
    }
    function pendGo(self, fn) {
      fn(pendHold(self));
    }
  }
});

// node_modules/fd-slicer/index.js
var require_fd_slicer = __commonJS({
  "node_modules/fd-slicer/index.js"(exports2) {
    var fs = require("fs");
    var util = require("util");
    var stream2 = require("stream");
    var Readable = stream2.Readable;
    var Writable = stream2.Writable;
    var PassThrough = stream2.PassThrough;
    var Pend = require_pend();
    var EventEmitter = require("events").EventEmitter;
    exports2.createFromBuffer = createFromBuffer;
    exports2.createFromFd = createFromFd;
    exports2.BufferSlicer = BufferSlicer;
    exports2.FdSlicer = FdSlicer;
    util.inherits(FdSlicer, EventEmitter);
    function FdSlicer(fd, options) {
      options = options || {};
      EventEmitter.call(this);
      this.fd = fd;
      this.pend = new Pend();
      this.pend.max = 1;
      this.refCount = 0;
      this.autoClose = !!options.autoClose;
    }
    FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
      var self = this;
      self.pend.go(function(cb) {
        fs.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer2) {
          cb();
          callback(err, bytesRead, buffer2);
        });
      });
    };
    FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
      var self = this;
      self.pend.go(function(cb) {
        fs.write(self.fd, buffer, offset, length, position, function(err, written, buffer2) {
          cb();
          callback(err, written, buffer2);
        });
      });
    };
    FdSlicer.prototype.createReadStream = function(options) {
      return new ReadStream(this, options);
    };
    FdSlicer.prototype.createWriteStream = function(options) {
      return new WriteStream(this, options);
    };
    FdSlicer.prototype.ref = function() {
      this.refCount += 1;
    };
    FdSlicer.prototype.unref = function() {
      var self = this;
      self.refCount -= 1;
      if (self.refCount > 0)
        return;
      if (self.refCount < 0)
        throw new Error("invalid unref");
      if (self.autoClose) {
        fs.close(self.fd, onCloseDone);
      }
      function onCloseDone(err) {
        if (err) {
          self.emit("error", err);
        } else {
          self.emit("close");
        }
      }
    };
    util.inherits(ReadStream, Readable);
    function ReadStream(context, options) {
      options = options || {};
      Readable.call(this, options);
      this.context = context;
      this.context.ref();
      this.start = options.start || 0;
      this.endOffset = options.end;
      this.pos = this.start;
      this.destroyed = false;
    }
    ReadStream.prototype._read = function(n) {
      var self = this;
      if (self.destroyed)
        return;
      var toRead = Math.min(self._readableState.highWaterMark, n);
      if (self.endOffset != null) {
        toRead = Math.min(toRead, self.endOffset - self.pos);
      }
      if (toRead <= 0) {
        self.destroyed = true;
        self.push(null);
        self.context.unref();
        return;
      }
      self.context.pend.go(function(cb) {
        if (self.destroyed)
          return cb();
        var buffer = new Buffer(toRead);
        fs.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
          if (err) {
            self.destroy(err);
          } else if (bytesRead === 0) {
            self.destroyed = true;
            self.push(null);
            self.context.unref();
          } else {
            self.pos += bytesRead;
            self.push(buffer.slice(0, bytesRead));
          }
          cb();
        });
      });
    };
    ReadStream.prototype.destroy = function(err) {
      if (this.destroyed)
        return;
      err = err || new Error("stream destroyed");
      this.destroyed = true;
      this.emit("error", err);
      this.context.unref();
    };
    util.inherits(WriteStream, Writable);
    function WriteStream(context, options) {
      options = options || {};
      Writable.call(this, options);
      this.context = context;
      this.context.ref();
      this.start = options.start || 0;
      this.endOffset = options.end == null ? Infinity : +options.end;
      this.bytesWritten = 0;
      this.pos = this.start;
      this.destroyed = false;
      this.on("finish", this.destroy.bind(this));
    }
    WriteStream.prototype._write = function(buffer, encoding, callback) {
      var self = this;
      if (self.destroyed)
        return;
      if (self.pos + buffer.length > self.endOffset) {
        var err = new Error("maximum file length exceeded");
        err.code = "ETOOBIG";
        self.destroy();
        callback(err);
        return;
      }
      self.context.pend.go(function(cb) {
        if (self.destroyed)
          return cb();
        fs.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err2, bytes) {
          if (err2) {
            self.destroy();
            cb();
            callback(err2);
          } else {
            self.bytesWritten += bytes;
            self.pos += bytes;
            self.emit("progress");
            cb();
            callback();
          }
        });
      });
    };
    WriteStream.prototype.destroy = function() {
      if (this.destroyed)
        return;
      this.destroyed = true;
      this.context.unref();
    };
    util.inherits(BufferSlicer, EventEmitter);
    function BufferSlicer(buffer, options) {
      EventEmitter.call(this);
      options = options || {};
      this.refCount = 0;
      this.buffer = buffer;
      this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER;
    }
    BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
      var end = position + length;
      var delta = end - this.buffer.length;
      var written = delta > 0 ? delta : length;
      this.buffer.copy(buffer, offset, position, end);
      setImmediate(function() {
        callback(null, written);
      });
    };
    BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
      buffer.copy(this.buffer, position, offset, offset + length);
      setImmediate(function() {
        callback(null, length, buffer);
      });
    };
    BufferSlicer.prototype.createReadStream = function(options) {
      options = options || {};
      var readStream = new PassThrough(options);
      readStream.destroyed = false;
      readStream.start = options.start || 0;
      readStream.endOffset = options.end;
      readStream.pos = readStream.endOffset || this.buffer.length;
      var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
      var offset = 0;
      while (true) {
        var nextOffset = offset + this.maxChunkSize;
        if (nextOffset >= entireSlice.length) {
          if (offset < entireSlice.length) {
            readStream.write(entireSlice.slice(offset, entireSlice.length));
          }
          break;
        }
        readStream.write(entireSlice.slice(offset, nextOffset));
        offset = nextOffset;
      }
      readStream.end();
      readStream.destroy = function() {
        readStream.destroyed = true;
      };
      return readStream;
    };
    BufferSlicer.prototype.createWriteStream = function(options) {
      var bufferSlicer = this;
      options = options || {};
      var writeStream = new Writable(options);
      writeStream.start = options.start || 0;
      writeStream.endOffset = options.end == null ? this.buffer.length : +options.end;
      writeStream.bytesWritten = 0;
      writeStream.pos = writeStream.start;
      writeStream.destroyed = false;
      writeStream._write = function(buffer, encoding, callback) {
        if (writeStream.destroyed)
          return;
        var end = writeStream.pos + buffer.length;
        if (end > writeStream.endOffset) {
          var err = new Error("maximum file length exceeded");
          err.code = "ETOOBIG";
          writeStream.destroyed = true;
          callback(err);
          return;
        }
        buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);
        writeStream.bytesWritten += buffer.length;
        writeStream.pos = end;
        writeStream.emit("progress");
        callback();
      };
      writeStream.destroy = function() {
        writeStream.destroyed = true;
      };
      return writeStream;
    };
    BufferSlicer.prototype.ref = function() {
      this.refCount += 1;
    };
    BufferSlicer.prototype.unref = function() {
      this.refCount -= 1;
      if (this.refCount < 0) {
        throw new Error("invalid unref");
      }
    };
    function createFromBuffer(buffer, options) {
      return new BufferSlicer(buffer, options);
    }
    function createFromFd(fd, options) {
      return new FdSlicer(fd, options);
    }
  }
});

// node_modules/buffer-crc32/index.js
var require_buffer_crc32 = __commonJS({
  "node_modules/buffer-crc32/index.js"(exports2, module2) {
    var Buffer2 = require("buffer").Buffer;
    var CRC_TABLE = [
      0,
      1996959894,
      3993919788,
      2567524794,
      124634137,
      1886057615,
      3915621685,
      2657392035,
      249268274,
      2044508324,
      3772115230,
      2547177864,
      162941995,
      2125561021,
      3887607047,
      2428444049,
      498536548,
      1789927666,
      4089016648,
      2227061214,
      450548861,
      1843258603,
      4107580753,
      2211677639,
      325883990,
      1684777152,
      4251122042,
      2321926636,
      335633487,
      1661365465,
      4195302755,
      2366115317,
      997073096,
      1281953886,
      3579855332,
      2724688242,
      1006888145,
      1258607687,
      3524101629,
      2768942443,
      901097722,
      1119000684,
      3686517206,
      2898065728,
      853044451,
      1172266101,
      3705015759,
      2882616665,
      651767980,
      1373503546,
      3369554304,
      3218104598,
      565507253,
      1454621731,
      3485111705,
      3099436303,
      671266974,
      1594198024,
      3322730930,
      2970347812,
      795835527,
      1483230225,
      3244367275,
      3060149565,
      1994146192,
      31158534,
      2563907772,
      4023717930,
      1907459465,
      112637215,
      2680153253,
      3904427059,
      2013776290,
      251722036,
      2517215374,
      3775830040,
      2137656763,
      141376813,
      2439277719,
      3865271297,
      1802195444,
      476864866,
      2238001368,
      4066508878,
      1812370925,
      453092731,
      2181625025,
      4111451223,
      1706088902,
      314042704,
      2344532202,
      4240017532,
      1658658271,
      366619977,
      2362670323,
      4224994405,
      1303535960,
      984961486,
      2747007092,
      3569037538,
      1256170817,
      1037604311,
      2765210733,
      3554079995,
      1131014506,
      879679996,
      2909243462,
      3663771856,
      1141124467,
      855842277,
      2852801631,
      3708648649,
      1342533948,
      654459306,
      3188396048,
      3373015174,
      1466479909,
      544179635,
      3110523913,
      3462522015,
      1591671054,
      702138776,
      2966460450,
      3352799412,
      1504918807,
      783551873,
      3082640443,
      3233442989,
      3988292384,
      2596254646,
      62317068,
      1957810842,
      3939845945,
      2647816111,
      81470997,
      1943803523,
      3814918930,
      2489596804,
      225274430,
      2053790376,
      3826175755,
      2466906013,
      167816743,
      2097651377,
      4027552580,
      2265490386,
      503444072,
      1762050814,
      4150417245,
      2154129355,
      426522225,
      1852507879,
      4275313526,
      2312317920,
      282753626,
      1742555852,
      4189708143,
      2394877945,
      397917763,
      1622183637,
      3604390888,
      2714866558,
      953729732,
      1340076626,
      3518719985,
      2797360999,
      1068828381,
      1219638859,
      3624741850,
      2936675148,
      906185462,
      1090812512,
      3747672003,
      2825379669,
      829329135,
      1181335161,
      3412177804,
      3160834842,
      628085408,
      1382605366,
      3423369109,
      3138078467,
      570562233,
      1426400815,
      3317316542,
      2998733608,
      733239954,
      1555261956,
      3268935591,
      3050360625,
      752459403,
      1541320221,
      2607071920,
      3965973030,
      1969922972,
      40735498,
      2617837225,
      3943577151,
      1913087877,
      83908371,
      2512341634,
      3803740692,
      2075208622,
      213261112,
      2463272603,
      3855990285,
      2094854071,
      198958881,
      2262029012,
      4057260610,
      1759359992,
      534414190,
      2176718541,
      4139329115,
      1873836001,
      414664567,
      2282248934,
      4279200368,
      1711684554,
      285281116,
      2405801727,
      4167216745,
      1634467795,
      376229701,
      2685067896,
      3608007406,
      1308918612,
      956543938,
      2808555105,
      3495958263,
      1231636301,
      1047427035,
      2932959818,
      3654703836,
      1088359270,
      936918e3,
      2847714899,
      3736837829,
      1202900863,
      817233897,
      3183342108,
      3401237130,
      1404277552,
      615818150,
      3134207493,
      3453421203,
      1423857449,
      601450431,
      3009837614,
      3294710456,
      1567103746,
      711928724,
      3020668471,
      3272380065,
      1510334235,
      755167117
    ];
    if (typeof Int32Array !== "undefined") {
      CRC_TABLE = new Int32Array(CRC_TABLE);
    }
    function ensureBuffer(input) {
      if (Buffer2.isBuffer(input)) {
        return input;
      }
      var hasNewBufferAPI = typeof Buffer2.alloc === "function" && typeof Buffer2.from === "function";
      if (typeof input === "number") {
        return hasNewBufferAPI ? Buffer2.alloc(input) : new Buffer2(input);
      } else if (typeof input === "string") {
        return hasNewBufferAPI ? Buffer2.from(input) : new Buffer2(input);
      } else {
        throw new Error("input must be buffer, number, or string, received " + typeof input);
      }
    }
    function bufferizeInt(num) {
      var tmp = ensureBuffer(4);
      tmp.writeInt32BE(num, 0);
      return tmp;
    }
    function _crc32(buf, previous) {
      buf = ensureBuffer(buf);
      if (Buffer2.isBuffer(previous)) {
        previous = previous.readUInt32BE(0);
      }
      var crc = ~~previous ^ -1;
      for (var n = 0; n < buf.length; n++) {
        crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
      }
      return crc ^ -1;
    }
    function crc32() {
      return bufferizeInt(_crc32.apply(null, arguments));
    }
    crc32.signed = function() {
      return _crc32.apply(null, arguments);
    };
    crc32.unsigned = function() {
      return _crc32.apply(null, arguments) >>> 0;
    };
    module2.exports = crc32;
  }
});

// node_modules/yauzl/index.js
var require_yauzl = __commonJS({
  "node_modules/yauzl/index.js"(exports2) {
    var fs = require("fs");
    var zlib = require("zlib");
    var fd_slicer = require_fd_slicer();
    var crc32 = require_buffer_crc32();
    var util = require("util");
    var EventEmitter = require("events").EventEmitter;
    var Transform = require("stream").Transform;
    var PassThrough = require("stream").PassThrough;
    var Writable = require("stream").Writable;
    exports2.open = open;
    exports2.fromFd = fromFd;
    exports2.fromBuffer = fromBuffer;
    exports2.fromRandomAccessReader = fromRandomAccessReader;
    exports2.dosDateTimeToDate = dosDateTimeToDate;
    exports2.validateFileName = validateFileName;
    exports2.ZipFile = ZipFile;
    exports2.Entry = Entry;
    exports2.RandomAccessReader = RandomAccessReader;
    function open(path, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = null;
      }
      if (options == null)
        options = {};
      if (options.autoClose == null)
        options.autoClose = true;
      if (options.lazyEntries == null)
        options.lazyEntries = false;
      if (options.decodeStrings == null)
        options.decodeStrings = true;
      if (options.validateEntrySizes == null)
        options.validateEntrySizes = true;
      if (options.strictFileNames == null)
        options.strictFileNames = false;
      if (callback == null)
        callback = defaultCallback;
      fs.open(path, "r", function(err, fd) {
        if (err)
          return callback(err);
        fromFd(fd, options, function(err2, zipfile) {
          if (err2)
            fs.close(fd, defaultCallback);
          callback(err2, zipfile);
        });
      });
    }
    function fromFd(fd, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = null;
      }
      if (options == null)
        options = {};
      if (options.autoClose == null)
        options.autoClose = false;
      if (options.lazyEntries == null)
        options.lazyEntries = false;
      if (options.decodeStrings == null)
        options.decodeStrings = true;
      if (options.validateEntrySizes == null)
        options.validateEntrySizes = true;
      if (options.strictFileNames == null)
        options.strictFileNames = false;
      if (callback == null)
        callback = defaultCallback;
      fs.fstat(fd, function(err, stats) {
        if (err)
          return callback(err);
        var reader = fd_slicer.createFromFd(fd, { autoClose: true });
        fromRandomAccessReader(reader, stats.size, options, callback);
      });
    }
    function fromBuffer(buffer, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = null;
      }
      if (options == null)
        options = {};
      options.autoClose = false;
      if (options.lazyEntries == null)
        options.lazyEntries = false;
      if (options.decodeStrings == null)
        options.decodeStrings = true;
      if (options.validateEntrySizes == null)
        options.validateEntrySizes = true;
      if (options.strictFileNames == null)
        options.strictFileNames = false;
      var reader = fd_slicer.createFromBuffer(buffer, { maxChunkSize: 65536 });
      fromRandomAccessReader(reader, buffer.length, options, callback);
    }
    function fromRandomAccessReader(reader, totalSize, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = null;
      }
      if (options == null)
        options = {};
      if (options.autoClose == null)
        options.autoClose = true;
      if (options.lazyEntries == null)
        options.lazyEntries = false;
      if (options.decodeStrings == null)
        options.decodeStrings = true;
      var decodeStrings = !!options.decodeStrings;
      if (options.validateEntrySizes == null)
        options.validateEntrySizes = true;
      if (options.strictFileNames == null)
        options.strictFileNames = false;
      if (callback == null)
        callback = defaultCallback;
      if (typeof totalSize !== "number")
        throw new Error("expected totalSize parameter to be a number");
      if (totalSize > Number.MAX_SAFE_INTEGER) {
        throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
      }
      reader.ref();
      var eocdrWithoutCommentSize = 22;
      var maxCommentSize = 65535;
      var bufferSize = Math.min(eocdrWithoutCommentSize + maxCommentSize, totalSize);
      var buffer = newBuffer(bufferSize);
      var bufferReadStart = totalSize - buffer.length;
      readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
        if (err)
          return callback(err);
        for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
          if (buffer.readUInt32LE(i) !== 101010256)
            continue;
          var eocdrBuffer = buffer.slice(i);
          var diskNumber = eocdrBuffer.readUInt16LE(4);
          if (diskNumber !== 0) {
            return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
          }
          var entryCount = eocdrBuffer.readUInt16LE(10);
          var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
          var commentLength = eocdrBuffer.readUInt16LE(20);
          var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
          if (commentLength !== expectedCommentLength) {
            return callback(new Error("invalid comment length. expected: " + expectedCommentLength + ". found: " + commentLength));
          }
          var comment = decodeStrings ? decodeBuffer(eocdrBuffer, 22, eocdrBuffer.length, false) : eocdrBuffer.slice(22);
          if (!(entryCount === 65535 || centralDirectoryOffset === 4294967295)) {
            return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
          }
          var zip64EocdlBuffer = newBuffer(20);
          var zip64EocdlOffset = bufferReadStart + i - zip64EocdlBuffer.length;
          readAndAssertNoEof(reader, zip64EocdlBuffer, 0, zip64EocdlBuffer.length, zip64EocdlOffset, function(err2) {
            if (err2)
              return callback(err2);
            if (zip64EocdlBuffer.readUInt32LE(0) !== 117853008) {
              return callback(new Error("invalid zip64 end of central directory locator signature"));
            }
            var zip64EocdrOffset = readUInt64LE2(zip64EocdlBuffer, 8);
            var zip64EocdrBuffer = newBuffer(56);
            readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err3) {
              if (err3)
                return callback(err3);
              if (zip64EocdrBuffer.readUInt32LE(0) !== 101075792) {
                return callback(new Error("invalid zip64 end of central directory record signature"));
              }
              entryCount = readUInt64LE2(zip64EocdrBuffer, 32);
              centralDirectoryOffset = readUInt64LE2(zip64EocdrBuffer, 48);
              return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
            });
          });
          return;
        }
        callback(new Error("end of central directory record signature not found"));
      });
    }
    util.inherits(ZipFile, EventEmitter);
    function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
      var self = this;
      EventEmitter.call(self);
      self.reader = reader;
      self.reader.on("error", function(err) {
        emitError(self, err);
      });
      self.reader.once("close", function() {
        self.emit("close");
      });
      self.readEntryCursor = centralDirectoryOffset;
      self.fileSize = fileSize;
      self.entryCount = entryCount;
      self.comment = comment;
      self.entriesRead = 0;
      self.autoClose = !!autoClose;
      self.lazyEntries = !!lazyEntries;
      self.decodeStrings = !!decodeStrings;
      self.validateEntrySizes = !!validateEntrySizes;
      self.strictFileNames = !!strictFileNames;
      self.isOpen = true;
      self.emittedError = false;
      if (!self.lazyEntries)
        self._readEntry();
    }
    ZipFile.prototype.close = function() {
      if (!this.isOpen)
        return;
      this.isOpen = false;
      this.reader.unref();
    };
    function emitErrorAndAutoClose(self, err) {
      if (self.autoClose)
        self.close();
      emitError(self, err);
    }
    function emitError(self, err) {
      if (self.emittedError)
        return;
      self.emittedError = true;
      self.emit("error", err);
    }
    ZipFile.prototype.readEntry = function() {
      if (!this.lazyEntries)
        throw new Error("readEntry() called without lazyEntries:true");
      this._readEntry();
    };
    ZipFile.prototype._readEntry = function() {
      var self = this;
      if (self.entryCount === self.entriesRead) {
        setImmediate(function() {
          if (self.autoClose)
            self.close();
          if (self.emittedError)
            return;
          self.emit("end");
        });
        return;
      }
      if (self.emittedError)
        return;
      var buffer = newBuffer(46);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
        if (err)
          return emitErrorAndAutoClose(self, err);
        if (self.emittedError)
          return;
        var entry = new Entry();
        var signature = buffer.readUInt32LE(0);
        if (signature !== 33639248)
          return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
        entry.versionMadeBy = buffer.readUInt16LE(4);
        entry.versionNeededToExtract = buffer.readUInt16LE(6);
        entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
        entry.compressionMethod = buffer.readUInt16LE(10);
        entry.lastModFileTime = buffer.readUInt16LE(12);
        entry.lastModFileDate = buffer.readUInt16LE(14);
        entry.crc32 = buffer.readUInt32LE(16);
        entry.compressedSize = buffer.readUInt32LE(20);
        entry.uncompressedSize = buffer.readUInt32LE(24);
        entry.fileNameLength = buffer.readUInt16LE(28);
        entry.extraFieldLength = buffer.readUInt16LE(30);
        entry.fileCommentLength = buffer.readUInt16LE(32);
        entry.internalFileAttributes = buffer.readUInt16LE(36);
        entry.externalFileAttributes = buffer.readUInt32LE(38);
        entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);
        if (entry.generalPurposeBitFlag & 64)
          return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));
        self.readEntryCursor += 46;
        buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
        readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err2) {
          if (err2)
            return emitErrorAndAutoClose(self, err2);
          if (self.emittedError)
            return;
          var isUtf8 = (entry.generalPurposeBitFlag & 2048) !== 0;
          entry.fileName = self.decodeStrings ? decodeBuffer(buffer, 0, entry.fileNameLength, isUtf8) : buffer.slice(0, entry.fileNameLength);
          var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
          var extraFieldBuffer = buffer.slice(entry.fileNameLength, fileCommentStart);
          entry.extraFields = [];
          var i = 0;
          while (i < extraFieldBuffer.length - 3) {
            var headerId = extraFieldBuffer.readUInt16LE(i + 0);
            var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
            var dataStart = i + 4;
            var dataEnd = dataStart + dataSize;
            if (dataEnd > extraFieldBuffer.length)
              return emitErrorAndAutoClose(self, new Error("extra field length exceeds extra field buffer size"));
            var dataBuffer = newBuffer(dataSize);
            extraFieldBuffer.copy(dataBuffer, 0, dataStart, dataEnd);
            entry.extraFields.push({
              id: headerId,
              data: dataBuffer
            });
            i = dataEnd;
          }
          entry.fileComment = self.decodeStrings ? decodeBuffer(buffer, fileCommentStart, fileCommentStart + entry.fileCommentLength, isUtf8) : buffer.slice(fileCommentStart, fileCommentStart + entry.fileCommentLength);
          entry.comment = entry.fileComment;
          self.readEntryCursor += buffer.length;
          self.entriesRead += 1;
          if (entry.uncompressedSize === 4294967295 || entry.compressedSize === 4294967295 || entry.relativeOffsetOfLocalHeader === 4294967295) {
            var zip64EiefBuffer = null;
            for (var i = 0; i < entry.extraFields.length; i++) {
              var extraField = entry.extraFields[i];
              if (extraField.id === 1) {
                zip64EiefBuffer = extraField.data;
                break;
              }
            }
            if (zip64EiefBuffer == null) {
              return emitErrorAndAutoClose(self, new Error("expected zip64 extended information extra field"));
            }
            var index = 0;
            if (entry.uncompressedSize === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
              }
              entry.uncompressedSize = readUInt64LE2(zip64EiefBuffer, index);
              index += 8;
            }
            if (entry.compressedSize === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
              }
              entry.compressedSize = readUInt64LE2(zip64EiefBuffer, index);
              index += 8;
            }
            if (entry.relativeOffsetOfLocalHeader === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
              }
              entry.relativeOffsetOfLocalHeader = readUInt64LE2(zip64EiefBuffer, index);
              index += 8;
            }
          }
          if (self.decodeStrings) {
            for (var i = 0; i < entry.extraFields.length; i++) {
              var extraField = entry.extraFields[i];
              if (extraField.id === 28789) {
                if (extraField.data.length < 6) {
                  continue;
                }
                if (extraField.data.readUInt8(0) !== 1) {
                  continue;
                }
                var oldNameCrc32 = extraField.data.readUInt32LE(1);
                if (crc32.unsigned(buffer.slice(0, entry.fileNameLength)) !== oldNameCrc32) {
                  continue;
                }
                entry.fileName = decodeBuffer(extraField.data, 5, extraField.data.length, true);
                break;
              }
            }
          }
          if (self.validateEntrySizes && entry.compressionMethod === 0) {
            var expectedCompressedSize = entry.uncompressedSize;
            if (entry.isEncrypted()) {
              expectedCompressedSize += 12;
            }
            if (entry.compressedSize !== expectedCompressedSize) {
              var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
              return emitErrorAndAutoClose(self, new Error(msg));
            }
          }
          if (self.decodeStrings) {
            if (!self.strictFileNames) {
              entry.fileName = entry.fileName.replace(/\\/g, "/");
            }
            var errorMessage = validateFileName(entry.fileName, self.validateFileNameOptions);
            if (errorMessage != null)
              return emitErrorAndAutoClose(self, new Error(errorMessage));
          }
          self.emit("entry", entry);
          if (!self.lazyEntries)
            self._readEntry();
        });
      });
    };
    ZipFile.prototype.openReadStream = function(entry, options, callback) {
      var self = this;
      var relativeStart = 0;
      var relativeEnd = entry.compressedSize;
      if (callback == null) {
        callback = options;
        options = {};
      } else {
        if (options.decrypt != null) {
          if (!entry.isEncrypted()) {
            throw new Error("options.decrypt can only be specified for encrypted entries");
          }
          if (options.decrypt !== false)
            throw new Error("invalid options.decrypt value: " + options.decrypt);
          if (entry.isCompressed()) {
            if (options.decompress !== false)
              throw new Error("entry is encrypted and compressed, and options.decompress !== false");
          }
        }
        if (options.decompress != null) {
          if (!entry.isCompressed()) {
            throw new Error("options.decompress can only be specified for compressed entries");
          }
          if (!(options.decompress === false || options.decompress === true)) {
            throw new Error("invalid options.decompress value: " + options.decompress);
          }
        }
        if (options.start != null || options.end != null) {
          if (entry.isCompressed() && options.decompress !== false) {
            throw new Error("start/end range not allowed for compressed entry without options.decompress === false");
          }
          if (entry.isEncrypted() && options.decrypt !== false) {
            throw new Error("start/end range not allowed for encrypted entry without options.decrypt === false");
          }
        }
        if (options.start != null) {
          relativeStart = options.start;
          if (relativeStart < 0)
            throw new Error("options.start < 0");
          if (relativeStart > entry.compressedSize)
            throw new Error("options.start > entry.compressedSize");
        }
        if (options.end != null) {
          relativeEnd = options.end;
          if (relativeEnd < 0)
            throw new Error("options.end < 0");
          if (relativeEnd > entry.compressedSize)
            throw new Error("options.end > entry.compressedSize");
          if (relativeEnd < relativeStart)
            throw new Error("options.end < options.start");
        }
      }
      if (!self.isOpen)
        return callback(new Error("closed"));
      if (entry.isEncrypted()) {
        if (options.decrypt !== false)
          return callback(new Error("entry is encrypted, and options.decrypt !== false"));
      }
      self.reader.ref();
      var buffer = newBuffer(30);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
        try {
          if (err)
            return callback(err);
          var signature = buffer.readUInt32LE(0);
          if (signature !== 67324752) {
            return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
          }
          var fileNameLength = buffer.readUInt16LE(26);
          var extraFieldLength = buffer.readUInt16LE(28);
          var localFileHeaderEnd = entry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength;
          var decompress;
          if (entry.compressionMethod === 0) {
            decompress = false;
          } else if (entry.compressionMethod === 8) {
            decompress = options.decompress != null ? options.decompress : true;
          } else {
            return callback(new Error("unsupported compression method: " + entry.compressionMethod));
          }
          var fileDataStart = localFileHeaderEnd;
          var fileDataEnd = fileDataStart + entry.compressedSize;
          if (entry.compressedSize !== 0) {
            if (fileDataEnd > self.fileSize) {
              return callback(new Error("file data overflows file bounds: " + fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
            }
          }
          var readStream = self.reader.createReadStream({
            start: fileDataStart + relativeStart,
            end: fileDataStart + relativeEnd
          });
          var endpointStream = readStream;
          if (decompress) {
            var destroyed = false;
            var inflateFilter = zlib.createInflateRaw();
            readStream.on("error", function(err2) {
              setImmediate(function() {
                if (!destroyed)
                  inflateFilter.emit("error", err2);
              });
            });
            readStream.pipe(inflateFilter);
            if (self.validateEntrySizes) {
              endpointStream = new AssertByteCountStream(entry.uncompressedSize);
              inflateFilter.on("error", function(err2) {
                setImmediate(function() {
                  if (!destroyed)
                    endpointStream.emit("error", err2);
                });
              });
              inflateFilter.pipe(endpointStream);
            } else {
              endpointStream = inflateFilter;
            }
            endpointStream.destroy = function() {
              destroyed = true;
              if (inflateFilter !== endpointStream)
                inflateFilter.unpipe(endpointStream);
              readStream.unpipe(inflateFilter);
              readStream.destroy();
            };
          }
          callback(null, endpointStream);
        } finally {
          self.reader.unref();
        }
      });
    };
    function Entry() {
    }
    Entry.prototype.getLastModDate = function() {
      return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime);
    };
    Entry.prototype.isEncrypted = function() {
      return (this.generalPurposeBitFlag & 1) !== 0;
    };
    Entry.prototype.isCompressed = function() {
      return this.compressionMethod === 8;
    };
    function dosDateTimeToDate(date, time) {
      var day = date & 31;
      var month = (date >> 5 & 15) - 1;
      var year = (date >> 9 & 127) + 1980;
      var millisecond = 0;
      var second = (time & 31) * 2;
      var minute = time >> 5 & 63;
      var hour = time >> 11 & 31;
      return new Date(year, month, day, hour, minute, second, millisecond);
    }
    function validateFileName(fileName) {
      if (fileName.indexOf("\\") !== -1) {
        return "invalid characters in fileName: " + fileName;
      }
      if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
        return "absolute path: " + fileName;
      }
      if (fileName.split("/").indexOf("..") !== -1) {
        return "invalid relative path: " + fileName;
      }
      return null;
    }
    function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
      if (length === 0) {
        return setImmediate(function() {
          callback(null, newBuffer(0));
        });
      }
      reader.read(buffer, offset, length, position, function(err, bytesRead) {
        if (err)
          return callback(err);
        if (bytesRead < length) {
          return callback(new Error("unexpected EOF"));
        }
        callback();
      });
    }
    util.inherits(AssertByteCountStream, Transform);
    function AssertByteCountStream(byteCount) {
      Transform.call(this);
      this.actualByteCount = 0;
      this.expectedByteCount = byteCount;
    }
    AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
      this.actualByteCount += chunk.length;
      if (this.actualByteCount > this.expectedByteCount) {
        var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
        return cb(new Error(msg));
      }
      cb(null, chunk);
    };
    AssertByteCountStream.prototype._flush = function(cb) {
      if (this.actualByteCount < this.expectedByteCount) {
        var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
        return cb(new Error(msg));
      }
      cb();
    };
    util.inherits(RandomAccessReader, EventEmitter);
    function RandomAccessReader() {
      EventEmitter.call(this);
      this.refCount = 0;
    }
    RandomAccessReader.prototype.ref = function() {
      this.refCount += 1;
    };
    RandomAccessReader.prototype.unref = function() {
      var self = this;
      self.refCount -= 1;
      if (self.refCount > 0)
        return;
      if (self.refCount < 0)
        throw new Error("invalid unref");
      self.close(onCloseDone);
      function onCloseDone(err) {
        if (err)
          return self.emit("error", err);
        self.emit("close");
      }
    };
    RandomAccessReader.prototype.createReadStream = function(options) {
      var start = options.start;
      var end = options.end;
      if (start === end) {
        var emptyStream = new PassThrough();
        setImmediate(function() {
          emptyStream.end();
        });
        return emptyStream;
      }
      var stream2 = this._readStreamForRange(start, end);
      var destroyed = false;
      var refUnrefFilter = new RefUnrefFilter(this);
      stream2.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed)
            refUnrefFilter.emit("error", err);
        });
      });
      refUnrefFilter.destroy = function() {
        stream2.unpipe(refUnrefFilter);
        refUnrefFilter.unref();
        stream2.destroy();
      };
      var byteCounter = new AssertByteCountStream(end - start);
      refUnrefFilter.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed)
            byteCounter.emit("error", err);
        });
      });
      byteCounter.destroy = function() {
        destroyed = true;
        refUnrefFilter.unpipe(byteCounter);
        refUnrefFilter.destroy();
      };
      return stream2.pipe(refUnrefFilter).pipe(byteCounter);
    };
    RandomAccessReader.prototype._readStreamForRange = function(start, end) {
      throw new Error("not implemented");
    };
    RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
      var readStream = this.createReadStream({ start: position, end: position + length });
      var writeStream = new Writable();
      var written = 0;
      writeStream._write = function(chunk, encoding, cb) {
        chunk.copy(buffer, offset + written, 0, chunk.length);
        written += chunk.length;
        cb();
      };
      writeStream.on("finish", callback);
      readStream.on("error", function(error) {
        callback(error);
      });
      readStream.pipe(writeStream);
    };
    RandomAccessReader.prototype.close = function(callback) {
      setImmediate(callback);
    };
    util.inherits(RefUnrefFilter, PassThrough);
    function RefUnrefFilter(context) {
      PassThrough.call(this);
      this.context = context;
      this.context.ref();
      this.unreffedYet = false;
    }
    RefUnrefFilter.prototype._flush = function(cb) {
      this.unref();
      cb();
    };
    RefUnrefFilter.prototype.unref = function(cb) {
      if (this.unreffedYet)
        return;
      this.unreffedYet = true;
      this.context.unref();
    };
    var cp437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0";
    function decodeBuffer(buffer, start, end, isUtf8) {
      if (isUtf8) {
        return buffer.toString("utf8", start, end);
      } else {
        var result = "";
        for (var i = start; i < end; i++) {
          result += cp437[buffer[i]];
        }
        return result;
      }
    }
    function readUInt64LE2(buffer, offset) {
      var lower32 = buffer.readUInt32LE(offset);
      var upper32 = buffer.readUInt32LE(offset + 4);
      return upper32 * 4294967296 + lower32;
    }
    var newBuffer;
    if (typeof Buffer.allocUnsafe === "function") {
      newBuffer = function(len) {
        return Buffer.allocUnsafe(len);
      };
    } else {
      newBuffer = function(len) {
        return new Buffer(len);
      };
    }
    function defaultCallback(err) {
      if (err)
        throw err;
    }
  }
});

// node_modules/decompress-unzip/index.js
var require_decompress_unzip = __commonJS({
  "node_modules/decompress-unzip/index.js"(exports2, module2) {
    "use strict";
    var fileType2 = require_file_type4();
    var getStream = require_get_stream();
    var pify = require_pify();
    var yauzl = require_yauzl();
    var getType = (entry, mode) => {
      const IFMT = 61440;
      const IFDIR = 16384;
      const IFLNK = 40960;
      const madeBy = entry.versionMadeBy >> 8;
      if ((mode & IFMT) === IFLNK) {
        return "symlink";
      }
      if ((mode & IFMT) === IFDIR || madeBy === 0 && entry.externalFileAttributes === 16) {
        return "directory";
      }
      return "file";
    };
    var extractEntry = (entry, zip) => {
      const file = {
        mode: entry.externalFileAttributes >> 16 & 65535,
        mtime: entry.getLastModDate(),
        path: entry.fileName
      };
      file.type = getType(entry, file.mode);
      if (file.mode === 0 && file.type === "directory") {
        file.mode = 493;
      }
      if (file.mode === 0) {
        file.mode = 420;
      }
      return pify(zip.openReadStream.bind(zip))(entry).then(getStream.buffer).then((buf) => {
        file.data = buf;
        if (file.type === "symlink") {
          file.linkname = buf.toString();
        }
        return file;
      }).catch((err) => {
        zip.close();
        throw err;
      });
    };
    var extractFile = (zip) => new Promise((resolve2, reject2) => {
      const files = [];
      zip.readEntry();
      zip.on("entry", (entry) => {
        extractEntry(entry, zip).catch(reject2).then((file) => {
          files.push(file);
          zip.readEntry();
        });
      });
      zip.on("error", reject2);
      zip.on("end", () => resolve2(files));
    });
    module2.exports = () => (buf) => {
      if (!Buffer.isBuffer(buf)) {
        return Promise.reject(new TypeError(`Expected a Buffer, got ${typeof buf}`));
      }
      if (!fileType2(buf) || fileType2(buf).ext !== "zip") {
        return Promise.resolve([]);
      }
      return pify(yauzl.fromBuffer)(buf, { lazyEntries: true }).then(extractFile);
    };
  }
});

// node_modules/decompress/node_modules/make-dir/node_modules/pify/index.js
var require_pify2 = __commonJS({
  "node_modules/decompress/node_modules/make-dir/node_modules/pify/index.js"(exports2, module2) {
    "use strict";
    var processFn = (fn, opts) => function() {
      const P = opts.promiseModule;
      const args = new Array(arguments.length);
      for (let i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
      return new P((resolve2, reject2) => {
        if (opts.errorFirst) {
          args.push(function(err, result) {
            if (opts.multiArgs) {
              const results = new Array(arguments.length - 1);
              for (let i = 1; i < arguments.length; i++) {
                results[i - 1] = arguments[i];
              }
              if (err) {
                results.unshift(err);
                reject2(results);
              } else {
                resolve2(results);
              }
            } else if (err) {
              reject2(err);
            } else {
              resolve2(result);
            }
          });
        } else {
          args.push(function(result) {
            if (opts.multiArgs) {
              const results = new Array(arguments.length - 1);
              for (let i = 0; i < arguments.length; i++) {
                results[i] = arguments[i];
              }
              resolve2(results);
            } else {
              resolve2(result);
            }
          });
        }
        fn.apply(this, args);
      });
    };
    module2.exports = (obj, opts) => {
      opts = Object.assign({
        exclude: [/.+(Sync|Stream)$/],
        errorFirst: true,
        promiseModule: Promise
      }, opts);
      const filter = (key) => {
        const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
        return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
      };
      let ret;
      if (typeof obj === "function") {
        ret = function() {
          if (opts.excludeMain) {
            return obj.apply(this, arguments);
          }
          return processFn(obj, opts).apply(this, arguments);
        };
      } else {
        ret = Object.create(Object.getPrototypeOf(obj));
      }
      for (const key in obj) {
        const x = obj[key];
        ret[key] = typeof x === "function" && filter(key) ? processFn(x, opts) : x;
      }
      return ret;
    };
  }
});

// node_modules/decompress/node_modules/make-dir/index.js
var require_make_dir = __commonJS({
  "node_modules/decompress/node_modules/make-dir/index.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var pify = require_pify2();
    var defaults = {
      mode: 511 & ~process.umask(),
      fs
    };
    var checkPath = (pth) => {
      if (process.platform === "win32") {
        const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ""));
        if (pathHasInvalidWinCharacters) {
          const err = new Error(`Path contains invalid characters: ${pth}`);
          err.code = "EINVAL";
          throw err;
        }
      }
    };
    module2.exports = (input, opts) => Promise.resolve().then(() => {
      checkPath(input);
      opts = Object.assign({}, defaults, opts);
      const mkdir = pify(opts.fs.mkdir);
      const stat = pify(opts.fs.stat);
      const make = (pth) => {
        return mkdir(pth, opts.mode).then(() => pth).catch((err) => {
          if (err.code === "ENOENT") {
            if (err.message.includes("null bytes") || path.dirname(pth) === pth) {
              throw err;
            }
            return make(path.dirname(pth)).then(() => make(pth));
          }
          return stat(pth).then((stats) => stats.isDirectory() ? pth : Promise.reject()).catch(() => {
            throw err;
          });
        });
      };
      return make(path.resolve(input));
    });
    module2.exports.sync = (input, opts) => {
      checkPath(input);
      opts = Object.assign({}, defaults, opts);
      const make = (pth) => {
        try {
          opts.fs.mkdirSync(pth, opts.mode);
        } catch (err) {
          if (err.code === "ENOENT") {
            if (err.message.includes("null bytes") || path.dirname(pth) === pth) {
              throw err;
            }
            make(path.dirname(pth));
            return make(pth);
          }
          try {
            if (!opts.fs.statSync(pth).isDirectory()) {
              throw new Error("The path is not a directory");
            }
          } catch (_) {
            throw err;
          }
        }
        return pth;
      };
      return make(path.resolve(input));
    };
  }
});

// node_modules/is-natural-number/index.js
var require_is_natural_number = __commonJS({
  "node_modules/is-natural-number/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function isNaturalNumber(val, option) {
      if (option) {
        if (typeof option !== "object") {
          throw new TypeError(String(option) + " is not an object. Expected an object that has boolean `includeZero` property.");
        }
        if ("includeZero" in option) {
          if (typeof option.includeZero !== "boolean") {
            throw new TypeError(String(option.includeZero) + " is neither true nor false. `includeZero` option must be a Boolean value.");
          }
          if (option.includeZero && val === 0) {
            return true;
          }
        }
      }
      return Number.isSafeInteger(val) && val >= 1;
    };
  }
});

// node_modules/strip-dirs/index.js
var require_strip_dirs = __commonJS({
  "node_modules/strip-dirs/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var util = require("util");
    var isNaturalNumber = require_is_natural_number();
    module2.exports = function stripDirs(pathStr, count, option) {
      if (typeof pathStr !== "string") {
        throw new TypeError(util.inspect(pathStr) + " is not a string. First argument to strip-dirs must be a path string.");
      }
      if (path.posix.isAbsolute(pathStr) || path.win32.isAbsolute(pathStr)) {
        throw new Error(`${pathStr} is an absolute path. strip-dirs requires a relative path.`);
      }
      if (!isNaturalNumber(count, { includeZero: true })) {
        throw new Error("The Second argument of strip-dirs must be a natural number or 0, but received " + util.inspect(count) + ".");
      }
      if (option) {
        if (typeof option !== "object") {
          throw new TypeError(util.inspect(option) + " is not an object. Expected an object with a boolean `disallowOverflow` property.");
        }
        if (Array.isArray(option)) {
          throw new TypeError(util.inspect(option) + " is an array. Expected an object with a boolean `disallowOverflow` property.");
        }
        if ("disallowOverflow" in option && typeof option.disallowOverflow !== "boolean") {
          throw new TypeError(util.inspect(option.disallowOverflow) + " is neither true nor false. `disallowOverflow` option must be a Boolean value.");
        }
      } else {
        option = { disallowOverflow: false };
      }
      const pathComponents = path.normalize(pathStr).split(path.sep);
      if (pathComponents.length > 1 && pathComponents[0] === ".") {
        pathComponents.shift();
      }
      if (count > pathComponents.length - 1) {
        if (option.disallowOverflow) {
          throw new RangeError("Cannot strip more directories than there are.");
        }
        count = pathComponents.length - 1;
      }
      return path.join.apply(null, pathComponents.slice(count));
    };
  }
});

// node_modules/decompress/index.js
var require_decompress = __commonJS({
  "node_modules/decompress/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var fs = require_graceful_fs();
    var decompressTar = require_decompress_tar();
    var decompressTarbz2 = require_decompress_tarbz2();
    var decompressTargz = require_decompress_targz();
    var decompressUnzip = require_decompress_unzip();
    var makeDir = require_make_dir();
    var pify = require_pify();
    var stripDirs = require_strip_dirs();
    var fsP = pify(fs);
    var runPlugins = (input, opts) => {
      if (opts.plugins.length === 0) {
        return Promise.resolve([]);
      }
      return Promise.all(opts.plugins.map((x) => x(input, opts))).then((files) => files.reduce((a, b) => a.concat(b)));
    };
    var safeMakeDir = (dir, realOutputPath) => {
      return fsP.realpath(dir).catch((_) => {
        const parent = path.dirname(dir);
        return safeMakeDir(parent, realOutputPath);
      }).then((realParentPath) => {
        if (realParentPath.indexOf(realOutputPath) !== 0) {
          throw new Error("Refusing to create a directory outside the output path.");
        }
        return makeDir(dir).then(fsP.realpath);
      });
    };
    var preventWritingThroughSymlink = (destination, realOutputPath) => {
      return fsP.readlink(destination).catch((_) => {
        return null;
      }).then((symlinkPointsTo) => {
        if (symlinkPointsTo) {
          throw new Error("Refusing to write into a symlink");
        }
        return realOutputPath;
      });
    };
    var extractFile = (input, output, opts) => runPlugins(input, opts).then((files) => {
      if (opts.strip > 0) {
        files = files.map((x) => {
          x.path = stripDirs(x.path, opts.strip);
          return x;
        }).filter((x) => x.path !== ".");
      }
      if (typeof opts.filter === "function") {
        files = files.filter(opts.filter);
      }
      if (typeof opts.map === "function") {
        files = files.map(opts.map);
      }
      if (!output) {
        return files;
      }
      return Promise.all(files.map((x) => {
        const dest = path.join(output, x.path);
        const mode = x.mode & ~process.umask();
        const now = new Date();
        if (x.type === "directory") {
          return makeDir(output).then((outputPath) => fsP.realpath(outputPath)).then((realOutputPath) => safeMakeDir(dest, realOutputPath)).then(() => fsP.utimes(dest, now, x.mtime)).then(() => x);
        }
        return makeDir(output).then((outputPath) => fsP.realpath(outputPath)).then((realOutputPath) => {
          return safeMakeDir(path.dirname(dest), realOutputPath).then(() => realOutputPath);
        }).then((realOutputPath) => {
          if (x.type === "file") {
            return preventWritingThroughSymlink(dest, realOutputPath);
          }
          return realOutputPath;
        }).then((realOutputPath) => {
          return fsP.realpath(path.dirname(dest)).then((realDestinationDir) => {
            if (realDestinationDir.indexOf(realOutputPath) !== 0) {
              throw new Error("Refusing to write outside output directory: " + realDestinationDir);
            }
          });
        }).then(() => {
          if (x.type === "link") {
            return fsP.link(x.linkname, dest);
          }
          if (x.type === "symlink" && process.platform === "win32") {
            return fsP.link(x.linkname, dest);
          }
          if (x.type === "symlink") {
            return fsP.symlink(x.linkname, dest);
          }
          return fsP.writeFile(dest, x.data, { mode });
        }).then(() => x.type === "file" && fsP.utimes(dest, now, x.mtime)).then(() => x);
      }));
    });
    module2.exports = (input, output, opts) => {
      if (typeof input !== "string" && !Buffer.isBuffer(input)) {
        return Promise.reject(new TypeError("Input file required"));
      }
      if (typeof output === "object") {
        opts = output;
        output = null;
      }
      opts = Object.assign({ plugins: [
        decompressTar(),
        decompressTarbz2(),
        decompressTargz(),
        decompressUnzip()
      ] }, opts);
      const read = typeof input === "string" ? fsP.readFile(input) : Promise.resolve(input);
      return read.then((buf) => extractFile(buf, output, opts));
    };
  }
});

// node_modules/escape-string-regexp/index.js
var require_escape_string_regexp = __commonJS({
  "node_modules/escape-string-regexp/index.js"(exports2, module2) {
    "use strict";
    var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
    module2.exports = function(str) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      return str.replace(matchOperatorsRe, "\\$&");
    };
  }
});

// node_modules/trim-repeated/index.js
var require_trim_repeated = __commonJS({
  "node_modules/trim-repeated/index.js"(exports2, module2) {
    "use strict";
    var escapeStringRegexp = require_escape_string_regexp();
    module2.exports = function(str, target) {
      if (typeof str !== "string" || typeof target !== "string") {
        throw new TypeError("Expected a string");
      }
      return str.replace(new RegExp("(?:" + escapeStringRegexp(target) + "){2,}", "g"), target);
    };
  }
});

// node_modules/filename-reserved-regex/index.js
var require_filename_reserved_regex = __commonJS({
  "node_modules/filename-reserved-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = () => /[<>:"\/\\|?*\x00-\x1F]/g;
    module2.exports.windowsNames = () => /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
  }
});

// node_modules/strip-outer/index.js
var require_strip_outer = __commonJS({
  "node_modules/strip-outer/index.js"(exports2, module2) {
    "use strict";
    var escapeStringRegexp = require_escape_string_regexp();
    module2.exports = function(str, sub) {
      if (typeof str !== "string" || typeof sub !== "string") {
        throw new TypeError();
      }
      sub = escapeStringRegexp(sub);
      return str.replace(new RegExp("^" + sub + "|" + sub + "$", "g"), "");
    };
  }
});

// node_modules/filenamify/index.js
var require_filenamify = __commonJS({
  "node_modules/filenamify/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var trimRepeated = require_trim_repeated();
    var filenameReservedRegex = require_filename_reserved_regex();
    var stripOuter = require_strip_outer();
    var MAX_FILENAME_LENGTH = 100;
    var reControlChars = /[\u0000-\u001f\u0080-\u009f]/g;
    var reRelativePath = /^\.+/;
    var filenamify = (string, options = {}) => {
      if (typeof string !== "string") {
        throw new TypeError("Expected a string");
      }
      const replacement = options.replacement === void 0 ? "!" : options.replacement;
      if (filenameReservedRegex().test(replacement) && reControlChars.test(replacement)) {
        throw new Error("Replacement string cannot contain reserved filename characters");
      }
      string = string.replace(filenameReservedRegex(), replacement);
      string = string.replace(reControlChars, replacement);
      string = string.replace(reRelativePath, replacement);
      if (replacement.length > 0) {
        string = trimRepeated(string, replacement);
        string = string.length > 1 ? stripOuter(string, replacement) : string;
      }
      string = filenameReservedRegex.windowsNames().test(string) ? string + replacement : string;
      string = string.slice(0, MAX_FILENAME_LENGTH);
      return string;
    };
    filenamify.path = (filePath, options) => {
      filePath = path.resolve(filePath);
      return path.join(path.dirname(filePath), filenamify(path.basename(filePath), options));
    };
    module2.exports = filenamify;
    module2.exports.default = filenamify;
  }
});

// node_modules/pump/index.js
var require_pump = __commonJS({
  "node_modules/pump/index.js"(exports2, module2) {
    var once = require_once();
    var eos = require_end_of_stream();
    var fs = require("fs");
    var noop = function() {
    };
    var ancient = /^v?\.0/.test(process.version);
    var isFn = function(fn) {
      return typeof fn === "function";
    };
    var isFS = function(stream2) {
      if (!ancient)
        return false;
      if (!fs)
        return false;
      return (stream2 instanceof (fs.ReadStream || noop) || stream2 instanceof (fs.WriteStream || noop)) && isFn(stream2.close);
    };
    var isRequest = function(stream2) {
      return stream2.setHeader && isFn(stream2.abort);
    };
    var destroyer = function(stream2, reading, writing, callback) {
      callback = once(callback);
      var closed = false;
      stream2.on("close", function() {
        closed = true;
      });
      eos(stream2, { readable: reading, writable: writing }, function(err) {
        if (err)
          return callback(err);
        closed = true;
        callback();
      });
      var destroyed = false;
      return function(err) {
        if (closed)
          return;
        if (destroyed)
          return;
        destroyed = true;
        if (isFS(stream2))
          return stream2.close(noop);
        if (isRequest(stream2))
          return stream2.abort();
        if (isFn(stream2.destroy))
          return stream2.destroy();
        callback(err || new Error("stream was destroyed"));
      };
    };
    var call = function(fn) {
      fn();
    };
    var pipe = function(from, to) {
      return from.pipe(to);
    };
    var pump = function() {
      var streams = Array.prototype.slice.call(arguments);
      var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
      if (Array.isArray(streams[0]))
        streams = streams[0];
      if (streams.length < 2)
        throw new Error("pump requires two streams per minimum");
      var error;
      var destroys = streams.map(function(stream2, i) {
        var reading = i < streams.length - 1;
        var writing = i > 0;
        return destroyer(stream2, reading, writing, function(err) {
          if (!error)
            error = err;
          if (err)
            destroys.forEach(call);
          if (reading)
            return;
          destroys.forEach(call);
          callback(error);
        });
      });
      return streams.reduce(pipe);
    };
    module2.exports = pump;
  }
});

// node_modules/download/node_modules/get-stream/buffer-stream.js
var require_buffer_stream2 = __commonJS({
  "node_modules/download/node_modules/get-stream/buffer-stream.js"(exports2, module2) {
    "use strict";
    var { PassThrough } = require("stream");
    module2.exports = (options) => {
      options = Object.assign({}, options);
      const { array } = options;
      let { encoding } = options;
      const buffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || buffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (buffer) {
        encoding = null;
      }
      let len = 0;
      const ret = [];
      const stream2 = new PassThrough({ objectMode });
      if (encoding) {
        stream2.setEncoding(encoding);
      }
      stream2.on("data", (chunk) => {
        ret.push(chunk);
        if (objectMode) {
          len = ret.length;
        } else {
          len += chunk.length;
        }
      });
      stream2.getBufferedValue = () => {
        if (array) {
          return ret;
        }
        return buffer ? Buffer.concat(ret, len) : ret.join("");
      };
      stream2.getBufferedLength = () => len;
      return stream2;
    };
  }
});

// node_modules/download/node_modules/get-stream/index.js
var require_get_stream2 = __commonJS({
  "node_modules/download/node_modules/get-stream/index.js"(exports2, module2) {
    "use strict";
    var pump = require_pump();
    var bufferStream = require_buffer_stream2();
    var MaxBufferError = class extends Error {
      constructor() {
        super("maxBuffer exceeded");
        this.name = "MaxBufferError";
      }
    };
    function getStream(inputStream, options) {
      if (!inputStream) {
        return Promise.reject(new Error("Expected a stream"));
      }
      options = Object.assign({ maxBuffer: Infinity }, options);
      const { maxBuffer } = options;
      let stream2;
      return new Promise((resolve2, reject2) => {
        const rejectPromise = (error) => {
          if (error) {
            error.bufferedData = stream2.getBufferedValue();
          }
          reject2(error);
        };
        stream2 = pump(inputStream, bufferStream(options), (error) => {
          if (error) {
            rejectPromise(error);
            return;
          }
          resolve2();
        });
        stream2.on("data", () => {
          if (stream2.getBufferedLength() > maxBuffer) {
            rejectPromise(new MaxBufferError());
          }
        });
      }).then(() => stream2.getBufferedValue());
    }
    module2.exports = getStream;
    module2.exports.buffer = (stream2, options) => getStream(stream2, Object.assign({}, options, { encoding: "buffer" }));
    module2.exports.array = (stream2, options) => getStream(stream2, Object.assign({}, options, { array: true }));
    module2.exports.MaxBufferError = MaxBufferError;
  }
});

// node_modules/strict-uri-encode/index.js
var require_strict_uri_encode = __commonJS({
  "node_modules/strict-uri-encode/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    };
  }
});

// node_modules/decode-uri-component/index.js
var require_decode_uri_component = __commonJS({
  "node_modules/decode-uri-component/index.js"(exports2, module2) {
    "use strict";
    var token = "%[a-f0-9]{2}";
    var singleMatcher = new RegExp(token, "gi");
    var multiMatcher = new RegExp("(" + token + ")+", "gi");
    function decodeComponents(components, split) {
      try {
        return decodeURIComponent(components.join(""));
      } catch (err) {
      }
      if (components.length === 1) {
        return components;
      }
      split = split || 1;
      var left = components.slice(0, split);
      var right = components.slice(split);
      return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
    }
    function decode(input) {
      try {
        return decodeURIComponent(input);
      } catch (err) {
        var tokens = input.match(singleMatcher);
        for (var i = 1; i < tokens.length; i++) {
          input = decodeComponents(tokens, i).join("");
          tokens = input.match(singleMatcher);
        }
        return input;
      }
    }
    function customDecodeURIComponent(input) {
      var replaceMap = {
        "%FE%FF": "\uFFFD\uFFFD",
        "%FF%FE": "\uFFFD\uFFFD"
      };
      var match = multiMatcher.exec(input);
      while (match) {
        try {
          replaceMap[match[0]] = decodeURIComponent(match[0]);
        } catch (err) {
          var result = decode(match[0]);
          if (result !== match[0]) {
            replaceMap[match[0]] = result;
          }
        }
        match = multiMatcher.exec(input);
      }
      replaceMap["%C2"] = "\uFFFD";
      var entries = Object.keys(replaceMap);
      for (var i = 0; i < entries.length; i++) {
        var key = entries[i];
        input = input.replace(new RegExp(key, "g"), replaceMap[key]);
      }
      return input;
    }
    module2.exports = function(encodedURI) {
      if (typeof encodedURI !== "string") {
        throw new TypeError("Expected `encodedURI` to be of type `string`, got `" + typeof encodedURI + "`");
      }
      try {
        encodedURI = encodedURI.replace(/\+/g, " ");
        return decodeURIComponent(encodedURI);
      } catch (err) {
        return customDecodeURIComponent(encodedURI);
      }
    };
  }
});

// node_modules/query-string/index.js
var require_query_string = __commonJS({
  "node_modules/query-string/index.js"(exports2) {
    "use strict";
    var strictUriEncode = require_strict_uri_encode();
    var objectAssign = require_object_assign();
    var decodeComponent = require_decode_uri_component();
    function encoderForArrayFormat(opts) {
      switch (opts.arrayFormat) {
        case "index":
          return function(key, value, index) {
            return value === null ? [
              encode(key, opts),
              "[",
              index,
              "]"
            ].join("") : [
              encode(key, opts),
              "[",
              encode(index, opts),
              "]=",
              encode(value, opts)
            ].join("");
          };
        case "bracket":
          return function(key, value) {
            return value === null ? encode(key, opts) : [
              encode(key, opts),
              "[]=",
              encode(value, opts)
            ].join("");
          };
        default:
          return function(key, value) {
            return value === null ? encode(key, opts) : [
              encode(key, opts),
              "=",
              encode(value, opts)
            ].join("");
          };
      }
    }
    function parserForArrayFormat(opts) {
      var result;
      switch (opts.arrayFormat) {
        case "index":
          return function(key, value, accumulator) {
            result = /\[(\d*)\]$/.exec(key);
            key = key.replace(/\[\d*\]$/, "");
            if (!result) {
              accumulator[key] = value;
              return;
            }
            if (accumulator[key] === void 0) {
              accumulator[key] = {};
            }
            accumulator[key][result[1]] = value;
          };
        case "bracket":
          return function(key, value, accumulator) {
            result = /(\[\])$/.exec(key);
            key = key.replace(/\[\]$/, "");
            if (!result) {
              accumulator[key] = value;
              return;
            } else if (accumulator[key] === void 0) {
              accumulator[key] = [value];
              return;
            }
            accumulator[key] = [].concat(accumulator[key], value);
          };
        default:
          return function(key, value, accumulator) {
            if (accumulator[key] === void 0) {
              accumulator[key] = value;
              return;
            }
            accumulator[key] = [].concat(accumulator[key], value);
          };
      }
    }
    function encode(value, opts) {
      if (opts.encode) {
        return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
      }
      return value;
    }
    function keysSorter(input) {
      if (Array.isArray(input)) {
        return input.sort();
      } else if (typeof input === "object") {
        return keysSorter(Object.keys(input)).sort(function(a, b) {
          return Number(a) - Number(b);
        }).map(function(key) {
          return input[key];
        });
      }
      return input;
    }
    function extract(str) {
      var queryStart = str.indexOf("?");
      if (queryStart === -1) {
        return "";
      }
      return str.slice(queryStart + 1);
    }
    function parse(str, opts) {
      opts = objectAssign({ arrayFormat: "none" }, opts);
      var formatter = parserForArrayFormat(opts);
      var ret = /* @__PURE__ */ Object.create(null);
      if (typeof str !== "string") {
        return ret;
      }
      str = str.trim().replace(/^[?#&]/, "");
      if (!str) {
        return ret;
      }
      str.split("&").forEach(function(param) {
        var parts = param.replace(/\+/g, " ").split("=");
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join("=") : void 0;
        val = val === void 0 ? null : decodeComponent(val);
        formatter(decodeComponent(key), val, ret);
      });
      return Object.keys(ret).sort().reduce(function(result, key) {
        var val = ret[key];
        if (Boolean(val) && typeof val === "object" && !Array.isArray(val)) {
          result[key] = keysSorter(val);
        } else {
          result[key] = val;
        }
        return result;
      }, /* @__PURE__ */ Object.create(null));
    }
    exports2.extract = extract;
    exports2.parse = parse;
    exports2.stringify = function(obj, opts) {
      var defaults = {
        encode: true,
        strict: true,
        arrayFormat: "none"
      };
      opts = objectAssign(defaults, opts);
      if (opts.sort === false) {
        opts.sort = function() {
        };
      }
      var formatter = encoderForArrayFormat(opts);
      return obj ? Object.keys(obj).sort(opts.sort).map(function(key) {
        var val = obj[key];
        if (val === void 0) {
          return "";
        }
        if (val === null) {
          return encode(key, opts);
        }
        if (Array.isArray(val)) {
          var result = [];
          val.slice().forEach(function(val2) {
            if (val2 === void 0) {
              return;
            }
            result.push(formatter(key, val2, result.length));
          });
          return result.join("&");
        }
        return encode(key, opts) + "=" + encode(val, opts);
      }).filter(function(x) {
        return x.length > 0;
      }).join("&") : "";
    };
    exports2.parseUrl = function(str, opts) {
      return {
        url: str.split("?")[0] || "",
        query: parse(extract(str), opts)
      };
    };
  }
});

// node_modules/prepend-http/index.js
var require_prepend_http = __commonJS({
  "node_modules/prepend-http/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (url, opts) => {
      if (typeof url !== "string") {
        throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof url}\``);
      }
      url = url.trim();
      opts = Object.assign({ https: false }, opts);
      if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
        return url;
      }
      return url.replace(/^(?!(?:\w+:)?\/\/)/, opts.https ? "https://" : "http://");
    };
  }
});

// node_modules/is-plain-obj/index.js
var require_is_plain_obj = __commonJS({
  "node_modules/is-plain-obj/index.js"(exports2, module2) {
    "use strict";
    var toString = Object.prototype.toString;
    module2.exports = function(x) {
      var prototype;
      return toString.call(x) === "[object Object]" && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
    };
  }
});

// node_modules/normalize-url/node_modules/sort-keys/index.js
var require_sort_keys = __commonJS({
  "node_modules/normalize-url/node_modules/sort-keys/index.js"(exports2, module2) {
    "use strict";
    var isPlainObj = require_is_plain_obj();
    module2.exports = (obj, opts) => {
      if (!isPlainObj(obj)) {
        throw new TypeError("Expected a plain object");
      }
      opts = opts || {};
      if (typeof opts === "function") {
        throw new TypeError("Specify the compare function as an option instead");
      }
      const deep = opts.deep;
      const seenInput = [];
      const seenOutput = [];
      const sortKeys = (x) => {
        const seenIndex = seenInput.indexOf(x);
        if (seenIndex !== -1) {
          return seenOutput[seenIndex];
        }
        const ret = {};
        const keys = Object.keys(x).sort(opts.compare);
        seenInput.push(x);
        seenOutput.push(ret);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const val = x[key];
          if (deep && Array.isArray(val)) {
            const retArr = [];
            for (let j = 0; j < val.length; j++) {
              retArr[j] = isPlainObj(val[j]) ? sortKeys(val[j]) : val[j];
            }
            ret[key] = retArr;
            continue;
          }
          ret[key] = deep && isPlainObj(val) ? sortKeys(val) : val;
        }
        return ret;
      };
      return sortKeys(obj);
    };
  }
});

// node_modules/normalize-url/index.js
var require_normalize_url = __commonJS({
  "node_modules/normalize-url/index.js"(exports2, module2) {
    "use strict";
    var url = require("url");
    var punycode = require("punycode");
    var queryString = require_query_string();
    var prependHttp = require_prepend_http();
    var sortKeys = require_sort_keys();
    var DEFAULT_PORTS = {
      "http:": 80,
      "https:": 443,
      "ftp:": 21
    };
    var slashedProtocol = {
      http: true,
      https: true,
      ftp: true,
      gopher: true,
      file: true,
      "http:": true,
      "https:": true,
      "ftp:": true,
      "gopher:": true,
      "file:": true
    };
    function testParameter(name, filters) {
      return filters.some((filter) => filter instanceof RegExp ? filter.test(name) : filter === name);
    }
    module2.exports = (str, opts) => {
      opts = Object.assign({
        normalizeProtocol: true,
        normalizeHttps: false,
        stripFragment: true,
        stripWWW: true,
        removeQueryParameters: [/^utm_\w+/i],
        removeTrailingSlash: true,
        removeDirectoryIndex: false,
        sortQueryParameters: true
      }, opts);
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      const hasRelativeProtocol = str.startsWith("//");
      str = prependHttp(str.trim()).replace(/^\/\//, "http://");
      const urlObj = url.parse(str);
      if (opts.normalizeHttps && urlObj.protocol === "https:") {
        urlObj.protocol = "http:";
      }
      if (!urlObj.hostname && !urlObj.pathname) {
        throw new Error("Invalid URL");
      }
      delete urlObj.host;
      delete urlObj.query;
      if (opts.stripFragment) {
        delete urlObj.hash;
      }
      const port = DEFAULT_PORTS[urlObj.protocol];
      if (Number(urlObj.port) === port) {
        delete urlObj.port;
      }
      if (urlObj.pathname) {
        urlObj.pathname = urlObj.pathname.replace(/\/{2,}/g, "/");
      }
      if (urlObj.pathname) {
        urlObj.pathname = decodeURI(urlObj.pathname);
      }
      if (opts.removeDirectoryIndex === true) {
        opts.removeDirectoryIndex = [/^index\.[a-z]+$/];
      }
      if (Array.isArray(opts.removeDirectoryIndex) && opts.removeDirectoryIndex.length > 0) {
        let pathComponents = urlObj.pathname.split("/");
        const lastComponent = pathComponents[pathComponents.length - 1];
        if (testParameter(lastComponent, opts.removeDirectoryIndex)) {
          pathComponents = pathComponents.slice(0, pathComponents.length - 1);
          urlObj.pathname = pathComponents.slice(1).join("/") + "/";
        }
      }
      if (slashedProtocol[urlObj.protocol]) {
        const domain = urlObj.protocol + "//" + urlObj.hostname;
        const relative = url.resolve(domain, urlObj.pathname);
        urlObj.pathname = relative.replace(domain, "");
      }
      if (urlObj.hostname) {
        urlObj.hostname = punycode.toUnicode(urlObj.hostname).toLowerCase();
        urlObj.hostname = urlObj.hostname.replace(/\.$/, "");
        if (opts.stripWWW) {
          urlObj.hostname = urlObj.hostname.replace(/^www\./, "");
        }
      }
      if (urlObj.search === "?") {
        delete urlObj.search;
      }
      const queryParameters = queryString.parse(urlObj.search);
      if (Array.isArray(opts.removeQueryParameters)) {
        for (const key in queryParameters) {
          if (testParameter(key, opts.removeQueryParameters)) {
            delete queryParameters[key];
          }
        }
      }
      if (opts.sortQueryParameters) {
        urlObj.search = queryString.stringify(sortKeys(queryParameters));
      }
      if (urlObj.search !== null) {
        urlObj.search = decodeURIComponent(urlObj.search);
      }
      str = url.format(urlObj);
      if (opts.removeTrailingSlash || urlObj.pathname === "/") {
        str = str.replace(/\/$/, "");
      }
      if (hasRelativeProtocol && !opts.normalizeProtocol) {
        str = str.replace(/^http:\/\//, "//");
      }
      return str;
    };
  }
});

// node_modules/get-stream/buffer-stream.js
var require_buffer_stream3 = __commonJS({
  "node_modules/get-stream/buffer-stream.js"(exports2, module2) {
    "use strict";
    var PassThrough = require("stream").PassThrough;
    module2.exports = (opts) => {
      opts = Object.assign({}, opts);
      const array = opts.array;
      let encoding = opts.encoding;
      const buffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || buffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (buffer) {
        encoding = null;
      }
      let len = 0;
      const ret = [];
      const stream2 = new PassThrough({ objectMode });
      if (encoding) {
        stream2.setEncoding(encoding);
      }
      stream2.on("data", (chunk) => {
        ret.push(chunk);
        if (objectMode) {
          len = ret.length;
        } else {
          len += chunk.length;
        }
      });
      stream2.getBufferedValue = () => {
        if (array) {
          return ret;
        }
        return buffer ? Buffer.concat(ret, len) : ret.join("");
      };
      stream2.getBufferedLength = () => len;
      return stream2;
    };
  }
});

// node_modules/get-stream/index.js
var require_get_stream3 = __commonJS({
  "node_modules/get-stream/index.js"(exports2, module2) {
    "use strict";
    var bufferStream = require_buffer_stream3();
    function getStream(inputStream, opts) {
      if (!inputStream) {
        return Promise.reject(new Error("Expected a stream"));
      }
      opts = Object.assign({ maxBuffer: Infinity }, opts);
      const maxBuffer = opts.maxBuffer;
      let stream2;
      let clean;
      const p = new Promise((resolve2, reject2) => {
        const error = (err) => {
          if (err) {
            err.bufferedData = stream2.getBufferedValue();
          }
          reject2(err);
        };
        stream2 = bufferStream(opts);
        inputStream.once("error", error);
        inputStream.pipe(stream2);
        stream2.on("data", () => {
          if (stream2.getBufferedLength() > maxBuffer) {
            reject2(new Error("maxBuffer exceeded"));
          }
        });
        stream2.once("error", error);
        stream2.on("end", resolve2);
        clean = () => {
          if (inputStream.unpipe) {
            inputStream.unpipe(stream2);
          }
        };
      });
      p.then(clean, clean);
      return p.then(() => stream2.getBufferedValue());
    }
    module2.exports = getStream;
    module2.exports.buffer = (stream2, opts) => getStream(stream2, Object.assign({}, opts, { encoding: "buffer" }));
    module2.exports.array = (stream2, opts) => getStream(stream2, Object.assign({}, opts, { array: true }));
  }
});

// node_modules/http-cache-semantics/node4/index.js
var require_node4 = __commonJS({
  "node_modules/http-cache-semantics/node4/index.js"(exports2, module2) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var statusCodeCacheableByDefault = [200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501];
    var understoodStatuses = [200, 203, 204, 300, 301, 302, 303, 307, 308, 404, 405, 410, 414, 501];
    var hopByHopHeaders = { "connection": true, "keep-alive": true, "proxy-authenticate": true, "proxy-authorization": true, "te": true, "trailer": true, "transfer-encoding": true, "upgrade": true };
    var excludedFromRevalidationUpdate = {
      "content-length": true,
      "content-encoding": true,
      "transfer-encoding": true,
      "content-range": true
    };
    function parseCacheControl(header) {
      var cc = {};
      if (!header)
        return cc;
      var parts = header.trim().split(/\s*,\s*/);
      for (var _iterator = parts, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ; ) {
        var _ref;
        if (_isArray) {
          if (_i >= _iterator.length)
            break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done)
            break;
          _ref = _i.value;
        }
        var part = _ref;
        var _part$split = part.split(/\s*=\s*/, 2), k = _part$split[0], v = _part$split[1];
        cc[k] = v === void 0 ? true : v.replace(/^"|"$/g, "");
      }
      return cc;
    }
    function formatCacheControl(cc) {
      var parts = [];
      for (var k in cc) {
        var v = cc[k];
        parts.push(v === true ? k : k + "=" + v);
      }
      if (!parts.length) {
        return void 0;
      }
      return parts.join(", ");
    }
    module2.exports = function() {
      function CachePolicy(req, res) {
        var _ref2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, shared = _ref2.shared, cacheHeuristic = _ref2.cacheHeuristic, immutableMinTimeToLive = _ref2.immutableMinTimeToLive, ignoreCargoCult = _ref2.ignoreCargoCult, _fromObject = _ref2._fromObject;
        _classCallCheck(this, CachePolicy);
        if (_fromObject) {
          this._fromObject(_fromObject);
          return;
        }
        if (!res || !res.headers) {
          throw Error("Response headers missing");
        }
        this._assertRequestHasHeaders(req);
        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._cacheHeuristic = cacheHeuristic !== void 0 ? cacheHeuristic : 0.1;
        this._immutableMinTtl = immutableMinTimeToLive !== void 0 ? immutableMinTimeToLive : 24 * 3600 * 1e3;
        this._status = "status" in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers["cache-control"]);
        this._method = "method" in req ? req.method : "GET";
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null;
        this._reqcc = parseCacheControl(req.headers["cache-control"]);
        if (ignoreCargoCult && "pre-check" in this._rescc && "post-check" in this._rescc) {
          delete this._rescc["pre-check"];
          delete this._rescc["post-check"];
          delete this._rescc["no-cache"];
          delete this._rescc["no-store"];
          delete this._rescc["must-revalidate"];
          this._resHeaders = Object.assign({}, this._resHeaders, { "cache-control": formatCacheControl(this._rescc) });
          delete this._resHeaders.expires;
          delete this._resHeaders.pragma;
        }
        if (!res.headers["cache-control"] && /no-cache/.test(res.headers.pragma)) {
          this._rescc["no-cache"] = true;
        }
      }
      CachePolicy.prototype.now = function now() {
        return Date.now();
      };
      CachePolicy.prototype.storable = function storable() {
        return !!(!this._reqcc["no-store"] && (this._method === "GET" || this._method === "HEAD" || this._method === "POST" && this._hasExplicitExpiration()) && understoodStatuses.indexOf(this._status) !== -1 && !this._rescc["no-store"] && (!this._isShared || !this._rescc.private) && (!this._isShared || this._noAuthorization || this._allowsStoringAuthenticated()) && (this._resHeaders.expires || this._rescc.public || this._rescc["max-age"] || this._rescc["s-maxage"] || statusCodeCacheableByDefault.indexOf(this._status) !== -1));
      };
      CachePolicy.prototype._hasExplicitExpiration = function _hasExplicitExpiration() {
        return this._isShared && this._rescc["s-maxage"] || this._rescc["max-age"] || this._resHeaders.expires;
      };
      CachePolicy.prototype._assertRequestHasHeaders = function _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
          throw Error("Request headers missing");
        }
      };
      CachePolicy.prototype.satisfiesWithoutRevalidation = function satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);
        var requestCC = parseCacheControl(req.headers["cache-control"]);
        if (requestCC["no-cache"] || /no-cache/.test(req.headers.pragma)) {
          return false;
        }
        if (requestCC["max-age"] && this.age() > requestCC["max-age"]) {
          return false;
        }
        if (requestCC["min-fresh"] && this.timeToLive() < 1e3 * requestCC["min-fresh"]) {
          return false;
        }
        if (this.stale()) {
          var allowsStale = requestCC["max-stale"] && !this._rescc["must-revalidate"] && (requestCC["max-stale"] === true || requestCC["max-stale"] > this.age() - this.maxAge());
          if (!allowsStale) {
            return false;
          }
        }
        return this._requestMatches(req, false);
      };
      CachePolicy.prototype._requestMatches = function _requestMatches(req, allowHeadMethod) {
        return (!this._url || this._url === req.url) && this._host === req.headers.host && (!req.method || this._method === req.method || allowHeadMethod && req.method === "HEAD") && this._varyMatches(req);
      };
      CachePolicy.prototype._allowsStoringAuthenticated = function _allowsStoringAuthenticated() {
        return this._rescc["must-revalidate"] || this._rescc.public || this._rescc["s-maxage"];
      };
      CachePolicy.prototype._varyMatches = function _varyMatches(req) {
        if (!this._resHeaders.vary) {
          return true;
        }
        if (this._resHeaders.vary === "*") {
          return false;
        }
        var fields = this._resHeaders.vary.trim().toLowerCase().split(/\s*,\s*/);
        for (var _iterator2 = fields, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ; ) {
          var _ref3;
          if (_isArray2) {
            if (_i2 >= _iterator2.length)
              break;
            _ref3 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done)
              break;
            _ref3 = _i2.value;
          }
          var name = _ref3;
          if (req.headers[name] !== this._reqHeaders[name])
            return false;
        }
        return true;
      };
      CachePolicy.prototype._copyWithoutHopByHopHeaders = function _copyWithoutHopByHopHeaders(inHeaders) {
        var headers = {};
        for (var name in inHeaders) {
          if (hopByHopHeaders[name])
            continue;
          headers[name] = inHeaders[name];
        }
        if (inHeaders.connection) {
          var tokens = inHeaders.connection.trim().split(/\s*,\s*/);
          for (var _iterator3 = tokens, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator](); ; ) {
            var _ref4;
            if (_isArray3) {
              if (_i3 >= _iterator3.length)
                break;
              _ref4 = _iterator3[_i3++];
            } else {
              _i3 = _iterator3.next();
              if (_i3.done)
                break;
              _ref4 = _i3.value;
            }
            var _name = _ref4;
            delete headers[_name];
          }
        }
        if (headers.warning) {
          var warnings = headers.warning.split(/,/).filter(function(warning) {
            return !/^\s*1[0-9][0-9]/.test(warning);
          });
          if (!warnings.length) {
            delete headers.warning;
          } else {
            headers.warning = warnings.join(",").trim();
          }
        }
        return headers;
      };
      CachePolicy.prototype.responseHeaders = function responseHeaders() {
        var headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        var age = this.age();
        if (age > 3600 * 24 && !this._hasExplicitExpiration() && this.maxAge() > 3600 * 24) {
          headers.warning = (headers.warning ? `${headers.warning}, ` : "") + '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        return headers;
      };
      CachePolicy.prototype.date = function date() {
        var dateValue = Date.parse(this._resHeaders.date);
        var maxClockDrift = 8 * 3600 * 1e3;
        if (Number.isNaN(dateValue) || dateValue < this._responseTime - maxClockDrift || dateValue > this._responseTime + maxClockDrift) {
          return this._responseTime;
        }
        return dateValue;
      };
      CachePolicy.prototype.age = function age() {
        var age2 = Math.max(0, (this._responseTime - this.date()) / 1e3);
        if (this._resHeaders.age) {
          var ageValue = this._ageValue();
          if (ageValue > age2)
            age2 = ageValue;
        }
        var residentTime = (this.now() - this._responseTime) / 1e3;
        return age2 + residentTime;
      };
      CachePolicy.prototype._ageValue = function _ageValue() {
        var ageValue = parseInt(this._resHeaders.age);
        return isFinite(ageValue) ? ageValue : 0;
      };
      CachePolicy.prototype.maxAge = function maxAge() {
        if (!this.storable() || this._rescc["no-cache"]) {
          return 0;
        }
        if (this._isShared && this._resHeaders["set-cookie"] && !this._rescc.public && !this._rescc.immutable) {
          return 0;
        }
        if (this._resHeaders.vary === "*") {
          return 0;
        }
        if (this._isShared) {
          if (this._rescc["proxy-revalidate"]) {
            return 0;
          }
          if (this._rescc["s-maxage"]) {
            return parseInt(this._rescc["s-maxage"], 10);
          }
        }
        if (this._rescc["max-age"]) {
          return parseInt(this._rescc["max-age"], 10);
        }
        var defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;
        var dateValue = this.date();
        if (this._resHeaders.expires) {
          var expires = Date.parse(this._resHeaders.expires);
          if (Number.isNaN(expires) || expires < dateValue) {
            return 0;
          }
          return Math.max(defaultMinTtl, (expires - dateValue) / 1e3);
        }
        if (this._resHeaders["last-modified"]) {
          var lastModified = Date.parse(this._resHeaders["last-modified"]);
          if (isFinite(lastModified) && dateValue > lastModified) {
            return Math.max(defaultMinTtl, (dateValue - lastModified) / 1e3 * this._cacheHeuristic);
          }
        }
        return defaultMinTtl;
      };
      CachePolicy.prototype.timeToLive = function timeToLive() {
        return Math.max(0, this.maxAge() - this.age()) * 1e3;
      };
      CachePolicy.prototype.stale = function stale() {
        return this.maxAge() <= this.age();
      };
      CachePolicy.fromObject = function fromObject(obj) {
        return new this(void 0, void 0, { _fromObject: obj });
      };
      CachePolicy.prototype._fromObject = function _fromObject(obj) {
        if (this._responseTime)
          throw Error("Reinitialized");
        if (!obj || obj.v !== 1)
          throw Error("Invalid serialization");
        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl = obj.imm !== void 0 ? obj.imm : 24 * 3600 * 1e3;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
      };
      CachePolicy.prototype.toObject = function toObject() {
        return {
          v: 1,
          t: this._responseTime,
          sh: this._isShared,
          ch: this._cacheHeuristic,
          imm: this._immutableMinTtl,
          st: this._status,
          resh: this._resHeaders,
          rescc: this._rescc,
          m: this._method,
          u: this._url,
          h: this._host,
          a: this._noAuthorization,
          reqh: this._reqHeaders,
          reqcc: this._reqcc
        };
      };
      CachePolicy.prototype.revalidationHeaders = function revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        var headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);
        delete headers["if-range"];
        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
          delete headers["if-none-match"];
          delete headers["if-modified-since"];
          return headers;
        }
        if (this._resHeaders.etag) {
          headers["if-none-match"] = headers["if-none-match"] ? `${headers["if-none-match"]}, ${this._resHeaders.etag}` : this._resHeaders.etag;
        }
        var forbidsWeakValidators = headers["accept-ranges"] || headers["if-match"] || headers["if-unmodified-since"] || this._method && this._method != "GET";
        if (forbidsWeakValidators) {
          delete headers["if-modified-since"];
          if (headers["if-none-match"]) {
            var etags = headers["if-none-match"].split(/,/).filter(function(etag) {
              return !/^\s*W\//.test(etag);
            });
            if (!etags.length) {
              delete headers["if-none-match"];
            } else {
              headers["if-none-match"] = etags.join(",").trim();
            }
          }
        } else if (this._resHeaders["last-modified"] && !headers["if-modified-since"]) {
          headers["if-modified-since"] = this._resHeaders["last-modified"];
        }
        return headers;
      };
      CachePolicy.prototype.revalidatedPolicy = function revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if (!response || !response.headers) {
          throw Error("Response headers missing");
        }
        var matches = false;
        if (response.status !== void 0 && response.status != 304) {
          matches = false;
        } else if (response.headers.etag && !/^\s*W\//.test(response.headers.etag)) {
          matches = this._resHeaders.etag && this._resHeaders.etag.replace(/^\s*W\//, "") === response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
          matches = this._resHeaders.etag.replace(/^\s*W\//, "") === response.headers.etag.replace(/^\s*W\//, "");
        } else if (this._resHeaders["last-modified"]) {
          matches = this._resHeaders["last-modified"] === response.headers["last-modified"];
        } else {
          if (!this._resHeaders.etag && !this._resHeaders["last-modified"] && !response.headers.etag && !response.headers["last-modified"]) {
            matches = true;
          }
        }
        if (!matches) {
          return {
            policy: new this.constructor(request, response),
            modified: true
          };
        }
        var headers = {};
        for (var k in this._resHeaders) {
          headers[k] = k in response.headers && !excludedFromRevalidationUpdate[k] ? response.headers[k] : this._resHeaders[k];
        }
        var newResponse = Object.assign({}, response, {
          status: this._status,
          method: this._method,
          headers
        });
        return {
          policy: new this.constructor(request, newResponse),
          modified: false
        };
      };
      return CachePolicy;
    }();
  }
});

// node_modules/lowercase-keys/index.js
var require_lowercase_keys = __commonJS({
  "node_modules/lowercase-keys/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(obj) {
      var ret = {};
      var keys = Object.keys(Object(obj));
      for (var i = 0; i < keys.length; i++) {
        ret[keys[i].toLowerCase()] = obj[keys[i]];
      }
      return ret;
    };
  }
});

// node_modules/responselike/src/index.js
var require_src = __commonJS({
  "node_modules/responselike/src/index.js"(exports2, module2) {
    "use strict";
    var Readable = require("stream").Readable;
    var lowercaseKeys = require_lowercase_keys();
    var Response = class extends Readable {
      constructor(statusCode, headers, body, url) {
        if (typeof statusCode !== "number") {
          throw new TypeError("Argument `statusCode` should be a number");
        }
        if (typeof headers !== "object") {
          throw new TypeError("Argument `headers` should be an object");
        }
        if (!(body instanceof Buffer)) {
          throw new TypeError("Argument `body` should be a buffer");
        }
        if (typeof url !== "string") {
          throw new TypeError("Argument `url` should be a string");
        }
        super();
        this.statusCode = statusCode;
        this.headers = lowercaseKeys(headers);
        this.body = body;
        this.url = url;
      }
      _read() {
        this.push(this.body);
        this.push(null);
      }
    };
    module2.exports = Response;
  }
});

// node_modules/cacheable-request/node_modules/lowercase-keys/index.js
var require_lowercase_keys2 = __commonJS({
  "node_modules/cacheable-request/node_modules/lowercase-keys/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(obj) {
      var ret = {};
      var keys = Object.keys(Object(obj));
      for (var i = 0; i < keys.length; i++) {
        ret[keys[i].toLowerCase()] = obj[keys[i]];
      }
      return ret;
    };
  }
});

// node_modules/mimic-response/index.js
var require_mimic_response = __commonJS({
  "node_modules/mimic-response/index.js"(exports2, module2) {
    "use strict";
    var knownProps = [
      "destroy",
      "setTimeout",
      "socket",
      "headers",
      "trailers",
      "rawHeaders",
      "statusCode",
      "httpVersion",
      "httpVersionMinor",
      "httpVersionMajor",
      "rawTrailers",
      "statusMessage"
    ];
    module2.exports = (fromStream, toStream) => {
      const fromProps = new Set(Object.keys(fromStream).concat(knownProps));
      for (const prop of fromProps) {
        if (prop in toStream) {
          continue;
        }
        toStream[prop] = typeof fromStream[prop] === "function" ? fromStream[prop].bind(fromStream) : fromStream[prop];
      }
    };
  }
});

// node_modules/clone-response/src/index.js
var require_src2 = __commonJS({
  "node_modules/clone-response/src/index.js"(exports2, module2) {
    "use strict";
    var PassThrough = require("stream").PassThrough;
    var mimicResponse = require_mimic_response();
    var cloneResponse = (response) => {
      if (!(response && response.pipe)) {
        throw new TypeError("Parameter `response` must be a response stream.");
      }
      const clone = new PassThrough();
      mimicResponse(response, clone);
      return response.pipe(clone);
    };
    module2.exports = cloneResponse;
  }
});

// node_modules/json-buffer/index.js
var require_json_buffer = __commonJS({
  "node_modules/json-buffer/index.js"(exports2) {
    exports2.stringify = function stringify(o) {
      if (typeof o == "undefined")
        return o;
      if (o && Buffer.isBuffer(o))
        return JSON.stringify(":base64:" + o.toString("base64"));
      if (o && o.toJSON)
        o = o.toJSON();
      if (o && typeof o === "object") {
        var s = "";
        var array = Array.isArray(o);
        s = array ? "[" : "{";
        var first = true;
        for (var k in o) {
          var ignore = typeof o[k] == "function" || !array && typeof o[k] === "undefined";
          if (Object.hasOwnProperty.call(o, k) && !ignore) {
            if (!first)
              s += ",";
            first = false;
            if (array) {
              if (o[k] == void 0)
                s += "null";
              else
                s += stringify(o[k]);
            } else if (o[k] !== void 0) {
              s += stringify(k) + ":" + stringify(o[k]);
            }
          }
        }
        s += array ? "]" : "}";
        return s;
      } else if (typeof o === "string") {
        return JSON.stringify(/^:/.test(o) ? ":" + o : o);
      } else if (typeof o === "undefined") {
        return "null";
      } else
        return JSON.stringify(o);
    };
    exports2.parse = function(s) {
      return JSON.parse(s, function(key, value) {
        if (typeof value === "string") {
          if (/^:base64:/.test(value))
            return new Buffer(value.substring(8), "base64");
          else
            return /^:/.test(value) ? value.substring(1) : value;
        }
        return value;
      });
    };
  }
});

// node_modules/keyv/src/index.js
var require_src3 = __commonJS({
  "node_modules/keyv/src/index.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var JSONB = require_json_buffer();
    var loadStore = (opts) => {
      const adapters = {
        redis: "@keyv/redis",
        mongodb: "@keyv/mongo",
        mongo: "@keyv/mongo",
        sqlite: "@keyv/sqlite",
        postgresql: "@keyv/postgres",
        postgres: "@keyv/postgres",
        mysql: "@keyv/mysql"
      };
      if (opts.adapter || opts.uri) {
        const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
        return new (require(adapters[adapter]))(opts);
      }
      return /* @__PURE__ */ new Map();
    };
    var Keyv = class extends EventEmitter {
      constructor(uri, opts) {
        super();
        this.opts = Object.assign({ namespace: "keyv" }, typeof uri === "string" ? { uri } : uri, opts);
        if (!this.opts.store) {
          const adapterOpts = Object.assign({}, this.opts);
          this.opts.store = loadStore(adapterOpts);
        }
        if (typeof this.opts.store.on === "function") {
          this.opts.store.on("error", (err) => this.emit("error", err));
        }
        this.opts.store.namespace = this.opts.namespace;
      }
      _getKeyPrefix(key) {
        return `${this.opts.namespace}:${key}`;
      }
      get(key) {
        key = this._getKeyPrefix(key);
        const store = this.opts.store;
        return Promise.resolve().then(() => store.get(key)).then((data) => {
          data = typeof data === "string" ? JSONB.parse(data) : data;
          if (data === void 0) {
            return void 0;
          }
          if (typeof data.expires === "number" && Date.now() > data.expires) {
            this.delete(key);
            return void 0;
          }
          return data.value;
        });
      }
      set(key, value, ttl) {
        key = this._getKeyPrefix(key);
        if (typeof ttl === "undefined") {
          ttl = this.opts.ttl;
        }
        if (ttl === 0) {
          ttl = void 0;
        }
        const store = this.opts.store;
        return Promise.resolve().then(() => {
          const expires = typeof ttl === "number" ? Date.now() + ttl : null;
          value = { value, expires };
          return store.set(key, JSONB.stringify(value), ttl);
        }).then(() => true);
      }
      delete(key) {
        key = this._getKeyPrefix(key);
        const store = this.opts.store;
        return Promise.resolve().then(() => store.delete(key));
      }
      clear() {
        const store = this.opts.store;
        return Promise.resolve().then(() => store.clear());
      }
    };
    module2.exports = Keyv;
  }
});

// node_modules/cacheable-request/src/index.js
var require_src4 = __commonJS({
  "node_modules/cacheable-request/src/index.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var urlLib = require("url");
    var normalizeUrl = require_normalize_url();
    var getStream = require_get_stream3();
    var CachePolicy = require_node4();
    var Response = require_src();
    var lowercaseKeys = require_lowercase_keys2();
    var cloneResponse = require_src2();
    var Keyv = require_src3();
    var CacheableRequest = class {
      constructor(request, cacheAdapter) {
        if (typeof request !== "function") {
          throw new TypeError("Parameter `request` must be a function");
        }
        this.cache = new Keyv({
          uri: typeof cacheAdapter === "string" && cacheAdapter,
          store: typeof cacheAdapter !== "string" && cacheAdapter,
          namespace: "cacheable-request"
        });
        return this.createCacheableRequest(request);
      }
      createCacheableRequest(request) {
        return (opts, cb) => {
          if (typeof opts === "string") {
            opts = urlLib.parse(opts);
          }
          opts = Object.assign({
            headers: {},
            method: "GET",
            cache: true,
            strictTtl: false,
            automaticFailover: false
          }, opts);
          opts.headers = lowercaseKeys(opts.headers);
          const ee = new EventEmitter();
          const url = normalizeUrl(urlLib.format(opts));
          const key = `${opts.method}:${url}`;
          let revalidate = false;
          let madeRequest = false;
          const makeRequest = (opts2) => {
            madeRequest = true;
            const handler = (response) => {
              if (revalidate) {
                const revalidatedPolicy = CachePolicy.fromObject(revalidate.cachePolicy).revalidatedPolicy(opts2, response);
                if (!revalidatedPolicy.modified) {
                  const headers = revalidatedPolicy.policy.responseHeaders();
                  response = new Response(response.statusCode, headers, revalidate.body, revalidate.url);
                  response.cachePolicy = revalidatedPolicy.policy;
                  response.fromCache = true;
                }
              }
              if (!response.fromCache) {
                response.cachePolicy = new CachePolicy(opts2, response);
                response.fromCache = false;
              }
              let clonedResponse;
              if (opts2.cache && response.cachePolicy.storable()) {
                clonedResponse = cloneResponse(response);
                getStream.buffer(response).then((body) => {
                  const value = {
                    cachePolicy: response.cachePolicy.toObject(),
                    url: response.url,
                    statusCode: response.fromCache ? revalidate.statusCode : response.statusCode,
                    body
                  };
                  const ttl = opts2.strictTtl ? response.cachePolicy.timeToLive() : void 0;
                  return this.cache.set(key, value, ttl);
                }).catch((err) => ee.emit("error", new CacheableRequest.CacheError(err)));
              } else if (opts2.cache && revalidate) {
                this.cache.delete(key).catch((err) => ee.emit("error", new CacheableRequest.CacheError(err)));
              }
              ee.emit("response", clonedResponse || response);
              if (typeof cb === "function") {
                cb(clonedResponse || response);
              }
            };
            try {
              const req = request(opts2, handler);
              ee.emit("request", req);
            } catch (err) {
              ee.emit("error", new CacheableRequest.RequestError(err));
            }
          };
          const get = (opts2) => Promise.resolve().then(() => opts2.cache ? this.cache.get(key) : void 0).then((cacheEntry) => {
            if (typeof cacheEntry === "undefined") {
              return makeRequest(opts2);
            }
            const policy = CachePolicy.fromObject(cacheEntry.cachePolicy);
            if (policy.satisfiesWithoutRevalidation(opts2)) {
              const headers = policy.responseHeaders();
              const response = new Response(cacheEntry.statusCode, headers, cacheEntry.body, cacheEntry.url);
              response.cachePolicy = policy;
              response.fromCache = true;
              ee.emit("response", response);
              if (typeof cb === "function") {
                cb(response);
              }
            } else {
              revalidate = cacheEntry;
              opts2.headers = policy.revalidationHeaders(opts2);
              makeRequest(opts2);
            }
          });
          this.cache.on("error", (err) => ee.emit("error", new CacheableRequest.CacheError(err)));
          get(opts).catch((err) => {
            if (opts.automaticFailover && !madeRequest) {
              makeRequest(opts);
            }
            ee.emit("error", new CacheableRequest.CacheError(err));
          });
          return ee;
        };
      }
    };
    CacheableRequest.RequestError = class extends Error {
      constructor(err) {
        super(err.message);
        this.name = "RequestError";
        Object.assign(this, err);
      }
    };
    CacheableRequest.CacheError = class extends Error {
      constructor(err) {
        super(err.message);
        this.name = "CacheError";
        Object.assign(this, err);
      }
    };
    module2.exports = CacheableRequest;
  }
});

// node_modules/duplexer3/index.js
var require_duplexer3 = __commonJS({
  "node_modules/duplexer3/index.js"(exports2, module2) {
    "use strict";
    var stream2 = require("stream");
    function DuplexWrapper(options, writable, readable) {
      if (typeof readable === "undefined") {
        readable = writable;
        writable = options;
        options = null;
      }
      stream2.Duplex.call(this, options);
      if (typeof readable.read !== "function") {
        readable = new stream2.Readable(options).wrap(readable);
      }
      this._writable = writable;
      this._readable = readable;
      this._waiting = false;
      var self = this;
      writable.once("finish", function() {
        self.end();
      });
      this.once("finish", function() {
        writable.end();
      });
      readable.on("readable", function() {
        if (self._waiting) {
          self._waiting = false;
          self._read();
        }
      });
      readable.once("end", function() {
        self.push(null);
      });
      if (!options || typeof options.bubbleErrors === "undefined" || options.bubbleErrors) {
        writable.on("error", function(err) {
          self.emit("error", err);
        });
        readable.on("error", function(err) {
          self.emit("error", err);
        });
      }
    }
    DuplexWrapper.prototype = Object.create(stream2.Duplex.prototype, { constructor: { value: DuplexWrapper } });
    DuplexWrapper.prototype._write = function _write(input, encoding, done) {
      this._writable.write(input, encoding, done);
    };
    DuplexWrapper.prototype._read = function _read() {
      var buf;
      var reads = 0;
      while ((buf = this._readable.read()) !== null) {
        this.push(buf);
        reads++;
      }
      if (reads === 0) {
        this._waiting = true;
      }
    };
    module2.exports = function duplex2(options, writable, readable) {
      return new DuplexWrapper(options, writable, readable);
    };
    module2.exports.DuplexWrapper = DuplexWrapper;
  }
});

// node_modules/from2/index.js
var require_from2 = __commonJS({
  "node_modules/from2/index.js"(exports2, module2) {
    var Readable = require_readable().Readable;
    var inherits = require_inherits();
    module2.exports = from2;
    from2.ctor = ctor;
    from2.obj = obj;
    var Proto = ctor();
    function toFunction(list) {
      list = list.slice();
      return function(_, cb) {
        var err = null;
        var item = list.length ? list.shift() : null;
        if (item instanceof Error) {
          err = item;
          item = null;
        }
        cb(err, item);
      };
    }
    function from2(opts, read) {
      if (typeof opts !== "object" || Array.isArray(opts)) {
        read = opts;
        opts = {};
      }
      var rs = new Proto(opts);
      rs._from = Array.isArray(read) ? toFunction(read) : read || noop;
      return rs;
    }
    function ctor(opts, read) {
      if (typeof opts === "function") {
        read = opts;
        opts = {};
      }
      opts = defaults(opts);
      inherits(Class, Readable);
      function Class(override) {
        if (!(this instanceof Class))
          return new Class(override);
        this._reading = false;
        this._callback = check;
        this.destroyed = false;
        Readable.call(this, override || opts);
        var self = this;
        var hwm = this._readableState.highWaterMark;
        function check(err, data) {
          if (self.destroyed)
            return;
          if (err)
            return self.destroy(err);
          if (data === null)
            return self.push(null);
          self._reading = false;
          if (self.push(data))
            self._read(hwm);
        }
      }
      Class.prototype._from = read || noop;
      Class.prototype._read = function(size) {
        if (this._reading || this.destroyed)
          return;
        this._reading = true;
        this._from(size, this._callback);
      };
      Class.prototype.destroy = function(err) {
        if (this.destroyed)
          return;
        this.destroyed = true;
        var self = this;
        process.nextTick(function() {
          if (err)
            self.emit("error", err);
          self.emit("close");
        });
      };
      return Class;
    }
    function obj(opts, read) {
      if (typeof opts === "function" || Array.isArray(opts)) {
        read = opts;
        opts = {};
      }
      opts = defaults(opts);
      opts.objectMode = true;
      opts.highWaterMark = 16;
      return from2(opts, read);
    }
    function noop() {
    }
    function defaults(opts) {
      opts = opts || {};
      return opts;
    }
  }
});

// node_modules/p-is-promise/index.js
var require_p_is_promise = __commonJS({
  "node_modules/p-is-promise/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (x) => x instanceof Promise || x !== null && typeof x === "object" && typeof x.then === "function" && typeof x.catch === "function";
  }
});

// node_modules/into-stream/index.js
var require_into_stream = __commonJS({
  "node_modules/into-stream/index.js"(exports2, module2) {
    "use strict";
    var from = require_from2();
    var pIsPromise = require_p_is_promise();
    module2.exports = (x) => {
      if (Array.isArray(x)) {
        x = x.slice();
      }
      let promise;
      let iterator;
      prepare(x);
      function prepare(value) {
        x = value;
        promise = pIsPromise(x) ? x : null;
        const shouldIterate = !promise && x[Symbol.iterator] && typeof x !== "string" && !Buffer.isBuffer(x);
        iterator = shouldIterate ? x[Symbol.iterator]() : null;
      }
      return from(function reader(size, cb) {
        if (promise) {
          promise.then(prepare).then(() => reader.call(this, size, cb), cb);
          return;
        }
        if (iterator) {
          const obj = iterator.next();
          setImmediate(cb, null, obj.done ? null : obj.value);
          return;
        }
        if (x.length === 0) {
          setImmediate(cb, null, null);
          return;
        }
        const chunk = x.slice(0, size);
        x = x.slice(size);
        setImmediate(cb, null, chunk);
      });
    };
    module2.exports.obj = (x) => {
      if (Array.isArray(x)) {
        x = x.slice();
      }
      let promise;
      let iterator;
      prepare(x);
      function prepare(value) {
        x = value;
        promise = pIsPromise(x) ? x : null;
        iterator = !promise && x[Symbol.iterator] ? x[Symbol.iterator]() : null;
      }
      return from.obj(function reader(size, cb) {
        if (promise) {
          promise.then(prepare).then(() => reader.call(this, size, cb), cb);
          return;
        }
        if (iterator) {
          const obj = iterator.next();
          setImmediate(cb, null, obj.done ? null : obj.value);
          return;
        }
        this.push(x);
        setImmediate(cb, null, null);
      });
    };
  }
});

// node_modules/@sindresorhus/is/dist/index.js
var require_dist = __commonJS({
  "node_modules/@sindresorhus/is/dist/index.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util = require("util");
    var toString = Object.prototype.toString;
    var isOfType = (type) => (value) => typeof value === type;
    var getObjectType = (value) => {
      const objectName = toString.call(value).slice(8, -1);
      if (objectName) {
        return objectName;
      }
      return null;
    };
    var isObjectOfType = (typeName) => (value) => {
      return getObjectType(value) === typeName;
    };
    function is(value) {
      if (value === null) {
        return "null";
      }
      if (value === true || value === false) {
        return "boolean";
      }
      const type = typeof value;
      if (type === "undefined") {
        return "undefined";
      }
      if (type === "string") {
        return "string";
      }
      if (type === "number") {
        return "number";
      }
      if (type === "symbol") {
        return "symbol";
      }
      if (is.function_(value)) {
        return "Function";
      }
      if (Array.isArray(value)) {
        return "Array";
      }
      if (Buffer.isBuffer(value)) {
        return "Buffer";
      }
      const tagType = getObjectType(value);
      if (tagType) {
        return tagType;
      }
      if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError("Please don't use object wrappers for primitive types");
      }
      return "Object";
    }
    (function(is2) {
      const isObject = (value) => typeof value === "object";
      is2.undefined = isOfType("undefined");
      is2.string = isOfType("string");
      is2.number = isOfType("number");
      is2.function_ = isOfType("function");
      is2.null_ = (value) => value === null;
      is2.class_ = (value) => is2.function_(value) && value.toString().startsWith("class ");
      is2.boolean = (value) => value === true || value === false;
      is2.symbol = isOfType("symbol");
      is2.array = Array.isArray;
      is2.buffer = Buffer.isBuffer;
      is2.nullOrUndefined = (value) => is2.null_(value) || is2.undefined(value);
      is2.object = (value) => !is2.nullOrUndefined(value) && (is2.function_(value) || isObject(value));
      is2.iterable = (value) => !is2.nullOrUndefined(value) && is2.function_(value[Symbol.iterator]);
      is2.generator = (value) => is2.iterable(value) && is2.function_(value.next) && is2.function_(value.throw);
      is2.nativePromise = isObjectOfType("Promise");
      const hasPromiseAPI = (value) => !is2.null_(value) && isObject(value) && is2.function_(value.then) && is2.function_(value.catch);
      is2.promise = (value) => is2.nativePromise(value) || hasPromiseAPI(value);
      const isFunctionOfType = (type) => (value) => is2.function_(value) && is2.function_(value.constructor) && value.constructor.name === type;
      is2.generatorFunction = isFunctionOfType("GeneratorFunction");
      is2.asyncFunction = isFunctionOfType("AsyncFunction");
      is2.boundFunction = (value) => is2.function_(value) && !value.hasOwnProperty("prototype");
      is2.regExp = isObjectOfType("RegExp");
      is2.date = isObjectOfType("Date");
      is2.error = isObjectOfType("Error");
      is2.map = isObjectOfType("Map");
      is2.set = isObjectOfType("Set");
      is2.weakMap = isObjectOfType("WeakMap");
      is2.weakSet = isObjectOfType("WeakSet");
      is2.int8Array = isObjectOfType("Int8Array");
      is2.uint8Array = isObjectOfType("Uint8Array");
      is2.uint8ClampedArray = isObjectOfType("Uint8ClampedArray");
      is2.int16Array = isObjectOfType("Int16Array");
      is2.uint16Array = isObjectOfType("Uint16Array");
      is2.int32Array = isObjectOfType("Int32Array");
      is2.uint32Array = isObjectOfType("Uint32Array");
      is2.float32Array = isObjectOfType("Float32Array");
      is2.float64Array = isObjectOfType("Float64Array");
      is2.arrayBuffer = isObjectOfType("ArrayBuffer");
      is2.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer");
      is2.dataView = isObjectOfType("DataView");
      is2.directInstanceOf = (instance, klass) => is2.object(instance) && is2.object(klass) && Object.getPrototypeOf(instance) === klass.prototype;
      is2.truthy = (value) => Boolean(value);
      is2.falsy = (value) => !value;
      is2.nan = (value) => Number.isNaN(value);
      const primitiveTypes = /* @__PURE__ */ new Set([
        "undefined",
        "string",
        "number",
        "boolean",
        "symbol"
      ]);
      is2.primitive = (value) => is2.null_(value) || primitiveTypes.has(typeof value);
      is2.integer = (value) => Number.isInteger(value);
      is2.safeInteger = (value) => Number.isSafeInteger(value);
      is2.plainObject = (value) => {
        let prototype;
        return getObjectType(value) === "Object" && (prototype = Object.getPrototypeOf(value), prototype === null || prototype === Object.getPrototypeOf({}));
      };
      const typedArrayTypes = /* @__PURE__ */ new Set([
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "Float32Array",
        "Float64Array"
      ]);
      is2.typedArray = (value) => {
        const objectType = getObjectType(value);
        if (objectType === null) {
          return false;
        }
        return typedArrayTypes.has(objectType);
      };
      const isValidLength = (value) => is2.safeInteger(value) && value > -1;
      is2.arrayLike = (value) => !is2.nullOrUndefined(value) && !is2.function_(value) && isValidLength(value.length);
      is2.inRange = (value, range) => {
        if (is2.number(range)) {
          return value >= Math.min(0, range) && value <= Math.max(range, 0);
        }
        if (is2.array(range) && range.length === 2) {
          return value >= Math.min.apply(null, range) && value <= Math.max.apply(null, range);
        }
        throw new TypeError(`Invalid range: ${util.inspect(range)}`);
      };
      const NODE_TYPE_ELEMENT = 1;
      const DOM_PROPERTIES_TO_CHECK = [
        "innerHTML",
        "ownerDocument",
        "style",
        "attributes",
        "nodeValue"
      ];
      is2.domElement = (value) => is2.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is2.string(value.nodeName) && !is2.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every((property) => property in value);
      is2.nodeStream = (value) => !is2.nullOrUndefined(value) && isObject(value) && is2.function_(value.pipe);
      is2.infinite = (value) => value === Infinity || value === -Infinity;
      const isAbsoluteMod2 = (value) => (rem) => is2.integer(rem) && Math.abs(rem % 2) === value;
      is2.even = isAbsoluteMod2(0);
      is2.odd = isAbsoluteMod2(1);
      const isWhiteSpaceString = (value) => is2.string(value) && /\S/.test(value) === false;
      const isEmptyStringOrArray = (value) => (is2.string(value) || is2.array(value)) && value.length === 0;
      const isEmptyObject = (value) => !is2.map(value) && !is2.set(value) && is2.object(value) && Object.keys(value).length === 0;
      const isEmptyMapOrSet = (value) => (is2.map(value) || is2.set(value)) && value.size === 0;
      is2.empty = (value) => is2.falsy(value) || isEmptyStringOrArray(value) || isEmptyObject(value) || isEmptyMapOrSet(value);
      is2.emptyOrWhitespace = (value) => is2.empty(value) || isWhiteSpaceString(value);
      const predicateOnArray = (method, predicate, args) => {
        const values = Array.prototype.slice.call(args, 1);
        if (is2.function_(predicate) === false) {
          throw new TypeError(`Invalid predicate: ${util.inspect(predicate)}`);
        }
        if (values.length === 0) {
          throw new TypeError("Invalid number of values");
        }
        return method.call(values, predicate);
      };
      function any(predicate) {
        return predicateOnArray(Array.prototype.some, predicate, arguments);
      }
      is2.any = any;
      function all(predicate) {
        return predicateOnArray(Array.prototype.every, predicate, arguments);
      }
      is2.all = all;
    })(is || (is = {}));
    Object.defineProperties(is, {
      class: {
        value: is.class_
      },
      function: {
        value: is.function_
      },
      null: {
        value: is.null_
      }
    });
    exports2.default = is;
    module2.exports = is;
    module2.exports.default = is;
  }
});

// node_modules/timed-out/index.js
var require_timed_out = __commonJS({
  "node_modules/timed-out/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(req, time) {
      if (req.timeoutTimer) {
        return req;
      }
      var delays = isNaN(time) ? time : { socket: time, connect: time };
      var host = req._headers ? " to " + req._headers.host : "";
      if (delays.connect !== void 0) {
        req.timeoutTimer = setTimeout(function timeoutHandler() {
          req.abort();
          var e = new Error("Connection timed out on request" + host);
          e.code = "ETIMEDOUT";
          req.emit("error", e);
        }, delays.connect);
      }
      req.on("socket", function assign(socket) {
        if (!(socket.connecting || socket._connecting)) {
          connect();
          return;
        }
        socket.once("connect", connect);
      });
      function clear() {
        if (req.timeoutTimer) {
          clearTimeout(req.timeoutTimer);
          req.timeoutTimer = null;
        }
      }
      function connect() {
        clear();
        if (delays.socket !== void 0) {
          req.setTimeout(delays.socket, function socketTimeoutHandler() {
            req.abort();
            var e = new Error("Socket timed out on request" + host);
            e.code = "ESOCKETTIMEDOUT";
            req.emit("error", e);
          });
        }
      }
      return req.on("error", clear);
    };
  }
});

// node_modules/url-parse-lax/index.js
var require_url_parse_lax = __commonJS({
  "node_modules/url-parse-lax/index.js"(exports2, module2) {
    "use strict";
    var url = require("url");
    var prependHttp = require_prepend_http();
    module2.exports = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof input}\` instead.`);
      }
      const finalUrl = prependHttp(input, Object.assign({ https: true }, options));
      return url.parse(finalUrl);
    };
  }
});

// node_modules/url-to-options/index.js
var require_url_to_options = __commonJS({
  "node_modules/url-to-options/index.js"(exports2, module2) {
    "use strict";
    function urlToOptions(url) {
      var options = {
        protocol: url.protocol,
        hostname: url.hostname,
        hash: url.hash,
        search: url.search,
        pathname: url.pathname,
        path: `${url.pathname}${url.search}`,
        href: url.href
      };
      if (url.port !== "") {
        options.port = Number(url.port);
      }
      if (url.username || url.password) {
        options.auth = `${url.username}:${url.password}`;
      }
      return options;
    }
    module2.exports = urlToOptions;
  }
});

// node_modules/decompress-response/index.js
var require_decompress_response = __commonJS({
  "node_modules/decompress-response/index.js"(exports2, module2) {
    "use strict";
    var PassThrough = require("stream").PassThrough;
    var zlib = require("zlib");
    var mimicResponse = require_mimic_response();
    module2.exports = (response) => {
      if (["gzip", "deflate"].indexOf(response.headers["content-encoding"]) === -1) {
        return response;
      }
      const unzip = zlib.createUnzip();
      const stream2 = new PassThrough();
      mimicResponse(response, stream2);
      unzip.on("error", (err) => {
        if (err.code === "Z_BUF_ERROR") {
          stream2.end();
          return;
        }
        stream2.emit("error", err);
      });
      response.pipe(unzip).pipe(stream2);
      return stream2;
    };
  }
});

// node_modules/is-retry-allowed/index.js
var require_is_retry_allowed = __commonJS({
  "node_modules/is-retry-allowed/index.js"(exports2, module2) {
    "use strict";
    var WHITELIST = [
      "ETIMEDOUT",
      "ECONNRESET",
      "EADDRINUSE",
      "ESOCKETTIMEDOUT",
      "ECONNREFUSED",
      "EPIPE",
      "EHOSTUNREACH",
      "EAI_AGAIN"
    ];
    var BLACKLIST = [
      "ENOTFOUND",
      "ENETUNREACH",
      "UNABLE_TO_GET_ISSUER_CERT",
      "UNABLE_TO_GET_CRL",
      "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
      "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
      "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
      "CERT_SIGNATURE_FAILURE",
      "CRL_SIGNATURE_FAILURE",
      "CERT_NOT_YET_VALID",
      "CERT_HAS_EXPIRED",
      "CRL_NOT_YET_VALID",
      "CRL_HAS_EXPIRED",
      "ERROR_IN_CERT_NOT_BEFORE_FIELD",
      "ERROR_IN_CERT_NOT_AFTER_FIELD",
      "ERROR_IN_CRL_LAST_UPDATE_FIELD",
      "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
      "OUT_OF_MEM",
      "DEPTH_ZERO_SELF_SIGNED_CERT",
      "SELF_SIGNED_CERT_IN_CHAIN",
      "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
      "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
      "CERT_CHAIN_TOO_LONG",
      "CERT_REVOKED",
      "INVALID_CA",
      "PATH_LENGTH_EXCEEDED",
      "INVALID_PURPOSE",
      "CERT_UNTRUSTED",
      "CERT_REJECTED"
    ];
    module2.exports = function(err) {
      if (!err || !err.code) {
        return true;
      }
      if (WHITELIST.indexOf(err.code) !== -1) {
        return true;
      }
      if (BLACKLIST.indexOf(err.code) !== -1) {
        return false;
      }
      return true;
    };
  }
});

// node_modules/has-symbol-support-x/index.js
var require_has_symbol_support_x = __commonJS({
  "node_modules/has-symbol-support-x/index.js"(exports2, module2) {
    "use strict";
    module2.exports = typeof Symbol === "function" && typeof Symbol("") === "symbol";
  }
});

// node_modules/has-to-string-tag-x/index.js
var require_has_to_string_tag_x = __commonJS({
  "node_modules/has-to-string-tag-x/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_has_symbol_support_x() && typeof Symbol.toStringTag === "symbol";
  }
});

// node_modules/is-object/index.js
var require_is_object = __commonJS({
  "node_modules/is-object/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function isObject(x) {
      return typeof x === "object" && x !== null;
    };
  }
});

// node_modules/isurl/index.js
var require_isurl = __commonJS({
  "node_modules/isurl/index.js"(exports2, module2) {
    "use strict";
    var hasToStringTag = require_has_to_string_tag_x();
    var isObject = require_is_object();
    var toString = Object.prototype.toString;
    var urlClass = "[object URL]";
    var hash = "hash";
    var host = "host";
    var hostname = "hostname";
    var href = "href";
    var password = "password";
    var pathname = "pathname";
    var port = "port";
    var protocol = "protocol";
    var search = "search";
    var username = "username";
    var isURL = (url, supportIncomplete) => {
      if (!isObject(url))
        return false;
      if (!hasToStringTag && toString.call(url) === urlClass)
        return true;
      if (!(href in url))
        return false;
      if (!(protocol in url))
        return false;
      if (!(username in url))
        return false;
      if (!(password in url))
        return false;
      if (!(hostname in url))
        return false;
      if (!(port in url))
        return false;
      if (!(host in url))
        return false;
      if (!(pathname in url))
        return false;
      if (!(search in url))
        return false;
      if (!(hash in url))
        return false;
      if (supportIncomplete !== true) {
        if (!isObject(url.searchParams))
          return false;
      }
      return true;
    };
    isURL.lenient = (url) => {
      return isURL(url, true);
    };
    module2.exports = isURL;
  }
});

// node_modules/p-cancelable/index.js
var require_p_cancelable = __commonJS({
  "node_modules/p-cancelable/index.js"(exports2, module2) {
    "use strict";
    var CancelError = class extends Error {
      constructor() {
        super("Promise was canceled");
        this.name = "CancelError";
      }
      get isCanceled() {
        return true;
      }
    };
    var PCancelable = class {
      static fn(userFn) {
        return function() {
          const args = [].slice.apply(arguments);
          return new PCancelable((resolve2, reject2, onCancel) => {
            args.push(onCancel);
            userFn.apply(null, args).then(resolve2, reject2);
          });
        };
      }
      constructor(executor) {
        this._cancelHandlers = [];
        this._isPending = true;
        this._isCanceled = false;
        this._promise = new Promise((resolve2, reject2) => {
          this._reject = reject2;
          return executor((value) => {
            this._isPending = false;
            resolve2(value);
          }, (error) => {
            this._isPending = false;
            reject2(error);
          }, (handler) => {
            this._cancelHandlers.push(handler);
          });
        });
      }
      then(onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
      }
      catch(onRejected) {
        return this._promise.catch(onRejected);
      }
      finally(onFinally) {
        return this._promise.finally(onFinally);
      }
      cancel() {
        if (!this._isPending || this._isCanceled) {
          return;
        }
        if (this._cancelHandlers.length > 0) {
          try {
            for (const handler of this._cancelHandlers) {
              handler();
            }
          } catch (err) {
            this._reject(err);
          }
        }
        this._isCanceled = true;
        this._reject(new CancelError());
      }
      get isCanceled() {
        return this._isCanceled;
      }
    };
    Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);
    module2.exports = PCancelable;
    module2.exports.CancelError = CancelError;
  }
});

// node_modules/p-finally/index.js
var require_p_finally = __commonJS({
  "node_modules/p-finally/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (promise, onFinally) => {
      onFinally = onFinally || (() => {
      });
      return promise.then((val) => new Promise((resolve2) => {
        resolve2(onFinally());
      }).then(() => val), (err) => new Promise((resolve2) => {
        resolve2(onFinally());
      }).then(() => {
        throw err;
      }));
    };
  }
});

// node_modules/p-timeout/index.js
var require_p_timeout = __commonJS({
  "node_modules/p-timeout/index.js"(exports2, module2) {
    "use strict";
    var pFinally = require_p_finally();
    var TimeoutError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "TimeoutError";
      }
    };
    module2.exports = (promise, ms, fallback) => new Promise((resolve2, reject2) => {
      if (typeof ms !== "number" || ms < 0) {
        throw new TypeError("Expected `ms` to be a positive number");
      }
      const timer = setTimeout(() => {
        if (typeof fallback === "function") {
          try {
            resolve2(fallback());
          } catch (err2) {
            reject2(err2);
          }
          return;
        }
        const message = typeof fallback === "string" ? fallback : `Promise timed out after ${ms} milliseconds`;
        const err = fallback instanceof Error ? fallback : new TimeoutError(message);
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        reject2(err);
      }, ms);
      pFinally(promise.then(resolve2, reject2), () => {
        clearTimeout(timer);
      });
    });
    module2.exports.TimeoutError = TimeoutError;
  }
});

// node_modules/got/node_modules/pify/index.js
var require_pify3 = __commonJS({
  "node_modules/got/node_modules/pify/index.js"(exports2, module2) {
    "use strict";
    var processFn = (fn, opts) => function() {
      const P = opts.promiseModule;
      const args = new Array(arguments.length);
      for (let i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
      return new P((resolve2, reject2) => {
        if (opts.errorFirst) {
          args.push(function(err, result) {
            if (opts.multiArgs) {
              const results = new Array(arguments.length - 1);
              for (let i = 1; i < arguments.length; i++) {
                results[i - 1] = arguments[i];
              }
              if (err) {
                results.unshift(err);
                reject2(results);
              } else {
                resolve2(results);
              }
            } else if (err) {
              reject2(err);
            } else {
              resolve2(result);
            }
          });
        } else {
          args.push(function(result) {
            if (opts.multiArgs) {
              const results = new Array(arguments.length - 1);
              for (let i = 0; i < arguments.length; i++) {
                results[i] = arguments[i];
              }
              resolve2(results);
            } else {
              resolve2(result);
            }
          });
        }
        fn.apply(this, args);
      });
    };
    module2.exports = (obj, opts) => {
      opts = Object.assign({
        exclude: [/.+(Sync|Stream)$/],
        errorFirst: true,
        promiseModule: Promise
      }, opts);
      const filter = (key) => {
        const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
        return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
      };
      let ret;
      if (typeof obj === "function") {
        ret = function() {
          if (opts.excludeMain) {
            return obj.apply(this, arguments);
          }
          return processFn(obj, opts).apply(this, arguments);
        };
      } else {
        ret = Object.create(Object.getPrototypeOf(obj));
      }
      for (const key in obj) {
        const x = obj[key];
        ret[key] = typeof x === "function" && filter(key) ? processFn(x, opts) : x;
      }
      return ret;
    };
  }
});

// node_modules/got/package.json
var require_package2 = __commonJS({
  "node_modules/got/package.json"(exports2, module2) {
    module2.exports = {
      name: "got",
      version: "8.3.2",
      description: "Simplified HTTP requests",
      license: "MIT",
      repository: "sindresorhus/got",
      maintainers: [
        {
          name: "Sindre Sorhus",
          email: "sindresorhus@gmail.com",
          url: "sindresorhus.com"
        },
        {
          name: "Vsevolod Strukchinsky",
          email: "floatdrop@gmail.com",
          url: "github.com/floatdrop"
        },
        {
          name: "Alexander Tesfamichael",
          email: "alex.tesfamichael@gmail.com",
          url: "alextes.me"
        }
      ],
      engines: {
        node: ">=4"
      },
      scripts: {
        test: "xo && nyc ava",
        coveralls: "nyc report --reporter=text-lcov | coveralls"
      },
      files: [
        "index.js",
        "errors.js"
      ],
      keywords: [
        "http",
        "https",
        "get",
        "got",
        "url",
        "uri",
        "request",
        "util",
        "utility",
        "simple",
        "curl",
        "wget",
        "fetch",
        "net",
        "network",
        "electron"
      ],
      dependencies: {
        "@sindresorhus/is": "^0.7.0",
        "cacheable-request": "^2.1.1",
        "decompress-response": "^3.3.0",
        duplexer3: "^0.1.4",
        "get-stream": "^3.0.0",
        "into-stream": "^3.1.0",
        "is-retry-allowed": "^1.1.0",
        isurl: "^1.0.0-alpha5",
        "lowercase-keys": "^1.0.0",
        "mimic-response": "^1.0.0",
        "p-cancelable": "^0.4.0",
        "p-timeout": "^2.0.1",
        pify: "^3.0.0",
        "safe-buffer": "^5.1.1",
        "timed-out": "^4.0.1",
        "url-parse-lax": "^3.0.0",
        "url-to-options": "^1.0.1"
      },
      devDependencies: {
        ava: "^0.25.0",
        coveralls: "^3.0.0",
        "form-data": "^2.1.1",
        "get-port": "^3.0.0",
        nyc: "^11.0.2",
        "p-event": "^1.3.0",
        pem: "^1.4.4",
        proxyquire: "^1.8.0",
        sinon: "^4.0.0",
        "slow-stream": "0.0.4",
        tempfile: "^2.0.0",
        tempy: "^0.2.1",
        "universal-url": "1.0.0-alpha",
        xo: "^0.20.0"
      },
      ava: {
        concurrency: 4
      },
      browser: {
        "decompress-response": false,
        electron: false
      }
    };
  }
});

// node_modules/got/errors.js
var require_errors = __commonJS({
  "node_modules/got/errors.js"(exports2, module2) {
    "use strict";
    var urlLib = require("url");
    var http = require("http");
    var PCancelable = require_p_cancelable();
    var is = require_dist();
    var GotError = class extends Error {
      constructor(message, error, opts) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = "GotError";
        if (!is.undefined(error.code)) {
          this.code = error.code;
        }
        Object.assign(this, {
          host: opts.host,
          hostname: opts.hostname,
          method: opts.method,
          path: opts.path,
          protocol: opts.protocol,
          url: opts.href
        });
      }
    };
    module2.exports.GotError = GotError;
    module2.exports.CacheError = class extends GotError {
      constructor(error, opts) {
        super(error.message, error, opts);
        this.name = "CacheError";
      }
    };
    module2.exports.RequestError = class extends GotError {
      constructor(error, opts) {
        super(error.message, error, opts);
        this.name = "RequestError";
      }
    };
    module2.exports.ReadError = class extends GotError {
      constructor(error, opts) {
        super(error.message, error, opts);
        this.name = "ReadError";
      }
    };
    module2.exports.ParseError = class extends GotError {
      constructor(error, statusCode, opts, data) {
        super(`${error.message} in "${urlLib.format(opts)}": 
${data.slice(0, 77)}...`, error, opts);
        this.name = "ParseError";
        this.statusCode = statusCode;
        this.statusMessage = http.STATUS_CODES[this.statusCode];
      }
    };
    module2.exports.HTTPError = class extends GotError {
      constructor(statusCode, statusMessage, headers, opts) {
        if (statusMessage) {
          statusMessage = statusMessage.replace(/\r?\n/g, " ").trim();
        } else {
          statusMessage = http.STATUS_CODES[statusCode];
        }
        super(`Response code ${statusCode} (${statusMessage})`, {}, opts);
        this.name = "HTTPError";
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.headers = headers;
      }
    };
    module2.exports.MaxRedirectsError = class extends GotError {
      constructor(statusCode, redirectUrls, opts) {
        super("Redirected 10 times. Aborting.", {}, opts);
        this.name = "MaxRedirectsError";
        this.statusCode = statusCode;
        this.statusMessage = http.STATUS_CODES[this.statusCode];
        this.redirectUrls = redirectUrls;
      }
    };
    module2.exports.UnsupportedProtocolError = class extends GotError {
      constructor(opts) {
        super(`Unsupported protocol "${opts.protocol}"`, {}, opts);
        this.name = "UnsupportedProtocolError";
      }
    };
    module2.exports.CancelError = PCancelable.CancelError;
  }
});

// node_modules/got/index.js
var require_got = __commonJS({
  "node_modules/got/index.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var https = require("https");
    var PassThrough = require("stream").PassThrough;
    var Transform = require("stream").Transform;
    var urlLib = require("url");
    var fs = require("fs");
    var querystring = require("querystring");
    var CacheableRequest = require_src4();
    var duplexer3 = require_duplexer3();
    var intoStream = require_into_stream();
    var is = require_dist();
    var getStream = require_get_stream3();
    var timedOut = require_timed_out();
    var urlParseLax = require_url_parse_lax();
    var urlToOptions = require_url_to_options();
    var lowercaseKeys = require_lowercase_keys();
    var decompressResponse = require_decompress_response();
    var mimicResponse = require_mimic_response();
    var isRetryAllowed = require_is_retry_allowed();
    var isURL = require_isurl();
    var PCancelable = require_p_cancelable();
    var pTimeout = require_p_timeout();
    var pify = require_pify3();
    var Buffer2 = require_safe_buffer().Buffer;
    var pkg2 = require_package2();
    var errors = require_errors();
    var getMethodRedirectCodes = /* @__PURE__ */ new Set([300, 301, 302, 303, 304, 305, 307, 308]);
    var allMethodRedirectCodes = /* @__PURE__ */ new Set([300, 303, 307, 308]);
    var isFormData = (body) => is.nodeStream(body) && is.function(body.getBoundary);
    var getBodySize = (opts) => {
      const body = opts.body;
      if (opts.headers["content-length"]) {
        return Number(opts.headers["content-length"]);
      }
      if (!body && !opts.stream) {
        return 0;
      }
      if (is.string(body)) {
        return Buffer2.byteLength(body);
      }
      if (isFormData(body)) {
        return pify(body.getLength.bind(body))();
      }
      if (body instanceof fs.ReadStream) {
        return pify(fs.stat)(body.path).then((stat) => stat.size);
      }
      if (is.nodeStream(body) && is.buffer(body._buffer)) {
        return body._buffer.length;
      }
      return null;
    };
    function requestAsEventEmitter(opts) {
      opts = opts || {};
      const ee = new EventEmitter();
      const requestUrl = opts.href || urlLib.resolve(urlLib.format(opts), opts.path);
      const redirects = [];
      const agents = is.object(opts.agent) ? opts.agent : null;
      let retryCount = 0;
      let redirectUrl;
      let uploadBodySize;
      let uploaded = 0;
      const get = (opts2) => {
        if (opts2.protocol !== "http:" && opts2.protocol !== "https:") {
          ee.emit("error", new got.UnsupportedProtocolError(opts2));
          return;
        }
        let fn = opts2.protocol === "https:" ? https : http;
        if (agents) {
          const protocolName = opts2.protocol === "https:" ? "https" : "http";
          opts2.agent = agents[protocolName] || opts2.agent;
        }
        if (opts2.useElectronNet && process.versions.electron) {
          const electron = require("electron");
          fn = electron.net || electron.remote.net;
        }
        let progressInterval;
        const cacheableRequest = new CacheableRequest(fn.request, opts2.cache);
        const cacheReq = cacheableRequest(opts2, (res) => {
          clearInterval(progressInterval);
          ee.emit("uploadProgress", {
            percent: 1,
            transferred: uploaded,
            total: uploadBodySize
          });
          const statusCode = res.statusCode;
          res.url = redirectUrl || requestUrl;
          res.requestUrl = requestUrl;
          const followRedirect = opts2.followRedirect && "location" in res.headers;
          const redirectGet = followRedirect && getMethodRedirectCodes.has(statusCode);
          const redirectAll = followRedirect && allMethodRedirectCodes.has(statusCode);
          if (redirectAll || redirectGet && (opts2.method === "GET" || opts2.method === "HEAD")) {
            res.resume();
            if (statusCode === 303) {
              opts2.method = "GET";
            }
            if (redirects.length >= 10) {
              ee.emit("error", new got.MaxRedirectsError(statusCode, redirects, opts2), null, res);
              return;
            }
            const bufferString = Buffer2.from(res.headers.location, "binary").toString();
            redirectUrl = urlLib.resolve(urlLib.format(opts2), bufferString);
            redirects.push(redirectUrl);
            const redirectOpts = Object.assign({}, opts2, urlLib.parse(redirectUrl));
            ee.emit("redirect", res, redirectOpts);
            get(redirectOpts);
            return;
          }
          setImmediate(() => {
            try {
              getResponse(res, opts2, ee, redirects);
            } catch (e) {
              ee.emit("error", e);
            }
          });
        });
        cacheReq.on("error", (err) => {
          if (err instanceof CacheableRequest.RequestError) {
            ee.emit("error", new got.RequestError(err, opts2));
          } else {
            ee.emit("error", new got.CacheError(err, opts2));
          }
        });
        cacheReq.once("request", (req) => {
          let aborted = false;
          req.once("abort", (_) => {
            aborted = true;
          });
          req.once("error", (err) => {
            clearInterval(progressInterval);
            if (aborted) {
              return;
            }
            const backoff = opts2.retries(++retryCount, err);
            if (backoff) {
              setTimeout(get, backoff, opts2);
              return;
            }
            ee.emit("error", new got.RequestError(err, opts2));
          });
          ee.once("request", (req2) => {
            ee.emit("uploadProgress", {
              percent: 0,
              transferred: 0,
              total: uploadBodySize
            });
            const socket = req2.connection;
            if (socket) {
              const isConnecting = socket.connecting === void 0 ? socket._connecting : socket.connecting;
              const onSocketConnect = () => {
                const uploadEventFrequency = 150;
                progressInterval = setInterval(() => {
                  if (socket.destroyed) {
                    clearInterval(progressInterval);
                    return;
                  }
                  const lastUploaded = uploaded;
                  const headersSize = req2._header ? Buffer2.byteLength(req2._header) : 0;
                  uploaded = socket.bytesWritten - headersSize;
                  if (uploadBodySize && uploaded > uploadBodySize) {
                    uploaded = uploadBodySize;
                  }
                  if (uploaded === lastUploaded || uploaded === uploadBodySize) {
                    return;
                  }
                  ee.emit("uploadProgress", {
                    percent: uploadBodySize ? uploaded / uploadBodySize : 0,
                    transferred: uploaded,
                    total: uploadBodySize
                  });
                }, uploadEventFrequency);
              };
              if (isConnecting) {
                socket.once("connect", onSocketConnect);
              } else {
                onSocketConnect();
              }
            }
          });
          if (opts2.gotTimeout) {
            clearInterval(progressInterval);
            timedOut(req, opts2.gotTimeout);
          }
          setImmediate(() => {
            ee.emit("request", req);
          });
        });
      };
      setImmediate(() => {
        Promise.resolve(getBodySize(opts)).then((size) => {
          uploadBodySize = size;
          if (is.undefined(opts.headers["content-length"]) && is.undefined(opts.headers["transfer-encoding"]) && isFormData(opts.body)) {
            opts.headers["content-length"] = size;
          }
          get(opts);
        }).catch((err) => {
          ee.emit("error", err);
        });
      });
      return ee;
    }
    function getResponse(res, opts, ee, redirects) {
      const downloadBodySize = Number(res.headers["content-length"]) || null;
      let downloaded = 0;
      const progressStream = new Transform({
        transform(chunk, encoding, callback) {
          downloaded += chunk.length;
          const percent = downloadBodySize ? downloaded / downloadBodySize : 0;
          if (percent < 1) {
            ee.emit("downloadProgress", {
              percent,
              transferred: downloaded,
              total: downloadBodySize
            });
          }
          callback(null, chunk);
        },
        flush(callback) {
          ee.emit("downloadProgress", {
            percent: 1,
            transferred: downloaded,
            total: downloadBodySize
          });
          callback();
        }
      });
      mimicResponse(res, progressStream);
      progressStream.redirectUrls = redirects;
      const response = opts.decompress === true && is.function(decompressResponse) && opts.method !== "HEAD" ? decompressResponse(progressStream) : progressStream;
      if (!opts.decompress && ["gzip", "deflate"].indexOf(res.headers["content-encoding"]) !== -1) {
        opts.encoding = null;
      }
      ee.emit("response", response);
      ee.emit("downloadProgress", {
        percent: 0,
        transferred: 0,
        total: downloadBodySize
      });
      res.pipe(progressStream);
    }
    function asPromise(opts) {
      const timeoutFn = (requestPromise) => opts.gotTimeout && opts.gotTimeout.request ? pTimeout(requestPromise, opts.gotTimeout.request, new got.RequestError({ message: "Request timed out", code: "ETIMEDOUT" }, opts)) : requestPromise;
      const proxy = new EventEmitter();
      const cancelable = new PCancelable((resolve2, reject2, onCancel) => {
        const ee = requestAsEventEmitter(opts);
        let cancelOnRequest = false;
        onCancel(() => {
          cancelOnRequest = true;
        });
        ee.on("request", (req) => {
          if (cancelOnRequest) {
            req.abort();
          }
          onCancel(() => {
            req.abort();
          });
          if (is.nodeStream(opts.body)) {
            opts.body.pipe(req);
            opts.body = void 0;
            return;
          }
          req.end(opts.body);
        });
        ee.on("response", (res) => {
          const stream2 = is.null(opts.encoding) ? getStream.buffer(res) : getStream(res, opts);
          stream2.catch((err) => reject2(new got.ReadError(err, opts))).then((data) => {
            const statusCode = res.statusCode;
            const limitStatusCode = opts.followRedirect ? 299 : 399;
            res.body = data;
            if (opts.json && res.body) {
              try {
                res.body = JSON.parse(res.body);
              } catch (err) {
                if (statusCode >= 200 && statusCode < 300) {
                  throw new got.ParseError(err, statusCode, opts, data);
                }
              }
            }
            if (opts.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > limitStatusCode)) {
              throw new got.HTTPError(statusCode, res.statusMessage, res.headers, opts);
            }
            resolve2(res);
          }).catch((err) => {
            Object.defineProperty(err, "response", { value: res });
            reject2(err);
          });
        });
        ee.once("error", reject2);
        ee.on("redirect", proxy.emit.bind(proxy, "redirect"));
        ee.on("uploadProgress", proxy.emit.bind(proxy, "uploadProgress"));
        ee.on("downloadProgress", proxy.emit.bind(proxy, "downloadProgress"));
      });
      Object.defineProperty(cancelable, "canceled", {
        get() {
          return cancelable.isCanceled;
        }
      });
      const promise = timeoutFn(cancelable);
      promise.cancel = cancelable.cancel.bind(cancelable);
      promise.on = (name, fn) => {
        proxy.on(name, fn);
        return promise;
      };
      return promise;
    }
    function asStream(opts) {
      opts.stream = true;
      const input = new PassThrough();
      const output = new PassThrough();
      const proxy = duplexer3(input, output);
      let timeout;
      if (opts.gotTimeout && opts.gotTimeout.request) {
        timeout = setTimeout(() => {
          proxy.emit("error", new got.RequestError({ message: "Request timed out", code: "ETIMEDOUT" }, opts));
        }, opts.gotTimeout.request);
      }
      if (opts.json) {
        throw new Error("Got can not be used as a stream when the `json` option is used");
      }
      if (opts.body) {
        proxy.write = () => {
          throw new Error("Got's stream is not writable when the `body` option is used");
        };
      }
      const ee = requestAsEventEmitter(opts);
      ee.on("request", (req) => {
        proxy.emit("request", req);
        if (is.nodeStream(opts.body)) {
          opts.body.pipe(req);
          return;
        }
        if (opts.body) {
          req.end(opts.body);
          return;
        }
        if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
          input.pipe(req);
          return;
        }
        req.end();
      });
      ee.on("response", (res) => {
        clearTimeout(timeout);
        const statusCode = res.statusCode;
        res.on("error", (err) => {
          proxy.emit("error", new got.ReadError(err, opts));
        });
        res.pipe(output);
        if (opts.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > 299)) {
          proxy.emit("error", new got.HTTPError(statusCode, res.statusMessage, res.headers, opts), null, res);
          return;
        }
        proxy.emit("response", res);
      });
      ee.on("error", proxy.emit.bind(proxy, "error"));
      ee.on("redirect", proxy.emit.bind(proxy, "redirect"));
      ee.on("uploadProgress", proxy.emit.bind(proxy, "uploadProgress"));
      ee.on("downloadProgress", proxy.emit.bind(proxy, "downloadProgress"));
      return proxy;
    }
    function normalizeArguments(url, opts) {
      if (!is.string(url) && !is.object(url)) {
        throw new TypeError(`Parameter \`url\` must be a string or object, not ${is(url)}`);
      } else if (is.string(url)) {
        url = url.replace(/^unix:/, "http://$&");
        try {
          decodeURI(url);
        } catch (err) {
          throw new Error("Parameter `url` must contain valid UTF-8 character sequences");
        }
        url = urlParseLax(url);
        if (url.auth) {
          throw new Error("Basic authentication must be done with the `auth` option");
        }
      } else if (isURL.lenient(url)) {
        url = urlToOptions(url);
      }
      opts = Object.assign({
        path: "",
        retries: 2,
        cache: false,
        decompress: true,
        useElectronNet: false,
        throwHttpErrors: true
      }, url, {
        protocol: url.protocol || "http:"
      }, opts);
      const headers = lowercaseKeys(opts.headers);
      for (const key of Object.keys(headers)) {
        if (is.nullOrUndefined(headers[key])) {
          delete headers[key];
        }
      }
      opts.headers = Object.assign({
        "user-agent": `${pkg2.name}/${pkg2.version} (https://github.com/sindresorhus/got)`
      }, headers);
      if (opts.decompress && is.undefined(opts.headers["accept-encoding"])) {
        opts.headers["accept-encoding"] = "gzip, deflate";
      }
      const query = opts.query;
      if (query) {
        if (!is.string(query)) {
          opts.query = querystring.stringify(query);
        }
        opts.path = `${opts.path.split("?")[0]}?${opts.query}`;
        delete opts.query;
      }
      if (opts.json && is.undefined(opts.headers.accept)) {
        opts.headers.accept = "application/json";
      }
      const body = opts.body;
      if (is.nullOrUndefined(body)) {
        opts.method = (opts.method || "GET").toUpperCase();
      } else {
        const headers2 = opts.headers;
        if (!is.nodeStream(body) && !is.string(body) && !is.buffer(body) && !(opts.form || opts.json)) {
          throw new TypeError("The `body` option must be a stream.Readable, string, Buffer or plain Object");
        }
        const canBodyBeStringified = is.plainObject(body) || is.array(body);
        if ((opts.form || opts.json) && !canBodyBeStringified) {
          throw new TypeError("The `body` option must be a plain Object or Array when the `form` or `json` option is used");
        }
        if (isFormData(body)) {
          headers2["content-type"] = headers2["content-type"] || `multipart/form-data; boundary=${body.getBoundary()}`;
        } else if (opts.form && canBodyBeStringified) {
          headers2["content-type"] = headers2["content-type"] || "application/x-www-form-urlencoded";
          opts.body = querystring.stringify(body);
        } else if (opts.json && canBodyBeStringified) {
          headers2["content-type"] = headers2["content-type"] || "application/json";
          opts.body = JSON.stringify(body);
        }
        if (is.undefined(headers2["content-length"]) && is.undefined(headers2["transfer-encoding"]) && !is.nodeStream(body)) {
          const length = is.string(opts.body) ? Buffer2.byteLength(opts.body) : opts.body.length;
          headers2["content-length"] = length;
        }
        if (is.buffer(body)) {
          opts.body = intoStream(body);
          opts.body._buffer = body;
        }
        opts.method = (opts.method || "POST").toUpperCase();
      }
      if (opts.hostname === "unix") {
        const matches = /(.+?):(.+)/.exec(opts.path);
        if (matches) {
          opts.socketPath = matches[1];
          opts.path = matches[2];
          opts.host = null;
        }
      }
      if (!is.function(opts.retries)) {
        const retries = opts.retries;
        opts.retries = (iter, err) => {
          if (iter > retries || !isRetryAllowed(err)) {
            return 0;
          }
          const noise = Math.random() * 100;
          return (1 << iter) * 1e3 + noise;
        };
      }
      if (is.undefined(opts.followRedirect)) {
        opts.followRedirect = true;
      }
      if (opts.timeout) {
        if (is.number(opts.timeout)) {
          opts.gotTimeout = { request: opts.timeout };
        } else {
          opts.gotTimeout = opts.timeout;
        }
        delete opts.timeout;
      }
      return opts;
    }
    function got(url, opts) {
      try {
        const normalizedArgs = normalizeArguments(url, opts);
        if (normalizedArgs.stream) {
          return asStream(normalizedArgs);
        }
        return asPromise(normalizedArgs);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    got.stream = (url, opts) => asStream(normalizeArguments(url, opts));
    var methods = [
      "get",
      "post",
      "put",
      "patch",
      "head",
      "delete"
    ];
    for (const method of methods) {
      got[method] = (url, opts) => got(url, Object.assign({}, opts, { method }));
      got.stream[method] = (url, opts) => got.stream(url, Object.assign({}, opts, { method }));
    }
    Object.assign(got, errors);
    module2.exports = got;
  }
});

// node_modules/make-dir/node_modules/pify/index.js
var require_pify4 = __commonJS({
  "node_modules/make-dir/node_modules/pify/index.js"(exports2, module2) {
    "use strict";
    var processFn = (fn, options) => function(...args) {
      const P = options.promiseModule;
      return new P((resolve2, reject2) => {
        if (options.multiArgs) {
          args.push((...result) => {
            if (options.errorFirst) {
              if (result[0]) {
                reject2(result);
              } else {
                result.shift();
                resolve2(result);
              }
            } else {
              resolve2(result);
            }
          });
        } else if (options.errorFirst) {
          args.push((error, result) => {
            if (error) {
              reject2(error);
            } else {
              resolve2(result);
            }
          });
        } else {
          args.push(resolve2);
        }
        fn.apply(this, args);
      });
    };
    module2.exports = (input, options) => {
      options = Object.assign({
        exclude: [/.+(Sync|Stream)$/],
        errorFirst: true,
        promiseModule: Promise
      }, options);
      const objType = typeof input;
      if (!(input !== null && (objType === "object" || objType === "function"))) {
        throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${input === null ? "null" : objType}\``);
      }
      const filter = (key) => {
        const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
        return options.include ? options.include.some(match) : !options.exclude.some(match);
      };
      let ret;
      if (objType === "function") {
        ret = function(...args) {
          return options.excludeMain ? input(...args) : processFn(input, options).apply(this, args);
        };
      } else {
        ret = Object.create(Object.getPrototypeOf(input));
      }
      for (const key in input) {
        const property = input[key];
        ret[key] = typeof property === "function" && filter(key) ? processFn(property, options) : property;
      }
      return ret;
    };
  }
});

// node_modules/semver/semver.js
var require_semver = __commonJS({
  "node_modules/semver/semver.js"(exports2, module2) {
    exports2 = module2.exports = SemVer;
    var debug;
    if (typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
      debug = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift("SEMVER");
        console.log.apply(console, args);
      };
    } else {
      debug = function() {
      };
    }
    exports2.SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var re = exports2.re = [];
    var src = exports2.src = [];
    var R = 0;
    var NUMERICIDENTIFIER = R++;
    src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
    var NUMERICIDENTIFIERLOOSE = R++;
    src[NUMERICIDENTIFIERLOOSE] = "[0-9]+";
    var NONNUMERICIDENTIFIER = R++;
    src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
    var MAINVERSION = R++;
    src[MAINVERSION] = "(" + src[NUMERICIDENTIFIER] + ")\\.(" + src[NUMERICIDENTIFIER] + ")\\.(" + src[NUMERICIDENTIFIER] + ")";
    var MAINVERSIONLOOSE = R++;
    src[MAINVERSIONLOOSE] = "(" + src[NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[NUMERICIDENTIFIERLOOSE] + ")";
    var PRERELEASEIDENTIFIER = R++;
    src[PRERELEASEIDENTIFIER] = "(?:" + src[NUMERICIDENTIFIER] + "|" + src[NONNUMERICIDENTIFIER] + ")";
    var PRERELEASEIDENTIFIERLOOSE = R++;
    src[PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[NUMERICIDENTIFIERLOOSE] + "|" + src[NONNUMERICIDENTIFIER] + ")";
    var PRERELEASE = R++;
    src[PRERELEASE] = "(?:-(" + src[PRERELEASEIDENTIFIER] + "(?:\\." + src[PRERELEASEIDENTIFIER] + ")*))";
    var PRERELEASELOOSE = R++;
    src[PRERELEASELOOSE] = "(?:-?(" + src[PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[PRERELEASEIDENTIFIERLOOSE] + ")*))";
    var BUILDIDENTIFIER = R++;
    src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
    var BUILD = R++;
    src[BUILD] = "(?:\\+(" + src[BUILDIDENTIFIER] + "(?:\\." + src[BUILDIDENTIFIER] + ")*))";
    var FULL = R++;
    var FULLPLAIN = "v?" + src[MAINVERSION] + src[PRERELEASE] + "?" + src[BUILD] + "?";
    src[FULL] = "^" + FULLPLAIN + "$";
    var LOOSEPLAIN = "[v=\\s]*" + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + "?" + src[BUILD] + "?";
    var LOOSE = R++;
    src[LOOSE] = "^" + LOOSEPLAIN + "$";
    var GTLT = R++;
    src[GTLT] = "((?:<|>)?=?)";
    var XRANGEIDENTIFIERLOOSE = R++;
    src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
    var XRANGEIDENTIFIER = R++;
    src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";
    var XRANGEPLAIN = R++;
    src[XRANGEPLAIN] = "[v=\\s]*(" + src[XRANGEIDENTIFIER] + ")(?:\\.(" + src[XRANGEIDENTIFIER] + ")(?:\\.(" + src[XRANGEIDENTIFIER] + ")(?:" + src[PRERELEASE] + ")?" + src[BUILD] + "?)?)?";
    var XRANGEPLAINLOOSE = R++;
    src[XRANGEPLAINLOOSE] = "[v=\\s]*(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:" + src[PRERELEASELOOSE] + ")?" + src[BUILD] + "?)?)?";
    var XRANGE = R++;
    src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
    var XRANGELOOSE = R++;
    src[XRANGELOOSE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAINLOOSE] + "$";
    var COERCE = R++;
    src[COERCE] = "(?:^|[^\\d])(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "})(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:$|[^\\d])";
    var LONETILDE = R++;
    src[LONETILDE] = "(?:~>?)";
    var TILDETRIM = R++;
    src[TILDETRIM] = "(\\s*)" + src[LONETILDE] + "\\s+";
    re[TILDETRIM] = new RegExp(src[TILDETRIM], "g");
    var tildeTrimReplace = "$1~";
    var TILDE = R++;
    src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
    var TILDELOOSE = R++;
    src[TILDELOOSE] = "^" + src[LONETILDE] + src[XRANGEPLAINLOOSE] + "$";
    var LONECARET = R++;
    src[LONECARET] = "(?:\\^)";
    var CARETTRIM = R++;
    src[CARETTRIM] = "(\\s*)" + src[LONECARET] + "\\s+";
    re[CARETTRIM] = new RegExp(src[CARETTRIM], "g");
    var caretTrimReplace = "$1^";
    var CARET = R++;
    src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
    var CARETLOOSE = R++;
    src[CARETLOOSE] = "^" + src[LONECARET] + src[XRANGEPLAINLOOSE] + "$";
    var COMPARATORLOOSE = R++;
    src[COMPARATORLOOSE] = "^" + src[GTLT] + "\\s*(" + LOOSEPLAIN + ")$|^$";
    var COMPARATOR = R++;
    src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";
    var COMPARATORTRIM = R++;
    src[COMPARATORTRIM] = "(\\s*)" + src[GTLT] + "\\s*(" + LOOSEPLAIN + "|" + src[XRANGEPLAIN] + ")";
    re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], "g");
    var comparatorTrimReplace = "$1$2$3";
    var HYPHENRANGE = R++;
    src[HYPHENRANGE] = "^\\s*(" + src[XRANGEPLAIN] + ")\\s+-\\s+(" + src[XRANGEPLAIN] + ")\\s*$";
    var HYPHENRANGELOOSE = R++;
    src[HYPHENRANGELOOSE] = "^\\s*(" + src[XRANGEPLAINLOOSE] + ")\\s+-\\s+(" + src[XRANGEPLAINLOOSE] + ")\\s*$";
    var STAR = R++;
    src[STAR] = "(<|>)?=?\\s*\\*";
    for (i = 0; i < R; i++) {
      debug(i, src[i]);
      if (!re[i]) {
        re[i] = new RegExp(src[i]);
      }
    }
    var i;
    exports2.parse = parse;
    function parse(version, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version !== "string") {
        return null;
      }
      if (version.length > MAX_LENGTH) {
        return null;
      }
      var r = options.loose ? re[LOOSE] : re[FULL];
      if (!r.test(version)) {
        return null;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        return null;
      }
    }
    exports2.valid = valid;
    function valid(version, options) {
      var v = parse(version, options);
      return v ? v.version : null;
    }
    exports2.clean = clean;
    function clean(version, options) {
      var s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    }
    exports2.SemVer = SemVer;
    function SemVer(version, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (version instanceof SemVer) {
        if (version.loose === options.loose) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError("Invalid Version: " + version);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError("version is longer than " + MAX_LENGTH + " characters");
      }
      if (!(this instanceof SemVer)) {
        return new SemVer(version, options);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL]);
      if (!m) {
        throw new TypeError("Invalid Version: " + version);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map(function(id) {
          if (/^[0-9]+$/.test(id)) {
            var num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    SemVer.prototype.format = function() {
      this.version = this.major + "." + this.minor + "." + this.patch;
      if (this.prerelease.length) {
        this.version += "-" + this.prerelease.join(".");
      }
      return this.version;
    };
    SemVer.prototype.toString = function() {
      return this.version;
    };
    SemVer.prototype.compare = function(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return this.compareMain(other) || this.comparePre(other);
    };
    SemVer.prototype.compareMain = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    };
    SemVer.prototype.comparePre = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      var i2 = 0;
      do {
        var a = this.prerelease[i2];
        var b = other.prerelease[i2];
        debug("prerelease compare", i2, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i2);
    };
    SemVer.prototype.inc = function(release, identifier) {
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier);
          this.inc("pre", identifier);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier);
          }
          this.inc("pre", identifier);
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre":
          if (this.prerelease.length === 0) {
            this.prerelease = [0];
          } else {
            var i2 = this.prerelease.length;
            while (--i2 >= 0) {
              if (typeof this.prerelease[i2] === "number") {
                this.prerelease[i2]++;
                i2 = -2;
              }
            }
            if (i2 === -1) {
              this.prerelease.push(0);
            }
          }
          if (identifier) {
            if (this.prerelease[0] === identifier) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = [identifier, 0];
              }
            } else {
              this.prerelease = [identifier, 0];
            }
          }
          break;
        default:
          throw new Error("invalid increment argument: " + release);
      }
      this.format();
      this.raw = this.version;
      return this;
    };
    exports2.inc = inc;
    function inc(version, release, loose, identifier) {
      if (typeof loose === "string") {
        identifier = loose;
        loose = void 0;
      }
      try {
        return new SemVer(version, loose).inc(release, identifier).version;
      } catch (er) {
        return null;
      }
    }
    exports2.diff = diff;
    function diff(version1, version2) {
      if (eq(version1, version2)) {
        return null;
      } else {
        var v1 = parse(version1);
        var v2 = parse(version2);
        var prefix = "";
        if (v1.prerelease.length || v2.prerelease.length) {
          prefix = "pre";
          var defaultResult = "prerelease";
        }
        for (var key in v1) {
          if (key === "major" || key === "minor" || key === "patch") {
            if (v1[key] !== v2[key]) {
              return prefix + key;
            }
          }
        }
        return defaultResult;
      }
    }
    exports2.compareIdentifiers = compareIdentifiers;
    var numeric = /^[0-9]+$/;
    function compareIdentifiers(a, b) {
      var anum = numeric.test(a);
      var bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    }
    exports2.rcompareIdentifiers = rcompareIdentifiers;
    function rcompareIdentifiers(a, b) {
      return compareIdentifiers(b, a);
    }
    exports2.major = major;
    function major(a, loose) {
      return new SemVer(a, loose).major;
    }
    exports2.minor = minor;
    function minor(a, loose) {
      return new SemVer(a, loose).minor;
    }
    exports2.patch = patch;
    function patch(a, loose) {
      return new SemVer(a, loose).patch;
    }
    exports2.compare = compare;
    function compare(a, b, loose) {
      return new SemVer(a, loose).compare(new SemVer(b, loose));
    }
    exports2.compareLoose = compareLoose;
    function compareLoose(a, b) {
      return compare(a, b, true);
    }
    exports2.rcompare = rcompare;
    function rcompare(a, b, loose) {
      return compare(b, a, loose);
    }
    exports2.sort = sort;
    function sort(list, loose) {
      return list.sort(function(a, b) {
        return exports2.compare(a, b, loose);
      });
    }
    exports2.rsort = rsort;
    function rsort(list, loose) {
      return list.sort(function(a, b) {
        return exports2.rcompare(a, b, loose);
      });
    }
    exports2.gt = gt;
    function gt(a, b, loose) {
      return compare(a, b, loose) > 0;
    }
    exports2.lt = lt;
    function lt(a, b, loose) {
      return compare(a, b, loose) < 0;
    }
    exports2.eq = eq;
    function eq(a, b, loose) {
      return compare(a, b, loose) === 0;
    }
    exports2.neq = neq;
    function neq(a, b, loose) {
      return compare(a, b, loose) !== 0;
    }
    exports2.gte = gte;
    function gte(a, b, loose) {
      return compare(a, b, loose) >= 0;
    }
    exports2.lte = lte;
    function lte(a, b, loose) {
      return compare(a, b, loose) <= 0;
    }
    exports2.cmp = cmp;
    function cmp(a, op, b, loose) {
      switch (op) {
        case "===":
          if (typeof a === "object")
            a = a.version;
          if (typeof b === "object")
            b = b.version;
          return a === b;
        case "!==":
          if (typeof a === "object")
            a = a.version;
          if (typeof b === "object")
            b = b.version;
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError("Invalid operator: " + op);
      }
    }
    exports2.Comparator = Comparator;
    function Comparator(comp, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      if (!(this instanceof Comparator)) {
        return new Comparator(comp, options);
      }
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    var ANY = {};
    Comparator.prototype.parse = function(comp) {
      var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var m = comp.match(r);
      if (!m) {
        throw new TypeError("Invalid comparator: " + comp);
      }
      this.operator = m[1];
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    };
    Comparator.prototype.toString = function() {
      return this.value;
    };
    Comparator.prototype.test = function(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY) {
        return true;
      }
      if (typeof version === "string") {
        version = new SemVer(version, this.options);
      }
      return cmp(version, this.operator, this.semver, this.options);
    };
    Comparator.prototype.intersects = function(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      var rangeTmp;
      if (this.operator === "") {
        rangeTmp = new Range(comp.value, options);
        return satisfies(this.value, rangeTmp, options);
      } else if (comp.operator === "") {
        rangeTmp = new Range(this.value, options);
        return satisfies(comp.semver, rangeTmp, options);
      }
      var sameDirectionIncreasing = (this.operator === ">=" || this.operator === ">") && (comp.operator === ">=" || comp.operator === ">");
      var sameDirectionDecreasing = (this.operator === "<=" || this.operator === "<") && (comp.operator === "<=" || comp.operator === "<");
      var sameSemVer = this.semver.version === comp.semver.version;
      var differentDirectionsInclusive = (this.operator === ">=" || this.operator === "<=") && (comp.operator === ">=" || comp.operator === "<=");
      var oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, options) && ((this.operator === ">=" || this.operator === ">") && (comp.operator === "<=" || comp.operator === "<"));
      var oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, options) && ((this.operator === "<=" || this.operator === "<") && (comp.operator === ">=" || comp.operator === ">"));
      return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
    };
    exports2.Range = Range;
    function Range(range, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        return new Range(range.value, options);
      }
      if (!(this instanceof Range)) {
        return new Range(range, options);
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range;
      this.set = range.split(/\s*\|\|\s*/).map(function(range2) {
        return this.parseRange(range2.trim());
      }, this).filter(function(c) {
        return c.length;
      });
      if (!this.set.length) {
        throw new TypeError("Invalid SemVer Range: " + range);
      }
      this.format();
    }
    Range.prototype.format = function() {
      this.range = this.set.map(function(comps) {
        return comps.join(" ").trim();
      }).join("||").trim();
      return this.range;
    };
    Range.prototype.toString = function() {
      return this.range;
    };
    Range.prototype.parseRange = function(range) {
      var loose = this.options.loose;
      range = range.trim();
      var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
      range = range.replace(hr, hyphenReplace);
      debug("hyphen replace", range);
      range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range, re[COMPARATORTRIM]);
      range = range.replace(re[TILDETRIM], tildeTrimReplace);
      range = range.replace(re[CARETTRIM], caretTrimReplace);
      range = range.split(/\s+/).join(" ");
      var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var set = range.split(" ").map(function(comp) {
        return parseComparator(comp, this.options);
      }, this).join(" ").split(/\s+/);
      if (this.options.loose) {
        set = set.filter(function(comp) {
          return !!comp.match(compRe);
        });
      }
      set = set.map(function(comp) {
        return new Comparator(comp, this.options);
      }, this);
      return set;
    };
    Range.prototype.intersects = function(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some(function(thisComparators) {
        return thisComparators.every(function(thisComparator) {
          return range.set.some(function(rangeComparators) {
            return rangeComparators.every(function(rangeComparator) {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    };
    exports2.toComparators = toComparators;
    function toComparators(range, options) {
      return new Range(range, options).set.map(function(comp) {
        return comp.map(function(c) {
          return c.value;
        }).join(" ").trim().split(" ");
      });
    }
    function parseComparator(comp, options) {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    }
    function isX(id) {
      return !id || id.toLowerCase() === "x" || id === "*";
    }
    function replaceTildes(comp, options) {
      return comp.trim().split(/\s+/).map(function(comp2) {
        return replaceTilde(comp2, options);
      }).join(" ");
    }
    function replaceTilde(comp, options) {
      var r = options.loose ? re[TILDELOOSE] : re[TILDE];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug("tilde", comp, _, M, m, p, pr);
        var ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
          ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
        } else {
          ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
        }
        debug("tilde return", ret);
        return ret;
      });
    }
    function replaceCarets(comp, options) {
      return comp.trim().split(/\s+/).map(function(comp2) {
        return replaceCaret(comp2, options);
      }).join(" ");
    }
    function replaceCaret(comp, options) {
      debug("caret", comp, options);
      var r = options.loose ? re[CARETLOOSE] : re[CARET];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug("caret", comp, _, M, m, p, pr);
        var ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
          if (M === "0") {
            ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
          } else {
            ret = ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0";
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + m + "." + (+p + 1);
            } else {
              ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
            }
          } else {
            ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + (+M + 1) + ".0.0";
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = ">=" + M + "." + m + "." + p + " <" + M + "." + m + "." + (+p + 1);
            } else {
              ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
            }
          } else {
            ret = ">=" + M + "." + m + "." + p + " <" + (+M + 1) + ".0.0";
          }
        }
        debug("caret return", ret);
        return ret;
      });
    }
    function replaceXRanges(comp, options) {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map(function(comp2) {
        return replaceXRange(comp2, options);
      }).join(" ");
    }
    function replaceXRange(comp, options) {
      comp = comp.trim();
      var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
      return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        var xM = isX(M);
        var xm = xM || isX(m);
        var xp = xm || isX(p);
        var anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          ret = gtlt + M + "." + m + "." + p;
        } else if (xm) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (xp) {
          ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        }
        debug("xRange return", ret);
        return ret;
      });
    }
    function replaceStars(comp, options) {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[STAR], "");
    }
    function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = ">=" + fM + ".0.0";
      } else if (isX(fp)) {
        from = ">=" + fM + "." + fm + ".0";
      } else {
        from = ">=" + from;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = "<" + (+tM + 1) + ".0.0";
      } else if (isX(tp)) {
        to = "<" + tM + "." + (+tm + 1) + ".0";
      } else if (tpr) {
        to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
      } else {
        to = "<=" + to;
      }
      return (from + " " + to).trim();
    }
    Range.prototype.test = function(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        version = new SemVer(version, this.options);
      }
      for (var i2 = 0; i2 < this.set.length; i2++) {
        if (testSet(this.set[i2], version, this.options)) {
          return true;
        }
      }
      return false;
    };
    function testSet(set, version, options) {
      for (var i2 = 0; i2 < set.length; i2++) {
        if (!set[i2].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (i2 = 0; i2 < set.length; i2++) {
          debug(set[i2].semver);
          if (set[i2].semver === ANY) {
            continue;
          }
          if (set[i2].semver.prerelease.length > 0) {
            var allowed = set[i2].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    }
    exports2.satisfies = satisfies;
    function satisfies(version, range, options) {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    }
    exports2.maxSatisfying = maxSatisfying;
    function maxSatisfying(versions, range, options) {
      var max = null;
      var maxSV = null;
      try {
        var rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach(function(v) {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    }
    exports2.minSatisfying = minSatisfying;
    function minSatisfying(versions, range, options) {
      var min = null;
      var minSV = null;
      try {
        var rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach(function(v) {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    }
    exports2.minVersion = minVersion;
    function minVersion(range, loose) {
      range = new Range(range, loose);
      var minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (var i2 = 0; i2 < range.set.length; ++i2) {
        var comparators = range.set[i2];
        comparators.forEach(function(comparator) {
          var compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!minver || gt(minver, compver)) {
                minver = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error("Unexpected operation: " + comparator.operator);
          }
        });
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    }
    exports2.validRange = validRange;
    function validRange(range, options) {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    }
    exports2.ltr = ltr;
    function ltr(version, range, options) {
      return outside(version, range, "<", options);
    }
    exports2.gtr = gtr;
    function gtr(version, range, options) {
      return outside(version, range, ">", options);
    }
    exports2.outside = outside;
    function outside(version, range, hilo, options) {
      version = new SemVer(version, options);
      range = new Range(range, options);
      var gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (var i2 = 0; i2 < range.set.length; ++i2) {
        var comparators = range.set[i2];
        var high = null;
        var low = null;
        comparators.forEach(function(comparator) {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    }
    exports2.prerelease = prerelease;
    function prerelease(version, options) {
      var parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    }
    exports2.intersects = intersects;
    function intersects(r1, r2, options) {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2);
    }
    exports2.coerce = coerce;
    function coerce(version) {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version !== "string") {
        return null;
      }
      var match = version.match(re[COERCE]);
      if (match == null) {
        return null;
      }
      return parse(match[1] + "." + (match[2] || "0") + "." + (match[3] || "0"));
    }
  }
});

// node_modules/make-dir/index.js
var require_make_dir2 = __commonJS({
  "node_modules/make-dir/index.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var pify = require_pify4();
    var semver = require_semver();
    var defaults = {
      mode: 511 & ~process.umask(),
      fs
    };
    var useNativeRecursiveOption = semver.satisfies(process.version, ">=10.12.0");
    var checkPath = (pth) => {
      if (process.platform === "win32") {
        const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ""));
        if (pathHasInvalidWinCharacters) {
          const error = new Error(`Path contains invalid characters: ${pth}`);
          error.code = "EINVAL";
          throw error;
        }
      }
    };
    var permissionError = (pth) => {
      const error = new Error(`operation not permitted, mkdir '${pth}'`);
      error.code = "EPERM";
      error.errno = -4048;
      error.path = pth;
      error.syscall = "mkdir";
      return error;
    };
    var makeDir = (input, options) => Promise.resolve().then(() => {
      checkPath(input);
      options = Object.assign({}, defaults, options);
      const mkdir = pify(options.fs.mkdir);
      const stat = pify(options.fs.stat);
      if (useNativeRecursiveOption && options.fs.mkdir === fs.mkdir) {
        const pth = path.resolve(input);
        return mkdir(pth, {
          mode: options.mode,
          recursive: true
        }).then(() => pth);
      }
      const make = (pth) => {
        return mkdir(pth, options.mode).then(() => pth).catch((error) => {
          if (error.code === "EPERM") {
            throw error;
          }
          if (error.code === "ENOENT") {
            if (path.dirname(pth) === pth) {
              throw permissionError(pth);
            }
            if (error.message.includes("null bytes")) {
              throw error;
            }
            return make(path.dirname(pth)).then(() => make(pth));
          }
          return stat(pth).then((stats) => stats.isDirectory() ? pth : Promise.reject()).catch(() => {
            throw error;
          });
        });
      };
      return make(path.resolve(input));
    });
    module2.exports = makeDir;
    module2.exports.default = makeDir;
    module2.exports.sync = (input, options) => {
      checkPath(input);
      options = Object.assign({}, defaults, options);
      if (useNativeRecursiveOption && options.fs.mkdirSync === fs.mkdirSync) {
        const pth = path.resolve(input);
        fs.mkdirSync(pth, {
          mode: options.mode,
          recursive: true
        });
        return pth;
      }
      const make = (pth) => {
        try {
          options.fs.mkdirSync(pth, options.mode);
        } catch (error) {
          if (error.code === "EPERM") {
            throw error;
          }
          if (error.code === "ENOENT") {
            if (path.dirname(pth) === pth) {
              throw permissionError(pth);
            }
            if (error.message.includes("null bytes")) {
              throw error;
            }
            make(path.dirname(pth));
            return make(pth);
          }
          try {
            if (!options.fs.statSync(pth).isDirectory()) {
              throw new Error("The path is not a directory");
            }
          } catch (_) {
            throw error;
          }
        }
        return pth;
      };
      return make(path.resolve(input));
    };
  }
});

// node_modules/download/node_modules/pify/index.js
var require_pify5 = __commonJS({
  "node_modules/download/node_modules/pify/index.js"(exports2, module2) {
    "use strict";
    var processFn = (fn, options) => function(...args) {
      const P = options.promiseModule;
      return new P((resolve2, reject2) => {
        if (options.multiArgs) {
          args.push((...result) => {
            if (options.errorFirst) {
              if (result[0]) {
                reject2(result);
              } else {
                result.shift();
                resolve2(result);
              }
            } else {
              resolve2(result);
            }
          });
        } else if (options.errorFirst) {
          args.push((error, result) => {
            if (error) {
              reject2(error);
            } else {
              resolve2(result);
            }
          });
        } else {
          args.push(resolve2);
        }
        fn.apply(this, args);
      });
    };
    module2.exports = (input, options) => {
      options = Object.assign({
        exclude: [/.+(Sync|Stream)$/],
        errorFirst: true,
        promiseModule: Promise
      }, options);
      const objType = typeof input;
      if (!(input !== null && (objType === "object" || objType === "function"))) {
        throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${input === null ? "null" : objType}\``);
      }
      const filter = (key) => {
        const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
        return options.include ? options.include.some(match) : !options.exclude.some(match);
      };
      let ret;
      if (objType === "function") {
        ret = function(...args) {
          return options.excludeMain ? input(...args) : processFn(input, options).apply(this, args);
        };
      } else {
        ret = Object.create(Object.getPrototypeOf(input));
      }
      for (const key in input) {
        const property = input[key];
        ret[key] = typeof property === "function" && filter(key) ? processFn(property, options) : property;
      }
      return ret;
    };
  }
});

// node_modules/p-event/index.js
var require_p_event = __commonJS({
  "node_modules/p-event/index.js"(exports2, module2) {
    "use strict";
    var pTimeout = require_p_timeout();
    var symbolAsyncIterator = Symbol.asyncIterator || "@@asyncIterator";
    var normalizeEmitter = (emitter) => {
      const addListener = emitter.on || emitter.addListener || emitter.addEventListener;
      const removeListener = emitter.off || emitter.removeListener || emitter.removeEventListener;
      if (!addListener || !removeListener) {
        throw new TypeError("Emitter is not compatible");
      }
      return {
        addListener: addListener.bind(emitter),
        removeListener: removeListener.bind(emitter)
      };
    };
    var normalizeEvents = (event) => Array.isArray(event) ? event : [event];
    var multiple = (emitter, event, options) => {
      let cancel;
      const ret = new Promise((resolve2, reject2) => {
        options = Object.assign({
          rejectionEvents: ["error"],
          multiArgs: false,
          resolveImmediately: false
        }, options);
        if (!(options.count >= 0 && (options.count === Infinity || Number.isInteger(options.count)))) {
          throw new TypeError("The `count` option should be at least 0 or more");
        }
        const events = normalizeEvents(event);
        const items = [];
        const { addListener, removeListener } = normalizeEmitter(emitter);
        const onItem = (...args) => {
          const value = options.multiArgs ? args : args[0];
          if (options.filter && !options.filter(value)) {
            return;
          }
          items.push(value);
          if (options.count === items.length) {
            cancel();
            resolve2(items);
          }
        };
        const rejectHandler = (error) => {
          cancel();
          reject2(error);
        };
        cancel = () => {
          for (const event2 of events) {
            removeListener(event2, onItem);
          }
          for (const rejectionEvent of options.rejectionEvents) {
            removeListener(rejectionEvent, rejectHandler);
          }
        };
        for (const event2 of events) {
          addListener(event2, onItem);
        }
        for (const rejectionEvent of options.rejectionEvents) {
          addListener(rejectionEvent, rejectHandler);
        }
        if (options.resolveImmediately) {
          resolve2(items);
        }
      });
      ret.cancel = cancel;
      if (typeof options.timeout === "number") {
        const timeout = pTimeout(ret, options.timeout);
        timeout.cancel = cancel;
        return timeout;
      }
      return ret;
    };
    module2.exports = (emitter, event, options) => {
      if (typeof options === "function") {
        options = { filter: options };
      }
      options = Object.assign({}, options, {
        count: 1,
        resolveImmediately: false
      });
      const arrayPromise = multiple(emitter, event, options);
      const promise = arrayPromise.then((array) => array[0]);
      promise.cancel = arrayPromise.cancel;
      return promise;
    };
    module2.exports.multiple = multiple;
    module2.exports.iterator = (emitter, event, options) => {
      if (typeof options === "function") {
        options = { filter: options };
      }
      const events = normalizeEvents(event);
      options = Object.assign({
        rejectionEvents: ["error"],
        resolutionEvents: [],
        limit: Infinity,
        multiArgs: false
      }, options);
      const { limit } = options;
      const isValidLimit = limit >= 0 && (limit === Infinity || Number.isInteger(limit));
      if (!isValidLimit) {
        throw new TypeError("The `limit` option should be a non-negative integer or Infinity");
      }
      if (limit === 0) {
        return {
          [Symbol.asyncIterator]() {
            return this;
          },
          next() {
            return Promise.resolve({ done: true, value: void 0 });
          }
        };
      }
      let isLimitReached = false;
      const { addListener, removeListener } = normalizeEmitter(emitter);
      let done = false;
      let error;
      let hasPendingError = false;
      const nextQueue = [];
      const valueQueue = [];
      let eventCount = 0;
      const valueHandler = (...args) => {
        eventCount++;
        isLimitReached = eventCount === limit;
        const value = options.multiArgs ? args : args[0];
        if (nextQueue.length > 0) {
          const { resolve: resolve2 } = nextQueue.shift();
          resolve2({ done: false, value });
          if (isLimitReached) {
            cancel();
          }
          return;
        }
        valueQueue.push(value);
        if (isLimitReached) {
          cancel();
        }
      };
      const cancel = () => {
        done = true;
        for (const event2 of events) {
          removeListener(event2, valueHandler);
        }
        for (const rejectionEvent of options.rejectionEvents) {
          removeListener(rejectionEvent, rejectHandler);
        }
        for (const resolutionEvent of options.resolutionEvents) {
          removeListener(resolutionEvent, resolveHandler);
        }
        while (nextQueue.length > 0) {
          const { resolve: resolve2 } = nextQueue.shift();
          resolve2({ done: true, value: void 0 });
        }
      };
      const rejectHandler = (...args) => {
        error = options.multiArgs ? args : args[0];
        if (nextQueue.length > 0) {
          const { reject: reject2 } = nextQueue.shift();
          reject2(error);
        } else {
          hasPendingError = true;
        }
        cancel();
      };
      const resolveHandler = (...args) => {
        const value = options.multiArgs ? args : args[0];
        if (options.filter && !options.filter(value)) {
          return;
        }
        if (nextQueue.length > 0) {
          const { resolve: resolve2 } = nextQueue.shift();
          resolve2({ done: true, value });
        } else {
          valueQueue.push(value);
        }
        cancel();
      };
      for (const event2 of events) {
        addListener(event2, valueHandler);
      }
      for (const rejectionEvent of options.rejectionEvents) {
        addListener(rejectionEvent, rejectHandler);
      }
      for (const resolutionEvent of options.resolutionEvents) {
        addListener(resolutionEvent, resolveHandler);
      }
      return {
        [symbolAsyncIterator]() {
          return this;
        },
        next() {
          if (valueQueue.length > 0) {
            const value = valueQueue.shift();
            return Promise.resolve({ done: done && valueQueue.length === 0 && !isLimitReached, value });
          }
          if (hasPendingError) {
            hasPendingError = false;
            return Promise.reject(error);
          }
          if (done) {
            return Promise.resolve({ done: true, value: void 0 });
          }
          return new Promise((resolve2, reject2) => nextQueue.push({ resolve: resolve2, reject: reject2 }));
        },
        return(value) {
          cancel();
          return Promise.resolve({ done, value });
        }
      };
    };
  }
});

// node_modules/download/node_modules/file-type/util.js
var require_util2 = __commonJS({
  "node_modules/download/node_modules/file-type/util.js"(exports2) {
    "use strict";
    exports2.stringToBytes = (string) => [...string].map((character) => character.charCodeAt(0));
    var uint8ArrayUtf8ByteString2 = (array, start, end) => {
      return String.fromCharCode(...array.slice(start, end));
    };
    exports2.readUInt64LE = (buffer, offset = 0) => {
      let n = buffer[offset];
      let mul = 1;
      let i = 0;
      while (++i < 8) {
        mul *= 256;
        n += buffer[offset + i] * mul;
      }
      return n;
    };
    exports2.tarHeaderChecksumMatches = (buffer) => {
      if (buffer.length < 512) {
        return false;
      }
      const MASK_8TH_BIT = 128;
      let sum = 256;
      let signedBitSum = 0;
      for (let i = 0; i < 148; i++) {
        const byte = buffer[i];
        sum += byte;
        signedBitSum += byte & MASK_8TH_BIT;
      }
      for (let i = 156; i < 512; i++) {
        const byte = buffer[i];
        sum += byte;
        signedBitSum += byte & MASK_8TH_BIT;
      }
      const readSum = parseInt(uint8ArrayUtf8ByteString2(buffer, 148, 154), 8);
      return readSum === sum || readSum === sum - (signedBitSum << 1);
    };
    exports2.uint8ArrayUtf8ByteString = uint8ArrayUtf8ByteString2;
  }
});

// node_modules/download/node_modules/file-type/index.js
var require_file_type5 = __commonJS({
  "node_modules/download/node_modules/file-type/index.js"(exports, module) {
    "use strict";
    var { stringToBytes, readUInt64LE, tarHeaderChecksumMatches, uint8ArrayUtf8ByteString } = require_util2();
    var xpiZipFilename = stringToBytes("META-INF/mozilla.rsa");
    var oxmlContentTypes = stringToBytes("[Content_Types].xml");
    var oxmlRels = stringToBytes("_rels/.rels");
    var fileType = (input) => {
      if (!(input instanceof Uint8Array || input instanceof ArrayBuffer || Buffer.isBuffer(input))) {
        throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`Buffer\` or \`ArrayBuffer\`, got \`${typeof input}\``);
      }
      const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);
      if (!(buffer && buffer.length > 1)) {
        return;
      }
      const check = (header, options) => {
        options = Object.assign({
          offset: 0
        }, options);
        for (let i = 0; i < header.length; i++) {
          if (options.mask) {
            if (header[i] !== (options.mask[i] & buffer[i + options.offset])) {
              return false;
            }
          } else if (header[i] !== buffer[i + options.offset]) {
            return false;
          }
        }
        return true;
      };
      const checkString = (header, options) => check(stringToBytes(header), options);
      if (check([255, 216, 255])) {
        return {
          ext: "jpg",
          mime: "image/jpeg"
        };
      }
      if (check([137, 80, 78, 71, 13, 10, 26, 10])) {
        return {
          ext: "png",
          mime: "image/png"
        };
      }
      if (check([71, 73, 70])) {
        return {
          ext: "gif",
          mime: "image/gif"
        };
      }
      if (check([87, 69, 66, 80], { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (check([70, 76, 73, 70])) {
        return {
          ext: "flif",
          mime: "image/flif"
        };
      }
      if ((check([73, 73, 42, 0]) || check([77, 77, 0, 42])) && check([67, 82], { offset: 8 })) {
        return {
          ext: "cr2",
          mime: "image/x-canon-cr2"
        };
      }
      if (check([73, 73, 82, 79, 8, 0, 0, 0, 24])) {
        return {
          ext: "orf",
          mime: "image/x-olympus-orf"
        };
      }
      if (check([73, 73, 42, 0, 16, 251, 134, 1])) {
        return {
          ext: "arw",
          mime: "image/x-sony-arw"
        };
      }
      if (check([73, 73, 42, 0, 8, 0, 0, 0, 45])) {
        return {
          ext: "dng",
          mime: "image/x-adobe-dng"
        };
      }
      if (check([73, 73, 42, 0, 48, 61, 114, 1, 28])) {
        return {
          ext: "nef",
          mime: "image/x-nikon-nef"
        };
      }
      if (check([73, 73, 42, 0]) || check([77, 77, 0, 42])) {
        return {
          ext: "tif",
          mime: "image/tiff"
        };
      }
      if (check([66, 77])) {
        return {
          ext: "bmp",
          mime: "image/bmp"
        };
      }
      if (check([73, 73, 188])) {
        return {
          ext: "jxr",
          mime: "image/vnd.ms-photo"
        };
      }
      if (check([56, 66, 80, 83])) {
        return {
          ext: "psd",
          mime: "image/vnd.adobe.photoshop"
        };
      }
      if (check([80, 75, 3, 4])) {
        if (check([109, 105, 109, 101, 116, 121, 112, 101, 97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 101, 112, 117, 98, 43, 122, 105, 112], { offset: 30 })) {
          return {
            ext: "epub",
            mime: "application/epub+zip"
          };
        }
        if (check(xpiZipFilename, { offset: 30 })) {
          return {
            ext: "xpi",
            mime: "application/x-xpinstall"
          };
        }
        if (checkString("mimetypeapplication/vnd.oasis.opendocument.text", { offset: 30 })) {
          return {
            ext: "odt",
            mime: "application/vnd.oasis.opendocument.text"
          };
        }
        if (checkString("mimetypeapplication/vnd.oasis.opendocument.spreadsheet", { offset: 30 })) {
          return {
            ext: "ods",
            mime: "application/vnd.oasis.opendocument.spreadsheet"
          };
        }
        if (checkString("mimetypeapplication/vnd.oasis.opendocument.presentation", { offset: 30 })) {
          return {
            ext: "odp",
            mime: "application/vnd.oasis.opendocument.presentation"
          };
        }
        const findNextZipHeaderIndex = (arr, startAt = 0) => arr.findIndex((el, i, arr2) => i >= startAt && arr2[i] === 80 && arr2[i + 1] === 75 && arr2[i + 2] === 3 && arr2[i + 3] === 4);
        let zipHeaderIndex = 0;
        let oxmlFound = false;
        let type;
        do {
          const offset = zipHeaderIndex + 30;
          if (!oxmlFound) {
            oxmlFound = check(oxmlContentTypes, { offset }) || check(oxmlRels, { offset });
          }
          if (!type) {
            if (checkString("word/", { offset })) {
              type = {
                ext: "docx",
                mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              };
            } else if (checkString("ppt/", { offset })) {
              type = {
                ext: "pptx",
                mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
              };
            } else if (checkString("xl/", { offset })) {
              type = {
                ext: "xlsx",
                mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              };
            }
          }
          if (oxmlFound && type) {
            return type;
          }
          zipHeaderIndex = findNextZipHeaderIndex(buffer, offset);
        } while (zipHeaderIndex >= 0);
        if (type) {
          return type;
        }
      }
      if (check([80, 75]) && (buffer[2] === 3 || buffer[2] === 5 || buffer[2] === 7) && (buffer[3] === 4 || buffer[3] === 6 || buffer[3] === 8)) {
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (check([48, 48, 48, 48, 48, 48], { offset: 148, mask: [248, 248, 248, 248, 248, 248] }) && tarHeaderChecksumMatches(buffer)) {
        return {
          ext: "tar",
          mime: "application/x-tar"
        };
      }
      if (check([82, 97, 114, 33, 26, 7]) && (buffer[6] === 0 || buffer[6] === 1)) {
        return {
          ext: "rar",
          mime: "application/x-rar-compressed"
        };
      }
      if (check([31, 139, 8])) {
        return {
          ext: "gz",
          mime: "application/gzip"
        };
      }
      if (check([66, 90, 104])) {
        return {
          ext: "bz2",
          mime: "application/x-bzip2"
        };
      }
      if (check([55, 122, 188, 175, 39, 28])) {
        return {
          ext: "7z",
          mime: "application/x-7z-compressed"
        };
      }
      if (check([120, 1])) {
        return {
          ext: "dmg",
          mime: "application/x-apple-diskimage"
        };
      }
      if (check([102, 114, 101, 101], { offset: 4 }) || check([109, 100, 97, 116], { offset: 4 }) || check([109, 111, 111, 118], { offset: 4 }) || check([119, 105, 100, 101], { offset: 4 })) {
        return {
          ext: "mov",
          mime: "video/quicktime"
        };
      }
      if (check([102, 116, 121, 112], { offset: 4 }) && (buffer[8] & 96) !== 0 && (buffer[9] & 96) !== 0 && (buffer[10] & 96) !== 0 && (buffer[11] & 96) !== 0) {
        const brandMajor = uint8ArrayUtf8ByteString(buffer, 8, 12);
        switch (brandMajor) {
          case "mif1":
            return { ext: "heic", mime: "image/heif" };
          case "msf1":
            return { ext: "heic", mime: "image/heif-sequence" };
          case "heic":
          case "heix":
            return { ext: "heic", mime: "image/heic" };
          case "hevc":
          case "hevx":
            return { ext: "heic", mime: "image/heic-sequence" };
          case "qt  ":
            return { ext: "mov", mime: "video/quicktime" };
          case "M4V ":
          case "M4VH":
          case "M4VP":
            return { ext: "m4v", mime: "video/x-m4v" };
          case "M4P ":
            return { ext: "m4p", mime: "video/mp4" };
          case "M4B ":
            return { ext: "m4b", mime: "audio/mp4" };
          case "M4A ":
            return { ext: "m4a", mime: "audio/x-m4a" };
          case "F4V ":
            return { ext: "f4v", mime: "video/mp4" };
          case "F4P ":
            return { ext: "f4p", mime: "video/mp4" };
          case "F4A ":
            return { ext: "f4a", mime: "audio/mp4" };
          case "F4B ":
            return { ext: "f4b", mime: "audio/mp4" };
          default:
            if (brandMajor.startsWith("3g")) {
              if (brandMajor.startsWith("3g2")) {
                return { ext: "3g2", mime: "video/3gpp2" };
              }
              return { ext: "3gp", mime: "video/3gpp" };
            }
            return { ext: "mp4", mime: "video/mp4" };
        }
      }
      if (check([77, 84, 104, 100])) {
        return {
          ext: "mid",
          mime: "audio/midi"
        };
      }
      if (check([26, 69, 223, 163])) {
        const sliced = buffer.subarray(4, 4 + 4096);
        const idPos = sliced.findIndex((el, i, arr) => arr[i] === 66 && arr[i + 1] === 130);
        if (idPos !== -1) {
          const docTypePos = idPos + 3;
          const findDocType = (type) => [...type].every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));
          if (findDocType("matroska")) {
            return {
              ext: "mkv",
              mime: "video/x-matroska"
            };
          }
          if (findDocType("webm")) {
            return {
              ext: "webm",
              mime: "video/webm"
            };
          }
        }
      }
      if (check([82, 73, 70, 70])) {
        if (check([65, 86, 73], { offset: 8 })) {
          return {
            ext: "avi",
            mime: "video/vnd.avi"
          };
        }
        if (check([87, 65, 86, 69], { offset: 8 })) {
          return {
            ext: "wav",
            mime: "audio/vnd.wave"
          };
        }
        if (check([81, 76, 67, 77], { offset: 8 })) {
          return {
            ext: "qcp",
            mime: "audio/qcelp"
          };
        }
      }
      if (check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
        let offset = 30;
        do {
          const objectSize = readUInt64LE(buffer, offset + 16);
          if (check([145, 7, 220, 183, 183, 169, 207, 17, 142, 230, 0, 192, 12, 32, 83, 101], { offset })) {
            if (check([64, 158, 105, 248, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43], { offset: offset + 24 })) {
              return {
                ext: "wma",
                mime: "audio/x-ms-wma"
              };
            }
            if (check([192, 239, 25, 188, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43], { offset: offset + 24 })) {
              return {
                ext: "wmv",
                mime: "video/x-ms-asf"
              };
            }
            break;
          }
          offset += objectSize;
        } while (offset + 24 <= buffer.length);
        return {
          ext: "asf",
          mime: "application/vnd.ms-asf"
        };
      }
      if (check([0, 0, 1, 186]) || check([0, 0, 1, 179])) {
        return {
          ext: "mpg",
          mime: "video/mpeg"
        };
      }
      for (let start = 0; start < 2 && start < buffer.length - 16; start++) {
        if (check([73, 68, 51], { offset: start }) || check([255, 226], { offset: start, mask: [255, 230] })) {
          return {
            ext: "mp3",
            mime: "audio/mpeg"
          };
        }
        if (check([255, 228], { offset: start, mask: [255, 230] })) {
          return {
            ext: "mp2",
            mime: "audio/mpeg"
          };
        }
        if (check([255, 248], { offset: start, mask: [255, 252] })) {
          return {
            ext: "mp2",
            mime: "audio/mpeg"
          };
        }
        if (check([255, 240], { offset: start, mask: [255, 252] })) {
          return {
            ext: "mp4",
            mime: "audio/mpeg"
          };
        }
      }
      if (check([79, 112, 117, 115, 72, 101, 97, 100], { offset: 28 })) {
        return {
          ext: "opus",
          mime: "audio/opus"
        };
      }
      if (check([79, 103, 103, 83])) {
        if (check([128, 116, 104, 101, 111, 114, 97], { offset: 28 })) {
          return {
            ext: "ogv",
            mime: "video/ogg"
          };
        }
        if (check([1, 118, 105, 100, 101, 111, 0], { offset: 28 })) {
          return {
            ext: "ogm",
            mime: "video/ogg"
          };
        }
        if (check([127, 70, 76, 65, 67], { offset: 28 })) {
          return {
            ext: "oga",
            mime: "audio/ogg"
          };
        }
        if (check([83, 112, 101, 101, 120, 32, 32], { offset: 28 })) {
          return {
            ext: "spx",
            mime: "audio/ogg"
          };
        }
        if (check([1, 118, 111, 114, 98, 105, 115], { offset: 28 })) {
          return {
            ext: "ogg",
            mime: "audio/ogg"
          };
        }
        return {
          ext: "ogx",
          mime: "application/ogg"
        };
      }
      if (check([102, 76, 97, 67])) {
        return {
          ext: "flac",
          mime: "audio/x-flac"
        };
      }
      if (check([77, 65, 67, 32])) {
        return {
          ext: "ape",
          mime: "audio/ape"
        };
      }
      if (check([119, 118, 112, 107])) {
        return {
          ext: "wv",
          mime: "audio/wavpack"
        };
      }
      if (check([35, 33, 65, 77, 82, 10])) {
        return {
          ext: "amr",
          mime: "audio/amr"
        };
      }
      if (check([37, 80, 68, 70])) {
        return {
          ext: "pdf",
          mime: "application/pdf"
        };
      }
      if (check([77, 90])) {
        return {
          ext: "exe",
          mime: "application/x-msdownload"
        };
      }
      if ((buffer[0] === 67 || buffer[0] === 70) && check([87, 83], { offset: 1 })) {
        return {
          ext: "swf",
          mime: "application/x-shockwave-flash"
        };
      }
      if (check([123, 92, 114, 116, 102])) {
        return {
          ext: "rtf",
          mime: "application/rtf"
        };
      }
      if (check([0, 97, 115, 109])) {
        return {
          ext: "wasm",
          mime: "application/wasm"
        };
      }
      if (check([119, 79, 70, 70]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff",
          mime: "font/woff"
        };
      }
      if (check([119, 79, 70, 50]) && (check([0, 1, 0, 0], { offset: 4 }) || check([79, 84, 84, 79], { offset: 4 }))) {
        return {
          ext: "woff2",
          mime: "font/woff2"
        };
      }
      if (check([76, 80], { offset: 34 }) && (check([0, 0, 1], { offset: 8 }) || check([1, 0, 2], { offset: 8 }) || check([2, 0, 2], { offset: 8 }))) {
        return {
          ext: "eot",
          mime: "application/vnd.ms-fontobject"
        };
      }
      if (check([0, 1, 0, 0, 0])) {
        return {
          ext: "ttf",
          mime: "font/ttf"
        };
      }
      if (check([79, 84, 84, 79, 0])) {
        return {
          ext: "otf",
          mime: "font/otf"
        };
      }
      if (check([0, 0, 1, 0])) {
        return {
          ext: "ico",
          mime: "image/x-icon"
        };
      }
      if (check([0, 0, 2, 0])) {
        return {
          ext: "cur",
          mime: "image/x-icon"
        };
      }
      if (check([70, 76, 86, 1])) {
        return {
          ext: "flv",
          mime: "video/x-flv"
        };
      }
      if (check([37, 33])) {
        return {
          ext: "ps",
          mime: "application/postscript"
        };
      }
      if (check([253, 55, 122, 88, 90, 0])) {
        return {
          ext: "xz",
          mime: "application/x-xz"
        };
      }
      if (check([83, 81, 76, 105])) {
        return {
          ext: "sqlite",
          mime: "application/x-sqlite3"
        };
      }
      if (check([78, 69, 83, 26])) {
        return {
          ext: "nes",
          mime: "application/x-nintendo-nes-rom"
        };
      }
      if (check([67, 114, 50, 52])) {
        return {
          ext: "crx",
          mime: "application/x-google-chrome-extension"
        };
      }
      if (check([77, 83, 67, 70]) || check([73, 83, 99, 40])) {
        return {
          ext: "cab",
          mime: "application/vnd.ms-cab-compressed"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62, 10, 100, 101, 98, 105, 97, 110, 45, 98, 105, 110, 97, 114, 121])) {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      if (check([33, 60, 97, 114, 99, 104, 62])) {
        return {
          ext: "ar",
          mime: "application/x-unix-archive"
        };
      }
      if (check([237, 171, 238, 219])) {
        return {
          ext: "rpm",
          mime: "application/x-rpm"
        };
      }
      if (check([31, 160]) || check([31, 157])) {
        return {
          ext: "Z",
          mime: "application/x-compress"
        };
      }
      if (check([76, 90, 73, 80])) {
        return {
          ext: "lz",
          mime: "application/x-lzip"
        };
      }
      if (check([208, 207, 17, 224, 161, 177, 26, 225])) {
        return {
          ext: "msi",
          mime: "application/x-msi"
        };
      }
      if (check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
        return {
          ext: "mxf",
          mime: "application/mxf"
        };
      }
      if (check([71], { offset: 4 }) && (check([71], { offset: 192 }) || check([71], { offset: 196 }))) {
        return {
          ext: "mts",
          mime: "video/mp2t"
        };
      }
      if (check([66, 76, 69, 78, 68, 69, 82])) {
        return {
          ext: "blend",
          mime: "application/x-blender"
        };
      }
      if (check([66, 80, 71, 251])) {
        return {
          ext: "bpg",
          mime: "image/bpg"
        };
      }
      if (check([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10])) {
        if (check([106, 112, 50, 32], { offset: 20 })) {
          return {
            ext: "jp2",
            mime: "image/jp2"
          };
        }
        if (check([106, 112, 120, 32], { offset: 20 })) {
          return {
            ext: "jpx",
            mime: "image/jpx"
          };
        }
        if (check([106, 112, 109, 32], { offset: 20 })) {
          return {
            ext: "jpm",
            mime: "image/jpm"
          };
        }
        if (check([109, 106, 112, 50], { offset: 20 })) {
          return {
            ext: "mj2",
            mime: "image/mj2"
          };
        }
      }
      if (check([70, 79, 82, 77])) {
        return {
          ext: "aif",
          mime: "audio/aiff"
        };
      }
      if (checkString("<?xml ")) {
        return {
          ext: "xml",
          mime: "application/xml"
        };
      }
      if (check([66, 79, 79, 75, 77, 79, 66, 73], { offset: 60 })) {
        return {
          ext: "mobi",
          mime: "application/x-mobipocket-ebook"
        };
      }
      if (check([171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10])) {
        return {
          ext: "ktx",
          mime: "image/ktx"
        };
      }
      if (check([68, 73, 67, 77], { offset: 128 })) {
        return {
          ext: "dcm",
          mime: "application/dicom"
        };
      }
      if (check([77, 80, 43])) {
        return {
          ext: "mpc",
          mime: "audio/x-musepack"
        };
      }
      if (check([77, 80, 67, 75])) {
        return {
          ext: "mpc",
          mime: "audio/x-musepack"
        };
      }
      if (check([66, 69, 71, 73, 78, 58])) {
        return {
          ext: "ics",
          mime: "text/calendar"
        };
      }
      if (check([103, 108, 84, 70, 2, 0, 0, 0])) {
        return {
          ext: "glb",
          mime: "model/gltf-binary"
        };
      }
      if (check([212, 195, 178, 161]) || check([161, 178, 195, 212])) {
        return {
          ext: "pcap",
          mime: "application/vnd.tcpdump.pcap"
        };
      }
      if (check([68, 83, 68, 32])) {
        return {
          ext: "dsf",
          mime: "audio/x-dsf"
        };
      }
      if (check([76, 0, 0, 0, 1, 20, 2, 0, 0, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 70])) {
        return {
          ext: "lnk",
          mime: "application/x.ms.shortcut"
        };
      }
      if (check([98, 111, 111, 107, 0, 0, 0, 0, 109, 97, 114, 107, 0, 0, 0, 0])) {
        return {
          ext: "alias",
          mime: "application/x.apple.alias"
        };
      }
      if (checkString("Creative Voice File")) {
        return {
          ext: "voc",
          mime: "audio/x-voc"
        };
      }
      if (check([11, 119])) {
        return {
          ext: "ac3",
          mime: "audio/vnd.dolby.dd-raw"
        };
      }
    };
    module.exports = fileType;
    Object.defineProperty(fileType, "minimumBytes", { value: 4100 });
    fileType.stream = (readableStream) => new Promise((resolve, reject) => {
      const stream = eval("require")("stream");
      readableStream.once("readable", () => {
        const pass = new stream.PassThrough();
        const chunk = readableStream.read(module.exports.minimumBytes) || readableStream.read();
        try {
          pass.fileType = fileType(chunk);
        } catch (error) {
          reject(error);
        }
        readableStream.unshift(chunk);
        if (stream.pipeline) {
          resolve(stream.pipeline(readableStream, pass, () => {
          }));
        } else {
          resolve(readableStream.pipe(pass));
        }
      });
    });
  }
});

// node_modules/mime-db/db.json
var require_db = __commonJS({
  "node_modules/mime-db/db.json"(exports2, module2) {
    module2.exports = {
      "application/1d-interleaved-parityfec": {
        source: "iana"
      },
      "application/3gpdash-qoe-report+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/3gpp-ims+xml": {
        source: "iana",
        compressible: true
      },
      "application/3gpphal+json": {
        source: "iana",
        compressible: true
      },
      "application/3gpphalforms+json": {
        source: "iana",
        compressible: true
      },
      "application/a2l": {
        source: "iana"
      },
      "application/ace+cbor": {
        source: "iana"
      },
      "application/activemessage": {
        source: "iana"
      },
      "application/activity+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-directory+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcost+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcostparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointprop+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointpropparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-error+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamcontrol+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamparams+json": {
        source: "iana",
        compressible: true
      },
      "application/aml": {
        source: "iana"
      },
      "application/andrew-inset": {
        source: "iana",
        extensions: ["ez"]
      },
      "application/applefile": {
        source: "iana"
      },
      "application/applixware": {
        source: "apache",
        extensions: ["aw"]
      },
      "application/at+jwt": {
        source: "iana"
      },
      "application/atf": {
        source: "iana"
      },
      "application/atfx": {
        source: "iana"
      },
      "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atom"]
      },
      "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomcat"]
      },
      "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomdeleted"]
      },
      "application/atomicmail": {
        source: "iana"
      },
      "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomsvc"]
      },
      "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dwd"]
      },
      "application/atsc-dynamic-event-message": {
        source: "iana"
      },
      "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: ["held"]
      },
      "application/atsc-rdt+json": {
        source: "iana",
        compressible: true
      },
      "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsat"]
      },
      "application/atxml": {
        source: "iana"
      },
      "application/auth-policy+xml": {
        source: "iana",
        compressible: true
      },
      "application/bacnet-xdd+zip": {
        source: "iana",
        compressible: false
      },
      "application/batch-smtp": {
        source: "iana"
      },
      "application/bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/beep+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/calendar+json": {
        source: "iana",
        compressible: true
      },
      "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xcs"]
      },
      "application/call-completion": {
        source: "iana"
      },
      "application/cals-1840": {
        source: "iana"
      },
      "application/captive+json": {
        source: "iana",
        compressible: true
      },
      "application/cbor": {
        source: "iana"
      },
      "application/cbor-seq": {
        source: "iana"
      },
      "application/cccex": {
        source: "iana"
      },
      "application/ccmp+xml": {
        source: "iana",
        compressible: true
      },
      "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ccxml"]
      },
      "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdfx"]
      },
      "application/cdmi-capability": {
        source: "iana",
        extensions: ["cdmia"]
      },
      "application/cdmi-container": {
        source: "iana",
        extensions: ["cdmic"]
      },
      "application/cdmi-domain": {
        source: "iana",
        extensions: ["cdmid"]
      },
      "application/cdmi-object": {
        source: "iana",
        extensions: ["cdmio"]
      },
      "application/cdmi-queue": {
        source: "iana",
        extensions: ["cdmiq"]
      },
      "application/cdni": {
        source: "iana"
      },
      "application/cea": {
        source: "iana"
      },
      "application/cea-2018+xml": {
        source: "iana",
        compressible: true
      },
      "application/cellml+xml": {
        source: "iana",
        compressible: true
      },
      "application/cfw": {
        source: "iana"
      },
      "application/city+json": {
        source: "iana",
        compressible: true
      },
      "application/clr": {
        source: "iana"
      },
      "application/clue+xml": {
        source: "iana",
        compressible: true
      },
      "application/clue_info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cms": {
        source: "iana"
      },
      "application/cnrp+xml": {
        source: "iana",
        compressible: true
      },
      "application/coap-group+json": {
        source: "iana",
        compressible: true
      },
      "application/coap-payload": {
        source: "iana"
      },
      "application/commonground": {
        source: "iana"
      },
      "application/conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cose": {
        source: "iana"
      },
      "application/cose-key": {
        source: "iana"
      },
      "application/cose-key-set": {
        source: "iana"
      },
      "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cpl"]
      },
      "application/csrattrs": {
        source: "iana"
      },
      "application/csta+xml": {
        source: "iana",
        compressible: true
      },
      "application/cstadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/csvm+json": {
        source: "iana",
        compressible: true
      },
      "application/cu-seeme": {
        source: "apache",
        extensions: ["cu"]
      },
      "application/cwt": {
        source: "iana"
      },
      "application/cybercash": {
        source: "iana"
      },
      "application/dart": {
        compressible: true
      },
      "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpd"]
      },
      "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpp"]
      },
      "application/dashdelta": {
        source: "iana"
      },
      "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: ["davmount"]
      },
      "application/dca-rft": {
        source: "iana"
      },
      "application/dcd": {
        source: "iana"
      },
      "application/dec-dx": {
        source: "iana"
      },
      "application/dialog-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/dicom": {
        source: "iana"
      },
      "application/dicom+json": {
        source: "iana",
        compressible: true
      },
      "application/dicom+xml": {
        source: "iana",
        compressible: true
      },
      "application/dii": {
        source: "iana"
      },
      "application/dit": {
        source: "iana"
      },
      "application/dns": {
        source: "iana"
      },
      "application/dns+json": {
        source: "iana",
        compressible: true
      },
      "application/dns-message": {
        source: "iana"
      },
      "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dbk"]
      },
      "application/dots+cbor": {
        source: "iana"
      },
      "application/dskpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/dssc+der": {
        source: "iana",
        extensions: ["dssc"]
      },
      "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdssc"]
      },
      "application/dvcs": {
        source: "iana"
      },
      "application/ecmascript": {
        source: "iana",
        compressible: true,
        extensions: ["es", "ecma"]
      },
      "application/edi-consent": {
        source: "iana"
      },
      "application/edi-x12": {
        source: "iana",
        compressible: false
      },
      "application/edifact": {
        source: "iana",
        compressible: false
      },
      "application/efi": {
        source: "iana"
      },
      "application/elm+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/elm+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.cap+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/emergencycalldata.comment+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.control+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.deviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.ecall.msd": {
        source: "iana"
      },
      "application/emergencycalldata.providerinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.serviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.subscriberinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.veds+xml": {
        source: "iana",
        compressible: true
      },
      "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emma"]
      },
      "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emotionml"]
      },
      "application/encaprtp": {
        source: "iana"
      },
      "application/epp+xml": {
        source: "iana",
        compressible: true
      },
      "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: ["epub"]
      },
      "application/eshop": {
        source: "iana"
      },
      "application/exi": {
        source: "iana",
        extensions: ["exi"]
      },
      "application/expect-ct-report+json": {
        source: "iana",
        compressible: true
      },
      "application/express": {
        source: "iana",
        extensions: ["exp"]
      },
      "application/fastinfoset": {
        source: "iana"
      },
      "application/fastsoap": {
        source: "iana"
      },
      "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fdt"]
      },
      "application/fhir+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fhir+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fido.trusted-apps+json": {
        compressible: true
      },
      "application/fits": {
        source: "iana"
      },
      "application/flexfec": {
        source: "iana"
      },
      "application/font-sfnt": {
        source: "iana"
      },
      "application/font-tdpfr": {
        source: "iana",
        extensions: ["pfr"]
      },
      "application/font-woff": {
        source: "iana",
        compressible: false
      },
      "application/framework-attributes+xml": {
        source: "iana",
        compressible: true
      },
      "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: ["geojson"]
      },
      "application/geo+json-seq": {
        source: "iana"
      },
      "application/geopackage+sqlite3": {
        source: "iana"
      },
      "application/geoxacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/gltf-buffer": {
        source: "iana"
      },
      "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["gml"]
      },
      "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["gpx"]
      },
      "application/gxf": {
        source: "apache",
        extensions: ["gxf"]
      },
      "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: ["gz"]
      },
      "application/h224": {
        source: "iana"
      },
      "application/held+xml": {
        source: "iana",
        compressible: true
      },
      "application/hjson": {
        extensions: ["hjson"]
      },
      "application/http": {
        source: "iana"
      },
      "application/hyperstudio": {
        source: "iana",
        extensions: ["stk"]
      },
      "application/ibe-key-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pkg-reply+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pp-data": {
        source: "iana"
      },
      "application/iges": {
        source: "iana"
      },
      "application/im-iscomposing+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/index": {
        source: "iana"
      },
      "application/index.cmd": {
        source: "iana"
      },
      "application/index.obj": {
        source: "iana"
      },
      "application/index.response": {
        source: "iana"
      },
      "application/index.vnd": {
        source: "iana"
      },
      "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ink", "inkml"]
      },
      "application/iotp": {
        source: "iana"
      },
      "application/ipfix": {
        source: "iana",
        extensions: ["ipfix"]
      },
      "application/ipp": {
        source: "iana"
      },
      "application/isup": {
        source: "iana"
      },
      "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: ["its"]
      },
      "application/java-archive": {
        source: "apache",
        compressible: false,
        extensions: ["jar", "war", "ear"]
      },
      "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: ["ser"]
      },
      "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: ["class"]
      },
      "application/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js", "mjs"]
      },
      "application/jf2feed+json": {
        source: "iana",
        compressible: true
      },
      "application/jose": {
        source: "iana"
      },
      "application/jose+json": {
        source: "iana",
        compressible: true
      },
      "application/jrd+json": {
        source: "iana",
        compressible: true
      },
      "application/jscalendar+json": {
        source: "iana",
        compressible: true
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["json", "map"]
      },
      "application/json-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/json-seq": {
        source: "iana"
      },
      "application/json5": {
        extensions: ["json5"]
      },
      "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: ["jsonml"]
      },
      "application/jwk+json": {
        source: "iana",
        compressible: true
      },
      "application/jwk-set+json": {
        source: "iana",
        compressible: true
      },
      "application/jwt": {
        source: "iana"
      },
      "application/kpml-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/kpml-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: ["jsonld"]
      },
      "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lgr"]
      },
      "application/link-format": {
        source: "iana"
      },
      "application/load-control+xml": {
        source: "iana",
        compressible: true
      },
      "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lostxml"]
      },
      "application/lostsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/lpf+zip": {
        source: "iana",
        compressible: false
      },
      "application/lxf": {
        source: "iana"
      },
      "application/mac-binhex40": {
        source: "iana",
        extensions: ["hqx"]
      },
      "application/mac-compactpro": {
        source: "apache",
        extensions: ["cpt"]
      },
      "application/macwriteii": {
        source: "iana"
      },
      "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mads"]
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["webmanifest"]
      },
      "application/marc": {
        source: "iana",
        extensions: ["mrc"]
      },
      "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mrcx"]
      },
      "application/mathematica": {
        source: "iana",
        extensions: ["ma", "nb", "mb"]
      },
      "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mathml"]
      },
      "application/mathml-content+xml": {
        source: "iana",
        compressible: true
      },
      "application/mathml-presentation+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-associated-procedure-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-deregister+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-envelope+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-protection-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-reception-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-user-service-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbox": {
        source: "iana",
        extensions: ["mbox"]
      },
      "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpf"]
      },
      "application/media_control+xml": {
        source: "iana",
        compressible: true
      },
      "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mscml"]
      },
      "application/merge-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: ["metalink"]
      },
      "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: ["meta4"]
      },
      "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mets"]
      },
      "application/mf4": {
        source: "iana"
      },
      "application/mikey": {
        source: "iana"
      },
      "application/mipc": {
        source: "iana"
      },
      "application/missing-blocks+cbor-seq": {
        source: "iana"
      },
      "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["maei"]
      },
      "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musd"]
      },
      "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mods"]
      },
      "application/moss-keys": {
        source: "iana"
      },
      "application/moss-signature": {
        source: "iana"
      },
      "application/mosskey-data": {
        source: "iana"
      },
      "application/mosskey-request": {
        source: "iana"
      },
      "application/mp21": {
        source: "iana",
        extensions: ["m21", "mp21"]
      },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4s", "m4p"]
      },
      "application/mpeg4-generic": {
        source: "iana"
      },
      "application/mpeg4-iod": {
        source: "iana"
      },
      "application/mpeg4-iod-xmt": {
        source: "iana"
      },
      "application/mrb-consumer+xml": {
        source: "iana",
        compressible: true
      },
      "application/mrb-publish+xml": {
        source: "iana",
        compressible: true
      },
      "application/msc-ivr+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msc-mixer+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msword": {
        source: "iana",
        compressible: false,
        extensions: ["doc", "dot"]
      },
      "application/mud+json": {
        source: "iana",
        compressible: true
      },
      "application/multipart-core": {
        source: "iana"
      },
      "application/mxf": {
        source: "iana",
        extensions: ["mxf"]
      },
      "application/n-quads": {
        source: "iana",
        extensions: ["nq"]
      },
      "application/n-triples": {
        source: "iana",
        extensions: ["nt"]
      },
      "application/nasdata": {
        source: "iana"
      },
      "application/news-checkgroups": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-groupinfo": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-transmission": {
        source: "iana"
      },
      "application/nlsml+xml": {
        source: "iana",
        compressible: true
      },
      "application/node": {
        source: "iana",
        extensions: ["cjs"]
      },
      "application/nss": {
        source: "iana"
      },
      "application/oauth-authz-req+jwt": {
        source: "iana"
      },
      "application/oblivious-dns-message": {
        source: "iana"
      },
      "application/ocsp-request": {
        source: "iana"
      },
      "application/ocsp-response": {
        source: "iana"
      },
      "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
      },
      "application/oda": {
        source: "iana",
        extensions: ["oda"]
      },
      "application/odm+xml": {
        source: "iana",
        compressible: true
      },
      "application/odx": {
        source: "iana"
      },
      "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["opf"]
      },
      "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogx"]
      },
      "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["omdoc"]
      },
      "application/onenote": {
        source: "apache",
        extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
      },
      "application/opc-nodeset+xml": {
        source: "iana",
        compressible: true
      },
      "application/oscore": {
        source: "iana"
      },
      "application/oxps": {
        source: "iana",
        extensions: ["oxps"]
      },
      "application/p21": {
        source: "iana"
      },
      "application/p21+zip": {
        source: "iana",
        compressible: false
      },
      "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: ["relo"]
      },
      "application/parityfec": {
        source: "iana"
      },
      "application/passport": {
        source: "iana"
      },
      "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xer"]
      },
      "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: ["pdf"]
      },
      "application/pdx": {
        source: "iana"
      },
      "application/pem-certificate-chain": {
        source: "iana"
      },
      "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: ["pgp"]
      },
      "application/pgp-keys": {
        source: "iana",
        extensions: ["asc"]
      },
      "application/pgp-signature": {
        source: "iana",
        extensions: ["asc", "sig"]
      },
      "application/pics-rules": {
        source: "apache",
        extensions: ["prf"]
      },
      "application/pidf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pidf-diff+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pkcs10": {
        source: "iana",
        extensions: ["p10"]
      },
      "application/pkcs12": {
        source: "iana"
      },
      "application/pkcs7-mime": {
        source: "iana",
        extensions: ["p7m", "p7c"]
      },
      "application/pkcs7-signature": {
        source: "iana",
        extensions: ["p7s"]
      },
      "application/pkcs8": {
        source: "iana",
        extensions: ["p8"]
      },
      "application/pkcs8-encrypted": {
        source: "iana"
      },
      "application/pkix-attr-cert": {
        source: "iana",
        extensions: ["ac"]
      },
      "application/pkix-cert": {
        source: "iana",
        extensions: ["cer"]
      },
      "application/pkix-crl": {
        source: "iana",
        extensions: ["crl"]
      },
      "application/pkix-pkipath": {
        source: "iana",
        extensions: ["pkipath"]
      },
      "application/pkixcmp": {
        source: "iana",
        extensions: ["pki"]
      },
      "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pls"]
      },
      "application/poc-settings+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: ["ai", "eps", "ps"]
      },
      "application/ppsp-tracker+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+xml": {
        source: "iana",
        compressible: true
      },
      "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: ["provx"]
      },
      "application/prs.alvestrand.titrax-sheet": {
        source: "iana"
      },
      "application/prs.cww": {
        source: "iana",
        extensions: ["cww"]
      },
      "application/prs.cyn": {
        source: "iana",
        charset: "7-BIT"
      },
      "application/prs.hpub+zip": {
        source: "iana",
        compressible: false
      },
      "application/prs.nprend": {
        source: "iana"
      },
      "application/prs.plucker": {
        source: "iana"
      },
      "application/prs.rdf-xml-crypt": {
        source: "iana"
      },
      "application/prs.xsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pskcxml"]
      },
      "application/pvd+json": {
        source: "iana",
        compressible: true
      },
      "application/qsig": {
        source: "iana"
      },
      "application/raml+yaml": {
        compressible: true,
        extensions: ["raml"]
      },
      "application/raptorfec": {
        source: "iana"
      },
      "application/rdap+json": {
        source: "iana",
        compressible: true
      },
      "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rdf", "owl"]
      },
      "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rif"]
      },
      "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: ["rnc"]
      },
      "application/remote-printing": {
        source: "iana"
      },
      "application/reputon+json": {
        source: "iana",
        compressible: true
      },
      "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rl"]
      },
      "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rld"]
      },
      "application/rfc+xml": {
        source: "iana",
        compressible: true
      },
      "application/riscos": {
        source: "iana"
      },
      "application/rlmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rs"]
      },
      "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rapd"]
      },
      "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sls"]
      },
      "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rusd"]
      },
      "application/rpki-ghostbusters": {
        source: "iana",
        extensions: ["gbr"]
      },
      "application/rpki-manifest": {
        source: "iana",
        extensions: ["mft"]
      },
      "application/rpki-publication": {
        source: "iana"
      },
      "application/rpki-roa": {
        source: "iana",
        extensions: ["roa"]
      },
      "application/rpki-updown": {
        source: "iana"
      },
      "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rsd"]
      },
      "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rss"]
      },
      "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "application/rtploopback": {
        source: "iana"
      },
      "application/rtx": {
        source: "iana"
      },
      "application/samlassertion+xml": {
        source: "iana",
        compressible: true
      },
      "application/samlmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/sarif+json": {
        source: "iana",
        compressible: true
      },
      "application/sarif-external-properties+json": {
        source: "iana",
        compressible: true
      },
      "application/sbe": {
        source: "iana"
      },
      "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sbml"]
      },
      "application/scaip+xml": {
        source: "iana",
        compressible: true
      },
      "application/scim+json": {
        source: "iana",
        compressible: true
      },
      "application/scvp-cv-request": {
        source: "iana",
        extensions: ["scq"]
      },
      "application/scvp-cv-response": {
        source: "iana",
        extensions: ["scs"]
      },
      "application/scvp-vp-request": {
        source: "iana",
        extensions: ["spq"]
      },
      "application/scvp-vp-response": {
        source: "iana",
        extensions: ["spp"]
      },
      "application/sdp": {
        source: "iana",
        extensions: ["sdp"]
      },
      "application/secevent+jwt": {
        source: "iana"
      },
      "application/senml+cbor": {
        source: "iana"
      },
      "application/senml+json": {
        source: "iana",
        compressible: true
      },
      "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["senmlx"]
      },
      "application/senml-etch+cbor": {
        source: "iana"
      },
      "application/senml-etch+json": {
        source: "iana",
        compressible: true
      },
      "application/senml-exi": {
        source: "iana"
      },
      "application/sensml+cbor": {
        source: "iana"
      },
      "application/sensml+json": {
        source: "iana",
        compressible: true
      },
      "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sensmlx"]
      },
      "application/sensml-exi": {
        source: "iana"
      },
      "application/sep+xml": {
        source: "iana",
        compressible: true
      },
      "application/sep-exi": {
        source: "iana"
      },
      "application/session-info": {
        source: "iana"
      },
      "application/set-payment": {
        source: "iana"
      },
      "application/set-payment-initiation": {
        source: "iana",
        extensions: ["setpay"]
      },
      "application/set-registration": {
        source: "iana"
      },
      "application/set-registration-initiation": {
        source: "iana",
        extensions: ["setreg"]
      },
      "application/sgml": {
        source: "iana"
      },
      "application/sgml-open-catalog": {
        source: "iana"
      },
      "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["shf"]
      },
      "application/sieve": {
        source: "iana",
        extensions: ["siv", "sieve"]
      },
      "application/simple-filter+xml": {
        source: "iana",
        compressible: true
      },
      "application/simple-message-summary": {
        source: "iana"
      },
      "application/simplesymbolcontainer": {
        source: "iana"
      },
      "application/sipc": {
        source: "iana"
      },
      "application/slate": {
        source: "iana"
      },
      "application/smil": {
        source: "iana"
      },
      "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: ["smi", "smil"]
      },
      "application/smpte336m": {
        source: "iana"
      },
      "application/soap+fastinfoset": {
        source: "iana"
      },
      "application/soap+xml": {
        source: "iana",
        compressible: true
      },
      "application/sparql-query": {
        source: "iana",
        extensions: ["rq"]
      },
      "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: ["srx"]
      },
      "application/spdx+json": {
        source: "iana",
        compressible: true
      },
      "application/spirits-event+xml": {
        source: "iana",
        compressible: true
      },
      "application/sql": {
        source: "iana"
      },
      "application/srgs": {
        source: "iana",
        extensions: ["gram"]
      },
      "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["grxml"]
      },
      "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sru"]
      },
      "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ssdl"]
      },
      "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ssml"]
      },
      "application/stix+json": {
        source: "iana",
        compressible: true
      },
      "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["swidtag"]
      },
      "application/tamp-apex-update": {
        source: "iana"
      },
      "application/tamp-apex-update-confirm": {
        source: "iana"
      },
      "application/tamp-community-update": {
        source: "iana"
      },
      "application/tamp-community-update-confirm": {
        source: "iana"
      },
      "application/tamp-error": {
        source: "iana"
      },
      "application/tamp-sequence-adjust": {
        source: "iana"
      },
      "application/tamp-sequence-adjust-confirm": {
        source: "iana"
      },
      "application/tamp-status-query": {
        source: "iana"
      },
      "application/tamp-status-response": {
        source: "iana"
      },
      "application/tamp-update": {
        source: "iana"
      },
      "application/tamp-update-confirm": {
        source: "iana"
      },
      "application/tar": {
        compressible: true
      },
      "application/taxii+json": {
        source: "iana",
        compressible: true
      },
      "application/td+json": {
        source: "iana",
        compressible: true
      },
      "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tei", "teicorpus"]
      },
      "application/tetra_isi": {
        source: "iana"
      },
      "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tfi"]
      },
      "application/timestamp-query": {
        source: "iana"
      },
      "application/timestamp-reply": {
        source: "iana"
      },
      "application/timestamped-data": {
        source: "iana",
        extensions: ["tsd"]
      },
      "application/tlsrpt+gzip": {
        source: "iana"
      },
      "application/tlsrpt+json": {
        source: "iana",
        compressible: true
      },
      "application/tnauthlist": {
        source: "iana"
      },
      "application/token-introspection+jwt": {
        source: "iana"
      },
      "application/toml": {
        compressible: true,
        extensions: ["toml"]
      },
      "application/trickle-ice-sdpfrag": {
        source: "iana"
      },
      "application/trig": {
        source: "iana",
        extensions: ["trig"]
      },
      "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ttml"]
      },
      "application/tve-trigger": {
        source: "iana"
      },
      "application/tzif": {
        source: "iana"
      },
      "application/tzif-leap": {
        source: "iana"
      },
      "application/ubjson": {
        compressible: false,
        extensions: ["ubj"]
      },
      "application/ulpfec": {
        source: "iana"
      },
      "application/urc-grpsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsheet"]
      },
      "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["td"]
      },
      "application/urc-uisocketdesc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vcard+json": {
        source: "iana",
        compressible: true
      },
      "application/vcard+xml": {
        source: "iana",
        compressible: true
      },
      "application/vemmi": {
        source: "iana"
      },
      "application/vividence.scriptfile": {
        source: "apache"
      },
      "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: ["1km"]
      },
      "application/vnd.3gpp-prose+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ch+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-v2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.5gnas": {
        source: "iana"
      },
      "application/vnd.3gpp.access-transfer-events+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.bsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gmop+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gtpc": {
        source: "iana"
      },
      "application/vnd.3gpp.interworking-data": {
        source: "iana"
      },
      "application/vnd.3gpp.lpp": {
        source: "iana"
      },
      "application/vnd.3gpp.mc-signalling-ear": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-payload": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-signalling": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-floor-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-signed+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-init-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-transmission-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mid-call+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ngap": {
        source: "iana"
      },
      "application/vnd.3gpp.pfcp": {
        source: "iana"
      },
      "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: ["plb"]
      },
      "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: ["psb"]
      },
      "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: ["pvb"]
      },
      "application/vnd.3gpp.s1ap": {
        source: "iana"
      },
      "application/vnd.3gpp.sms": {
        source: "iana"
      },
      "application/vnd.3gpp.sms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-ext+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.state-and-event-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ussd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.bcmcsinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.sms": {
        source: "iana"
      },
      "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: ["tcap"]
      },
      "application/vnd.3lightssoftware.imagescal": {
        source: "iana"
      },
      "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: ["pwn"]
      },
      "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: ["aso"]
      },
      "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: ["imp"]
      },
      "application/vnd.acucobol": {
        source: "iana",
        extensions: ["acu"]
      },
      "application/vnd.acucorp": {
        source: "iana",
        extensions: ["atc", "acutc"]
      },
      "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: ["air"]
      },
      "application/vnd.adobe.flash.movie": {
        source: "iana"
      },
      "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: ["fcdt"]
      },
      "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: ["fxp", "fxpl"]
      },
      "application/vnd.adobe.partial-upload": {
        source: "iana"
      },
      "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdp"]
      },
      "application/vnd.adobe.xfdf": {
        source: "iana",
        extensions: ["xfdf"]
      },
      "application/vnd.aether.imp": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata-pagedef": {
        source: "iana"
      },
      "application/vnd.afpc.cmoca-cmresource": {
        source: "iana"
      },
      "application/vnd.afpc.foca-charset": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codedfont": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codepage": {
        source: "iana"
      },
      "application/vnd.afpc.modca": {
        source: "iana"
      },
      "application/vnd.afpc.modca-cmtable": {
        source: "iana"
      },
      "application/vnd.afpc.modca-formdef": {
        source: "iana"
      },
      "application/vnd.afpc.modca-mediummap": {
        source: "iana"
      },
      "application/vnd.afpc.modca-objectcontainer": {
        source: "iana"
      },
      "application/vnd.afpc.modca-overlay": {
        source: "iana"
      },
      "application/vnd.afpc.modca-pagesegment": {
        source: "iana"
      },
      "application/vnd.age": {
        source: "iana",
        extensions: ["age"]
      },
      "application/vnd.ah-barcode": {
        source: "iana"
      },
      "application/vnd.ahead.space": {
        source: "iana",
        extensions: ["ahead"]
      },
      "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: ["azf"]
      },
      "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: ["azs"]
      },
      "application/vnd.amadeus+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: ["azw"]
      },
      "application/vnd.amazon.mobi8-ebook": {
        source: "iana"
      },
      "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: ["acc"]
      },
      "application/vnd.amiga.ami": {
        source: "iana",
        extensions: ["ami"]
      },
      "application/vnd.amundsen.maze+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.android.ota": {
        source: "iana"
      },
      "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: ["apk"]
      },
      "application/vnd.anki": {
        source: "iana"
      },
      "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: ["cii"]
      },
      "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: ["fti"]
      },
      "application/vnd.antix.game-component": {
        source: "iana",
        extensions: ["atx"]
      },
      "application/vnd.apache.arrow.file": {
        source: "iana"
      },
      "application/vnd.apache.arrow.stream": {
        source: "iana"
      },
      "application/vnd.apache.thrift.binary": {
        source: "iana"
      },
      "application/vnd.apache.thrift.compact": {
        source: "iana"
      },
      "application/vnd.apache.thrift.json": {
        source: "iana"
      },
      "application/vnd.api+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.aplextor.warrp+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apothekende.reservation+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpkg"]
      },
      "application/vnd.apple.keynote": {
        source: "iana",
        extensions: ["key"]
      },
      "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: ["m3u8"]
      },
      "application/vnd.apple.numbers": {
        source: "iana",
        extensions: ["numbers"]
      },
      "application/vnd.apple.pages": {
        source: "iana",
        extensions: ["pages"]
      },
      "application/vnd.apple.pkpass": {
        compressible: false,
        extensions: ["pkpass"]
      },
      "application/vnd.arastra.swi": {
        source: "iana"
      },
      "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: ["swi"]
      },
      "application/vnd.artisan+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.artsquare": {
        source: "iana"
      },
      "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: ["iota"]
      },
      "application/vnd.audiograph": {
        source: "iana",
        extensions: ["aep"]
      },
      "application/vnd.autopackage": {
        source: "iana"
      },
      "application/vnd.avalon+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.avistar+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bmml"]
      },
      "application/vnd.balsamiq.bmpr": {
        source: "iana"
      },
      "application/vnd.banana-accounting": {
        source: "iana"
      },
      "application/vnd.bbf.usp.error": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bekitzur-stech+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bint.med-content": {
        source: "iana"
      },
      "application/vnd.biopax.rdf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.blink-idb-value-wrapper": {
        source: "iana"
      },
      "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: ["mpm"]
      },
      "application/vnd.bluetooth.ep.oob": {
        source: "iana"
      },
      "application/vnd.bluetooth.le.oob": {
        source: "iana"
      },
      "application/vnd.bmi": {
        source: "iana",
        extensions: ["bmi"]
      },
      "application/vnd.bpf": {
        source: "iana"
      },
      "application/vnd.bpf3": {
        source: "iana"
      },
      "application/vnd.businessobjects": {
        source: "iana",
        extensions: ["rep"]
      },
      "application/vnd.byu.uapi+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cab-jscript": {
        source: "iana"
      },
      "application/vnd.canon-cpdl": {
        source: "iana"
      },
      "application/vnd.canon-lips": {
        source: "iana"
      },
      "application/vnd.capasystems-pg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cendio.thinlinc.clientconf": {
        source: "iana"
      },
      "application/vnd.century-systems.tcp_stream": {
        source: "iana"
      },
      "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdxml"]
      },
      "application/vnd.chess-pgn": {
        source: "iana"
      },
      "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: ["mmd"]
      },
      "application/vnd.ciedi": {
        source: "iana"
      },
      "application/vnd.cinderella": {
        source: "iana",
        extensions: ["cdy"]
      },
      "application/vnd.cirpack.isdn-ext": {
        source: "iana"
      },
      "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: ["csl"]
      },
      "application/vnd.claymore": {
        source: "iana",
        extensions: ["cla"]
      },
      "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: ["rp9"]
      },
      "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
      },
      "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: ["c11amc"]
      },
      "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: ["c11amz"]
      },
      "application/vnd.coffeescript": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet-template": {
        source: "iana"
      },
      "application/vnd.collection+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.doc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.next+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.comicbook+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.comicbook-rar": {
        source: "iana"
      },
      "application/vnd.commerce-battelle": {
        source: "iana"
      },
      "application/vnd.commonspace": {
        source: "iana",
        extensions: ["csp"]
      },
      "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: ["cdbcmsg"]
      },
      "application/vnd.coreos.ignition+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cosmocaller": {
        source: "iana",
        extensions: ["cmc"]
      },
      "application/vnd.crick.clicker": {
        source: "iana",
        extensions: ["clkx"]
      },
      "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: ["clkk"]
      },
      "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: ["clkp"]
      },
      "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: ["clkt"]
      },
      "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: ["clkw"]
      },
      "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wbs"]
      },
      "application/vnd.cryptii.pipe+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.crypto-shade-file": {
        source: "iana"
      },
      "application/vnd.cryptomator.encrypted": {
        source: "iana"
      },
      "application/vnd.cryptomator.vault": {
        source: "iana"
      },
      "application/vnd.ctc-posml": {
        source: "iana",
        extensions: ["pml"]
      },
      "application/vnd.ctct.ws+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cups-pdf": {
        source: "iana"
      },
      "application/vnd.cups-postscript": {
        source: "iana"
      },
      "application/vnd.cups-ppd": {
        source: "iana",
        extensions: ["ppd"]
      },
      "application/vnd.cups-raster": {
        source: "iana"
      },
      "application/vnd.cups-raw": {
        source: "iana"
      },
      "application/vnd.curl": {
        source: "iana"
      },
      "application/vnd.curl.car": {
        source: "apache",
        extensions: ["car"]
      },
      "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: ["pcurl"]
      },
      "application/vnd.cyan.dean.root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cybank": {
        source: "iana"
      },
      "application/vnd.cyclonedx+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cyclonedx+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.d2l.coursepackage1p0+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.d3m-dataset": {
        source: "iana"
      },
      "application/vnd.d3m-problem": {
        source: "iana"
      },
      "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: ["dart"]
      },
      "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: ["rdz"]
      },
      "application/vnd.datapackage+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dataresource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dbf": {
        source: "iana",
        extensions: ["dbf"]
      },
      "application/vnd.debian.binary-package": {
        source: "iana"
      },
      "application/vnd.dece.data": {
        source: "iana",
        extensions: ["uvf", "uvvf", "uvd", "uvvd"]
      },
      "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uvt", "uvvt"]
      },
      "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: ["uvx", "uvvx"]
      },
      "application/vnd.dece.zip": {
        source: "iana",
        extensions: ["uvz", "uvvz"]
      },
      "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: ["fe_launch"]
      },
      "application/vnd.desmume.movie": {
        source: "iana"
      },
      "application/vnd.dir-bi.plate-dl-nosuffix": {
        source: "iana"
      },
      "application/vnd.dm.delegation+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dna": {
        source: "iana",
        extensions: ["dna"]
      },
      "application/vnd.document+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: ["mlp"]
      },
      "application/vnd.dolby.mobile.1": {
        source: "iana"
      },
      "application/vnd.dolby.mobile.2": {
        source: "iana"
      },
      "application/vnd.doremir.scorecloud-binary-document": {
        source: "iana"
      },
      "application/vnd.dpgraph": {
        source: "iana",
        extensions: ["dpg"]
      },
      "application/vnd.dreamfactory": {
        source: "iana",
        extensions: ["dfac"]
      },
      "application/vnd.drive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: ["kpxx"]
      },
      "application/vnd.dtg.local": {
        source: "iana"
      },
      "application/vnd.dtg.local.flash": {
        source: "iana"
      },
      "application/vnd.dtg.local.html": {
        source: "iana"
      },
      "application/vnd.dvb.ait": {
        source: "iana",
        extensions: ["ait"]
      },
      "application/vnd.dvb.dvbisl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.dvbj": {
        source: "iana"
      },
      "application/vnd.dvb.esgcontainer": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcdftnotifaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess2": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgpdd": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcroaming": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-base": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-enhancement": {
        source: "iana"
      },
      "application/vnd.dvb.notif-aggregate-root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-container+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-generic+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-msglist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-init+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.pfr": {
        source: "iana"
      },
      "application/vnd.dvb.service": {
        source: "iana",
        extensions: ["svc"]
      },
      "application/vnd.dxr": {
        source: "iana"
      },
      "application/vnd.dynageo": {
        source: "iana",
        extensions: ["geo"]
      },
      "application/vnd.dzr": {
        source: "iana"
      },
      "application/vnd.easykaraoke.cdgdownload": {
        source: "iana"
      },
      "application/vnd.ecdis-update": {
        source: "iana"
      },
      "application/vnd.ecip.rlp": {
        source: "iana"
      },
      "application/vnd.eclipse.ditto+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: ["mag"]
      },
      "application/vnd.ecowin.filerequest": {
        source: "iana"
      },
      "application/vnd.ecowin.fileupdate": {
        source: "iana"
      },
      "application/vnd.ecowin.series": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesrequest": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesupdate": {
        source: "iana"
      },
      "application/vnd.efi.img": {
        source: "iana"
      },
      "application/vnd.efi.iso": {
        source: "iana"
      },
      "application/vnd.emclient.accessrequest+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.enliven": {
        source: "iana",
        extensions: ["nml"]
      },
      "application/vnd.enphase.envoy": {
        source: "iana"
      },
      "application/vnd.eprints.data+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.epson.esf": {
        source: "iana",
        extensions: ["esf"]
      },
      "application/vnd.epson.msf": {
        source: "iana",
        extensions: ["msf"]
      },
      "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: ["qam"]
      },
      "application/vnd.epson.salt": {
        source: "iana",
        extensions: ["slt"]
      },
      "application/vnd.epson.ssf": {
        source: "iana",
        extensions: ["ssf"]
      },
      "application/vnd.ericsson.quickcall": {
        source: "iana"
      },
      "application/vnd.espass-espass+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: ["es3", "et3"]
      },
      "application/vnd.etsi.aoc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.asic-e+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.asic-s+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.cug+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvcommand+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-bc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-cod+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-npvr+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvservice+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mcid+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mheg5": {
        source: "iana"
      },
      "application/vnd.etsi.overload-control-policy-dataset+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.pstn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.sci+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.simservs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.timestamp-token": {
        source: "iana"
      },
      "application/vnd.etsi.tsl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.tsl.der": {
        source: "iana"
      },
      "application/vnd.eu.kasparian.car+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.eudora.data": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.profile": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.settings": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.theme": {
        source: "iana"
      },
      "application/vnd.exstream-empower+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.exstream-package": {
        source: "iana"
      },
      "application/vnd.ezpix-album": {
        source: "iana",
        extensions: ["ez2"]
      },
      "application/vnd.ezpix-package": {
        source: "iana",
        extensions: ["ez3"]
      },
      "application/vnd.f-secure.mobile": {
        source: "iana"
      },
      "application/vnd.familysearch.gedcom+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.fastcopy-disk-image": {
        source: "iana"
      },
      "application/vnd.fdf": {
        source: "iana",
        extensions: ["fdf"]
      },
      "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: ["mseed"]
      },
      "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: ["seed", "dataless"]
      },
      "application/vnd.ffsns": {
        source: "iana"
      },
      "application/vnd.ficlab.flb+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.filmit.zfc": {
        source: "iana"
      },
      "application/vnd.fints": {
        source: "iana"
      },
      "application/vnd.firemonkeys.cloudcell": {
        source: "iana"
      },
      "application/vnd.flographit": {
        source: "iana",
        extensions: ["gph"]
      },
      "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: ["ftc"]
      },
      "application/vnd.font-fontforge-sfd": {
        source: "iana"
      },
      "application/vnd.framemaker": {
        source: "iana",
        extensions: ["fm", "frame", "maker", "book"]
      },
      "application/vnd.frogans.fnc": {
        source: "iana",
        extensions: ["fnc"]
      },
      "application/vnd.frogans.ltf": {
        source: "iana",
        extensions: ["ltf"]
      },
      "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: ["fsc"]
      },
      "application/vnd.fujifilm.fb.docuworks": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.binder": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.jfi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: ["oas"]
      },
      "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: ["oa2"]
      },
      "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: ["oa3"]
      },
      "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: ["fg5"]
      },
      "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: ["bh2"]
      },
      "application/vnd.fujixerox.art-ex": {
        source: "iana"
      },
      "application/vnd.fujixerox.art4": {
        source: "iana"
      },
      "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: ["ddd"]
      },
      "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: ["xdw"]
      },
      "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: ["xbd"]
      },
      "application/vnd.fujixerox.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujixerox.hbpl": {
        source: "iana"
      },
      "application/vnd.fut-misnet": {
        source: "iana"
      },
      "application/vnd.futoin+cbor": {
        source: "iana"
      },
      "application/vnd.futoin+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: ["fzs"]
      },
      "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: ["txd"]
      },
      "application/vnd.gentics.grd+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geo+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geocube+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geogebra.file": {
        source: "iana",
        extensions: ["ggb"]
      },
      "application/vnd.geogebra.slides": {
        source: "iana"
      },
      "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: ["ggt"]
      },
      "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: ["gex", "gre"]
      },
      "application/vnd.geonext": {
        source: "iana",
        extensions: ["gxt"]
      },
      "application/vnd.geoplan": {
        source: "iana",
        extensions: ["g2w"]
      },
      "application/vnd.geospace": {
        source: "iana",
        extensions: ["g3w"]
      },
      "application/vnd.gerber": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt-response": {
        source: "iana"
      },
      "application/vnd.gmx": {
        source: "iana",
        extensions: ["gmx"]
      },
      "application/vnd.google-apps.document": {
        compressible: false,
        extensions: ["gdoc"]
      },
      "application/vnd.google-apps.presentation": {
        compressible: false,
        extensions: ["gslides"]
      },
      "application/vnd.google-apps.spreadsheet": {
        compressible: false,
        extensions: ["gsheet"]
      },
      "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["kml"]
      },
      "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: ["kmz"]
      },
      "application/vnd.gov.sk.e-form+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gov.sk.e-form+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.gov.sk.xmldatacontainer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.grafeq": {
        source: "iana",
        extensions: ["gqf", "gqs"]
      },
      "application/vnd.gridmp": {
        source: "iana"
      },
      "application/vnd.groove-account": {
        source: "iana",
        extensions: ["gac"]
      },
      "application/vnd.groove-help": {
        source: "iana",
        extensions: ["ghf"]
      },
      "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: ["gim"]
      },
      "application/vnd.groove-injector": {
        source: "iana",
        extensions: ["grv"]
      },
      "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: ["gtm"]
      },
      "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: ["tpl"]
      },
      "application/vnd.groove-vcard": {
        source: "iana",
        extensions: ["vcg"]
      },
      "application/vnd.hal+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: ["hal"]
      },
      "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zmm"]
      },
      "application/vnd.hbci": {
        source: "iana",
        extensions: ["hbci"]
      },
      "application/vnd.hc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hcl-bireports": {
        source: "iana"
      },
      "application/vnd.hdt": {
        source: "iana"
      },
      "application/vnd.heroku+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: ["les"]
      },
      "application/vnd.hl7cda+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hl7v2+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: ["hpgl"]
      },
      "application/vnd.hp-hpid": {
        source: "iana",
        extensions: ["hpid"]
      },
      "application/vnd.hp-hps": {
        source: "iana",
        extensions: ["hps"]
      },
      "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: ["jlt"]
      },
      "application/vnd.hp-pcl": {
        source: "iana",
        extensions: ["pcl"]
      },
      "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: ["pclxl"]
      },
      "application/vnd.httphone": {
        source: "iana"
      },
      "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: ["sfd-hdstx"]
      },
      "application/vnd.hyper+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyper-item+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyperdrive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hzn-3d-crossword": {
        source: "iana"
      },
      "application/vnd.ibm.afplinedata": {
        source: "iana"
      },
      "application/vnd.ibm.electronic-media": {
        source: "iana"
      },
      "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: ["mpy"]
      },
      "application/vnd.ibm.modcap": {
        source: "iana",
        extensions: ["afp", "listafp", "list3820"]
      },
      "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: ["irm"]
      },
      "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: ["sc"]
      },
      "application/vnd.iccprofile": {
        source: "iana",
        extensions: ["icc", "icm"]
      },
      "application/vnd.ieee.1905": {
        source: "iana"
      },
      "application/vnd.igloader": {
        source: "iana",
        extensions: ["igl"]
      },
      "application/vnd.imagemeter.folder+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.imagemeter.image+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: ["ivp"]
      },
      "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: ["ivu"]
      },
      "application/vnd.ims.imsccv1p1": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p2": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p3": {
        source: "iana"
      },
      "application/vnd.ims.lis.v2.result+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy.id+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings.simple+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informedcontrol.rms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informix-visionary": {
        source: "iana"
      },
      "application/vnd.infotech.project": {
        source: "iana"
      },
      "application/vnd.infotech.project+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.innopath.wamp.notification": {
        source: "iana"
      },
      "application/vnd.insors.igm": {
        source: "iana",
        extensions: ["igm"]
      },
      "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: ["xpw", "xpx"]
      },
      "application/vnd.intergeo": {
        source: "iana",
        extensions: ["i2g"]
      },
      "application/vnd.intertrust.digibox": {
        source: "iana"
      },
      "application/vnd.intertrust.nncp": {
        source: "iana"
      },
      "application/vnd.intu.qbo": {
        source: "iana",
        extensions: ["qbo"]
      },
      "application/vnd.intu.qfx": {
        source: "iana",
        extensions: ["qfx"]
      },
      "application/vnd.iptc.g2.catalogitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.conceptitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.knowledgeitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.packageitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.planningitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: ["rcprofile"]
      },
      "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["irp"]
      },
      "application/vnd.is-xpr": {
        source: "iana",
        extensions: ["xpr"]
      },
      "application/vnd.isac.fcs": {
        source: "iana",
        extensions: ["fcs"]
      },
      "application/vnd.iso11783-10+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.jam": {
        source: "iana",
        extensions: ["jam"]
      },
      "application/vnd.japannet-directory-service": {
        source: "iana"
      },
      "application/vnd.japannet-jpnstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-payment-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-registration": {
        source: "iana"
      },
      "application/vnd.japannet-registration-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-setstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-verification": {
        source: "iana"
      },
      "application/vnd.japannet-verification-wakeup": {
        source: "iana"
      },
      "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: ["rms"]
      },
      "application/vnd.jisp": {
        source: "iana",
        extensions: ["jisp"]
      },
      "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: ["joda"]
      },
      "application/vnd.jsk.isdn-ngn": {
        source: "iana"
      },
      "application/vnd.kahootz": {
        source: "iana",
        extensions: ["ktz", "ktr"]
      },
      "application/vnd.kde.karbon": {
        source: "iana",
        extensions: ["karbon"]
      },
      "application/vnd.kde.kchart": {
        source: "iana",
        extensions: ["chrt"]
      },
      "application/vnd.kde.kformula": {
        source: "iana",
        extensions: ["kfo"]
      },
      "application/vnd.kde.kivio": {
        source: "iana",
        extensions: ["flw"]
      },
      "application/vnd.kde.kontour": {
        source: "iana",
        extensions: ["kon"]
      },
      "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: ["kpr", "kpt"]
      },
      "application/vnd.kde.kspread": {
        source: "iana",
        extensions: ["ksp"]
      },
      "application/vnd.kde.kword": {
        source: "iana",
        extensions: ["kwd", "kwt"]
      },
      "application/vnd.kenameaapp": {
        source: "iana",
        extensions: ["htke"]
      },
      "application/vnd.kidspiration": {
        source: "iana",
        extensions: ["kia"]
      },
      "application/vnd.kinar": {
        source: "iana",
        extensions: ["kne", "knp"]
      },
      "application/vnd.koan": {
        source: "iana",
        extensions: ["skp", "skd", "skt", "skm"]
      },
      "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: ["sse"]
      },
      "application/vnd.las": {
        source: "iana"
      },
      "application/vnd.las.las+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lasxml"]
      },
      "application/vnd.laszip": {
        source: "iana"
      },
      "application/vnd.leap+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.liberty-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: ["lbd"]
      },
      "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lbe"]
      },
      "application/vnd.logipipe.circuit+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.loom": {
        source: "iana"
      },
      "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: ["123"]
      },
      "application/vnd.lotus-approach": {
        source: "iana",
        extensions: ["apr"]
      },
      "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: ["pre"]
      },
      "application/vnd.lotus-notes": {
        source: "iana",
        extensions: ["nsf"]
      },
      "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: ["org"]
      },
      "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: ["scm"]
      },
      "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: ["lwp"]
      },
      "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: ["portpkg"]
      },
      "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: ["mvt"]
      },
      "application/vnd.marlin.drm.actiontoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.conftoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.license+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.mdcf": {
        source: "iana"
      },
      "application/vnd.mason+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.maxar.archive.3tz+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.maxmind.maxmind-db": {
        source: "iana"
      },
      "application/vnd.mcd": {
        source: "iana",
        extensions: ["mcd"]
      },
      "application/vnd.medcalcdata": {
        source: "iana",
        extensions: ["mc1"]
      },
      "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: ["cdkey"]
      },
      "application/vnd.meridian-slingshot": {
        source: "iana"
      },
      "application/vnd.mfer": {
        source: "iana",
        extensions: ["mwf"]
      },
      "application/vnd.mfmp": {
        source: "iana",
        extensions: ["mfm"]
      },
      "application/vnd.micro+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: ["flo"]
      },
      "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: ["igx"]
      },
      "application/vnd.microsoft.portable-executable": {
        source: "iana"
      },
      "application/vnd.microsoft.windows.thumbnail-cache": {
        source: "iana"
      },
      "application/vnd.miele+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.mif": {
        source: "iana",
        extensions: ["mif"]
      },
      "application/vnd.minisoft-hp3000-save": {
        source: "iana"
      },
      "application/vnd.mitsubishi.misty-guard.trustweb": {
        source: "iana"
      },
      "application/vnd.mobius.daf": {
        source: "iana",
        extensions: ["daf"]
      },
      "application/vnd.mobius.dis": {
        source: "iana",
        extensions: ["dis"]
      },
      "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: ["mbk"]
      },
      "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: ["mqy"]
      },
      "application/vnd.mobius.msl": {
        source: "iana",
        extensions: ["msl"]
      },
      "application/vnd.mobius.plc": {
        source: "iana",
        extensions: ["plc"]
      },
      "application/vnd.mobius.txf": {
        source: "iana",
        extensions: ["txf"]
      },
      "application/vnd.mophun.application": {
        source: "iana",
        extensions: ["mpn"]
      },
      "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: ["mpc"]
      },
      "application/vnd.motorola.flexsuite": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.adsi": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.fis": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.gotap": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.kmr": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.ttc": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.wem": {
        source: "iana"
      },
      "application/vnd.motorola.iprm": {
        source: "iana"
      },
      "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xul"]
      },
      "application/vnd.ms-3mfdocument": {
        source: "iana"
      },
      "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: ["cil"]
      },
      "application/vnd.ms-asf": {
        source: "iana"
      },
      "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: ["cab"]
      },
      "application/vnd.ms-color.iccprofile": {
        source: "apache"
      },
      "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
      },
      "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: ["xlam"]
      },
      "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: ["xlsb"]
      },
      "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: ["xlsm"]
      },
      "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: ["xltm"]
      },
      "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: ["eot"]
      },
      "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: ["chm"]
      },
      "application/vnd.ms-ims": {
        source: "iana",
        extensions: ["ims"]
      },
      "application/vnd.ms-lrm": {
        source: "iana",
        extensions: ["lrm"]
      },
      "application/vnd.ms-office.activex+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: ["thmx"]
      },
      "application/vnd.ms-opentype": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-outlook": {
        compressible: false,
        extensions: ["msg"]
      },
      "application/vnd.ms-package.obfuscated-opentype": {
        source: "apache"
      },
      "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: ["cat"]
      },
      "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: ["stl"]
      },
      "application/vnd.ms-playready.initiator+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: ["ppt", "pps", "pot"]
      },
      "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: ["ppam"]
      },
      "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: ["pptm"]
      },
      "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: ["sldm"]
      },
      "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: ["ppsm"]
      },
      "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: ["potm"]
      },
      "application/vnd.ms-printdevicecapabilities+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-printing.printticket+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-printschematicket+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-project": {
        source: "iana",
        extensions: ["mpp", "mpt"]
      },
      "application/vnd.ms-tnef": {
        source: "iana"
      },
      "application/vnd.ms-windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.nwprinting.oob": {
        source: "iana"
      },
      "application/vnd.ms-windows.printerpairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.wsd.oob": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-resp": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-resp": {
        source: "iana"
      },
      "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: ["docm"]
      },
      "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: ["dotm"]
      },
      "application/vnd.ms-works": {
        source: "iana",
        extensions: ["wps", "wks", "wcm", "wdb"]
      },
      "application/vnd.ms-wpl": {
        source: "iana",
        extensions: ["wpl"]
      },
      "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: ["xps"]
      },
      "application/vnd.msa-disk-image": {
        source: "iana"
      },
      "application/vnd.mseq": {
        source: "iana",
        extensions: ["mseq"]
      },
      "application/vnd.msign": {
        source: "iana"
      },
      "application/vnd.multiad.creator": {
        source: "iana"
      },
      "application/vnd.multiad.creator.cif": {
        source: "iana"
      },
      "application/vnd.music-niff": {
        source: "iana"
      },
      "application/vnd.musician": {
        source: "iana",
        extensions: ["mus"]
      },
      "application/vnd.muvee.style": {
        source: "iana",
        extensions: ["msty"]
      },
      "application/vnd.mynfc": {
        source: "iana",
        extensions: ["taglet"]
      },
      "application/vnd.nacamar.ybrid+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ncd.control": {
        source: "iana"
      },
      "application/vnd.ncd.reference": {
        source: "iana"
      },
      "application/vnd.nearst.inv+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nebumind.line": {
        source: "iana"
      },
      "application/vnd.nervana": {
        source: "iana"
      },
      "application/vnd.netfpx": {
        source: "iana"
      },
      "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: ["nlu"]
      },
      "application/vnd.nimn": {
        source: "iana"
      },
      "application/vnd.nintendo.nitro.rom": {
        source: "iana"
      },
      "application/vnd.nintendo.snes.rom": {
        source: "iana"
      },
      "application/vnd.nitf": {
        source: "iana",
        extensions: ["ntf", "nitf"]
      },
      "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: ["nnd"]
      },
      "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: ["nns"]
      },
      "application/vnd.noblenet-web": {
        source: "iana",
        extensions: ["nnw"]
      },
      "application/vnd.nokia.catalogs": {
        source: "iana"
      },
      "application/vnd.nokia.conml+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.conml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.iptv.config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.isds-radio-presets": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.landmarkcollection+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ac"]
      },
      "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: ["ngdat"]
      },
      "application/vnd.nokia.n-gage.symbian.install": {
        source: "iana",
        extensions: ["n-gage"]
      },
      "application/vnd.nokia.ncd": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: ["rpst"]
      },
      "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: ["rpss"]
      },
      "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: ["edm"]
      },
      "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: ["edx"]
      },
      "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: ["ext"]
      },
      "application/vnd.ntt-local.content-share": {
        source: "iana"
      },
      "application/vnd.ntt-local.file-transfer": {
        source: "iana"
      },
      "application/vnd.ntt-local.ogw_remote-access": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_remote": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_tcp_stream": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: ["odc"]
      },
      "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: ["otc"]
      },
      "application/vnd.oasis.opendocument.database": {
        source: "iana",
        extensions: ["odb"]
      },
      "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: ["odf"]
      },
      "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: ["odft"]
      },
      "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: ["odg"]
      },
      "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: ["otg"]
      },
      "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: ["odi"]
      },
      "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: ["oti"]
      },
      "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["odp"]
      },
      "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: ["otp"]
      },
      "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: ["ods"]
      },
      "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: ["ots"]
      },
      "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: ["odt"]
      },
      "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: ["odm"]
      },
      "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: ["ott"]
      },
      "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: ["oth"]
      },
      "application/vnd.obn": {
        source: "iana"
      },
      "application/vnd.ocf+cbor": {
        source: "iana"
      },
      "application/vnd.oci.image.manifest.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oftn.l10n+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessdownload+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessstreaming+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.cspg-hexbinary": {
        source: "iana"
      },
      "application/vnd.oipf.dae.svg+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.dae.xhtml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.mippvcontrolmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.pae.gem": {
        source: "iana"
      },
      "application/vnd.oipf.spdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.spdlist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.ueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.userprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: ["xo"]
      },
      "application/vnd.oma-scws-config": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-request": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-response": {
        source: "iana"
      },
      "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.drm-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.imd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.ltkm": {
        source: "iana"
      },
      "application/vnd.oma.bcast.notification+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.provisioningtrigger": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgboot": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgdd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sgdu": {
        source: "iana"
      },
      "application/vnd.oma.bcast.simple-symbol-container": {
        source: "iana"
      },
      "application/vnd.oma.bcast.smartcard-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sprov+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.stkm": {
        source: "iana"
      },
      "application/vnd.oma.cab-address-book+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-feature-handler+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-pcc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-subs-invite+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-user-prefs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.dcd": {
        source: "iana"
      },
      "application/vnd.oma.dcdc": {
        source: "iana"
      },
      "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dd2"]
      },
      "application/vnd.oma.drm.risd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.group-usage-list+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+cbor": {
        source: "iana"
      },
      "application/vnd.oma.lwm2m+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+tlv": {
        source: "iana"
      },
      "application/vnd.oma.pal+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.detailed-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.final-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.groups+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.invocation-descriptor+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.optimized-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.push": {
        source: "iana"
      },
      "application/vnd.oma.scidm.messages+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.xcap-directory+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.omads-email+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-file+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-folder+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omaloc-supl-init": {
        source: "iana"
      },
      "application/vnd.onepager": {
        source: "iana"
      },
      "application/vnd.onepagertamp": {
        source: "iana"
      },
      "application/vnd.onepagertamx": {
        source: "iana"
      },
      "application/vnd.onepagertat": {
        source: "iana"
      },
      "application/vnd.onepagertatp": {
        source: "iana"
      },
      "application/vnd.onepagertatx": {
        source: "iana"
      },
      "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: ["obgx"]
      },
      "application/vnd.openblox.game-binary": {
        source: "iana"
      },
      "application/vnd.openeye.oeb": {
        source: "iana"
      },
      "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: ["oxt"]
      },
      "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osm"]
      },
      "application/vnd.opentimestamps.ots": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawing+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["pptx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: ["sldx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: ["ppsx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: ["potx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: ["xlsx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: ["xltx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.theme+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.vmldrawing": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: ["docx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: ["dotx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.core-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.relationships+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oracle.resource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.orange.indata": {
        source: "iana"
      },
      "application/vnd.osa.netdeploy": {
        source: "iana"
      },
      "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: ["mgp"]
      },
      "application/vnd.osgi.bundle": {
        source: "iana"
      },
      "application/vnd.osgi.dp": {
        source: "iana",
        extensions: ["dp"]
      },
      "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: ["esa"]
      },
      "application/vnd.otps.ct-kip+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oxli.countgraph": {
        source: "iana"
      },
      "application/vnd.pagerduty+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.palm": {
        source: "iana",
        extensions: ["pdb", "pqa", "oprc"]
      },
      "application/vnd.panoply": {
        source: "iana"
      },
      "application/vnd.paos.xml": {
        source: "iana"
      },
      "application/vnd.patentdive": {
        source: "iana"
      },
      "application/vnd.patientecommsdoc": {
        source: "iana"
      },
      "application/vnd.pawaafile": {
        source: "iana",
        extensions: ["paw"]
      },
      "application/vnd.pcos": {
        source: "iana"
      },
      "application/vnd.pg.format": {
        source: "iana",
        extensions: ["str"]
      },
      "application/vnd.pg.osasli": {
        source: "iana",
        extensions: ["ei6"]
      },
      "application/vnd.piaccess.application-licence": {
        source: "iana"
      },
      "application/vnd.picsel": {
        source: "iana",
        extensions: ["efif"]
      },
      "application/vnd.pmi.widget": {
        source: "iana",
        extensions: ["wg"]
      },
      "application/vnd.poc.group-advertisement+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.pocketlearn": {
        source: "iana",
        extensions: ["plf"]
      },
      "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: ["pbd"]
      },
      "application/vnd.powerbuilder6-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder7": {
        source: "iana"
      },
      "application/vnd.powerbuilder7-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder75": {
        source: "iana"
      },
      "application/vnd.powerbuilder75-s": {
        source: "iana"
      },
      "application/vnd.preminet": {
        source: "iana"
      },
      "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: ["box"]
      },
      "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: ["mgz"]
      },
      "application/vnd.psfs": {
        source: "iana"
      },
      "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: ["qps"]
      },
      "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: ["ptid"]
      },
      "application/vnd.pwg-multiplexed": {
        source: "iana"
      },
      "application/vnd.pwg-xhtml-print+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.qualcomm.brew-app-res": {
        source: "iana"
      },
      "application/vnd.quarantainenet": {
        source: "iana"
      },
      "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
      },
      "application/vnd.quobject-quoxdocument": {
        source: "iana"
      },
      "application/vnd.radisys.moml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-stream+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-base+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-detect+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-group+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-speech+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-transform+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rainstor.data": {
        source: "iana"
      },
      "application/vnd.rapid": {
        source: "iana"
      },
      "application/vnd.rar": {
        source: "iana",
        extensions: ["rar"]
      },
      "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: ["bed"]
      },
      "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: ["mxl"]
      },
      "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musicxml"]
      },
      "application/vnd.renlearn.rlprint": {
        source: "iana"
      },
      "application/vnd.resilient.logic": {
        source: "iana"
      },
      "application/vnd.restful+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: ["cryptonote"]
      },
      "application/vnd.rim.cod": {
        source: "apache",
        extensions: ["cod"]
      },
      "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: ["rm"]
      },
      "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: ["rmvb"]
      },
      "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: ["link66"]
      },
      "application/vnd.rs-274x": {
        source: "iana"
      },
      "application/vnd.ruckus.download": {
        source: "iana"
      },
      "application/vnd.s3sms": {
        source: "iana"
      },
      "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: ["st"]
      },
      "application/vnd.sar": {
        source: "iana"
      },
      "application/vnd.sbm.cid": {
        source: "iana"
      },
      "application/vnd.sbm.mid2": {
        source: "iana"
      },
      "application/vnd.scribus": {
        source: "iana"
      },
      "application/vnd.sealed.3df": {
        source: "iana"
      },
      "application/vnd.sealed.csf": {
        source: "iana"
      },
      "application/vnd.sealed.doc": {
        source: "iana"
      },
      "application/vnd.sealed.eml": {
        source: "iana"
      },
      "application/vnd.sealed.mht": {
        source: "iana"
      },
      "application/vnd.sealed.net": {
        source: "iana"
      },
      "application/vnd.sealed.ppt": {
        source: "iana"
      },
      "application/vnd.sealed.tiff": {
        source: "iana"
      },
      "application/vnd.sealed.xls": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.html": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.pdf": {
        source: "iana"
      },
      "application/vnd.seemail": {
        source: "iana",
        extensions: ["see"]
      },
      "application/vnd.seis+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.sema": {
        source: "iana",
        extensions: ["sema"]
      },
      "application/vnd.semd": {
        source: "iana",
        extensions: ["semd"]
      },
      "application/vnd.semf": {
        source: "iana",
        extensions: ["semf"]
      },
      "application/vnd.shade-save-file": {
        source: "iana"
      },
      "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: ["ifm"]
      },
      "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: ["itp"]
      },
      "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: ["iif"]
      },
      "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: ["ipk"]
      },
      "application/vnd.shootproof+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shopkick+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shp": {
        source: "iana"
      },
      "application/vnd.shx": {
        source: "iana"
      },
      "application/vnd.sigrok.session": {
        source: "iana"
      },
      "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: ["twd", "twds"]
      },
      "application/vnd.siren+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.smaf": {
        source: "iana",
        extensions: ["mmf"]
      },
      "application/vnd.smart.notebook": {
        source: "iana"
      },
      "application/vnd.smart.teacher": {
        source: "iana",
        extensions: ["teacher"]
      },
      "application/vnd.snesdev-page-table": {
        source: "iana"
      },
      "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fo"]
      },
      "application/vnd.software602.filler.form-xml-zip": {
        source: "iana"
      },
      "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sdkm", "sdkd"]
      },
      "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: ["dxp"]
      },
      "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: ["sfs"]
      },
      "application/vnd.sqlite3": {
        source: "iana"
      },
      "application/vnd.sss-cod": {
        source: "iana"
      },
      "application/vnd.sss-dtf": {
        source: "iana"
      },
      "application/vnd.sss-ntf": {
        source: "iana"
      },
      "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: ["sdc"]
      },
      "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: ["sda"]
      },
      "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: ["sdd"]
      },
      "application/vnd.stardivision.math": {
        source: "apache",
        extensions: ["smf"]
      },
      "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: ["sdw", "vor"]
      },
      "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: ["sgl"]
      },
      "application/vnd.stepmania.package": {
        source: "iana",
        extensions: ["smzip"]
      },
      "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: ["sm"]
      },
      "application/vnd.street-stream": {
        source: "iana"
      },
      "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wadl"]
      },
      "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: ["sxc"]
      },
      "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: ["stc"]
      },
      "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: ["sxd"]
      },
      "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: ["std"]
      },
      "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: ["sxi"]
      },
      "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: ["sti"]
      },
      "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: ["sxm"]
      },
      "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: ["sxw"]
      },
      "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: ["sxg"]
      },
      "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: ["stw"]
      },
      "application/vnd.sus-calendar": {
        source: "iana",
        extensions: ["sus", "susp"]
      },
      "application/vnd.svd": {
        source: "iana",
        extensions: ["svd"]
      },
      "application/vnd.swiftview-ics": {
        source: "iana"
      },
      "application/vnd.sycle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.syft+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.symbian.install": {
        source: "apache",
        extensions: ["sis", "sisx"]
      },
      "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xsm"]
      },
      "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["bdm"]
      },
      "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xdm"]
      },
      "application/vnd.syncml.dm.notification": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["ddf"]
      },
      "application/vnd.syncml.dmtnds+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmtnds+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.syncml.ds.notification": {
        source: "iana"
      },
      "application/vnd.tableschema+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: ["tao"]
      },
      "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: ["pcap", "cap", "dmp"]
      },
      "application/vnd.think-cell.ppttc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tmd.mediaflex.api+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tml": {
        source: "iana"
      },
      "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: ["tmo"]
      },
      "application/vnd.tri.onesource": {
        source: "iana"
      },
      "application/vnd.trid.tpt": {
        source: "iana",
        extensions: ["tpt"]
      },
      "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: ["mxs"]
      },
      "application/vnd.trueapp": {
        source: "iana",
        extensions: ["tra"]
      },
      "application/vnd.truedoc": {
        source: "iana"
      },
      "application/vnd.ubisoft.webplayer": {
        source: "iana"
      },
      "application/vnd.ufdl": {
        source: "iana",
        extensions: ["ufd", "ufdl"]
      },
      "application/vnd.uiq.theme": {
        source: "iana",
        extensions: ["utz"]
      },
      "application/vnd.umajin": {
        source: "iana",
        extensions: ["umj"]
      },
      "application/vnd.unity": {
        source: "iana",
        extensions: ["unityweb"]
      },
      "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uoml"]
      },
      "application/vnd.uplanet.alert": {
        source: "iana"
      },
      "application/vnd.uplanet.alert-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.channel": {
        source: "iana"
      },
      "application/vnd.uplanet.channel-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.list": {
        source: "iana"
      },
      "application/vnd.uplanet.list-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.signal": {
        source: "iana"
      },
      "application/vnd.uri-map": {
        source: "iana"
      },
      "application/vnd.valve.source.material": {
        source: "iana"
      },
      "application/vnd.vcx": {
        source: "iana",
        extensions: ["vcx"]
      },
      "application/vnd.vd-study": {
        source: "iana"
      },
      "application/vnd.vectorworks": {
        source: "iana"
      },
      "application/vnd.vel+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.verimatrix.vcas": {
        source: "iana"
      },
      "application/vnd.veritone.aion+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.veryant.thin": {
        source: "iana"
      },
      "application/vnd.ves.encrypted": {
        source: "iana"
      },
      "application/vnd.vidsoft.vidconference": {
        source: "iana"
      },
      "application/vnd.visio": {
        source: "iana",
        extensions: ["vsd", "vst", "vss", "vsw"]
      },
      "application/vnd.visionary": {
        source: "iana",
        extensions: ["vis"]
      },
      "application/vnd.vividence.scriptfile": {
        source: "iana"
      },
      "application/vnd.vsf": {
        source: "iana",
        extensions: ["vsf"]
      },
      "application/vnd.wap.sic": {
        source: "iana"
      },
      "application/vnd.wap.slc": {
        source: "iana"
      },
      "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["wbxml"]
      },
      "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: ["wmlc"]
      },
      "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: ["wmlsc"]
      },
      "application/vnd.webturbo": {
        source: "iana",
        extensions: ["wtb"]
      },
      "application/vnd.wfa.dpp": {
        source: "iana"
      },
      "application/vnd.wfa.p2p": {
        source: "iana"
      },
      "application/vnd.wfa.wsc": {
        source: "iana"
      },
      "application/vnd.windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.wmc": {
        source: "iana"
      },
      "application/vnd.wmf.bootstrap": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica.package": {
        source: "iana"
      },
      "application/vnd.wolfram.player": {
        source: "iana",
        extensions: ["nbp"]
      },
      "application/vnd.wordperfect": {
        source: "iana",
        extensions: ["wpd"]
      },
      "application/vnd.wqd": {
        source: "iana",
        extensions: ["wqd"]
      },
      "application/vnd.wrq-hp3000-labelled": {
        source: "iana"
      },
      "application/vnd.wt.stf": {
        source: "iana",
        extensions: ["stf"]
      },
      "application/vnd.wv.csp+wbxml": {
        source: "iana"
      },
      "application/vnd.wv.csp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.wv.ssp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xacml+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xara": {
        source: "iana",
        extensions: ["xar"]
      },
      "application/vnd.xfdl": {
        source: "iana",
        extensions: ["xfdl"]
      },
      "application/vnd.xfdl.webform": {
        source: "iana"
      },
      "application/vnd.xmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xmpie.cpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.dpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.plan": {
        source: "iana"
      },
      "application/vnd.xmpie.ppkg": {
        source: "iana"
      },
      "application/vnd.xmpie.xlim": {
        source: "iana"
      },
      "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: ["hvd"]
      },
      "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: ["hvs"]
      },
      "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: ["hvp"]
      },
      "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: ["osf"]
      },
      "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osfpvg"]
      },
      "application/vnd.yamaha.remote-setup": {
        source: "iana"
      },
      "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: ["saf"]
      },
      "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: ["spf"]
      },
      "application/vnd.yamaha.through-ngn": {
        source: "iana"
      },
      "application/vnd.yamaha.tunnel-udpencap": {
        source: "iana"
      },
      "application/vnd.yaoweme": {
        source: "iana"
      },
      "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: ["cmp"]
      },
      "application/vnd.youtube.yt": {
        source: "iana"
      },
      "application/vnd.zul": {
        source: "iana",
        extensions: ["zir", "zirz"]
      },
      "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zaz"]
      },
      "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["vxml"]
      },
      "application/voucher-cms+json": {
        source: "iana",
        compressible: true
      },
      "application/vq-rtcpxr": {
        source: "iana"
      },
      "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: ["wasm"]
      },
      "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wif"]
      },
      "application/webpush-options+json": {
        source: "iana",
        compressible: true
      },
      "application/whoispp-query": {
        source: "iana"
      },
      "application/whoispp-response": {
        source: "iana"
      },
      "application/widget": {
        source: "iana",
        extensions: ["wgt"]
      },
      "application/winhlp": {
        source: "apache",
        extensions: ["hlp"]
      },
      "application/wita": {
        source: "iana"
      },
      "application/wordperfect5.1": {
        source: "iana"
      },
      "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wsdl"]
      },
      "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wspolicy"]
      },
      "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["7z"]
      },
      "application/x-abiword": {
        source: "apache",
        extensions: ["abw"]
      },
      "application/x-ace-compressed": {
        source: "apache",
        extensions: ["ace"]
      },
      "application/x-amf": {
        source: "apache"
      },
      "application/x-apple-diskimage": {
        source: "apache",
        extensions: ["dmg"]
      },
      "application/x-arj": {
        compressible: false,
        extensions: ["arj"]
      },
      "application/x-authorware-bin": {
        source: "apache",
        extensions: ["aab", "x32", "u32", "vox"]
      },
      "application/x-authorware-map": {
        source: "apache",
        extensions: ["aam"]
      },
      "application/x-authorware-seg": {
        source: "apache",
        extensions: ["aas"]
      },
      "application/x-bcpio": {
        source: "apache",
        extensions: ["bcpio"]
      },
      "application/x-bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/x-bittorrent": {
        source: "apache",
        extensions: ["torrent"]
      },
      "application/x-blorb": {
        source: "apache",
        extensions: ["blb", "blorb"]
      },
      "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: ["bz"]
      },
      "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: ["bz2", "boz"]
      },
      "application/x-cbr": {
        source: "apache",
        extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
      },
      "application/x-cdlink": {
        source: "apache",
        extensions: ["vcd"]
      },
      "application/x-cfs-compressed": {
        source: "apache",
        extensions: ["cfs"]
      },
      "application/x-chat": {
        source: "apache",
        extensions: ["chat"]
      },
      "application/x-chess-pgn": {
        source: "apache",
        extensions: ["pgn"]
      },
      "application/x-chrome-extension": {
        extensions: ["crx"]
      },
      "application/x-cocoa": {
        source: "nginx",
        extensions: ["cco"]
      },
      "application/x-compress": {
        source: "apache"
      },
      "application/x-conference": {
        source: "apache",
        extensions: ["nsc"]
      },
      "application/x-cpio": {
        source: "apache",
        extensions: ["cpio"]
      },
      "application/x-csh": {
        source: "apache",
        extensions: ["csh"]
      },
      "application/x-deb": {
        compressible: false
      },
      "application/x-debian-package": {
        source: "apache",
        extensions: ["deb", "udeb"]
      },
      "application/x-dgc-compressed": {
        source: "apache",
        extensions: ["dgc"]
      },
      "application/x-director": {
        source: "apache",
        extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
      },
      "application/x-doom": {
        source: "apache",
        extensions: ["wad"]
      },
      "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ncx"]
      },
      "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dtb"]
      },
      "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: ["res"]
      },
      "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: ["dvi"]
      },
      "application/x-envoy": {
        source: "apache",
        extensions: ["evy"]
      },
      "application/x-eva": {
        source: "apache",
        extensions: ["eva"]
      },
      "application/x-font-bdf": {
        source: "apache",
        extensions: ["bdf"]
      },
      "application/x-font-dos": {
        source: "apache"
      },
      "application/x-font-framemaker": {
        source: "apache"
      },
      "application/x-font-ghostscript": {
        source: "apache",
        extensions: ["gsf"]
      },
      "application/x-font-libgrx": {
        source: "apache"
      },
      "application/x-font-linux-psf": {
        source: "apache",
        extensions: ["psf"]
      },
      "application/x-font-pcf": {
        source: "apache",
        extensions: ["pcf"]
      },
      "application/x-font-snf": {
        source: "apache",
        extensions: ["snf"]
      },
      "application/x-font-speedo": {
        source: "apache"
      },
      "application/x-font-sunos-news": {
        source: "apache"
      },
      "application/x-font-type1": {
        source: "apache",
        extensions: ["pfa", "pfb", "pfm", "afm"]
      },
      "application/x-font-vfont": {
        source: "apache"
      },
      "application/x-freearc": {
        source: "apache",
        extensions: ["arc"]
      },
      "application/x-futuresplash": {
        source: "apache",
        extensions: ["spl"]
      },
      "application/x-gca-compressed": {
        source: "apache",
        extensions: ["gca"]
      },
      "application/x-glulx": {
        source: "apache",
        extensions: ["ulx"]
      },
      "application/x-gnumeric": {
        source: "apache",
        extensions: ["gnumeric"]
      },
      "application/x-gramps-xml": {
        source: "apache",
        extensions: ["gramps"]
      },
      "application/x-gtar": {
        source: "apache",
        extensions: ["gtar"]
      },
      "application/x-gzip": {
        source: "apache"
      },
      "application/x-hdf": {
        source: "apache",
        extensions: ["hdf"]
      },
      "application/x-httpd-php": {
        compressible: true,
        extensions: ["php"]
      },
      "application/x-install-instructions": {
        source: "apache",
        extensions: ["install"]
      },
      "application/x-iso9660-image": {
        source: "apache",
        extensions: ["iso"]
      },
      "application/x-iwork-keynote-sffkey": {
        extensions: ["key"]
      },
      "application/x-iwork-numbers-sffnumbers": {
        extensions: ["numbers"]
      },
      "application/x-iwork-pages-sffpages": {
        extensions: ["pages"]
      },
      "application/x-java-archive-diff": {
        source: "nginx",
        extensions: ["jardiff"]
      },
      "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: ["jnlp"]
      },
      "application/x-javascript": {
        compressible: true
      },
      "application/x-keepass2": {
        extensions: ["kdbx"]
      },
      "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: ["latex"]
      },
      "application/x-lua-bytecode": {
        extensions: ["luac"]
      },
      "application/x-lzh-compressed": {
        source: "apache",
        extensions: ["lzh", "lha"]
      },
      "application/x-makeself": {
        source: "nginx",
        extensions: ["run"]
      },
      "application/x-mie": {
        source: "apache",
        extensions: ["mie"]
      },
      "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: ["prc", "mobi"]
      },
      "application/x-mpegurl": {
        compressible: false
      },
      "application/x-ms-application": {
        source: "apache",
        extensions: ["application"]
      },
      "application/x-ms-shortcut": {
        source: "apache",
        extensions: ["lnk"]
      },
      "application/x-ms-wmd": {
        source: "apache",
        extensions: ["wmd"]
      },
      "application/x-ms-wmz": {
        source: "apache",
        extensions: ["wmz"]
      },
      "application/x-ms-xbap": {
        source: "apache",
        extensions: ["xbap"]
      },
      "application/x-msaccess": {
        source: "apache",
        extensions: ["mdb"]
      },
      "application/x-msbinder": {
        source: "apache",
        extensions: ["obd"]
      },
      "application/x-mscardfile": {
        source: "apache",
        extensions: ["crd"]
      },
      "application/x-msclip": {
        source: "apache",
        extensions: ["clp"]
      },
      "application/x-msdos-program": {
        extensions: ["exe"]
      },
      "application/x-msdownload": {
        source: "apache",
        extensions: ["exe", "dll", "com", "bat", "msi"]
      },
      "application/x-msmediaview": {
        source: "apache",
        extensions: ["mvb", "m13", "m14"]
      },
      "application/x-msmetafile": {
        source: "apache",
        extensions: ["wmf", "wmz", "emf", "emz"]
      },
      "application/x-msmoney": {
        source: "apache",
        extensions: ["mny"]
      },
      "application/x-mspublisher": {
        source: "apache",
        extensions: ["pub"]
      },
      "application/x-msschedule": {
        source: "apache",
        extensions: ["scd"]
      },
      "application/x-msterminal": {
        source: "apache",
        extensions: ["trm"]
      },
      "application/x-mswrite": {
        source: "apache",
        extensions: ["wri"]
      },
      "application/x-netcdf": {
        source: "apache",
        extensions: ["nc", "cdf"]
      },
      "application/x-ns-proxy-autoconfig": {
        compressible: true,
        extensions: ["pac"]
      },
      "application/x-nzb": {
        source: "apache",
        extensions: ["nzb"]
      },
      "application/x-perl": {
        source: "nginx",
        extensions: ["pl", "pm"]
      },
      "application/x-pilot": {
        source: "nginx",
        extensions: ["prc", "pdb"]
      },
      "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: ["p12", "pfx"]
      },
      "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: ["p7b", "spc"]
      },
      "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: ["p7r"]
      },
      "application/x-pki-message": {
        source: "iana"
      },
      "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["rar"]
      },
      "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: ["rpm"]
      },
      "application/x-research-info-systems": {
        source: "apache",
        extensions: ["ris"]
      },
      "application/x-sea": {
        source: "nginx",
        extensions: ["sea"]
      },
      "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: ["sh"]
      },
      "application/x-shar": {
        source: "apache",
        extensions: ["shar"]
      },
      "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: ["swf"]
      },
      "application/x-silverlight-app": {
        source: "apache",
        extensions: ["xap"]
      },
      "application/x-sql": {
        source: "apache",
        extensions: ["sql"]
      },
      "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: ["sit"]
      },
      "application/x-stuffitx": {
        source: "apache",
        extensions: ["sitx"]
      },
      "application/x-subrip": {
        source: "apache",
        extensions: ["srt"]
      },
      "application/x-sv4cpio": {
        source: "apache",
        extensions: ["sv4cpio"]
      },
      "application/x-sv4crc": {
        source: "apache",
        extensions: ["sv4crc"]
      },
      "application/x-t3vm-image": {
        source: "apache",
        extensions: ["t3"]
      },
      "application/x-tads": {
        source: "apache",
        extensions: ["gam"]
      },
      "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: ["tar"]
      },
      "application/x-tcl": {
        source: "apache",
        extensions: ["tcl", "tk"]
      },
      "application/x-tex": {
        source: "apache",
        extensions: ["tex"]
      },
      "application/x-tex-tfm": {
        source: "apache",
        extensions: ["tfm"]
      },
      "application/x-texinfo": {
        source: "apache",
        extensions: ["texinfo", "texi"]
      },
      "application/x-tgif": {
        source: "apache",
        extensions: ["obj"]
      },
      "application/x-ustar": {
        source: "apache",
        extensions: ["ustar"]
      },
      "application/x-virtualbox-hdd": {
        compressible: true,
        extensions: ["hdd"]
      },
      "application/x-virtualbox-ova": {
        compressible: true,
        extensions: ["ova"]
      },
      "application/x-virtualbox-ovf": {
        compressible: true,
        extensions: ["ovf"]
      },
      "application/x-virtualbox-vbox": {
        compressible: true,
        extensions: ["vbox"]
      },
      "application/x-virtualbox-vbox-extpack": {
        compressible: false,
        extensions: ["vbox-extpack"]
      },
      "application/x-virtualbox-vdi": {
        compressible: true,
        extensions: ["vdi"]
      },
      "application/x-virtualbox-vhd": {
        compressible: true,
        extensions: ["vhd"]
      },
      "application/x-virtualbox-vmdk": {
        compressible: true,
        extensions: ["vmdk"]
      },
      "application/x-wais-source": {
        source: "apache",
        extensions: ["src"]
      },
      "application/x-web-app-manifest+json": {
        compressible: true,
        extensions: ["webapp"]
      },
      "application/x-www-form-urlencoded": {
        source: "iana",
        compressible: true
      },
      "application/x-x509-ca-cert": {
        source: "iana",
        extensions: ["der", "crt", "pem"]
      },
      "application/x-x509-ca-ra-cert": {
        source: "iana"
      },
      "application/x-x509-next-ca-cert": {
        source: "iana"
      },
      "application/x-xfig": {
        source: "apache",
        extensions: ["fig"]
      },
      "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: ["xpi"]
      },
      "application/x-xz": {
        source: "apache",
        extensions: ["xz"]
      },
      "application/x-zmachine": {
        source: "apache",
        extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
      },
      "application/x400-bp": {
        source: "iana"
      },
      "application/xacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xaml"]
      },
      "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xav"]
      },
      "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xca"]
      },
      "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdf"]
      },
      "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xel"]
      },
      "application/xcap-error+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xns"]
      },
      "application/xcon-conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcon-conference-info-diff+xml": {
        source: "iana",
        compressible: true
      },
      "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xenc"]
      },
      "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtml", "xht"]
      },
      "application/xhtml-voice+xml": {
        source: "apache",
        compressible: true
      },
      "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml", "xsl", "xsd", "rng"]
      },
      "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: ["dtd"]
      },
      "application/xml-external-parsed-entity": {
        source: "iana"
      },
      "application/xml-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/xmpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xop"]
      },
      "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xpl"]
      },
      "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsl", "xslt"]
      },
      "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xspf"]
      },
      "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mxml", "xhvml", "xvml", "xvm"]
      },
      "application/yang": {
        source: "iana",
        extensions: ["yang"]
      },
      "application/yang-data+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-data+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: ["yin"]
      },
      "application/zip": {
        source: "iana",
        compressible: false,
        extensions: ["zip"]
      },
      "application/zlib": {
        source: "iana"
      },
      "application/zstd": {
        source: "iana"
      },
      "audio/1d-interleaved-parityfec": {
        source: "iana"
      },
      "audio/32kadpcm": {
        source: "iana"
      },
      "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: ["3gpp"]
      },
      "audio/3gpp2": {
        source: "iana"
      },
      "audio/aac": {
        source: "iana"
      },
      "audio/ac3": {
        source: "iana"
      },
      "audio/adpcm": {
        source: "apache",
        extensions: ["adp"]
      },
      "audio/amr": {
        source: "iana",
        extensions: ["amr"]
      },
      "audio/amr-wb": {
        source: "iana"
      },
      "audio/amr-wb+": {
        source: "iana"
      },
      "audio/aptx": {
        source: "iana"
      },
      "audio/asc": {
        source: "iana"
      },
      "audio/atrac-advanced-lossless": {
        source: "iana"
      },
      "audio/atrac-x": {
        source: "iana"
      },
      "audio/atrac3": {
        source: "iana"
      },
      "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: ["au", "snd"]
      },
      "audio/bv16": {
        source: "iana"
      },
      "audio/bv32": {
        source: "iana"
      },
      "audio/clearmode": {
        source: "iana"
      },
      "audio/cn": {
        source: "iana"
      },
      "audio/dat12": {
        source: "iana"
      },
      "audio/dls": {
        source: "iana"
      },
      "audio/dsr-es201108": {
        source: "iana"
      },
      "audio/dsr-es202050": {
        source: "iana"
      },
      "audio/dsr-es202211": {
        source: "iana"
      },
      "audio/dsr-es202212": {
        source: "iana"
      },
      "audio/dv": {
        source: "iana"
      },
      "audio/dvi4": {
        source: "iana"
      },
      "audio/eac3": {
        source: "iana"
      },
      "audio/encaprtp": {
        source: "iana"
      },
      "audio/evrc": {
        source: "iana"
      },
      "audio/evrc-qcp": {
        source: "iana"
      },
      "audio/evrc0": {
        source: "iana"
      },
      "audio/evrc1": {
        source: "iana"
      },
      "audio/evrcb": {
        source: "iana"
      },
      "audio/evrcb0": {
        source: "iana"
      },
      "audio/evrcb1": {
        source: "iana"
      },
      "audio/evrcnw": {
        source: "iana"
      },
      "audio/evrcnw0": {
        source: "iana"
      },
      "audio/evrcnw1": {
        source: "iana"
      },
      "audio/evrcwb": {
        source: "iana"
      },
      "audio/evrcwb0": {
        source: "iana"
      },
      "audio/evrcwb1": {
        source: "iana"
      },
      "audio/evs": {
        source: "iana"
      },
      "audio/flexfec": {
        source: "iana"
      },
      "audio/fwdred": {
        source: "iana"
      },
      "audio/g711-0": {
        source: "iana"
      },
      "audio/g719": {
        source: "iana"
      },
      "audio/g722": {
        source: "iana"
      },
      "audio/g7221": {
        source: "iana"
      },
      "audio/g723": {
        source: "iana"
      },
      "audio/g726-16": {
        source: "iana"
      },
      "audio/g726-24": {
        source: "iana"
      },
      "audio/g726-32": {
        source: "iana"
      },
      "audio/g726-40": {
        source: "iana"
      },
      "audio/g728": {
        source: "iana"
      },
      "audio/g729": {
        source: "iana"
      },
      "audio/g7291": {
        source: "iana"
      },
      "audio/g729d": {
        source: "iana"
      },
      "audio/g729e": {
        source: "iana"
      },
      "audio/gsm": {
        source: "iana"
      },
      "audio/gsm-efr": {
        source: "iana"
      },
      "audio/gsm-hr-08": {
        source: "iana"
      },
      "audio/ilbc": {
        source: "iana"
      },
      "audio/ip-mr_v2.5": {
        source: "iana"
      },
      "audio/isac": {
        source: "apache"
      },
      "audio/l16": {
        source: "iana"
      },
      "audio/l20": {
        source: "iana"
      },
      "audio/l24": {
        source: "iana",
        compressible: false
      },
      "audio/l8": {
        source: "iana"
      },
      "audio/lpc": {
        source: "iana"
      },
      "audio/melp": {
        source: "iana"
      },
      "audio/melp1200": {
        source: "iana"
      },
      "audio/melp2400": {
        source: "iana"
      },
      "audio/melp600": {
        source: "iana"
      },
      "audio/mhas": {
        source: "iana"
      },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"]
      },
      "audio/mobile-xmf": {
        source: "iana",
        extensions: ["mxmf"]
      },
      "audio/mp3": {
        compressible: false,
        extensions: ["mp3"]
      },
      "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["m4a", "mp4a"]
      },
      "audio/mp4a-latm": {
        source: "iana"
      },
      "audio/mpa": {
        source: "iana"
      },
      "audio/mpa-robust": {
        source: "iana"
      },
      "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
      },
      "audio/mpeg4-generic": {
        source: "iana"
      },
      "audio/musepack": {
        source: "apache"
      },
      "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["oga", "ogg", "spx", "opus"]
      },
      "audio/opus": {
        source: "iana"
      },
      "audio/parityfec": {
        source: "iana"
      },
      "audio/pcma": {
        source: "iana"
      },
      "audio/pcma-wb": {
        source: "iana"
      },
      "audio/pcmu": {
        source: "iana"
      },
      "audio/pcmu-wb": {
        source: "iana"
      },
      "audio/prs.sid": {
        source: "iana"
      },
      "audio/qcelp": {
        source: "iana"
      },
      "audio/raptorfec": {
        source: "iana"
      },
      "audio/red": {
        source: "iana"
      },
      "audio/rtp-enc-aescm128": {
        source: "iana"
      },
      "audio/rtp-midi": {
        source: "iana"
      },
      "audio/rtploopback": {
        source: "iana"
      },
      "audio/rtx": {
        source: "iana"
      },
      "audio/s3m": {
        source: "apache",
        extensions: ["s3m"]
      },
      "audio/scip": {
        source: "iana"
      },
      "audio/silk": {
        source: "apache",
        extensions: ["sil"]
      },
      "audio/smv": {
        source: "iana"
      },
      "audio/smv-qcp": {
        source: "iana"
      },
      "audio/smv0": {
        source: "iana"
      },
      "audio/sofa": {
        source: "iana"
      },
      "audio/sp-midi": {
        source: "iana"
      },
      "audio/speex": {
        source: "iana"
      },
      "audio/t140c": {
        source: "iana"
      },
      "audio/t38": {
        source: "iana"
      },
      "audio/telephone-event": {
        source: "iana"
      },
      "audio/tetra_acelp": {
        source: "iana"
      },
      "audio/tetra_acelp_bb": {
        source: "iana"
      },
      "audio/tone": {
        source: "iana"
      },
      "audio/tsvcis": {
        source: "iana"
      },
      "audio/uemclip": {
        source: "iana"
      },
      "audio/ulpfec": {
        source: "iana"
      },
      "audio/usac": {
        source: "iana"
      },
      "audio/vdvi": {
        source: "iana"
      },
      "audio/vmr-wb": {
        source: "iana"
      },
      "audio/vnd.3gpp.iufp": {
        source: "iana"
      },
      "audio/vnd.4sb": {
        source: "iana"
      },
      "audio/vnd.audiokoz": {
        source: "iana"
      },
      "audio/vnd.celp": {
        source: "iana"
      },
      "audio/vnd.cisco.nse": {
        source: "iana"
      },
      "audio/vnd.cmles.radio-events": {
        source: "iana"
      },
      "audio/vnd.cns.anp1": {
        source: "iana"
      },
      "audio/vnd.cns.inf1": {
        source: "iana"
      },
      "audio/vnd.dece.audio": {
        source: "iana",
        extensions: ["uva", "uvva"]
      },
      "audio/vnd.digital-winds": {
        source: "iana",
        extensions: ["eol"]
      },
      "audio/vnd.dlna.adts": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.1": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.2": {
        source: "iana"
      },
      "audio/vnd.dolby.mlp": {
        source: "iana"
      },
      "audio/vnd.dolby.mps": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2x": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2z": {
        source: "iana"
      },
      "audio/vnd.dolby.pulse.1": {
        source: "iana"
      },
      "audio/vnd.dra": {
        source: "iana",
        extensions: ["dra"]
      },
      "audio/vnd.dts": {
        source: "iana",
        extensions: ["dts"]
      },
      "audio/vnd.dts.hd": {
        source: "iana",
        extensions: ["dtshd"]
      },
      "audio/vnd.dts.uhd": {
        source: "iana"
      },
      "audio/vnd.dvb.file": {
        source: "iana"
      },
      "audio/vnd.everad.plj": {
        source: "iana"
      },
      "audio/vnd.hns.audio": {
        source: "iana"
      },
      "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: ["lvp"]
      },
      "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: ["pya"]
      },
      "audio/vnd.nokia.mobile-xmf": {
        source: "iana"
      },
      "audio/vnd.nortel.vbk": {
        source: "iana"
      },
      "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: ["ecelp4800"]
      },
      "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: ["ecelp7470"]
      },
      "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: ["ecelp9600"]
      },
      "audio/vnd.octel.sbc": {
        source: "iana"
      },
      "audio/vnd.presonus.multitrack": {
        source: "iana"
      },
      "audio/vnd.qcelp": {
        source: "iana"
      },
      "audio/vnd.rhetorex.32kadpcm": {
        source: "iana"
      },
      "audio/vnd.rip": {
        source: "iana",
        extensions: ["rip"]
      },
      "audio/vnd.rn-realaudio": {
        compressible: false
      },
      "audio/vnd.sealedmedia.softseal.mpeg": {
        source: "iana"
      },
      "audio/vnd.vmx.cvsd": {
        source: "iana"
      },
      "audio/vnd.wave": {
        compressible: false
      },
      "audio/vorbis": {
        source: "iana",
        compressible: false
      },
      "audio/vorbis-config": {
        source: "iana"
      },
      "audio/wav": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/wave": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: ["weba"]
      },
      "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: ["aac"]
      },
      "audio/x-aiff": {
        source: "apache",
        extensions: ["aif", "aiff", "aifc"]
      },
      "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: ["caf"]
      },
      "audio/x-flac": {
        source: "apache",
        extensions: ["flac"]
      },
      "audio/x-m4a": {
        source: "nginx",
        extensions: ["m4a"]
      },
      "audio/x-matroska": {
        source: "apache",
        extensions: ["mka"]
      },
      "audio/x-mpegurl": {
        source: "apache",
        extensions: ["m3u"]
      },
      "audio/x-ms-wax": {
        source: "apache",
        extensions: ["wax"]
      },
      "audio/x-ms-wma": {
        source: "apache",
        extensions: ["wma"]
      },
      "audio/x-pn-realaudio": {
        source: "apache",
        extensions: ["ram", "ra"]
      },
      "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: ["rmp"]
      },
      "audio/x-realaudio": {
        source: "nginx",
        extensions: ["ra"]
      },
      "audio/x-tta": {
        source: "apache"
      },
      "audio/x-wav": {
        source: "apache",
        extensions: ["wav"]
      },
      "audio/xm": {
        source: "apache",
        extensions: ["xm"]
      },
      "chemical/x-cdx": {
        source: "apache",
        extensions: ["cdx"]
      },
      "chemical/x-cif": {
        source: "apache",
        extensions: ["cif"]
      },
      "chemical/x-cmdf": {
        source: "apache",
        extensions: ["cmdf"]
      },
      "chemical/x-cml": {
        source: "apache",
        extensions: ["cml"]
      },
      "chemical/x-csml": {
        source: "apache",
        extensions: ["csml"]
      },
      "chemical/x-pdb": {
        source: "apache"
      },
      "chemical/x-xyz": {
        source: "apache",
        extensions: ["xyz"]
      },
      "font/collection": {
        source: "iana",
        extensions: ["ttc"]
      },
      "font/otf": {
        source: "iana",
        compressible: true,
        extensions: ["otf"]
      },
      "font/sfnt": {
        source: "iana"
      },
      "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: ["ttf"]
      },
      "font/woff": {
        source: "iana",
        extensions: ["woff"]
      },
      "font/woff2": {
        source: "iana",
        extensions: ["woff2"]
      },
      "image/aces": {
        source: "iana",
        extensions: ["exr"]
      },
      "image/apng": {
        compressible: false,
        extensions: ["apng"]
      },
      "image/avci": {
        source: "iana",
        extensions: ["avci"]
      },
      "image/avcs": {
        source: "iana",
        extensions: ["avcs"]
      },
      "image/avif": {
        source: "iana",
        compressible: false,
        extensions: ["avif"]
      },
      "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/cgm": {
        source: "iana",
        extensions: ["cgm"]
      },
      "image/dicom-rle": {
        source: "iana",
        extensions: ["drle"]
      },
      "image/emf": {
        source: "iana",
        extensions: ["emf"]
      },
      "image/fits": {
        source: "iana",
        extensions: ["fits"]
      },
      "image/g3fax": {
        source: "iana",
        extensions: ["g3"]
      },
      "image/gif": {
        source: "iana",
        compressible: false,
        extensions: ["gif"]
      },
      "image/heic": {
        source: "iana",
        extensions: ["heic"]
      },
      "image/heic-sequence": {
        source: "iana",
        extensions: ["heics"]
      },
      "image/heif": {
        source: "iana",
        extensions: ["heif"]
      },
      "image/heif-sequence": {
        source: "iana",
        extensions: ["heifs"]
      },
      "image/hej2k": {
        source: "iana",
        extensions: ["hej2"]
      },
      "image/hsj2": {
        source: "iana",
        extensions: ["hsj2"]
      },
      "image/ief": {
        source: "iana",
        extensions: ["ief"]
      },
      "image/jls": {
        source: "iana",
        extensions: ["jls"]
      },
      "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: ["jp2", "jpg2"]
      },
      "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: ["jpeg", "jpg", "jpe"]
      },
      "image/jph": {
        source: "iana",
        extensions: ["jph"]
      },
      "image/jphc": {
        source: "iana",
        extensions: ["jhc"]
      },
      "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: ["jpm"]
      },
      "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: ["jpx", "jpf"]
      },
      "image/jxr": {
        source: "iana",
        extensions: ["jxr"]
      },
      "image/jxra": {
        source: "iana",
        extensions: ["jxra"]
      },
      "image/jxrs": {
        source: "iana",
        extensions: ["jxrs"]
      },
      "image/jxs": {
        source: "iana",
        extensions: ["jxs"]
      },
      "image/jxsc": {
        source: "iana",
        extensions: ["jxsc"]
      },
      "image/jxsi": {
        source: "iana",
        extensions: ["jxsi"]
      },
      "image/jxss": {
        source: "iana",
        extensions: ["jxss"]
      },
      "image/ktx": {
        source: "iana",
        extensions: ["ktx"]
      },
      "image/ktx2": {
        source: "iana",
        extensions: ["ktx2"]
      },
      "image/naplps": {
        source: "iana"
      },
      "image/pjpeg": {
        compressible: false
      },
      "image/png": {
        source: "iana",
        compressible: false,
        extensions: ["png"]
      },
      "image/prs.btif": {
        source: "iana",
        extensions: ["btif"]
      },
      "image/prs.pti": {
        source: "iana",
        extensions: ["pti"]
      },
      "image/pwg-raster": {
        source: "iana"
      },
      "image/sgi": {
        source: "apache",
        extensions: ["sgi"]
      },
      "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["svg", "svgz"]
      },
      "image/t38": {
        source: "iana",
        extensions: ["t38"]
      },
      "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: ["tif", "tiff"]
      },
      "image/tiff-fx": {
        source: "iana",
        extensions: ["tfx"]
      },
      "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: ["psd"]
      },
      "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: ["azv"]
      },
      "image/vnd.cns.inf2": {
        source: "iana"
      },
      "image/vnd.dece.graphic": {
        source: "iana",
        extensions: ["uvi", "uvvi", "uvg", "uvvg"]
      },
      "image/vnd.djvu": {
        source: "iana",
        extensions: ["djvu", "djv"]
      },
      "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "image/vnd.dwg": {
        source: "iana",
        extensions: ["dwg"]
      },
      "image/vnd.dxf": {
        source: "iana",
        extensions: ["dxf"]
      },
      "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: ["fbs"]
      },
      "image/vnd.fpx": {
        source: "iana",
        extensions: ["fpx"]
      },
      "image/vnd.fst": {
        source: "iana",
        extensions: ["fst"]
      },
      "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: ["mmr"]
      },
      "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: ["rlc"]
      },
      "image/vnd.globalgraphics.pgb": {
        source: "iana"
      },
      "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: ["ico"]
      },
      "image/vnd.mix": {
        source: "iana"
      },
      "image/vnd.mozilla.apng": {
        source: "iana"
      },
      "image/vnd.ms-dds": {
        compressible: true,
        extensions: ["dds"]
      },
      "image/vnd.ms-modi": {
        source: "iana",
        extensions: ["mdi"]
      },
      "image/vnd.ms-photo": {
        source: "apache",
        extensions: ["wdp"]
      },
      "image/vnd.net-fpx": {
        source: "iana",
        extensions: ["npx"]
      },
      "image/vnd.pco.b16": {
        source: "iana",
        extensions: ["b16"]
      },
      "image/vnd.radiance": {
        source: "iana"
      },
      "image/vnd.sealed.png": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.gif": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.jpg": {
        source: "iana"
      },
      "image/vnd.svf": {
        source: "iana"
      },
      "image/vnd.tencent.tap": {
        source: "iana",
        extensions: ["tap"]
      },
      "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: ["vtf"]
      },
      "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: ["wbmp"]
      },
      "image/vnd.xiff": {
        source: "iana",
        extensions: ["xif"]
      },
      "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: ["pcx"]
      },
      "image/webp": {
        source: "apache",
        extensions: ["webp"]
      },
      "image/wmf": {
        source: "iana",
        extensions: ["wmf"]
      },
      "image/x-3ds": {
        source: "apache",
        extensions: ["3ds"]
      },
      "image/x-cmu-raster": {
        source: "apache",
        extensions: ["ras"]
      },
      "image/x-cmx": {
        source: "apache",
        extensions: ["cmx"]
      },
      "image/x-freehand": {
        source: "apache",
        extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
      },
      "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: ["ico"]
      },
      "image/x-jng": {
        source: "nginx",
        extensions: ["jng"]
      },
      "image/x-mrsid-image": {
        source: "apache",
        extensions: ["sid"]
      },
      "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/x-pcx": {
        source: "apache",
        extensions: ["pcx"]
      },
      "image/x-pict": {
        source: "apache",
        extensions: ["pic", "pct"]
      },
      "image/x-portable-anymap": {
        source: "apache",
        extensions: ["pnm"]
      },
      "image/x-portable-bitmap": {
        source: "apache",
        extensions: ["pbm"]
      },
      "image/x-portable-graymap": {
        source: "apache",
        extensions: ["pgm"]
      },
      "image/x-portable-pixmap": {
        source: "apache",
        extensions: ["ppm"]
      },
      "image/x-rgb": {
        source: "apache",
        extensions: ["rgb"]
      },
      "image/x-tga": {
        source: "apache",
        extensions: ["tga"]
      },
      "image/x-xbitmap": {
        source: "apache",
        extensions: ["xbm"]
      },
      "image/x-xcf": {
        compressible: false
      },
      "image/x-xpixmap": {
        source: "apache",
        extensions: ["xpm"]
      },
      "image/x-xwindowdump": {
        source: "apache",
        extensions: ["xwd"]
      },
      "message/cpim": {
        source: "iana"
      },
      "message/delivery-status": {
        source: "iana"
      },
      "message/disposition-notification": {
        source: "iana",
        extensions: [
          "disposition-notification"
        ]
      },
      "message/external-body": {
        source: "iana"
      },
      "message/feedback-report": {
        source: "iana"
      },
      "message/global": {
        source: "iana",
        extensions: ["u8msg"]
      },
      "message/global-delivery-status": {
        source: "iana",
        extensions: ["u8dsn"]
      },
      "message/global-disposition-notification": {
        source: "iana",
        extensions: ["u8mdn"]
      },
      "message/global-headers": {
        source: "iana",
        extensions: ["u8hdr"]
      },
      "message/http": {
        source: "iana",
        compressible: false
      },
      "message/imdn+xml": {
        source: "iana",
        compressible: true
      },
      "message/news": {
        source: "iana"
      },
      "message/partial": {
        source: "iana",
        compressible: false
      },
      "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: ["eml", "mime"]
      },
      "message/s-http": {
        source: "iana"
      },
      "message/sip": {
        source: "iana"
      },
      "message/sipfrag": {
        source: "iana"
      },
      "message/tracking-status": {
        source: "iana"
      },
      "message/vnd.si.simp": {
        source: "iana"
      },
      "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: ["wsc"]
      },
      "model/3mf": {
        source: "iana",
        extensions: ["3mf"]
      },
      "model/e57": {
        source: "iana"
      },
      "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: ["gltf"]
      },
      "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: ["glb"]
      },
      "model/iges": {
        source: "iana",
        compressible: false,
        extensions: ["igs", "iges"]
      },
      "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: ["msh", "mesh", "silo"]
      },
      "model/mtl": {
        source: "iana",
        extensions: ["mtl"]
      },
      "model/obj": {
        source: "iana",
        extensions: ["obj"]
      },
      "model/step": {
        source: "iana"
      },
      "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: ["stpx"]
      },
      "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpz"]
      },
      "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpxz"]
      },
      "model/stl": {
        source: "iana",
        extensions: ["stl"]
      },
      "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dae"]
      },
      "model/vnd.dwf": {
        source: "iana",
        extensions: ["dwf"]
      },
      "model/vnd.flatland.3dml": {
        source: "iana"
      },
      "model/vnd.gdl": {
        source: "iana",
        extensions: ["gdl"]
      },
      "model/vnd.gs-gdl": {
        source: "apache"
      },
      "model/vnd.gs.gdl": {
        source: "iana"
      },
      "model/vnd.gtw": {
        source: "iana",
        extensions: ["gtw"]
      },
      "model/vnd.moml+xml": {
        source: "iana",
        compressible: true
      },
      "model/vnd.mts": {
        source: "iana",
        extensions: ["mts"]
      },
      "model/vnd.opengex": {
        source: "iana",
        extensions: ["ogex"]
      },
      "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: ["x_b"]
      },
      "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: ["x_t"]
      },
      "model/vnd.pytha.pyox": {
        source: "iana"
      },
      "model/vnd.rosette.annotated-data-model": {
        source: "iana"
      },
      "model/vnd.sap.vds": {
        source: "iana",
        extensions: ["vds"]
      },
      "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: ["usdz"]
      },
      "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: ["bsp"]
      },
      "model/vnd.vtu": {
        source: "iana",
        extensions: ["vtu"]
      },
      "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: ["wrl", "vrml"]
      },
      "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: ["x3db", "x3dbz"]
      },
      "model/x3d+fastinfoset": {
        source: "iana",
        extensions: ["x3db"]
      },
      "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: ["x3dv", "x3dvz"]
      },
      "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: ["x3d", "x3dz"]
      },
      "model/x3d-vrml": {
        source: "iana",
        extensions: ["x3dv"]
      },
      "multipart/alternative": {
        source: "iana",
        compressible: false
      },
      "multipart/appledouble": {
        source: "iana"
      },
      "multipart/byteranges": {
        source: "iana"
      },
      "multipart/digest": {
        source: "iana"
      },
      "multipart/encrypted": {
        source: "iana",
        compressible: false
      },
      "multipart/form-data": {
        source: "iana",
        compressible: false
      },
      "multipart/header-set": {
        source: "iana"
      },
      "multipart/mixed": {
        source: "iana"
      },
      "multipart/multilingual": {
        source: "iana"
      },
      "multipart/parallel": {
        source: "iana"
      },
      "multipart/related": {
        source: "iana",
        compressible: false
      },
      "multipart/report": {
        source: "iana"
      },
      "multipart/signed": {
        source: "iana",
        compressible: false
      },
      "multipart/vnd.bint.med-plus": {
        source: "iana"
      },
      "multipart/voice-message": {
        source: "iana"
      },
      "multipart/x-mixed-replace": {
        source: "iana"
      },
      "text/1d-interleaved-parityfec": {
        source: "iana"
      },
      "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: ["appcache", "manifest"]
      },
      "text/calendar": {
        source: "iana",
        extensions: ["ics", "ifb"]
      },
      "text/calender": {
        compressible: true
      },
      "text/cmd": {
        compressible: true
      },
      "text/coffeescript": {
        extensions: ["coffee", "litcoffee"]
      },
      "text/cql": {
        source: "iana"
      },
      "text/cql-expression": {
        source: "iana"
      },
      "text/cql-identifier": {
        source: "iana"
      },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["css"]
      },
      "text/csv": {
        source: "iana",
        compressible: true,
        extensions: ["csv"]
      },
      "text/csv-schema": {
        source: "iana"
      },
      "text/directory": {
        source: "iana"
      },
      "text/dns": {
        source: "iana"
      },
      "text/ecmascript": {
        source: "iana"
      },
      "text/encaprtp": {
        source: "iana"
      },
      "text/enriched": {
        source: "iana"
      },
      "text/fhirpath": {
        source: "iana"
      },
      "text/flexfec": {
        source: "iana"
      },
      "text/fwdred": {
        source: "iana"
      },
      "text/gff3": {
        source: "iana"
      },
      "text/grammar-ref-list": {
        source: "iana"
      },
      "text/html": {
        source: "iana",
        compressible: true,
        extensions: ["html", "htm", "shtml"]
      },
      "text/jade": {
        extensions: ["jade"]
      },
      "text/javascript": {
        source: "iana",
        compressible: true
      },
      "text/jcr-cnd": {
        source: "iana"
      },
      "text/jsx": {
        compressible: true,
        extensions: ["jsx"]
      },
      "text/less": {
        compressible: true,
        extensions: ["less"]
      },
      "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: ["markdown", "md"]
      },
      "text/mathml": {
        source: "nginx",
        extensions: ["mml"]
      },
      "text/mdx": {
        compressible: true,
        extensions: ["mdx"]
      },
      "text/mizar": {
        source: "iana"
      },
      "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["n3"]
      },
      "text/parameters": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/parityfec": {
        source: "iana"
      },
      "text/plain": {
        source: "iana",
        compressible: true,
        extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
      },
      "text/provenance-notation": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/prs.fallenstein.rst": {
        source: "iana"
      },
      "text/prs.lines.tag": {
        source: "iana",
        extensions: ["dsc"]
      },
      "text/prs.prop.logic": {
        source: "iana"
      },
      "text/raptorfec": {
        source: "iana"
      },
      "text/red": {
        source: "iana"
      },
      "text/rfc822-headers": {
        source: "iana"
      },
      "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: ["rtx"]
      },
      "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "text/rtp-enc-aescm128": {
        source: "iana"
      },
      "text/rtploopback": {
        source: "iana"
      },
      "text/rtx": {
        source: "iana"
      },
      "text/sgml": {
        source: "iana",
        extensions: ["sgml", "sgm"]
      },
      "text/shaclc": {
        source: "iana"
      },
      "text/shex": {
        source: "iana",
        extensions: ["shex"]
      },
      "text/slim": {
        extensions: ["slim", "slm"]
      },
      "text/spdx": {
        source: "iana",
        extensions: ["spdx"]
      },
      "text/strings": {
        source: "iana"
      },
      "text/stylus": {
        extensions: ["stylus", "styl"]
      },
      "text/t140": {
        source: "iana"
      },
      "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: ["tsv"]
      },
      "text/troff": {
        source: "iana",
        extensions: ["t", "tr", "roff", "man", "me", "ms"]
      },
      "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["ttl"]
      },
      "text/ulpfec": {
        source: "iana"
      },
      "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: ["uri", "uris", "urls"]
      },
      "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: ["vcard"]
      },
      "text/vnd.a": {
        source: "iana"
      },
      "text/vnd.abc": {
        source: "iana"
      },
      "text/vnd.ascii-art": {
        source: "iana"
      },
      "text/vnd.curl": {
        source: "iana",
        extensions: ["curl"]
      },
      "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: ["dcurl"]
      },
      "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: ["mcurl"]
      },
      "text/vnd.curl.scurl": {
        source: "apache",
        extensions: ["scurl"]
      },
      "text/vnd.debian.copyright": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.dmclientscript": {
        source: "iana"
      },
      "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "text/vnd.esmertec.theme-descriptor": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: ["ged"]
      },
      "text/vnd.ficlab.flt": {
        source: "iana"
      },
      "text/vnd.fly": {
        source: "iana",
        extensions: ["fly"]
      },
      "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: ["flx"]
      },
      "text/vnd.gml": {
        source: "iana"
      },
      "text/vnd.graphviz": {
        source: "iana",
        extensions: ["gv"]
      },
      "text/vnd.hans": {
        source: "iana"
      },
      "text/vnd.hgl": {
        source: "iana"
      },
      "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: ["3dml"]
      },
      "text/vnd.in3d.spot": {
        source: "iana",
        extensions: ["spot"]
      },
      "text/vnd.iptc.newsml": {
        source: "iana"
      },
      "text/vnd.iptc.nitf": {
        source: "iana"
      },
      "text/vnd.latex-z": {
        source: "iana"
      },
      "text/vnd.motorola.reflex": {
        source: "iana"
      },
      "text/vnd.ms-mediapackage": {
        source: "iana"
      },
      "text/vnd.net2phone.commcenter.command": {
        source: "iana"
      },
      "text/vnd.radisys.msml-basic-layout": {
        source: "iana"
      },
      "text/vnd.senx.warpscript": {
        source: "iana"
      },
      "text/vnd.si.uricatalogue": {
        source: "iana"
      },
      "text/vnd.sosi": {
        source: "iana"
      },
      "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["jad"]
      },
      "text/vnd.trolltech.linguist": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.wap.si": {
        source: "iana"
      },
      "text/vnd.wap.sl": {
        source: "iana"
      },
      "text/vnd.wap.wml": {
        source: "iana",
        extensions: ["wml"]
      },
      "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: ["wmls"]
      },
      "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["vtt"]
      },
      "text/x-asm": {
        source: "apache",
        extensions: ["s", "asm"]
      },
      "text/x-c": {
        source: "apache",
        extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
      },
      "text/x-component": {
        source: "nginx",
        extensions: ["htc"]
      },
      "text/x-fortran": {
        source: "apache",
        extensions: ["f", "for", "f77", "f90"]
      },
      "text/x-gwt-rpc": {
        compressible: true
      },
      "text/x-handlebars-template": {
        extensions: ["hbs"]
      },
      "text/x-java-source": {
        source: "apache",
        extensions: ["java"]
      },
      "text/x-jquery-tmpl": {
        compressible: true
      },
      "text/x-lua": {
        extensions: ["lua"]
      },
      "text/x-markdown": {
        compressible: true,
        extensions: ["mkd"]
      },
      "text/x-nfo": {
        source: "apache",
        extensions: ["nfo"]
      },
      "text/x-opml": {
        source: "apache",
        extensions: ["opml"]
      },
      "text/x-org": {
        compressible: true,
        extensions: ["org"]
      },
      "text/x-pascal": {
        source: "apache",
        extensions: ["p", "pas"]
      },
      "text/x-processing": {
        compressible: true,
        extensions: ["pde"]
      },
      "text/x-sass": {
        extensions: ["sass"]
      },
      "text/x-scss": {
        extensions: ["scss"]
      },
      "text/x-setext": {
        source: "apache",
        extensions: ["etx"]
      },
      "text/x-sfv": {
        source: "apache",
        extensions: ["sfv"]
      },
      "text/x-suse-ymp": {
        compressible: true,
        extensions: ["ymp"]
      },
      "text/x-uuencode": {
        source: "apache",
        extensions: ["uu"]
      },
      "text/x-vcalendar": {
        source: "apache",
        extensions: ["vcs"]
      },
      "text/x-vcard": {
        source: "apache",
        extensions: ["vcf"]
      },
      "text/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml"]
      },
      "text/xml-external-parsed-entity": {
        source: "iana"
      },
      "text/yaml": {
        compressible: true,
        extensions: ["yaml", "yml"]
      },
      "video/1d-interleaved-parityfec": {
        source: "iana"
      },
      "video/3gpp": {
        source: "iana",
        extensions: ["3gp", "3gpp"]
      },
      "video/3gpp-tt": {
        source: "iana"
      },
      "video/3gpp2": {
        source: "iana",
        extensions: ["3g2"]
      },
      "video/av1": {
        source: "iana"
      },
      "video/bmpeg": {
        source: "iana"
      },
      "video/bt656": {
        source: "iana"
      },
      "video/celb": {
        source: "iana"
      },
      "video/dv": {
        source: "iana"
      },
      "video/encaprtp": {
        source: "iana"
      },
      "video/ffv1": {
        source: "iana"
      },
      "video/flexfec": {
        source: "iana"
      },
      "video/h261": {
        source: "iana",
        extensions: ["h261"]
      },
      "video/h263": {
        source: "iana",
        extensions: ["h263"]
      },
      "video/h263-1998": {
        source: "iana"
      },
      "video/h263-2000": {
        source: "iana"
      },
      "video/h264": {
        source: "iana",
        extensions: ["h264"]
      },
      "video/h264-rcdo": {
        source: "iana"
      },
      "video/h264-svc": {
        source: "iana"
      },
      "video/h265": {
        source: "iana"
      },
      "video/iso.segment": {
        source: "iana",
        extensions: ["m4s"]
      },
      "video/jpeg": {
        source: "iana",
        extensions: ["jpgv"]
      },
      "video/jpeg2000": {
        source: "iana"
      },
      "video/jpm": {
        source: "apache",
        extensions: ["jpm", "jpgm"]
      },
      "video/jxsv": {
        source: "iana"
      },
      "video/mj2": {
        source: "iana",
        extensions: ["mj2", "mjp2"]
      },
      "video/mp1s": {
        source: "iana"
      },
      "video/mp2p": {
        source: "iana"
      },
      "video/mp2t": {
        source: "iana",
        extensions: ["ts"]
      },
      "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["mp4", "mp4v", "mpg4"]
      },
      "video/mp4v-es": {
        source: "iana"
      },
      "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
      },
      "video/mpeg4-generic": {
        source: "iana"
      },
      "video/mpv": {
        source: "iana"
      },
      "video/nv": {
        source: "iana"
      },
      "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogv"]
      },
      "video/parityfec": {
        source: "iana"
      },
      "video/pointer": {
        source: "iana"
      },
      "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: ["qt", "mov"]
      },
      "video/raptorfec": {
        source: "iana"
      },
      "video/raw": {
        source: "iana"
      },
      "video/rtp-enc-aescm128": {
        source: "iana"
      },
      "video/rtploopback": {
        source: "iana"
      },
      "video/rtx": {
        source: "iana"
      },
      "video/scip": {
        source: "iana"
      },
      "video/smpte291": {
        source: "iana"
      },
      "video/smpte292m": {
        source: "iana"
      },
      "video/ulpfec": {
        source: "iana"
      },
      "video/vc1": {
        source: "iana"
      },
      "video/vc2": {
        source: "iana"
      },
      "video/vnd.cctv": {
        source: "iana"
      },
      "video/vnd.dece.hd": {
        source: "iana",
        extensions: ["uvh", "uvvh"]
      },
      "video/vnd.dece.mobile": {
        source: "iana",
        extensions: ["uvm", "uvvm"]
      },
      "video/vnd.dece.mp4": {
        source: "iana"
      },
      "video/vnd.dece.pd": {
        source: "iana",
        extensions: ["uvp", "uvvp"]
      },
      "video/vnd.dece.sd": {
        source: "iana",
        extensions: ["uvs", "uvvs"]
      },
      "video/vnd.dece.video": {
        source: "iana",
        extensions: ["uvv", "uvvv"]
      },
      "video/vnd.directv.mpeg": {
        source: "iana"
      },
      "video/vnd.directv.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dlna.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dvb.file": {
        source: "iana",
        extensions: ["dvb"]
      },
      "video/vnd.fvt": {
        source: "iana",
        extensions: ["fvt"]
      },
      "video/vnd.hns.video": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsavc": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsmpeg2": {
        source: "iana"
      },
      "video/vnd.motorola.video": {
        source: "iana"
      },
      "video/vnd.motorola.videop": {
        source: "iana"
      },
      "video/vnd.mpegurl": {
        source: "iana",
        extensions: ["mxu", "m4u"]
      },
      "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: ["pyv"]
      },
      "video/vnd.nokia.interleaved-multimedia": {
        source: "iana"
      },
      "video/vnd.nokia.mp4vr": {
        source: "iana"
      },
      "video/vnd.nokia.videovoip": {
        source: "iana"
      },
      "video/vnd.objectvideo": {
        source: "iana"
      },
      "video/vnd.radgamettools.bink": {
        source: "iana"
      },
      "video/vnd.radgamettools.smacker": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg1": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg4": {
        source: "iana"
      },
      "video/vnd.sealed.swf": {
        source: "iana"
      },
      "video/vnd.sealedmedia.softseal.mov": {
        source: "iana"
      },
      "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: ["uvu", "uvvu"]
      },
      "video/vnd.vivo": {
        source: "iana",
        extensions: ["viv"]
      },
      "video/vnd.youtube.yt": {
        source: "iana"
      },
      "video/vp8": {
        source: "iana"
      },
      "video/vp9": {
        source: "iana"
      },
      "video/webm": {
        source: "apache",
        compressible: false,
        extensions: ["webm"]
      },
      "video/x-f4v": {
        source: "apache",
        extensions: ["f4v"]
      },
      "video/x-fli": {
        source: "apache",
        extensions: ["fli"]
      },
      "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: ["flv"]
      },
      "video/x-m4v": {
        source: "apache",
        extensions: ["m4v"]
      },
      "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: ["mkv", "mk3d", "mks"]
      },
      "video/x-mng": {
        source: "apache",
        extensions: ["mng"]
      },
      "video/x-ms-asf": {
        source: "apache",
        extensions: ["asf", "asx"]
      },
      "video/x-ms-vob": {
        source: "apache",
        extensions: ["vob"]
      },
      "video/x-ms-wm": {
        source: "apache",
        extensions: ["wm"]
      },
      "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: ["wmv"]
      },
      "video/x-ms-wmx": {
        source: "apache",
        extensions: ["wmx"]
      },
      "video/x-ms-wvx": {
        source: "apache",
        extensions: ["wvx"]
      },
      "video/x-msvideo": {
        source: "apache",
        extensions: ["avi"]
      },
      "video/x-sgi-movie": {
        source: "apache",
        extensions: ["movie"]
      },
      "video/x-smv": {
        source: "apache",
        extensions: ["smv"]
      },
      "x-conference/x-cooltalk": {
        source: "apache",
        extensions: ["ice"]
      },
      "x-shader/x-fragment": {
        compressible: true
      },
      "x-shader/x-vertex": {
        compressible: true
      }
    };
  }
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  "node_modules/mime-db/index.js"(exports2, module2) {
    module2.exports = require_db();
  }
});

// node_modules/ext-list/index.js
var require_ext_list = __commonJS({
  "node_modules/ext-list/index.js"(exports2, module2) {
    "use strict";
    var mimeDb = require_mime_db();
    module2.exports = function() {
      var ret = {};
      Object.keys(mimeDb).forEach(function(x) {
        var val = mimeDb[x];
        if (val.extensions && val.extensions.length > 0) {
          val.extensions.forEach(function(y) {
            ret[y] = x;
          });
        }
      });
      return ret;
    };
  }
});

// node_modules/sort-keys/index.js
var require_sort_keys2 = __commonJS({
  "node_modules/sort-keys/index.js"(exports2, module2) {
    "use strict";
    var isPlainObj = require_is_plain_obj();
    module2.exports = function(obj, opts) {
      if (!isPlainObj(obj)) {
        throw new TypeError("Expected a plain object");
      }
      opts = opts || {};
      if (typeof opts === "function") {
        opts = { compare: opts };
      }
      var deep = opts.deep;
      var seenInput = [];
      var seenOutput = [];
      var sortKeys = function(x) {
        var seenIndex = seenInput.indexOf(x);
        if (seenIndex !== -1) {
          return seenOutput[seenIndex];
        }
        var ret = {};
        var keys = Object.keys(x).sort(opts.compare);
        seenInput.push(x);
        seenOutput.push(ret);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var val = x[key];
          ret[key] = deep && isPlainObj(val) ? sortKeys(val) : val;
        }
        return ret;
      };
      return sortKeys(obj);
    };
  }
});

// node_modules/sort-keys-length/index.js
var require_sort_keys_length = __commonJS({
  "node_modules/sort-keys-length/index.js"(exports2, module2) {
    "use strict";
    var sortKeys = require_sort_keys2();
    module2.exports.desc = function(obj) {
      return sortKeys(obj, function(a, b) {
        return b.length - a.length;
      });
    };
    module2.exports.asc = function(obj) {
      return sortKeys(obj, function(a, b) {
        return a.length - b.length;
      });
    };
  }
});

// node_modules/ext-name/index.js
var require_ext_name = __commonJS({
  "node_modules/ext-name/index.js"(exports2, module2) {
    "use strict";
    var extList = require_ext_list();
    var sortKeysLength = require_sort_keys_length();
    module2.exports = (str) => {
      const obj = sortKeysLength.desc(extList());
      const exts = Object.keys(obj).filter((x) => str.endsWith(x));
      if (exts.length === 0) {
        return [];
      }
      return exts.map((x) => ({
        ext: x,
        mime: obj[x]
      }));
    };
    module2.exports.mime = (str) => {
      const obj = sortKeysLength.desc(extList());
      const exts = Object.keys(obj).filter((x) => obj[x] === str);
      if (exts.length === 0) {
        return [];
      }
      return exts.map((x) => ({
        ext: x,
        mime: obj[x]
      }));
    };
  }
});

// node_modules/download/index.js
var require_download = __commonJS({
  "node_modules/download/index.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var { URL } = require("url");
    var contentDisposition = require_content_disposition();
    var archiveType = require_archive_type();
    var decompress = require_decompress();
    var filenamify = require_filenamify();
    var getStream = require_get_stream2();
    var got = require_got();
    var makeDir = require_make_dir2();
    var pify = require_pify5();
    var pEvent = require_p_event();
    var fileType2 = require_file_type5();
    var extName = require_ext_name();
    var fsP = pify(fs);
    var filenameFromPath = (res) => path.basename(new URL(res.requestUrl).pathname);
    var getExtFromMime = (res) => {
      const header = res.headers["content-type"];
      if (!header) {
        return null;
      }
      const exts = extName.mime(header);
      if (exts.length !== 1) {
        return null;
      }
      return exts[0].ext;
    };
    var getFilename = (res, data) => {
      const header = res.headers["content-disposition"];
      if (header) {
        const parsed = contentDisposition.parse(header);
        if (parsed.parameters && parsed.parameters.filename) {
          return parsed.parameters.filename;
        }
      }
      let filename = filenameFromPath(res);
      if (!path.extname(filename)) {
        const ext = (fileType2(data) || {}).ext || getExtFromMime(res);
        if (ext) {
          filename = `${filename}.${ext}`;
        }
      }
      return filename;
    };
    module2.exports = (uri, output, opts) => {
      if (typeof output === "object") {
        opts = output;
        output = null;
      }
      opts = Object.assign({
        encoding: null,
        rejectUnauthorized: process.env.npm_config_strict_ssl !== "false"
      }, opts);
      const stream2 = got.stream(uri, opts);
      const promise = pEvent(stream2, "response").then((res) => {
        const encoding = opts.encoding === null ? "buffer" : opts.encoding;
        return Promise.all([getStream(stream2, { encoding }), res]);
      }).then((result) => {
        const [data, res] = result;
        if (!output) {
          return opts.extract && archiveType(data) ? decompress(data, opts) : data;
        }
        const filename = opts.filename || filenamify(getFilename(res, data));
        const outputFilepath = path.join(output, filename);
        if (opts.extract && archiveType(data)) {
          return decompress(data, path.dirname(outputFilepath), opts);
        }
        return makeDir(path.dirname(outputFilepath)).then(() => fsP.writeFile(outputFilepath, data)).then(() => data);
      });
      stream2.then = promise.then.bind(promise);
      stream2.catch = promise.catch.bind(promise);
      return stream2;
    };
  }
});

// node_modules/ini/ini.js
var require_ini = __commonJS({
  "node_modules/ini/ini.js"(exports2, module2) {
    var { hasOwnProperty } = Object.prototype;
    var eol = typeof process !== "undefined" && process.platform === "win32" ? "\r\n" : "\n";
    var encode = (obj, opt) => {
      const children = [];
      let out = "";
      if (typeof opt === "string") {
        opt = {
          section: opt,
          whitespace: false
        };
      } else {
        opt = opt || /* @__PURE__ */ Object.create(null);
        opt.whitespace = opt.whitespace === true;
      }
      const separator = opt.whitespace ? " = " : "=";
      for (const k of Object.keys(obj)) {
        const val = obj[k];
        if (val && Array.isArray(val)) {
          for (const item of val)
            out += safe(k + "[]") + separator + safe(item) + "\n";
        } else if (val && typeof val === "object")
          children.push(k);
        else
          out += safe(k) + separator + safe(val) + eol;
      }
      if (opt.section && out.length)
        out = "[" + safe(opt.section) + "]" + eol + out;
      for (const k of children) {
        const nk = dotSplit(k).join("\\.");
        const section = (opt.section ? opt.section + "." : "") + nk;
        const { whitespace } = opt;
        const child = encode(obj[k], {
          section,
          whitespace
        });
        if (out.length && child.length)
          out += eol;
        out += child;
      }
      return out;
    };
    var dotSplit = (str) => str.replace(/\1/g, "LITERAL\\1LITERAL").replace(/\\\./g, "").split(/\./).map((part) => part.replace(/\1/g, "\\.").replace(/\2LITERAL\\1LITERAL\2/g, ""));
    var decode = (str) => {
      const out = /* @__PURE__ */ Object.create(null);
      let p = out;
      let section = null;
      const re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i;
      const lines = str.split(/[\r\n]+/g);
      for (const line of lines) {
        if (!line || line.match(/^\s*[;#]/))
          continue;
        const match = line.match(re);
        if (!match)
          continue;
        if (match[1] !== void 0) {
          section = unsafe(match[1]);
          if (section === "__proto__") {
            p = /* @__PURE__ */ Object.create(null);
            continue;
          }
          p = out[section] = out[section] || /* @__PURE__ */ Object.create(null);
          continue;
        }
        const keyRaw = unsafe(match[2]);
        const isArray = keyRaw.length > 2 && keyRaw.slice(-2) === "[]";
        const key = isArray ? keyRaw.slice(0, -2) : keyRaw;
        if (key === "__proto__")
          continue;
        const valueRaw = match[3] ? unsafe(match[4]) : true;
        const value = valueRaw === "true" || valueRaw === "false" || valueRaw === "null" ? JSON.parse(valueRaw) : valueRaw;
        if (isArray) {
          if (!hasOwnProperty.call(p, key))
            p[key] = [];
          else if (!Array.isArray(p[key]))
            p[key] = [p[key]];
        }
        if (Array.isArray(p[key]))
          p[key].push(value);
        else
          p[key] = value;
      }
      const remove = [];
      for (const k of Object.keys(out)) {
        if (!hasOwnProperty.call(out, k) || typeof out[k] !== "object" || Array.isArray(out[k]))
          continue;
        const parts = dotSplit(k);
        let p2 = out;
        const l = parts.pop();
        const nl = l.replace(/\\\./g, ".");
        for (const part of parts) {
          if (part === "__proto__")
            continue;
          if (!hasOwnProperty.call(p2, part) || typeof p2[part] !== "object")
            p2[part] = /* @__PURE__ */ Object.create(null);
          p2 = p2[part];
        }
        if (p2 === out && nl === l)
          continue;
        p2[nl] = out[k];
        remove.push(k);
      }
      for (const del of remove)
        delete out[del];
      return out;
    };
    var isQuoted = (val) => val.charAt(0) === '"' && val.slice(-1) === '"' || val.charAt(0) === "'" && val.slice(-1) === "'";
    var safe = (val) => typeof val !== "string" || val.match(/[=\r\n]/) || val.match(/^\[/) || val.length > 1 && isQuoted(val) || val !== val.trim() ? JSON.stringify(val) : val.replace(/;/g, "\\;").replace(/#/g, "\\#");
    var unsafe = (val, doUnesc) => {
      val = (val || "").trim();
      if (isQuoted(val)) {
        if (val.charAt(0) === "'")
          val = val.substr(1, val.length - 2);
        try {
          val = JSON.parse(val);
        } catch (_) {
        }
      } else {
        let esc = false;
        let unesc = "";
        for (let i = 0, l = val.length; i < l; i++) {
          const c = val.charAt(i);
          if (esc) {
            if ("\\;#".indexOf(c) !== -1)
              unesc += c;
            else
              unesc += "\\" + c;
            esc = false;
          } else if (";#".indexOf(c) !== -1)
            break;
          else if (c === "\\")
            esc = true;
          else
            unesc += c;
        }
        if (esc)
          unesc += "\\";
        return unesc.trim();
      }
      return val;
    };
    module2.exports = {
      parse: decode,
      decode,
      stringify: encode,
      encode,
      safe,
      unsafe
    };
  }
});

// node_modules/global-dirs/index.js
var require_global_dirs = __commonJS({
  "node_modules/global-dirs/index.js"(exports2) {
    "use strict";
    var path = require("path");
    var os2 = require("os");
    var fs = require("fs");
    var ini = require_ini();
    var isWindows = process.platform === "win32";
    var readRc = (filePath) => {
      try {
        return ini.parse(fs.readFileSync(filePath, "utf8")).prefix;
      } catch {
      }
    };
    var getEnvNpmPrefix = () => {
      return Object.keys(process.env).reduce((prefix, name) => {
        return /^npm_config_prefix$/i.test(name) ? process.env[name] : prefix;
      }, void 0);
    };
    var getGlobalNpmrc = () => {
      if (isWindows && process.env.APPDATA) {
        return path.join(process.env.APPDATA, "/npm/etc/npmrc");
      }
      if (process.execPath.includes("/Cellar/node")) {
        const homebrewPrefix = process.execPath.slice(0, process.execPath.indexOf("/Cellar/node"));
        return path.join(homebrewPrefix, "/lib/node_modules/npm/npmrc");
      }
      if (process.execPath.endsWith("/bin/node")) {
        const installDir = path.dirname(path.dirname(process.execPath));
        return path.join(installDir, "/etc/npmrc");
      }
    };
    var getDefaultNpmPrefix = () => {
      if (isWindows) {
        return path.dirname(process.execPath);
      }
      return path.dirname(path.dirname(process.execPath));
    };
    var getNpmPrefix = () => {
      const envPrefix = getEnvNpmPrefix();
      if (envPrefix) {
        return envPrefix;
      }
      const homePrefix = readRc(path.join(os2.homedir(), ".npmrc"));
      if (homePrefix) {
        return homePrefix;
      }
      if (process.env.PREFIX) {
        return process.env.PREFIX;
      }
      const globalPrefix = readRc(getGlobalNpmrc());
      if (globalPrefix) {
        return globalPrefix;
      }
      return getDefaultNpmPrefix();
    };
    var npmPrefix = path.resolve(getNpmPrefix());
    var getYarnWindowsDirectory = () => {
      if (isWindows && process.env.LOCALAPPDATA) {
        const dir = path.join(process.env.LOCALAPPDATA, "Yarn");
        if (fs.existsSync(dir)) {
          return dir;
        }
      }
      return false;
    };
    var getYarnPrefix = () => {
      if (process.env.PREFIX) {
        return process.env.PREFIX;
      }
      const windowsPrefix = getYarnWindowsDirectory();
      if (windowsPrefix) {
        return windowsPrefix;
      }
      const configPrefix = path.join(os2.homedir(), ".config/yarn");
      if (fs.existsSync(configPrefix)) {
        return configPrefix;
      }
      const homePrefix = path.join(os2.homedir(), ".yarn-config");
      if (fs.existsSync(homePrefix)) {
        return homePrefix;
      }
      return npmPrefix;
    };
    exports2.npm = {};
    exports2.npm.prefix = npmPrefix;
    exports2.npm.packages = path.join(npmPrefix, isWindows ? "node_modules" : "lib/node_modules");
    exports2.npm.binaries = isWindows ? npmPrefix : path.join(npmPrefix, "bin");
    var yarnPrefix = path.resolve(getYarnPrefix());
    exports2.yarn = {};
    exports2.yarn.prefix = yarnPrefix;
    exports2.yarn.packages = path.join(yarnPrefix, getYarnWindowsDirectory() ? "Data/global/node_modules" : "global/node_modules");
    exports2.yarn.binaries = path.join(exports2.yarn.packages, ".bin");
  }
});

// node_modules/is-path-inside/index.js
var require_is_path_inside = __commonJS({
  "node_modules/is-path-inside/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    module2.exports = (childPath, parentPath) => {
      const relation = path.relative(parentPath, childPath);
      return Boolean(relation && relation !== ".." && !relation.startsWith(`..${path.sep}`) && relation !== path.resolve(childPath));
    };
  }
});

// node_modules/is-installed-globally/index.js
var require_is_installed_globally = __commonJS({
  "node_modules/is-installed-globally/index.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var globalDirs = require_global_dirs();
    var isPathInside = require_is_path_inside();
    module2.exports = (() => {
      try {
        return isPathInside(__dirname, globalDirs.yarn.packages) || isPathInside(__dirname, fs.realpathSync(globalDirs.npm.packages));
      } catch {
        return false;
      }
    })();
  }
});

// package.json
var require_package3 = __commonJS({
  "package.json"(exports2, module2) {
    module2.exports = {
      name: "go-npm-example-pepyaka",
      version: "0.0.2-alpha.17",
      files: [
        "package.json",
        "binary.js"
      ],
      author: "Mark <markh@sweepbright.com>",
      license: "MIT",
      devDependencies: {},
      scripts: {
        install: "node binary.js install",
        uninstall: "node binary.js uninstall"
      },
      binary: {
        name: "pepyaka",
        url: "https://github.com/harnyk/go-npm-example/releases/download/v{version}/{name}_{version}_{platform}_{arch}.tar.gz"
      },
      dependencies: {
        download: "^8.0.0",
        "is-installed-globally": "^0.4.0"
      }
    };
  }
});

// binary.js
var os = require("os");
var download = require_download();
var cp = require("child_process");
var isInstalledGlobally = require_is_installed_globally();
var { copyFileSync, chmodSync, unlinkSync } = require("fs");
var { join } = require("path");
var pkg = require_package3();
var getArch = () => ({
  arm: "arm",
  arm64: "arm64",
  ia32: "386",
  mips: "mips",
  mipsel: "mipsle",
  ppc: "ppc",
  ppc64: "ppc64",
  s390: "s390",
  s390x: "s390x",
  x64: "amd64"
})[os.arch()];
var getPlatform = () => ({
  darwin: "darwin",
  freebsd: "freebsd",
  linux: "linux",
  openbsd: "openbsd",
  sunos: "solaris",
  win32: "windows",
  aix: "aix"
})[os.platform()];
var getBinPath = () => {
  if (isInstalledGlobally) {
    return cp.execSync("npm bin -g").toString().trim();
  } else {
    const npmRoot = cp.execSync("npm root").toString().trim();
    const nodeModulesIndex = npmRoot.indexOf("node_modules");
    if (nodeModulesIndex === -1) {
      throw new Error("Unable to determine npm root");
    }
    return join(npmRoot.substring(0, nodeModulesIndex), "node_modules", ".bin");
  }
};
var getMetadata = () => {
  const binName = pkg.binary.name;
  const version = pkg.version;
  const arch = getArch();
  const platform = getPlatform();
  const url = pkg.binary.url.replace(/\{version\}/g, version).replace(/\{platform\}/g, platform).replace(/\{arch\}/g, arch).replace(/\{name\}/g, binName);
  return {
    version,
    arch,
    platform,
    url,
    binFileName: `${binName}${platform === "windows" ? ".exe" : ""}`,
    binPath: getBinPath(),
    downloadPath: join(__dirname, "bin")
  };
};
var install = async () => {
  const { platform, url, binFileName, binPath, downloadPath } = getMetadata();
  console.log(`Downloading ${url}`);
  await download(url, downloadPath, { extract: true });
  console.log(`Copying to ${binPath}`);
  copyFileSync(join(downloadPath, binFileName), join(binPath, binFileName));
  if (platform !== "windows") {
    chmodSync(join(binPath, binFileName), 493);
  }
  console.log(`${binFileName} is installed`);
};
var uninstall = () => {
  const { binFileName, binPath } = getMetadata();
  const binFilePath = join(binPath, binFileName);
  console.log(`Removing ${binFilePath}`);
  try {
    unlinkSync(binFilePath);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(`${binFilePath} does not exist`);
    } else {
      throw e;
    }
  }
  console.log(`${binFileName} is removed`);
};
var main = async () => {
  const command = process.argv[2];
  if (command === "install") {
    await install();
  } else if (command === "uninstall") {
    uninstall();
  } else {
    console.log(`Usage: node binary.js [install|uninstall]`);
  }
};
main().catch((e) => {
  console.error(e.stack);
  process.exit(1);
});
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/*!
 * content-disposition
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * is-natural-number.js | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/is-natural-number.js
*/
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * strip-dirs | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/node-strip-dirs
*/
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/**
 * @file Tests if ES6 @@toStringTag is supported.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag|26.3.1 @@toStringTag}
 * @version 1.4.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-to-string-tag-x
 */
/**
 * @file Tests if ES6 Symbol is supported.
 * @version 1.4.2
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */
