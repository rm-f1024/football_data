# football_data
## 前言

获取足球信息,数据来自于直播吧

## 环境

百度nvm工具 配置好node环境和npm环境  node版本是v10.16.0

## 依赖

在根目录下执行，下载项目依赖

```
npm install
```

## 运行

在工程根目录下 运行node app_start.js 即可

## 配置

在basic.json文件配置所需要的联赛名字和联赛日期

```
{
    "year":2024,
    "search_month_start":5,
    "search_month_end":6,
    "start_day":1,
    "end_day":28,
    "filter": ["J联赛","K联赛","中超"]
}
```

## 数据

最终数据存入了excel文件 并生成了临时的.json文件

![image-20240708162047677](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20240708162047677.png)

