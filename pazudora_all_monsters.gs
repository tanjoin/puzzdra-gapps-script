function monsterList() {
  var content = UrlFetchApp.fetch("http://pd.appbank.net/ml");
  var html = content.getContentText();
  
  var elements = [];
  var pos = html.indexOf("<td>");
  var endpos = html.indexOf("</td>", pos + 1);
  
  var spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spread_sheet.getSheetByName("モンスター一覧");
  var number_cell = sheet.getRange(1, 1);
  var monster_name_cell = sheet.getRange(1, 2);
  
  while (pos != -1) {
    var monster_info = html.substring(pos, endpos + "</td>".length);
    
    var break_index = monster_info.indexOf("<br />");
    var number = monster_info.substring("<td>".length, break_index);
    
    var monster_name_first_index = monster_info.indexOf("\">");
    var monster_name_last_index = monster_info.indexOf("</a>");
    var monster_name = monster_info.substring(monster_name_first_index + "\">".length,
                                              monster_name_last_index);

    number_cell.setValue(number);
    monster_name_cell.setValue(monster_name);
    
    number_cell = sheet.getRange(number_cell.getRow()+1, number_cell.getColumn());
    monster_name_cell = sheet.getRange(monster_name_cell.getRow()+1, monster_name_cell.getColumn());
    
    pos = html.indexOf("<td>", endpos + 1);
    endpos = html.indexOf("</td>", pos + 1);
  }
}
