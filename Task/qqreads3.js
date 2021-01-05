/* ziye

github地址     https://github.com/ziye12/JavaScript
TG频道地址     https://t.me/ziyescript
TG交流群       https://t.me/joinchat/AAAAAE7XHm-q1-7Np-tF3g
boxjs链接      https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/ziye.boxjs.json

转载请备注个名字，谢谢

11.25 增加 阅读时长上传，阅读金币，阅读随机金币
11.25 修复翻倍宝箱不同时领取的问题.增加阅读金币判定
11.25 修复阅读时长问题，阅读金币问题，请重新获取时长cookie
11.26 随机金币只有一次，故去除，调整修复阅读金币问题，增加时长上传限制
11.26 增加领取周时长奖励
11.26 增加结束命令
11.27 调整通知为，成功开启宝箱再通知
11.28 修复错误
11.29 更新 支持action.默认每天21点到21点20通知
12.2 修复打卡问题
12.3 缩短运行时间，由于企鹅读书版本更新.请手动进去看一次书
12.3 调整推送时间为12点和24点左右
12.6 精简打印通知
12.7 解决1金币问题，务必重新获取一次更新body
12.8 更新支持boxjs
12.10 默认现金大于10且在23点提现10元，23点40后显示今日收益统计
12.11 修复git与手机 时间不兼容问题
      

⚠️cookie获取方法：

进 https://m.q.qq.com/a/s/d3eacc70120b9a37e46bad408c0c4c2a  

进书库选择一本书,看10秒以下,然后退出，获取时长url和时长header以及更新body，看书一定不能超过10秒



Secrets对应关系如下，多账号默认换行

qqreadbodyVal         👉   QQREAD_BODY
qqreadtimeurlVal      👉   QQREAD_TIMEURL
qqreadtimeheaderVal   👉   QQREAD_TIMEHD



⚠️宝箱奖励为20分钟一次，自己根据情况设置定时，建议设置11分钟一次

hostname=mqqapi.reader.qq.com

############## 圈x

#企鹅读书获取更新body
https:\/\/mqqapi\.reader\.qq\.com\/log\/v4\/mqq\/track url script-request-body https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/qqreads.js

#企鹅读书获取时长cookie
https:\/\/mqqapi\.reader\.qq\.com\/mqq\/addReadTimeWithBid? url script-request-header https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/qqreads.js

############## loon

//企鹅读书获取更新body
http-request https:\/\/mqqapi\.reader\.qq\.com\/log\/v4\/mqq\/track script-path=https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/qqreads.js,requires-body=true, tag=企鹅读书获取更新body

//企鹅读书获取时长cookie
http-request https:\/\/mqqapi\.reader\.qq\.com\/mqq\/addReadTimeWithBid? script-path=https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/qqreads.js, requires-header=true, tag=企鹅读书获取时长cookie

############## surge

//企鹅读书获取更新body
企鹅读书获取更新body = type=http-request,pattern=https:\/\/mqqapi\.reader\.qq\.com\/log\/v4\/mqq\/track,script-path=https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/qqreads.js, 

//企鹅读书获取时长cookie
企鹅读书获取时长cookie = type=http-request,pattern=https:\/\/mqqapi\.reader\.qq\.com\/mqq\/addReadTimeWithBid?,script-path=https://raw.githubusercontent.com/ziye12/JavaScript/master/Task/qqreads.js, 


*/

const jsname = "企鹅读书";
const $ = Env(jsname);
$.cash = ($.getval('qeCASH') || '10') - 0;
$.suffix = i => i > 0 ? i + 1 + '' : '';
const notify = $.isNode() ? require("./sendNotify") : "";

let COOKIES_SPLIT = "\n"; // 自定义多cookie之间连接的分隔符，默认为\n换行分割，不熟悉的不要改动和配置，为了兼容本地node执行

const logs = 0; // 0为关闭日志，1为开启
const notifyInterval = ($.getval('qeNotify') || 3) - 0;
// 0为关闭通知，1为所有通知，2为宝箱领取成功通知，3为宝箱每15次通知一次

const dd = 1; // 单次任务延迟,默认1秒
const TIME = 30; // 单次时长上传限制，默认5分钟
const maxtime = 10; // 每日上传时长限制，默认10小时
const wktimess = 1200; // 周奖励领取标准，默认1200分钟

