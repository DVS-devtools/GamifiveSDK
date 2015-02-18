/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // version
    version: '0.3',

    // paths
    docPath: 'jsdoc/',
    srcPath: 'src/',
    distPath: 'dist/',

    filename: 'gfsdk',
    maxFilename: '<%= distPath %><%= filename %>-<%= version %>.js',
    minFilename: '<%= distPath %><%= filename %>-<%= version %>.min.js',
    
    // pkg: grunt.file.readJSON('package.json'),
    banner: '/*! GAMIFIVE SDK - v<%= version %> - ' +
      '<%= grunt.template.today("dd-mm-yyyy") %>\n' +
      '* http://gamifive.com/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'Gamifive; Licensed MIT */\n',
    
    shell: {
      index: {  
          command: 'cp <%= docPath %>GamefiveSDK.html <%= docPath %>index.html'
      }
    },
    jsdoc : {
        dist : {
            src: ['<%= srcPath %>gfsdk.js'], 
            options: {
                destination: 'jsdoc'
            }
        }
    },
    qunit: {
      all: {
        options: {
          urls: ['http://localhost:8000/test/all.html']
        }
      }
    },
    wrap: {
      basic: {
        src: ['<%= maxFilename %>'],
        dest: '<%= maxFilename %>',
        options: {
          wrapper: ['(function(target) {\n', '\n target.GamefiveSDK = new GamefiveSDK(); \n})(window);']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: true
      },
      dist: {
        src: '<%= maxFilename %>',
        dest: '<%= minFilename %>'
      }
    },
    concat: {
      dist: {
        src: ['<%= srcPath %>*'],
        dest: '<%= maxFilename %>'
      }
    },
    jshint: {
      options: { curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, sub: true, undef: true, unused: true, boss: true, eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
    },
    clean: {
      jsdoc: ['<%= docPath %>'],
      dist: ['<%= distPath %>']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task.
  grunt.registerTask('build', ['clean','jsdoc','shell:index','concat', 'wrap', 'uglify']);
  grunt.registerTask('test', ['concat', 'wrap', 'qunit']);


};
