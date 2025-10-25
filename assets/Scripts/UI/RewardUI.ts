import { _decorator, Button, Component, Label, Node } from 'cc';
import GameManager from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('RewardUI')
export class RewardUI extends Component {
    @property({ type: Node, displayName: `RewardTips` })
    private RewardTips: Node = null;

    @property({ type: Label, displayName: `RewardTips_Label` })
    private rewardTips_Label: Label = null;

    @property({ type: Button, displayName: `Reset按钮` })
    private resetBtn: Button = null;
    @property({ type: Button, displayName: `详情按钮` })
    private rewardBtn: Button = null;
    onLoad() {
        this.resetBtn.node.on(Button.EventType.CLICK, this.ResetGame, this);
        this.rewardBtn.node.on(Button.EventType.CLICK, this.RewardDetails, this);
    }
    inIt(id: number) {
        this.RewardTips.active = true;
        this.rewardTips_Label.string = "获得奖励" + id;
    }
    ResetGame() {
        this.node.active = false;
        this.RewardTips.active = false;
        GameManager.Instance.ResetGame();
    }

    RewardDetails() {
        //TODO
    }
}

