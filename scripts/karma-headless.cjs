// Reproducible launcher for hosts where Chrome's GPU process is unavailable.
module.exports = config => config.set({
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
        require('karma-jasmine'), require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'), require('karma-coverage'),
        require('@angular-devkit/build-angular/plugins/karma')
    ],
    reporters: ['progress'],
    customLaunchers: {
        ChromeHeadlessCI: {
            base: 'ChromeHeadless',
            flags: ['--disable-gpu', '--disable-gpu-compositing', '--disable-software-rasterizer']
        }
    }
});
