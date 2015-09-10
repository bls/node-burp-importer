
var fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    XmlStream = require('xml-stream');

function BurpImporter(source) {
    this.source = source;
}

util.inherits(BurpImporter, EventEmitter);

function maybeNull(x, replacement) {
    return x === 'null' ? replacement : x;
}

function maybeInt(x) {
    return x === undefined ? x : parseInt(x, 10);
}

function maybeBase64decode(r) {
    if(r.$text === undefined) {
        return new Buffer('');
    }
    if(r.$.base64) {
        return new Buffer(r.$text, 'base64');
    } else {
        return new Buffer(r.$text);
    }
}

function createStartObject(items) {
    return {
        burpVersion: items.$.burpVersion,
        exportTime: items.$.exportTime
    }
}

function createItemObject(item) {
    // Ignores 'comment'
    var req = item.request,
        resp = item.response;
    return {
        url: item.url.$text,
        port: maybeInt(item.port.$text),
        path: item.path.$text,
        method: item.method.$text,
        host: item.host.$text,
        protocol: item.protocol.$text,
        status: maybeInt(item.status.$text),
        time: item.time.$text,
        responselength: maybeInt(item.responselength.$text),
        mimetype: item.mimetype.$text,
        extension: maybeNull(item.extension.$text, ''),
        request: maybeBase64decode(item.request),
        response: maybeBase64decode(item.response)
    };
}

BurpImporter.prototype.import = function() {
    var stream;
    if(typeof this.source === 'string') {
        stream = fs.createReadStream(this.source);
    } else {
        stream = this.source;
    }
    var xml = new XmlStream(stream),
        emit = this.emit.bind(this);

    xml.preserve('items', true);
    xml.collect('item');

    xml.on('startElement: items', function (itemsXml) {
        emit('start', createStartObject(itemsXml));
    });
    xml.on('endElement: item', function(itemXml) {
        var obj = createItemObject(itemXml);
        emit('item', obj);
    });
    xml.on('end', function() {
        emit('end');
    });
};

module.exports = BurpImporter;
