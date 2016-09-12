var fs = require("fs");
var fse = require("fs-extra");

var DEFAULT_PARAMS = {
  manifestFile: "../../config/sprockets-manifest.json",
  statsFile: "webpack-stats.json"
};

function WebpackSprocketsRailsManifestPlugin(options) {
  var params = options || {};

  this._manifestFile = params.manifestFile || DEFAULT_PARAMS.manifestFile;
  this._statsFile = params.statsFile || DEFAULT_PARAMS.statsFile;
}

WebpackSprocketsRailsManifestPlugin.prototype.apply = function(compiler) {
  var manifestFile = this._manifestFile;
  var statsFile = this._statsFile;
  var sprockets = {
    files: {},
    assets: {}
  };

  compiler.plugin("done", function(stats) {
    var statsJson = stats.toJson();
    var chunks = statsJson.chunks;
    var webpackContext = compiler.options.context;
    var outputPath = compiler.options.output.path;
    var outputDest = webpackContext + "/" + outputPath;
    var manifestDest = outputDest + "/" + manifestFile;

    chunks.forEach(function(chunk) {
      var bundleName = chunk.names[0];
      var chunkHashFileName = chunk.files[0];
      var logicalPath = bundleName + ".js";
      var chunkDest = outputDest + "/" + chunkHashFileName;
      var mtime = fs.statSync(chunkDest).mtime.toISOString();

      sprockets.assets[logicalPath] = chunkHashFileName;
      sprockets.files[chunkHashFileName] = {
        "logical_path": logicalPath,
        "mtime": mtime,
        "size": chunk.size,
        "digest": chunk.hash,
        // TODO
        // "integrity": "sha256-Zk2O+Q1SFSuzslxNc6LuqFrAN5PlRHlbKeGzXfN4Xmc="
      };
    });

    fse.outputFileSync(manifestDest, JSON.stringify(sprockets, null, "  "));
  });
};

module.exports = WebpackSprocketsRailsManifestPlugin;
