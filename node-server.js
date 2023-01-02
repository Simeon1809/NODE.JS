const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const logEvents = require('./middleware/logEvents');
const EventEmitter = require('events');
class MyEmitter extends EventEmitter{ };
// initialixe object
const MyEmitter = new MyEmitter();
myEmitter.on('log', (msg, fileName)=> logEvents(msg, fileName));
const PORT = process.env.PORT || 3300;

const serverFile = async (filePath, contentType, response) =>{
    try {
        const rawData = await fsPromises.readFile(
            filePath,
            !contentType.includes('image') ? 'utf8' : ''
        );
        const data = contentType === 'application/json'
            ? JSON.parse(rawData) : rawData;
        response.writeHead(
             filePath.includes('404.html') ? 404 : 200, 
            {'Content-Type': contentType});
        response.end(
            contentType ==='application/json' ? JSON.stringify(data) : data
        )
    } catch (err){
        myEmitter.emit('log', `${err.name}\t${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
}
const server = http.createServer((req , res) =>{
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

    const extension = path.extname(req.url);
    let contentType;

    switch(extension){
      case '.css':
            contentType = 'text/css';
            break;
      case '.txt':
            contentType = 'text/plain';
            break;
      case '.js':
            contentType = 'text/javascript';
            break;
      case '.json':
            contentType = 'application/json';
            break;
      case '.jpeg':
            contentType = 'image/jpeg';
            break;
      case '.png':
            contentType = 'image/png';
            break;
      default:
            contentType = 'text/html';
            break;

    }

    let filePath =
     contentType === 'text/html' && req.url ==='/'
        ? path.join(__dirname, 'views', 'index.html')
        : contentType === 'text/html' && req.url.slice(-1) === '/'
            ? path.join(__dirname, 'views', req.url, 'index.html')
            : contentType === 'text.html'
               ? path.join(__dirname, 'views', req.url)
                : path.join(__dirname, req.url)
    if(!extension && req.url.slice(-1) !== '/')  filePath += '.html';

    const fileExists = fs.existsSync(filePath)
    if(fileExists){
        serverFile(filePath, contentType,res);
    }else{
        switch (path.parse(filePath).base){
            case 'old-page.html':
                res.writeHead(301, {'Location': '/new-page.html'});
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, {'Location': '/'});
                res.end();
                break;
            default:
                serverFile(path.join(__dirname,'views', '404.html'), 'text/html', res);
        }
    }
})

server.listen(PORT, () => {
    `Server running on port ${PORT}`
})
