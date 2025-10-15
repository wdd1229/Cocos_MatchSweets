import { _decorator, Component,Animation, Node,find, tween, UITransform, Vec2, Vec3, easing, log } from 'cc';
import { JsonManager, LevelConfig } from './JsonManager';
import GameManager from './GameManager';
import { Tile } from './Tile';
import { GridType } from './GridType';
const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends Component {
    private cellSize: number = 80;     //6行时候为80  5行的时候100 4行的时候为120
    private space: number = 10;//格子加space

    private lastRowHeight: number;
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

    private curSpecialGrid: Tile = null;
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
        this.gridContent.getComponent(UITransform).setContentSize(this.width, 800);

        this.lastRowHeight = this.gridContent.getComponent(UITransform).contentSize.y - this.cellSize / 2

        this.gridRoot.getComponent(UITransform).setContentSize(this.width, this.height);

        this.gridContent.position = new Vec3(0 - this.width / 2, this.gridContent.position.y,0);

        // 初始化 visited 数组
        this.visited = new Array<boolean>(this.levelConfig.Column * this.levelConfig.Row).fill(false);
    }

    public startGame() {
        //this.spawnGridsAsync().then(() => {
            //this.waitAndProcess();
        //});

        this.spawnGridsAsync().then(() => {
            const matchGrids = this.checkForConnectGrids();
            if (matchGrids.length>0)
                this.waitAndProcess(matchGrids);
        });
    }

    public async spawnGridsAsync() {
        const y = Math.floor(Math.random() * this.levelConfig.Row);
        for (let row = 0; row < this.levelConfig.Row + 1; row++) {
            await this.spawnGridRowAsync(row, y == row);
        }
    }

    private waitAndProcess(matchGrids: Array<Array<Tile>>) {
        log("开始执行消除逻辑111...");
        tween(this)
            .delay(1)
            .call(() => {
                log("开始执行消除逻辑222..."); // 确认是否执行
                //this.cleatAllConnectGrids(matchGrids);
                this.playAnimationsByType(matchGrids).then(() => {
                    //const matchGrids = this.checkForConnectGrids();
                    //if (matchGrids.length > 0)
                    //    this.waitAndProcess(matchGrids);

                }); // 你单独提取了播放动画部分
                //console.log("消除结束即将开始 下落----");
                //this.dropAndFill(matchGrids);
            }).start();
    }

    //public async spawnGridsByRowAsync() {
    //    this.initLastRowHeight();//重置最后一行的高度
    //    for (let row = 0; row <= this.levelConfig.Row; row++) {
    //        await this.spawnGridRowAsync(row);
    //    }
    //}

    //private initLastRowHeight() {
    //    if (this.gridContent && this.gridContent.getComponent(UITransform)) {
    //        this.lastRowHeight = this.gridContent.getComponent(UITransform).contentSize.height;
    //    } else {
    //        this.lastRowHeight = 0;
    //    }
    //}

    public async spawnGridRowAsync(row: number,isSpecial:boolean) {
        const tilesInRow = [];
        const x = Math.floor(Math.random() * this.levelConfig.Column);
        for (var col = 0; col < this.levelConfig.Column; col++) {
            const index = row * this.levelConfig.Column + col;
            const node = await this.spawnGridAtPositionAsync(index, row, col, col == x && isSpecial);
            if (node) {
                tilesInRow.push(node);
            }
        }

        //在该行全部生成后 同一下落该行的所有tile
        await new Promise<void>(resolve => {
            //模拟行间隔后同一下落
            setTimeout(() => {
                this.dropRow(tilesInRow,row);
                resolve();
            }, this.delayBeforeFall * 500 * row);
        })
    }

    //public async spawnGridsAsync() {
    //    //初始化网格结构
    //    const x = Math.floor(Math.random() * this.levelConfig.Column);
    //    const y = Math.floor(Math.random() * this.levelConfig.Row);
    //    for (var row = 0; row < this.levelConfig.Row + 1; row++) {
    //        for (var col = 0; col < this.levelConfig.Column; col++) {
    //            const index = row * this.levelConfig.Column + col;
    //            await this.spawnGridAtPositionAsync(index,row,col,row==x&&row==y);
    //        }
    //    }
    //}

    private async spawnGridAtPositionAsync(index: number, row: number, col: number,isSpeacial: boolean): Promise<Node | null> {
        const gridType = this.getRandomGridType(isSpeacial);
        const node = GameManager.Instance.getGridPrefab(gridType);
        if (!node) {
            console.error("无法生成格子，GridPrefab 未加载!");
            return null;
        }
        node.name = index.toString();
        node.getComponent(UITransform).setContentSize(this.cellSize, this.cellSize);

        const targetPos = this.getScreenPosByIndex(index);
        node.position = new Vec3(targetPos.x, this.lastRowHeight, 0);
        const tile = node.getComponent(Tile);
        if (tile) {
            tile.inIt(index, row, col, gridType, this);
            this.gridNodes[index] = tile;
            // 可选：设置为特殊格子
            if (row === this.levelConfig.Row) {
                tile.gridType = GridType.SpecialCollection;
            }
        }
        //console.log(`生成格子 ${index} 在第 ${row} 行 ${col} 列`);
        return node;
    }

    // 按行下落逻辑
    private dropRow(tiles: Node[],row:number) {
        if (!tiles || tiles.length === 0) return;
        // 计算每个 tile 应该下落到的位置
        const fallPositions: Vec3[] = this.calculateFallPositions(tiles);
        // 同步下落（Array.forEach 或循环内执行，不需要 Promise）
        for (let i = 0; i < tiles.length; i++) {
            const index = row * this.levelConfig.Column + i;
            const targetPos = this.getScreenPosByIndex(index)
            const tile = tiles[i];
            const fallPos = fallPositions[i];
            if (fallPos && tile) {
                tile.getComponent(Tile).dropToNewRow(targetPos);
            }
        }
    }

    // 计算每行 tile 的下落位置（检测该行下方是否有空格）
    private calculateFallPositions(tiles: Node[]) {
        const positions: Vec3[] = [];
        for (const tile of tiles) {
            const { row, col } = tile.getComponent(Tile) || { row: 0, col: 0 };
            let fallToRow = this.findValidFallRow(col, row);
            // 如果没找到空洞（落到底部），则不移动位置
            if (fallToRow < this.levelConfig.Row) {
                positions.push(new Vec3(col, fallToRow));
            } else {
                positions.push(new Vec3(col, row)); // 落到底部，不移动
            }
        }
        return positions;
    }

    // 在某列中查找该 tile 可以落到的行
    private findValidFallRow(col: number, currentRow: number): number {
        for (let r = currentRow + 1; r < this.levelConfig.Row; r++) {
            const index = r * this.levelConfig.Column + col;
            const tile = this.gridNodes[index];
            if (tile && tile.isRemoved) {
                return r;
            }
        }
        // 没有找到空位，落到最底部
        return this.levelConfig.Row;
    }

    //private async spawnGridAtPositionAsync(index: number, row: number,col: number,isSpeacial:boolean) {
    //    const gridType = this.getRandomGridType(isSpeacial);
    //    //console.error("当前随机gridType:" + gridType);
    //    const node = GameManager.Instance.getGridPrefab(gridType);
    //    if (node) {
    //        node.name = index.toString();
    //        node.getComponent(UITransform).setContentSize(this.cellSize, this.cellSize);
    //        //设置格子位置
    //        const targetPos = this.getScreenPosByIndex(index)
    //        node.position = new Vec3(targetPos.x, this.lastRowHeight, 0);
    //        //最上面的一层不检测
    //        const tile = node.getComponent(Tile);
    //        if (!(Math.floor(index / this.levelConfig.Column) == this.levelConfig.Column)) {
    //            tile.inIt(index, row, col, gridType, this);
    //            this.gridNodes[index]=(tile);
    //        }

    //        console.log("初始化的格子：" + tile.index + "在第" + tile.row + "行 " + "第" + tile.col + "列");
    //        //等待顶部停留时间
    //        await new Promise<void>(resolve => {
    //            setTimeout(() => {
    //                resolve();
    //            }, this.delayBeforeFall * 1000); // 转换为毫秒
    //        });
    //        // 下落动画
    //        tween(node)
    //            .to(this.fallDuration, { position: targetPos })
    //            .call(() => {
    //                //this.playSpecialAnim(index);
    //                node.getComponent(Tile).dropToNewRow(targetPos);
    //            })
    //            .start();
    //    }
    //}

    getScreenPosByIndex(index: any) {
        let pos: any = this.getPosByIndex(index);
        if (pos.y == this.levelConfig.Column) {
            return new Vec3((pos.x + 1 / 2) * this.cellSize + pos.x * this.space, this.lastRowHeight, 0);
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
            return Math.floor(Math.random() * 3)+1;
        }
    }
    private visited: boolean[] = [];
    checkForConnectGrids() {
        let groups: Array<Array<Tile>> = [];

        // 初始化 visited 数组
        this.visited = new Array<boolean>(this.levelConfig.Column * this.levelConfig.Row);

        for (let i = 0; i < this.levelConfig.Column * this.levelConfig.Row; i++) {
            this.visited[i] = false;
        }
        for (let row = 0; row < this.levelConfig.Row; row++) {
            for (let col = 0; col < this.levelConfig.Column; col++) {
                const i = row * this.levelConfig.Column + col;
                const regions: Array<Tile> = [];
                if (this.gridNodes[i] && !this.visited[i]) {
                    if (this.gridNodes[i].gridType == GridType.SpecialCollection) {
                        this.curSpecialGrid = this.gridNodes[i];
                        //groups[0] = (new Array<Tile>(test));
                        //regions.push(this.gridNodes[i]);
                        //groups.push(regions);
                    }
                    //regions = [];
                    //console.error(`Xindex:${row} yIndex:${col}`);
                    const count = this.checkGridDFS(row, col, this.gridNodes[i].gridType, regions);
                    if (count >= 3 && this.isLinear(regions)) {
                        groups.push(regions);
                        //console.error("*******************");
                        //for (let k = 0; k < regions.length; k++) {
                        //    const tile: Tile = regions[k];
                        //    console.error(tile.name);

                        //    //tile.getComponent(Animation).play("effectHideAni");
                        //}
                        //console.error("*******************");
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
        if (this.curSpecialGrid!=null)
            groups.push(new Array<Tile>(this.curSpecialGrid));

        // 2. 按 GridType.SpecialCollection 排序在最前
        groups = groups.sort((a, b) => {
            const typeA = a[0].gridType;
            const typeB = b[0].gridType;
            return typeA === GridType.SpecialCollection ? -1 : 1;
        });
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
                //this.gridNodes[tile.index].setRemoved(true);

                //this.releaseTile(tile.node);
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

    private playEffectForTileArray(tileArray: Tile[], type: GridType,islast:boolean) {
        if (!tileArray || tileArray.length === 0) return;
        for (const tile of tileArray) {
            if (tile && tile.getComponent(Animation)) {
                if (tile.gridType == GridType.SpecialCollection) {
                    this.curSpecialGrid = null;
                }
                tile.getComponent(Animation).play("effectHideAni");
                //this.gridNodes[tile.index].setRemoved(true);
                this.gridNodes[tile.index] = null;
                //this.releaseTile(tile.node);
            }
        }

        //if (this.curSpecialGrid!=null) {
        //    this.curSpecialGrid.getComponent(Animation).play("effectHideAni");
        //    this.curSpecialGrid.setRemoved(true);
        //    this.gridNodes[this.curSpecialGrid.index] = null;
        //    this.curSpecialGrid = null;
        //    //消除钻头后的操作 TODO
        //}

        // 这里可以补充后续逻辑，如：分数统计、隐藏节点等
        const count = tileArray.length;
        const score = GameManager.Instance.getScoreForConnetGridsAndGridType(type, count);
        console.error(`类型为：${type} 的消除格子个数为：${count}，对应分数为：${score}`);

        if (islast) {
            console.log("消除结束即将开始 下落----");
            tween(this).delay(2).call(() => {
                this.dropAndFill();

            }).start();
        }
    }

    private async playAnimationsByType(matchGrids: Array<Array<Tile>>):Promise<void> {
        if (matchGrids.length === 0) return;
        for (let i = 0; i < matchGrids.length; i++) {
            const tileArray = matchGrids[i];
            console.log("数组长度："+tileArray.length);
            const type = tileArray[0].gridType;
            tween(this)
                .delay(0.5 * i)
                .call(() =>
                    this.playEffectForTileArray(tileArray, type, i == matchGrids.length-1)
                    )
                .start();
        }      
    }
    //主流程：消除某些tile 触发下落填充
    public dropAndFill(/*matchGrids: Array<Array<Tile>>*/) {
        this.dropTiles();
        //this.fillTop();
    }


    //释放tile节点 ：归还到对象池
    public releaseTile(tile: Node) {
        if (!tile) {
            return;
        }
        tile.active = false;
        GameManager.Instance.releaseGridPrefab(tile)
    }
    //下落所有为被消除的tiles (按列下落)
    dropTiles() {
        console.error("开始检测下落逻辑*********");
        let count = 0;
        const cols = this.levelConfig.Column;
        const rows = this.levelConfig.Row;
        let emptySpaceCount = 0;

        let waitTime = 0;
        for (let col = 0; col < cols; col++) {
            emptySpaceCount = 0;
            //从顶部向下找可用的未被消除的tile
            for (let row = 0; row < rows; row++) {
                const index = row * cols + col;
                const tile = this.gridNodes[index];
                if (tile == null) {
                    emptySpaceCount++;
                } else if (emptySpaceCount > 0) {
                    //console.error("空格数量" + emptySpaceCount + "当前index:" + index + "要移动到" + (row - emptySpaceCount) * cols + col);
                    const targetPos = this.getScreenPosByIndex((row - emptySpaceCount) * cols + col)
                    this.gridNodes[(row - emptySpaceCount) * cols + col] = tile;
                    this.gridNodes[index] = null;
                    //console.error("目标行为：" + (row - emptySpaceCount) + "目标列未：" + col);
                    tile.inIt((row - emptySpaceCount) * cols + col, (row - emptySpaceCount), col, tile.gridType, this);
                    tile.dropToNewRow(targetPos);
                }


                ////如果是未被消除的tile 下落到下方的有效position
                //if (tile && !tile.isRemoved) {
                //    console.log("要下落的：" + tile.index +"在第"+tile.row+"行 "+"第"+tile.col+"列");
                //    const targetRow = this.findValidTilePosition(col, row, tile);
                //    if (targetRow >= 0 && targetRow < rows && !this.gridNodes[index + (targetRow - row) * cols].isRemoved) {
                //        console.error("需要下落");
                //        // 进行下落
                //        //tile.dropToNewRow(this.gridNodes[targetRow * this.levelConfig.Column + col].node.position);;
                //    } else {
                //        // 无下落位置，应该是下落到表格底部
                //        //tile.dropToNewRow(this.gridNodes[col].node.position);
                //    }
                //    count++;
                //}
            }
        }
        //console.log("要下落的总数为：" + count);


        tween(this)
            .delay(waitTime * cols + 1)
            .call(() => {
                const matchGrids = this.checkForConnectGrids();
                if (matchGrids.length>0)
                    this.playAnimationsByType(matchGrids); // 你单独提取了播放动画部分
            })
            .start();

        //const matchGrids = this.checkForConnectGrids();
        //if (matchGrids.length>0)
        //    this.playAnimationsByType(matchGrids); // 你单独提取了播放动画部分
       
    }

    


    //找到该列未被消除的tile 的下一个可用行
    private findValidTilePosition(col: number, currentRow: number, tile: Tile): number {
        let targetRow = currentRow;
        while (targetRow>=0) {
            const index = targetRow * this.levelConfig.Column + col;
            console.log("当前行：" + currentRow + "计算出index:" + index);
            const tTile = this.gridNodes[index];
            if (tTile && !tTile.isRemoved) {
                console.log("最终的targetRow：" + targetRow);
                return targetRow;
                //找到空位 下落该tile 至targetRow
                //console.error(`当前下标为: ${tile.index} 当前行为${currentRow}  要移动到的行为 ${targetRow}`);
                //this.gridNodes[index] = tTile;
                //this.gridNodes[tile.index] = null;
                //tTile.inIt(index, targetRow, col, tTile.gridType,this);
                //tTile.setRemoved(false);
                //tTile.dropToNewRow(tTile.node.position);
            }
            //else if (tTile && !tTile.isRemoved) {
            //    break;
            //}
            targetRow--;
        }
        console.log("最终的targetRow：" + targetRow);
        return -1;
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