// 执行环境所在时区的时间
const currDate = new Date();
// UTC+8 东八区北京时间戳
const utc8 = currDate.getTime() + (currDate.getTimezoneOffset() * 60 * 1000) + 8 * 60 * 60 * 1000;
const d = new Date(utc8);

const qqreadbdArr = [];
const qqreadtimeurlArr = [];
const qqreadtimehdArr = [];
let qqreadBD = [];
let qqreadtimeURL = [];
let qqreadtimeHD = [];

!(async () => {
  if ((typeof $request !== "undefined")) {
    await GetCookie();
  } else {
    initAccountData();
    const concurrency = Math.max(1, ($.getdata('qeConcurrency') || '2') - 0);
    $.log('', `============ 共${qqreadtimehdArr.length}个企鹅读书账号,每${concurrency}个账号将并发开宝箱,北京时间(UTC+8)：${new Date(utc8).toLocaleString()}  =============`, '');
    let acTask = [], allAcList = [];
    for (let i = 0; i < qqreadtimehdArr.length; i++) {
      if (qqreadtimehdArr[i]) {
        acTask.push(all({
          qq: (qqreadtimehdArr[i].match(/ywguid=(.+?);/) || ['', ''])[1],
          kz: '',
          tz: '',
          qqreadbodyVal: qqreadbdArr[i],
          qqreadtimeurlVal: qqreadtimeurlArr[i],
          qqreadtimeheaderVal: qqreadtimehdArr[i]
        }));
        if ((acTask.length % concurrency) == 0) {
          await Promise.all(acTask).then(acList => {
            allAcList.push(...acList);
          });
          acTask = [];
        }
      }
    }
    if (acTask.length > 0) {
      await Promise.all(acTask).then(acList => {
        allAcList.push(...acList);
      });
      acTask = [];
    }
    for (let i = 0; i < allAcList.length; i++) {
      acTask.push(all(allAcList[i], false));
      if ((i & 1) == 1) {
        await Promise.all(acTask);
        acTask = [];
      }
    }
    if (acTask.length > 0) {
      await Promise.all(acTask);
      acTask = [];
    }
    if (allAcList.length > 0) {
      showmsg(allAcList); // 通知
    } else {
      $.log('无账号任务结果可通知')
    }
  }
})().catch((e) => $.logErr(e)).finally(() => $.done());

function GetCookie() {
  return new Promise((resolve, reject) => {
    try {
      if ($request && $request.url.indexOf("addReadTimeWithBid?") >= 0 && $request.url.indexOf("book-category") >= 0) {
        const qqreadtimeurlVal = $request.url;
        const qqreadtimeheaderVal = JSON.stringify($request.headers);
        $.log('', `[${jsname}] 获取时长url,qqreadtimeurlVal: ${qqreadtimeurlVal}`, `[${jsname}] 获取时长header,qqreadtimeheaderVal: ${qqreadtimeheaderVal}`, '');
        let ck = $request.headers['Cookie'] + ';';
        let acNo = (ck.match(/ywguid=(.+?);/) || ['', ''])[1];
        if (acNo) {
          let seatNo = getSeatNo(acNo, true); // 保存在哪个账号坑位，小于1时不保存
          if (seatNo) {
            $.idx = $.suffix(Math.abs(seatNo) - 1);
            $.setdata(qqreadtimeurlVal, "qqreadtimeurl" + $.idx);
            $.setdata(qqreadtimeheaderVal, "qqreadtimehd" + $.idx);
            $.msg(jsname + $.idx + `: ${acNo}`, `${seatNo>0?'新增':'更新'}时长url & header: 成功🎉`, ``);
          } else {
            $.msg(jsname, ``, `账号坑位不足，新账号数据无法添加，请在boxjs中增加账号个数后再获取`);
          }
        } else {
          $.msg(jsname, ``, `抓取的数据中无QQ号信息，可能是QQ阅读小程序调整了CK数据格式，请等待修复`);
        }
      } else if ($request && $request.body && $request.body.indexOf("bookDetail_bottomBar_read_C") >= 0 &&
        $request.body.indexOf("bookRead_show_I") >= 0 && $request.body.indexOf("topBar_left_back_C") < 0 &&
        $request.body.indexOf("bookLib2_bookList_bookClick_C") >= 0 && $request.body.indexOf("bookRead_dropOut_shelfYes_C") < 0) {
        const qqreadbodyVal = $request.body;
        $.log('', `[${jsname}] 获取更新body,qqreadbodyVal: ${qqreadbodyVal}`, '');
        let acNo = (qqreadbodyVal.match(/"guid":(.+?)(,|\})/) || ['', ''])[1];
        if (acNo) {
          let seatNo = getSeatNo(acNo, false); // 保存在哪个账号坑位，小于1时不保存
          if (seatNo) {
            $.idx = $.suffix(Math.abs(seatNo) - 1);
            $.setdata(qqreadbodyVal, "qqreadbd" + $.idx);
            $.msg(jsname + $.idx + `: ${acNo}`, `${seatNo>0?'新增':'更新'}更新body: 成功🎉`, ``);

          } else {
            $.msg(jsname, ``, `请优先获取时长url & header数据`);
          }
        } else {
          $.msg(jsname, ``, `抓取的数据中无QQ号信息，可能是QQ阅读小程序调整了CK数据格式，请等待修复`);
        }
      }
      resolve()
    } catch (e) {
      reject(e)
    }
  });
}

