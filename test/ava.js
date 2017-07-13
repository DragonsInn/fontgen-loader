var test = require('ava');
var glob = require('glob').sync;
var hashFiles = require('../utils').hashFiles;

test('check consistency of files hash', function (t) {
    var filesArr = [glob("./test/octicons/svg/*.svg"), glob("./test/octicon2/**/svg/**/*.svg")];
    var expected = ['c0086ac1f7b371a3c931172dc3be8f45', '12db3c6977866da37215ab1a31c6bbe5']; 
    
    t.plan(2);
    
    filesArr.forEach(function(files, i) {
        t.is(hashFiles(files), expected[i]);
    });
});