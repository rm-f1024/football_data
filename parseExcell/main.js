const fs = require('fs').promises;
const XLSX = require('xlsx');

const path = require('path');
const { lchown } = require('fs');
// 截取出文件的标识和客户对齐
function extractPlaceholders(input) {
    // 定义正则表达式，匹配格式 'xxxx-xxxx-xxx-'
    const regex = /^(\d{8})-(\d{4})-(.*?)-(.*?)-/;
    const match = input.match(regex);
    if (match) {
        const date = match[1];       // 提取日期字段
        const code = match[2];       // 提取编码
        const description = match[3]; // 提取客户

        return { code, description };
    } else {
        return null;
    }
}

// 定义要读取的目录路径
const directoryPath = './模板';

/**
 * 读取指定目录下的所有文件夹
 * @param {string} srcPath - 要读取的目录路径
 * @returns {Promise<string[]>} - 返回文件夹名称数组的Promise
 */
async function getDirectories(srcPath) {
    try {
        const entries = await fs.readdir(srcPath, { withFileTypes: true });
        const directories = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
        return directories;
    } catch (err) {
        console.error('Unable to scan directory:', err);
        throw err;
    }
}
// 获取商品信息
const get_commodity_info = (sheet) => {


    // 设定起始行（下标从25开始） 26行开始
    const startRow = 27;
    // 确定结束行：找到最大行数
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const endRow = range.e.r;
    // 列的位置X, Y, Z, AB对应的索引
    const columns = ['X', 'Y', 'Z', 'AB'].map(XLSX.utils.decode_col);
    const columnIndexX = XLSX.utils.decode_col('X'); // 单独处理X列索引
    let results = [];
    for (let row = startRow; row <= endRow; row++) {
        const cellAddressX = XLSX.utils.encode_cell({ c: columnIndexX, r: row });
        const cellX = sheet[cellAddressX];
        // console.log('cellX===============>', cellX)
        // 如果X列的单元格为空，则跳过当前行
        if (!cellX || cellX.v === null || cellX.v === '') {
            continue;
        }
        // X列不为空，处理该行
        let rowData = [];
        columns.forEach(colIndex => {
            const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: row });
            const cell = sheet[cellAddress];
            if (cell) {
                rowData.push(cell.v);  // 只添加有值的单元格
            } else {
                rowData.push(null);  // 可以选择添加 null 作为空值的占位符
            }
        });
        results.push(rowData);
    }
    // console.log('results===============>', results)
    return results
}

async function getExcelFiles(directoryPath, keyword) {
    try {
        const entries = await fs.readdir(directoryPath);
        const excelFiles = entries
            .filter(entry => entry.includes(keyword) && entry.endsWith('.xlsx') && !entry.startsWith('~$'));
        return excelFiles;
    } catch (err) {
        console.error(`Unable to read directory ${directoryPath}:`, err);
        throw err;
    }
}

async function readExcelFile(filePath, client_encode) {
    try {
        const workbook = XLSX.readFile(filePath);
        // console.log(`Reading file: ${filePath}`);
        // 获取第一个工作表的名称
        const firstSheetName = workbook.SheetNames[0];
        // 获取第一个工作表对象
        const firstSheet = workbook.Sheets[firstSheetName];
        // console.log('user===============>', firstSheet['C8'].v)
        const info = get_commodity_info(firstSheet)
        let data = []
        for (i of info) {
            let [name, key, number, cost] = i;
            let obj = []
            if (client_encode) {
                obj.push("HL24" + client_encode.code)//编码
            } else {
                obj.push("HL24XXXX")//编码
            }
            if (firstSheet['C8']) {
                obj.push(firstSheet['C8'].v);//客户名
            }
            if (firstSheet['C9']) {
                obj.push(firstSheet['C9'].v);//回款客户名称
            }
            if (firstSheet['G13']) {
                obj.push(firstSheet['G13'].v);//合同协议号
            }


            obj.push("");//海外型号
            obj.push(name);//报关申报品名
            obj.push(key);//申报要素
            obj.push("");//产品型号
            obj.push(number);//数量
            obj.push(cost);//单价
            obj.push("");//总价
            obj.push("");//垫资费
            if (firstSheet['C5']) {
                obj.push(firstSheet['C5'].v);//出货日期
            }
            if (firstSheet['C10']) {
                obj.push(firstSheet['C10'].v);//回款银行
            }
            obj.push("");//是否报关
            obj.push("");//报关单证费
            obj.push("");//是否已经写转款单
            obj.push("");//备注
            data.push(obj);
        }
        return data

    } catch (err) {
        console.error(`Unable to read Excel file ${filePath}:`, err);
    }
}
const write_to_excel = (data) => {
    // 创建一个新的工作簿
    const workbook = XLSX.utils.book_new();

    // 创建一个新的工作表
    const worksheetData = [
        ['编码', '境外收件人', "回款客户名称", '合同号', '海外型号', '报关申报品名', '申报要素', '产品型号', '数量', '报关单价', '总价', '垫资费', '出货时间', "回款银行", '是否报关', '报关单证费', '是否已经写转款单', '备注'],
        ...data
    ];

    // 将数据转换为工作表对象
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    // 将工作表添加到工作簿中
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // 定义要写入的文件路径
    const outputFilePath = path.join(__dirname, 'example.xlsx');
    // 写入文件
    XLSX.writeFile(workbook, outputFilePath);
    console.log(`Excel file created successfully at ${outputFilePath}`);
}

