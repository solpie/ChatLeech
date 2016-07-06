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

    constructor() {
        this.restore_options();
        console.log("chatLeecher");
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
}

var chatLeecher = new ChatLeecher();

