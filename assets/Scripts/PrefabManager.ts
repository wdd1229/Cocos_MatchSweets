import { _decorator, Component,find, game, instantiate, Node, Prefab, resources, Animation } from 'cc';
import { GridType } from './GridType';
const { ccclass, property } = _decorator;

@ccclass('PrefabManager')
export class PrefabManager extends Component {
    @property
    private gridPrefab: Prefab = null;
    @property
    private curGrid: Node = null;
    @property
    private gridRoot: Node = null;

    //初始化对象池
    private gridPool: Node[] = [];
    private maxPoolSize = 42;//根据需要调整预加载的格子
    onLoad() {
        this.LoadGridPrefab();

        this.gridRoot = find("Canvas/GameUI/gridContent/gridRoot");
    }

    LoadGridPrefab() {
        resources.load("GridPrefab/grid", Prefab, (err, prefab) => {
            if (err || !prefab) {
                console.error("加载 Grid 预制失败!", err);
                return;
            }
            this.gridPrefab = prefab;
            console.log("加载grid成功*********");
            this.initializePool();
        })
    }

    private initializePool() {
        for (let i = 0; i < this.maxPoolSize; i++) {
            const node = instantiate(this.gridPrefab);
            node.parent = this.gridRoot;
            node.active = false;
            this.gridPool.push(node);
        }
    }

    public getGridPrefab(gridType:GridType): Node {
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
            node.getComponent(Animation).play(gridType.toString());
            //console.error(this.gridType.toString());
            return node;
        } else {
            //创建一个新 node
            const node = instantiate(this.gridPrefab);
            node.active = true;
            node.getComponent(Animation).play(gridType.toString());
            return node;
        }
    }

    public releaseGridPrefab(node: Node) {
        if (!node) return;
            node.active = false;
        this.gridPool.push(node);
    }

    start() {
    }

    update(deltaTime: number) {
    }
}


