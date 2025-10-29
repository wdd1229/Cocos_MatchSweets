import { _decorator, Button, Component, Node, Slider } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SetUI')
export class SetUI extends Component {
    private closeBtn: Button = null;

    private cancalBtn: Button = null;

    private saveBtn: Button = null;

    private musicSlider: Slider = null;

    private roundSlider: Slider = null;

    onLoad() {
        this.closeBtn = this.node.getChildByName("closeBtn").getComponent(Button);
        this.cancalBtn = this.node.getChildByName("cancalBtn").getComponent(Button);
        this.saveBtn = this.node.getChildByName("saveBtn").getComponent(Button);
    }
    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.closeSetUI, this);
        this.cancalBtn.node.on(Button.EventType.CLICK, this.CancelSet, this);
        this.saveBtn.node.on(Button.EventType.CLICK, this.saveSet, this);
    }

    closeSetUI() {
        this.node.active = false;
    }
    /**取消音乐和音效的修改 回到之前保存的记录*/
    CancelSet() {

    }
    /**保存修改的音乐和音效 */
    saveSet() {

    }



}

