/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
        // Metadata.
    meta: {
      version: '0.2'
    },
    filename: 'gfsdk',
    buildFilename: 'dist/<%= filename %>-<%= meta.version %>.js',
    minFilename: 'dist/<%= filename %>-<%= meta.version %>.min.js',
    docPath: 'manual/',
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! GAMIFIVE SDK - v<%= meta.version %> - ' +
      '<%= grunt.template.today("dd-mm-yyyy") %>\n' +
      '* http://gamifive.com/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'Gamifive; Licensed MIT */\n',
    shell: {
      jsdoc: {
          command: './node_modules/jsdoc/jsdoc.js ./src/gfsdk.js -d <%= docPath %>'
      },
      index: {  
          command: 'rm <%= docPath %>index.html'
      }
    },
    wrap: {
      basic: {
        src: ['<%= buildFilename %>'],
        dest: '<%= buildFilename %>',
        options: {
          wrapper: ['(function(target) {\n', '\n})(window);']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= buildFilename %>',
        dest: '<%= minFilename %>'
      }
    },
    concat: {
      dist: {
        src: ['src/FB.js','src/gfsdk.js'],
        dest: '<%= buildFilename %>'
      }
    },
    jshint: {
      options: { curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, sub: true, undef: true, unused: true, boss: true, eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-jsdoc');

  // Default task.
  grunt.registerTask('build', ['shell:jsdoc', 'shell:index','concat', 'wrap', 'uglify']);


};