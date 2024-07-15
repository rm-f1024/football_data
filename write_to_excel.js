const fs = require("fs")
var json2xls = require('json2xls');
const { year, search_month_start, search_month_end ,filter} = require("./basic.json")
const path = require('path');

const to_make_json = () => {

    const directoryPath = path.join(__dirname);
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the directory', err);
            return;
        }
        // 过滤出匹配的文件
        const regex_str = `^${year}-\\d{2}.*\.json$`;
        const regex = RegExp(regex_str)
        const filteredFiles = files.filter(file => regex.test(file));
        if (filteredFiles.length == 0) {
            let mon = search_month_start
            for (; mon <= search_month_end; mon++) {
                let _mon = mon.toString().padStart(2, '0')
                date_str = `${year}-${_mon}`
                fs.writeFileSync(`${date_str}.json`, "{}", 'binary');
            }
        } else {
            console.log('文件存在不用生成===============>')
        }

    });

}

const to_get_team_info_in_league= () => {

    const directoryPath = path.join(__dirname);
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the directory', err);
            return;
        }
        // 过滤出匹配的文件
        const regex_str = `^${year}-\\d{2}.*\.json$`;
        const regex = RegExp(regex_str)
        const filteredFiles = files.filter(file => regex.test(file));
        const _date_str = filteredFiles[0].substring(0, 4)

        let team_name = {} ,alljson = []; 
        if (filteredFiles.length != 0) {
            for(let file  of filteredFiles ){
                const  json  = require(`./${file}`);
                // console.log('json===============>',json)
                for(let item  of json ){
                    const  {主队 ,客队}  = item
                    team_name[主队]=1;
                    team_name[客队]=1;
                }
                alljson = [...alljson,...json]

            }
            console.log('team_name===============>',team_name)
            // console.log('alljson===============>',alljson)
            let teams_info = [];
            let map = new Map()
            for( let json  of alljson ){
                const  {主队 ,客队,赛果 ,角球 ,黄牌 ,  射门 , 射正 , 犯规 }  = json
                let teams = {} ;
                let index =  0 ; 
                let 进球 = 赛果.substr(3)
                
                teams['队名'] = 主队
                teams['进球'] = 0
                teams['角球'] = 0
                teams['射门'] = 0
                teams['射正'] = 0
                teams['黄牌'] = 0
                teams['犯规'] = 0
              {
                if(赛果){
                    teams['进球'] = Number(teams['进球'])+ Number(进球.split("-")[index])
                }
                if(角球){
                    teams['角球'] = Number(teams['角球'])+ Number(角球.split("/")[index]) 
                }
                if(射门){
                    teams['射门'] = Number(teams['射门'])+ Number(射门.split("/")[index]) 
                }
                if(射正){
                    teams['射正'] = Number(teams['射正'])+ Number(射正.split("/")[index])
                }
                if(黄牌){
                    teams['黄牌'] = Number(teams['黄牌'])+ Number(黄牌.split("/")[index])
                }
                if(犯规){
                    teams['犯规'] = Number(teams['犯规'])+ Number(犯规.split("/")[index])
                }
              }
              teams_info.push(teams)
              teams = {} ;

              teams['队名'] = 客队
              teams['进球'] = 0
              teams['角球'] = 0
              teams['射门'] = 0
              teams['射正'] = 0
              teams['黄牌'] = 0
              teams['犯规'] = 0
              {
                index =1 ;
                if(赛果){
                    teams['进球'] = Number(teams['进球'])+ Number(进球.split("-")[index])
                }
                if(角球){
                    teams['角球'] = Number(teams['角球'])+ Number(角球.split("/")[index]) 
                }
                if(射门){
                    teams['射门'] = Number(teams['射门'])+ Number(射门.split("/")[index]) 
                }
                if(射正){
                    teams['射正'] = Number(teams['射正'])+ Number(射正.split("/")[index])
                }
                if(黄牌){
                    teams['黄牌'] = Number(teams['黄牌'])+ Number(黄牌.split("/")[index])
                }
                if(犯规){
                    teams['犯规'] = Number(teams['犯规'])+ Number(犯规.split("/")[index])

                }
              }
              teams_info.push(teams)
              teams = {} ;

            }

            // const uniqueData = Array.from(new Map(teams_info.map(item => [item.队名, item])).values());
            // console.log('teams_info===============>',teams_info)


            // uniqueData.sort((a, b) => b.进球 - a.进球);
      
           
            const all_json = json2xls(teams_info)


            fs.writeFileSync(`${_date_str}_${filter.toString()}_数据统计.xlsx`, all_json, 'binary');
            

        } else {
            console.log('文件存在不用生成===============>')
        }

    });

}
const write_in_excel = () => {
    // 当前目录
    const directoryPath = path.join(__dirname);
    // 正则表达式，匹配202x-xx格式开头的.json文件
    const regex_str = `^${year}-\\d{2}.*\.json$`;
    const regex = RegExp(regex_str)
    // 读取当前目录下的文件
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the directory', err);
            return;
        }
        // 过滤出匹配的文件
        const filteredFiles = files.filter(file => regex.test(file));
        // 打印匹配的文件名
        // console.log('Filtered JSON files:', filteredFiles);
        let allData = [];
        for (let item of filteredFiles) {
            try {

                // 使用文件名（无扩展名）作为键，存储解析后的数据
                const jsonData = require(`./${item}`)
                // console.log('jsonData===============>',jsonData)
                allData = [...allData, ...jsonData]
            } catch (err) {
                console.log('err===============>', err)
            }
        }
        console.log('filteredFiles===============>',filteredFiles)
        const _date_str = filteredFiles[0].substring(0, 4)
        // console.log('_date_str===============>',_date_str)
        // console.log('allData===============>',allData)
        const all_json = json2xls(allData)
        fs.writeFileSync(`${_date_str}_${filter.toString()}.xlsx`, all_json, 'binary');
    });
}
//1,2,3
// to_make_json()
// to_get_team_info_in_league()
// write_in_excel()
module.exports = {
    write_in_excel,
    to_make_json,
to_get_team_info_in_league

}