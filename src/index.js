import { nodeOps } from './runtime-dom.js';
import { effect } from './reactivity.js';
export * from './reactivity.js';
import {getSequence} from './test.js';
export function render(vnode, container) {
  //vue2  patch
  patch(container._vnode, vnode, container);
  container._vnode = vnode;
}
function patch(n1, n2, container, anchor) {
  if (n1 == null) {

  } else {

  }
  //如果是组件的话tag可能是一个对象
  if (typeof n2.tag == "string") {
    // 标签
    // mountElement(n2,container);
    processElement(n1, n2, container, anchor);
  } else if (typeof n2.tag == 'object') {
    // 组件渲染
    mountComponent(n2, container);
  }
}
function processElement(n1, n2, container, anchor) {
  if (n1 == null) {//初次渲染
    mountElement(n2, container, anchor);
  } else {
    patchElement(n1, n2, container);
  }
}
function patchElement(n1, n2, container) {
  //看n1 n2 是否一样  不考虑key
  let el = n2.el = n1.el;//这里直接复用
  const oldProps = n1.props;
  const newProps = n2.props;
  patchProps(el, oldProps, newProps);
  //对比children
  patchChildren(n1, n2, el);

}
function patchChildren(n1, n2, container) {
  const c1 = n1.children;
  const c2 = n2.children;
  //可能有多个儿子  另一方没有儿子
  if (typeof c2 == 'string') {
    // if(Array.isArray(c1)){//可省略此判断 可直接用hostSetElementText覆盖更新文本节点

    // }
    if (c1 !== c2) {
      nodeOps.hostSetElementText(container, c2);
    }
  } else {
    //c2是数组
    if (typeof c1 == 'string') {
      nodeOps.hostSetElementText(container, '');
      mountChildren(c2, container);
    } else {
      patchKeyedChildren(c1, c2, container);//不考虑key不存在的情况
    }

  }
}
function patchKeyedChildren(c1, c2, container) {
  let e1 = c1.length - 1;//老的最后一项的索引
  let e2 = c2.length - 1;//新的最后一项的索引
  //内部有优化  头头比较 尾尾比较 头尾 尾头比较
  const keyedToNewIndexMap = new Map();
  //1.根据新节点生成一个key=》 index的映射表
  for (let i = 0; i <= e2; i++) {
    const currentEle = c2[i];//拿到这一项
    keyedToNewIndexMap.set(currentEle.props.key, i);
  }
  const newIndexToOldIndexMap = new Array(e2 + 1);
  for (let i = 0; i <= e2; i++) {
    newIndexToOldIndexMap[i] = -1;
  }
  //2.去老的里面找  看看有没有对应的  如果有一样的就复用
  for (let i = 0; i <= e1; i++) {
    const oldVnode = c1[i];
    //元素位置可能在新的虚拟DOM里变换结果可能是无序数组  那么就只需要保持顺序一致的最长DOM结构  剩下的插入就可以  如果翻转那么这个方法没用
    let newIndex = keyedToNewIndexMap.get(oldVnode.props.key);
    if (newIndex == undefined) {//说明老的有新的没有
      nodeOps.remove(oldVnode.el);
    } else {
      //复用 并且比对属性
      newIndexToOldIndexMap[newIndex] = i + 100;//只要不是0  是个递增值就没问题
      patch(oldVnode, c2[newIndex], container);//递归比较儿子和标签属性
    }
  }
  let sequence = getSequence(newIndexToOldIndexMap);//注意这里是返回最长子序列对应的值的下标集合
  // console.log(getSequence([2, 5, 9, 6, 4, 7, 2, 7, 2])) [0, 1, 3, 5]
  let j = sequence.length - 1;//最长序列的最后一项的索引
  //以上方法仅是比对和删除无用节点 没移动
  //从后往前插入
  for (let i = e2; i >= 0; i--) {//必须从后往前插入不然数据结构会混乱  未处理数据的下标会变化
    let currentEle = c2[i];
    const anchor = i + 1 <= e2 ? c2[i + 1].el : null;
    //如果新的比老的多
    if (newIndexToOldIndexMap[i] === -1) {
      //这是一个新节点需要插入
      patch(null, currentEle, container, anchor);
    } else {
      if (i == sequence[j]) {
        j--;
      } else {
        //移动
        //获取不需要移动的最长个数
        nodeOps.insert(currentEle.el, container, anchor);//此处覆盖插入  浏览器特性  同一个元素插入多次会覆盖  自动删除旧元素
      }
    }
  }
  //3.新的比老的多  添加  老的比新的多就删除
  //4.两个人key一样  比较属性， 移动
}
// function getSequence(arr) {
//   const p = arr.slice()
//   const result = [0]
//   let i, j, u, v, c
//   const len = arr.length;
//   for (i = 0; i < len; i++) {
//     const arrI = arr[i];
//     if (arrI != 0) {
//       j = result[result.length - 1]
//       if (arr[j] < arrI) {
//         p[i] = j
//         result.push(i)
//         continue
//       }
//       u = 0
//       v = result.length - 1
//       while (u < v) {
//         c = ((u + v) / 2) | 0
//         if (arr[result[c]] < arrI) {
//           u = c + 1
//         } else {
//           v = c
//         }
//       }
//       if (arrI < arr[result[u]]) {
//         if (u > 0) {
//           p[i] = result[u - 1]
//         }
//         result[u] = i
//       }
//     }
//   }
//   u = result.length
//   v = result[u - 1]
//   while (u-- > 0) {
//     result[u] = v
//     v = p[v]
//   }
//   return result
// }
function patchProps(el, oldProps, newProps) {
  if (oldProps != newProps) {
    //比较属性
    //1.将新的属性 全部设置 以新的为准
    for (let key in newProps) {
      const p = oldProps[key];
      const n = newProps[key];
      if (n !== p) {
        nodeOps.hostPatchProps(el, key, p, n);
      }
    }
    //2.老的里面有的 新的没有 需要删掉
    for (const key in oldProps) {
      if (newProps && !newProps.hasOwnProperty(key)) {
        //删除老的里面多余的属性
        nodeOps.hostPatchProps(el, key, oldProps[key], null);
      }
    }
  }
}
function mountComponent(vnode, container) {
  //根据组件创建一个实例
  const instance = {
    vnode,
    render: null,//setup的返回值
    subTree: null,//组件返回的结果
  }
  const Component = vnode.tag;
  instance.render = Component.setup(vnode.props, instance);

  //每个组件都有一个effect 用于局部重新渲染   计算属性也是一个effect
  effect(() => {
    //如果返回值是对象的话  template-》render
    //这里可以做vue2的兼容处理  拿到vue2的optionsapi 和setup的返回值做合并
    instance.subTree = instance.render && instance.render();
    patch(null, instance.subTree, container);
  })
}
function mountElement(vnode, container, anchor) {
  const { tag, children, props } = vnode;
  let el = (vnode.el = nodeOps.createElement(tag));

  if (props) {
    for (let key in props) {
      nodeOps.hostPatchProps(el, key, {}, props[key]);
    }
  }
  if (Array.isArray(children)) {
    mountChildren(children, el);
  } else {
    nodeOps.hostSetElementText(el, children);
  }
  nodeOps.insert(el, container, anchor);
}

function mountChildren(children, container) {
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    patch(null, child, container);
  }
}