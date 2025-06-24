const BLOG_URL = 'https://raw.githubusercontent.com/yj94/Yj_learning/refs/heads/main/README.md';
const contentEl = document.getElementById('blog-content');

function getCurrentWeek() {
  // 获取当前日期与2023.12.25的周数差
  const start = new Date(2023, 11, 25); // 月份从0开始
  const now = new Date();
  const diff = now - start;
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return week;
}

function splitWeeks(md) {
  // 按每行##开头分割为新的一周
  const lines = md.split(/\r?\n/);
  let blocks = [];
  let cur = [];
  for (let line of lines) {
    if (line.trim().startsWith('##')) {
      if (cur.length) blocks.push(cur.join('\n'));
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur.join('\n'));
  // 只保留真正以##开头的块
  return blocks.filter(b => b.trim().startsWith('##'));
}

function highlightCurrentWeek(html, week) {
  // 匹配"第xx周"标题，给当前周加class
  const weekReg = new RegExp(`(<h2[^>]*?>\s*第${week}周[（(][^）)]*[）)]<\/h2>)([\s\S]*?)(?=<h2|$)`, 'gi');
  return html.replace(weekReg, (match, h2, content) => {
    return `<section class="current-week">${h2}${content}</section>`;
  });
}

async function renderBlog() {
  try {
    const res = await fetch(BLOG_URL);
    if (!res.ok) throw new Error('获取内容失败');
    const md = await res.text();
    const week = getCurrentWeek();
    let weekBlocks = splitWeeks(md);
    if (!weekBlocks) {
      contentEl.innerHTML = `<div style='color:orange;font-weight:bold;'>⚠️ 未能分割到任何周，请检查README格式或正则！</div><pre style='color:#aaa;font-size:0.95em;'>分割正则: ^##\\s*第\\d+周[（(][^）)]*[）)]/gm\n示例行: ## 第十六周（2024.4.8-2024.4.14）</pre>` + marked.parse(md);
      return;
    }
    contentEl.innerHTML = `<div style='color:#aaa;font-size:0.95em;'>已至: ${weekBlocks.length-1} 周</div>`;
    weekBlocks = weekBlocks.reverse();
    let html = weekBlocks.map(block => marked.parse(block)).join('');
    html = highlightCurrentWeek(html, week);
    contentEl.innerHTML += html;
    // 滚动到当前周
    const cur = document.querySelector('.current-week');
    if (cur) cur.scrollIntoView({behavior: 'smooth', block: 'center'});
  } catch (e) {
    contentEl.innerHTML = `<p style="color:red;">加载失败: ${e.message}</p>`;
  }
}

renderBlog(); 