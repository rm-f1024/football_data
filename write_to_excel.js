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
to_make_json()
// write_in_excel()
module.exports = {
    write_in_excel,
    to_make_json
}