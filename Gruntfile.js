module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        mochaTest: {
            options: {
                require: 'babel-register'
            },
            nyan: {
                options: {
                    reporter: 'nyan',
                    ui: 'tdd'
                },
                src: 'test/**/*.js'
            },
            debug: {
                options: {
                    reporter: 'spec',
                    ui: 'tdd',
                    bail: true
                },
                src: 'test/**/*.js'
            }
        }
    });

    grunt.registerTask('test', 'run tests', 'mochaTest:nyan');
    grunt.registerTask('test:debug', 'run tests, debug mode', 'mochaTest:debug');
};
