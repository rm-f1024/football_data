//本文件用于获取比赛信息并整理到json文件中

const https = require('https');
const fetch = require('node-fetch');
let { to_write_json } = require("./core.js")
let { start_day, end_day, filter ,year} = require("./basic.json")
//解析网络接口获取的数据
const to_parse_match = (test_obj, date) => {
    const { matches, leagues } = test_obj
    let match_info = [], _match_info = []

    // console.log('matches.length===============>',matches.length)

    for (let i = 0; i < matches.length; i++) {
        const [matchid, index, , start_time, , [, hostteam], [, guest_teams],] = matches[i];
        const [match_name] = leagues[index];
        const now = new Date(start_time * 1000)
        const _day = now.getDate().toString().padStart(2, '0')
        const _mon = (now.getMonth()+1).toString().padStart(2, '0')
        const _year = now.getFullYear()
        const date1 = `${_year}-${_mon}-${_day}`
        const item = {
            "比赛id": matchid,
            "联赛名": match_name,
            "日期": new Date(start_time * 1000).toLocaleString(),
            "日期1": date1,
            "主队": hostteam,
            "客队": guest_teams,
            "主队/客队":`${hostteam}/${guest_teams}`,
            "进球类型": "",
            "赛果": "",
            "角球类型": "",
            "角球":"",
            "半场角球":"",
            "半场": "",
            "开场15分钟": "",
            "控球率":"",
            "黄牌":"",
            "犯规":"",
            "射门":"",
            "射正":"",
            "预期进球":"",
            "传球成功率":"",
            "初始大小球盘口": "",
            "初始大小球水位": "",
            "初始让分盘口": "",
            "初始让分水位": "",
            "大小球水位变化": "",
            "让分盘水位变化": "",
            "大小球水位变化详情": "",
            "让分盘水位变化详情": "",
            "开场大小球盘口": "",
            "开场大小球水位": "",
            "开场让分盘口": "",
            "开场让分水位": "",
        }
        //   console.log('比赛id:',matchid,"比赛名字:",match_name,'开始时间:',new Date(start_time*1000).toLocaleString(),'主队:',hostteam,'客队',guest_teams);
        match_info.push(item)
    }
    // console.log('excel===============>', excel)
    _match_info = match_info.filter((item) => {
        const { 联赛名:match_name } = item
        // console.log('match_name===============>',match_name)
        if (filter.includes(match_name)) {
            return item
        }
    })
    // console.log('_match_info===============>',_match_info)
    if (_match_info.length) {
        // to_write_json(_match_info, date)
    } else {
        console.log('当天没有符合规则的比赛===============>')
    }
    // console.log('match_table===============>',match_table)
    return _match_info

}
//调用网络接口获取数据

const to_get_htm = async (url, date) => {
    let arr = [] ;
    try {
        const response = await fetch(url);
        // console.log('到这里===============>',)
        const data = await response.json();
         arr = to_parse_match(data, date)
        // console.log('arr===============>', arr)
        return arr
        //   console.log(data);
    } catch (error) {
        console.error('Error fetching:', error);
        return arr
    }
};



//开始拼接url
const to_contact_url = async (search_month) => {
    let returnArr = []
    let _start_day=start_day
        for (_start_day; _start_day <= end_day; _start_day++) {
            let arr = []
            let _month = search_month.toString().padStart(2, '0')
            let _day = _start_day.toString().padStart(2, '0')
             date = `${_month}-${_day}`
             let now_month = new Date().getMonth()+1 
             if(Number(now_month) == _month && Number(new Date().getDate()) < Number(_day)){
                break;
             }
             console.log('正在处理===============>',`${year}-${date}`,"的数据")
                let fetch_htm = `https://matchs.qiumibao.com/mc/${year}-${date}_cn.htm`
                // console.log('fetch_htm===============>', fetch_htm)
                arr = await to_get_htm(fetch_htm, date);
                returnArr = [...returnArr, ...arr];
                // console.log('arr===============>', arr);
                // 检查数组是否为空
        }
    console.log('统计数据共===============>', returnArr.length,"条")
    return Promise.resolve(returnArr);
}
// to_contact_url()
module.exports = {
    to_contact_url
}