import { _decorator, Component,find, game, instantiate, Node, Prefab, resources, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PrefabManager')
export class PrefabManager extends Component {
    @property
    private gridPrefab: Prefab = null;
    @property
    private curGrid: Node = null;
    @property
    private gridRoot: Node = null;
    onLoad() {
        this.LoadGridPrefab();

        this.gridRoot = find("Canvas/GameUI/gridContent/gridRoot");
    }

    LoadGridPrefab() {
        resources.load("GridPrefab/grid", Prefab, (err, prefab) => {
            console.log("加载grid成功*********");
            this.gridPrefab = prefab;

            //const xPos = -700;
            //const yPos = 0;
            //for (var i = 1; i < 4; i++) {
            //    for (var j = 1; j < 6; j++) {
            //        this.curGrid = instantiate(prefab);
            //        this.node.addChild(this.curGrid);
            //        this.curGrid.setPosition(xPos+j * 200, yPos+i*200);
            //        const curAnim = this.curGrid.getComponent(Animation);
            //        console.log(i.toString() + j.toString());
            //        curAnim.play(i.toString()+"-"+j.toString());
            //    }
            //}
        })
    }

    public getGridPrefab(gridType:GridType): Node {
        if (!this.gridPrefab) {
            console.log(`请检查Grid 当前预制为空`);
            return null;
        } else {
            this.curGrid = instantiate(this.gridPrefab);
            this.gridRoot.addChild(this.curGrid);
            //if (gridType === GridType.SpecialCollection) {
            //    return this.curGrid;
            //} else {
            //    const curAnim = this.curGrid.getComponent(Animation);
            //    curAnim.play(gridType.toString());
            //    return this.curGrid;
            //}
            return this.curGrid;
        }
    }

    start() {
    }

    update(deltaTime: number) {
    }
}


