import { _decorator, Component,resources,Prefab,Animation, error, AnimationClip, AnimationState, tween, Button, Sprite, color, Color, SpriteFrame, Vec2, randomRange, Vec3, PageView } from 'cc';
import { Tile } from './Tile';
import { GridType } from './GridType';
import { debug } from 'console';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    //cocos脚本生命周期，简单来说就是 每个函数的执行顺序和触发方式
    //1.onLoad 加载函数：脚本第一个执行的函数，一般用于 开启监听事件
    //2.onDestroy 销毁函数：当组件或者节点被 销毁时，执行这个函数，一般用于 关闭监听事件
    //2.start 开始函数：脚本启动执行函数
    //3.update
    //4.lateupdate
    // onDisable
    //onEnable
    @property({ type: Button, tooltip: `TestBtn` })
    public testbtn: Button = null;
    @property({ type: Button, tooltip: `TestBtn2` })
    public testbtn2: Button = null;

    @property({ type: PageView, tooltip: `PageView` })
    public pageViewNode: PageView = null;
    onLoad() {
        //tt.onShow((res) => {
        //    //判断用户是否是从侧边栏进来的
        //    this.isFromSidebar = (res.launch_from == 'homepage' && res.location == 'sidebar_card')
        //    if (this.isFromSidebar) {
        //        //如果是从侧边栏进来的，显示“领取奖励”按钮，隐藏“去侧边栏”
        //        this.btnGetAward.node.active = true
        //        this.btnGotoSidebar.node.active = false
        //    }
        //    else {
        //        //否则反之
        //        this.btnGetAward.node.active = false
        //        this.btnGotoSidebar.node.active = true
        //    }
        //});
    }

    curState:AnimationClip
    private curAnim: Animation = null;


    start() {
        this.testbtn.node.on(Button.EventType.CLICK, this.callback, this);
        this.testbtn2.node.on(Button.EventType.CLICK, this.callback2, this);

        error("Test start ");
        // 假设 pageView 是你的 PageView 组件
        let pageView = this.pageViewNode;  // pageViewNode 是 PageView 组件所在的节点

        // 获取当前页索引
        let currentIndex = pageView.getCurrentPageIndex();

        console.error("当前页为：" + currentIndex);

        // 计算下一页索引（假设你想要向左滑动一页）
        let nextPageIndex = currentIndex + 1;

        // 设置当前页索引，这会触发 PageView 滑动到指定的页面
        /*pageView.setCurrentPageIndex(nextPageIndex);*/
    }
    callback(button: Button) {
        this.pageViewNode.setCurrentPageIndex(this.pageViewNode.getCurrentPageIndex()-1);
    }
    callback2(button: Button) {
        this.pageViewNode.setCurrentPageIndex(this.pageViewNode.getCurrentPageIndex()+1);
    }

    onAnimationFinished(type: Animation.EventType, state: AnimationState) {
        if (state.name == "2") {
           
            //this.curAnim.play("1");
        }
    }
    update(deltaTime: number) {
    }
}


