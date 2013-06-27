module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: {
          "./index.html": ["./dev/*.jade"]
        }
      }
    },
    coffee:{
      options:{
        bare: true
      },
      glob_to_multiple: {
        expand: true,
        flatten: true,
        cwd: './dev/coffee/',
        src: ['*.coffee'],
        dest: './dev/script/',
        ext: '.js'
      }
    },
    compass: {
      dist: {
        options: {
          config: './config.rb'
        }
      }
    },
    uglify: {
      my_target: {
        options:{
          beautify: true
        },
        files: {
          './script/app.js': ['./dev/script/helper*.js','./dev/script/app*.js']
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          './style/app_layout.css': ['./dev/style/app_layout.*.css'],
          './style/app_style.css': ['./dev/style/app_style.*.css']
        }
      }
    },
    watch: {
      files: ['**/*.jade','**/*.coffee','**/*.sass'],
      tasks: ['jade','coffee','compass','uglify']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jade','coffee','compass','uglify','cssmin','watch']);

};
