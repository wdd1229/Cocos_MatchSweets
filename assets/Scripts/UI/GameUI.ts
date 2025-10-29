import { _decorator, Button, Component, Label, Node } from 'cc';
import { type } from 'os';
import GameManager from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    @property({ type: Label, displayName: `totalScoreLabel` })
    private totalScoreLabel: Label = null;
    @property({ type: Label, displayName: `levelScoreLabel` })
    private levelScoreLabel: Label = null;
    @property({ type: Label, displayName: `关卡title文本` })
    private titleLabel: Label = null;

    @property({ type: Button, displayName: `确定按钮` })
    private explodeBtn: Button = null;
    @property({ type: Button, displayName: `托管按钮` })
    private aiBtn: Button = null;
    @property({ type: Label, displayName: `托管State文本` })
    private aiStatelabel: Label = null;

    @property({ type: Node, displayName: `levelTips` })
    private levelTips: Node = null;
    @property({ type: Label, displayName: `totalScoreLabel_Tips` })
    private totalScoreLabel_Tips: Label = null;
    @property({ type: Label, displayName: `levelScoreLabel_Tips` })
    private levelScoreLabel_Tips: Label = null;
    @property({ type: Button, displayName: `下一关按钮` })
    private nextlevelBtn: Button = null;


    @property({ type: Button, displayName: `设置按钮` })
    private setBtn: Button = null;
    @property({ type: Button, displayName: `帮助按钮` })
    private helpBtn: Button = null;
    @property({ type: Button, displayName: `退出按钮` })
    private exitBtn: Button = null;

    private numbers = [1, 2, 3];
    private chineseNumbers = this.numbers.map(num => {
        const cnMap = {
            1: '一',
            2: '二',
            3: '三'
        };
        return cnMap[num];
    });
    onLoad() {
        //const test = this.node.getChildByName("speacialContent");
        //console.error(test);
        //this.totalScoreLabel = this.node.getChildByName("gameScore/totalScore").getComponent(Label);
        //this.levelScoreLabel = this.node.getChildByName("gameScore/curLevelScore").getComponent(Label);
        this.explodeBtn.node.on(Button.EventType.CLICK, this.StartExplode, this);
        this.aiBtn.node.on(Button.EventType.CLICK, this.ChangeAiState, this);
        this.nextlevelBtn.node.on(Button.EventType.CLICK, this.Nextlevel, this);
        //设置按钮
        this.setBtn.node.on(Button.EventType.CLICK, () => { GameManager.Instance.OpenUI("SetUI") }, this);

        //帮助按钮
        this.helpBtn.node.on(Button.EventType.CLICK, () => { GameManager.Instance.OpenUI("HelpUI") }, this);

        //退出按钮
        this.exitBtn.node.on(Button.EventType.CLICK, () => { GameManager.Instance.OpenUI("ExitUI") }, this);
    }

    start() {
        this.aiStatelabel.string = "开始托管";
        this.InitTitle();
    }
    /**下一关 */
    Nextlevel() {
        this.levelTips.active = false;
        GameManager.Instance.clearAllGrid();
    }
    /**过关弹窗 */
    initlevelTips() {
        this.totalScoreLabel_Tips.string = GameManager.Instance.getgameTotalScore().toString();
        this.levelScoreLabel_Tips.string = GameManager.Instance.getcurLevelScore().toString();
        this.levelTips.active = true;

    }

    /**当前关卡title显示 */
    InitTitle() {
        console.error("当前记录的关卡index为" + GameManager.Instance.getCurLevelIndex());
        this.titleLabel.string = "第" + this.chineseNumbers[GameManager.Instance.getCurLevelIndex()-1] + "关";
    }

    /**无可消除时点击确定按钮 */
    StartExplode() {
        if (GameManager.Instance.getAiState()) {
            console.error("请先取消托管");
            return;
        }
        GameManager.Instance.gridManager.InitExplode();
    }

    ChangeAiState() {
        GameManager.Instance.setAiState();
        if (GameManager.Instance.getAiState()) {
            this.aiStatelabel.string = "取消托管";
            GameManager.Instance.gridManager.InitExplode();

        } else {
            this.aiStatelabel.string = "开始托管";
        }
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

