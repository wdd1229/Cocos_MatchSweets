import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
var tt: any = window[`tt`];
@ccclass('DouyinAPI')
export class DouyinAPI extends Component {
    /**
     * 检查是否在抖音小游戏环境中
     */
    public static isInDouyinGame(): boolean {
        return typeof tt !== 'undefined';
    }
    /**
     * 显示提示框
     */
    public static show(options: {
        title?: string;
        content: string;
        success?: Function;
        fail?: Function;
        complete?: Function;
    }): void {
        if (!this.isInDouyinGame()) {
            console.warn('当前不在抖音小游戏环境中，无法调用 tt.show');
            return;
        }

        tt.show(options);
    }
    /**
     * 分享功能
     */
    public static share(options: {
        channel: 'dialog' | 'menu';
        title: string;
        content: string;
        query?: string;
        success?: Function;
        fail?: Function;
        complete?: Function;
    }): void {
        if (!this.isInDouyinGame()) {
            console.warn('当前不在抖音小游戏环境中，无法调用 tt.shareAppMessage');
            return;
        }

        tt.shareAppMessage(options);
    }
    /**
     * 获取用户信息
     */
    public static getUserInfo(options: {
        success: Function;
        fail?: Function;
        complete?: Function;
    }): void {
        if (!this.isInDouyinGame()) {
            console.warn('当前不在抖音小游戏环境中，无法调用 tt.getUserInfo');
            return;
        }

        tt.getUserInfo(options);
    }
}


