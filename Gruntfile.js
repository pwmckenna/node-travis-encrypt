'use strict';
module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '**/*.js',
                '!node_modules/**/*'
            ]
        }
    });

    // Default task.
    grunt.registerTask('default', 'jshint');
};
