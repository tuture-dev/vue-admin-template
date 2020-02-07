<template>
  <div class="root">
    <div class="search">
      <el-input placeholder="请输入logo名称" v-model="keyword" clearable class="input-with-select">
        <el-button @click="goSearch" slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      :default-sort="{prop: 'createDate', order: 'descending'}"
    >
      <el-table-column prop="name" label="logo名称" show-overflow-tooltip></el-table-column>
      <el-table-column label="上传日期" prop="createDate" sortable>
        <!-- <template slot-scope="scope">{{ scope.row.createDate }}</template> -->
      </el-table-column>
      <el-table-column prop="img_url" label="logo预览">
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
          <el-button @click="deleteLogo(scope.row.id)" size="small" type="danger" round>删除</el-button>
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
    <el-upload class="upload template" :headers="headers" action="http://219.228.76.43:8886/admin/upload" :on-success="uploadSuccess">
      <el-button size="small" type="primary">上传logo</el-button>
      <div slot="tip" class="el-upload__tip">.png格式 尺寸200*200以内</div>
    </el-upload>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword:'',
      pageSize: 6,
      total: 6, // task总数
      srcList: [],
      tableData: [],
      headers:{
        token:localStorage.getItem('token')
      }
    };
  },
  created: function() {
    this.getLogoList();
  },
  methods: {
    imgClick(imgUrl) {
      this.srcList = [imgUrl];
    },

    getLogoList(page = 1, limit = 6) {
      let that = this;
      this.req({
        url: `getLogoList?page=${page}&limit=${limit}`,
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
    deleteLogo(id) {
      let that = this;
      this.$confirm("此操作将删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          that
            .req({
              url: "deleteLogo?id=" + id,
              data: {},
              method: "GET"
            })
            .then(
              res => {
                console.log("res :", res);
                that.getLogoList();
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
    downloadLogo(imgUrl) {},
    uploadSuccess(response, file, fileList) {
      let that = this;
      console.log(":", response);
      this.$message("上传成功~");
      this.$prompt("请输入logo名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          that
            .req({
              url: "addLogo",
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
                that.getLogoList();
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
    pageChange(page) {
      console.log("page :", page);
      this.getLogoList(page);
    },
    goSearch() {
      let that = this;
      if (that.keyword.length < 1) {
        that.getLogoList();
        return 0;
      }
      this.req({
        url: "searchLogo?keyword=" + that.keyword,
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
.pagination {
  margin-top: 20px;
  margin-right: 50px;
  float: right;
}
.search {
  width: 50%;
  /* margin-left: 50%; */
}
</style>