function getSeatNo(acNo, useNull = false) {
  let seatNo = 0;
  // 根据qq号找到可以存储数据的账号位
  let qeCount = ($.getval('qeCount') || '1') - 0;
  for (let i = 0; i < qeCount; i++) {
    let hd = $.getdata(`qqreadtimehd${$.suffix(i)}`);
    if (hd) {
      // 数据存在，判断是否为当前账号的数据
      if ((hd.match(/ywguid=(.+?);/) || ['', ''])[1] == acNo) {
        seatNo = -(i + 1);
        break;
      }
    } else if (useNull && !seatNo) {
      // 数据不存在且存储位是初始状态，暂时设置为存储位
      seatNo = i + 1;
    }
  }
  return seatNo;
}
function all(ac, onlyBox = true) {
  return new Promise(async resolve => {
    try {
      let task = onlyBox ? await qqreadtask(ac).catch(e => $.log(e)) : ac['task']; // 任务列表
      if (task) {
        if (onlyBox) {
          ac['task'] = task;
          if (task.taskList[0].doneFlag == 0) {
            await Promise.all([
              qqreadtrack(ac), //更新
              qqreaddayread(ac) // 立即阅读任务
            ]);
          }
          if (task.treasureBox.doneFlag != 0 && task.treasureBox.timeInterval < 10000) {
            await $.wait(task.treasureBox.timeInterval); // 10秒内能开宝箱，则等待对应时长后再去开宝箱
            task.treasureBox.doneFlag = 0;
          }
          if (task.treasureBox.doneFlag == 0) await qqreadbox(ac); // 宝箱
          if (task.treasureBox.doneFlag == 0 || task.treasureBox.videoDoneFlag == 0) {
            if (task.treasureBox.doneFlag == 0) await $.wait(3000);
            await qqreadbox2(ac); // 宝箱翻倍
          }
          // 开完宝箱后直接返回，待下次跑其它任务
          return;
        }
        if (task.taskList[3].doneFlag == 0) await qqreadvideo(ac); // 视频任务 
        if (task.taskList[2].doneFlag == 0) {
          await qqreadsign(ac); // 金币签到
          await qqreadtake(ac); // 阅豆签到
          await qqreadsign2(ac); // 签到翻倍
        }
        let config, wktime;
        await Promise.all([
          qqreadconfig(ac), // 时长查询
          qqreadwktime(ac) // 周时长查询
        ]).then(arr => {
          config = arr[0];
          wktime = arr[1];
        });
        if (config) {
          if (task.taskList[1].doneFlag == 0) {
            let tcList = task.taskList[1].config;
            for (let tci = 0; tci < tcList.length; tci++) {
              if (tcList[tci].doneFlag == 0) {
                if (config && config.todayReadSeconds >= tcList[tci].seconds) {
                  await qqreadssr(ac, tci + 1, tcList[tci].seconds); // 阅读得金币
                }
                break;
              }
            }
          }
          if (config && config.todayReadSeconds / 3600 <= maxtime) {
            await qqreadtime(ac); // 上传时长
          }
        }
        if (wktime && wktime.readTime >= wktimess && wktime.readTime <= 1250) await qqreadpick(ac); // 领周时长奖励
        if (d.getHours() > 6 && [1, 2, 10, 30, 50, 100].includes($.cash) && task.user.amount >= $.cash * 10000) await qqreadwithdraw(ac); //现金提现
        await Promise.all([
          qqreadtrans(ac), ////今日收益累计
          qqreadinfo(ac) // 用户名
        ]);
      }
    } catch (e) {
      ac['e'] = e;
      await qqreadinfo(ac); // 尝试获取用户名
    } finally {
      resolve(ac);
    }
  });
}

