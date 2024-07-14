const {to_contact_url} = require("./to_get_match_write_json.js");
const {get_more_info_by_mactchid,to_write_json} = require("./core.js");
const {write_in_excel,to_make_json} = require("./write_to_excel.js");
let { search_month_start,search_month_end    } = require("./basic.json")


const fs = require('fs');
const path = require('path');

// 获取当前目录路径
const directoryPath = './';

// 读取当前目录中的文件
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory!', err);
        return;
    }

    // 遍历找到匹配的文件并删除
    files.forEach(file => {
        // 使用正则表达式匹配 xxxx-xx.json 格式的文件名
        if (/^\d{4}-\d{2}\.json$/.test(file)) {
            // 构造文件路径
            const filePath = path.join(directoryPath, file);

            // 删除文件
            fs.unlink(filePath, err => {
                if (err) {
                    console.error(`Error deleting file ${file}`, err);
                } else {
                    console.log(`Deleted file: ${file}`);
                }
            });
        }
    });
});


const get_table = async ()=>{
    let search_month   =search_month_start
    for (;search_month  <= search_month_end;search_month++){
        let start = Date.now()
        const match_table = await to_contact_url(search_month);
        // console.log('match_table===============>',match_table)
         try{
            const res = await   get_more_info_by_mactchid(match_table)
            console.log('res===============>',res)
            if(res.length != 0 ){
                const [{日期1:date1}]= res 
                const date_str   = date1.substring(0,7)
                // console.log('date_str2222222222222===============>',date_str)
                to_write_json(res,date_str)
                let end = Date.now()
                let diff =(  end - start )/1000
                console.log(date_str,'共记录场次 ===============>', res.length ,"耗时:",diff,"秒")
            }
            write_in_excel();
         }
        catch(err){
            console.log('get_more_info_by_mactchid_err===============>',err)
        }
    }
  

}
to_make_json();
get_table();

// get_more_info_by_mactchid();

