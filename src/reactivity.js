let activeEffect;
export function effect(fn){
  activeEffect = fn;
  fn();
  activeEffect = null;
}

//Reflect.defineProperty();
//Reflect.ownKeys();
//Reflect.setPrototypeOf();
export function reactive(target){
  return new Proxy(target,{
    set(target,key,value,receiver){
      // target[key] =value;//给原来的值做处理
      const res = Reflect.set(target,key,value,receiver);
      //触发依赖
      trigger(target,key);
      // res && activeEffect();
      return res;//proxy需要有返回值
    },
    get(target,key,receiver){//只有在页面取值时才会做依赖收集
      // if(typeof target[key] == 'object')
      // return reactive(target[key])//递归代理
      const res = Reflect.get(target,key,receiver);
      track(target,key);//依赖收集
      return res;
    }
  })
}
const targetMap = new WeakMap();
function track(target,key){//target key 可能依赖多个effect
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target,(depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if(!deps){
    depsMap.set(key,(deps = new Set()));
  }
  if(activeEffect && !deps.has(activeEffect)){// set中有get set has
    deps.add(activeEffect);
  }
  console.log(targetMap)
}
function trigger(target,key){
  const depsMap = targetMap.get(target);
  if(!depsMap) return ;
  const effects = depsMap.get(key);
  effects&&effects.forEach(effect => {
    effect();
  });
}
// 依赖收集 要确定的是 某个属性变了 要更新， 而不是整个对象 一个属性要收集对应的effect