var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    prefix = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    uncss = require('gulp-uncss'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    minifyCSS = require('gulp-cssnano'),
    minifyHTML = require('gulp-minify-html'),
    browserSync = require('browser-sync').create();

// Path Settings ******************************************************

var src = {
    html: './*.html',
    scss: './scss/',
    js: './js/',
    imgs: './imgs/',
    jquery: './bower_components/jquery/dist/jquery.min.js',
    foundJS: './bower_components/foundation-sites/js/',
    foundSCSS: './bower_components/foundation-sites/scss/'
};

var output = {
    html: './../',
    css: './../',
    js: './../js/',
    jsVendor: './../js/vendor',
    imgs: './../imgs/'
};

// Tasks **************************************************************

// Minify HTML and move files to Template Directory
gulp.task('minify-html', function () {
    return gulp.src(src.html)
        .pipe(minifyHTML())
        .pipe(gulp.dest(output.html))
        .pipe(browserSync.stream());
});

// Compile SCSS to CSS and place in Template Directory
gulp.task('sass', function () {
    return gulp.src(src.scss + 'main.scss')
        .pipe(sourcemaps.init())
            .pipe(sass({
                includePaths: [src.foundSCSS]
            }))
            .pipe(uncss({
                html: ['./*.html']
            }))
            .pipe(prefix({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(minifyCSS())
            .pipe(rename('style.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output.css))
        .pipe(browserSync.stream());
});

// Move jQuery to Template Directory
gulp.task('vendorJS', function () {
    return gulp.src(src.jquery)
        .pipe(gulp.dest(output.jsVendor));
});

// Concat and move Foundation JS files to Template directory
gulp.task('foundJS', function () {
    return gulp.src([
        src.foundJS + 'foundation.core.js',
        src.foundJS + 'foundation.dropdown.js',
        src.foundJS + 'foundation.responsiveMenu.js',
        src.foundJS + 'foundation.responsiveToggle.js',
        src.foundJS + 'foundation.reveal.js',
        src.foundJS + 'foundation.slider.js',
        src.foundJS + 'foundation.sticky.js',
        src.foundJS + 'foundation.tabs.js',
        src.foundJS + 'foundation.tooltip.js',
        src.foundJS + 'foundation.util.keyboard.js',
        src.foundJS + 'foundation.util.mediaQuery.js',
        src.foundJS + 'foundation.util.motion.js',
        src.foundJS + 'foundation.util.nest.js',
        src.foundJS + 'foundation.util.timerAndImageLoader.js',
        src.foundJS + 'foundation.util.touch.js',
        src.foundJS + 'foundation.util.triggers.js'
    ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest(output.jsVendor));
});

// Compile JS and move into Template Directory
gulp.task('appJS', ['vendorJS'], function () {
    return gulp.src(src.js + 'app.js')
        .pipe(sourcemaps.init())
            .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output.js))
        .pipe(browserSync.stream());
});

// Optimize images in move to Template Directory
gulp.task('images', function () {
    return gulp.src(src.imgs + '*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(output.imgs));
});

// Watch commands and Browser Sync initialization *********************

gulp.task('watch', ['minify-html', 'sass', 'foundJS', 'appJS', 'images'], function () {
    browserSync.init({
        server: './../'
    });
    gulp.watch(src.html, ['minify-html']);
    gulp.watch(src.scss + '**/*', ['sass']);
    gulp.watch(src.js + 'app.js', ['appJS']);
    gulp.watch(src.imgs + '*', ['images']);
});

// Default Task *******************************************************

gulp.task('default', ['watch']);


// UnCSS Task *********************************************************

gulp.task('uncss', ['sass', 'minify-html'], function () {
    return gulp.src('./../style.css')
        .pipe(uncss({
            html: ['./*.html']
        }))
        .pipe(gulp.dest(output.html + 'uncss'));
});
