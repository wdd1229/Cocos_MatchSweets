import { _decorator, Component, Node } from 'cc';
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
    @property
    private LoadingUI: Node = null;
    @property
    private MainUI: Node = null;
    @property
    private GameUI: Node = null;

    //private curLevelConfig: JsonLoader.Instance.LevelConfig = null;
    onLoad() {
        GameManager._instance = this;
        console.log("GameManager -- onLoad");
        this.LoadingUI = this.node.getChildByName("LoadingUI");
        this.MainUI = this.node.getChildByName("MainUI");
        this.GameUI = this.node.getChildByName("GameUI");
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
                break;
        }
    }


    update(deltaTime: number): void {
        // 每帧更新逻辑，例如管理游戏状态
    }

    
}


