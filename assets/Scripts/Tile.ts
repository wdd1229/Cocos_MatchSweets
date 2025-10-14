import { _decorator, Component, Animation,Node, TweenSystem, tween, Vec3 } from 'cc';
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
        //console.error(this.gridType.toString());
        this.curAnim.play(this.gridType.toString());
        //this.playMove2Index(key);

        this._isRemoved = false;
    }

    public get index(): number {
        return this._index;
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
        this.node.name = "setRemoved";
    }
   
    //下落动画
    public dropToNewRow(targetPosition: Vec3) {
        //const targetPosition = new Vec3(this._col, targetRow);
        //const currentPos = this.node.position;
        //const diffY = targetPosition.y - currentPos.y;
        ////没有变化 不处理
        //if (diffY == 0) {
        //    return;
        //}
        //执行移动
        console.error("执行移动");
        this.node.setPosition(targetPosition);
    }


}


