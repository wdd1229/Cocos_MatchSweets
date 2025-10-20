import { _decorator, Component,resources,Prefab,Animation, error, AnimationClip, AnimationState, tween, Button, Sprite, color, Color, SpriteFrame, Vec2, randomRange, Vec3 } from 'cc';
import { Tile } from './Tile';
import { GridType } from './GridType';
import { ExplosionEffect } from './ExplosionEffect';
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
    @property({type:Sprite,displayName:"sprite"})
    public Cursprite: Sprite;
    @property({ type: SpriteFrame, displayName: "SpriteFrame" })
    public curSprite: SpriteFrame;
    onLoad() {

    }

    curState:AnimationClip
    private curAnim: Animation = null;
    start() {
        this.testbtn.node.on(Button.EventType.CLICK, this.callback, this);
        this.testbtn2.node.on(Button.EventType.CLICK, this.callback2, this);
        this.node.getComponent(Tile).inIt(0, 0, 0, 1, null);


        console.log("onStart fuc..");
        //this.curAnim = this.getComponent(Animation);

        //this.curAnim.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);

        //tween(this).delay(3).start();

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

        //this.curAnim.play("1");

        const explosionEffect =this.node.getComponent(ExplosionEffect);

        const node = this.node;
        let startPos = node.position //起点，抛物线开始的坐标
        let middlePos = new Vec3(node.position.x + 400, node.position.y + 500, 0) //中间坐标，即抛物线最高点坐标
        let destPos = new Vec3(node.position.x-1000, node.position.y, 0) //终点，抛物线落地点
        //计算贝塞尔曲线坐标函数
        let twoBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            return new Vec3(x, y, 0);
        };
        let tweenDuration: number = 1.0;
        tween(node.position)
            .to(tweenDuration, destPos, {
                onUpdate: (target: Vec3, ratio: number) => {
                    node.position = twoBezier(ratio, startPos, middlePos, destPos);
                }
            }).start();
        
        //// 随机方向：模拟在爆炸起始点的垂直与水平扩散
        //const direction =new Vec3(
        //    randomRange(-0.8, 0.8), // 水平方向
        //    randomRange(-0.8, 0.8),0 // 垂直方向（向上偏移）
        //);

        //if (explosionEffect != null) {
        //    explosionEffect.StartExplosion(dir)
        //} else {
        //    console.error("组件为空");
        //}


        //this.curAnim.play("1");
        // 加载 test_assets 目录下所有 SpriteFrame，并且获取它们的路径
        //resources.loadDir("GridIcon", SpriteFrame, function (err, assets) {
        //    // ...
        //    if (err) {
        //        console.error("加载 GridIcon 目录下所有资源加载失败:", err);
        //        return;
        //    }
        //    console.log("加载 GridIcon 目录下所有资源成功")
        //    let sprite;
        //    for (var i in assets) {

        //        sprite = i;


        //        console.log("当前资源名称：" + i.toString());
        //    }
        //    //this.curSprite = sprite;
        //    //button.getComponent(Sprite). = sprite;
        //});
        //resources.load("GridIcon/1/spriteFrame", SpriteFrame, (err, sprite) => {

        //    if (err) {
        //        console.error("加载失败:", err);
        //        return;
        //    }
        //    console.log("加载SpriteFrame成功********* key:");
        //    this.Cursprite.spriteFrame = sprite;
        //})
    }
    callback2(button: Button) {
        // 注意这种方式注册的事件，无法传递 customEventData

        //const sprite = this.node.getComponent(Sprite);
        //sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, 255);

        //this.curAnim.play("2");



    }

    onAnimationFinished(type: Animation.EventType, state: AnimationState) {
        if (state.name == "2") {
           
            //this.curAnim.play("1");
        }
    }
    update(deltaTime: number) {
    }
}


