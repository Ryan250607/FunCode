import vue from '@vitejs/plugin-vue';

import createAutoImport from './auto-import';
import createComponents from "./components";
import createSvgIcon from './svg-icon';
import createCompression from './compression';
import createSetupExtend from './setup-extend';
import { PluginOption } from 'vite';
import ViteMonacoPlugin from 'vite-plugin-monaco-editor'
export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
    const vitePlugins: PluginOption[] = [vue()];
    vitePlugins.push(createAutoImport());
    vitePlugins.push(createComponents());
    vitePlugins.push(createSetupExtend());
    vitePlugins.push(createSvgIcon(isBuild));
    vitePlugins.push(ViteMonacoPlugin({}));
    isBuild && vitePlugins.push(...createCompression(viteEnv));
    return vitePlugins;
}
