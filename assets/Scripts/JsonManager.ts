import { _decorator, Component, JsonAsset, Node, resources } from 'cc';
const { ccclass, property } = _decorator;
export interface LevelConfig {
    levelIndex: number;
    Row: number;
    Column: number;
    wallCount: number;
}
export interface LevelScoreData {
    gridType: number;
    connectCount: number;
    score: number;
}
export interface ScoreConfig {
    curLevelIndex: number;
    levelScoreDatas: LevelScoreData[];
}
@ccclass('JsonManager')
export class JsonManager extends Component {
    private LevelData: LevelConfig[] = null;

    private LevelScoreData: ScoreConfig[] = null;

    private isTest: boolean = false;
    onLoad() {
        this.loadLevelJson();
        this.loadScoreJson();
    }
    public loadLevelJson(): void {
        const path = "Data/LevelData";
        resources.load(path, JsonAsset, (err: Error, asset: JsonAsset) => {
            if (err) {
                console.error("加载 LevelJson 失败:", err);
                return;
            }
            if (asset) {
                console.log(asset.json);
                this.LevelData = asset.json.levels;
                //console.log("当前关卡的行列："+asset.json.levels[0].Row);
                console.log(`加载 LevelJson 成功`);
                //this.LevelData.forEach(level => {
                //    console.log(`关卡 ${level.levelIndex} 配置：`);
                //    console.log(`  行数：${level.Row}`);
                //    console.log(`  列数：${level.Column}`);
                //    console.log(`  墙的数量：${level.wallCount}`)
                //});
            }
        });
    }
    public loadScoreJson(): void {
        const path = "Data/ScoreData";
        resources.load(path, JsonAsset, (err: Error, asset: JsonAsset) => {
            if (err) {
                console.error("加载 ScoreJson 失败:", err);
                return;
            }
            if (asset) {
                console.log("加载 ScoreJson 成功")
                this.LevelScoreData = asset.json.scoreDatas;
                //this.LevelScoreData.forEach(level => {
                //    console.log(`关卡 ${level.curLevelIndex} 的得分规则是：`);
                //    level.levelScoreDatas.forEach(data => {
                //        console.log(`  gridType=${data.gridType}, connectCount=${data.connectCount}, score=${data.score}`);
                //    });
                //});
            }
        });
    }
    /// 根据关卡编号返回配置
    public GetLevelConfig(levelIndex: number): LevelConfig  {
        if (this.LevelScoreData == null) {
            console.log("LevelData数据为空 请检查Json数据");
            return;
        }
        return this.LevelData.find(level => level.levelIndex === levelIndex) || null;
    }

    public GetScore(gridType: number, connectCount: number): number {
        if (this.LevelScoreData == null) {
            console.log("LevelScoreData数据为空 请检查Json数据");
            return;
        }
        const levelConfig = this.LevelScoreData.find(level => level.curLevelIndex === 0); // 当前选择的是第 0 个关卡
        if (!levelConfig) return null;
        const data = levelConfig.levelScoreDatas.find(item => item.gridType === gridType && item.connectCount === connectCount);
        return data ? data.score : null;
    }
}


