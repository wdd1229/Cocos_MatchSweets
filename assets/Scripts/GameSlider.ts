import { _decorator, Component, EventKeyboard, Node, ProgressBar, Slider, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSlider')
export class GameSlider extends Component {
    @property({type:Slider,displayName:"Slider组件"})
    private slider: Slider = null;
    @property({ type: ProgressBar, displayName: "ProgressBar组件" })
    private progressBar: ProgressBar = null;

    onLoad() {
        this.slider.node.on(`slide`, this.setProgressBar, this);
    }
    setProgressBar(slider: Slider) {
        this.progressBar.getComponent(ProgressBar).progress = slider.progress + 0.03;
    }
}



