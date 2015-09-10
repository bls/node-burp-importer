# node-burp-importer
Parse burp's XML export files

# Usage

See: [Example](examples/dump-burp-xml.js)

# Bugs

* xml-stream doesn't decode \r\n correctly in CDATA blocks. This 
  means that you must choose "base64 encode requests and responses"
  when you export from burp (this is the default).