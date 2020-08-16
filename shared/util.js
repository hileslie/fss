const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
// 递归创建目录 同步方法
const mkdirsSync = function (dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
// mkdirsSync('hello/a/b/c');

// 递归创建目录 异步方法  
const mkdirs = function (dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            // console.log(path.dirname(dirname));  
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
                console.log('在' + path.dirname(dirname) + '目录创建好' + dirname + '目录');
            });
        }
    });
}
// mkdirs('hello/a/b/c', () => {
//     console.log('done');
// })

// 判断文件夹是否已存在
const isExist = function(baseUrl) {
    return fs.existsSync(baseUrl);
}

// 文件后缀
const extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length);

// 返回已经上传切片名列表
const getUploadedList = async (dirPath)=>{
    return fse.existsSync(dirPath) 
      ? (await fse.readdir(dirPath)).filter(name=>name[0]!=='.') // 过滤诡异的隐藏文件
      : []
}

module.exports = {
    mkdirsSync,
    mkdirs,
    isExist,
    extractExt,
    getUploadedList,
}