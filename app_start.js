const {to_contact_url} = require("./to_get_match_write_json.js");
const {get_more_info_by_mactchid,to_write_json} = require("./core.js");
const {write_in_excel,to_make_json} = require("./write_to_excel.js");
let { search_month_start,search_month_end    } = require("./basic.json")

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
                console.log('date_str2222222222222===============>',date_str)
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

