import { _decorator, Component, Node ,find} from 'cc';
import { JsonManager, LevelConfig } from './JsonManager';
import { PrefabManager } from './PrefabManager';
import { GridManager } from './GridManager';
import { GridType } from './GridType';
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
    private curLevelIndex:number = 1;

    private LoadingUI: Node = null;

    private MainUI: Node = null;

    private GameUI: Node = null;

    @property
    private prefabManager: PrefabManager = null;
    @property
    private gridManager: GridManager = null;
    @property
    private jsonManager: JsonManager = null;

    private Canvas: Node = null;

    //private curLevelConfig: JsonLoader.Instance.LevelConfig = null;
    onLoad() {
        GameManager._instance = this;
        console.log("GameManager -- onLoad");
        this.Canvas = find("Canvas");
        this.LoadingUI = this.Canvas.getChildByName("LoadingUI");
        this.MainUI = this.Canvas.getChildByName("MainUI");
        this.GameUI = this.Canvas.getChildByName("GameUI");

        this.prefabManager = this.node.getChildByName("PrefabManager").getComponent(PrefabManager);
        this.gridManager = this.node.getChildByName("GridManager").getComponent(GridManager);
        this.jsonManager = this.node.getChildByName("JsonManager").getComponent(JsonManager);
    }

    start() {
        this.LoadingUI.active = true;
        this.MainUI.active = false;
        this.GameUI.active = false;


    }

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
                this.LoadingUI.active = true;
                this.MainUI.active = false;
                this.GameUI.active = false;
                break;
             case "MainUI":
                 //console.log(this.LoadingUI);
                 //console.log(this.MainUI);
                 //console.log(this.GameUI);
                this.LoadingUI.active = false;
                this.MainUI.active = true;
                this.GameUI.active = false;
                break;
            case "GameUI":
                this.LoadingUI.active = false;
                this.MainUI.active = false;
                 this.GameUI.active = true;
                 this.StartGame();
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

    public getCurLevelIndex(): number {
        return this.curLevelIndex;
    }

    public getCurLevelConfig(): LevelConfig {
        console.error("GameManager--getCurLevelConfig:" + this.curLevelIndex);
        return this.jsonManager.GetLevelConfig(this.curLevelIndex);
    }

    public getScoreForConnetGridsAndGridType(gridType:GridType,connectGrids) {
        return this.jsonManager.GetScore(gridType, connectGrids);
    }

    public getGridPrefab(gridType: GridType): Node {
        return this.prefabManager.getGridPrefab(gridType);
    }

    public releaseGridPrefab(node:Node) {
        this.prefabManager.releaseGridPrefab(node);
    }
}


