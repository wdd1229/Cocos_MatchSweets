import { _decorator, Component, Node ,find, Prefab, Label} from 'cc';
import { JsonManager, LevelConfig } from './JsonManager';
import { PrefabManager } from './PrefabManager';
import { GridManager } from './GridManager';
import { GridType } from './GridType';
import { GameUI } from './UI/GameUI';
import { MainUI } from './UI/MainUI';
import { LoadingUI } from './UI/LoadingUI';
import { RewardUI } from './UI/RewardUI';
import { HelpUI } from './UI/HelpUI';
import { SetUI } from './UI/SetUI';
import { ExitUI } from './UI/ExitUI';
import { DouyinAPI } from './DouyinAPI';
const { ccclass, property } = _decorator;



@ccclass('GameManager')
export default class GameManager extends Component {
    // 单例机制
    private static _instance: GameManager = null;
    public static get Instance(): GameManager {
        if (!GameManager._instance) {
            console.log("GameManager 单例尚未初始化！");

            return null;
        }
        return GameManager._instance;
    }
    init(): void {
        // 初始化逻辑
        console.log("GameManager 已初始化");
    }
    /**当前关卡Index */
    private curLevelIndex: number = 1;
    //ui
    private LoadingUI: LoadingUI = null;
    private MainUI: MainUI = null;
    public GameUI: GameUI = null;
    public RewardUI: RewardUI = null;
    public HelpUI: HelpUI = null;
    public SetUI: SetUI = null;
    public ExitUI: ExitUI = null;
    @property
    private prefabManager: PrefabManager = null;
    @property
    public gridManager: GridManager = null;
    @property
    private jsonManager: JsonManager = null;
    private Canvas: Node = null;
    /** 游戏总分数*/
    private gameTotalScore: number = 0;
    /** 当前关卡分数*/
    private curLevelSocre: number = 0;

    private curLevelwallCount: number = 0;

    /**当前是否托管 */
    private aiState: boolean = false;
    onLoad() {
        GameManager._instance = this;
        console.log("GameManager -- onLoad");
        this.Canvas = find("Canvas");
        this.LoadingUI = this.Canvas.getChildByName("LoadingUI").getComponent(LoadingUI);
        this.MainUI = this.Canvas.getChildByName("MainUI").getComponent(MainUI);
        this.GameUI = this.Canvas.getChildByName("GameUI").getComponent(GameUI);
        this.RewardUI = this.Canvas.getChildByName("RewardUI").getComponent(RewardUI);
        this.HelpUI = this.Canvas.getChildByName("HelpUI").getComponent(HelpUI);
        this.SetUI = this.Canvas.getChildByName("SetUI").getComponent(SetUI);
        this.ExitUI = this.Canvas.getChildByName("ExitUI").getComponent(ExitUI);

        this.prefabManager = this.node.getChildByName("PrefabManager").getComponent(PrefabManager);
        this.gridManager = this.node.getChildByName("GridManager").getComponent(GridManager);
        this.jsonManager = this.node.getChildByName("JsonManager").getComponent(JsonManager);
    }

    start() {
        // 检查环境
        console.log('是否在抖音小游戏环境:', DouyinAPI.isInDouyinGame());

        // 显示提示
        this.showHello();


        this.LoadingUI.node.active = true;
        this.MainUI.node.active = false;
        this.GameUI.node.active = false;
    }
    showHello() {
        DouyinAPI.show({
            title: '欢迎',
            content: '欢迎使用这款小游戏',
            success: () => {
                console.log('提示框显示成功');
                // 可以在这里触发其他操作
            },
            fail: (err) => {
                console.error('提示框显示失败', err);
            }
        });
    }
    // 分享功能
    onShare() {
        DouyinAPI.share({
            channel: 'menu',
            title: '快来玩这个游戏！',
            content: '我在抖音上发现了一个有趣的小游戏',
            query: 'from=share',
            success: () => {
                console.log('分享成功');
            },
            fail: (err) => {
                console.error('分享失败', err);
            }
        });
    }


    /**打开对应UI
     * @param uiname
     * @returns
     */
    public OpenUI(uiname) {
        // 判断是否已经初始化
        if (!GameManager.Instance) {
            console.warn("GameManager 未初始化，无法打开 UI");
            return;
        }
        // 保证 UI 节点不为空
        if (!this.LoadingUI || !this.MainUI || !this.GameUI) {
            console.warn("GameManager 中的 UI 节点未正确设置，请确保挂载了 LoadingUI、MainUI、GameUI！");
            return;
        }
        console.log("GameManager --OpenUI uiname: "+uiname);
         switch (uiname) {
            case "LoadingUI":
                this.LoadingUI.node.active = true;
                this.MainUI.node.active = false;
                this.GameUI.node.active = false;
                break;
             case "MainUI":
                 //console.log(this.LoadingUI);
                 //console.log(this.MainUI);
                 //console.log(this.GameUI);
                this.LoadingUI.node.active = false;
                this.MainUI.node.active = true;
                this.GameUI.node.active = false;
                break;
            case "GameUI":
                this.LoadingUI.node.active = false;
                this.MainUI.node.active = false;
                 this.GameUI.node.active = true;
                 this.StartGame();
                 break;
             case "HelpUI":
                 this.HelpUI.node.active = true;
                 this.SetUI.node.active = false;
                 this.ExitUI.node.active = false;
                 break;
             case "SetUI":
                 this.SetUI.node.active = true;
                 this.HelpUI.node.active = false;
                 this.ExitUI.node.active = false;
                 break;
             case "ExitUI":
                 this.ExitUI.node.active = true;
                 this.SetUI.node.active = false;
                 this.HelpUI.node.active = false;
                 break;
        }
    }

