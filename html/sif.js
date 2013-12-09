var SMILE = 0;
var PURE = 1;
var COOL = 2;
var HP = 3;

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
  },
  'helper' : [-1, 0.0],
  'songType' : 0,
  'update' : function() {
    var baseStatus = [0, 0, 0, 0];
    var kizunaBonus = [0, 0, 0];
    var bonus = [0, 0, 0];
    var skillBonus = [0.0, 0.0, 0.0];
    if (this.helper[0] >= 0) {
      skillBonus[this.helper[0]] += this.helper[1];
    }
    if (this.unit[4] != null) {
      skillBonus[this.unit[4].centerSkill[0]] += this.unit[4].centerSkill[1];
    }

    // count base status
    for (var i = 0; i < 9; i++) {
      if (this.unit[i] != null) {
        baseStatus[SMILE] += this.unit[i].smile;
        baseStatus[PURE] += this.unit[i].pure;
        baseStatus[COOL] += this.unit[i].cool;
        baseStatus[HP] += this.unit[i].hp;
        switch (this.unit[i].rarity) {
          case 1: // N
            //kizunaBonus[this.unit[i].type] += 25;
            //break;
          case 2: // N+
            kizunaBonus[this.unit[i].type] += 50;
            break;
          case 3: // R
            //kizunaBonus[this.unit[i].type] += 100;
            //break;
          case 4: // R+
            kizunaBonus[this.unit[i].type] += 200;
            break;
          case 5: // SR
            //kizunaBonus[this.unit[i].type] += 250;
            //break;
          case 6: // SR+
            kizunaBonus[this.unit[i].type] += 500;
            break;
          case 7: // UR
            //kizunaBonus[this.unit[i].type] += 500;
            //break;
          case 8: // UR+
            kizunaBonus[this.unit[i].type] += 1000;
            break;
          default:
            break;
        } // switch (this.unit[i].rarity)
      } // if (this.unit[i] != null)
    } // for (var i = 0; i < 9; i++)

    $('#unit-status-hp').text(baseStatus[HP]);

    // count bonus for each type
    for (var i = 0; i < 3; i++) {
      bonus[i] += Math.round(baseStatus[i] * skillBonus[i]);
      bonus[i] += kizunaBonus[i];
      var id = '#unit-status-';
      switch (i) {
        case SMILE:
          id += 'smile';
          break;
        case PURE:
          id += 'pure';
          break;
        case COOL:
          id += 'cool';
          break;
        default:
          break;
      }
      $(id).text(baseStatus[i] + bonus[i]);
      $('' + id + '-bonus').text(' +' + bonus[i]);
    }
    $('#debug').text('base: ' + baseStatus[0] + ', bonus: ' + bonus[0] + ', kizuna: ' + kizunaBonus + ', skill: ' + skillBonus[0]);
  } // function update
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
  var member = SIF.members[Number(event.data.index)];
  $('#debug').html('skill: ' + member.skill[0] + '/' + member.skill[1] + '<br>center: ' + member.centerSkill[0] + '/' + member.centerSkill[1]);

  // update unit
  SIF.unit[SIF.slot] = {
    'type' : member.type,
    'hp' : member.hp[2],
    'smile' : member.smile[2],
    'pure' : member.pure[2],
    'cool' : member.cool[2],
    'rarity' : member.rarity,
    'centerSkill' : [member.centerSkill[2], member.centerSkill[3]]
  };

  // center skill
  if (SIF.slot == 4) {
    if ((member.centerSkill[0] != '') && (member.centerSkill[1] != '')) {
      $('#center-skill-name').text(member.centerSkill[0]);
      $('#center-skill-effect').text(member.centerSkill[1]);
    } else {
      $('#center-skill-name').text('無し');
      $('#center-skill-effect').text('無し');
    }
  }

  SIF.update();

  // update unit image
  $('#unit-member-' + SIF.slot).html('').append(
      $('<img>').addClass('unit-member').attr({
        'alt' : member.charaName[0],
        'src' : member.img
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
          var x = (p * 792) + (col * 132);
          var y = 132 * row;
          $('#member-list').append(
              $('<img>').attr({
                'alt' : member.charaName[0],
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
  SIF.slot = Number(event.data.slot);
  $('#member-page').animate({
    'left' : '0',
    'opacity' : '1'
  });
}

function selectSong(type) {
  SIF.songType = type;
  SIF.update();
}

function selectHelper(type, bonus) {
  SIF.helper[0] = type;
  SIF.helper[1] = bonus;
  SIF.update();
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
            'id' : 'unit-status-hp'
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
            'id' : 'unit-status-smile'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-smile-bonus'
          }).text(' +0')));
  $('#unit-page').append(
      $('<div></div>').addClass('status-pure-bg').addClass('unit-status-panel').css({
        'left' : '471px',
        'width' : '150px'
      }).append(
          $('<span></span>').addClass('status-pure-text').addClass('unit-status-text-base').attr({
            'id' : 'unit-status-pure'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-pure-bonus'
          }).text(' +0')));
  $('#unit-page').append(
      $('<div></div>').addClass('status-cool-bg').addClass('unit-status-panel').css({
        'left' : '717px',
        'width' : '150px'
      }).append(
          $('<span></span>').addClass('status-cool-text').addClass('unit-status-text-base').attr({
            'id' : 'unit-status-cool'
          }).text('0')).append(
          $('<span></span>').addClass('status-bonus-text').addClass('unit-status-text-bonus').attr({
            'id' : 'unit-status-cool-bonus'
          }).text(' +0')));
  $('#unit-page').append(
      $('<div></div>').attr({
        'id' : 'center-skill-name'
      }).css({
        'font-size' : '22px',
        'left' : '276px',
        'position' : 'absolute',
        'top' : '122px'
      }).text('無し'));
  $('#unit-page').append(
      $('<div></div>').attr({
        'id' : 'center-skill-effect'
      }).css({
        'font-size' : '22px',
        'left' : '148px',
        'position' : 'absolute',
        'top' : '151px'
      }).text('無し'));
  $('#unit-page').append(
      $('<div></div>').css({
        'margin' : '10px',
        'position' : 'absolute',
        'right' : '0',
        'top' : '0'
      }).append(
          '楽曲: ').append($('<select></select>').addClass('live-setting').on('change', function() {
            selectSong(Number(this.value));
          }).append(
              $('<option></option>').text('スマイル').attr({
                'value' : SMILE
              })).append(
              $('<option></option>').text('ピュア').attr({
                'value' : PURE
              })).append(
              $('<option></option>').text('クール').attr({
                'value' : COOL
              }))).append(
          '支援: ').append($('<select></select>').addClass('live-setting').on('change', function() {
            var type = -1;
            var bonus = 0.0;
            switch (Number(this.value)) {
              case 1:
                type = SMILE;
                bonus = 0.03;
                break;
              case 2:
                type = SMILE;
                bonus = 0.06;
                break;
              case 3:
                type = SMILE;
                bonus = 0.09;
                break;
              case 4:
                type = PURE;
                bonus = 0.03;
                break;
              case 5:
                type = PURE;
                bonus = 0.06;
                break;
              case 6:
                type = PURE;
                bonus = 0.09;
                break;
              case 7:
                type = COOL;
                bonus = 0.03;
                break;
              case 8:
                type = COOL;
                bonus = 0.06;
                break;
              case 9:
                type = COOL;
                bonus = 0.09;
                break;
              case 0:
              default:
                break;
            }
            selectHelper(type, bonus);
          }).append(
              $('<option></option>').text('N').attr({
                'value' : 0
              })).append(
              $('<option></option>').text('スマイルR').attr({
                'value' : 1
              })).append(
              $('<option></option>').text('スマイルSR').attr({
                'value' : 2
              })).append(
              $('<option></option>').text('スマイルUR').attr({
                'value' : 3
              })).append(
              $('<option></option>').text('ピュアR').attr({
                'value' : 4
              })).append(
              $('<option></option>').text('ピュアSR').attr({
                'value' : 5
              })).append(
              $('<option></option>').text('ピュアUR').attr({
                'value' : 6
              })).append(
              $('<option></option>').text('クールR').attr({
                'value' : 7
              })).append(
              $('<option></option>').text('クールSR').attr({
                'value' : 8
              })).append(
              $('<option></option>').text('クールUR').attr({
                'value' : 9
              }))));

  // member page
  $('#main').append(
      $('<div></div>').addClass('page').attr({
        'id' : 'member-page'
      }).css({
        'background' : 'white',
        'left' : '960px',
        'opacity' : '0',
        'overflow' : 'hidden',
        'z-index' : '5'
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
        'z-index' : '5'
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

