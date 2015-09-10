
var BurpImporter = require(__dirname + '/../index'),
    util = require('util');

// source below may be stream or filename.
var importer = new BurpImporter(__dirname + '/example1.xml');
importer.on('start', function (info) {
    console.log('Dump: start');
    console.log('  burpVersion: ' + info.burpVersion);
    console.log('  exportTime: ' + info.exportTime);
    console.log('********');
});
importer.on('item', function (item) {
    console.log('  url: ' + item.url);
    console.log('  port: ' + item.port);
    console.log('  path: ' + item.path);
    console.log('  method: ' + item.method);
    console.log('  host: ' + item.host);
    console.log('  protocol: ' + item.protocol);
    console.log('  status: ' + item.status);
    console.log('  time: ' + item.time);
    console.log('  responselength: ' + item.responselength);
    console.log('  mimetype: ' + item.mimetype);
    console.log('  extension: ' + item.extension);
    console.log('  request: ' + item.request.toString().substring(0, 10) + '...');
    console.log('  response: ' + item.response.toString().substring(0, 10) + '...');
    console.log('********');
});
importer.on('end', function () {
    console.log('Dump: end');
});

importer.import();
