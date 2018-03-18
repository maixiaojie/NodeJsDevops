$(document).ready(function() {
  $(".main_contents").mCustomScrollbar({
    axis: "yx"
  });
  $(".console_warp").mCustomScrollbar({
    axis: "yx"
  });
  var socket = null,socketStatus = false;
  $('#connect').on('click', function() {
    socket = io.connect('http://localhost:8001');
    socket.on('connect', function() {
      $('#connectionStatus').find('span').addClass('on');
      handleConsoleMsg({sysin: "socket connected.."});
      socketStatus = true;
    });
    socket.on('disconnect', function() {
      $('#connectionStatus').find('span').removeClass('on');
      handleConsoleMsg({sysin: "socket disconnected.."});
      socketStatus = false;
    });
    socket.on('projectList', handleprojectList);
    socket.on('projectDetail', handleprojectDetail);
    socket.on('buildDetail', handlebuildDetail);
    socket.on('restartDetail', handlerestartDetail);




  })
  $('#disconnect').on('click', function() {
    socketStatus && socket.close();
  })
  // 获取pm2部署列表
  $('#pullProjectList').on('click', function() {
    socketStatus && socket.emit('getProjectList', {}) && handleConsoleMsg({stdin: "pm2 list"});
  });
  function syncEvent() {
    //查看详情
    $('.getLogs').on('click', function() {
      var id = $(this).closest('td').attr('id');
      var data = {stdin: "pm2 show " + id};
      socketStatus && socket.emit('getDetail', data) && handleConsoleMsg(data);
    });
    $('.restart').on('click', function() {
      var id = $(this).closest('td').attr('id');
      var data = {stdin: "pm2 restart " + id};
      socketStatus && socket.emit('restart', data) && handleConsoleMsg(data);
    })
  }
  function buildProject() {
    $('.build').on('click', function() {
      var id = $(this).closest('td').attr('id');
      var cwd = $(this).attr('cwd');
      var data = {stdin: "cd "+ cwd+ " && git pull && npm install"};
      socketStatus && socket.emit('build', data) && handleConsoleMsg(data);
    });
  }
  function handleprojectList(rsdata) {
    var str = rsdata.stdout;
    var str1 = str.replace(/─|┐|┤|┌|┬|┘|┼|┴|└|├/g, "");
    var arr = str1.split('\n');
    var str2 = new Array();
    var data = [],
      json = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] !== "" && arr[i].indexOf("│") > -1) {
        data.push(arr[i].replace(/\s/g, "").split("│"))
      }
    }
    for (var j = 0; j < data.length; j++) {
      var json1 = {};
      for (var m = 0; m < data[j].length; m++) {
        if (data[j][m].length > 0 && j > 0) {
          json1[data[0][m]] = data[j][m];
        }
      }
      if (j > 0) {
        json.push(json1);
      }
    }
    handleProjectData(json);
    handleConsoleMsg(rsdata);

  }
  function handleProjectData(data) {
    $('#projectListTable').find('tr').eq(0).nextAll().remove();
    var len = data.length, html="", i=0;
    len == 0 && (function() {
      html = '<tr><td colspan="12" style="text-align:center;">暂无数据</td></tr>';
    })()
    len > 0 && (function() {
      for(i; i<len; i++) {
        html += '<tr>';
        html += '<td>'+data[i].Appname+'</td>';
        html += '<td>'+data[i].id+'</td>';
        html += '<td>'+data[i].mode+'</td>';
        html += '<td>'+data[i].pid+'</td>';
        html += '<td>'+data[i].status+'</td>';
        html += '<td>'+data[i].restart+'</td>';
        html += '<td>'+data[i].uptime+'</td>';
        html += '<td>'+data[i].cpu+'</td>';
        html += '<td>'+data[i].mem+'</td>';
        html += '<td>'+data[i].user+'</td>';
        html += '<td>'+data[i].watching+'</td>';
        html += '<td id="'+data[i].id+'"><span class="getLogs">查看详情</span><span class="restart">重新启动</span><span class="build">构建代码</span></td>';
        html += '</tr>';
      }
    })()
    $('#projectListTable').last().append(html);
    $(".main_contents").mCustomScrollbar('update');
    syncEvent();
  }
  function handleprojectDetail(data) {
    handleConsoleMsg(data);
    var str = data.stdout;
    str = str.replace(/\s/g, "");
    str = str.replace(/\n\r/g, "");
    // │scriptid│0││execcwd│
    // │execcwd│D:\github\youkeWinXin││execmode│
    var reg1 = /│scriptid│(\S*)││execcwd│/g;
    var reg2 = /│execcwd│(\S*)││execmode│/g;
    var id = str.match(reg1)[0].replace(/│scriptid│/g, "").replace(/││execcwd│/g, "");
    var cwd = str.match(reg2)[0].replace(/│execcwd│/g, "").replace(/││execmode│/g, "");
    console.log({id, cwd})
    $('td[id="'+id+'"]').find('.build').attr('cwd', cwd);
    buildProject();
  }
  function handlebuildDetail(data) {
    handleConsoleMsg(data);
  }
  function handlerestartDetail(data) {
    handleConsoleMsg(data);
  }
  function handleConsoleMsg(data) {
    var html = '';
    if(data.stdin) {
      html += `<p class="stdin"> > ${data.stdin}</p>`;
    }
    if(data.sysin) {
      html += `<p class="stdin"> [system] ${data.sysin}</p>`;
    }
    if (data.err) {
      html += `<p class="err">${data.err}</p>`;
    }
    if (data.stdout) {
      html += `<p class="stdout">${data.stdout}</p>`;
    }
    if (data.stderr) {
      html += `<p class="stderr">${data.stderr}</p>`;
    }
    $('#messages').append(html);
    $(".console_warp").mCustomScrollbar("update"); //update
    $(".console_warp").mCustomScrollbar("scrollTo", "bottom", {
      scrollInertia: 1000
    });
  }
})
