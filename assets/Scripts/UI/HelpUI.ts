import { _decorator, Button, ButtonComponent, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HelpUI')
export class HelpUI extends Component {

    @property({
        type: [Node], // 明确指定数组元素类型为 Node（3.8.7 支持这种写法，更直观）
        displayName: "页面列表", // 可选：在面板上显示的名称
        tooltip: "帮助页面" // 可选：鼠标悬停时的提示文字
    })
    private pageList: Node[] = [];

    private pageIndex: number = 0;
    @property({ type: Button, displayName: "关闭按钮" })
    private closeBtn: Button = null;
    @property({type:Button,displayName:"上一页按钮"})
    private backPageBtn:Button=null;
    @property({type:Button,displayName:"下一页按钮"})
    private nextPageBtn: Button = null;

    @property({ type: Label, displayName: "当前页/总页数" })
    private curPageIndex: Label = null;
    onLoad() {
        this.backPageBtn.node.on(Button.EventType.CLICK, this.backPageFnc, this);
        this.nextPageBtn.node.on(Button.EventType.CLICK, this.nextPageFnc, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.closeHelpUI, this);
    }
    onEnable() {
        // 每次 UI 显示时，初始化页面并刷新 UI
        this.pageIndex = 0;
        this.RefreshUI();
    }
    closeHelpUI() {
        this.node.active = false;
    }
    backPageFnc() {
        this.pageIndex -= 1;
        this.checkPageIndex();
    }
    nextPageFnc() {
        this.pageIndex += 1;
        this.checkPageIndex();
    }
    checkPageIndex() {
        if (this.pageIndex >= this.pageList.length) {
            this.pageIndex = this.pageList.length - 1;
        } else if(this.pageIndex<=0){
            this.pageIndex = 0;
        }
        this.RefreshUI();
    }
    RefreshUI() {
        // 将所有页面设为不激活
        for (let i = 0; i < this.pageList.length; i++) {
            this.pageList[i].active = false;
        }
        // 激活当前页
        this.pageList[this.pageIndex].active = true;
        this.curPageIndex.string = `${this.pageIndex+1}/${this.pageList.length}`;
    }


    update(deltaTime: number) {
        
    }
}

