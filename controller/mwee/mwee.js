'use strict';
import mwagent from './agent.js'
// import child_process from 'child_process'
import BaseComponent from '../../prototype/baseComponent'

class Mwee extends BaseComponent {
    constructor() {
        super()
        this.findAccount = this.findAccount.bind(this)
        this.checkLogin = this.checkLogin.bind(this)
    }

    async findAccount(req, res, next) {
        try {
            const info = await mwagent.findAccount(res.query.account);
            res.send({
                status:0,
                message:"请求成功",
                data:info,
            });
        } catch (e) {
            console.log('寻找账号失败')
            res.send({
                status:1,
                message:e.toString(),
            });
        }

    }


    async checkLogin(req, res, next) {
        try {
            // console.log('checkLogin');
            const info = await mwagent.checkLogin(req.query.user_name,req.query.password);
            res.send({
                status: 1,
                message:'登录成功'
            });
            // res.send(info.text);
        } catch (e) {
            console.log('寻找账号失败');
            res.send({
                status: 1,
                message:e.toString()
            });
        }

    }

    // child_process.exec('python3 ../../py/t.py',function (error, stdout, stderr) {
    //     if(error) {
    //         console.error('error: ' + error);
    //         return;
    //     }
    //     console.log('stdout: ' + stdout);
    //     console.log('stderr: ' + typeof stderr);
    // });

    async editNoticeDevice(req, res, next) {
        try {
            const info = await mwagent.findAccount(res.query.account);
            const noitce = await mwagent.editNoticeDevice(info.account, info.userId);
            res.send(noitce);
        } catch (e) {
            console.log('editNoticeDevice失败');
            res.send(e.toString());
        }

    }

    async findShopLogs(req, res, next) {
        try {
            const likeShop = await mwagent.findLikeShop('美味体验店(张普店)');
            const logs = await mwagent.findShopLogs(likeShop.label, likeShop.value);
            res.send(logs);
        } catch (e) {
            console.log('editNoticeDevice失败')
            res.send(e.toString());
        }

    }

    async findAccountLogs(req, res, next) {
        try {
            const info = await mwagent.findAccount(req.query.account);
            const likeShop = await mwagent.findLikeShop(info.shopName);
            console.log(likeShop);
            const logs =await mwagent.findAccountLogs(likeShop.label, likeShop.value, req.query.account,req.query.upTime);
            res.send({
                status: 1,
                message:logs
            });
        } catch (e) {
            res.send({
                status: 0,
                message:e.toString()
            });
        }

    }


}

export default new Mwee()
