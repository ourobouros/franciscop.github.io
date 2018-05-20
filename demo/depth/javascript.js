/*

ABOUT THIS CODE

This code isn't pretty; it isn't supposed to be pretty at all! It is a fun
experiment where I typed away as fast as my fingers followed my brain. Sometimes
faster, so there will be plenty of bugs and edge cases.

In the future, I might decide to:
- Clean it up and set it as a library so that me and other people can use it.
- Repurpose the critical snippets into a large product (I am making a robot).
- Do nothing! It was fun, I finished it and now I'm focused on other things.

So far, if you want to reuse this code, please ask for permission. It is NOT MIT
as [most of my other repositories](https://github.com/franciscop/)

Made by Francisco Presencia https://francisco.io/

*/


[...document.querySelectorAll('a')].forEach(link => {
  link.onclick = e => {
    e.preventDefault();
    document.querySelector('.datacloud').classList.add('loading');
    [...document.querySelectorAll('a')].forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    let name = e.target.getAttribute('href');
    [...document.querySelectorAll('.point')].forEach(el => el.remove());
    start(name);
  }
});

function start(prefix){
  let loadImages = ['left', 'right'].map(side => {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.src = './img/' + prefix + '_' + side + '.png';
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
        resolve(imageData);
      };
    });
  });
  Promise.all(loadImages).then(imgs => {
    diff(imgs);
    // depth(imgs);

    points(imgs[0], { count: 100, size: 30 }).then((cloud) => {
      let ctx = draw('.points', imgs[0]);

      cloud.forEach(point => {
        let diff = findPoint(point, imgs[0], imgs[1]);

        let pointDiv = document.createElement('div');
        let xdiff = diff.length / 2 - indexOfMin(diff);
        pointDiv.setAttribute('alt', xdiff + 'px deviation');
        pointDiv.style.left = point.x + 'px';
        pointDiv.style.top = point.y + 'px';
        pointDiv.style.borderColor = chooseColor(diff);
        pointDiv.classList.add('point');
        pointDiv.onclick = e => {
          console.log("Point:", point.i, 'x:', point.x, 'y:', point.y);
          console.log("Delta X:", xdiff + 'px', 'all:', diff);
          document.querySelector('.info').innerHTML = "Deviation: " + xdiff + 'px, see the console for extra info';
        }
        document.querySelector('.datacloud').appendChild(pointDiv);
      });
    });
  });

  function indexOfMin(arr) {
    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] < min) {
        minIndex = i;
        min = arr[i];
      }
    }

    return minIndex;
  }

  let chooseColor = diff => {
    let min = indexOfMin(diff);
    let val = parseInt(255 * Math.abs(min) / (diff.length));
    if (val < 128) {
      return `rgba(255, ${val * 2}, ${val * 2}, .8)`;
    } else {
      return `rgba(${(255 - val) * 2}, ${(255 - val) * 2}, 255, .8)`;
    }
  };

  let getMatrix = (src, index, width, size = 25) => {
    let matrix = [];
    for (let j = -size; j < size; j++) {
      for (let i = -size; i < size; i++) {
        matrix.push(src[index + j * width + i]);
      }
    }
    return matrix;
  };

  let error = (src, dest) => {
    let semisum = src.reduce((all, val, i) => all + Math.pow(val - dest[i], 2), 0);
    return parseInt(semisum / 9);
  };

  function findPoint(point, source, destination) {
    let src = bnw(source.data);
    let dest = bnw(destination.data);
    let matrix = getMatrix(src, point.i, source.width);

    let numbers = [];
    for (let i = -20; i < 20; i++) {
      numbers.push(i);
    }

    return numbers.map(num => {
      return error(matrix, getMatrix(dest, point.i + num, source.width));
    });
  }

  function draw(selector, pixels, expand = false){
    let canvas = document.querySelector(selector);
    if (!canvas) return;

    document.querySelector('.datacloud').classList.remove('loading');
    let ctx = canvas.getContext('2d');
    var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < image.data.length; i += 4) {
      if (expand) {
        image.data[i] = pixels[Math.floor(i / 4)];
        image.data[i + 1] = pixels[Math.floor(i / 4)];
        image.data[i + 2] = pixels[Math.floor(i / 4)];
        image.data[i + 3] = 255;
      } else {
        image.data[i] = pixels[i] || pixels.data[i];
        image.data[i + 1] = pixels[i + 1] || pixels.data[i + 1];
        image.data[i + 2] = pixels[i + 2] || pixels.data[i + 2];
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return ctx;
  }

  function indexOfMax(arr) {
    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }

    return maxIndex;
  }

  // Hide all the pixels around the specified index
  function blackout(pixels, width, index, size){
    for (var i = -size; i < size; i++) {
      for (var j = -size; j < size; j++) {
        pixels[index + i - width * j] = 0;
      }
    }
    return pixels;
  };

  // Detect characteristic points from image
  function points(img, { count = 20, size = 10 } = {}) {
    return edger(img.data, img.width, size).then(pixels => {
      let special = [];
      for (let i = 0; i < count; i++) {
        let max = indexOfMax(pixels);
        pixels = blackout(pixels, img.width, max, size);
        special.push({ i: max, x: max % img.width, y: Math.floor(max / img.width)});
      }
      return special;
    });
  }



  function inner (width, size, total) {
    return i => i > width * size &&  // Top
      i < total - width * size &&  // Bottom
      i % (width) > size &&    // Left
      i % (width) < width - size; // Right
  }

  function bnw(pixels) {
    let total = [];
    for (let i = 0; i < pixels.length; i += 4) {
      total[Math.floor(i / 4)] = parseInt((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
    }
    return total;
  }

  function edger(pixels, width, size = 10) {
    pixels = bnw(pixels);
    return new Promise((resolve, reject) => {
      let isInner = inner(width, size, pixels.length);
      let total = pixels.map(n => 0);
      for (let i = 0; i < pixels.length; i++) {
        if (isInner(i)) {
          let sized = 2;
          let semisum = 0;
          for (let x = -sized; x < sized; x++) {
            for (let y = -sized; y < sized; y++) {
              semisum += Math.pow(pixels[i + x - width * y] - pixels[i], 2);
            }
          }
          total[i] = Math.sqrt(semisum) / sized;
        }
      }
      resolve(total);
    });
  }












  // Shift the image to a side
  let shifter = function shiftDiff(pixels, width = 0, shift = 0, value){
    return new Promise((resolve, reject) => {
      let total = [];
      for (let i = 0; i < pixels.length; i++) {
        total[i + shift * 4] = pixels[i];
      }
      resolve(total);
    });
  };

  // Takes two image descriptions and returns a black/white array 1/4th size
  let differ = function(left, right) {
    let total = [];
    for (var i = 0; i < left.length; i += 4) {
      // We want to do this in RGB
      let valdiff = Math.abs(left[i] - right[i])
        + Math.abs(left[i + 1] - right[i + 1])
        + Math.abs(left[i + 2] - right[i + 2]);
      total[Math.floor(i / 4)] = valdiff < 100 ? 0 : 255;
    }
    return total;
  };

  function diff(imgs) {
    let left = Array.from(imgs[0].data);
    let right = Array.from(imgs[1].data);

    shifter(left, imgs[0].width, 0).then(shifted => {
      let difference = differ(shifted, right);
      draw('.diff', difference, true);
    });
  }

  function depth(imgs) {
    let left = Array.from(imgs[0].data);
    let right = Array.from(imgs[1].data);

    let time = new Date();
    Promise.all([
      shifter(left, imgs[0].width, 0),
      shifter(left, imgs[0].width, 1),
      shifter(left, imgs[0].width, 2),
      shifter(left, imgs[0].width, 3),
      shifter(left, imgs[0].width, 4),
      shifter(left, imgs[0].width, 5),
      shifter(left, imgs[0].width, 6),
      shifter(left, imgs[0].width, 7),
      shifter(left, imgs[0].width, 8),
      shifter(left, imgs[0].width, 9),
      shifter(left, imgs[0].width, 10),
    ]).then(images => {
      console.log("Diff:", new Date - time, 'ms');
      time = new Date();
      for (let i = 0; i < imgs[0].data.length; i++) {
        imgs[0].data[i] = i % 4 === 3 ? 255 : 0;
      }
      images.map(shifted => differ(shifted, right)).forEach((difference, z) => {
        for (let i = 0; i < imgs[0].data.length; i+=4) {
          // If it's white
          if (difference[Math.floor(i / 4)] > 250) {
            // Paint it a color more gray
            imgs[0].data[i] = z * 30;
            imgs[0].data[i + 1] = z * 30;
            imgs[0].data[i + 2] = z * 30;
            imgs[0].data[i + 3] = 255;
          }
        }
      });
      console.log("Diff2:", new Date - time, 'ms');
      draw('.depth', imgs[0]);
    });
  }
}
start('bike');
