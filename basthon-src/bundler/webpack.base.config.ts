import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
//@ts-ignore
import CreateFileWebpack from "create-file-webpack";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { dependencies } from "../package.json";
import gitRepoInfoModule from "git-repo-info";
import "webpack-dev-server";

const rootPath = path.resolve(__dirname, "..");
const buildPath = path.join(rootPath, "build");
const assetsPath = path.join(buildPath, "assets");
const kernelVersion = dependencies["@basthon/gui-react"];
const gitRepoInfo = gitRepoInfoModule();

// build sys_info variable
const sysInfo = {
  "kernel-version": kernelVersion,
  "commit-hash": gitRepoInfo.sha,
  "commit-date": gitRepoInfo.committerDate,
};

// build version file
const versionFile = new CreateFileWebpack({
  content: JSON.stringify(sysInfo, null, 2),
  fileName: "assets/version",
  path: buildPath,
});

// generate index.html from template src/templates/index.html
const html = new HtmlWebpackPlugin({
  hash: true,
  sys_info: sysInfo,
  template: "./src/templates/index.html",
  filename: `index.html`,
  publicPath: "",
  inject: "head",
  scriptLoading: "defer",
});

// bundle css
const css = new MiniCssExtractPlugin({
  filename: "assets/[name].[contenthash].css",
});

// copies
const copies = new CopyPlugin({
  patterns: [
    {
      // htaccess
      from: "./src/templates/.htaccess",
      to: buildPath,
    },
    {
      from: "examples/**/*",
      to: buildPath,
      toType: "dir",
    },
    {
      from: "api/**/*",
      to: buildPath,
      context: "./notebook/",
      toType: "dir",
    },
    {
      from: "kernelspecs/**/*",
      to: buildPath,
      context: "./notebook/",
      toType: "dir",
    },
    {
      from: "static/**/*",
      to: buildPath,
      context: "./notebook/",
      toType: "dir",
    },
    {
      // Kernel-Python3 files
      from: "**/*",
      context: "./node_modules/@basthon/kernel-python3/lib/dist/",
      to: path.join(assetsPath, kernelVersion, "python3"),
      toType: "dir",
    },
    {
      // reveal.js-chalkboard images
      from: "img/**/*",
      context: "./src/js/nbextensions/rise/reveal.js-chalkboard/",
      to: assetsPath,
      toType: "dir",
    },
    {
      // mathjax
      from: "mathjax/**/*",
      to: assetsPath,
      context: "./node_modules/",
      toType: "dir",
      info: { minimized: true },
      globOptions: {
        ignore: [
          "**/unpacked/**",
          "**/test/**",
          "**/extensions/a11y/mathmaps/*.js",
        ],
      },
    },
  ],
});

const config: Configuration = {
  entry: "./src/ts/main.tsx",
  output: {
    filename: "assets/[name].[contenthash].js",
    chunkFilename: "assets/[name].[contenthash].js",
    assetModuleFilename: "assets/[hash][ext][query]",
    path: buildPath,
    clean: true,
  },
  module: {
    rules: [
      {
        // internationalization
        test: /\.po$/,
        type: "json",
        use: [
          {
            loader: "po-loader?format=jed",
          },
        ],
      },
      // shimming google caja sanitizer since it has globals
      {
        test: /google-caja-sanitizer/,
        loader: "exports-loader",
        options: {
          type: "commonjs",
          exports: ["html", "html4", "sanitizeStylesheet"],
        },
      },
      // shimming requirejs since it is globals
      // this should be completely removed at the end of the
      // webpacking process
      {
        test: /requirejs/,
        loader: "exports-loader",
        options: {
          type: "commonjs",
          exports: ["requirejs", "require", "define"],
        },
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: "asset/resource",
      },
      {
        test: /\.wasm$/i,
        type: "asset/resource",
      },
      {
        // specific rules for rise plugin
        resourceQuery: /path-rise/,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    // uncomment when using yarn link-@basthon to debug multiple react versions (or peerDep) issue
    // alias: {
    //   react: path.resolve(__dirname, "../node_modules/react"),
    //   "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
    // },
    modules: ["src/", "src/ts/", "src/js/", "node_modules/"],
    fallback: {
      vm: require.resolve("vm-browserify"),
      // for ocaml bundle
      constants: require.resolve("constants-browserify"),
      tty: require.resolve("tty-browserify"),
      fs: false,
      child_process: false,
      // for sql bundle
      crypto: require.resolve("crypto-browserify"),
      path: require.resolve("path-browserify"),
      buffer: require.resolve("buffer"),
      stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [html, css, versionFile, copies],
  devServer: {
    allowedHosts: "all",
    static: {
      directory: buildPath,
    },
    devMiddleware: {
      writeToDisk: true,
    },
    compress: true,
    port: 8888,
  },
};

export default config;
