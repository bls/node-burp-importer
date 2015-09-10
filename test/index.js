
var expect = require('chai').expect,
    BurpImporter = require('../index'),
    fs = require('fs'),
    zlib = require('zlib'),
    crypto = require('crypto');

function importAll(source, cb) {
    var importer = new BurpImporter(source),
        allItems = [];
    importer.on('item', function (item) {
        allItems.push(item);
    });
    importer.on('end', function () {
        cb(null, allItems);
    });
    importer.import();
}

function sha256_base64(val) {
    return crypto.createHash('sha256').update(val).digest('base64');
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
    expect(item.request.length).to.be.equal(315);
    expect(sha256_base64(item.request)).to.be.equal('ZnF0SVMJuucluu003TVUrXAo0AmKRdRGXqv8FdAngjU=');
    expect(item.response.length).to.be.equal(0);
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
    expect(item.request.length).to.be.equal(300);
    expect(sha256_base64(item.request)).to.be.equal('JBdjh9b+72Y5urte2Eyd67oz1quGijJjbMqwuRuIzWk=');
    expect(item.response.length).to.be.equal(3475);
    expect(sha256_base64(item.response)).to.be.equal('2hbGntMDGIS+q0w/1/sZMNBa44QlmAOLM9ybJyoMalQ=');
}

describe("BurpImporter", function(){
    describe("import format", function(){
        it("should import base64 encoded request only items", function(done){
            importAll(__dirname + '/no-response.b64.xml', function (err, items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestOnly(items[0]);
                done();
            });
        });
        /*
        it('should error if importing non-base64 encoded data', function(done) {
            expect(function() {
                importAll(__dirname + '/no-response.raw.xml', function (err, items) {
                    expect(err).to.be.not.null;
                    done();
                });
            }).to.throw(Error);
        });
        */
        /*
        it("should import cdata encoded request only items", function(done){
            importAll(__dirname + '/no-response.raw.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestOnly(items[0]);
                expect(items[0].request.length).to.be.equal(313);
                done();
            });
        });
        */
        it("should import base64 encoded request/response items", function(done){
            importAll(__dirname + '/with-response.b64.xml', function (err, items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestResponse(items[0]);
                done();
            });
        });
        /*
        it("should import cdata encoded request/response items", function(done){
            importAll(__dirname + '/with-response.raw.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkItemWithRequestResponse(items[0]);
                done();
            });
        });
        */
        it("should import from a stream", function (done) {
            var filename = __dirname + '/multiple-items.b64.xml.gz';
            var stream = fs.createReadStream(filename).pipe(zlib.createGunzip());
            importAll(stream, function (err, items) {
                expect(items.length).to.be.equal(5);
                done();
            });
        });
    });
});
