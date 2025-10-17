import { _decorator, Component,find, game, instantiate, Node, Prefab, resources, Animation, Sprite, SpriteFrame, Canvas, view, Vec3, Vec2, tween } from 'cc';
import { GridType } from './GridType';
const { ccclass, property } = _decorator;

@ccclass('PrefabManager')
export class PrefabManager extends Component {
    @property
    private gridPrefab: Prefab = null;
    @property
    private gridRoot: Node = null;



    //初始化对象池
    private gridPool: Node[] = [];
    private maxGridPoolSize = 20;//根据需要调整预加载的格子



    private scoreItemRoot: Node = null;
    private scoreContent: Node = null;
    private scoreItemPrefab: Prefab = null;

    private scoreItemPool: Node[] = [];
    private maxScoreItemPoolSize = 10;


    @property({ type: SpriteFrame, displayName:"sprites"})
    private sprites: SpriteFrame[] = [];

    private screenHeight: number;
    onLoad() {
        this.gridRoot = find("Canvas/GameUI/gridContent/gridRoot");
        this.scoreItemRoot = find("Canvas/GameUI/scoreContent");
        this.scoreContent = find("Canvas/GameUI/ScrollView/view/scoreContent");
        this.LoadGridPrefab();
        this.LoadscoreItemPrefab();
        this.LoadSprite();

        const visibleSize = view.getVisibleSize(); // ✅ 推荐方式
        this.screenHeight = visibleSize.height;
    }

   async LoadSprite() {
       for (const key in GridType) {
           

           // 检查是否是枚举的成员（不包括数字键）
           if (Object.prototype.toString.call(GridType[key]) === "[object String]") {
               const value = GridType[key];
               console.log("枚举键名:", key); // 例如 "SpecialCollection"
               console.log("枚举值:", value); // 例如 0

               await resources.load("GridIcon/" + key.toString() +"/spriteFrame", SpriteFrame, (err, sprite) => {
                   SpriteFrame[key.toString()] = sprite;
                   console.log("加载SpriteFrame成功********* key:" + key);
               })
           }
       }

      

    }

    LoadGridPrefab() {
        resources.load("GridPrefab/grid", Prefab, (err, prefab) => {
            if (err || !prefab) {
                console.error("加载 Grid 预制失败!", err);
                return;
            }
            this.gridPrefab = prefab;
            console.log("加载grid成功*********");
            this.initializeGridPool();
        })
    }

    LoadscoreItemPrefab() {
        resources.load("scoreItemPrefab/scoreItem", Prefab, (err, prefab) => {
            if (err || !prefab) {
                console.error("加载 scoreItem 预制失败!", err);
                return;
            }
            this.scoreItemPrefab = prefab;
            console.log("加载scoreItem成功*********");
            this.initializeScoreItemPool();
        })
    }

    private initializeGridPool() {
        for (let i = 0; i < this.maxGridPoolSize; i++) {
            const node = instantiate(this.gridPrefab);
            node.parent = this.gridRoot;
            node.active = false;
            this.gridPool.push(node);
        }
    }

    private initializeScoreItemPool() {
        for (let i = 0; i < this.maxScoreItemPoolSize; i++) {
            const node = instantiate(this.scoreItemPrefab);
            node.parent = this.scoreItemRoot;
            node.active = false;
            this.scoreItemPool.push(node);
        }
    }

    public  getGridPrefab(gridType:GridType):Node {
        if (!this.gridPrefab) {
            console.error("Grid Prefab 未加载，请检查！");
            return null;
        } 
        //else {
        //    this.curGrid = instantiate(this.gridPrefab);
        //    this.gridRoot.addChild(this.curGrid);
        //    return this.curGrid;
        //}
        //从对象池取一个空闲 node
        const node = this.gridPool.pop();
        if (node) {
            //console.error("从对象池取一个空闲 node");
            node.active = true;
            //node.getComponent(Animation).play(gridType.toString());
            //console.error(this.gridType.toString());
            return node;
        } else {
            //创建一个新 node
            //console.error("创建一个新 node");
            const node = instantiate(this.gridPrefab);
            node.active = true;
            node.parent = this.gridRoot;
            //node.getComponent(Animation).play(gridType.toString());
            return node;
        }
    }

    public releaseGridPrefab(node: Node) {
        if (!node) return;
            node.active = false;
        this.gridPool.push(node);
    }

    public getScoreItemPrefab(): Node {
        if (!this.scoreItemPrefab) {
            console.error("Grid Prefab 未加载，请检查！");
            return null;
        } 
        const node = this.scoreItemPool.pop();
        if (node) {
            //this.node.setSiblingIndex(1);
            node.parent = this.scoreContent;
            node.active = true;
            //node.position = new Vec3(0, -1000);
            return node;
        } else {
            //创建一个新 node
            const node = instantiate(this.scoreItemPrefab);
            node.parent = this.scoreContent;
            //this.node.setSiblingIndex(1);
            node.active = true;
            //node.position = new Vec3(0, -1000);
            // 动画：从屏幕底部滑动到顶部
            //tween(node)
            //    .to(5,{ position: new Vec3(0, this.screenHeight)  })
            //    .start();
            return node;
        }
    }

    public getSpriteForGridType(gridType: GridType): SpriteFrame {
        if (this.sprites[gridType.toString()] == null) {
            console.error(gridType+"  类型icon未加载，请检查！");
            return null;
        }
        return this.sprites[gridType];
    }

    start() {
    }

    update(deltaTime: number) {
    }
}


