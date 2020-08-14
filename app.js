const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');

const page = require('./routes/page');
const upload = require('./routes/upload');
const download = require('./routes/download');

// 处理页面请求
app.use(koaBody({
    multipart: true,
    formidable: {
      // uploadDir: path.resolve(__dirname, '../temp'), // 文件存放地址
      // keepExtensions: true,
      maxFieldsSize: 2 * 1024 * 1024
    }
}))

app.use(page.routes(), page.allowedMethods());
app.use(upload.routes(), upload.allowedMethods());
app.use(download.routes(), download.allowedMethods());

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});
  
module.exports = app