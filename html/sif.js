var g_unit = new Array();
for (var i = 0 ; i < 9; i++) {
  g_unit[i] = null;
}
var g_member_list;
var g_member_slot;
var g_member_index;
var g_page = 1;
var g_num_pages;

function countMemberListOffset() {
  return (84 - (792 * (g_page - 1)));
}

function getMemberList(req) {
  $.getJSON(req).done(function(data) {
    g_member_list = data;
    g_num_pages = Math.ceil(data.length / 18);

    // initialize ui
    $("#member_list").css("width", "" + (792 * g_num_pages) + "px");
    $("#member_list").css("left", "84px");
    $("#img_previous").css("display", "none");
    if (g_num_pages == 1) {
      $("#img_next").css("display", "none");
    }
    for (var p = 0; p < g_num_pages; p++) {
      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 3; j++) {
          var index = (p * 18) + (i * 3) + j;
          var member = data[index];
          member.index = index;
          var x = (p * 792) + (132 * i);
          var y = 132 * j;
          var img = "<img class='member' id='member_" + index + "' src='" + member.img + "' style='left:" + x + "px;top:" + y + "px' onclick='selectMember(" + index + ");' />";
          $("#member_list").append(img);
        }
      }
    }
  }).fail(function(xhr, status) {
    alert("fail\n" + status + "\n" + xhr.status + "\n" + xhr.statusText + "\n" + xhr.responseText);
  });
}

$(document).ready(function() {
  // unit page
  for (var i = 0; i < 9; i++) {
    var slot = "<div class='unit_member' id='slot_" + i + "' onclick='showMemberPage(" + i + ");' style='left:" + (48 + (96 * i)) + "px;'></div>";
    $("#unit_page").append(slot);
  }

  // member page
  getMemberList("/cgi-bin/sifcalculator/sifcalculator");
});

function showMemberPage(slot) {
  g_member_slot = slot;
  $("#member_page").css("display", "inherit");
  $("#member_page").animate({left:"0px", opacity:"1.0"});
}

function selectMember(index) {
  // update status
  var hp = Number($("#hp").text()) + g_member_list[index].final_max_hp;
  var smile = Number($("#smile").text()) + g_member_list[index].final_max_smile;
  var pure = Number($("#pure").text()) + g_member_list[index].final_max_pure;
  var cool = Number($("#cool").text()) + g_member_list[index].final_max_cool;
  var member = g_unit[g_member_slot];
  if (member != null) {
    hp -= member.final_max_hp;
    smile -= member.final_max_smile;
    pure -= member.final_max_pure;
    cool -= member.final_max_cool;
  }
  $("#hp").text(hp);
  $("#smile").text(smile);
  $("#pure").text(pure);
  $("#cool").text(cool);

  // update unit
  g_unit[g_member_slot] = g_member_list[index];
  var img = "<img src='" + g_member_list[index].img + "' width='96' height='96' />";
  $("#slot_" + g_member_slot).html(img);

  // switch page
  $("#member_page").animate({opacity:"0.0"}, function() {
    $("#member_page").css("left", "960px");
    $("#member_page").css("display", "none");
  });
}

function showMemberDetail(index) {
  // TODO
}

function showUnitMemberDetail(slot) {
  if (g_unit[slot] != null) {
    showMemberDetail(g_unit[slot].index);
  }
}

function switchPage(step) {
  g_page += step;
  $("#debug").text("" + g_page + "/" + g_num_pages);
  $("#member_list").animate({left:"" + countMemberListOffset() + "px"});
  if (g_page <= 1) {
    g_page = 1;
    $("#img_previous").css("display", "none");
  } else if (g_page >= g_num_pages) {
    g_page = g_num_pages;
    $("#img_next").css("display", "none");
  } else {
    $("#img_previous").css("display", "inherit");
    $("#img_next").css("display", "inherit");
  }
}

