import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    @property
    private totalScoreLabel: Label;
    @property
    private levelScoreLabel: Label;
    onLoad() {
        const test = this.node.getChildByName("gameScore/gameTotalScore");
        console.error(test);
        this.totalScoreLabel = this.node.getChildByName("gameScore/totalScore").getComponent(Label);
        this.levelScoreLabel = this.node.getChildByName("gameScore/curLevelScore").getComponent(Label);
    }
    /**
     * /刷新游戏总分数显示
     * @param value
     */
    public refreshTotalScore(value:number) {
        this.totalScoreLabel.string = value.toString();
    }
    /**
     * /刷新本局分数显示
     * @param value
     */
    public refreshLevelScore(value:number) {
        this.levelScoreLabel.string = value.toString();
    }
}

