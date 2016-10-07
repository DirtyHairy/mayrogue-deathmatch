module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

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
        },
        browserify: {
            dist: {
                options: {
                    transform: [
                        ["babelify"]
                    ],
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    "./dist/js/mayrogue.js": ["./src/frontend/main.js"]
                }
            }
        },
        copy: {
            main: {
                files: [
                    {src: ['www/index.html'], dest: 'dist/index.html', filter: 'isFile'},
                    {src: ['www/css/style.css'], dest: 'dist/css/style.css', filter: 'isFile'},
                    {src: ['www/img/actors.gif'], dest: 'dist/img/actors.gif', filter: 'isFile'},
                    {src: ['www/img/terrain.gif'], dest: 'dist/img/terrain.gif', filter: 'isFile'},
                    {src: ['goldmine/bower_components/html-bootstrap-assets/css/bootstrap.min.css'], dest: 'dist/css/bootstrap-min.css', filter: 'isFile'},
                    {src: ['goldmine/bower_components/html-bootstrap-assets/js/bootstrap.min.js'], dest: 'dist/js/bootstrap-min.js', filter: 'isFile'},
                    {src: ['goldmine/bower_components/jquery/jquery.min.js'], dest: 'dist/js/jquery-min.js', filter: 'isFile'}
                ],
            },
        },
        watch: {
            scripts: {
                files: ['./src/**/*.js', './web/**/*.*'],
                tasks: ['jshint', 'build', 'copy']
            }
        }
    });

    grunt.registerTask('test', 'run tests', ['jshint', 'mochaTest:nyan']);
    grunt.registerTask('test:debug', 'run tests, debug mode', ['jshint', 'mochaTest:debug']);
    grunt.registerTask('build', 'build it', ['browserify']);
    grunt.registerTask('dist', 'live, the universe and everything', ['build', 'copy']);

    grunt.registerTask('default', 'dist');
};
