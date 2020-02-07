<template>
  <div class="root">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="100px" style="width:600px">
          <el-form-item label="素材名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="字体与颜色">
            <el-col :span="8">
              <el-select v-model="form.fontType" placeholder="选择字体">
                <el-option value="楷体">楷体</el-option>
                <el-option value="粗体">粗体</el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input  type="number" v-model="form.fontSize" placeholder="字号:85--100"></el-input>
            </el-col>
            <el-col :span="8">
              <span>选择颜色</span>
              <colorPicker class="choose-color" v-model="form.color" />
              <!-- <el-select v-model="form.color" placeholder="选择颜色">
                <el-option label="红色" value="fd5959"></el-option>
                <el-option label="蓝色" value="5454ff"></el-option>
              </el-select>-->
            </el-col>
          </el-form-item>
          <el-form-item label="模板与logo">
            <el-col :span="11">
              <el-select
                v-model="form.templateUrl"
                placeholder="选择相应模板"
                clearable
                @change="selectChange"
              >
                <el-option
                  v-for="item in templateList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.imgUrl"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="11">
              <!-- <el-upload class="template" action="/admin/upload" :on-success="uploadSuccess">
                <el-button size="small" type="primary">上传logo</el-button>
                <div slot="tip" class="el-upload__tip">只能上传.jpg文件</div>
              </el-upload>-->
              <el-select
                v-model="form.logoUrl"
                placeholder="选择相应Logo"
                clearable
                @change="selectChange"
              >
                <el-option
                  v-for="item in logoList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.imgUrl"
                ></el-option>
              </el-select>
            </el-col>
          </el-form-item>
          <el-form-item label="素材样式">
            <el-radio-group v-model="mType" @change="typeChange">
              <el-radio label="1">样式一</el-radio>
              <el-radio label="2">样式二</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="文字一">
            <el-input v-model="form.text1"></el-input>
          </el-form-item>
          <el-form-item label="文字二">
            <el-input v-model="form.text2"></el-input>
          </el-form-item>
          <el-form-item label="文字三" v-if="!type_1">
            <el-input v-model="form.text3"></el-input>
          </el-form-item>
          <el-form-item label="文字四" v-if="!type_1">
            <el-input v-model="form.text4"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="info" @click="preview">预览</el-button>
            <el-button type="primary" @click="addMaterial">立即生成</el-button>
            <!-- <el-button>取消</el-button> -->
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <div class="img-wrap">
          <el-image
            fit="scale-down"
            style="width: 400px; height: 400px;"
            :src="imgUrl"
            :preview-src-list="srcList"
          ></el-image>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type_1: true,
      mType: "1",
      templateList: [],
      logoList: [],
      form: {
        text1: "",
        text2: null,
        text3: null,
        text4: null,
        logoUrl: "",
        color: "#ff0000"
      },
      imgUrl:
        "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
      srcList: [this.imgUrl]
    };
  },
  created: function() {
    this.getTemplateList();
    this.getLogoList();
  },
  methods: {
    preview() {
      this.form.color = this.form.color.substring(1,7);
      console.log("this.form :", this.form);
      // return 0;
      let that = this;
      this.req({
        url: "previewMaterial",
        data: that.form,
        method: "POST"
      }).then(
        res => {
          console.log("res :", res);
          that.imgUrl = res.data;
          that.srcList = [that.imgUrl];
        },
        err => {
          console.log("err :", err);
        }
      );
    },
    uploadSuccess(response, file, fileList) {
      console.log("response :", response);
      this.form.logoUrl = response.data;
    },
    selectChange(value) {
      console.log("value :", value);
      this.imgUrl = value;
      this.srcList = [value];
    },
    addMaterial() {
      let that = this;
      this.req({
        url: "addMaterial",
        data: {
          name: that.form.name,
          imgUrl: that.imgUrl,
          createDate: new Date().getTime()
        },
        method: "POST"
      }).then(
        res => {
          console.log("res :", res);
          this.$router.push({ path: "/material/check" });
        },
        err => {
          console.log("err :", err);
        }
      );
    },
    getTemplateList() {
      let that = this;
      this.req({
        url: "getTemplateList?page=0&limit=0",
        data: {},
        method: "GET"
      }).then(
        res => {
          console.log("res :", res);
          that.templateList = res.data;
        },
        err => {
          console.log("err :", err);
        }
      );
    },
    getLogoList() {
      let that = this;
      this.req({
        url: "getLogoList?page=0&limit=0",
        data: {},
        method: "GET"
      }).then(
        res => {
          console.log("res :", res);
          that.logoList = res.data;
        },
        err => {
          console.log("err :", err);
        }
      );
    },
    typeChange(value) {
      console.log("value :", value);
      if (value == "1") {
        this.type_1 = true;
        this.form.text3 = null;
        this.form.text4 = null;
      } else {
        this.type_1 = false;
      }
    }
  }
};
</script>

<style>
.choose-color{
  z-index: 9999;
  /* width: 210px; */
}
.line {
  text-align: center;
}
.img-wrap {
  width: 100%;
  height: 500px;
  margin-left: 68px;
}
.box{
  width: 220px !important;
}
</style>