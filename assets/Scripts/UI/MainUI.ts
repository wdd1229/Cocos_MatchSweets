import { _decorator, Button, Component } from 'cc';
import GameManager from '../GameManager';
const { ccclass, property } = _decorator;
@ccclass('MainUI')
export class MainUI extends Component {

    private startBtn: Button = null;

    onLoad() {
        this.startBtn = this.node.getChildByName("startBtn").getComponent(Button);
    } 

    start() {
        this.startBtn.node.on(Button.EventType.CLICK,this.startGame,this)
    }

    startGame(button: Button) {
        console.log("click startGameBtn ...");
        GameManager.Instance.OpenUI("GameUI");
    }

    update(deltaTime: number) {
        
    }
}


