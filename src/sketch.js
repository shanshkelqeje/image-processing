var img;
var colourChannels = [];
var thresholdSliders = [];

function preload() {
    img = loadImage("assets/leaf.jpg");
}

function setup() {
    createCanvas(900, 900);
    pixelDensity(1);

    grayscaleImg = grayscaleFilter(img);
    splitColourChannels(img);
    setupThresholdSliders(colourChannels);
    YCbCrImg = RGBToYCbCr(img);
    hsvImg = RGBToHSV(img);
    labImg = RGBToLab(img);
}

function draw() {
    background(255);

    image(img, 0, 0, 160, 120);
    image(grayscaleImg, 160 + 20, 0, 160, 120);
    for (let i = 0; i < colourChannels.length; i++) {
        image(colourChannels[i], (160 + 20) * i, 120 + 20, 160, 120);
        image(
            thresholdFilter(colourChannels[i], thresholdSliders[i]),
            (160 + 20) * i,
            240 + 40,
            160,
            120
        );
    }
    image(img, 0, 360 + 80, 160, 120);
    image(YCbCrImg, 160 + 20, 360 + 80, 160, 120);
    image(hsvImg, 320 + 40, 360 + 80, 160, 120);
    image(labImg, 480 + 60, 360 + 80, 160, 120);
    image(img, 0, 480 + 100, 160, 120);
    image(img, 160 + 20, 480 + 100, 160, 120);
    image(img, 320 + 40, 480 + 100, 160, 120);
}

function RGBToYCbCr(img) {
    var YCbCrImage = createImage(img.width, img.height);
    img.loadPixels();
    YCbCrImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (img.width * y + x) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];

            let Y = 0.299 * r + 0.587 * g + 0.114 * b;
            let Cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
            let Cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;

            console.log("Y: " + Y);
            console.log("Cb: " + Cb);
            console.log("Cr: " + Cr);

            let newR = map(Y, 16, 235, 0, 255);
            let newG = map(Cb, 16, 240, 0, 255);
            let newB = map(Cr, 16, 240, 0, 255);

            console.log("R " + newR);
            console.log("G " + newG);
            console.log("B " + newB);

            YCbCrImage.pixels[index] = newR;
            YCbCrImage.pixels[index + 1] = newG;
            YCbCrImage.pixels[index + 2] = newB;
            YCbCrImage.pixels[index + 3] = a;
        }
    }

    YCbCrImage.updatePixels();
    return YCbCrImage;
}

function RGBToLab(img) {
    var labImage = createImage(img.width, img.height);
    img.loadPixels();
    labImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (img.width * y + x) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];

            // Normalise sRGB values
            r /= 255;
            g /= 255;
            b /= 255;

            // Apply gamma correction (sRGB to Linear RGB)
            function gammaCorrection(V) {
                if (V <= 0.04045) return V / 12.92;
                else return Math.pow((V + 0.055) / 1.055, 2.4);
            }

            r = gammaCorrection(r);
            g = gammaCorrection(g);
            b = gammaCorrection(b);

            // Convert RGB to XYZ
            let X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
            let Y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
            let Z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

            // Reference white point (D65)
            const Xn = 0.95047;
            const Yn = 1.0;
            const Zn = 1.08883;

            // Convert XYZ to L*a*b*
            function f(t) {
                if (t > 0.008856) return Math.pow(t, 1 / 3);
                else return 7.787 * t + 16 / 116;
            }

            let lStar = 0;
            if (Y / Yn > 0.008856) lStar = 116 * Math.pow(Y / Yn, 1 / 3) - 16;
            else lStar = 903.3 * (Y / Yn);

            let aStar = 500 * (f(X / Xn) - f(Y / Yn));
            let bStar = 200 * (f(Y / Yn) - f(Z / Zn));

            console.log("L* " + lStar);
            console.log("a* " + aStar);
            console.log("b* " + bStar);

            let newR = map(lStar, 0, 100, 0, 255);
            let newG = map(aStar, -128, 127, 0, 255);
            let newB = map(bStar, -128, 127, 0, 255);

            console.log("R " + newR);
            console.log("G " + newG);
            console.log("B " + newB);

            labImage.pixels[index] = newR;
            labImage.pixels[index + 1] = newG;
            labImage.pixels[index + 2] = newB;
            labImage.pixels[index + 3] = a;
        }
    }

    labImage.updatePixels();
    return labImage;
}

