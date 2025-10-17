import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { GridType } from './GridType';
const { ccclass, property } = _decorator;

@ccclass('ScoreItem')
export class ScoreItem extends Component {
    private icon: Sprite = null;
    private connectNumLabel: Label = null;
    private connectScoreLabel: Label = null;
    onLoad() {
        this.icon = this.node.getChildByName("icon").getComponent(Sprite);
        this.connectNumLabel = this.node.getChildByName("connectNum").getComponent(Label);
        this.connectScoreLabel = this.node.getChildByName("connectScore").getComponent(Label);
    }

    Init(type:GridType,sprite: SpriteFrame, connectNum: number, connectScore: number) {
        console.error("ScoreItem ----Init   --"+type.toString());
        resources.load("GridIcon/" + type.toString() + "/spriteFrame", SpriteFrame, (err, sprite) => {
            if (err) {
                console.error("加载失败:", err);
                return;
            }

            this.icon.spriteFrame = sprite;
            //console.log("加载SpriteFrame成功********* key:" + key);
        })
        //this.icon.spriteFrame = sprite;
        this.connectNumLabel.string = connectNum.toString();
        this.connectScoreLabel.string = connectScore.toString();
    }



    
}

