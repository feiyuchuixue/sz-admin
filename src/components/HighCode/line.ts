import './code.scss';

const vCode = {
  mounted(el: any) {
    buildLineNumber(el);
  },
  updated(el: any) {
    buildLineNumber(el);
  }
};

const buildLineNumber = (el: any) => {
  //获取代码片段
  const code = el.querySelector('code.hljs');
  const pre = el.querySelector('pre');
  const html = code?.innerHTML;
  const size = html.split('\n').length;
  const codeNumber = el.querySelector('.hljs-code-number');
  if (codeNumber) {
    el.removeChild(codeNumber);
  }
  //插入行数
  const ul = document.createElement('ul');
  for (let i = 1; i <= size; i++) {
    const li = document.createElement('li');
    li.innerText = i + '';
    ul.appendChild(li);
  }

  ul.classList.add('hljs-code-number');

  // 确保 pre 是 el 的子元素后再进行插入
  if (pre && pre.parentNode === el) {
    el.insertBefore(ul, pre);
  }
};

export default vCode;
