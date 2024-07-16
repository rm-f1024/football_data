//本文件用于按照matchid去查询大小球和让分盘的信息 

// const test = require('./345.json')
const fetch = require('node-fetch');
const excel = [];
let match_table = [];
const newArr = [];
const https = require('https');
const { url } = require('inspector');
//to write json 

const to_write_json = (obj, date) => {
  const fs = require('fs');
  // 将对象转换为JSON字符串
  const json = JSON.stringify(obj, null, 2);
  // 写入文件
  fs.writeFile(`./${date}.json`, json, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('User data has been saved .',date,".json文件");
  });
}


const get_more_info_by_mactchid = async (match_table) => {

  let j = 0

  for (let table of match_table) {
    const { 比赛id: matchid, 日期1: date1 } = table
    //  console.log('matchid===============>',matchid)
    //dx 和asia 大小球和亚指数
    let type = 'dx', id = 3, type1 = 'asia'
    get_stock_url = `https://odds.duoduocdn.com/football/detail?id=${matchid}&type=${type}&cid=${id}`
    get_asia_url = `https://odds.duoduocdn.com/football/detail?id=${matchid}&type=${type1}&cid=${id}`
    get_fapai_jiaoqiu_url = `https://dc.qiumibao.com/dc/matchs/data/${date1}/match_team_statics_v2_${matchid}.htm?_t=${Date.now()}`
    // console.log('get_asia_url===============>', get_asia_url)
    console.log('get_fapai_jiaoqiu_url===============>', get_fapai_jiaoqiu_url)
    const arr1s = await to_get(get_stock_url, matchid)
    const arr2s = await to_get_asia(get_asia_url, matchid)
    const arr3s = await to_get_jiaoqiu_fapai(get_fapai_jiaoqiu_url, matchid)
    // console.log('arr2s===============>',arr2s)
    // console.log('arr3s===============>',arr3s)
    const arrs = [...arr1s, ...arr2s, ...arr3s]
    for (let arr of arrs) {
      // console.log('arr===============>',arr) 
      Object.assign(match_table[j], arr);
    }
    j++
  }
  // console.log('符合的比赛有===============>', j, '场次')
  return match_table
}

const to_get_jiaoqiu_fapai = async (url, id) => {
  // console.log('url===============>',url)
 
  try {
    const response = await fetch(url);
    const data = await response.json();
    const { important, other } = data.data
    let timelydate = [];
    if (Array.isArray(important) && Array.isArray(other)) {
      let obj = {}
      for (let item of important) {
        const { left, desc, right } = item
        obj[desc] = `${left}/${right}`

          if(desc == "角球"){
            if(Number(left)+Number(right) > 8.5){
              obj["角球类型"]="大角"
            }else{
              obj["角球类型"]="小角"
            }
          }
      }
      //半场角球
      const { left, desc, right } = other[0]
      obj[desc] = `${left}/${right}`

   
      timelydate.push(obj);
    } else {
      console.log('数据错误===============>\n')
    }
    // console.log('timelydate===============>',timelydate)
    return timelydate

  } catch (error) {
    console.log('error===============>', error)
    return []
  }
}
const to_get_asia = async (url) => {
  // console.log('url===============>',url)
  try {
    const response = await fetch(url);
    const data = await response.json();
    const { oddsChange } = data.data
    // console.log('oddsChange===============>',oddsChange)
    let timelydate = [];
    if (Array.isArray(oddsChange)) {
      let len = oddsChange.length
      let i = len - 1
      let total = 0;


      //初始盘
      {
        let { row } = oddsChange[len - 1];
        let [{ v: big }, { v: boll_num },] = row;
        let item = {
          '初始让分水位': `赔率:${big}`,
          '初始让分盘口': `让球${boll_num}`,
        }
        timelydate.push(item)
      }


      for (; i > len / 2; i--) {
        //开盘和收盘数据
        let { row, score, updateTime, label } = oddsChange[i];
        let text = undefined;
        if (label) {
          text = label.text
        }
        const [{ v: big }, { v: boll_num },] = row;


        //赛前
        if (text && text == "\u8d5b\u524d") {
          let flag = i;
          let str = ''
          let start;
          let level = '升水'
          let nun_level = 7
          let tag = false
          let item = {}
          for (; flag - i < nun_level; flag++) {
            if (oddsChange[flag]) {
              let [pl, boll] = oddsChange[flag].row;
              str += `${boll.v}/${pl.v}\n`

              if (flag - i == nun_level - 1) {
                start = Number(pl.v)
              }
              tag = true
            }

          }
          if (tag) {
            if (start > Number(big)) {
              level = "降水"
            }
            item = {
              '开场让分水位': `赔率:${big}`,
              '开场让分盘口': `让球${boll_num}`,
              '让分盘水位变化': level,
              "让分盘水位变化详情": str
            }
          }
          else {
            item = {
              '开场让分水位': `赔率:${big}`,
              '开场让分盘口': `让球${boll_num}`,
            }
          }
          total++
          timelydate.push(item)
          continue
        }


      }
      // console.log('i的次数===============>', i, "比赛id:", matchid, "total值", total)
    } else {
      console.log('数据错误===============>\n')
    }
    // console.log('timelydate===============>',timelydate)
    return timelydate

  } catch (error) {
    console.log('error===============>', error)
    return []
  }
}




