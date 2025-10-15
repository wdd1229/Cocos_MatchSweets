import { _decorator, Component, Animation,Node, TweenSystem, tween, Vec3, easing, AnimationState } from 'cc';
import { GridManager } from './GridManager';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {
    public gridType: number = null;
    private gridManager: GridManager = null;
    private curAnim: Animation = null;
    private _index: number = -1;
    private _row: number = -1;
    private _col: number = -1;
    private _isRemoved: boolean = false;
    inIt(index: number, row: number, col: number, gridType: number,gridManager:any) {
        this.gridType = gridType;
        this.gridManager = gridManager;
        this._index = index;
        this._row = row;
        this._col = col;
        this.curAnim = this.node.getComponent(Animation);
        this.curAnim.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
        //console.error(this.gridType.toString());
        //this.curAnim.play(this.gridType.toString());
        //this.playMove2Index(key);

        this._isRemoved = false;
    }

    onAnimationFinished(type: Animation.EventType, state: AnimationState) {
        if (state.name == "effectHideAni") {
            this.setRemoved(true);
            this.gridManager.releaseTile(this.node);
        }
    }

    public get index(): number {
        return this._index;
    }
    public setIndex(value: number): void {
        this._index = value;

    }
    public get row(): number {
        return this._row;
    }
    public get col(): number {
        return this._col;
    }
    public get isRemoved(): boolean {
        return this._isRemoved;
    }

    public setRemoved(value: boolean): void {
        this._isRemoved = value;
    }

    //下落动画
    public dropToNewRow(targetPosition: Vec3) {
        tween(this.node)
            .to(0.1, { position: targetPosition }, { easing: `cubicInOut` } )
            .call(() => {
            })
            .start()
    }


}


