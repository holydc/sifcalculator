function changeMemberPage(slot) {
  $.load("/cgi-bin/sif/sifcalculator", function(data, status) {
    alert("data: " + data + "\nstatus: " + status);
  });
  $("#unit_page").fadeOut(300);
  $("#member_page").fadeIn(300);
}

function changeUnitPage() {
  $("#member_page").fadeOut(300);
  $("#unit_page").fadeIn(300);
}

