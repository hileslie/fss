const fs = require('fs');
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

module.exports = {
    mkdirsSync,
    mkdirs,
    isExist,
}