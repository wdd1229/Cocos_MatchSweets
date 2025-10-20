import { _decorator, Component, Node, ProgressBar, Label, labelAssembler,  } from 'cc';
import GameManager from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('LoadingUI')
export class LoadingUI extends Component {

    @property
    private progressBar: ProgressBar;

    private curTime: number=0;
    private endTime: number = 2;

    private progressText: Label=null;

    private isFrist: boolean = false;

    onLoad() {
        this.progressBar = this.node.getChildByName("ProgressBar").getComponent(ProgressBar);
        this.progressText = this.node.getChildByName("progressText").getComponent(Label);
    }

    start() {
        this.progressText.string = "20%";
    }

    update(deltaTime: number) {
        if (this.isFrist) return;
        if (this.curTime >=this.endTime) {
            this.progressBar.progress = 1;
            this.isFrist = true;

            this.progressText.string = "100%";
            console.log("loading Success");
            this.LoadScuuces();
        }
        else {
            this.curTime += deltaTime;
            this.progressBar.progress = this.curTime / this.endTime;
            this.progressText.string = `${Math.floor(this.progressBar.progress * 100)}%`;
        }
    }

    LoadScuuces() {
        console.log("加载成功");
        GameManager.Instance.OpenUI("MainUI");
    }
}


