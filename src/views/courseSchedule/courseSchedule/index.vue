<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入课程"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
        <el-input
          v-model="queryParams.teacherId"
          placeholder="请输入教师"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="教室" prop="classroom">
        <el-input
          v-model="queryParams.classroom"
          placeholder="请输入教室"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker clearable
          v-model="queryParams.startTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker clearable
          v-model="queryParams.endTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['courseSchedule:courseSchedule:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['courseSchedule:courseSchedule:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['courseSchedule:courseSchedule:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['courseSchedule:courseSchedule:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="courseScheduleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id"  width="70" type="index"/>
      <el-table-column label="课程" align="center">
        <template #default="scope">
          <span>{{ getCourseNameById(scope.row.courseId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="教师" align="center">
        <template #default="scope">
          <span>{{ getTeacherNameById(scope.row.teacherId) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="教室" align="center" prop="classroom" />
      <el-table-column label="星期" align="center" prop="dayOfWeek">
        <template #default="scope">
          <span>{{ getDayOfWeekLabel(scope.row.dayOfWeek) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" align="center" prop="details" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['courseSchedule:courseSchedule:edit']"></el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['courseSchedule:courseSchedule:remove']"></el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改课程安排对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="courseScheduleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择课程" >
            <el-option
                v-for="item in courseOptions"
                :key="item.id"
                :label="item.courseName"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择教师" >
            <el-option
                v-for="item in teacherOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教室" prop="classroom">
          <el-input v-model="form.classroom" placeholder="请输入教室" />
        </el-form-item>
        <el-form-item label="星期" prop="dayOfWeek">
          <el-select v-model="form.dayOfWeek" placeholder="请选择星期">
            <el-option
                v-for="item in dayOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="详情" prop="details">
          <el-input v-model="form.details" placeholder="请输入详情" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CourseSchedule">
import { listCourseSchedule, getCourseSchedule, delCourseSchedule, addCourseSchedule, updateCourseSchedule } from "@/api/courseSchedule/courseSchedule";
import {getUser, listUser} from "@/api/system/user.js";
import {listCourse} from "@/api/course/course.js";
const { proxy } = getCurrentInstance();

const courseScheduleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseId: null,
    teacherId: null,
    classroom: null,
    startTime: null,
    endTime: null,
  },
  rules: {
  }
});
// 定义“星期”选项
const dayOptions = ref([
  { label: '星期一', value: 1 },
  { label: '星期二', value: 2 },
  { label: '星期三', value: 3 },
  { label: '星期四', value: 4 },
  { label: '星期五', value: 5 },
  { label: '星期六', value: 6 },
  { label: '星期日', value: 7 },
]);

const { queryParams, form, rules } = toRefs(data);
//新增一个响应式变量来存储课程选项
const courseOptions = ref([]);

// 在组件挂载时加载课程列表
onMounted(() => {
  loadCourseOptions();
});

// 加载课程选项
function loadCourseOptions() {
  listCourse().then(response => {
    if (response.code === 200) {
      courseOptions.value = response.rows; // 将课程数据赋值给 courseOptions
    } else {
      console.error('Failed to fetch course list:', response.msg);
    }
  }).catch(error => {
    console.error('Error fetching course list:', error);
  });
}
//新增一个响应式变量存储教师选项
const teacherOptions = ref([]);
//在组件挂载时加载教师选项
onMounted(() => {
  loadTeacherOptions();
});
//加载教师选项
function loadTeacherOptions() {
  listUser().then(response => {
    if (response.code === 200) {
      teacherOptions.value = response.rows; // 将教师数据赋值给 teacherOptions
    } else {
      console.error('Failed to fetch teacher list:', response.msg);
    }
  }).catch(error => {
    console.error('Error fetching teacher list:', error);
  });
}
// 映射星期数字到中文
function getDayOfWeekLabel(dayOfWeek) {
  const dayMap = {
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
    7: '星期天'  // 可以根据需要改为 "星期日"
  };
  return dayMap[dayOfWeek] || ''; // 如果没有对应的值，则返回空字符串
}
// 根据 courseId 获取课程名称
function getCourseNameById(courseId) {
  const course = courseOptions.value.find(item => item.id === courseId);
  return course ? course.courseName : '未知课程';
}
// 根据 teacherId 获取教师姓名
function getTeacherNameById(teacherId){
  const teacher = teacherOptions.value.find(item => item.userId === teacherId);
  return teacher ? teacher.userName : '未知教师';
}


/** 查询课程安排列表 */
function getList() {
  loading.value = true;
  listCourseSchedule(queryParams.value).then(response => {
    courseScheduleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    courseId: null,
    teacherId: null,
    classroom: null,
    dayOfWeek: null,
    startTime: null,
    endTime: null,
    details: null
  };
  proxy.resetForm("courseScheduleRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加课程安排";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCourseSchedule(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程安排";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["courseScheduleRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCourseSchedule(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCourseSchedule(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除课程安排编号为"' + _ids + '"的数据项？').then(function() {
    return delCourseSchedule(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('courseSchedule/courseSchedule/export', {
    ...queryParams.value
  }, `courseSchedule_${new Date().getTime()}.xlsx`)
}

//启动查询信息
listCourse();
listUser();
getList();
</script>
