<template>
    <div class="app-container">
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
      >
        <el-form-item label="章节标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入章节标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" size="mini" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Edit"
            size="mini"
            :disabled="single"
            @click.stop="handleUpdate"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            size="mini"
            :disabled="multiple"
            @click.stop="handleDelete"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="Download" size="mini" @click="handleExport">导出</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
  
      <el-table
        v-loading="loading"
        :data="chaptersList"
        @selection-change="handleSelectionChange"
        @row-click="viewChapterDetail"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="章节标题" align="center" prop="title" />
        <el-table-column label="章节描述" align="center" prop="description" />
        <el-table-column label="章节排序" align="center" prop="chaptersOrder" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button size="mini" type="text" icon="Edit" @click.stop="handleUpdate(scope.row)">修改</el-button>
            <el-button size="mini" type="text" icon="Delete" @click.stop="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
  
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="课程id" prop="courseId" hidden>
            <el-input v-model="form.courseId" placeholder="请输入课程id" />
          </el-form-item>
          <el-form-item label="章节标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入章节标题" />
          </el-form-item>
          <el-form-item label="章节描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="章节排序" prop="chaptersOrder">
            <el-input v-model="form.chaptersOrder" placeholder="请输入章节排序" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确定</el-button>
            <el-button @click="cancel">取消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeMount } from 'vue'
  import { ElMessageBox, ElMessage, FormInstance } from 'element-plus'
  import { useRoute, useRouter } from 'vue-router'
  import {
    listChapters,
    getChapters,
    delChapters,
    addChapters,
    updateChapters,
  } from '@/api/funcode/chapters'
  
  // 类型定义
  interface Chapter {
    id?: number
    courseId?: string | number
    title?: string
    description?: string
    chaptersOrder?: number
    createdAt?: string
    updatedAt?: string
  }
  
  interface QueryParams {
    pageNum: number
    pageSize: number
    courseId?: string | number
    title?: string | null
    description?: string | null
  }
  
  // 响应式数据
  const loading = ref(true)
  const ids = ref<number[]>([])
  const single = ref(true)
  const multiple = ref(true)
  const showSearch = ref(true)
  const total = ref(0)
  const chaptersList = ref<Chapter[]>([])
  const title = ref('')
  const open = ref(false)
  const route = useRoute()
  const router = useRouter()
  const courseId = ref(route.query.id)
  const queryParams = ref<QueryParams>({
    pageNum: 1,
    pageSize: 10,
    courseId: route.query.id,
    title: null,
    description: null,
  })
  const form = ref<Chapter>({
    courseId: courseId.value, // 初始化时赋值
  })
  const formRef = ref<FormInstance | null>(null)
  
  // 表单校验规则
  const rules = ref({
    title: [{ required: true, message: '章节标题不能为空', trigger: 'blur' }],
    chaptersOrder: [{ required: true, message: '章节排序不能为空', trigger: 'blur' }],
  })
  
  // 方法
  const viewChapterDetail = (chapter: Chapter) => {
    router.push({
      path: '/courses/chapters/video',
      query: { chapterId: chapter.id?.toString() },
    })
  }
  
  const getList = async () => {
    try {
      loading.value = true
      const response = await listChapters(queryParams.value)
      chaptersList.value = response.rows
      total.value = response.total
    } catch (error) {
      ElMessage.error('数据加载失败')
    } finally {
      loading.value = false
    }
  }
  
  const cancel = () => {
    open.value = false
    reset()
  }
  
  const reset = () => {
    form.value = {
      id: undefined,
      title: undefined,
      courseId: courseId.value, // 保持 courseId 不变
      description: undefined,
      chaptersOrder: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
    formRef.value?.resetFields()
  }
  
  const handleQuery = () => {
    queryParams.value.pageNum = 1
    getList()
  }
  
  const resetQuery = () => {
    queryParams.value = {
      pageNum: 1,
      pageSize: 10,
      courseId: courseId.value,
      title: null,
      description: null,
    }
    handleQuery()
  }
  
  const handleSelectionChange = (selection: Chapter[]) => {
    ids.value = selection.map((item) => item.id!)
    single.value = selection.length !== 1
    multiple.value = selection.length === 0
  }
  
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加章节'
  }
  
  const handleUpdate = async (row?: Chapter) => {
    reset()
    const id = row?.id || ids.value[0]
    try {
      const response = await getChapters(id)
      form.value = response.data
      open.value = true
      title.value = '修改章节'
    } catch (error) {
      ElMessage.error('获取章节详情失败')
    }
  }
  
  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      if (form.value.id) {
        await updateChapters(form.value)
        ElMessage.success('修改成功')
      } else {
        await addChapters(form.value)
        ElMessage.success('新增成功')
      }
      open.value = false
      getList()
    } catch (error) {
      ElMessage.error('提交失败')
    }
  }
  
  const handleDelete = async (row?: Chapter) => {
    const deleteIds = row?.id ? [row.id] : ids.value
    try {
      await ElMessageBox.confirm(`是否确认删除章节编号为"${deleteIds}"的数据项？`, '警告', {
        type: 'warning',
      })
      await delChapters(deleteIds)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      if (error !== 'cancel') ElMessage.error('删除失败')
    }
  }
  
  const handleExport = () => {
    const url = `/system/chapters/export?${new URLSearchParams(queryParams.value as any).toString()}`
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `chapters_${new Date().getTime()}.xlsx`
        link.click()
      })
  }
  
  // 初始化
  onBeforeMount(() => {
    form.value.courseId = courseId.value
  })
  
  onMounted(() => {
    getList()
  })
  </script>