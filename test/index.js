const Koa = require('koa');
const path = require('path');
const Router = require('koa-router');
const koaBody = require('koa-body');
const source = require('koa-static');
const fse = require('fs-extra')
const fs = require('fs');
const send = require('koa-send');
const archiver = require('archiver');

const app = new Koa();
const router = new Router()

// 处理静态资源
app.use(source(path.resolve(__dirname, 'public')))

// 上传文件的目录地址
const UPLOAD_DIR = path.resolve(__dirname, '../public/upload')

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

// 处理页面请求
app.use(koaBody({
  multipart: true,
  formidable: {
    // uploadDir: path.resolve(__dirname, '../temp'), // 文件存放地址
    // keepExtensions: true,
    maxFieldsSize: 2 * 1024 * 1024
  }
}))

// 单文件文件上传-页面（小文件）
router.get('/', async ctx => {
  ctx.type = 'html';
  ctx.body = await fs.createReadStream(path.resolve(__dirname, './index.html'), 'utf-8');
})

// 单文件文件分片上传-页面（大文件）
router.get('/fenpian', async ctx => {
  ctx.type = 'html';
  ctx.body = await fs.createReadStream(path.resolve(__dirname, './fenpian.html'), 'utf-8');
})

// 上传单个文件
const uploadStatic = async (obj) => {
  const file = obj.files.file
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  let filePath = path.join(__dirname, '../temp') + `/${file.name}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  return "上传成功！";
}


// 单文件文件上传（小文件）
router.post('/upload', async ctx => {
  // const files = ctx.request.files
  // console.log('files: ', files.file);
  console.log('ctx.request.body: ', ctx.request.body)
  let res = await uploadStatic(ctx.request);
  ctx.body = res;
})

// 上传多个文件
const uploadStatics = async (obj) => {
  // 上传多个个文件
  const files = obj.files.file
  for (let file of files) {
    // 创建可读流
    const reader = fs.createReadStream(file.path);
    let filePath = path.join(__dirname, '../temp') + `/${file.name}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
  }
  return "上传成功！";
}

// 多文件文件上传（小文件）
router.post('/upload-duo', async ctx => {
  // const files = ctx.request.files
  // console.log('files: ', files.file);
  let res = await uploadStatics(ctx.request);
  ctx.body = res;
})

// 单文件文件分片上传（大文件）
router.post('/fen-upload', async ctx => { // 文件转移
  // koa-body 在处理完 file 后会绑定在 ctx.request.files
  const file = ctx.request.files.file
  // [ name, index, ext ] - 分割文件名
  const fileNameArr = file.name.split('.')
  // 存放切片的目录
  const chunkDir = `${UPLOAD_DIR}/${fileNameArr[0]}`
  if (!fse.existsSync(chunkDir)) { // 没有目录就创建目录
    // 创建大文件的临时目录
    await fse.mkdirs(chunkDir)
  }
  // 原文件名.index - 每个分片的具体地址和名字
  const dPath = path.join(chunkDir, fileNameArr[1])

  // 将分片文件从 temp 中移动到本次上传大文件的临时目录
  await fse.move(file.path, dPath, {
    overwrite: true
  })
  ctx.body = '文件上传成功'
})

// 合并文件
router.post('/merge', async ctx => {
  const {
    name
  } = ctx.request.body
  const fname = name.split('.')[0]

  const chunkDir = path.join(UPLOAD_DIR, fname)
  const chunks = await fse.readdir(chunkDir)

  chunks.sort((a, b) => a - b).map(chunkPath => {
    // 合并文件
    fse.appendFileSync(
      path.join(UPLOAD_DIR, name),
      fse.readFileSync(`${chunkDir}/${chunkPath}`)
    )
  })
  // 删除临时文件夹
  fse.removeSync(chunkDir)
  // 返回文件地址
  ctx.body = {
    msg: '合并成功',
    url: `http://localhost:3000/upload/${name}`
  }
})


// 单文件下载
router.get('/download/:name', async (ctx) => {
  const name = ctx.params.name;
  const path = `temp/${name}`;
  ctx.attachment(path);
  await send(ctx, path);
});

// 批量压缩下载
router.post('/downloadAll', async (ctx) => {
  let {
    files
  } = ctx.request.body
  // 将要打包的文件列表
  // const files = [{name: '1.txt'},{name: '2.txt'}];
  const zipName = '1.zip';
  const zipStream = fs.createWriteStream(zipName);
  const zip = archiver('zip');
  zip.pipe(zipStream);
  for (let i = 0; i < files.length; i++) {
    // 添加单个文件到压缩包
    zip.append(fs.createReadStream(path.resolve(__dirname, `../temp/${files[i].name}`)), {
      name: files[i].name
    })
  }
  await zip.finalize();
  ctx.attachment(zipName);
  await send(ctx, zipName);
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => console.log('Server runnint on port 3000'))