    StartGame() {
        this.gridManager.inIt();
        this.gridManager.startGame();
        //this.gridManager.spawnGridsAsync();
    }

    update(deltaTime: number): void {
        // 每帧更新逻辑，例如管理游戏状态
    }
    /**
     * /获取当前关卡Index
     * @returns
     */
    public getCurLevelIndex(): number {
        return this.curLevelIndex;
    }
    /**
     * /获取对应关卡config
     * @returns
     */
    public getCurLevelConfig(): LevelConfig {
        console.error("GameManager--getCurLevelConfig:" + this.curLevelIndex);
        return this.jsonManager.GetLevelConfig(this.curLevelIndex);
    }
    /**
     * /根据类型和连接数获取对于分数
     * @param gridType
     * @param connectGrids
     * @returns
     */
    public getScoreForConnetGridsAndGridType(gridType:GridType,connectGrids) {
        return this.jsonManager.GetScore(gridType, connectGrids);
    }
    /**
     * /获取格子预制
     * @param gridType
     * @returns
     */
    public  getGridPrefab(gridType: GridType):Node {
        return this.prefabManager.getGridPrefab(gridType);
    }
    /**获取分数item预制
     * /
     * @returns
     */
    public getScoreItemPrefab():Node {
        return this.prefabManager.getScoreItemPrefab();
    }
    /**
     * /根据格子类型获取提前加载的对应图片
     * @param gridType
     * @returns
     */
    public getSpriteForGridType(gridType:GridType) {
        return this.prefabManager.getSpriteForGridType(gridType);
    }
    /**
     * 不用的格子放回对象池
     * @param node
     */
    public releaseGridPrefab(node:Node) {
        this.prefabManager.releaseGridPrefab(node);
    }
    /**
     * 获取游戏总分数
     * @returns
     */
    public getgameTotalScore():number {
        return this.gameTotalScore;
    }
    /**游戏总分数增加 */
    public addgameTotalScore() {
        this.gameTotalScore += this.curLevelSocre;
        this.curLevelSocre = 0;
        this.addcurIndexScore(0);
        this.GameUI.refreshTotalScore(this.gameTotalScore);
        this.GameUI.refreshLevelScore(this.curLevelSocre);
    }
    /**
     * /获取当前关卡得分
     * @returns
     */
    public getcurLevelScore():number {
        return this.curLevelSocre;
    }
    /**
     * /当前关卡得分增加
     * @param value
     */
    public addcurIndexScore(value:number) {
        this.curLevelSocre += value;
        //通知ui更新
        this.GameUI.refreshLevelScore(this.curLevelSocre);
    }
    /**
     * /获取托管状态
     * @returns
     */
    public getAiState(): boolean {
        return this.aiState;
    }

    public setAiState() {
        this.aiState=!this.aiState;
    }
    /**
     * 获取当前关卡需要过关的wall数量
     * @returns
     */
    public getLevelwallCount() {
       return this.jsonManager.GetLevelConfig(this.curLevelIndex).wallCount;
    }

    /**
     * 获取当前游戏记录的wall数量
     */
    public getCurGamewallCount():number {
        return this.curLevelwallCount;
    }
    /**增加 当前游戏记录的wall数量*/
    public setCurGamewallCount() {
        this.curLevelwallCount += 1;
    }


    public clearAllGrid() {
        if (this.curLevelIndex+1 > this.jsonManager.GetLevelConfigLen()) {
            this.GameUI.node.active = false;
            this.RewardUI.node.active = true;
            console.error("关卡结束了。。。");
            return;
        }
        this.curLevelIndex++;
        this.gridManager.isGameOver = false;
        this.curLevelwallCount = 0;
        this.gridManager.clearAllGrid();
        this.gridManager.inIt();
        this.GameUI.InitTitle();
    }

    public ResetGame() {
        this.GameUI.node.active == true
        this.curLevelIndex = 1;
        this.curLevelwallCount = 0;
        this.gridManager.isGameOver = false;
        this.gridManager.clearAllGrid();
        this.gridManager.inIt();
        this.GameUI.InitTitle();
    }

    public setGameoverState(value) {
        this.gridManager.isGameOver = value;
    }

    
    public setRewardID(id: number) {
        this.RewardUI.inIt(id);
    }


}


