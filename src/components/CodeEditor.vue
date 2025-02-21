<!-- <template>
    <el-card>
        <div ref="editorRef" class="code-editor"></div>
    </el-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as monaco from 'monaco-editor';

// 使用 defineProps 来声明 props
const props = defineProps({
    value: {
        type: String,
        default: '',
    },
    language: {
        type: String,
        default: 'javascript',
    },
});

const editorRef = ref<HTMLElement | null>(null);
const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null);

// 初始化编辑器
const initEditor = async () => {
    await nextTick(); // 确保 DOM 已渲染
    if (!editorRef.value || editor.value) return;

    editor.value = monaco.editor.create(editorRef.value, {
        value: props.value,
        language: props.language,
        lineNumbers: 'on',
        theme: 'vs',
        automaticLayout: true,
    });

    // 监听内容变化并触发更新
    editor.value.onDidChangeModelContent(() => {
        const currentValue = editor.value?.getValue() || '';
        props.onChange(currentValue);
    });
};

// 销毁编辑器
const destroyEditor = () => {
    if (editor.value) {
        editor.value.dispose();
        editor.value = null;
    }
};

// 监听 props.value 的变化
watch(
    () => props.value,
    newValue => {
        if (editor.value && newValue !== editor.value.getValue()) {
            editor.value.setValue(newValue);
        }
    }
);

// 生命周期钩子
onMounted(initEditor);
onUnmounted(destroyEditor);

// 提供一个方法获取当前代码
const getCode = () => {
    return editor.value?.getValue() || '';
};
</script>

<style scoped>
.code-editor {
    height: 300px;
    margin-bottom: 20px;
}
</style> -->

<template>
    <div ref="codeEditBox" class="codeEditBox"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { editorProps } from './monacoEditorType';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import * as monaco from 'monaco-editor';

export default defineComponent({
    name: 'monacoEditor',
    props: editorProps,
    emits: ['update:modelValue', 'change', 'editor-mounted'],
    setup(props, { emit }) {
        self.MonacoEnvironment = {
            getWorker(_: string, label: string) {
                if (label === 'json') {
                    return new jsonWorker();
                }
                if (['css', 'scss', 'less'].includes(label)) {
                    return new cssWorker();
                }
                if (['html', 'handlebars', 'razor'].includes(label)) {
                    return new htmlWorker();
                }
                if (['typescript', 'javascript'].includes(label)) {
                    return new tsWorker();
                }
                return new EditorWorker();
            },
        };
        let editor: monaco.editor.IStandaloneCodeEditor;
        const codeEditBox = ref();

        const init = () => {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: false,
            });
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
            });

            editor = monaco.editor.create(codeEditBox.value, {
                value: props.modelValue,
                language: props.language,
                theme: props.theme,
                ...props.options,
            });

            // 监听值的变化
            editor.onDidChangeModelContent(() => {
                const value = editor.getValue(); //给父组件实时返回最新文本
                emit('update:modelValue', value);
                emit('change', value);
            });

            emit('editor-mounted', editor);
        };
        watch(
            () => props.modelValue,
            newValue => {
                if (editor) {
                    const value = editor.getValue();
                    if (newValue !== value) {
                        editor.setValue(newValue);
                    }
                }
            }
        );

        watch(
            () => props.options,
            newValue => {
                editor.updateOptions(newValue);
            },
            { deep: true }
        );

        watch(
            () => props.language,
            newValue => {
                monaco.editor.setModelLanguage(editor.getModel()!, newValue);
            }
        );

        onBeforeUnmount(() => {
            editor.dispose();
        });

        onMounted(() => {
            init();
        });

        return { codeEditBox };
    },
});
</script>

<style lang="scss" scoped>
.codeEditBox {
    width: v-bind(width);
    height: v-bind(height);
}
</style>
