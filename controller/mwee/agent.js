import superagent from 'superagent'
import cheerio from 'cheerio'
import unzip from 'unzip2'

let COOKIE = '';

let checkLogin = function (user_name, password) {
    return new Promise(function (resolve, reject) {
        superagent
            .post('http://oa.mwbyd.cn/SSO/Login/check_login.htm')
            .type('form')
            .send({
                mobile: user_name,
                password: password,
                remember: 'on'
            })
            .end(function (err, res2) {
                if (err) {
                    reject(err);
                } else {
                    let cookie = res2.header['set-cookie'];
                    console.log(cookie);
                    resolve(res2);
                }
            })
    })
}


let findAccount = function (account) {
    return new Promise(function (resolve, reject) {
        superagent
            .get('http://mnr.test.cn/index.php/shop/Webaccount/getlist')
            .query({userName: account})
            .set('Cookie', 'sso9nowcn_auth=a6af8iM58fo%2BC8HLaALQsFGyBEvisuMshdyQZWyrFXCSb%2F0%2BPnwkyVx1PTHo')
            .end(function (err, res2) {
                // console.log(res2)
                if (err) {
                    reject(err);
                } else {
                    let $ = cheerio.load(res2.text);
                    let info = {};
                    let tds = $("#dataTable tbody td");
                    info.userId = tds.eq(1).text();
                    info.account = tds.eq(2).text();
                    info.shopName = tds.eq(3).text();
                    console.log(info);
                    resolve(info);
                }

            })
    });


};

let findLikeShop = function (shopName) {
    return new Promise(function (resolve, reject) {
        superagent
            .get('http://mnr.test.cn/index.php/business/yunying/shoplist')
            .query({q: shopName})
            .set('Cookie', 'sso9nowcn_auth=a6af8iM58fo%2BC8HLaALQsFGyBEvisuMshdyQZWyrFXCSb%2F0%2BPnwkyVx1PTHo')
            .end(function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    let response = JSON.parse(res.text);
                    let item = response.data.find(k => k.label === shopName);
                    // console.log(item);
                    resolve(item);
                }
            })
    });


};

let findShop = function (shopName, shopid, callback) {
    superagent
        .get('http://mnr.test.cn/index.php/shop/shopAccount/getlistnew')
        .query({shopName: shopName, shopid: shopid})
        .set('Cookie', 'sso9nowcn_auth=a6af8iM58fo%2BC8HLaALQsFGyBEvisuMshdyQZWyrFXCSb%2F0%2BPnwkyVx1PTHo')
        .end(function (err, res) {
            if (err) {
                console.log(err);
                callback(err, "");
                return
            }
            let $ = cheerio.load(res.text);

            callback(err, res.text);
        })
};

let editNoticeDevice = function (account, userid) {
    return new Promise(function (resolve, reject) {
        superagent
            .get('http://mnr.test.cn/index.php/shop/shopAccount/editNoticeDevice')
            .query({istest: 'nc.won9', name: account, userId: userid, t: Math.random()})
            .set('Cookie', 'sso9nowcn_auth=a6af8iM58fo%2BC8HLaALQsFGyBEvisuMshdyQZWyrFXCSb%2F0%2BPnwkyVx1PTHo')
            .end(function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.text);
                }
            })
    });

};

let findShopLogs = function (shopName, shopId, page = 1) {
    return new Promise(function (resolve, reject) {
        superagent
            .get('http://mnr.test.cn/index.php/errorlog/errorlog/getlist?')
            .query({shopName: shopName, shopId: shopId, page: page})
            .set('Cookie', 'sso9nowcn_auth=a6af8iM58fo%2BC8HLaALQsFGyBEvisuMshdyQZWyrFXCSb%2F0%2BPnwkyVx1PTHo')
            .end(function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    let $ = cheerio.load(res.text);
                    let items = [];
                    $('.am-table tbody tr').each(function (i, ele) {
                        let tds = $(ele).find('td');
                        items.push({
                            id: tds.eq(0).text(),
                            deviceId: tds.eq(1).text(),
                            account: tds.eq(2).text(),
                            shopName: tds.eq(3).text(),
                            upTime: tds.eq(4).text(),
                            appVersion: tds.eq(5).text(),
                            deviceVersion: tds.eq(6).text(),
                            deviceModel: tds.eq(7).text(),
                            logUrl: tds.eq(8).text()
                        })
                    });
                    // $('.am-table tbody');
                    resolve(items);
                }
            })
    });

};


/**
 * 根据账号找日志
 * @param shopName
 * @param shopId
 * @param account
 * @param callback
 * @param searchTime
 */
let findAccountLogs = async function (shopName, shopId, account, searchTime = '') {
    const logs = await findShopLogs(shopName, shopId);
    logs.filter(function (i, item) {
        return item.account === account;
    });
    if (!searchTime) {
        return logs;
    }
    let searchDate = new Date(searchTime.replace(/-/g, "/"));
    if (new Date().getTime() - searchDate.getTime() > 24 * 3600 * 1000 * 30) {
        throw new Error("不处理,查不到了");
    }
    if (logs.length > 0 && searchDate > new Date(logs[0].upTime.replace(/-/g, "/"))) {
        throw new Error("先让设备上报");
    }

    let page = 1;
    while (searchDate < logs[logs.length - 1] && logs[logs.length - 1].logUrl) {
        logs.push(await findShopLogs(shopName, shopId, ++page));
    }
    let result = logs.find(function (value, index, arr) {
        return new Date(value.upTime.replace(/-/g, "/")) > searchDate && searchDate > new Date(logs[index + 1].upTime.replace(/-/g, "/"))
    });
    if (result.logUrl) {
        result = await unZipFile(result.logUrl);
    }
    return result;

};

let unZipFile = async function (logUrl) {
    return new Promise(function (resolve, reject) {
        superagent
            .get(logUrl)
            .end(function (err, res) {
                res.pipe(unzip.Extract({path: 'tempLog'}));
                resolve(logUrl);
            });
    });
};


module.exports = {
    findAccount,
    editNoticeDevice,
    findShopLogs,
    findLikeShop,
    findAccountLogs,
    checkLogin,
};