module.exports = {
    entry: "./entry.js",
    output: {
        filename: "bundle.js",
        path: "./build"
    },
    module: {
        loaders: [
            {
                test: /\.font\.js$/,
                loader: "style!css!"+require.resolve("../")
            },{
                test: /\.(woff|eot|ttf|svg)$/,
                loader: "url"
            }
        ]
    }
}