// 任务列表
function qqreadtask(ac) {
  return new Promise((resolve, reject) => {
    try {
      const toqqreadtaskurl = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/page?fromGuid=",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadtaskurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 任务列表: ${data}`);
          let task = JSON.parse(data);
          task = task && task.code == 0 && task.data;
          if (!task) {
            if (data == `{"code":-2,"msg":"登陆失败"}`) {
              $.msg(`${jsname}: ${ac.qq}`, "COOKE失效：❌❌❌请点击前往获取cookie", "https://m.q.qq.com/a/s/d3eacc70120b9a37e46bad408c0c4c2a", {"open-url": "https://m.q.qq.com/a/s/d3eacc70120b9a37e46bad408c0c4c2a"});
            }
            reject(`${ac.qq}任务列表获取失败:${data}`);
            return;
          }
          ac.kz +=
            `【现金余额】:${(task.user.amount / 10000).toFixed(2)}元\n` +
            `【已开宝箱】:${task.treasureBox.count}个\n`;
          ac.tz +=
            `【现金余额】:${(task.user.amount / 10000).toFixed(2)}元\n` +
            `【第${task.invite.issue}期】:时间${task.invite.dayRange}\n` +
            ` 已邀请${task.invite.inviteCount}人，再邀请${task.invite.nextInviteConfig.count}人获得${task.invite.nextInviteConfig.amount}金币\n` +
            `【${task.fans.title}】:${task.fans.fansCount}个好友,${task.fans.todayAmount}金币\n` +
            `【${task.taskList[0].title}】:${task.taskList[0].amount}金币,${task.taskList[0].actionText}\n` +
            `【${task.taskList[1].title}】:${task.taskList[1].amount}金币,${task.taskList[1].actionText}\n` +
            `【${task.taskList[2].title}】:${task.taskList[2].amount}金币,${task.taskList[2].actionText}\n` +
            `【${task.taskList[3].title}】:${task.taskList[3].amount}金币,${task.taskList[3].actionText}\n` +
            `【宝箱任务${task.treasureBox.count + 1}】:${task.treasureBox.tipText}\n`;
          resolve(task);
        } catch (e) {
          reject(`${ac.qq}任务列表获取异常：${e}`);
        }
      });
    } catch (e) {
      reject(`${ac.qq}任务列表获取异常：${e}`);
    }
  });
}

// 金币统计
function qqreadtrans(ac) {
  return new Promise(async (resolve, reject) => {
    $.log('金币统计。。。');
    try {
      setTimeout(resolve, 2 * 1000); // 2秒未统计完成，结束等待
      let day = 0;
      let bFlag = false;
      for (var y = 1; y < 9; y++) {
        const daytime = new Date(d.toLocaleDateString()).getTime()
        const toqqreadtransurl = {
          url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/trans/list?ps=40&pn=" + y,
          headers: JSON.parse(ac.qqreadtimeheaderVal),
          timeout: 6000,
        };
        await (() => {
          return new Promise((res) => {
            $.get(toqqreadtransurl, (error, response, data) => {
              try {
                let pageAmount = 0;
                if (logs) $.log(`${jsname}, 今日收益: ${data}`);
                let obj = JSON.parse(data);
                let list = (obj && obj.code == 0 && obj.data && obj.data.list) || [];
                if (list.length > 0) {
                  for (var i = 0, l = list.length; i < l; i++) {
                    if (list[i].createTime >= daytime) {
                      pageAmount += list[i].amount;
                    } else {
                      bFlag = true;
                      break;
                    }
                  }
                }
                if (pageAmount > 0) {
                  day += pageAmount;
                } else {
                  bFlag = true;
                }
                if (bFlag) {
                  ac.tz += "【今日收益】:获得" + day + '\n'
                }
                res();
              } catch (e) {
                $.log(`${ac.qq}今日收益统计异常：${e}`)
                res();
              }
            });
          });
        })();
        if (bFlag) {
          break;
        }
      }
      resolve();
    } catch (e) {
      $.log(`${ac.qq}今日收益统计异常：${e}`)
      resolve();
    }
  });
}



