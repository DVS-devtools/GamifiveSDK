/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// version
		version: '0.4',

		// paths
		docPath: 'jsdoc/',
		srcPath: 'src/',
		distPath: 'dist/',
		tmpPath: '.tmp/',
		demoPath: 'demo/',

		// filenames
		filename: 'gfsdk',
		maxFilename: '<%= distPath %><%= filename %>-<%= version %>.js',
		minFilename: '<%= distPath %><%= filename %>-<%= version %>.min.js',
		
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
				port: 9000,
				hostname: 'localhost',
				livereload: 35729
			},
			server: {
				options: {
					open: 'http://localhost:9000/<%= demoPath %>',
					base: [
						'.'
					]
				}
			},
			dist: {
				options: {
					open: 'http://localhost:9000/<%= demoPath %>?dist=1',
					base: [
						'.'
					]
				}
			}
		},

		watch: {
			livereload: {
				files: [
					'<%= srcPath %>/**/*',
					'<%= demoPath %>/**/*'
				],
				options: {
					livereload: '<%= connect.options.livereload %>'
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

	// Tasks
	grunt.registerTask('serve', [
		'connect:server',
		'watch'
	]);

	grunt.registerTask('servebuild', [
		'connect:dist',
		'watch'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'clean:doc',
		'jsdoc',
		// 'shell:index',
		'concat', 
		// 'wrap', 
		'uglify'
	]);

	grunt.registerTask('test', [
		'concat', 
		'wrap', 
		'qunit'
	]);


};
