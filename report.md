# Graphics Programming Finals

## Image Processing Application

### Grayscale Filter

While implementing the grayscale filter, an issue that I came across was that the pixel intensity of some pixels would exceed 255 upon increasing the brightness of the image by 20%. To resolve this, a constrain function was used to ensure that the pixel intensity was kept between 0 to 255.

### Threshold Filter

The threshold sliders were originally created in a for loop in the draw() function which resulted in

### Colour space conversion

Didn't normalise the RGB values
