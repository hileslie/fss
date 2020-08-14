const router = require('koa-router')();
const send = require('koa-send');

// 单文件下载
router.get('/download/:name', async (ctx) => {
    const name = ctx.params.name;
    const path = `temp/${name}`;
    ctx.attachment(path);
    await send(ctx, path);
});

module.exports = router;