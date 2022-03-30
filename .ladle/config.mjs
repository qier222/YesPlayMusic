export default {
    stories: "src/renderer/**/*.stories.{jsx,tsx}",
    resolve: {
        alias: {
            '@': new URL('../src/renderer', import.meta.url).pathname,
        },
    },
};
