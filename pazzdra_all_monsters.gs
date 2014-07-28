function create_monster_list(html, line) {
  var space_pos = html.indexOf("<div class=\"space\">");
  var space_endpos = html.indexOf("<!-- div.space -->");
  var monster_list = html.substring(space_pos + "<div class=\"space\">".length, space_endpos);
  
  var pos = monster_list.indexOf("<div class=\"mlist-box\">");
  var endpos = monster_list.indexOf("</div>", monster_list.indexOf("</div>", monster_list.indexOf("</div>", pos + 1) + 1) + 1);
  
  while(pos != -1) {
    var monster_info = monster_list.substring(pos + "<div class=\"mlist-box\">".length, endpos);
    add_evolution_info(monster_info, line);
    add_monster_info(monster_info, line);
    line++;
    pos = monster_list.indexOf("<div class=\"mlist-box\">", endpos+1);
    endpos = monster_list.indexOf("</div>", monster_list.indexOf("</div>", monster_list.indexOf("</div>", pos + 1) + 1) + 1);
  }
  
  return line;
}

function add_evolution_info(monster_info, line) {
  var pos = monster_info.indexOf("<a href=\"");
  
  if (pos == -1) {
    return;
  }
  
  var endpos = monster_info.indexOf("\"", pos + "<a href=\"".length + 1);
  
  var sub_url = monster_info.substring(pos + "<a href=\"".length, endpos);
  var content = UrlFetchApp.fetch("http://pd.appbank.net" + sub_url);
  var html = content.getContentText();

  var evolution_materials_pos = html.indexOf("<p class=\"name\">進化素材</p>");
  
  if (evolution_materials_pos == -1) {
    return;
  }
  
  evolution_materials_pos = html.indexOf("<div>", evolution_materials_pos+1);
  var evolution_materials_endpos = html.indexOf("</div>", evolution_materials_pos+1);
  
  var evolution_materials = html.substring(evolution_materials_pos+"<div>".length, evolution_materials_endpos);
  
  var pos = evolution_materials.indexOf("<a href=\"/m");
  var endpos = evolution_materials.indexOf("\"", pos+"<a href=\"/m".length);
  
  var column = 3;
  while(pos != -1) {   
    var num = evolution_materials.substring(pos + "<a href=\"/m".length, endpos);
  
    var spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spread_sheet.getSheetByName("モンスター一覧");
    var cell = sheet.getRange(line, column++);
    cell.setValue("=B" + (Number(num)+1));
    
    pos = evolution_materials.indexOf("<a href=\"/m", endpos+1);
    endpos = evolution_materials.indexOf("\"", pos+"<a href=\"/m".length);
  }
}

function add_monster_info(monster_info, line) {
  var pos = monster_info.indexOf("<div class=\"name\">");
  var break_index = monster_info.indexOf("<br />", pos+1);
  var endpos = monster_info.indexOf("</div>", break_index);
  
  var number = monster_info.substring(pos+"<div class=\"name\">".length, break_index);
  var name   = monster_info.substring(break_index+"<br />".length, endpos);
  
  var spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spread_sheet.getSheetByName("モンスター一覧");
  var number_cell = sheet.getRange(line, 1);
  var monster_name_cell = sheet.getRange(line, 2);
  number_cell.setValue(number);
  monster_name_cell.setValue(name);
}

function list_count() {
  var content = UrlFetchApp.fetch("http://pd.appbank.net/ml");
  var html = content.getContentText();
  var number_list_pos = html.indexOf("<div class=\"space number-list\">");
  var number_list_endpos = html.indexOf("</div>", number_list_pos);
  
  if (number_list_pos == -1) {
    Logger.log("HTMLが対応していません"); 
  }

  var list_info = html.substring(number_list_pos + "<div class=\"space number-list\">".length, number_list_endpos);
  var pos = list_info.indexOf(">");
  var endpos = list_info.indexOf("</a>", pos);
  var list_count = 0;
  while (pos != -1) {
    list_count++;
    pos = list_info.indexOf(">", endpos + "</a>".length);
    endpos = list_info.indexOf("</a>", pos);
  }
  return list_count;
}

function main() {
  var list_count_num = list_count();
  var line = 2;
  for (var i = 1; i <= list_count_num; i++) {
    var content = UrlFetchApp.fetch("http://pd.appbank.net/ml" + i);
    var html = content.getContentText();
    line = create_monster_list(html, line);
  }
}
