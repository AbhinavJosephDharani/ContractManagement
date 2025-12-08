async function fetchJson(path){
  try{const r=await fetch(path);if(!r.ok)throw new Error(await r.text());return await r.json()}catch(e){return {__error:String(e)}}
}

async function refresh(){
  const healthEl = document.getElementById('health')
  const statusEl = document.getElementById('status')
  const requestsEl = document.getElementById('requests')

  statusEl.textContent = 'Checking backend...'
  healthEl.textContent = '-'
  requestsEl.textContent = 'Loading...'

  const base = location.origin.replace(/\/$/, '')
  const h = await fetchJson(base + '/api/health')
  if (h && h.__error){
    statusEl.textContent = 'Disconnected — ' + h.__error
    healthEl.textContent = h.__error
    requestsEl.textContent = 'Unable to load requests — backend unreachable.'
    return
  }

  statusEl.textContent = (h.status === 'ok') ? 'Connected (storage: ' + (h.storage? 'ok':'no') + ')' : 'Disconnected'
  healthEl.textContent = JSON.stringify(h, null, 2)

  const items = await fetchJson(base + '/api/requests')
  if (items && items.__error){
    requestsEl.textContent = 'Failed to load: ' + items.__error
    return
  }

  requestsEl.innerHTML = ''
  const list = Array.isArray(items) ? items.slice(0,20) : []
  if(list.length===0){ requestsEl.textContent = 'No requests found.'; return }
  for(const it of list){
    const d = document.createElement('div')
    d.className = 'item'
    const name = (it.firstName||'') + ' ' + (it.lastName||'')
    const created = it.createdAt ? new Date(it.createdAt).toLocaleString() : ''
    d.innerHTML = `<strong>${escapeHtml(name)}</strong> — ${escapeHtml(it.cleaningType||'')} — ${escapeHtml(String(it.rooms||''))} rooms<br><small style="color:#666">${escapeHtml(created)}</small><pre style="margin-top:8px">${escapeHtml(JSON.stringify(it, null, 2))}</pre>`
    requestsEl.appendChild(d)
  }
}

function escapeHtml(s){return String(s).replace(/[&<>\"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

document.getElementById('check').addEventListener('click', refresh)
window.addEventListener('load', refresh)