// 更新
function qqreadtrack(ac) {
  return new Promise((resolve) => {
    $.log('数据更新。。。');
    try {
      if (ac.qqreadbodyVal) {
        const toqqreadtrackurl = {
          url: "https://mqqapi.reader.qq.com/log/v4/mqq/track",
          headers: JSON.parse(ac.qqreadtimeheaderVal),
          body: ac.qqreadbodyVal.replace(new RegExp(/"dis":[0-9]{13}/), `"dis":${d.getTime()}`),
          timeout: 6000,
        };
        $.post(toqqreadtrackurl, (error, response, data) => {
          try {
            if (logs) $.log(`${jsname}, 更新: ${data}`);
            ac.tz += `【数据更新】:更新${JSON.parse(data).msg}\n`;
            resolve();
          } catch (e) {
            $.log(`${ac.qq}【数据更新】执行异常：${e}`)
            resolve();
          }
        })
      } else {
        resolve();
      }
    } catch (e) {
      $.log(`${ac.qq}【数据更新】执行异常：${e}`)
      resolve();
    }
  });
}


//提现
function qqreadwithdraw(ac) {
  return new Promise((resolve, reject) => {
    $.log('现金提现。。。');
    try {
      const toqqreadwithdrawurl = {
        url: `https://mqqapi.reader.qq.com/mqq/red_packet/user/withdraw?amount=${$.cash*10000}`,
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.post(toqqreadwithdrawurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 提现: ${data}`);
          let obj = JSON.parse(data);
          if (obj && obj.code == 0) {
            ac.tz += `【现金提现】:成功提现${$.cash}元\n`;
            ac.kz += `【现金提现】:成功提现${$.cash}元\n`;
          } else {
            $.log(`${ac.qq}【现金提现】执行失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}【现金提现】执行异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}【现金提现】执行异常：${e}`)
      resolve();
    }
  });
}


// 用户名
function qqreadinfo(ac) {
  return new Promise((resolve) => {
    $.log('用户信息。。。');
    try {
      const toqqreadinfourl = {
        url: "https://mqqapi.reader.qq.com/mqq/user/init",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadinfourl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 用户名: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj && obj.isLogin) {
            let timeTips = '';
            let t;
            if (ac.qqreadbodyVal && (t = ac.qqreadbodyVal.match(/"dis":([0-9]+)/))) {
              timeTips = `(ck获取时间:${changeDateFormat(t[1]-0)})`;
            }
            let nickName = obj.user ? obj.user.nickName : '获取失败';
            ac.kz = `\n========== 【${ac.qq}${timeTips}】 ==========\n【昵称】:${nickName}\n${ac.kz}`;
            ac.tz = `\n========== 【${ac.qq}${timeTips}】 ==========\n【昵称】:${nickName}\n${ac.tz}`;
          } else {
            $.msg(`${jsname}: ${ac.qq}`, "COOKE失效：❌❌❌请点击前往获取cookie", "https://m.q.qq.com/a/s/d3eacc70120b9a37e46bad408c0c4c2a", {"open-url": "https://m.q.qq.com/a/s/d3eacc70120b9a37e46bad408c0c4c2a"});
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}获取用户昵称异常：${e}`);
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}获取用户昵称异常：${e}`);
      resolve();
    }
  });
}

function changeDateFormat(time) {
  const date = new Date(time);
  const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  const currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return date.getFullYear() + "-" + month + "-" + currentDate + " " + date.toTimeString().substr(0, 8);
}

// 阅豆签到
function qqreadtake(ac) {
  return new Promise((resolve, reject) => {
    $.log('阅豆签到。。。');
    try {
      const toqqreadtakeurl = {
        url: "https://mqqapi.reader.qq.com/mqq/sign_in/user",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.post(toqqreadtakeurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 阅豆签到: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            if (obj.takeTicket > 0) {
              ac.tz += `【阅豆签到】:获得${obj.takeTicket}豆\n`;
            }
          } else {
            $.log(`${ac.qq}阅豆签到失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}阅豆签到异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}阅豆签到异常：${e}`)
      resolve();
    }
  });
}

// 阅读时长任务
function qqreadconfig(ac) {
  return new Promise((resolve, reject) => {
    $.log('阅读时长查询。。。');
    try {
      const toqqreadconfigurl = {
        url: "https://mqqapi.reader.qq.com/mqq/page/config?router=%2Fpages%2Fbook-read%2Findex&options=",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
      };
      $.get(toqqreadconfigurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 阅读时长查询: ${data}`);
          let config = JSON.parse(data);
          config = config && config.code == 0 && config.data && config.data.pageParams;
          if (config) {
            ac.tz += `【时长查询】:今日阅读${(config.todayReadSeconds / 60).toFixed(0)}分钟\n`;
          } else {
            $.log(`${ac.qq}阅读时长查询获取失败：${data}`)
          }
          resolve(config);
        } catch (e) {
          $.log(`${ac.qq}阅读时长查询获取异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}阅读时长查询获取异常：${e}`)
      resolve();
    }
  });
}

