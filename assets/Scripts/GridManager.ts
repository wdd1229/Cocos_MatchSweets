import { _decorator, Component,Animation, Node,find, tween, UITransform, Vec2, Vec3, easing, log } from 'cc';
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
        if (!this.levelConfig) {
            log("LevelConfig is undefined, can't initialize!");
            return;
        }
        console.error("this.levelConfig.Column:" + this.levelConfig.Column);
        console.error("this.levelConfig.Row:" + this.levelConfig.Row);

        this.width = this.levelConfig.Column * this.cellSize + (this.levelConfig.Column - 1) * this.space;
        this.height = this.levelConfig.Row * this.cellSize + (this.levelConfig.Row - 1) * this.space;
        console.error("网格宽度"+this.width);
        console.error("网格高度" + this.height);

        this.canvasContentSize = this.canvas.getComponent(UITransform).contentSize
        this.gridContent.getComponent(UITransform).setContentSize(this.width, this.canvasContentSize.y);
        this.gridRoot.getComponent(UITransform).setContentSize(this.width, this.height);

        this.gridContent.position = new Vec3(0 - this.width / 2, this.gridContent.position.y,0);

        // 初始化 visited 数组
        this.visited = new Array<boolean>(this.levelConfig.Column * this.levelConfig.Row).fill(false);
    }

    public startGame() {
        this.spawnGridsAsync().then(() => {
            //tween(this)
            //    .delay(2)
            //    .call(() => {
            //        const matchGrids = this.checkForConnectGrids();

            //        this.cleatAllConnectGrids(matchGrids);
            //    })


            //this.cleatAllConnectGrids(this.checkForConnectGrids());


            this.waitAndProcess();
        });
    }

    private waitAndProcess() {
        log("开始执行消除逻辑111...");
        tween(this)
            .delay(2)
            .call(() => {
                log("开始执行消除逻辑222..."); // 确认是否执行
                const matchGrids = this.checkForConnectGrids();
                this.cleatAllConnectGrids(matchGrids);
                this.playAnimationsByType(matchGrids); // 你单独提取了播放动画部分

                this.dropAndFill(matchGrids);
            }).start();
    }

    public async spawnGridsAsync() {
        //初始化网格结构
        const x = Math.floor(Math.random() * this.levelConfig.Column);
        const y = Math.floor(Math.random() * this.levelConfig.Row);
        for (var i = 0; i < this.levelConfig.Column+1; i++) {
            for (var j = 0; j < this.levelConfig.Row; j++) {
                const index = i * this.levelConfig.Row + j
                await this.spawnGridAtPositionAsync(index,i,j,i==x&&j==y);
            }
        }
    }

    private async spawnGridAtPositionAsync(index: number, row: number,col: number,isSpeacial:boolean) {
        const gridType = this.getRandomGridType(isSpeacial);
        //console.error("当前随机gridType:" + gridType);
        const node = GameManager.Instance.getGridPrefab(gridType);
        node.name = index.toString();
        //最上面的一层不检测
        const tile = node.getComponent(Tile);
        //tile.index = index;
        if (!(Math.floor(index / this.levelConfig.Column) == this.levelConfig.Column)) {
            
            this.gridNodes.push(tile);
        }
        const gridTrans = node.getComponent(UITransform)
        gridTrans.setContentSize(this.cellSize, this.cellSize);
        const targetPos = this.getScreenPosByIndex(index)
        node.position = new Vec3(targetPos.x, this.canvasContentSize.y - 110, 0);

        tile.inIt(index, row, col, gridType, this);
        console.log("初始化的格子：" + tile.index + "在第" + tile.row + "行 " + "第" + tile.col + "列");
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
            return new Vec3((pos.x + 1 / 2) * this.cellSize + pos.x * this.space, this.canvasContentSize.y - 110, 0);
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
    checkForConnectGrids() {
        const groups: Array<Array<Tile>> = [];

        // 初始化 visited 数组
        this.visited = new Array<boolean>(this.levelConfig.Column * this.levelConfig.Row);

        for (let i = 0; i < this.levelConfig.Column * this.levelConfig.Row; i++) {
            this.visited[i] = false;
        }

        for (let row = 0; row < this.levelConfig.Row; row++) {
            for (let col = 0; col < this.levelConfig.Column; col++) {
                const i = row * this.levelConfig.Column + col;
                if (this.gridNodes[i] && !this.visited[i]) {
                    const regions: Array<Tile> = [];
                    console.error(`Xindex:${row} yIndex:${col}`);
                    const count = this.checkGridDFS(row, col, this.gridNodes[i].gridType, regions);
                    if (count >= 3 && this.isLinear(regions)) {
                        groups.push(regions);
                        console.error("*******************");
                        for (let k = 0; k < regions.length; k++) {
                            const tile: Tile = regions[k];
                            console.error(tile.name);

                            //tile.getComponent(Animation).play("effectHideAni");
                        }
                        console.error("*******************");
                    }
                }
            }
        }

        //for (var i = 0; i < this.gridNodes.length; i++) {
        //    const xIndex = i % this.levelConfig.Column;
        //    const yIndex = Math.floor(i / this.levelConfig.Row);
        //    console.error(`Xindex:${xIndex} yIndex:${yIndex}`);
        //    if (this.gridNodes[i] != null && !this.visited[i]) {
        //        const regions: Array<Tile> = []; 
        //        const count = this.checkGridDFS(xIndex, yIndex, this.gridNodes[i].gridType, regions);

        //        if (count >= 3 && this.isLinear(regions)) {
        //            groups.push(regions);
        //            console.error("*******************");
        //            for (let k = 0; k < regions.length; k++) {
        //                const tile: Tile = regions[k];
        //                console.error(tile.name);

        //                //tile.getComponent(Animation).play("effectHideAni");
        //            }   
        //            console.error("*******************");
        //        }
        //    }
        //}

        return groups;

        //for (var i = 0; i < this.levelConfig.Column; i++) {
        //    for (var j = 0; j < this.levelConfig.Row; j++) {
                
        //    }
        //}
    }

    isLinear(regions: Array<Tile>):boolean {
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
        return 1 +
            this.checkGridDFS(row - 1, col, gridType, regions) + // 上
            this.checkGridDFS(row + 1, col, gridType, regions) + // 下
            this.checkGridDFS(row, col - 1, gridType, regions) + // 左
            this.checkGridDFS(row, col + 1, gridType, regions);  // 右
    }

    cleatAllConnectGrids(matchGrids: Array<Array<Tile>>) {
        for (let tileArray of matchGrids) {
            for (let tile of tileArray) {
                // 操作tile
                //console.log(tile.index);
                //this.gridNodes[tile.index] = null;
                this.gridNodes[tile.index].setRemoved(true);

                this.releaseTile(tile.node);
            }
        }
        //    tile.getComponent(Animation).play("effectHideAni");

        if (matchGrids.length === 0) {
            return;
        }
        // 无需全局变量，按类型分组播放动画
        for (let i = 0; i < matchGrids.length; i++) {
            const tileArray: Tile[] = matchGrids[i];
            const type: GridType = tileArray[0].gridType;
            // 等待 300ms 后播放该类型动画
            //tween(this)
            //    .delay(1 * i) // 每个类型组按序播放
            //    .call(() => this.playEffectForTileArray(tileArray, type))
            //    .start();
        }



        //let specialScore = 0;
        //let normalScore = 0;
        //for (let tileArray of matchGrids) {
        //    if (tileArray == null || tileArray.length == 0)
        //        continue;
        //    for (let tile of tileArray) {
        //        // 操作tile
        //        //console.log(tile.index);
        //        if (tile == null) continue;

        //        if (tile.gridType == GridType.SpecialCollection) {
        //            specialScore++;

        //            console.error(`当前收集品数量为：${specialScore}`);

        //        }
        //        tile.getComponent(Animation).play("effectHideAni");
        //        this.gridNodes[tile.index] = null;
        //    }

        //    normalScore += GameManager.Instance.getScoreForConnetGridsAndGridType(tileArray[0].gridType, tileArray.length);
        //    console.error(`类型为：${tileArray[0].gridType}  getScoreForConnetGridsAndGridType：${GameManager.Instance.getScoreForConnetGridsAndGridType(tileArray[0].gridType, tileArray.length) }`);

        //    //normalScore += 5;//暂时定位每次消除分数都是5

        //    tween().delay(300).start();

        //}

        //console.error("当前消除分数为：" + normalScore);
    }

    private playEffectForTileArray(tileArray: Tile[], type: GridType) {
        if (!tileArray || tileArray.length === 0) return;
        for (const tile of tileArray) {
            if (tile && tile.getComponent(Animation)) {
                tile.getComponent(Animation).play("effectHideAni");
            }
        }
        // 这里可以补充后续逻辑，如：分数统计、隐藏节点等
        const count = tileArray.length;
        const score = GameManager.Instance.getScoreForConnetGridsAndGridType(type, count);
        console.error(`类型为：${type} 的消除格子个数为：${count}，对应分数为：${score}`);
    }

    private playAnimationsByType(matchGrids: Array<Array<Tile>>): void {
        if (matchGrids.length === 0) return;
        for (let i = 0; i < matchGrids.length; i++) {
            const tileArray = matchGrids[i];
            const type = tileArray[0].gridType;
            tween(this)
                .delay(1 * i)
                .call(() => this.playEffectForTileArray(tileArray, type))
                .start();
        }
    }
    //主流程：消除某些tile 触发下落填充
    public dropAndFill(matchGrids: Array<Array<Tile>>) {
        this.dropTiles();
        //this.fillTop();
    }


    //释放tile节点 ：归还到对象池
    private releaseTile(tile: Node) {
        if (!tile) {
            return;
        }
        tile.active = false;
        GameManager.Instance.releaseGridPrefab(tile)
    }
    //下落所有为被消除的tiles (按列下落)
    dropTiles() {
        console.error("开始检测下落逻辑*********");

        const cols = this.levelConfig.Column;
        const rows = this.levelConfig.Row;
        for (let col = 0; col < cols; col++) {
            //从顶部向下找可用的未被消除的tile
            for (let row = 0; row < rows; row++) {
                const index = row * cols + col;
                const tile = this.gridNodes[index];
                if (tile && tile.isRemoved) {
                    continue;
                }
                //如果是未被消除的tile 下落到下方的有效position
                if (tile && !tile.isRemoved) {
                    //console.log("要下落的：" + tile.index +"在第"+tile.row+"行 "+"第"+tile.col+"列");
                    this.findValidTilePosition(col, row, tile);

                }
            }
        }
    }
    //找到该列未被消除的tile 的下一个可用行
    private findValidTilePosition(col: number, currentRow: number, tile: Tile): number {
        let targetRow = currentRow;
        while (targetRow>=0) {
            const index = targetRow * this.levelConfig.Column + col;
            const tTile = this.gridNodes[index];
            if (tTile && tTile.isRemoved) {
                //找到空位 下落该tile 至targetRow
                console.error(`当前下标为: ${tile.index} 当前行为${currentRow}  要移动到的行为 ${targetRow}`)
                tile.dropToNewRow(tTile.node.position);
            } else if (tTile&&tTile.isRemoved==false) {
                break;
            }
            targetRow--;
        }
        return targetRow;
    }
    //填充顶部的 empty position
    fillTop() {
        const cols = this.levelConfig.Column;
        const rows = this.levelConfig.Row;
        for (let col = 0; col < cols; col++) {
            let targetRow = 0;
            // 从顶部开始填充空位
            for (let row = 0; row < rows; row++) {
                const index = row * cols + col;
                const tile = this.gridNodes[index];
                if (tile && !tile.getComponent(Tile).isRemoved) {
                    continue;
                }
                const newTile = GameManager.Instance.getGridPrefab(this.getRandomGridType(false));
                if (newTile) {
                    newTile.getComponent(Tile).inIt(index, row, col, this.getRandomGridType(false),this);
                    newTile.setPosition(new Vec3(col, row));
                    this.gridNodes[index] = newTile.getComponent(Tile);
                }
            }
        }
    }
}

