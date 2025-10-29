import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, error, Node, RigidBody2D, tween, Vec2, Vec3 } from 'cc';
import { debug } from 'console';
import { TriggerBase } from './TriggerBase';
import { RewardUI } from './UI/RewardUI';
import GameManager from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('BeatTrigger')
export class BeatTrigger extends Component {
    @property
    public speed: number = 300; // 下落速度（px/秒）
    @property
    public dirOdds: number = 0.5; // 随机左右概率
    @property
    public stepDistance: number = 20; // 水平移动的距离（单位：像素）
    private moveType: number = 0; // 0 - 下落，1 - 横向移动
    private isFalling: boolean = true;
    private direction: number = 1; // 初始方向或者在碰到障碍物时设定
    private originalPosition: Vec3 = new Vec3();

    @property({ type: RewardUI, displayName:"RewardUI" })
    public rewardUI: RewardUI = null;


    onLoad() {
        // 赋予初始位置
        this.originalPosition = this.node.position.clone();
        // 设置碰撞器为触发器（如果有的话）
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.sensor = true;
        }

        // 注册碰撞事件
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }
    update(dt: number) {
        if (this.isFalling) {
            if (this.moveType === 0) {
                // 正常下落
                tween(this.node)
                    .by(dt, { y: -this.speed * dt })
                    .start();
            } else if (this.moveType === 1) {
                // 横向移动
                error("横向移动");
                tween(this.node)
                    .by(dt, { x: this.direction * this.stepDistance })
                    .call(() => {
                        //this.moveType = 0; // 移动完成，恢复下落
                    })
                    .start();
            }
        }
    }
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D): void {
        
        // 检查是否碰撞的是障碍物
        const contactNode = otherCollider.node;
        const triggerBase = contactNode.getComponent(TriggerBase);
        if (triggerBase && triggerBase.triggerType === 0) {
            error("碰到障碍物");
            // 碰到障碍物，暂停下落，进行一次横向移动
            //this.isFalling = false;
            this.moveType = 1;
            // 随机方向
            this.direction = Math.random() < this.dirOdds ? 1 : -1;
        }
        // 碰到奖励区域
        else if (triggerBase && triggerBase.triggerType === 1) {
            error("碰到奖励" + triggerBase.rewardID);
            //if (this.rewardUI)
            GameManager.Instance.setRewardID(triggerBase.rewardID);
            // 停止下落并销毁
            this.isFalling = false;
            this.moveType = 0;
            // 可选：播放音效或特效
            // cc.director.getScene().getChildByName("GameLayer").on('touchEnd', () => {
            //     this.node.destroy();
            // });
        }
    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D): void {
        // 检查离开的是障碍物
        const contactNode = otherCollider.node;
        const triggerBase = contactNode.getComponent(TriggerBase);
        if (triggerBase && triggerBase.triggerType === 0) {
            // 恢复下落
            this.isFalling = true;
            this.moveType = 0;
        }
    }
    // 离开地面或掉出屏幕后销毁
    public stopAndDestroy(): void {
        this.isFalling = false;
        this.moveType = 0;
        this.node.setPosition(this.node.getPosition().x, this.node.getPosition().y - 100, 0);
    }
}

