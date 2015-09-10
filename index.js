
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
        return new Buffer(0);
    }
    if(r.$.base64 === 'true') {
        var result = new Buffer(new Buffer(r.$text, 'base64'));
    } else {
        throw Error(); // Not reached
    }
    return result;
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
        if(itemXml.request.$.base64 !== 'true') {
            // The xml-stream module doesn't decode \r\n in CDATA blocks
            // correctly. This means that decoding non-base64'd requests and
            // responses doesn't work :(
            // var result = new Buffer(r.$text, 'utf-8');
            emit('error', new Error('Use base64 option when exporting from burp!'));
        }
        var obj = createItemObject(itemXml);
        emit('item', obj);
    });
    xml.on('end', function() {
        emit('end');
    });
};

module.exports = BurpImporter;