const to_get = async (url, matchid) => {
  // console.log('url===============>',url)
  try {
    const response = await fetch(url);
    const data = await response.json();
    const { oddsChange } = data.data
    // console.log('oddsChange===============>',oddsChange)
    let timelydate = [];
    if (Array.isArray(oddsChange)) {
      let len = oddsChange.length
      let i = len - 1
      let total = 0;
      //完场
      {
        let { score } = oddsChange[0];
        let num = score.split('-').reduce((i, j) => Number(i) + Number(j))
        let type = '小球'
        if (num > 2.5) {
          type = '大球'
        }
        let item = {
          '赛果': `比分:${score}`,
          '进球类型': type,
        }
        timelydate.push(item);
      }

      //初始盘
      {
        let { row } = oddsChange[len - 1];
        let [{ v: big }, { v: boll_num },] = row;
        let item = {
          '初始大小球水位': `赔率:${big}`,
          '初始大小球盘口': `大小球${boll_num}`,
        }
        timelydate.push(item)
      }


      for (; i > len / 2; i--) {
        //开盘和收盘数据
        let { row, score, updateTime, label } = oddsChange[i];
        let text = undefined;
        if (label) {
          text = label.text
        }
        const [{ v: big }, { v: boll_num },] = row;

        if (updateTime == "15'") {
          const item = {
            '开场15分钟': `比分:${score}`,
          }
          total++
          timelydate.push(item)
          continue
        }
        //赛前
        if (text && text == "\u8d5b\u524d") {
          let flag = i;
          let str = ''
          let start;
          let level = '升水'
          let nun_level = 7
          let tag = false
          let item = {}
          for (; flag - i < nun_level; flag++) {
            if (oddsChange[flag]) {
              let [pl, boll] = oddsChange[flag].row;
              str += `${boll.v}/${pl.v}\n`

              if (flag - i == nun_level - 1) {
                start = Number(pl.v)
              }
              tag = true
            }

          }
          if (tag) {
            if (start > Number(big)) {
              level = "降水"
            }
            item = {
              '开场大小球水位': `赔率:${big}`,
              '开场大小球盘口': `大小球${boll_num}`,
              '大小球水位变化': level,
              "大小球水位变化详情": str
            }
          }
          else {
            item = {
              '开场大小球水位': `赔率:${big}`,
              '开场大小球盘口': `大小球${boll_num}`,
            }
          }
          total++
          timelydate.push(item)
          continue
        }

        if (updateTime == '\u4e2d\u573a') {
          const item = {
            '半场': `比分:${score}`,
          }
          timelydate.push(item)
          total++
          continue
        }
      }
      // console.log('i的次数===============>', i, "比赛id:", matchid, "total值", total)
    } else {
      console.log('数据错误===============>\n')
    }
    // console.log('timelydate===============>',timelydate)
    return timelydate

  } catch (error) {
    console.log('error===============>', error)
    return []
  }

}

module.exports = {
  excel,
  to_write_json,
  match_table,
  get_more_info_by_mactchid
};




