import { _decorator, Component, Animation,Node, TweenSystem, tween, Vec3, easing, AnimationState, Color, Sprite } from 'cc';
import { GridManager } from './GridManager';
import { GridType } from './GridType';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {
    @property({ type: GridType, displayName: `类型` })
    public gridType: GridType = GridType.SpecialCollection;
    private gridManager: GridManager = null;
    private curAnim: Animation = null;

    @property({ type: Number, tooltip: `Index` })
    public index: number = -1;
    @property({ type: Number, tooltip:`Row(坐标)`})
    public row: number = -1;
    @property({ type: Number, tooltip: `Col(坐标)` })
    public col: number = -1;
    private _isRemoved: boolean = false;
    inIt(index: number, row: number, col: number, gridType: GridType,gridManager:any) {
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

    //下落动画
    public async dropToNewRow(targetPosition: Vec3) {
        tween(this.node)
            .to(0.4, { position: targetPosition }, { easing: `cubicInOut` } )
            .call(() => {
            })
            .start()
    }


}


