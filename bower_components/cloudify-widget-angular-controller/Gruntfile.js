'use strict';

module.exports = function (grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({


        jshint: {
            main: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files:  {
                    'src':[
                        '*.js'
                    ]
                }
            }
        }


    });



    grunt.registerTask('default', [
        'jshint'
    ]);
};
