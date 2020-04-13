const Jimp = require('jimp');
const cliProgress = require('cli-progress');
T = (A) => A[0].map((col, iii) => A.map(row => row[iii]));
S = (A) => ([A.length || 0,
    A ? (A[0] ? A[0].length : 0) : 0,
    A ? (A[0] ? (A[0][0] ? A[0][0].length : 0) : 0) : 0,
    A ? (A[0] ? (A[0][0] ? (A[0][0][0] ? A[0][0][0].length : 0) : 0) : 0) : 0,
    A ? (A[0] ? (A[0][0] ? (A[0][0][0] ? (A[0][0][0][0] ? A[0][0][0][0].length : 0) : 0) : 0) : 0) : 0,
]).filter(e => e != false).filter(e => e != undefined);

var rgbToHex = function (rgb) {
    rgb = Math.min(256, Math.max(0, rgb));
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    if (hex.length > 2) {
        hex = '10';
    }
    return hex;
};

var percentColors = [{
        pct: 0.0,
        color: {
            r: 0x00,
            g: 0x00,
            b: 0xFF
        }
    }, {
        pct: 0.28,
        color: {
            r: 0x40,
            g: 0x00,
            b: 0xC7
        }
    }, {
        pct: 0.72,
        color: {
            r: 0xC7,
            g: 0x00,
            b: 0x40
        }
    },
    {
        pct: 1.0,
        color: {
            r: 0xFF,
            g: 0x00,
            b: 0x00
        }
    }
];

var getColorForPercentage = function (pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return [color.r, color.g, color.b];
    // or output as hex if preferred
};

function decimalToHexString(value) {
    let colors = getColorForPercentage(value)
    let hex;

    let red = rgbToHex(colors[0]);
    let green = rgbToHex(colors[1]);
    let blue = rgbToHex(colors[2]);

    hex = red + green + blue;
    hex = `0x${hex.toString(16)}FF`
    return hex;
}

function saveImage(name, imageData) {
    let imageDataConv = []
    if (!imageData && !imageData[0]) throw new Error("unvalid Matrix!")

    let reversed = false;
    if (imageData.length < imageData[0].length) {
        imageData = T(imageData);
        reversed = true;
    }

    imageData.forEach((list) => {
        let row = []
        list.forEach((pixel) => {
            if (pixel[0])
                pixel = pixel[0];
            let hex = decimalToHexString(pixel)
            row.push(hex);
        });
        imageDataConv.push(row);
    });

    let image = new Jimp(imageDataConv.length, imageDataConv[0].length);

    imageDataConv.forEach((row, x) => {
        row.forEach((color, y) => {
            color = parseInt(color, 16);
            image.setPixelColor(color, x, y);
        });
    });


    image.scale(30, Jimp.RESIZE_NEAREST_NEIGHBOR)

    let size = [image.getWidth(), (image.getHeight())];
    image.resize(...size)

    let info_size = image.getHeight() * 0.1;

    if (reversed)
        for (let x = 0; x < info_size; x++) {
            for (let y = 0; y < info_size; y++) {
                image.setPixelColor(0, x, y);
            }
        }

    image.write(`images/${name}.png`)
    return true;
}


function saveImages(config, data) {
    let amount = config.validation_len;

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(amount, 0);
    for (let i = 0; i < amount; i++) {
        saveImage(i, data[i]);

        // progress loading bar
        bar1.update(i + 1);
    }
    bar1.update(amount);
    bar1.stop();
}

module.exports = {
    saveImages: saveImages
}