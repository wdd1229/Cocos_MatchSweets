import { _decorator, Component,resources,Prefab,Animation, error, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    //cocos�ű��������ڣ�����˵���� ÿ��������ִ��˳��ʹ�����ʽ
    //1.onLoad ���غ������ű���һ��ִ�еĺ�����һ������ ���������¼�
    //2.onDestroy ���ٺ�������������߽ڵ㱻 ����ʱ��ִ�����������һ������ �رռ����¼�
    //2.start ��ʼ�������ű�����ִ�к���
    //3.update
    //4.lateupdate
    // onDisable
    //onEnable

    curState:AnimationClip

    start() {
        console.log("onStart fuc..");

        let gridAnim = this.getComponent(Animation);
        gridAnim.play("3-2");
        //console.log(gridAnim.clips[0].name);

        // resources.load("AnimatorClip/1-1", AnimationClip, (error, clip) => {
        //    //this.getComponent(Animation).clips[0]=clip;
        //    //this.getComponent(Animation).addClip(clip, clip.name);
        //     //this.getComponent(Animation).play();
        //     if (clip) {
        //         console.log("load Success ����" + clip.name);
        //         this.curState = clip;
        //     }
        //});

        //console.log(this.BodyAnim);
        
        //console.log(gridAnim.clips[0].name);
    }

    update(deltaTime: number) {
        
    }
}


