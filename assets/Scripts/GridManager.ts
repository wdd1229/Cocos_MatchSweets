import { _decorator, Component,Animation, Node,find, tween, UITransform, Vec3, log } from 'cc';
import { JsonManager, LevelConfig } from './JsonManager';
import GameManager from './GameManager';
import { Tile } from './Tile';
import { GridType } from './GridType';
import { ScoreItem } from './ScoreItem';
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
    public curIsExploadState: boolean = false;
    public isGameOver: boolean = false;
    public startGame() {
        this.curIsExploadState = false;
        if (this.isGameOver) {
            return;
        }
        this.spawnGridsAsync().then(() => {
            const matchGrids = this.checkForConnectGrids();
            if (matchGrids.length > 0)
                this.waitAndProcess(matchGrids);
            else {
                this.curIsExploadState = true;
                if (GameManager.Instance.getAiState()) {
                    //爆炸后重新生成
                    this.InitExplode();
                }
            }
        });
    }

    async clearAllGrid() {
        for (var i = 0; i < this.gridNodes.length; i++) {
            if (this.gridNodes[i] != null) {
                this.gridNodes[i].getComponent(Animation).play("effectHideAni");
                //this.gridNodes[tile.index].setRemoved(true);
                this.gridNodes[i] = null;
            }
        }
        // 延迟 1 秒后再执行回调逻辑
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        this.startGame();
    }

    InitExplode() {
        if (this.curIsExploadState == false) {
            console.error("当前curIsExploadState为false 不允许Explode")
            return;
        }
        this.startExplode().then(() => {
            GameManager.Instance.addgameTotalScore();
            this.startGame();
        });
    }
    async startExplode() {
        if (this.isGameOver) {
            log("游戏已结束，不生成格子");
            return;
        }
        for (var i = 0; i < this.gridNodes.length; i++) {
            if (this.gridNodes[i] != null) {
                this.gridNodes[i].initExplode();
                this.gridNodes[i] = null;
            }
        }
        // 延迟 1 秒后再执行回调逻辑
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
    }


    public async spawnGridsAsync() {
        const y = Math.floor(Math.random() * this.levelConfig.Row);
        for (let row = 0; row < this.levelConfig.Row + 1; row++) {
            await this.spawnGridRowAsync(row, y == row);
        }
    }

    private waitAndProcess(matchGrids: Array<Array<Tile>>) {
        if (this.isGameOver) {
            log("游戏已结束，不执行消除逻辑");
            return;
        }
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

    private async spawnGridAtPositionAsync(index: number, row: number, col: number,isSpeacial: boolean): Promise<Node | null> {
        const gridType = this.getRandomGridType(isSpeacial);
        const node = GameManager.Instance.getGridPrefab(gridType);
        if (!node) {
            console.error("无法生成格子，GridPrefab 未加载!");
            return null;
        }
        //node.name = "New"+index.toString();
        node.getComponent(UITransform).setContentSize(this.cellSize, this.cellSize);

        const targetPos = this.getScreenPosByIndex(index);
        node.position = new Vec3(targetPos.x, this.lastRowHeight, 0);
        const tile = node.getComponent(Tile);
        if (tile) {
            tile.inIt(index, row, col, gridType, this);
            this.gridNodes[index] = tile;
            // 可选：设置为特殊格子
            //if (row === this.levelConfig.Row) {
            //    tile.gridType = GridType.SpecialCollection;
            //}
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
            return Math.floor(Math.random() * 5)+1;
        }
    }
    private visited: boolean[] = [];
    checkForConnectGrids() {
        let groups: Array<Array<Tile>> = [];
        this.curSpecialGrid = null;
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
                    if (count > 0 && regions[0].gridType == GridType.SpecialCollection) {
                        groups.push(regions);
                        console.error("*******************");
                        console.error("添加特殊收集器");
                        console.error("*******************");
                    } else if (count >= 3 && regions[0].gridType != GridType.SpecialCollection && this.isLinear(regions)) {
                        //if (count >= 3 && this.isLinear(regions)) {
                            groups.push(regions);
                            console.error("*******************");
                            for (let k = 0; k < regions.length; k++) {
                                const tile: Tile = regions[k];
                                console.error(tile.name);

                                //tile.getComponent(Animation).play("effectHideAni");
                            }
                            console.error("*******************");
                        //}
                    }
                    
                }
            }
        }
        //if (this.curSpecialGrid!=null)
        //    groups.push(new Array<Tile>(this.curSpecialGrid));
        // 2. 按 GridType.SpecialCollection 排序在最前
        groups = groups.sort((a, b) => {
            const typeA = a[0].gridType;
            const typeB = b[0].gridType;
            return typeA === GridType.SpecialCollection ? -1 : 1;
        });
        return groups;
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
        if (matchGrids.length === 0) {
            return;
        }
        // 无需全局变量，按类型分组播放动画
        for (let i = 0; i < matchGrids.length; i++) {
            const tileArray: Tile[] = matchGrids[i];
            const type: GridType = tileArray[0].gridType;
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
        if (!tileArray || tileArray.length === 0 ||(GameManager.Instance.getCurGamewallCount() >= GameManager.Instance.getLevelwallCount())) return;
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
       

        if (type != GridType.SpecialCollection) {
            if (GameManager.Instance.getCurGamewallCount() >= GameManager.Instance.getLevelwallCount()) {
                console.error("00000000000000000");
                return;
            }
            const score = GameManager.Instance.getScoreForConnetGridsAndGridType(type, count);
            console.error(`类型为：${type} 的消除格子个数为：${count}，对应分数为：${score}`);
            const scoreItem = GameManager.Instance.getScoreItemPrefab();
            const sprite = GameManager.Instance.getSpriteForGridType(type);
            if (scoreItem && scoreItem.getComponent(ScoreItem)) {
                scoreItem.getComponent(ScoreItem).Init(type, sprite, count, score);
            }
            GameManager.Instance.addcurIndexScore(score);
        } else {
            GameManager.Instance.setCurGamewallCount();
            if (GameManager.Instance.getCurGamewallCount() >= GameManager.Instance.getLevelwallCount()) {
                GameManager.Instance.addgameTotalScore();
                GameManager.Instance.setGameoverState(true);
                GameManager.Instance.GameUI.initlevelTips();

                //过关了
                return;
            }
        }
        
        if (islast && GameManager.Instance.getCurGamewallCount() < GameManager.Instance.getLevelwallCount()) {
            console.log("消除结束即将开始 下落----");
            tween(this).delay(1).call(() => {
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
    public async dropAndFill(/*matchGrids: Array<Array<Tile>>*/) {
        if (this.isGameOver) {
            log("游戏已结束，不执行下落逻辑");
            return;
        }
        this.dropTiles().then(() => {
            const matchGrids = this.checkForConnectGrids();
            console.log("计算出的要消除的数量组为：" + matchGrids.length);
            if (matchGrids.length > 0) {
                this.playAnimationsByType(matchGrids); // 你单独提取了播放动画部分
            } else {
                this.curIsExploadState = true;
                //爆炸重新生成逻辑
                if (GameManager.Instance.getAiState()) {
                    //爆炸后重新生成
                    this.InitExplode();
                }
            }
        });
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
   async dropTiles() {
        console.error("开始检测下落逻辑*********");
        let count = 0;
        const cols = this.levelConfig.Column;
        const rows = this.levelConfig.Row;
       let emptySpaceCount = 0;

       let curTiles

        let waitTime = 0;
        for (let col = 0; col < cols; col++) {
            emptySpaceCount = 0;
            //从顶部向下找可用的未被消除的tile
            for (let row = 0; row < rows+1; row++) {
                const index = row * cols + col;
                const tile = this.gridNodes[index];
                if (tile == null) {
                    emptySpaceCount++;
                } else if (emptySpaceCount > 0) {

                    //console.error("空格数量" + emptySpaceCount + "当前index:" + index + "要移动到" + (row - emptySpaceCount) * cols + col);
                    const targetPos = this.getScreenPosByIndex((row - emptySpaceCount) * cols + col)
                    this.gridNodes[(row - emptySpaceCount) * cols + col] = tile;
                    this.gridNodes[index] = null;
                    //console.error("当前name"+tile.name+"得出的index：" + ((row - emptySpaceCount) * cols + col)+" 目标行为：" + (row - emptySpaceCount) + "目标列未：" + col);
                    tile.inIt((row - emptySpaceCount) * cols + col, (row - emptySpaceCount), col, tile.gridType, this);
                    tile.dropToNewRow(targetPos);
                }
            }
            //await new Promise<void>(resolve => setTimeout(resolve, 500));
            //console.error("空格数量为：" + emptySpaceCount);
            for (var k = emptySpaceCount-1; k >= 0; k--) {
                const index = (rows - k) * cols + col;
                await this.createTileAtTop(index, rows - k, col);
                await new Promise<void>(resolve => setTimeout(resolve, this.fallDuration * 200));
            }
            //console.error(`第` + col + "列有空格：" + emptySpaceCount);
       }
       // 延迟 1 秒后再执行回调逻辑
       await new Promise<void>(resolve => setTimeout(resolve, 1000));


    }
    //spaceRow空行数       3
    async createTileAtTop(index: number, row: number, col: number): Promise<void> {
        const gridType = this.getRandomGridType(false);
        const node = GameManager.Instance.getGridPrefab(gridType);
        if (!node) {
            console.error("无法生成格子，GridPrefab 未加载!");
            return null;
        }
        node.name = index.toString();
        node.getComponent(UITransform).setContentSize(this.cellSize, this.cellSize);
        //console.error("新创建的格子index：" + index + "  行： " + row + " 列 ：" + col+"  name:"+node.name);
        const targetPos = this.getScreenPosByIndex(index);
        node.position = new Vec3(targetPos.x, this.lastRowHeight, 0);
        const tile = node.getComponent(Tile);
        //console.error("新格子的动画类型为：" + gridType.toString());
        tile.getComponent(Animation).play(gridType.toString());
        if (tile) {
            tile.inIt(index, row, col, gridType, this);
            this.gridNodes[index] = tile;
            // 可选：设置为特殊格子
        }
        //console.log(`生成格子 ${index} 在第 ${row} 行 ${col} 列`);
        //return node;

        await tile.dropToNewRow(targetPos);
        new Promise<void>(resolve => setTimeout(resolve, this.fallDuration * 2000));
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

