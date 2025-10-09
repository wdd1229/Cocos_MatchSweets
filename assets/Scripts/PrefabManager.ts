import { _decorator, Component, game, instantiate, Node, Prefab, resources, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PrefabManager')
export class PrefabManager extends Component {
    @property
    private gridPrefab: Prefab = null;
    @property
    private curGrid: Node=null;
    onLoad() {
        this.LoadGridPrefab();
    }

    LoadGridPrefab() {
        resources.load("GridPrefab/grid", Prefab, (err, prefab) => {
            console.log("加载grid成功*********");
            this.gridPrefab = prefab;

            const xPos = -700;
            const yPos = 0;
            for (var i = 1; i < 4; i++) {
                for (var j = 1; j < 6; j++) {
                    this.curGrid = instantiate(prefab);
                    this.node.addChild(this.curGrid);
                    this.curGrid.setPosition(xPos+j * 200, yPos+i*200);
                    const curAnim = this.curGrid.getComponent(Animation);
                    console.log(i.toString() + j.toString());
                    curAnim.play(i.toString()+"-"+j.toString());
                }
            }
        })
    }

    start() {
    }

    update(deltaTime: number) {
    }
}


