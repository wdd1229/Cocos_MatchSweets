import { _decorator, Component,resources,Prefab,Animation, error, AnimationClip, AnimationState, tween, Button, Sprite, color, Color } from 'cc';
import { Tile } from './Tile';
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
    onLoad() {

    }

    curState:AnimationClip
    private curAnim: Animation = null;
    start() {
        this.testbtn.node.on(Button.EventType.CLICK, this.callback, this);
        this.testbtn2.node.on(Button.EventType.CLICK, this.callback2, this);
        this.node.getComponent(Tile).inIt(0, 0, 0, 1, null);


        console.log("onStart fuc..");
        this.curAnim = this.getComponent(Animation);

        this.curAnim.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);

        tween(this).delay(3).start();

        //console.log(gridAnim.clips[0].name);

        // resources.load("AnimatorClip/1-1", AnimationClip, (error, clip) => {
        //    //this.getComponent(Animation).clips[0]=clip;
        //    //this.getComponent(Animation).addClip(clip, clip.name);
        //     //this.getComponent(Animation).play();
        //     if (clip) {
        //         console.log("load Success ！：" + clip.name);
        //         this.curState = clip;
        //     }
        //});

        //console.log(this.BodyAnim);
        
        //console.log(gridAnim.clips[0].name);
    }
    callback(button: Button) {
        // 注意这种方式注册的事件，无法传递 customEventData

        this.curAnim.play("effectHideAni");
        //this.curAnim.play("1");

    }
    callback2(button: Button) {
        // 注意这种方式注册的事件，无法传递 customEventData

        const sprite = this.node.getComponent(Sprite);
        sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, 255);

        this.curAnim.play("2");



    }
    onAnimationFinished(type: Animation.EventType, state: AnimationState) {
        if (state.name == "effectHideAni") {
           
            //this.curAnim.play("1");
        }
    }
    update(deltaTime: number) {
        
    }
}


