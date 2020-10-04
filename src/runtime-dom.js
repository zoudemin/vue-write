// 运行时的包 里面放着dom 操作的方法

export const nodeOps = {//重写的目的是可以重写此方法 v3支持
  insert(child,parent,anchor){
    if(anchor){
      parent.insertBefore(child,anchor)
    }else{
      parent.appendChild(child);
    }
  },
  remove(child){
    const parent = child.parentNode;
    parent && parent.removeChild(child);
  },
  createElement(tag){
    return document.createElement(tag);
  },
  hostSetElementText(el,text){
    el.textContent = text
  },
  hostPatchProps(el,key,prevProps,nextProps){
    if(/^on[^a-z]/.test(key)){
      const eventName = key.slice(2).toLowerCase();
      //更新事件
      prevProps && el.removeEventListener(eventName,prevProps);
      nextProps && el.addEventListener(eventName,nextProps);
    }else{
      //其他属性
      if(nextProps == null){
        return el.removeAttribute(key);//删除元素上的属性
      }
      if(key == 'style'){
        for(let key in nextProps){
          el.style[key] = nextProps[key];
        }
        for(let key in prevProps){
          if(!nextProps.hasOwnProperty(key)){
            el.style[key] = null;
          }
        }
      }else{//没 考虑其他的kclass等
        el.setAttribute(key, nextProps);//上面的el.removeAttribute(key);//删除元素上的属性  做了删除的处理 清除id  class等
      }
    }
  }
}
//v3方法如下
// createApp().createRenderer({
//   insert(child,parent,anchor){
//     if(anchor){
//       parent.insertBefore(child,anchor)
//     }else{
//       parent.appendChild(child);
//     }
//   },
//   remove(child){
//     const parent = child.parentNode;
//     parent && parent.removeChild(child);
//   },
//   createElement(tag){
//     return document.createElement(tag);
//   },
//   hostSetElementText(el,text){
//     el.textContent = text
//   },
// })