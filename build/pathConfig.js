const path = require('path');

module.exports = {
    srcPath: path.resolve(__dirname, '../src'),
    indexPath: path.resolve(__dirname, '../src/index.js'),
    publicPath: path.resolve(__dirname, '../src/public/index.html'),
    distPath: path.resolve(__dirname, '../dist'),
    imgPath: path.resolve(__dirname, '../dist/imgs'),
}