// 阅读时长
function qqreadtime(ac) {
  return new Promise((resolve, reject) => {
    $.log('阅读时长上传。。。');
    try {
      const ms = TIME * 10000 + Math.floor(Math.random(1)*10000+1);
      const toqqreadtimeurl = {
        url: ac.qqreadtimeurlVal.replace(/(readTime=)\d+(.+readTime%22%3A)\d+/, `$1${ms}$2${ms}`),
        headers: JSON.parse(ac.qqreadtimeheaderVal),
      };
      $.get(toqqreadtimeurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 阅读时长: ${data}`);
          let obj = JSON.parse(data);
          if (obj && obj.code == 0) {
            ac.tz += `【阅读时长】:上传${TIME / 6}分钟\n`;
          } else {
            $.log(`${ac.qq}阅读时长上传失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}阅读时长上传异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}阅读时长上传异常：${e}`)
      resolve();
    }
  });
}

// 阅读金币1
function qqreadssr(ac, flag, seconds) {
  return new Promise((resolve, reject) => {
    $.log(`${seconds}秒阅读奖励。。。`);
    try {
      const toqqreadssrurl = {
        url: `https://mqqapi.reader.qq.com/mqq/red_packet/user/read_time?seconds=${seconds}`,
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadssrurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 金币奖励${flag}: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            if (obj.amount > 0) {
              ac.tz += `【阅读金币${flag}】获得${obj.amount}金币\n`;
            }
          } else {
            $.log(`${ac.qq}阅读金币获取失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}阅读金币获取异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}阅读金币获取异常：${e}`)
      resolve();
    }
  });
}

// 金币签到
function qqreadsign(ac) {
  return new Promise((resolve, reject) => {
    $.log(`金币签到页。。。`);
    try {
      const toqqreadsignurl = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/clock_in/page",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadsignurl, async (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 金币签到页: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            if (obj.videoDoneFlag) {
              ac.tz += `【金币签到】:获得${obj.todayAmount}金币\n`;
            } else {
              await qqreadsign1(ac);
            }
          } else {
            $.log(`${ac.qq}金币签到失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}金币签到异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}金币签到异常：${e}`)
      resolve();
    }
  });
}

// 金币签到
function qqreadsign1(ac) {
  return new Promise((resolve, reject) => {
    $.log(`金币签到。。。`);
    try {
      const toqqreadsignurl = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/clock_in",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadsignurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 金币签到: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            ac.tz += `【金币签到】:获得${obj.amount}金币\n`;
          } else {
            $.log(`${ac.qq}金币签到失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}金币签到异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}金币签到异常：${e}`)
      resolve();
    }
  });
}

// 金币签到翻倍
function qqreadsign2(ac) {
  return new Promise((resolve, reject) => {
    $.log(`金币签到翻倍。。。`);
    try {
      const toqqreadsign2url = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/clock_in_video",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadsign2url, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 金币签到翻倍: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            ac.tz += `【签到翻倍】:获得${obj.amount}金币\n`;
          } else {
            $.log(`${ac.qq}金币签到翻倍失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}金币签到翻倍异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}金币签到翻倍异常：${e}`)
      resolve();
    }
  });
}

// 每日阅读
function qqreaddayread(ac) {
  return new Promise((resolve, reject) => {
    $.log(`每日阅读。。。`);
    try {
      const toqqreaddayreadurl = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/read_book",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreaddayreadurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 每日阅读: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            ac.tz += `【每日阅读】:获得${obj.amount}金币\n`;
          } else {
            $.log(`${ac.qq}每日阅读失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}每日阅读异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}每日阅读异常：${e}`)
      resolve();
    }
  });
}

// 视频奖励
function qqreadvideo(ac) {
  return new Promise((resolve, reject) => {
    $.log(`视频奖励。。。`);
    try {
      const toqqreadvideourl = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/watch_video",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadvideourl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 视频奖励: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            ac.tz += `【视频奖励】:获得${obj.amount}金币\n`;
          } else {
            $.log(`${ac.qq}视频奖励获取失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}视频奖励获取异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}视频奖励获取异常：${e}`)
      resolve();
    }
  });
}

