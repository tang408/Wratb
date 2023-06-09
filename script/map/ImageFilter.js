﻿ImageFilters = {};
ImageFilters.getPixels = function (img) {
    var c, ctx;
    if (img.getContext) {
        c = img;
        try { ctx = c.getContext('2d'); } catch (e) { }
    }
    if (!ctx) {
        var tmp = img.style.display;
        img.style.display = '';
        //console.log('img.width:' + img.width + ',img.height:' + img.height);
        c = this.getCanvas(img.width, img.height);
        ctx = c.getContext('2d');
        //畫上img前，要使img顯示出來
        ctx.drawImage(img, 0, 0);
        img.style.display = tmp;
    }
    return ctx.getImageData(0, 0, c.width, c.height);
};

ImageFilters.getCanvas = function (w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
};

ImageFilters.filterImage = function (filter, image, var_args) {
    var args = null;
    if (image.tagName) {
        // 如果image是img或canvas的html dom
        args = [this.getPixels(image)];
    } else {
        // 如果image是影像的data array
        args = [image];
    }
    for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    return filter.apply(null, args);
};

ImageFilters.grayscale = function (pixels, args) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];
        // CIE luminance for the RGB
        var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels;
};

ImageFilters.brightness = function (pixels, adjustment) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
        d[i] += adjustment;
        d[i + 1] += adjustment;
        d[i + 2] += adjustment;
    }
    return pixels;
};


ImageFilters.contrast = function (pixels, adjustment) {
    var d = pixels.data;
    adjustment = (100 - adjustment) / 100;
    for (var i = 0; i < d.length; i += 4) {
        d[i] += (d[i] - 127) * adjustment + 127;
        d[i + 1] += (d[i + 1] - 127) * adjustment + 127;
        d[i + 2] += (d[i + 2] - 127) * adjustment + 127;
    }
    return pixels;
}

ImageFilters.threshold = function (pixels, threshold) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2];
        var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels;
};

ImageFilters.tmpCanvas = document.createElement('canvas');
ImageFilters.tmpCtx = ImageFilters.tmpCanvas.getContext('2d');

ImageFilters.createImageData = function (w, h) {
    return this.tmpCtx.createImageData(w, h);
};

ImageFilters.convolute = function (pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);

    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;

    var w = sw;
    var h = sh;
    var output = ImageFilters.createImageData(w, h);
    var dst = output.data;

    var alphaFac = opaque ? 1 : 0;

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y * w + x) * 4;
            var r = 0, g = 0, b = 0, a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                    var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                    var srcOff = (scy * sw + scx) * 4;
                    var wt = weights[cy * side + cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                    a += src[srcOff + 3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
};

if (!window.Float32Array)
    Float32Array = Array;

ImageFilters.convoluteFloat32 = function (pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);

    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;

    var w = sw;
    var h = sh;
    var output = {
        width: w, height: h, data: new Float32Array(w * h * 4)
    };
    var dst = output.data;

    var alphaFac = opaque ? 1 : 0;

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y * w + x) * 4;
            var r = 0, g = 0, b = 0, a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                    var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                    var srcOff = (scy * sw + scx) * 4;
                    var wt = weights[cy * side + cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                    a += src[srcOff + 3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    return output;
};
  