const path = require('path');

module.exports = {
	  target: 'web',
	  // mode:'development',
	  // context: path.resolve(__dirname, '../s',),
	  entry: {
	    index:path.resolve(__dirname, '../src/index.js',)
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
	            use: {
	            	loader: "babel-loader",
	            	options: {
						// configFile:path.resolve(__dirname, "../babel.config.js")
	            	}
	            }
	        }
	    ]
	  }
}