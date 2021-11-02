/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    packageOptions: {
        polyfillNode: true,
    },
    optimize: {
        bundle: true,
        minify: true,
        target: 'es2018',
    },
    plugins: ['@snowpack/plugin-sass'],
};
