import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ExplosionEffect')
export class ExplosionEffect extends Component {
    @property
    private startPos: Vec3 = new Vec3(0, 0);
    @property
    initialUpSpeed: number = 500; // 初始速度（垂直）
    @property
    gravity: number = 100;         // 重力值
    @property
    bottomThreshold: number = -200; // 离屏检测 y 坐标
    @property
    fadeDuration: number = 1.0;    // 淡出时间（可选）
    private isExploding: boolean = false;
    private velocity: Vec3 = new Vec3(0, 0,0);

    private elapsed: number;
    onLoad() {
        this.startPos = this.node.position;
    }
    public StartExplosion(direction: Vec3) {
        this.isExploding = true;
        this.velocity = direction.clone().multiplyScalar(this.initialUpSpeed);
        this.elapsed = 0;
    }
    update(dt: number): void {
        if (!this.isExploding) return;
        this.elapsed += dt;
        // 更新运动速度（受重力影响）
        this.velocity.y -= this.gravity * dt;
        // 位移计算
        const moveAmount = this.velocity.clone().multiplyScalar(dt);
        this.node.position = this.startPos.add(moveAmount);
        // 检测是否离屏
        if (this.node.position.y < this.bottomThreshold) {
            this.isExploding = false;
            //this.node.destroy(); // 在动画结束时销毁节点
        }
        // 淡出（可选）
        //if (this.elapsed >= this.fadeDuration && this.node.position.y < this.bottomThreshold) {
        //    const alpha = Math.max(0, 1 - this.elapsed / this.fadeDuration);
        //    this.node.getComponent(cc.Sprite).color = new cc.Color(
        //        this.originalColor.r,
        //        this.originalColor.g,
        //        this.originalColor.b,
        //        alpha
        //    );
        //}
    }

}