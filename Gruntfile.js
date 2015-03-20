/*global module:false*/
module.exports = function(grunt) {

	require('phantomjs');

	// Project configuration.
	grunt.initConfig({
		// version & ports
		version: '0.4',
		livereloadPort: 35729,

		// paths
		docPath: 'jsdoc/',
		srcPath: 'src/',
		distPath: 'dist/',
		tmpPath: '.tmp/',
		demoPath: 'demo/',
		testPath: 'test/karma/',

		// filenames
		filename: 'gfsdk',
		maxFilename: '<%= distPath %><%= filename %>.js',
		minFilename: '<%= distPath %><%= filename %>.min.js',
		
		// banner
		banner: '/*! GAMIFIVE SDK - v<%= version %> - ' +
			'<%= grunt.template.today("dd-mm-yyyy") %>\n' +
			'* http://gamifive.com/\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
			'Gamifive; Licensed MIT */\n',

		// tasks config
		clean: {
			doc: ['<%= docPath %>'],
			dist: ['<%= distPath %>'],
			tmp: ['<%= tmpPath %>']
		},

		connect: {
			options: {
				hostname: 'localhost',
				livereload: '<%= livereloadPort %>'
			},
			server: {
				options: {
					port: 9001,
					livereload: '<%= livereloadPort %>',
					open: 'http://localhost:9001/<%= demoPath %>',
					base: [
						'.'
					]
				}
			},
			dist: {
				options: {
					port: 9002,
					livereload: '<%= livereloadPort %>',
					open: 'http://localhost:9002/<%= demoPath %>?dist=1',
					base: [
						'.'
					]
				}
			},
			test: {
				options: {
					port: 9003,
					livereload: '<%= livereloadPort %>',
					open: 'http://localhost:9003/<%= testPath %>',
					base: [
						'.'
					]
				}
			}
		},

		watch: {
			options: {
				livereload: '<%= connect.options.livereload %>'
			},
			server: {
				files: [
					'<%= srcPath %>/**/*',
					'<%= demoPath %>/**/*',
					'<%= testPath %>/spec/*.js',
					'<%= testPath %>/mock/*.js' 
				],
				options: {
					livereload: true
				},
				tasks: ['karma:singleRun']			
			},
			dist: {
				files: [
					'<%= demoPath %>/**/*'
				],
				options: {
					livereload: '<%= livereloadPort %>'
				}				
			}
		},

		jsdoc : {
			dist : {
				src: ['<%= srcPath %>*'], 
					options: {
						destination: '<%= docPath %>'
				}
			}
		},
		
		// shell: {
		// 	index: {	
		// 		command: 'cp <%= docPath %>GamefiveSDK.html <%= docPath %>index.html'
		// 	}
		// },

		concat: {
			dist: {
				src: ['<%= srcPath %>*'],
				dest: '<%= maxFilename %>'
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

		qunit: {
			all: {
				options: {
					urls: ['http://localhost:8000/test/all.html']
				}
			}
		},

		karma: {
			options: {
				browsers: ['PhantomJS'],
				frameworks: ['jasmine'],
				files: [
					'<%= srcPath %>/*.js',
					'<%= testPath %>/spec/*.js',
					'<%= testPath %>/mock/*.js' 
				],
				reporters: ['progress', 'coverage'],
				preprocessors: {
					'<%= srcPath %>/*.js': ['coverage']
				},
				coverageReporter: {
					type : 'html',
					dir : '<%= testPath %>/coverage/'
				}
			},
			singleRun: {
				options: {
					singleRun: true,
					autoWatch: false
				}
			},
			background: {
				options: {
					singleRun: false,
					autoWatch: true
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-shell');	
	grunt.loadNpmTasks('grunt-wrap');	
	grunt.loadNpmTasks('grunt-karma');

	// Tasks
	grunt.registerTask('serve', [
		'connect:server',
		// 'connect:test',
		'watch:server'
	]);

	grunt.registerTask('servebuild', [
		'connect:dist',
		'watch:dist'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'clean:doc',
		'jsdoc',
		'concat', 
		'uglify'
	]);

	grunt.registerTask('test', [
		'karma:background'		
	]);



};
