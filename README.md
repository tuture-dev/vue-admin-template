# vue+elementUI 后台管理极简模板
## 写在前面

此篇文章为一篇说明文档，不是教你从零构建一个后台管理系统，而是基于一个实际项目，已经搭建好了一个后台管理系统的基础框架，教你如何在此基础上快速开发自己的后台管理系统，能让读者能在掌握一些基础知识的情况下，也能上手vue后台开发。只有接触项目，才能更好地理解自己所学知识的意义，触类旁通把死知识点变成活学活用的技能。
## 先跑起来
```bash
# 克隆项目
git clone https://github.com/tuture-dev/vue-admin-template.git
# 进入目录
cd vue-admin-template
# 安装依赖
npm install --registry=https://registry.npm.taobao.org
# 运行
npm run dev
```
![1gdrAf.gif](https://s2.ax1x.com/2020/02/07/1gdrAf.gif)
## 增添侧边导航
1. 新建文件。在**src/views/** 新建一个空白的文件夹 **test**，在此目录下新建文件 **test.vue**
2. 添加路由。打开 **src/router/index.js**，此文件为该项目的后台路由配置文件。在**constantRoutes**这个数组中，添加路由的格式如下：

```
{
  path: '/test',  //url路径
  component: Layout, // 此处不用动，这个全局统一的一个布局文件
  children: [{
    path: 'test',  // 二级路径
    name: 'test',
    component: () => import('@/views/test/test'), // 懒加载，此处写所添加文件的路径
    meta: {
      title: '测试', icon:'plane' //配置选项可配置测试名称和图标
    }
  }]
},
```
我们可以自定义图标，格式的文件，可以在[iconfont](https://www.iconfont.cn/)中下载，之后放入**src/icons/svg** 目录下即可

![16KUN6.png](https://s2.ax1x.com/2020/02/06/16KUN6.png)


对于二级导航可以按照如下的方式进行配置。

![1NXiqJ.png](https://s2.ax1x.com/2020/02/03/1NXiqJ.png)

```
  {
    path: '/material',
    component: Layout,
    redirect: '/material/upload',
    meta: {
      title: '素材管理', //元信息，一级导航的名称
      icon: 'plane' // 元信息，导航图标的名称
    },
    children: [{
        path: 'check-template',
        name: 'check-template',
        component: () => import('@/views/material/check-template'),
        meta: {
          title: '查看模板',
        }
      },
      {
        path: 'logo',
        name: 'logo',
        component: () => import('@/views/material/check-logo'),
        meta: {
          title: '查看logo',
        }
      },
      {
        path: 'generate',
        name: 'generate',
        component: () => import('@/views/material/generate'),
        meta: {
          title: '生成素材',
        }
      },
      {
        path: 'check',
        name: 'check',
        component: () => import('@/views/material/check'),
        meta: {
          title: '查看素材',
        }
      },
    ]
  },
```
在此配置完成后，框架会自动地根据路由配置文件，生成边侧导航条目。我们所需要做的工作就是根据业务需求，编写一个个vue组件，往框架里面填充内容就OK了。

### 使用Element UI组件
[Element UI](https://element.eleme.cn/#/zh-CN/component/installation)提供了很多可复用的组件，对于一般的后台应用，这些组件完全可以满足需求。如果个性化需求不高的话，我们完全可以做一名“复制粘贴”工程师又称“CV”工程师，快速开发。

对于每一个组件，其文档上都有效果示例与代码，只需选择所需组件，将其代码粘贴进我们的代码文件中，稍加修改即可。

## 网络请求
当整个框架搭建完毕以后，前端程序员最主要的工作就是发起请求，渲染数据。现在我们就来完整地走一遍这个过程。
### 基础配置
1. 配置代理。

因为跨域资源请求的问题，在开发阶段所有和后端交互的网络请求在底层由node.js代理。[相关文档](https://cli.vuejs.org/config/#devserver-proxy)

打开根目录下的**vue.config.js**文件

```
// 代理所有以‘/admin’开头的网络请求
proxy: {
  '/admin': {
    target: `http://localhost:8886/`, //后台服务地址
    changeOrigin: true,
    pathRewrite: {
    }
  }
}
```
2. 配置地址

生产环境与开发环境通常有不同的服务地址。编辑 **.env.development** 以及 **.env.production** 这两个文件，修改其中的 **VUE_APP_BASE_API** 配置项即可

以开发环境为例：
```
VUE_APP_BASE_API = '/admin'
```

3. 配置拦截器

打开**src/utils/request.js**，此文件封装了一个axios请求对象，该系统中的网络请求都是基于这个对象来处理的。
我们可以在网络请求发送之前和收到服务端回复之后做一些通用性的工作。比如根据服务端的状态码判断请求是否正常，若不正常给出相应的提示。

```
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果服务器的状态码不为200，说明请求异常，应给出错误提示。
    if (res.code !== 200) {
      Message({
        message: res.msg || 'Error check your token or method',
        type: 'error',
        duration: 2 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 2 * 1000
    })
    return Promise.reject(error)
  }
)
```
4. 挂载请求对象

在**src/main.js**首先导入网络请求对象，并挂载至Vue全局对象，这样在每个组件中直接引用即可，不用要再导入。

```
import request from '@/utils/request'
Vue.prototype.req = request
```

### 请求与渲染
1. 搭建一个简易node服务

仅供教程说明使用

```
let http = require('http');
let querystring = require('querystring');
let my_result = [{
    date: '2016-05-02',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1518 弄'
}, {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄'
}, {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄'
}, {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄'
}]

let server = http.createServer((req, res) => {
    let post = '';
    req.on('data', function (chunk) {
        post += chunk;
    });

    req.on('end', function () {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        })
        post = querystring.parse(post);
        console.log('post-data:', post);
        if (post) {
            let result = {
                code: 200,
                // msg: "server error"
                data: my_result
            }
            res.end(JSON.stringify(result));
        } else {
            let result = {
                code: '0',
                msg: '没有接受到数据'
            }
            res.end(JSON.stringify(result));
        }
    });
});
server.listen(8886)
//在命令行 node server.js 即可运行
```
2. 发起请求

```
this.req({
  url: "getInfo?id=6", // 此处写不同业务对应的url，框架会自动与baseURL拼接
  data: {},
  method: "GET"
}).then(
  res => {
    // 请求成功后的处理
    console.log("res :", res);
  },
  err => {
    // 请求失败后的处理
    console.log("err :", err);
  }
);
```
按照最佳实践，应该把网络请求统一抽离到单一文件，然后在每个具体的页面进行对服务端数据的处理。
比如下面的这种形式，首先创建文件**src/api/test.js**，把在**test**组件中需要用到的网络请求都写入此文件。

```
// src/api/test.js
import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'getTableData',
    method: 'get',
    params
  })
}


```

在组件**test.vue**中引入请求方法

```
import { getTableData } from "@/api/test.js";
……
mounted: function() {
// 网络请求统一处理
getTableData().then(res => {
  console.log("api tableData :", res);
  this.tableData = res.data;
},err=>{
  console.log("err :", err);
});
// 网络请求直接写在文件中
this.req({
  url: "getTableData",
  data: {},
  method: "GET"
}).then(
  res => {
    console.log("tableData :", res);
    this.tableData = res.data;
  },
  err => {
    console.log("err :", err);
  }
);
},
```
3. 网络数据流

![1Uif9H.png](https://s2.ax1x.com/2020/02/03/1Uif9H.png)

在控制台可以看出，我们的请求地址为localhost:9528,而后台服务的的地址为localhost:8886。为啥不一样呢？我们以一流程图说明

![1UFtKI.png](https://s2.ax1x.com/2020/02/03/1UFtKI.png)

应用程序上线后，对于CORS跨域资源访问的问题，可以用类似的方案（Nginx反向代理）在前端解决。

### Hello Table
现在我们在**test.vue**中用Element UI所提供的 Table组件写一个表格数据展示页面。
1. 进入Element UI [Table](https://element.eleme.cn/#/zh-CN/component/table)组件的说明文档，复制粘贴对应的代码。框架对于Element UI已经进行了全局引入，所以这些组件拿来即用。如果是其他第三方的组件，还需要我们自己引入后再使用。


```
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="date" label="日期" width="180"></el-table-column>
    <el-table-column prop="name" label="姓名" width="180"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
  </el-table>
</template>
```
2. 在组件装载时请求数据

```
  mounted: function() {
    this.req({
      url: "getTableData",
      data: {},
      method: "GET"
    }).then(
      res => {
        console.log("tableData :", res);
        this.tableData = res.data  // 数据渲染
      },
      err => {
        console.log("err :", err); // 当业务逻辑发生错误时 进行处理
      }
    );
  },
```
3. 实际效果

业务逻辑正常

![168XP1.png](https://s2.ax1x.com/2020/02/06/168XP1.png)

业务出错时，弹出服务端给的错误信息。弹出此信息是在拦截器**request.js**文件定义的，这是统一的业务逻辑错误处理，也可以在每个请求中单独处理。

![16JiOU.png](https://s2.ax1x.com/2020/02/06/16JiOU.png)




## 简易权限控制

这种权限控制方式为静态方式，有些复杂的动态权限管理不在此说明。
该框架每一次的路由跳转都会通过**router.beforeEach**检验一遍权限，我们可以在这里添加配置项。
进入文件 **src/permission.js**，以只有管理员才能进入用户管理界面为例：

```
if (to.path === '/user/user') {
  let id = JSON.parse(localStorage.getItem('userInfo')).id
  console.log(id)
  if (id > 2) { //id>2位普通用户，无权访问
    next({ path: '/task' })
    window.alert('permission denied')
  }
}
```

## 结语

到此后台开发中最常用的操作已经介绍完毕，对于一些小项目已经是绰绰有余。花盆里长不出参天松，庭院里练不出千里马，项目写得多了很多东西就自然而然的通透了。一千个读者就有一千个哈姆雷特，这只是一个基础框架，在开发的过程，需要我们自己对其修改，让它成为你自己最顺手的框架。

> 此项目演绎自： https://github.com/PanJiaChen/vue-admin-template.git