<template>
    <el-card class="result-card">
        <h3>运行结果：</h3>
        <el-scrollbar class="result-scroll">
            <pre class="result-content">{{ result }}</pre>
        </el-scrollbar>
    </el-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        result: {
            type: String as PropType<string>,
            default: '',
        },
    },
});
</script>

<style scoped>
.result-card {
    margin-top: 20px;
}

.result-scroll {
    height: 200px;
}

.result-content {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
}
</style>
