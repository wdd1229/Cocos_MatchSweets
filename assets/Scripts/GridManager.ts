import { _decorator, Component,Animation, Node,find, tween, UITransform, Vec2, Vec3, easing } from 'cc';
import { JsonManager, LevelConfig } from './JsonManager';
import GameManager from './GameManager';
import { Tile } from './Tile';
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
    onLoad() {
        this.canvas = find("Canvas");
        /*        this.origin = find("Canvas/GridRoot").position;*/
        this.gridContent = find("Canvas/GameUI/gridContent");
        this.gridRoot = this.gridContent.getChildByName("gridRoot");
    }
    start() {
        const tt = this.canvas.getComponent(UITransform).contentSize;
        //this.width = tt.x / (this.cellSize+this.space);
        //this.height = tt.y / (this.cellSize + this.space);

    }

    inIt() {
        this.levelConfig = GameManager.Instance.getCurLevelConfig();
        console.error("this.levelConfig.Column:" + this.levelConfig.Column);
        console.error("this.levelConfig.Row:" + this.levelConfig.Row);

        this.width = this.levelConfig.Column * this.cellSize + (this.levelConfig.Column - 1) * this.space;
        this.height = this.levelConfig.Row * this.cellSize + (this.levelConfig.Row - 1) * this.space;
        console.error("网格宽度"+this.width);
        console.error("网格高度" + this.height);

        this.gridContent.getComponent(UITransform).setContentSize(this.width, this.height);
        this.gridRoot.getComponent(UITransform).setContentSize(this.width, this.height);

        this.gridContent.position = new Vec3(0 - this.width / 2, this.gridContent.position.y,0);

        //const canvasSize = this.canvas.getComponent(UITransform).contentSize;
        //const xPos = (canvasSize.width - this.width) / 2;
        //const yPos = (canvasSize.height - this.height)-this.space;

        //this.gridRoot.setPosition(new Vec3(xPos, yPos));


        ////设置偏移点为左下角（0,0）
        //const gridTrans = this.gridRoot.getComponent(UITransform)
        //gridTrans.setAnchorPoint(0, 0);
        //gridTrans.setContentSize(0, 0);

        //this.gridRoot.setPosition(0, 0);

        this.totalTiles = this.levelConfig.Row * this.levelConfig.Column;
    }

    update(deltaTime: number) {
        
    }
    private totalTiles: number;
    private currentTileIndex: number = 0;
    private gridNodes: Node[] = [];
    spawnGridsWithDelay() {
        this.createTileAtTopTest()
            .then(() => {
                // 等待动画完成后再生成下一个格子（用于下落完再生成下一个）
                if (this.currentTileIndex < this.totalTiles) {
                    this.currentTileIndex++;
                    this.spawnGridsWithDelay();
                }
            });
    }

    async createTileAtTopTest() {
        const gridType = this.getRandomGridType(false);
        //console.error("当前随机gridType:" + gridType);
        const node = GameManager.Instance.getGridPrefab(gridType);
        const tile = node.getComponent(Tile);
        
        const gridTrans = node.getComponent(UITransform)
        //gridTrans.setAnchorPoint(0, 0);
        gridTrans.setContentSize(this.cellSize, this.cellSize);

        const pos = this.getScreenPosByIndex(this.currentTileIndex)
        
        const canvasSize = this.canvas.getComponent(UITransform).contentSize;
        //node.position = new Vec3(pos.x, canvasSize.y - 300, 0);
        node.position = pos;

        await this.animateToTargetPosition(node, pos);
    }


    async animateToTargetPosition(node: Node, targetPos): Promise<void> {
        return new Promise<void>(resolve => {
            // 下落动画
            tween(node)
                .by(0.5, { position: targetPos })
                .call(() => {
                    const curAnim = node.getComponent(Animation);
                        curAnim.play("1");
                    resolve();
                })
                .start();
        });
    }


    private ttt: Node;
    //async animateToTargetPosition(target: Vec3, node: Node) Promise<void> {
    //    return new Promise<void>((resolve) => {
    //        tween(node)
    //            .by(0.5, { position: easing.circInOut })
    //            .call(() => {
    //                resolve();
    //            })
    //            .start();
    //    })
    //}

    //CreatGridTest() {
        
    //}

    ///创建格子
    public async CreatGrid() {
        this.spawnGridsWithDelay();
        this.width = this.levelConfig.Column * this.cellSize + (this.levelConfig.Column - 1) * this.space;
        this.height = this.levelConfig.Row * this.cellSize + (this.levelConfig.Row - 1) * this.space;

        const canvasSize = this.canvas.getComponent(UITransform).contentSize;

        const xPos = (canvasSize.width - this.width) / 2
        const curY = this.gridRoot.position.y;
        return;

        //console.log("this.levelConfig.Column:" + this.levelConfig.Column);
        //console.log("this.levelConfig.Row:" + this.levelConfig.Row);
        //const x = Math.floor(Math.random() * this.levelConfig.Column);
        //const y = Math.floor(Math.random() * this.levelConfig.Row);

        //for (var i = 0; i < this.levelConfig.Column+1; i++) {
        //    for (var j = 0; j < this.levelConfig.Row; j++) {
        //        let key = j + i * this.levelConfig.Column;
        //        if (x == i && y == j) {
        //            this.createGridAtTop(i, j, this.levelConfig.Column, true);
        //        } else {
        //            this.createGridAtTop(i, j,this.levelConfig.Column);
        //        }
        //    }
        //}
        //this.StartCheck();
        //this.width = this.levelConfig.Column * this.cellSize + (this.levelConfig.Column - 1) * this.space;
        //this.height = this.levelConfig.Row * this.cellSize + (this.levelConfig.Row - 1) * this.space;

        //const canvasSize = this.canvas.getComponent(UITransform).contentSize;

        //const xPos = (canvasSize.width - this.width) / 2
        //const curY = this.gridRoot.position.y;
    }


    //getRandomGridType(isSpecial: boolean): GridType {

    //    if (isSpecial) {
    //        return 15 as GridType;
    //    } else {
    //        return Math.floor(Math.random() * 15) as GridType;
    //    }

    //    //if (isSpecial) {
    //    //    return GridType.SpecialCollection; // 使用枚举的字符串值
    //    //} else {
    //    //    const randomIndex = Math.floor(Math.random() * Object.keys(GridType).length);
    //    //    return GridType[Object.keys(GridType)[randomIndex]] as GridType;
    //    //}
    //}

    //private playGridAnimation(node: Node, targetY): Promise<void> {
    //    return new Promise(resolve => {
    //        //const targetY = node.position.y - 500; // 回到对应目标位置
    //        const targetPosition =new Vec3(node.position.x, targetY);
    //        // 下落动画
    //        tween(node)
    //            .by(0.5, { position: targetPosition })
    //            .call(() => {
    //                const curAnim = node.getComponent(Animation);
    //                    curAnim.play("1");
    //                resolve();
    //            })
    //            .start();
    //    });
    //}

    createGridAtTop(x:number,y:number,fallDistance:number,isSpecial?:boolean):Node {
        const gridType = this.getRandomGridType(isSpecial);
        //console.error("当前随机gridType:" + gridType);
        const grid = GameManager.Instance.getGridPrefab(gridType);
        const tile = grid.getComponent(Tile);
        let key = y + x * this.levelConfig.Column;
        const gridTrans=grid.getComponent(UITransform)
        //gridTrans.setAnchorPoint(0, 0);
        gridTrans.setContentSize(this.cellSize, this.cellSize);

        const pos = this.getScreenPosByIndex(key)
        if (x == this.levelConfig.Column) {
            const canvasSize = this.canvas.getComponent(UITransform).contentSize;
            grid.position = new Vec3(pos.x, canvasSize.y-300,0);
        } else {
            const canvasSize = this.canvas.getComponent(UITransform).contentSize;
            grid.position = new Vec3(pos.x, canvasSize.y - 300, 0);
            //grid.position = pos;
        } 
        //Tile初始化
        tile.inIt(key,gridType,this);
        //下落逻辑

        return grid;
    }

    getScreenPosByIndex(index: any) {
        let pos: any = this.getPosByIndex(index);
        return new Vec3((pos.x + 1 / 2) * this.cellSize+pos.x*this.space, (pos.y + 1 / 2) * this.cellSize+pos.y*this.space, 0);
    }

    getPosByIndex(index: any) {
        return new Vec3(index % this.levelConfig.Column, Math.floor(index / this.levelConfig.Row), 0);
    }


    getRandomGridType(isSpecial: boolean): GridType {

        if (isSpecial) {
            return 15 as GridType;
        } else {
            return Math.floor(Math.random() * 15) as GridType;
        }
        
        //if (isSpecial) {
        //    return GridType.SpecialCollection; // 使用枚举的字符串值
        //} else {
        //    const randomIndex = Math.floor(Math.random() * Object.keys(GridType).length);
        //    return GridType[Object.keys(GridType)[randomIndex]] as GridType;
        //}
    }

    StartCheck() {

    }

    //CalculateGridPos(xIndex:number,yIndex:number):Vec2 {
    //    const startX = (this.width - this.levelConfig.Row) / 2;
    //    if (yIndex == this.levelConfig.Column) {
    //        yIndex = this.height - 3;
    //    }

    //    return this.GridToWorld(new Vec2(xIndex + startX, yIndex));
    //}

    //GridToWorld(gridPos):Vec2 {
    //    return new Vec2(gridPos.x * this.cellSize + this.origin.x + this.cellSize / 2 + gridPos.x * 20,
    //        gridPos.y * this.cellSize + this.origin.y + this.cellSize / 2 + gridPos.y * 20
    //        )
    //}
}

