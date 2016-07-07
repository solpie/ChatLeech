import entities = require('entities');
import {DmkInfo} from "../../yqbe/src/model/DmkInfo";

declare var $;
declare var chrome;
declare interface entities {
    decodeHTML(val:string):string;
}
class ChatLeecher {
    dmkArr:DmkInfo[];
    lastLength:number = 0;
    isRunning:boolean = false;

    //
    options:any;

    restore_options() {
        // Use default value color = 'red' and likesColor = true.
        chrome.storage.sync.get({
            serverAddr: '',
        }, (items)=> {
            this.options = items;
            console.log('server addr', items.serverAddr);
        });
    }

    initUI() {
        $(()=> {
            var hostname = window.location.hostname.toString();
            if (hostname == 'zhubo.kanqiu.hupu.com') {
                console.log('init ui');
                $('.function-button').append('<a href="javascript:" title="开启直播" id="btnStart" class="button-send">开始抓取</a>');
                $('#btnStart').on('click', ()=> {
                    if (!this.isRunning) {
                        this.leechHupuZhushou();
                        $('#btnStart').val('停止抓取');
                    }
                    else {
                        // this.isRunning = false;
                    }

                    console.log('start!!!!', window.location, hostname);
                });
            }

            if (hostname == "www.videohupu.com") {
                $('#J_followCount').append('<a class="button-follow" id="btnStart" href="javascript:">抓取弹幕</a>');
                $('#btnStart').on('click', ()=> {
                    this.leechHupu();
                    console.log('start!!!!', window.location, hostname);
                });
            }

        });


    }

    leechDouyu() {
        this.dmkArr = [];
        var start = 0;
        setInterval(()=> {
            var dmkItemArr$ = $('.jschartli .text-cont');
            if (dmkItemArr$.length) {
                if (this.lastLength != dmkItemArr$.length) {
                    if (this.lastLength != 0)
                        start = this.lastLength - 1;
                    this.lastLength = dmkItemArr$.length;
                    // console.log('start', start, 'len', dmkItemArr$.length);
                    for (var i = start; i < dmkItemArr$.length; i++) {
                        var dmkItem$ = $(dmkItemArr$[i]);
                        var dmkId = dmkItem$.find('.text-cont').attr('chatid');
                        var dmkText = entities.decodeHTML(dmkItem$.find('.text-cont').html());
                        var dmkUserName = dmkItem$.find('.name a').html();
                        if (dmkId) {
                            console.log('dmk: ', `[${dmkUserName}]`, dmkText, dmkId);
                            var dmk:any = new DmkInfo();
                            dmk.id = dmkId;
                            dmk.text = dmkText;
                            dmk.user = dmkUserName;
                            this.dmkArr.push(dmk);
                            var data:any = {user: dmkUserName, text: dmkText};
                            $.post(this.options.serverAddr + '/dmk/push', data, ()=> {
                                console.log('sus');
                            })
                        }
                    }
                }
            }
        }, 100)
    }

    leechHupuZhushou() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log('leechHupu');
        this.dmkArr = [];
        var start = 0;

