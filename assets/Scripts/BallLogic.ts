import { _decorator, Component, Node, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BallLogic')
export class BallLogic extends Component {

    private rb: RigidBody2D = null;
    start() {
        this.rb = this.node.getComponent(RigidBody2D);
        //this.rb.velocity = new Vector2(0, -fallSpeed); // 初始向下落
        //this.rb.
    }

    update(deltaTime: number) {
        
    }
}

