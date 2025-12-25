import { Configuration } from "webpack";
import { merge } from "webpack-merge";
import base from "./webpack.base.config";

const config: Configuration = merge(base, {
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
});

export default config;
