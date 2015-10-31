module.exports = function(grunt) {

  grunt.initConfig({

    // Metadata.
    meta: {
      //srcPath: 'public/css/scss',
      //libsPath: 'public/css/libs',
      //buildPath: 'public/css/build',
      //deployPath: 'public/css',
      //themesPath: 'server/views/shop/themes',
      //themesExportPath: 'public/themes',

      css: 'public/css',
      commonCss: 'public/css/common',
      websiteCss: 'public/css/website',
      adminCss: 'public/css/admin',
      themesPath: 'public/themes',

      js: 'public/js',
      adminJS: 'public/js/admin',
      websiteJS: 'public/js/website'
    },

    // Task configuration.      font-awesome.scss
    sass: {
      /*build: {
        options: {
          debug: false,
          cacheLocation: '<%= meta.buildPath %>/.sass-cache/'
        },
        files: {
          '<%= meta.buildPath %>/tmp/foundation.css': ['<%= meta.libsPath %>/foundation/foundation.scss'],
          '<%= meta.buildPath %>/tmp/common.css': ['<%= meta.srcPath %>/common.scss'],
          '<%= meta.buildPath %>/tmp/website.css': ['<%= meta.srcPath %>/website.scss'],
          '<%= meta.buildPath %>/tmp/admin.css': ['<%= meta.srcPath %>/admin.scss'],
          '<%= meta.buildPath %>/tmp/shop-templates/basic.css': ['<%= meta.srcPath %>/shop-templates/basic/basic.scss']
        }
      },
      build4theme: {
        files: {
          '<%= meta.themesExportPath %>/minimalist/global.css': ['<%= meta.themesPath %>/minimalist/css/global.scss']
        }
      },*/
      website: {
        files: {
          '<%= meta.websiteCss %>/website.css': ['<%= meta.websiteCss %>/website.scss'],
          '<%= meta.commonCss %>/common.css': ['<%= meta.commonCss %>/common.scss'],
          '<%= meta.websiteCss %>/libs/foundation/foundation.css': ['<%= meta.websiteCss %>/libs/foundation/foundation.scss'],
        }
      },
      admin: {
        files: {
          '<%= meta.adminCss %>/admin.css': ['<%= meta.adminCss %>/admin.scss'],
          '<%= meta.commonCss %>/common.css': ['<%= meta.commonCss %>/common.scss'],
          '<%= meta.adminCss %>/libs/foundation/foundation.css': ['<%= meta.adminCss %>/libs/foundation/foundation.scss'],
        }
      },
      marciano: {
        files: {
          '<%= meta.themesPath %>/_marciano/css/global.css': ['<%= meta.themesPath %>/_marciano/css/global.scss']
        }
      }
    },

    less:{
      limo: {
        files: {
          "./public/themes/basic/css/styles.css": ["./public/themes/limo/less/styles.less", "./public/themes/basic/css/colors/color-default.less", "./public/themes/basic/css/helper.less"]
        }
      }
    },

    concat: {
      website: {
        src: [
          '<%= meta.websiteCss %>/libs/normalize.css',
          '<%= meta.websiteCss %>/libs/foundation/foundation.css',
          '<%= meta.websiteCss %>/libs/font-awesome/font-awesome.css',
          '<%= meta.commonCss %>/common.css',
          '<%= meta.websiteCss %>/website.css'
        ],
        dest: '<%= meta.websiteCss %>/website.css'
      },
      admin: {
        src: [
          '<%= meta.adminCss %>/libs/normalize.css',
          '<%= meta.adminCss %>/libs/foundation/foundation.css',
          '<%= meta.adminCss %>/libs/font-awesome/font-awesome.css',
          '<%= meta.commonCss %>/common.css',
          '<%= meta.adminCss %>/admin.css'
        ],
        dest: '<%= meta.adminCss %>/admin.css'
      }/*,
      js_admin: {
        src: [
          '<%= meta.js %>/libs/jquery-1.10.2.min.js',
          '<%= meta.js %>/libs/jquery-ui-1.10.3.custom.min.js',
          '<%= meta.js %>/libs/highcharts.js',
          '<%= meta.js %>/libs/modernizr.custom.min.js',
          '<%= meta.js %>/libs/jquery.pjax.js',
          '<%= meta.js %>/custom/helper-actions.js',
          '<%= meta.js %>/custom/helper-forms.js',
          '<%= meta.adminJS %>/dropzone.js',
          '<%= meta.adminJS %>/admin.js',
          '<%= meta.adminJS %>/category.js',
          '<%= meta.adminJS %>/product.js',
          '<%= meta.js %>/custom/pjax.js',
          '<%= meta.js %>/libs/foundation.min.js',
          '<%= meta.js %>/libs/foundation.reveal.js',
          '<%= meta.js %>/libs/foundation.tooltip.js',
          '<%= meta.js %>/libs/foundation.dropdown.js',
          '<%= meta.js %>/custom/states-choices.js',
        ],
        dest: '<%= meta.adminJS %>/admin.min.js'
      }*/
    },

    cssmin: {
      marciano: {
        expand: true,
        cwd: '<%= meta.themesPath %>/_marciano/css/',
        src: ['global.css'],
        dest: '<%= meta.themesPath %>/_marciano/css/',
        ext: '.min.css'
      },
      website: {
        expand: true,
        cwd: '<%= meta.websiteCss %>/',
        src: ['website.css'],
        dest: '<%= meta.websiteCss %>/',
        ext: '.min.css'
      },
      admin: {
        expand: true,
        cwd: '<%= meta.adminCss %>/',
        src: ['admin.css'],
        dest: '<%= meta.adminCss %>/',
        ext: '.min.css'
      }
    },

    uglify: {
      js_admin: {
        files: {
          '<%= meta.adminJS %>/admin.min.js': [
            '<%= meta.js %>/libs/jquery-1.10.2.min.js',
            '<%= meta.js %>/libs/jquery-ui-1.10.3.custom.min.js',
            '<%= meta.js %>/libs/highcharts.js',
            '<%= meta.js %>/libs/modernizr.custom.min.js',
            '<%= meta.js %>/libs/jquery.pjax.js',
            '<%= meta.js %>/custom/helper-actions.js',
            '<%= meta.js %>/custom/helper-forms.js',
            '<%= meta.js %>/libs/foundation.min.js',
            '<%= meta.js %>/libs/foundation.reveal.js',
            '<%= meta.js %>/libs/foundation.tooltip.js',
            '<%= meta.js %>/libs/foundation.dropdown.js',
            '<%= meta.js %>/custom/states-choices.js',
            '<%= meta.adminJS %>/dropzone.js',
            '<%= meta.adminJS %>/admin.js',
            '<%= meta.adminJS %>/category.js',
            '<%= meta.adminJS %>/product.js'
          ]
        }
      },
      marciano: {
        files: {
          '<%= meta.themesPath %>/_marciano/js/marciano.min.js': [
            '<%= meta.themesPath %>/_marciano/js/jquery.min.js',
            '<%= meta.themesPath %>/_marciano/js/bootstrap.min.js',
            '<%= meta.js %>/libs/underscore.js',
            '<%= meta.themesPath %>/common/js/helper-forms.js',
            '<%= meta.themesPath %>/common/js/common.js',
            '<%= meta.themesPath %>/_marciano/js/marciano.js'
          ]
        }
      }
    },

    watch: {
      build_css_website: {
        files: ['<%= meta.websiteCss %>/*.scss'],
        tasks: ['build_css_website']
      },
      build_css_admin: {
        files: ['<%= meta.adminCss %>/*.scss'],
        tasks: ['build_css_admin']
      },
      build_css_marciano: {
        files: ['<%= meta.themesPath %>/_marciano/css/*.scss'],
        tasks: ['build_css_marciano']
      },

      build_js_admin: {
        files: ['<%= meta.adminJS %>/*.js', '!<%= meta.adminJS %>/*.min.js'],
        tasks: ['build_js_admin']
      },
      build_js_marciano: {
        files: ['<%= meta.themesPath %>/common/js/*.js', '<%= meta.themesPath %>/_marciano/js/*.js', '!<%= meta.themesPath %>/**/*.min.js'],
        tasks: ['build_js_marciano']
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task.
  grunt.registerTask('dev', ['watch']);
  //grunt.registerTask('build', ['sass:build', 'sass:build4theme', 'concat', 'cssmin']);

  grunt.registerTask('limo', ['less']);

  // CSS
  grunt.registerTask('build_css_website', ['sass:website', 'concat:website', 'cssmin:website']);
  grunt.registerTask('build_css_admin', ['sass:admin', 'concat:admin', 'cssmin:admin']);

  // JS
  grunt.registerTask('build_js_admin', [/*'concat:js_admin', */'uglify:js_admin']);

  // Themes
  grunt.registerTask('build_css_marciano', ['sass:marciano', 'cssmin:marciano']);
  grunt.registerTask('build_js_marciano', ['uglify:marciano']);

}