// 宝箱奖励
function qqreadbox(ac) {
  return new Promise((resolve, reject) => {
    $.log(`宝箱奖励。。。`);
    try {
      const toqqreadboxurl = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/treasure_box",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadboxurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 宝箱奖励: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            if (obj.count >= 0) {
              ac.tz += `【宝箱奖励${obj.count}】:获得${obj.amount}金币\n`;
            }
          } else {
            $.log(`${ac.qq}宝箱奖励获取失败：${data}`)
          }
          resolve();
        } catch (e) {
          $.log(`${ac.qq}宝箱奖励获取异常：${e}`);
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}宝箱奖励获取异常：${e}`);
      resolve();
    }
  });
}

// 宝箱奖励翻倍, 失败时默认1.5秒后重试一次
function qqreadbox2(ac, retry = 1) {
  return new Promise(resolve => {
    $.log(`金宝箱翻倍。。。`);
    try {
      const toqqreadbox2url = {
        url: "https://mqqapi.reader.qq.com/mqq/red_packet/user/treasure_box_video",
        headers: JSON.parse(ac.qqreadtimeheaderVal),
        timeout: 6000,
      };
      $.get(toqqreadbox2url, async (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 【宝箱翻倍】: ${data}`);
          let obj = JSON.parse(data);
          obj = obj && obj.code == 0 && obj.data;
          if (obj) {
            ac.tz += `【宝箱翻倍】:获得${obj.amount}金币\n`;
          } else {
            $.log(`${ac.qq}【宝箱翻倍】失败：${data}`);
            if (retry > 0) {
              // 等待1.5秒后再次尝试开翻倍宝箱
              await $.wait(1500);
              await qqreadbox2(ac, retry - 1);
            }
          }
        } catch (e) {
          $.log(`${ac.qq}【宝箱翻倍】异常：${e}`);
        } finally {
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}【宝箱翻倍】异常：${e}`);
      resolve();
    }
  });
}

// 本周阅读时长
function qqreadwktime(ac) {
  return new Promise((resolve, reject) => {
    $.log(`周阅读时长。。。`);
    try {
      const toqqreadwktimeurl = {
        url: `https://mqqapi.reader.qq.com/mqq/v1/bookShelfInit`,
        headers: JSON.parse(ac.qqreadtimeheaderVal),
      };
      $.get(toqqreadwktimeurl, (error, response, data) => {
        try {
          if (logs) $.log(`${jsname}, 【本周阅读时长】: ${data}`);
          let wktime = JSON.parse(data);
          wktime = wktime && wktime.code == 0 && wktime.data;
          if (wktime) {
            ac.tz += `【本周阅读时长】:${wktime.readTime}分钟\n`;
          } else {
            $.log(`${ac.qq}【本周阅读时长】失败：${data}`)
          }
          resolve(wktime);
        } catch (e) {
          $.log(`${ac.qq}【本周阅读时长】异常：${e}`)
          resolve();
        }
      });
    } catch (e) {
      $.log(`${ac.qq}【本周阅读时长】异常：${e}`)
      resolve();
    }
  });
}

// 本周阅读时长奖励任务
function qqreadpick(ac) {
  return new Promise((resolve, reject) => {
    $.log(`周阅读时长奖励...`)
    try {
      const toqqreadpickurl = {
        url: `https://mqqapi.reader.qq.com/mqq/pickPackageInit`,
        headers: JSON.parse(ac.qqreadtimeheaderVal),
      };
      $.get(toqqreadpickurl, async (error, response, data) => {
        if (logs) $.log(`${jsname},周阅读时长奖励任务: ${data}`);
        let pick = JSON.parse(data);
        if (pick.data[7].isPick == true) ac.tz += "【周时长奖励】:已全部领取\n";
        for (let i = 0; i < pick.data.length; i++) {
          const pickid = pick.data[i].readTime;
          await ((pickid) => {
            return new Promise((res) => {
              try {
                const Packageid = ["10", "10", "20", "30", "50", "80", "100", "120"];
                const toqqreadPackageurl = {
                  url: `https://mqqapi.reader.qq.com/mqq/pickPackage?readTime=${pickid}`,
                  headers: JSON.parse(qqreadtimeheaderVal),
                  timeout: 6000,
                };
                $.get(toqqreadPackageurl, (error, response, data) => {
                  if (logs) $.log(`${jsname}, 领周阅读时长: ${data}`);
                  let o = JSON.parse(data);
                  if (o && o.code == 0) {
                    ac.tz += `【周时长奖励${i + 1}】:领取${Packageid[i]}阅豆\n`;
                  }
                  res();
                });
              } catch (e) {
                res();
              }
            });
          })(pickid);
        }
        resolve();
      });
    } catch (e) {
      $.log(`${ac.qq}本周阅读时长奖励获取异常：${e}`)
      resolve();
    }
  });
}

