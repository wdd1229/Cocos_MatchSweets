import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Singleton')
export class Singleton extends Component {
    // 单例引用
    protected static _instance: Singleton;
    // 获取单例对象的静态方法
    public static get Instance(): Singleton {
        if (!Singleton._instance) {
            console.error("SingletonBase 尚未初始化");
            return null;
        }
        return Singleton._instance;
    }
    protected constructor() {
        super();
    }
    onLoad(): void {
        if (!Singleton._instance) {
            console.log("单例初始化***************");
            Singleton._instance = this;
        } else {
            console.warn("SingletonBase 已经初始化，不能重复挂载");
        }
    }
}


