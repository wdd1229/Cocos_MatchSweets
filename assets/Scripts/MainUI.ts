import { _decorator, Button, Component } from 'cc';
import GameManager from './GameManager';
import { JsonManager } from './JsonManager';
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

        const score = JsonManager.Instance.GetScore(0, 5);

        console.log(`测试单例读取数据：score:${score}`)


    }

    update(deltaTime: number) {
        
    }
}


