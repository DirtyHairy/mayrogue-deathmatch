module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');

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
        },
        jshint: {
            options: {
                jshintrc: true
            },
            src: ['src/**/*.js', '!src/vendor/**/*.js', 'test/**']
        }
    });

    grunt.registerTask('test', 'run tests', ['jshint', 'mochaTest:nyan']);
    grunt.registerTask('test:debug', 'run tests, debug mode', ['jshint', 'mochaTest:debug']);
};