function showmsg(acList) {
  try {
    if ((d.getHours() == 12 && d.getMinutes() <= 20) || (d.getHours() == 23 && d.getMinutes() >= 40)) {
      notify && notify.sendNotify(jsname, acList.map(o => o.kz).join('\n'));
    }
    let notifyFlag = false;
    const tz = acList.map(o => o.tz).join('\n');
    if (notifyInterval) {
      if (notifyInterval == 1) {
        $.msg(jsname, "", tz); // 显示所有通知
        notifyFlag = true;
      } else if (notifyInterval == 2) {
        if (acList.filter(o => o.task && o.task.treasureBox && o.task.treasureBox.doneFlag == 0).length > 0) {
          $.msg(jsname, "", tz); // 宝箱领取成功通知
          notifyFlag = true;
        }
      } else if (notifyInterval == 3 && acList.filter(o => o.task && o.task.treasureBox && o.task.treasureBox.count % 15 == 0).length > 0) {
        $.msg(jsname, "", tz); // 宝箱每15次通知一次
        notifyFlag = true;
      }
    }
    if (!notifyFlag) {
      $.log(tz); // 无通知时，打印通知
    }
  } catch (e) {
    $.log(`通知处理异常：${e}`);
  }
}

function initAccountData() {
    if ($.isNode()) {
        COOKIES_SPLIT = process.env.COOKIES_SPLIT || COOKIES_SPLIT;
        $.log('', `============ cookies分隔符为：${JSON.stringify(COOKIES_SPLIT)} =============`, '');
        if (
            process.env.QQREAD_BODY &&
            process.env.QQREAD_BODY.indexOf(COOKIES_SPLIT) > -1
        ) {
            qqreadBD = process.env.QQREAD_BODY.split(COOKIES_SPLIT);
        } else {
            qqreadBD = process.env.QQREAD_BODY.split();
        }
        if (
            process.env.QQREAD_TIMEURL &&
            process.env.QQREAD_TIMEURL.indexOf(COOKIES_SPLIT) > -1
        ) {
            qqreadtimeURL = process.env.QQREAD_TIMEURL.split(COOKIES_SPLIT);
        } else {
            qqreadtimeURL = process.env.QQREAD_TIMEURL.split();
        }
        if (
            process.env.QQREAD_TIMEHD &&
            process.env.QQREAD_TIMEHD.indexOf(COOKIES_SPLIT) > -1
        ) {
            qqreadtimeHD = process.env.QQREAD_TIMEHD.split(COOKIES_SPLIT);
        } else {
            qqreadtimeHD = process.env.QQREAD_TIMEHD.split();
        }
        Object.keys(qqreadBD).forEach((item) => {
            if (qqreadBD[item]) {
                qqreadbdArr.push(qqreadBD[item]);
            }
        });
        Object.keys(qqreadtimeURL).forEach((item) => {
            if (qqreadtimeURL[item]) {
                qqreadtimeurlArr.push(qqreadtimeURL[item]);
            }
        });
        Object.keys(qqreadtimeHD).forEach((item) => {
            if (qqreadtimeHD[item]) {
                qqreadtimehdArr.push(qqreadtimeHD[item]);
            }
        });
    } else {
        // 根据boxjs中设置的账号数，添加存在的账号数据进行任务处理
        let qeCount = ($.getval('qeCount') || '1') - 0;
        for (let i = 0; i < qeCount; i++) {
            const suffix = $.suffix(i);
            if ($.getdata(`qqreadtimehd${suffix}`)) {
                qqreadbdArr.push($.getdata(`qqreadbd${suffix}`));
                qqreadtimeurlArr.push($.getdata(`qqreadtimeurl${suffix}`));
                qqreadtimehdArr.push($.getdata(`qqreadtimehd${suffix}`));
            }
        }
    }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}