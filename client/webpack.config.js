const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            util: 'util',
            stream: 'stream-browserify',
            crypto: 'crypto-browserify',
            vm: 'vm-browserify',
            
        })
    ]
};