/**
 * 将图片压缩为对应尺寸
 * @param {Object} options
 * @param {String} options.img 图片的url或者base64数据
 * @param {Number} options.width 目标图片的宽度
 * @param {Number} options.height 目标图片的高度
 * @param {Number} options.quality 生成目标图片质量
 * @param {String} options.fit 图片压缩填充模式默认 scale：按比例缩放，可选 fill：按使用目标尺寸
 * @param {String} options.type 图片压缩类型默认 jpg，可选 png
 * @returns {Promise} then {width,height,img}
 */

import EXIF from 'exif-js';

function pictureCompress(options) {
  return new Promise((resolve, reject) => {
    if (!options.img) {
      reject(new Error('need img'));
      return;
    }
    let imgSrc = options.img,
      width = options.width,
      height = options.height,
      type = options.type || 'jpg',
      quality = options.quality || 0.92,
      fit = options.fit || 'scale';

    if (width < 0 || height < 0 || width + height <= 0) {
      reject(new Error('dist width or height need >= 0'));
      return;
    }
    if (!/jpg|png|jpeg/.test(type)) {
      reject(new Error('type need jpg or png!'));
      return;
    }

    let image = new Image();
    image.src = imgSrc;

    image.onload = function() {
      let orientation = 1;

      EXIF.getData(image, function() {
        orientation = EXIF.getTag(this, 'Orientation') || 1;
      });

      let distSize = getDistSize(
        {
          width: this.naturalWidth,
          height: this.naturalHeight,
        },
        {
          width,
          height,
        },
        fit,
        orientation
      );

      let imgData = compress(
        this,
        distSize.width,
        distSize.height,
        type,
        quality,
        orientation
      );
      resolve({
        width: distSize.width,
        height: distSize.height,
        img: imgData,
      });
    };
    image.onerror = function(err) {
      reject(err);
    };
  });
}
/**
 * 将图片转换为固定尺寸的
 * @param {Image} img 图片数据
 * @param {Number} width 转换之后的图片宽度
 * @param {Number} height 转换之后的图片高度
 * @param {String} type base64的图片类型 jpg png
 * @param {Number} quality 转换之后的图片质量
 * @param {Number} orientation 原图旋转参数
 *
 */
function compress(img, width, height, type, quality, orientation) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  let types = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  canvas.width = width;
  canvas.height = height;

  // 处理自动旋转问题
  if (orientation && orientation !== 1) {
    switch (orientation) {
      case 6: // 旋转90度
        canvas.width = height;
        canvas.height = width;
        ctx.rotate(Math.PI / 2);
        // (0,-height) 从旋转原理图那里获得的起始点
        ctx.drawImage(img, 0, -height, width, height);
        break;
      case 3: // 旋转180度
        ctx.rotate(Math.PI);
        ctx.drawImage(img, -width, -height, width, height);
        break;
      case 8: // 旋转-90度
        canvas.width = height;
        canvas.height = width;
        ctx.rotate((3 * Math.PI) / 2);
        ctx.drawImage(img, -width, 0, width, height);
        break;
      default:
        break;
    }
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }

  return canvas.toDataURL(types[type], quality);
}
/**
 * 选择源尺寸与目标尺寸比例中较小的那个，保证图片可以完全显示
 * 最大值不超过1，如果图片源尺寸小于目标尺寸，则不做处理，返回图片原尺寸
 * @param {Object} source 源图片的宽高
 * @param {Object} dist 目标图片的宽高
 * @param {String} options.fit 图片压缩填充模式
 * @param {Object} orientation 原图旋转参数
 */
function getDistSize(source, dist, fit, orientation) {
  let scale = 1;

  if (orientation === 6 || orientation === 8) {
    if (fit === 'fill') return { width: dist.height, height: dist.width };
    scale = Math.min(
      dist.width ? dist.width / source.height : 1,
      dist.height ? dist.height / source.width : 1,
      1
    );
  } else {
    scale = Math.min(
      dist.width ? dist.width / source.width : 1,
      dist.height ? dist.height / source.height : 1,
      1
    );
  }

  if (fit === 'fill') return dist;

  return {
    width: Math.round(source.width * scale),
    height: Math.round(source.height * scale),
  };
}
export default pictureCompress;
