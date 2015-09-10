
var expect = require("chai").expect,
    BurpImporter = require("../index");

function importAll(filename, cb) {
    var importer = new BurpImporter(filename),
        allItems = [];
    importer.on('item', function (item) {
        allItems.push(item);
    });
    importer.on('end', function () {
        cb(allItems);
    });
    importer.import();
}

function checkNoResponse(item) {
    expect(item.url).to.be.equal('http://scripts/libs/jquery-1.5.1.min.js');
    expect(item.port).to.be.equal('80');
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

describe("BurpImporter", function(){
    describe("import format", function(){
        it("should import base64 encoded requests and responses", function(done){
            importAll(__dirname + '/no-response.b64.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkNoResponse(items[0]);
                done();
            });
        });
        it("should import raw encoded requests and responses", function(done){
            importAll(__dirname + '/no-response.b64.xml', function (items) {
                expect(items.length).to.be.equal(1);
                checkNoResponse(items[0]);
                done();
            });
        });

    });
});
