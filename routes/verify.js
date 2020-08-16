const router = require('koa-router')()
const path = require('path');
const fse = require('fs-extra');
const { UPLOAD_DIR, TEMP_DIR } = require('../shared/constants');
const { getUploadedList } = require('../shared/util');

router.post('/verify', async ctx => {
    const {
        name,
        materialType,
        folderName,
        uid,
        fileHash,
    } = ctx.request.body
    const fileDir = `${UPLOAD_DIR}/${materialType}/${folderName}/${name}`;
    // 文件是否存在
    let uploaded = false
    let uploadedList = []
    if (fse.existsSync(fileDir)) {
        uploaded = true;
    } else {
        uploadedList = await getUploadedList(path.resolve(TEMP_DIR, fileHash))
    }
    ctx.body = {
        uploaded,
        uploadedList,
    };
})

module.exports = router;