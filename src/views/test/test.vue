<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="date" label="日期" width="180"></el-table-column>
    <el-table-column prop="name" label="姓名" width="180"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
  </el-table>
</template>

<script>
export default {
  data() {
    return {
      tableData:[]
    };
  },
  mounted: function() {
    this.req({
      url: "getTableData",
      data: {},
      method: "GET"
    }).then(
      res => {
        console.log("tableData :", res);
        this.tableData = res.data
      },
      err => {
        console.log("err :", err);
      }
    );
  },
  methods: {}
};
</script>

<style>
</style>