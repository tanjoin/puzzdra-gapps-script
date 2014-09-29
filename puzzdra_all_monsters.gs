// -----------------------------------------------------------------
// 進化リスト取得メソッド
// -----------------------------------------------------------------

// モンスターリストの作成
function puzzdraMonsterCreate_monster_list(html, line) {
  var space_pos = html.indexOf("<div class=\"space\">");
  var space_endpos = html.indexOf("<!-- div.space -->");
  var monster_list = html.substring(space_pos + "<div class=\"space\">".length, space_endpos);

  var pos = monster_list.indexOf("<div class=\"mlist-box\">");
  var endpos = monster_list.indexOf("</div>", monster_list.indexOf("</div>", monster_list.indexOf("</div>", pos + 1) + 1) + 1);

  while(pos != -1) {
    var monster_info = monster_list.substring(pos + "<div class=\"mlist-box\">".length, endpos);
    puzzdraMonsterAdd_evolution_info(monster_info, line);
    puzzdraMonsterAdd_monster_info(monster_info, line);
    line++;
    pos = monster_list.indexOf("<div class=\"mlist-box\">", endpos+1);
    endpos = monster_list.indexOf("</div>", monster_list.indexOf("</div>", monster_list.indexOf("</div>", pos + 1) + 1) + 1);
  }

  return line;
};

// 進化情報をシートに追加
function puzzdraMonsterAdd_evolution_info(monster_info, line) {
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
};

// モンスター情報をシートに追加
function puzzdraMonsterAdd_monster_info(monster_info, line) {
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
};

// モンスター図鑑のリスト数を取得
function puzzdraMonsterList_count() {
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
};

// -----------------------------------------------------------------
// 究極進化リスト取得メソッド
// -----------------------------------------------------------------

function puzzdraUltimateMonsterGetBeforeResult(shinka) {
  // TODO: const
  var a_start_string = "<a href=\"/m";
  var a_end_string = "\">";
  var a_end2_string = "</a>";
  // 進化元
  var before = puzzdraXmlServiceGetElementsByClassName(shinka, "before");
  var before_name = puzzdraXmlServiceGetElementsByClassName(before[0], "name");
  var before_name_string = XmlService.getRawFormat().format(before_name[0]);
  var pos = before_name_string.indexOf(a_start_string);
  var endpos = before_name_string.indexOf(a_end_string, pos);
  var endpos2 = before_name_string.indexOf(a_end2_string, endpos);
  var before_monster_number = before_name_string.substring(pos + a_start_string.length, endpos);
  var put_before_string = "=\'モンスター一覧\'!B" + (Number(before_monster_number) + 1);
  var before_monster_name = before_name_string.substring(endpos + a_end_string.length, endpos2);
  return {number: before_monster_number, name: before_monster_name, result: put_before_string};
};

function puzzdraUltimateMonsterGetClearfixResults(shinka) {
  // TODO: const
  var a_start_string = "<a href=\"/m";
  var a_end_string = "\">";
  var a_end2_string = "</a>";
  // 進化先
  var results = [];
  var clearfixs = puzzdraXmlServiceGetElementsByClassName(shinka, "clearfix");
  for(var i = 0; i < clearfixs.length; i++) {
    // 進化素材
    var clearfix = clearfixs[i];
    var sozai = puzzdraXmlServiceGetElementsByClassName(clearfix, "sozai");
    var sozai_string = XmlService.getRawFormat().format(sozai[0]);

    var s_pos = sozai_string.indexOf(a_start_string);
    var s_endpos = sozai_string.indexOf(a_end_string, s_pos);

    var sozai_list = [];
    while(s_pos != -1) {
      var sozai_monster_number = sozai_string.substring(s_pos + a_start_string.length, s_endpos);
      sozai_list.push(sozai_monster_number);
      // 次の素材
      s_pos = sozai_string.indexOf(a_start_string, s_endpos + 1);
      s_endpos = sozai_string.indexOf(a_end_string, s_pos);
    }

    // 進化先
    var after = puzzdraXmlServiceGetElementsByClassName(clearfix, "after");
    var after_string = XmlService.getRawFormat().format(after[0]);
    var a_pos = after_string.indexOf(a_start_string);
    var a_endpos = after_string.indexOf(a_end_string, a_pos);
    var a_endpos2 = after_string.indexOf(a_end2_string, a_endpos);
    var shinka_monster_number = after_string.substring(a_pos + a_start_string.length, a_endpos);
    var put_shinka_string = "=\'モンスター一覧\'!B" + (Number(shinka_monster_number) + 1);
    var shinka_monster_name = after_string.substring(a_endpos + a_end_string.length, a_endpos2);

    var result = { sozai_list: sozai_list, shinka: {number: shinka_monster_number, name: shinka_monster_name, result: put_shinka_string} }
    results.push(result);
  }

  return results;
};

