const path = require('path');
const webpack = require('webpack')

module.exports = {
	  target: 'web',
	  // mode:'development',
	  entry: {
	    index:'./src/index.js',
	  },
	  output:{
	  	    filename: '[name].js',
		    path: path.resolve(__dirname, 'dist')
	  },
	  module: {
	    rules: [
	        {
	            test: /\.js|jsx$/,
	            exclude: /node_modules/,
	            use: [
	                "babel-loader"
	            ],
	        }
	    ]
	  },
	  plugins:[
	  	// new webpack.optimize.UglifyJsPlugin()
	  ]
}