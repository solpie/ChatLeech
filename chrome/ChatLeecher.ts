import entities = require('entities');
declare var $;
declare interface entities {
    decodeHTML(val:string):string;
}
class Dmk {
    user:string;
    text:string;
    id:string;
}
class ChatLeecher {
    dmkArr:Dmk[];
    lastLength:number = 0;

    constructor() {
        console.log("chatLeecher");
        this.dmkArr = [];
        var start = 0;
        setInterval(()=> {
            var dmkItemArr$ = $('.jschartli .text_cont');
            if (dmkItemArr$.length) {
                if (this.lastLength != dmkItemArr$.length) {
                    if (this.lastLength != 0)
                        start = this.lastLength - 1;
                    this.lastLength = dmkItemArr$.length;
                    // console.log('start', start, 'len', dmkItemArr$.length);
                    for (var i = start; i < dmkItemArr$.length; i++) {
                        var dmkItem$ = $(dmkItemArr$[i]);
                        var dmkId = dmkItem$.find('.text_cont').attr('chatid');
                        var dmkText = entities.decodeHTML(dmkItem$.find('.text_cont').html());
                        var dmkUserName = dmkItem$.find('.name a').html();
                        if (dmkId) {
                            console.log('dmk: ', `[${dmkUserName}]`,dmkId, dmkText);

                            var dmk = new Dmk();
                            dmk.id = dmkId;
                            dmk.text = dmkText;
                            dmk.user = dmkUserName;
                            this.dmkArr.push(dmk);
                        }
                    }
                }
            }
        }, 100)
    }
}

var chatLeecher = new ChatLeecher();

