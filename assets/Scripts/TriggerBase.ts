import { _decorator, BoxCollider2D, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TriggerBase')
export class TriggerBase extends Component {
    @property({ type: Number, min: 0, max: 2 })
    public triggerType: number = 0; // 0 = Obstacle, 1 = Reward
    @property({ type: Number, min: 1, max: 5 })
    public rewardID: number = 0; // 0 = Obstacle, 1 = Reward
    onLoad() {
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.sensor = true; // 这是关键！让其作为触发器
        }
    }
}

