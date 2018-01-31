// round value by a specific percision factor
function precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

// ceil value by a specific percision factor
function precisionCeil(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.ceil(number * factor) / factor;
}

function percentage(value, base) {
    return value / base * 100;
}

function getHref(url) {
    const dummy = document.createElement('a');
    dummy.href = url;
    return dummy.href;
}

// load a image, returns promise
function loadImage(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = reject;

        // load
        img.src = getHref(url);
    });
}

// https://github.com/YannickDot/console.image
// takes a image element and creates css styles
// which are able to be console.logged like:
// console.log('%c', style)
function createLogImageStyle(img, scale = 0.3) {
    const style = `
          display: block !important;
          margin: 10px 0;
          font-size: ${img.height * scale}px;
          padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(
        img.width * scale / 2,
    )}px;
          background: url(${img.src});
          background-size: ${img.width * scale}px ${img.height * scale}px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
        `;

    return style;
}

// 100px -> 100
function pixelToNumber(pixelValue) {
    return Number(pixelValue.slice(0, -2));
}

// pareses a image html element and logs it
// this function is async!
function logImage(image, title, thumb) {
    const headlineStyle = `
          display: block !important;
          line-height: 4;
          font-size: 18px;
          vertical-align: bottom !important;
        `;

    const groupTitleStyle = `
          font-weight: 400;
        `;

    // read css calculated values of the image
    const css = window.getComputedStyle(image, null);
    const width = pixelToNumber(css.width);
    const height = pixelToNumber(css.height);
    const widthInViewport = precisionRound(
        percentage(width, window.innerWidth),
        4,
    );
    const heightInViewport = precisionRound(
        percentage(height, window.inneHeight),
        4,
    );
    `${widthInViewport}vw`;
    console.group(`%c${title}` || '%c----------', headlineStyle);
    if (thumb) {
        console.log('%c', createLogImageStyle(thumb));
    }
    console.log(image);

    console.groupCollapsed('%cmeta', groupTitleStyle);
    console.log('href:      ', getHref(image.src));
    console.log('src:       ', image.src);
    console.log('data-src:  ', image.dataset.src);
    console.log('alt:       ', image.alt);
    console.log('title:     ', image.title);
    console.groupEnd();

    console.group('%cdimensions', groupTitleStyle);
    console.log('px:       ', css.width, ' * ', css.height);
    console.log(
        'ceiled:   ',
        precisionCeil(width, -1),
        ' * ',
        precisionCeil(height, -1),
    );
    console.log('natural:  ', image.naturalWidth, ' * ', image.naturalHeight);
    console.log('vw:       ', widthInViewport);
    console.groupEnd();

    console.groupEnd();
}

// parses the current tab form image elements
// and log their information ...
function logImages() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.inneHeight;

    return new Promise((resolve, reject) => {
        const images = document.querySelectorAll('img');
        const expectedImages = [];

        // load all images for creating thumbs
        images.forEach(image => {
            const promise = new Promise(resolve => {
                loadImage(image.src || image.dataset.src)
                    .then(loadedImage => {
                        resolve(loadedImage);
                    })
                    .catch(error => {
                        // we resolve anyway, but with the error
                        resolve(error);
                    });
            });
            expectedImages.push(promise);
        });

        // when all thumbs are loaded, whe log the images
        Promise.all(expectedImages).then(loadedImages => {
            images.forEach((image, index) => {
                let thumb = loadedImages[index];
                const title = `Image ${index}`;

                if (thumb instanceof Error) {
                    thumb = null;
                }

                logImage(image, title, thumb);
            });

            resolve();
        });
    });
}

function analyze() {
    logImages({
        ignoreSmallImages: true,
    });
}

analyze();
