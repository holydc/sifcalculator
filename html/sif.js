var SIF = {
  'unit' : [null, null, null, null, null, null, null, null, null],
  'members' : null,
  'slot' : -1,
  'page' : 0,
  'getNumPages' : function() {
    if (this.members == null) {
      return 0;
    } else {
      return (Math.ceil(this.members.length / 18));
    }
  }
};

function switchPage(event) {
  SIF.page += event.data.step;
  if (SIF.page == 0) {
    $('#previous-page-img').css({
      'display' : 'none'
    });
  } else {
    $('#previous-page-img').css({
      'display' : 'inline'
    });
  }
  if (SIF.page == (SIF.getNumPages() - 1)) {
    $('#next-page-img').css({
      'display' : 'none'
    });
  } else {
    $('#next-page-img').css({
      'display' : 'inline'
    });
  }
  $('#member-list').animate({
    'left' : ('' + (84 - (792 * SIF.page)) + 'px')
  });
}

function selectMember(event) {
  var member = SIF.members[event.data.index];

  // update status
  var hp = Number($('#unit-status-hp-base').text()) + member.final_max_hp;
  var smile = Number($('#unit-status-smile-base').text()) + member.final_max_smile;
  var pure = Number($('#unit-status-pure-base').text()) + member.final_max_pure;
  var cool = Number($('#unit-status-cool-base').text()) + member.final_max_cool;
  if (SIF.unit[SIF.slot] != null) {
    hp -= SIF.unit[SIF.slot].final_max_hp;
    smile -= SIF.unit[SIF.slot].final_max_smile;
    pure -= SIF.unit[SIF.slot].final_max_pure;
    cool -= SIF.unit[SIF.slot].final_max_cool;
  }
  $('#unit-status-hp-base').text(hp);
  $('#unit-status-smile-base').text(smile);
  $('#unit-status-pure-base').text(pure);
  $('#unit-status-cool-base').text(cool);

  // update unit
  SIF.unit[SIF.slot] = member;
  $('#unit-member-' + SIF.slot).html('').append(
      $('<img>').addClass('unit-member').attr({
        'src' : member.img,
        'alt' : member._name
      }));

  // switch page
  $('#member-page').animate({
    'opacity' : '0'
  }, function() {
    $('#member-page').css({
      'left' : '960px'
    });
  });
}

function getMembers(req) {
  $.getJSON(req).done(function(data) {
    SIF.members = data;

    // reset elements
    SIF.page = 0;
    var numPages = SIF.getNumPages();
    $('#member-list').html('').css({
      'left' : '84px',
      'width' : ('' + (792 * numPages) + 'px')
    });
    $('#previous-page-img').css({
      'display' : 'none'
    });
    if (numPages == 1) {
      $('#next-page-img').css({
        'display' : 'none'
      });
    }

    // show member list
    for (var p = 0; p < numPages; p++) {
      for (var col = 0; col < 6; col++) {
        for (var row = 0; row < 3; row++) {
          var index = (p * 18) + (col * 3) + row;
          if (index >= data.length) {
            break;
          }
          var member = data[index];
          member.index = index;
          var x = (p * 792) + (col * 132);
          var y = 132 * row;
          $('#member-list').append(
              $('<img>').attr({
                'alt' : member._name,
                'src' : member.img
              }).css({
                'cursor' : 'pointer',
                'height' : '132px',
                'left' : ('' + x + 'px'),
                'position' : 'absolute',
                'top' : ('' + y + 'px'),
                'width' : '132px'
              }).on('click', {
                'index' : index
              }, selectMember));
        }
      }
    }
  }).fail(function(xhr, status) {
    alert("fail\n" + status + "\n" + xhr.status + "\n" + xhr.statusText + "\n" + xhr.responseText);
  });
}

function showMembers(event) {
  SIF.slot = event.data.slot;
  $('#member-page').animate({
    'left' : '0',
    'opacity' : '1'
  });
}

$(document).ready(function() {
  // unit page
  $('#main').append(
      $('<div></div>').addClass('page').attr({
        'id' : 'unit-page'
      }).css({
        'background' : 'url(img/bg.png)',
        'z-index' : '1'
      }));
  for (var i = 0; i < 9; i++) {
    $('#unit-page').append(
        $('<div></div>').addClass('unit-member').attr({
          'id' : ('unit-member-' + i)
        }).css({
          'cursor' : 'pointer',
          'left' : ('' + (48 + (96 * i)) + 'px'),
          'position' : 'absolute',
          'top' : '177px'
        }).on('click', {
          'slot' : i
        }, showMembers));
  }
  $('#unit-page').append(
      $('<div></div>').addClass('status-hp-bg').addClass('unit-status-panel').css({
        'left' : '103px',
        'width' : '40px'
      }).append(
          $('<span></span>').addClass('status-hp-text').addClass('unit-status-text-base').attr({
            'id' : 'unit-status-hp-base'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-hp-bonus'
          })));
  $('#unit-page').append(
      $('<div></div>').addClass('status-smile-bg').addClass('unit-status-panel').css({
        'left' : '225px',
        'width' : '150px'
      }).append(
          $('<span></span>').addClass('status-smile-text').addClass('unit-status-text-base').attr({
            'id' : 'unit-status-smile-base'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-smile-bonus'
          })));
  $('#unit-page').append(
      $('<div></div>').addClass('status-pure-bg').addClass('unit-status-panel').css({
        'left' : '471px',
        'width' : '150px'
      }).append(
          $('<span></span>').addClass('status-pure-text').addClass('unit-status-text-base').attr({
            'id' : 'unit-status-pure-base'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-pure-bonus'
          })));
  $('#unit-page').append(
      $('<div></div>').addClass('status-cool-bg').addClass('unit-status-panel').css({
        'left' : '717px',
        'width' : '150px'
      }).append(
          $('<span></span>').addClass('status-cool-text').addClass('unit-status-text-base').attr({
            'id' : 'unit-status-cool-base'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-cool-bonus'
          })));

  // member page
  $('#main').append(
      $('<div></div>').addClass('page').attr({
        'id' : 'member-page'
      }).css({
        'background' : 'white',
        'left' : '960px',
        'opacity' : '0',
        'overflow' : 'hidden',
        'z-index' : '3'
      }));
  // top
  $('#member-page').append(
      $('<div></div>').css({
        'height' : '48px',
        'position' : 'absolute',
        'width' : '100%'
      }));
  // left
  $('#member-page').append(
      $('<div></div>').addClass('member-page-side').append(
          $('<img>').addClass('switch-page-img').attr({
            'alt' : 'previous page',
            'id' : 'previous-page-img',
            'src' : 'img/previous.png'
          }).on('click', {
            'step' : -1
          }, switchPage)));
  // center
  $('#member-page').append(
      $('<div></div>').attr({
        'id' : 'member-list'
      }).css({
        'height' : '396px',
        'left' : '48px',
        'position' : 'absolute',
        'top' : '48px',
        'width' : '792px',
        'z-index' : '4'
      }));
  // right
  $('#member-page').append(
      $('<div></div>').addClass('member-page-side').css({
        'right' : '0'
      }).append(
          $('<img>').addClass('switch-page-img').attr({
            'alt' : 'next page',
            'id' : 'next-page-img',
            'src' : 'img/next.png'
          }).on('click', {
            'step' : 1
          }, switchPage)));
  // bottom
  $('#member-page').append(
      $('<div></div>').css({
        'bottom' : '0',
        'height' : '196px',
        'left' : '0',
        'position' : 'absolute',
        'width' : '100%'
      }));

  // read member list
  getMembers('/cgi-bin/sifcalculator/member');
});

