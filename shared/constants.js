const path = require('path');

// 业务素材映射
const Material = {
    1: '线上营销',
    2: '图片素材',
    3: '品牌视觉',
    4: '文化建设',
};

// 上传文件的目录地址
const UPLOAD_DIR = path.resolve(__dirname, '../public/upload');

// 临时上传文件的目录地址
const TEMP_DIR = path.resolve(__dirname, '../temp');

module.exports = {
    Material,
    UPLOAD_DIR,
    TEMP_DIR,
}