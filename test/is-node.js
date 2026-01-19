var tap = require('tap')
var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn

var test = tap.test

test('Should successfully report an error', function(t){
    var testOut = ''
    var expected = '\ntest/error.js\n\r  1) test/error.js\n\n  0 passing (169.786ms)\n  1 failing\n\n  1) test/error.js test/error.js:\n     test/error.js\n  \n\n'

    // Create a child process for tap-mocha-reporter
    var cp = spawn(
        process.argv0,
        [
            require.resolve('../'), 'spec'
        ],
        {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            env: {
                // pretend to be a Continuous Integration server to disable colors
                // in the output string for easier comparison / reporting
                CI: 'testing'
            }
        }
    )

    // pipe TAP output containing an error
    fs.createReadStream(path.join(__dirname, 'support', 'error.tap'))
        .pipe(cp.stdin)

    cp.stderr
        .on('data', function(data){
            console.error(data.toString())
        })

    cp.stdout
        .on('error', function(err){
            t.fail('Error while reading error.tap', err)
            cp.kill()
        })
        .on('data', function(data){
            testOut += data
        })
        .on('end', function(){
            t.equal(testOut, expected, 'Reported the error as expected')
            t.end()
        })
})

test('Should successfully report an error when running in node and global `document` is a mock', function(t){
    var testOut = ''
    var expected = '\ntest/error.js\n\r  1) test/error.js\n\n  0 passing (169.786ms)\n  1 failing\n\n  1) test/error.js test/error.js:\n     test/error.js\n  \n\n'
    
    // Create a child process for tap-mocha-reporter
    var cp = spawn(
        process.argv0,
        [
            '-r', require.resolve('./support/global-document.js'),
            require.resolve('../'), 'spec'
        ],
        {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            env: {
                // pretend to be a Continuous Integration server to disable colors
                // in the output string for easier comparison / reporting
                CI: 'testing'
            }
        }
    )

    // pipe TAP output containing an error
    fs.createReadStream(path.join(__dirname, 'support', 'error.tap'))
        .pipe(cp.stdin)

    cp.stderr
        .on('data', function(data){
            console.error(data.toString())
        })

    cp.stdout
        .on('error', function(err){
            console.error(err);
        })
        .on('data', function(data){
            testOut += data
        })
        .on('end', function(){
            t.equal(testOut, expected, 'Reported the error as expected')
            t.end()
        })
})