'use strict';

module.exports = function (grunt) {

    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // clean directories
        clean: {
            dist: ["dist"]
        },

        // validate the code
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'src/*.js'
                ]
            }
        },
        //===

        // compile angular templates
        ngtemplates: {
            dist: {
                options: {
                    module: 'blueprintingCatalogWidget',
                    htmlmin: {
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        collapseBooleanAttributes: true,
                        removeCommentsFromCDATA: true
                    },
                    append: true
                },
                cwd: 'src',
                src: ['*.html'],

                dest: 'dist/blueprinting_catalog_widget.js'
            }
        },
        //===

        // copy files to dist folder
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'src',
                    dest: 'dist',
                    src: [
                        '*.js',
                        '*.css'
                    ]
                }]
            }
        },
        //===

        // minify css files
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist',
                    ext: '.min.css'
                }]
            }
        },
        //===

        //minify js files
        uglify: {
            dist: {
                files: {
                    'dist/blueprinting_catalog_app.min.js': ['dist/blueprinting_catalog_app.js'],
                    'dist/blueprinting_catalog_widget.min.js': ['dist/blueprinting_catalog_widget.js']
                }
            }
        },
        //===

        // add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 3 versions', 'ie 9']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/css/',
                    src: '*.css',
                    dest: 'src/assets/css/'
                }]
            }
        },
        //===

        // show success notification after build
        notify: {
            build: {
                options: {
                    message: 'build completed'
                }
            }
        }
        //===
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-notify');

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'copy',
        'ngtemplates',
        'autoprefixer',
        'cssmin',
        'uglify',
        'notify:build'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
