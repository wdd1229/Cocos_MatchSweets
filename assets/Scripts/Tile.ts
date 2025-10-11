import { _decorator, Component, Animation,Node, TweenSystem, tween } from 'cc';
import { GridManager } from './GridManager';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {
    private gridType: GridType = null;
    private gridManager: GridManager = null;
    private curAnim: Animation = null;
    inIt(key: number, gridType: GridType,gridManager:any) {
        this.gridType = gridType;
        this.gridManager = gridManager;
        this.curAnim = this.node.getComponent(Animation);
        console.error(gridType);
        this.curAnim.play(this.gridType.toString());

        //this.playMove2Index(key);
    }
   
    playMove2Index(index:number) {
        let screenPos = this.gridManager.getScreenPosByIndex(index);
        let distance = screenPos.clone().subtract(this.node.position).length;
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(this.node);
        tween(this.node)
            .to(5, { position: screenPos }/*, { easing: 'backIn' }*/)
            .call(() => {
                //this.curAnim.play(LINK_ITEM_STATUS.SHAKE);
            })
            .start()
    }
}