function RGBToHSV(img) {
    var HSVImage = createImage(img.width, img.height);
    img.loadPixels();
    HSVImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (img.width * y + x) * 4;
            let r = img.pixels[index] / 255;
            let g = img.pixels[index + 1] / 255;
            let b = img.pixels[index + 2] / 255;
            let a = img.pixels[index + 3];

            // Saturation
            let max = Math.max(r, g, b);
            let min = Math.min(r, g, b);
            let delta = max - min;
            let saturation = delta / max;

            // Value
            let value = max;

            // Hue
            let rNorm = (max - r) / delta;
            let gNorm = (max - g) / delta;
            let bNorm = (max - b) / delta;

            let hue = 0;

            if (r == max && g == min) {
                hue = 5 + bNorm;
            } else if (r == max && g != min) {
                hue = 1 - gNorm;
            } else if (g == max && b == min) {
                hue = rNorm + 1;
            } else if (g == max && b != min) {
                hue = 3 - bNorm;
            } else if (r == max) {
                hue = 3 + gNorm;
            } else {
                hue = 5 - rNorm;
            }

            hue *= 60;

            newR = map(hue, 0, 360, 0, 255);
            newG = map(saturation, 0, 1, 0, 255);
            newB = map(value, 0, 1, 0, 255);

            HSVImage.pixels[index] = newR;
            HSVImage.pixels[index + 1] = newG;
            HSVImage.pixels[index + 2] = newB;
            HSVImage.pixels[index + 3] = a;
        }
    }

    HSVImage.updatePixels();
    return HSVImage;
}

function setupThresholdSliders(colourChannels) {
    for (let i = 0; i < colourChannels.length; i++) {
        let thresholdSlider = createSlider(0, 255, 125);
        thresholdSlider.position((160 + 20) * i, 240 + 40 + 120);
        thresholdSliders.push(thresholdSlider);
    }
}

function thresholdFilter(img, slider) {
    var thresholdImage = createImage(img.width, img.height);
    img.loadPixels();
    thresholdImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (img.width * y + x) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];

            // Convert image to grayscale
            let gray = r * 0.299 + g * 0.587 + b * 0.114; // Luma

            // Set threshold
            if (gray > slider.value()) gray = 255;
            else gray = 0;

            thresholdImage.pixels[index] =
                thresholdImage.pixels[index + 1] =
                thresholdImage.pixels[index + 2] =
                    gray;
            thresholdImage.pixels[index + 3] = a;
        }
    }

    thresholdImage.updatePixels();
    return thresholdImage;
}

function splitColourChannels(img) {
    var redImg = createImage(img.width, img.height);
    var greenImg = createImage(img.width, img.height);
    var blueImg = createImage(img.width, img.height);
    // Load pixel data into the pixels array so that we can read it
    img.loadPixels();
    redImg.loadPixels();
    greenImg.loadPixels();
    blueImg.loadPixels();

    // Split into colour channels
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (img.width * y + x) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];

            // Set red channel
            redImg.pixels[index] = r;
            redImg.pixels[index + 1] = 0;
            redImg.pixels[index + 2] = 0;
            redImg.pixels[index + 3] = a;
            // Convert image to red channel
            let gray = r * 0.299 + g * 0.587 + b * 0.114; // Luma
            redImg.pixels[index] =
                redImg.pixels[index + 1] =
                redImg.pixels[index + 2] =
                    gray;

            // Set green channel
            greenImg.pixels[index] = 0;
            greenImg.pixels[index + 1] = g;
            greenImg.pixels[index + 2] = 0;
            greenImg.pixels[index + 3] = a;
            // Convert image to green channel
            gray = r * 0.299 + g * 0.587 + b * 0.114; // Luma
            greenImg.pixels[index] =
                greenImg.pixels[index + 1] =
                greenImg.pixels[index + 2] =
                    gray;

            // Set blue channel
            blueImg.pixels[index] = 0;
            blueImg.pixels[index + 1] = 0;
            blueImg.pixels[index + 2] = b;
            blueImg.pixels[index + 3] = a;
            // Convert image to blue channel
            gray = r * 0.299 + g * 0.587 + b * 0.114; // Luma
            blueImg.pixels[index] =
                blueImg.pixels[index + 1] =
                blueImg.pixels[index + 2] =
                    gray;
        }
    }

    redImg.updatePixels();
    greenImg.updatePixels();
    blueImg.updatePixels();

    colourChannels.push(redImg);
    colourChannels.push(greenImg);
    colourChannels.push(blueImg);

    return colourChannels;
}

function grayscaleFilter(img) {
    var grayscaleImage = createImage(img.width, img.height);
    img.loadPixels();
    grayscaleImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (img.width * y + x) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];

            // Convert image to grayscale
            let gray = r * 0.299 + g * 0.587 + b * 0.114; // Using the Luma formula
            // Increase brightness by 20%
            gray = constrain(gray * 1.2, 0, 255); // Prevent pixel intensity from exceeding 255

            grayscaleImage.pixels[index] =
                grayscaleImage.pixels[index + 1] =
                grayscaleImage.pixels[index + 2] =
                    gray;
            grayscaleImage.pixels[index + 3] = a;
        }
    }

    grayscaleImage.updatePixels();
    return grayscaleImage;
}
