import process from 'process';
import path from 'path';

export default {
    stories: "src/renderer/**/*.stories.{jsx,tsx}",
    vitePlugins: [
        () =>
            import('vite-plugin-svg-icons')
                .then(m => m.createSvgIconsPlugin)
                .then(createSvgIconsPlugin => createSvgIconsPlugin({
                    iconDirs: [path.resolve(process.cwd(), 'src/renderer/assets/icons')],
                    symbolId: 'icon-[name]',
                }))
    ],
    resolve: {
        alias: {
            '@': new URL('../src/renderer', import.meta.url).pathname,
        },
    },
};