// -----------------------------------------------------------------
// XmlService を document っぽく使うやつ
// https://sites.google.com/site/scriptsexamples/learn-by-example/parsing-html
// - puzzdraXmlServiceGetElementById
// - puzzdraXmlServiceGetElementsByClassName
// - puzzdraXmlServiceGetElementsByTagName
// -----------------------------------------------------------------

function puzzdraXmlServiceGetElementById(element, idToFind) {
  var descendants = element.getDescendants();
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if( elt !=null) {
      var id = elt.getAttribute('id');
      if( id !=null && id.getValue()== idToFind) return elt;
    }
  }
};

function puzzdraXmlServiceGetElementsByClassName(element, classToFind) {
  var data = [];
  var descendants = element.getDescendants();
  descendants.push(element);
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if(elt != null) {
      var classes = elt.getAttribute('class');
      if(classes != null) {
        classes = classes.getValue();
        if(classes == classToFind) data.push(elt);
        else {
          classes = classes.split(' ');
          for(j in classes) {
            if(classes[j] == classToFind) {
              data.push(elt);
              break;
            }
          }
        }
      }
    }
  }
  return data;
};

function puzzdraXmlServiceGetElementsByTagName(element, tagName) {
  var data = [];
  var descendants = element.getDescendants();
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if( elt !=null && elt.getName()== tagName) data.push(elt);
  }
  return data;
};

// -----------------------------------------------------------------
// get
// -----------------------------------------------------------------

function getUltimateEvolutionList() {
  var content = UrlFetchApp.fetch("http://pd.appbank.net/kyukyoku");
  var html = content.getContentText();
  var start = html.indexOf("<div class=\"flexiblespace\">");
  var end = html.indexOf("<!-- flexiblespace -->", start);
  html = html.substring(start, end);
  var doc = XmlService.parse(html);
  var root = doc.getRootElement();
  var shinka = puzzdraXmlServiceGetElementsByClassName(root, "shinka");

  // TODO: const
  var a_start_string = "<a href=\"/m";
  var a_end_string = "\">";
  var a_end2_string = "</a>";

  // Sheet
  var spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spread_sheet.getSheetByName("究極進化一覧");
  var row = 2;

  for (var i = 0; i < shinka.length; i++) {
    // 進化元
    var before = puzzdraUltimateMonsterGetBeforeResult(shinka[i]);
    // 進化先
    var nexts = puzzdraUltimateMonsterGetClearfixResults(shinka[i]);

    for(var j = 0; j < nexts.length; j++) {
      // シートに追加
      var next = nexts[j];
      var column = 0;
      // 進化先
      column++;
      var cell = sheet.getRange(row, column);
      cell.setValue(next.shinka.result);
      // 進化元
      column++;
      cell = sheet.getRange(row, column);
      cell.setValue(before.result);
      // 進化素材
      for (var k = 0; k < next.sozai_list.length; k++) {
        column++;
        var put_sozai_string = "=\'モンスター一覧\'!B" + (Number(next.sozai_list[k]) + 1);
        cell = sheet.getRange(row, column);
        cell.setValue(put_sozai_string);
      }
      row++;
    }
  }
};

function getMonsterListOnlyNum(i) {
  var line = 2 + 100 * (i - 1);
  getMonsterList(i, line);
}

function getMonsterList(i, line) {
  Logger.log(i);
  var content = UrlFetchApp.fetch("http://pd.appbank.net/ml" + i);
  var html = content.getContentText();
  return puzzdraMonsterCreate_monster_list(html, line);
}

function getMonsterListWithLoop(start, end, line) {
  if (start > end) {
    return -1;
  }
  for (var i = start; i <= end; i++) {
    line = getMonsterList(i, line);
  }
  return line;
}

function getAllMonsterList() {
  var list_count_num = puzzdraMonsterList_count();
  var line = 2;
  line = getMonsterListWithLoop(1, list_count_num, line);
};

// -----------------------------------------------------------------
// 分割
// -----------------------------------------------------------------

function getML1to5() {
  for (var i = 1; i <= 5; i++) {
    getMonsterListOnlyNum(i);
  }
}

function getML6to10() {
  for (var i = 6; i <= 10; i++) {
    getMonsterListOnlyNum(i);
  }
}

function getML11to15() {
  for (var i = 11; i <= 15; i++) {
    getMonsterListOnlyNum(i);
  }
}

function getML16to16() {
  for (var i = 16; i <= 16; i++) {
    getMonsterListOnlyNum(i);
  }
}

// -----------------------------------------------------------------
// main
// -----------------------------------------------------------------

function main() {
  getMonsterList();
  getUltimateEvolutionList();
};
