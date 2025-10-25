import { _decorator, Component, Animation, Node, TweenSystem, tween, Vec3, easing, AnimationState, Color, Sprite, Vec2, Quat, randomRange, randomRangeInt } from 'cc';
import { GridManager } from './GridManager';
import { GridType } from './GridType';
import { time } from 'console';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {
    //@property({ type: GridType, displayName: `类型` })
    public gridType: GridType = GridType.SpecialCollection;
    private gridManager: GridManager = null;
    private curAnim: Animation = null;

    @property({ type: Number, tooltip: `Index` })
    public index: number = -1;
    @property({ type: Number, tooltip: `Row(坐标)` })
    public row: number = -1;
    @property({ type: Number, tooltip: `Col(坐标)` })
    public col: number = -1;
    private _isRemoved: boolean = false;
    inIt(index: number, row: number, col: number, gridType: GridType, gridManager: any) {
        this.gridType = gridType;
        this.gridManager = gridManager;
        this.index = index;
        this.row = row;
        this.col = col;
        this.curAnim = this.node.getComponent(Animation);
        this.curAnim.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        //console.error(this.gridType.toString());
        const sprite = this.node.getComponent(Sprite);
        sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, 255);
        this.curAnim.play(this.gridType.toString());
        //this.playMove2Index(key);

        this._isRemoved = false;
    }

    onAnimationFinished(type: Animation.EventType, state: AnimationState) {
        if (state.name == "effectHideAni") {
            this.setRemoved(true);
            this.gridManager.releaseTile(this.node);
        }
    }

    //public get index(): number {
    //    return this.index;
    //}
    public setIndex(value: number): void {
        this.index = value;

    }
    //public get row(): number {
    //    return this.row;
    //}
    //public get col(): number {
    //    return this.col;
    //}
    public get isRemoved(): boolean {
        return this._isRemoved;
    }

    public setRemoved(value: boolean): void {
        this._isRemoved = value;
    }

    /**下落动画*/
    public async dropToNewRow(targetPosition: Vec3): Promise<void> {
        tween(this.node)
            .to(0.4, { position: targetPosition }, { easing: `cubicInOut` })
            .call(() => {
            })
            .start()
    }
    /**爆炸效果 抛物线*/
    initExplode() {
        const node = this.node;
        let startPos = node.position //起点，抛物线开始的坐标
        let middlePos = new Vec3(randomRange(node.position.x - 800, node.position.x + 800), node.position.y + 1000, 0) //中间坐标，即抛物线最高点坐标

        //let destPos = new Vec3(randomRange(node.position.x - 400, node.position.x + 400) /*- 1000*/, -1000, 0) //终点，抛物线落地点
        let destPos = new Vec3(middlePos.x > 0 ? middlePos.x + 200 : middlePos.x - 200 /*- 1000*/, -1000, 0) //终点，抛物线落地点
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
            }).call(() => {
                this.setRemoved(true);
                this.gridManager.releaseTile(this.node);
            })
            .start();

        // 延迟 0.1 秒后再执行回调逻辑
        //await new Promise<void>(resolve => setTimeout(resolve, 100));
    }
}