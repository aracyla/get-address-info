var autoprefixer = require('autoprefixer'),
postcss = require('gulp-postcss'),
postcss_simpleVars = require('postcss-simple-vars'),
postcss_nested = require('postcss-nested'),
postcss_import = require('postcss-import'),
postcss_mixins = require('postcss-mixins'),
gulp_watch = require('gulp-watch'),
gulp = require('gulp'),
browser_sync = require('browser-sync').create();

gulp.task("watch", function() {
    /*
    browser_sync.init({
        server: {
            baseDir: "public",
            index: "pinger.html"
        }
    });*/

    gulp_watch("./public/assets/styles/**/*.css" , function(){
        //gulp.start("css-inject");
        gulp.start("styles");
    });

    gulp_watch("./public/pinger.html", function() {
        browser_sync.reload();
    });
});

gulp.task("css-inject", ["styles"], function() {
    return gulp.src("./public/temp/styles/style.css")
        .pipe(browser_sync.stream());
});

gulp.task("styles", function() {
    console.log("Watching stylesheets...");

    return gulp.src("./public/assets/styles/style.css")
        .pipe(postcss([postcss_import, postcss_mixins, postcss_simpleVars, postcss_nested, autoprefixer]))
        .on("error", function(errorInfo){
            console.log(errorInfo.toString());
            this.emit("end");
        })
        .pipe(gulp.dest("./public/temp/styles"));
});
