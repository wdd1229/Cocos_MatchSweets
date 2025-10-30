import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ExitUI')
export class ExitUI extends Component {
    private closeBtn: Button = null;

    private cancalBtn: Button = null;

    private exitBtn: Button = null;

    onLoad() {
        this.closeBtn = this.node.getChildByName("closeBtn").getComponent(Button);
        this.cancalBtn = this.node.getChildByName("cancalBtn").getComponent(Button);
        this.exitBtn = this.node.getChildByName("exitBtn").getComponent(Button);
    }
    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.cancalBtn.node.on(Button.EventType.CLICK, this.Cancel, this);
        this.exitBtn.node.on(Button.EventType.CLICK, this.ExitGmae, this);
    }

    closeUI() {
        this.node.active = false;
    }
    Cancel() {
        this.node.active = false;
    }
    /**退出游戏 */
    ExitGmae() {

    }
}

