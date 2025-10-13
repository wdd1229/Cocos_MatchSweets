import { _decorator, Component,Animation, Node,find, tween, UITransform, Vec2, Vec3, easing } from 'cc';
import { JsonManager, LevelConfig } from './JsonManager';
import GameManager from './GameManager';
import { Tile } from './Tile';
import { GridType } from './GridType';
const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends Component {
    private cellSize: number=120;
    private space: number = 10;//格子加space
    @property
    private canvas: Node = null;
    @property
    private width: number;
    @property
    private height: number;
    @property
    private levelConfig: LevelConfig = null;
    @property
    private gridRoot: Node = null;

    private gridContent: Node = null;
    private canvasContentSize = null;
    @property
    private gridNodes: Tile[] = [];

    private delayBeforeFall: number = 0.2;
    private fallDuration: number = 0.5;
    onLoad() {
        this.canvas = find("Canvas");
        this.gridContent = find("Canvas/GameUI/gridContent");
        this.gridRoot = this.gridContent.getChildByName("gridRoot");
    }
    inIt() {
        this.levelConfig = GameManager.Instance.getCurLevelConfig();
        console.error("this.levelConfig.Column:" + this.levelConfig.Column);
        console.error("this.levelConfig.Row:" + this.levelConfig.Row);

        this.width = this.levelConfig.Column * this.cellSize + (this.levelConfig.Column - 1) * this.space;
        this.height = this.levelConfig.Row * this.cellSize + (this.levelConfig.Row - 1) * this.space;
        console.error("网格宽度"+this.width);
        console.error("网格高度" + this.height);

        this.gridContent.getComponent(UITransform).setContentSize(this.width, this.canvas.getComponent(UITransform).contentSize.y);
        this.gridRoot.getComponent(UITransform).setContentSize(this.width, this.height);

        this.gridContent.position = new Vec3(0 - this.width / 2, this.gridContent.position.y,0);
        this.canvasContentSize = this.canvas.getComponent(UITransform).contentSize

        
    }

    public startGame() {
        this.spawnGridsAsync().then(() => {
            this.checkForConnectGrid();
        });
    }

    public async spawnGridsAsync() {
        const x = Math.floor(Math.random() * this.levelConfig.Column);
        const y = Math.floor(Math.random() * this.levelConfig.Row);
        for (var i = 0; i < this.levelConfig.Column+1; i++) {
            for (var j = 0; j < this.levelConfig.Row; j++) {
                const index = i * this.levelConfig.Row + j
                await this.spawnGridAtPositionAsync(index,i==x&&j==y);
            }
        }
    }

    private async spawnGridAtPositionAsync(index: number,isSpeacial:boolean) {
        const gridType = this.getRandomGridType(isSpeacial);
        //console.error("当前随机gridType:" + gridType);
        const node = GameManager.Instance.getGridPrefab(gridType);
        node.name = index.toString();
        console.error(Math.floor(index / this.levelConfig.Column) == this.levelConfig.Column);
        //最上面的一层不检测
        const tile = node.getComponent(Tile);
        tile.index = index;
        if (!(Math.floor(index / this.levelConfig.Column) == this.levelConfig.Column))
            this.gridNodes.push(tile);
        console.error("格子生成后添加到this.gridNodes" + this.gridNodes.length);
        const gridTrans = node.getComponent(UITransform)
        gridTrans.setContentSize(this.cellSize, this.cellSize);
        const targetPos = this.getScreenPosByIndex(index)
        node.position = new Vec3(targetPos.x, this.canvasContentSize.y - 300, 0);
        tile.inIt(index, gridType, this);
        //等待顶部停留时间
        await new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, this.delayBeforeFall * 1000); // 转换为毫秒
        });
        // 下落动画
        tween(node)
            .to(this.fallDuration, { position: targetPos })
            .call(() => {
                //this.playSpecialAnim(index);
            })
            .start();
    }

    getScreenPosByIndex(index: any) {
        let pos: any = this.getPosByIndex(index);
        if (pos.y == this.levelConfig.Column) {
            return new Vec3((pos.x + 1 / 2) * this.cellSize + pos.x * this.space, this.canvasContentSize.y - 300, 0);
        } else {
            return new Vec3((pos.x + 1 / 2) * this.cellSize+pos.x*this.space, (pos.y + 1 / 2) * this.cellSize+pos.y*this.space, 0);
        }
    }

    getPosByIndex(index: any) {
        return new Vec3(index % this.levelConfig.Column, Math.floor(index / this.levelConfig.Row), 0);
    }


    getRandomGridType(isSpecial: boolean): number {
       // console.error(typeof (GridType.BaiYu));
       //return GridType.BaiYu;
        if (isSpecial) {
            return GridType.SpecialCollection;
        } else {
            return Math.floor(Math.random() * 2)+1;
        }
    }
    private visited: boolean[] = [];
    checkForConnectGrid() {
        const groups: Array<Array<Tile>> = [];

        // 初始化 visited 数组
        this.visited = new Array<boolean>(this.levelConfig.Column * this.levelConfig.Row);

        for (let i = 0; i < this.levelConfig.Column * this.levelConfig.Row; i++) {
            this.visited[i] = false;
        }

        for (var i = 0; i < this.gridNodes.length; i++) {
            const xIndex = i % this.levelConfig.Column;
            const yIndex = Math.floor(i / this.levelConfig.Row);
            if (this.gridNodes[i] != null && !this.visited[i]) {
                const regions: Array<Tile> = []; 
                const count = this.checkGridDFS(xIndex, yIndex, this.gridNodes[i].gridType, regions);

                if (count >= 3) {
                    groups.push(regions);
                    console.error("*******************");
                    for (let k = 0; k < regions.length; k++) {
                        const tile: Tile = regions[k];
                        console.error(tile.name);
                    }   
                    console.error("*******************");
                }
            }
        }

        return groups;

        //for (var i = 0; i < this.levelConfig.Column; i++) {
        //    for (var j = 0; j < this.levelConfig.Row; j++) {
                
        //    }
        //}
    }

    isLinear(regions:Tile[]):boolean {
        if (regions.length < 3) return false;
        // 统计各行和列的数量
        const rowCounts: Map<number, number> = new Map();
        const colCounts: Map<number, number> = new Map();
        for (const tile of regions) {
            const row = Math.floor(tile.index / this.levelConfig.Column);
            const col = tile.index % this.levelConfig.Column;
            // 更新行和列的数量
            if (!rowCounts.has(row)) rowCounts.set(row, 0);
            rowCounts.set(row, rowCounts.get(row)! + 1);
            if (!colCounts.has(col)) colCounts.set(col, 0);
            colCounts.set(col, colCounts.get(col)! + 1);
        }
        // 检查行
        for (const [r, count] of rowCounts.entries()) {
            if (count >= 3) return true;
        }
        // 检查列
        for (const [c, count] of colCounts.entries()) {
            if (count >= 3) return true;
        }
        return false;
    }

    checkGridDFS(row: number, col: number, gridType, regions: Array<Tile>):number {
        //检查边界是否越界 ，是否访问过，和类型判断
        const index = row * this.levelConfig.Row + col;
        if (
            row < 0 || row >= this.levelConfig.Row ||
            col < 0 || col >= this.levelConfig.Column ||
            this.gridNodes[index] == null ||
            this.visited[index] ||
            this.gridNodes[index].gridType != gridType
        ) {
            return 0;
        }
        this.visited[index] = true;
        regions.push(this.gridNodes[index]);
        //像四个方向遍历
        let count = 1;
        count += this.checkGridDFS(row - 1, col, gridType, regions); // 上
        count += this.checkGridDFS(row + 1, col, gridType, regions); // 下
        count += this.checkGridDFS(row, col - 1, gridType, regions); // 左
        count += this.checkGridDFS(row, col + 1, gridType, regions); // 右
        return count;
    }
}

