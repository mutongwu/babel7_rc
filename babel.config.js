module.exports = function (api) {
  api.cache(false);

  const presets = [["@babel/preset-env", {
  	    "targets": {
			"safari": "8",
			"android": "4.1"
	    },
	    "corejs": "3",
	    "useBuiltIns": "usage",
	    // "useBuiltIns": "entry"
  }]];
  const plugins = [
  	"@babel/plugin-proposal-object-rest-spread",
  	["@babel/plugin-transform-runtime", {
	  	// corejs: 3
	  }]
  ];

  return {
    presets,
    plugins
  };
}