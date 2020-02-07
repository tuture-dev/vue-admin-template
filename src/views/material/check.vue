<template>
  <div class="root">
    <div class="search">
      <el-input placeholder="请输入素材名称" v-model="keyword" clearable class="input-with-select">
        <el-button @click="searchByKeyword" slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>
    <div class="my-flex">
      <el-date-picker
        class="search-by-time"
        v-model="searchTime"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"
      ></el-date-picker>

      <el-button @click="searchByTime" class="my-btn" type="primary">开始搜索</el-button>
    </div>

    <el-table
      :data="tableData"
      style="width: 100%"
      :default-sort="{prop: 'createDate', order: 'descending'}"
    >
      <el-table-column prop="name" label="素材名称" show-overflow-tooltip></el-table-column>
      <el-table-column label="上传日期" prop="createDate" sortable></el-table-column>
      <el-table-column prop="img_url" label="素材预览">
        <div slot-scope="scope" class="my-pic">
          <el-image
            @click="imgClick(scope.row.imgUrl)"
            fit="scale-down"
            style="width: 120px; height: 120px"
            :src="scope.row.imgUrl"
            :preview-src-list="srcList"
          ></el-image>
        </div>
      </el-table-column>
      <el-table-column label="操作">
        <div slot-scope="scope">
          <el-button @click="deleteMaterial(scope.row.id)" size="small" type="danger" round>删除</el-button>
          <el-button
            @click="downloadFile(scope.row.name,scope.row.imgUrl)"
            size="small"
            type="primary"
            round
          >下载</el-button>
        </div>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="pageChange"
      @prev-click="pageChange"
      @next-click="pageChange"
    ></el-pagination>
    <el-upload class="upload template" action="http://219.228.76.43:8886/admin/upload" :headers="headers" :on-success="uploadSuccess">
      <el-button size="small" type="primary">上传素材</el-button>
      <div slot="tip" class="el-upload__tip">建议: jpg文件 分辨率1920*1080</div>
    </el-upload>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageSize: 6,
      total: 6, // task总数
      srcList: [],
      tableData: [],
      keyword: "",
      headers: {
        token: localStorage.getItem("token")
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近五天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 5);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      searchTime: ""
    };
  },
  created: function() {
    this.getMaterialList();
  },
  methods: {
    imgClick(imgUrl) {
      this.srcList = [imgUrl];
    },

    getMaterialList(page = 1, limit = 6) {
      let that = this;
      this.req({
        url: `getMaterialList?page=${page}&limit=${limit}`,
        data: {},
        method: "GET"
      }).then(
        res => {
          console.log("res :", res);
          that.total = res.data.total;
          let tableData = res.data.data;
          for (let i = 0; i < tableData.length; i++) {
            tableData[i].createDate = that.getTime(tableData[i].createDate);
          }
          that.tableData = tableData;
        },
        err => {
          console.log("err :", err);
        }
      );
    },
    deleteMaterial(id) {
      let that = this;
      this.$confirm("此操作将删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          that
            .req({
              url: "deleteMaterial?id=" + id,
              data: {},
              method: "GET"
            })
            .then(
              res => {
                console.log("res :", res);
                that.getMaterialList();
                that.$message("删除成功~");
              },
              err => {
                console.log("err :", err);
              }
            );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    uploadSuccess(response, file, fileList) {
      let that = this;
      console.log(":", response);
      this.$message("上传成功~");
      this.$prompt("请输入素材名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          that
            .req({
              url: "addMaterial",
              data: {
                name: value,
                imgUrl: response.data,
                createDate: new Date().getTime()
              },
              method: "POST"
            })
            .then(
              res => {
                console.log("res :", res);
                that.getMaterialList();
              },
              err => {
                console.log("err :", err);
              }
            );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消上传"
          });
        });
    },
    getTime(timestamp) {
      let that = this;
      timestamp = parseInt(timestamp);
      var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      let Y = date.getFullYear() + "-";
      let M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      let D = that.change(date.getDate()) + " ";
      let h = that.change(date.getHours()) + ":";
      let m = that.change(date.getMinutes()) + ":";
      let s = that.change(date.getSeconds());
      return Y + M + D + h + m + s;
    },
    change(t) {
      if (t < 10) {
        return "0" + t;
      } else {
        return t;
      }
    },
    // 下载文件
    downloadFile(name, href) {
      console.log("name :", name);
      console.log("href :", href);
      let a = document.createElement("a"), //创建a标签
        e = document.createEvent("MouseEvents"); //创建鼠标事件对象
      e.initEvent("click", false, false); //初始化事件对象
      a.href = href; //设置下载地址
      a.download = name; //设置下载文件名
      a.dispatchEvent(e); //给指定的元素，执行事件click事件
    },
    searchByKeyword() {
      let that = this;
      if (that.keyword.length < 1) {
        that.getMaterialList();
        return 0;
      }
      this.req({
        url: "searchMaterial?keyword=" + that.keyword,
        data: {},
        method: "GET"
      }).then(
        res => {
          console.log("res :", res);
          if (res.data.length < 1) {
            that.$message("查询无果~");
            return 0;
          } else {
            that.$message("查询成功~");
          }
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].createDate = that.getTime(res.data[i].createDate);
          }
          // 搜索时不分页
          that.total = 1;
          that.tableData = res.data;
        },
        err => {
          console.log("err :", err);
        }
      );
    },
    pageChange(page) {
      console.log("page :", page);
      this.getMaterialList(page);
    },
    searchByTime() {
      let that = this;
      let beginTime = new Date(this.searchTime[0]).getTime();
      let endTime = new Date(this.searchTime[1]).getTime();
      console.log("beginTime :", beginTime);
      this.req({
        url: `searchMaterialByTime?beginTime=${beginTime}&endTime=${endTime}`,
        data: {},
        method: "GET"
      }).then(
        res => {
          console.log("res :", res);
          if (res.data.length < 1) {
            that.$message("查询无果~");
            return 0;
          } else {
            that.$message("查询成功~");
          }
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].createDate = that.getTime(res.data[i].createDate);
          }
          // 搜索时不分页
          that.total = 1;
          that.tableData = res.data;
        },
        err => {
          console.log("err :", err);
        }
      );
    }
  }
};
</script>

<style>
.upload {
  width: 200px;
  margin: 20px;
  float: right;
}
.my-pic {
  width: 48px;
  height: 27px;
}
.search {
  width: 50%;
}
.pagination {
  margin-top: 20px;
  margin-right: 50px;
  float: right;
}
.search-by-time {
  margin-top: 20px;
}
.my-btn {
  margin-top: 20px;
  margin-left: 50px;
}
</style>