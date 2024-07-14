const {option} = require("./basic.json")
const {    write_in_excel, to_make_json,to_get_team_info_in_league}  = require("./write_to_excel"); 
switch (option) {
    case 1:
        write_in_excel();
        break;
        case 2:
            to_make_json();
        break;
        case 3:
            to_get_team_info_in_league();
        break;

    default:
        break;
}