async function processDirectories(basePath) {
    console.log("basePath",basePath)
    try {
        const directories = await getDirectories(basePath);
        let data = [];
        for (const dir of directories) {
            const client_encode = extractPlaceholders(dir);
            const key = "报关资料"
            let test_path = path.join(basePath, dir);
            let dirPath = "";
            const files = await fs.readdir(test_path);

            // 检查是否存在名为 "报关资料" 的文件夹
            if (files.includes(key)) {
                // console.log(`目录 '${test_path}' 中存在文件夹 '${key}'。`);
                dirPath = path.join(basePath, dir, key);
            } else {
                console.log(`目录 '${test_path}' 中不存在文件夹 '${key}'。`);
                dirPath = path.join(basePath, dir);
            }


            const excelFiles = await getExcelFiles(dirPath, key);
            // console.log('excelFiles===============>',excelFiles)

            for (const file of excelFiles) {
                const filePath = path.join(dirPath, file);
                res_data = await readExcelFile(filePath, client_encode);
                data = [...data, ...res_data]
            }

        }
        write_to_excel(data)
    } catch (err) {
        console.error('Error processing directories:', err);
    }
}





// 定义读取本地文件的函数
function readLocalExcelFile(filePath) {

    // 假设workbook和sheet已经被正确加载
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // 设定起始行（下标从25开始） 26行开始
    const startRow = 25;

    // 确定结束行：找到最大行数
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const endRow = range.e.r;

    // 列的位置X, Y, Z, AB对应的索引
    const columns = ['X', 'Y', 'Z', 'AB'].map(XLSX.utils.decode_col);
    const columnIndexX = XLSX.utils.decode_col('X'); // 单独处理X列索引

    let results = [];
    for (let row = startRow; row <= endRow; row++) {
        const cellAddressX = XLSX.utils.encode_cell({ c: columnIndexX, r: row });
        const cellX = sheet[cellAddressX];
        // console.log('cellX===============>', cellX)
        // 如果X列的单元格为空，则跳过当前行
        if (!cellX || cellX.v === null || cellX.v === '') {
            continue;
        }

        // X列不为空，处理该行
        let rowData = [];
        columns.forEach(colIndex => {
            const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: row });
            const cell = sheet[cellAddress];
            if (cell) {
                rowData.push(cell.v);  // 只添加有值的单元格
            } else {
                rowData.push(null);  // 可以选择添加 null 作为空值的占位符
            }
        });
        results.push(rowData);
    }
    // console.log('results===============>', results)
    return results

}
let basePath = "base"
processDirectories(basePath)

    // 示例：读取当前目录下名为 example.xlsx 的文件
    // readLocalExcelFile('./一份报关资料demo.xlsx');
// =IF( ISNUMBER(FIND("(", B1)),  MID(B1, 1, FIND("(", B1) - 1), 
//             IF(ISNUMBER(FIND("（", B1)),  MID(B1, 1, FIND("（", B1) - 1) ,
//             IF(ISNUMBER(FIND("）", B1)), MID(B1, 1, FIND("）", B1) - 1),
//             IF(ISNUMBER(FIND(")", B1)), MID(B1, 1, FIND(")", B1) - 1),
//             SUBSTITUTE(SUBSTITUTE(B1, CHAR(1), ""), CHAR(2), ""))))
// )