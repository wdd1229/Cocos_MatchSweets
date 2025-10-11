// GridGenerator.ts
import { _decorator, Component, Node, Sprite, SpriteFrame, Label, Vec2, director, Canvas, Vec3, UITransform, find, instantiate, tween ,Animation} from 'cc';
const { ccclass, property } = _decorator;
@ccclass('GridGenerator')
export class GridGenerator extends Component {
    @property
    public Column: number = 4;      // 行列数
    @property
    public Row: number = 4;
    private gridNodes: Node[] = [];
    @property
    private gridPrefab: Node;
    onLoad() {
        //this.gridPrefab = this.node.getComponent("GridComponent")?.gridPrefab; // 假设你有 GridComponent 保存预制体
        this.gridPrefab = this.node.getChildByName("grid");
        this.createGrids();
    }
    async createGrids() {
        // 每个 Grid 的创建和下落延时（0.1秒）
        const delay = 0.1;
        for (let i = 0; i < this.Column; i++) {
            for (let j = 0; j < this.Row; j++) {
                let gridNode = await this.createOneGridAtTop(i, j, this.Column, (i === 1 && j === 1)); // 比如中间位置是 special
                if (gridNode) {
                    this.gridNodes.push(gridNode);
                    await this.playGridAnimation(gridNode);
                }
            }
        }
    }
    private createOneGridAtTop(i: number, j: number, columnCount: number, isSpecial: boolean): Node {
        const node = instantiate(this.gridPrefab);

        node.parent = this.node;
        // 计算格子位置（误用 i 和 j，实际需要先换位置定义）
        const x = i * 100; // 每格横向偏移 100 像素
        const y = j * 100; // 每格纵向偏移 100 像素
        // 让格子从顶部某一高度生成（假设初始位置比屏幕高 500 像素）
        node.setPosition(x + 50, y + 50 - 500);
        // 可选项：设置特殊类型或其他状态
        if (isSpecial) {
            //node.getComponent("GridComponent")?.setType("special");
        }
        return node;
    }
    private playGridAnimation(node: Node): Promise<void> {
        return new Promise(resolve => {
            const targetY = node.position.y + 500; // 回到对应目标位置
            const targetPosition =new Vec3(node.position.x, targetY);
            // 下落动画
            tween(node)
                .by(0.5, { position: targetPosition })
                .call(() => {

                    resolve();
                    const curAnim = node.getComponent(Animation);
                    curAnim.play("1");
                })
                .start();
        });
    }
}