        var timer = setInterval(()=> {
            var dmkItemArr$ = $('#J_hotline tr');
            if (dmkItemArr$.length) {
                if (this.lastLength != dmkItemArr$.length) {
                    if (this.lastLength != 0)
                        start = this.lastLength - 1;
                    this.lastLength = dmkItemArr$.length;
                    console.log('start', start, 'len', dmkItemArr$.length);
                    for (var i = start; i < dmkItemArr$.length; i++) {
                        var dmkItem$ = $(dmkItemArr$[i]);
                        var dmkId = dmkItem$.find('.text-cont').attr('chatid');
                        var dmkText = dmkItem$.find('.content').html();
                        var a = dmkText.split('：');
                        var dmkUserName;

                        if (a.length == 2) {
                            dmkText = a[1];
                            dmkUserName = a[0];
                            var data:any = {user: dmkUserName, text: dmkText};
                            console.log('dmk:', dmkUserName, dmkText);
                            $.post(this.options.serverAddr + '/dmk/push', data, ()=> {
                                console.log('sus');
                            });
                        }
                        else {
                            a = dmkText.match(/@(.+\s)送出\s(\d+)个\s(.+)。/);

                            // 红色连杆：堂主连杆
                            // 蓝色连杆：安妮连杆
                            // 红色恶魔时光机：堂主恶魔时光机
                            // 蓝色恶魔时光机：安妮恶魔时光机

                            dmkUserName = a[1];
                            var skillCount = a[2];
                            var skillName = a[3];
                            var skillIdx;
                            var playerIdx;
                            if (skillName == '安妮连杆') {
                                skillIdx = 0;
                                playerIdx = 0;
                            }
                            else if (skillName == '堂主连杆') {
                                skillIdx = 0;
                                playerIdx = 1;
                            }
                            else if (skillName == '安妮恶魔时光机') {
                                skillIdx = 1;
                                playerIdx = 0;
                            }
                            else if (skillName == '堂主恶魔时光机') {
                                skillIdx = 1;
                                playerIdx = 1;
                            }
                            var data:any = {
                                user: dmkUserName,
                                skillCount: skillCount,
                                skillIdx: skillIdx||1,
                                playerIdx: playerIdx||1
                            };
                            $.post(this.options.serverAddr + '/dmk/push', data, ()=> {
                                console.log('sus');
                            });
                            console.log('skill:', dmkUserName, skillCount, skillName);
                        }


                        // if (a.length == 2) {//普通弹幕
                        //     dmkText = a[1];
                        //     dmkUserName = dmkItem$.find('.name').html();
                        //     if (dmkUserName) {
                        //         dmkUserName = dmkUserName.replace(':', '').replace(' ', '').replace('\n', '');
                        //         dmkUserName = dmkUserName.replace(/<a.+\<\/a>/, '')
                        //     }
                        //     console.log('dmk: ', `[${dmkUserName}]`, dmkText, dmkId);
                        //     var dmk:any = new DmkInfo();
                        //     dmk.id = dmkId;
                        //     dmk.text = dmkText;
                        //     dmk.user = dmkUserName;
                        //     this.dmkArr.push(dmk);
                        //     var data:any = {user: dmkUserName, text: dmkText};
                        //
                        // }
                        // var dmkText = entities.decodeHTML(dmkItem$.find('.text-cont').html());
                    }
                }
            }
        }, 100)
    }

    leechHupu() {
        console.log('leechHupu');
        this.dmkArr = [];
        var start = 0;
        setInterval(()=> {
            var dmkItemArr$ = $('.J_chatroomList li');
            if (dmkItemArr$.length) {
                if (this.lastLength != dmkItemArr$.length) {
                    if (this.lastLength != 0)
                        start = this.lastLength - 1;
                    this.lastLength = dmkItemArr$.length;
                    console.log('start', start, 'len', dmkItemArr$.length);
                    for (var i = start; i < dmkItemArr$.length; i++) {
                        var dmkItem$ = $(dmkItemArr$[i]);
                        var dmkId = dmkItem$.find('.text-cont').attr('chatid');
                        var a = $(dmkItem$).html().split("/span>");
                        var dmkText;
                        var dmkUserName;

                        if (a.length == 2) {//普通弹幕
                            dmkText = a[1];
                            dmkUserName = dmkItem$.find('.name').html();
                            if (dmkUserName) {
                                dmkUserName = dmkUserName.replace(':', '').replace(' ', '').replace('\n', '');
                                dmkUserName = dmkUserName.replace(/<a.+\<\/a>/, '')
                            }
                            console.log('dmk: ', `[${dmkUserName}]`, dmkText, dmkId);
                            var dmk:any = new DmkInfo();
                            dmk.id = dmkId;
                            dmk.text = dmkText;
                            dmk.user = dmkUserName;
                            this.dmkArr.push(dmk);
                            var data:any = {user: dmkUserName, text: dmkText};
                            $.post(this.options.serverAddr + '/dmk/push', data, ()=> {
                                console.log('sus');
                            })
                        }
                        // var dmkText = entities.decodeHTML(dmkItem$.find('.text-cont').html());
                    }
                }
            }
        }, 100)
    }

    constructor() {
        this.restore_options();
        this.initUI();
        console.log("chatLeecher");
    }
}

var chatLeecher = new ChatLeecher();

