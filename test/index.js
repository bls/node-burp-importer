
var expect = require('chai').expect,
    BurpImporter = require('../index'),
    fs = require('fs'),
    zlib = require('zlib');

function importAll(source, cb) {
    var importer = new BurpImporter(source),
        allItems = [];
    importer.on('item', function (item) {
        allItems.push(item);
    });
    importer.on('end', function () {
        cb(allItems);
    });
    importer.import();
}

function checkItemWithRequestOnly(item) {
    expect(item.url).to.be.equal('http://scripts/libs/jquery-1.5.1.min.js');
    expect(item.port).to.be.equal(80);
    expect(item.path).to.be.equal('/libs/jquery-1.5.1.min.js');
    expect(item.method).to.be.equal('GET');
    expect(item.host).to.be.equal('scripts');
    expect(item.protocol).to.be.equal('http');
    expect(item.status).to.be.undefined;
    expect(item.time).to.be.equal('Mon Sep 07 14:54:39 AEST 2015');
    expect(item.responselength).to.be.undefined;
    expect(item.mimetype).to.be.undefined;
    expect(item.extension).to.be.equal('js');
    // request
    // response
}

function checkItemWithRequestResponse(item) {
    expect(item.url).to.be.equal('https://doesnotexist.com/');
    expect(item.port).to.be.equal(443);
    expect(item.path).to.be.equal('/');
    expect(item.method).to.be.equal('GET');
    expect(item.host).to.be.equal('doesnotexist.com');
    expect(item.protocol).to.be.equal('https');
    expect(item.status).to.be.equal(503);
    expect(item.time).to.be.equal('Thu Sep 10 13:00:18 AEST 2015');
    expect(item.responselength).to.be.equal(3475);
    expect(item.mimetype).to.be.equal('HTML');
    expect(item.extension).to.be.equal('');
    // request
    // response
}

describe("BurpImporter", function(){
    describe("import format", function(){
        it("should import base64 encoded request only items", function(done){
            importAll(__dirname + '/no-response.b64.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestOnly(items[0]);
                done();
            });
        });
        it("should import cdata encoded request only items", function(done){
            importAll(__dirname + '/no-response.raw.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestOnly(items[0]);
                done();
            });
        });
        it("should import base64 encoded request/response items", function(done){
            importAll(__dirname + '/with-response.b64.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestResponse(items[0]);
                done();
            });
        });
        it("should import cdata encoded request/response items", function(done){
            importAll(__dirname + '/with-response.raw.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestResponse(items[0]);
                done();
            });
        });
        it("should import from a stream", function (done) {
            var filename = __dirname + '/multiple-items.b64.xml.gz';
            var stream = fs.createReadStream(filename).pipe(zlib.createGunzip());
            importAll(stream, function (items) {
                expect(items.length).to.be.equal(5);
                done();
            });
        });
    });
});
