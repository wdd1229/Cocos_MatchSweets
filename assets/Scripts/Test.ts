import { _decorator, Component,resources,Prefab,Animation, error, AnimationClip } from 'cc';
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

    curState:AnimationClip

    start() {
        console.log("onStart fuc..");

        let gridAnim = this.getComponent(Animation);
        gridAnim.play("3-2");
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

    update(deltaTime: number) {
        
    }
}


