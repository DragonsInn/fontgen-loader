var loaderUtils = require("loader-utils");
var fontgen = require("webfonts-generator");
var path = require("path");

var mimeTypes = {
    'eot': 'application/vnd.ms-fontobject',
    'svg': 'image/svg+xml',
    'ttf': 'application/x-font-ttf',
    'woff': 'application/font-woff',
}

module.exports = function() {
    this.cacheable();
    var params = loaderUtils.parseQuery(this.query);
    var config = require(this.resourcePath);
    config.__dirname = path.dirname(this.resourcePath);

    var relativate = function(file) {
        if(file.substr(0,1) == "/") {
            // Absolute path.
            return file;
        } else {
            // Relative to the config file.
            return path.join(config.__dirname, file);
        }
    };

    // Sanity check
    /*
    if(typeof config.fontName != "string" || typeof config.files != "array") {
        this.reportError("Typemismatch in your config. Verify your config for correct types.");
        return false;
    }
    */

    // Re-work the files array.
    for(var k in config.files) config.files[k] = relativate(config.files[k]);

    // With everything set up, let's make an ACTUAL config.
    var formats = params.types || ['eot', 'woff', 'ttf', 'svg'];
    var fontconf = {
        files: config.files,
        fontName: config.fontName,
        types: formats,
        order: formats,
        templateOptions: {
            baseClass: config.baseClass || "icon",
            classPrefix: config.classPrefix || "icon-"
        },
        rename: (typeof config.rename == "function" ? config.rename : function(f){
            return path.basename(f, ".svg");
        }),
        dest: "",
        writeFiles: false
    };

    // svgicons2svgfont stuff
    var keys = [
        "fixedWidth",
        "centerHorizontally",
        "normalize",
        "fontHeight",
        "round",
        "descent"
    ];
    for(var x in keys) {
        if(typeof config[keys[x]] != "undefined") {
            fontconf[keys[x]] = config[keys[x]];
        }
    }

    var cb = this.async();
    var self = this;
    var opts = this.options;
    var pub = (
        opts.output.publicPath || "/"
    );
    var embed = !!params.embed

    fontgen(fontconf, function(err, res){
        if(err) cb(err);
        var urls = {};
        for(var i in formats) {
            var format = formats[i];
            if(!embed) {
                var filename = config.fileName || params.fileName || "[hash]-[fontname][ext]";
                filename = filename
                    .replace("[fontname]",fontconf.fontName)
                    .replace("[ext]", "."+format);
                var url = loaderUtils.interpolateName(this,
                    filename,
                    {
                        context: self.options.context || this.context,
                        content: res[format]
                    }
                );
                urls[format] = path.join(pub, url);
                self.emitFile(url, res[format]);
            } else {
                urls[format] = 'data:'
                    + mimeTypes[format]
                    + ';charset=utf-8;base64,'
                    + (new Buffer(res[format]).toString('base64'));
            }
        }
        cb(null, res.generateCss(urls));
    });
}
