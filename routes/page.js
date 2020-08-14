const fs = require('fs');
const path = require('path');
const router = require('koa-router')();

// 单文件文件上传-页面（小文件）
router.get('/', async ctx => {
    ctx.type = 'html';
    ctx.body = await fs.createReadStream(path.resolve(__dirname, '../views/index.html'), 'utf-8');
})
// 单文件文件分片上传-页面（大文件）
router.get('/fenpian', async ctx => {
  ctx.type = 'html';
  ctx.body = await fs.createReadStream(path.resolve(__dirname, '../views/fenpian.html'), 'utf-8');
})

module.exports = router;