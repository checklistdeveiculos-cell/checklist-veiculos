const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

let dadosPlacas = {}

const PLACAS_CACHE_KEY = "comtrasil_placas_cache"
const PLACAS_DATA_KEY  = "comtrasil_placas_data"

function salvarCachePlacas(lista) {
  try {
    localStorage.setItem(PLACAS_CACHE_KEY, JSON.stringify(lista))
    localStorage.setItem(PLACAS_DATA_KEY, new Date().toISOString())
  } catch(err) {
    console.warn("Não foi possível salvar cache de placas:", err)
  }
}

function getCachePlacas() {
  try {
    const raw = localStorage.getItem(PLACAS_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function preencherSelectPlacas(lista, selectPlaca) {
  while (selectPlaca.options.length > 1) selectPlaca.remove(1)

  dadosPlacas = {}
  lista.forEach(item => {
    dadosPlacas[item.placa] = { fabricante: item.fabricante, modelo: item.modelo }
    const opt = document.createElement("option")
    opt.value = item.placa
    opt.textContent = item.placa
    selectPlaca.appendChild(opt)
  })

  const optOutro = document.createElement("option")
  optOutro.value = "outro"
  optOutro.textContent = "Outro"
  selectPlaca.appendChild(optOutro)
}

async function carregarPlacas() {
  const loadingDiv = document.getElementById("loadingPlacas")
  const selectPlaca = document.getElementById("placa")

  const cache = getCachePlacas()
  if (cache && cache.length > 0) {
    preencherSelectPlacas(cache, selectPlaca)
    loadingDiv.classList.add("hidden")
    selectPlaca.classList.remove("hidden")

    const dataCache = localStorage.getItem(PLACAS_DATA_KEY)
    if (dataCache) {
      const d = new Date(dataCache)
      const formatado = d.toLocaleDateString("pt-br") + " às " + d.toLocaleTimeString("pt-br", { hour: "2-digit", minute: "2-digit" })
      loadingDiv.textContent = "📋 Lista do cache (" + formatado + ")"
      loadingDiv.classList.remove("hidden")
      loadingDiv.style.fontSize = "0.78rem"
      loadingDiv.style.color = "#5a7080"
      loadingDiv.style.background = "transparent"
      loadingDiv.style.border = "none"
      loadingDiv.style.padding = "2px 0"
    }
  }

  if (navigator.onLine) {
    try {
      const res = await fetch(URL_SCRIPT + "?acao=placas")
      const json = await res.json()

      if (json && json.length > 0) {
        salvarCachePlacas(json)
        preencherSelectPlacas(json, selectPlaca)
        loadingDiv.classList.add("hidden")
        selectPlaca.classList.remove("hidden")
      }

    } catch (err) {
      if (!cache || cache.length === 0) {
        loadingDiv.textContent = "⚠️ Não foi possível carregar as placas. Verifique a conexão."
        loadingDiv.classList.remove("hidden")
      }
    }

  } else if (!cache || cache.length === 0) {
    loadingDiv.textContent = "📵 Sem internet e sem cache salvo. Acesse uma vez com internet para liberar as placas offline."
    loadingDiv.classList.remove("hidden")
  }
}

const OFFLINE_KEY = "checklist_pendentes"

function getPendentes() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]")
  } catch { return [] }
}

function salvarPendente(dados) {
  const lista = getPendentes()
  lista.push({ dados, timestamp: new Date().toISOString() })
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(lista))
}

function removerPendente(index) {
  const lista = getPendentes()
  lista.splice(index, 1)
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(lista))
}

function atualizarBannerPendentes() {
  const lista = getPendentes()
  const banner = document.getElementById("pendingBanner")
  const count = document.getElementById("pendingCount")

  if (lista.length > 0) {
    count.textContent = lista.length
    banner.classList.remove("hidden")
  } else {
    banner.classList.add("hidden")
  }
}

async function enviarPendentes() {
  const lista = getPendentes()
  if (lista.length === 0) return

  let enviados = 0

  for (let i = lista.length - 1; i >= 0; i--) {
    try {
      await Promise.race([
        fetch(URL_SCRIPT, {
          method: "POST",
          body: JSON.stringify(lista[i].dados)
        }),
        new Promise((_, reject) => setTimeout(() => reject("timeout"), 20000))
      ])
      removerPendente(i)
      enviados++
    } catch (err) {
    }
  }

  atualizarBannerPendentes()

  if (enviados > 0) {
    alert(`✅ ${enviados} checklist(s) pendente(s) enviado(s) com sucesso!`)
  }
}

function monitorarConexao() {
  const banner = document.getElementById("offlineBanner")

  function atualizar() {
    if (navigator.onLine) {
      banner.classList.add("hidden")
      enviarPendentes()
    } else {
      banner.classList.remove("hidden")
    }
  }

  window.addEventListener("online", atualizar)
  window.addEventListener("offline", atualizar)
  atualizar()
}

document.addEventListener("DOMContentLoaded", () => {

  monitorarConexao()
  atualizarBannerPendentes()
  carregarPlacas()

  document.getElementById("btnEnviarPendentes").onclick = enviarPendentes

  const form = document.getElementById("checklistForm")
  const loading = document.getElementById("loading")

  // ── Placa ──
  const selectPlaca = document.getElementById("placa")
  const placaOutro = document.getElementById("placaOutro")
  const infoVeiculo = document.getElementById("infoVeiculo")
  const descricaoVeiculoDiv = document.getElementById("descricaoVeiculoDiv")
  const fabricanteInput = document.getElementById("fabricante")
  const modeloInput = document.getElementById("modelo")

  selectPlaca.onchange = () => {
    const val = selectPlaca.value

    if (val === "outro") {
      placaOutro.classList.remove("hidden")
      infoVeiculo.classList.add("hidden")
      descricaoVeiculoDiv.classList.remove("hidden")
      fabricanteInput.value = ""
      modeloInput.value = ""
    } else if (val && dadosPlacas[val]) {
      placaOutro.classList.add("hidden")
      descricaoVeiculoDiv.classList.add("hidden")
      infoVeiculo.classList.remove("hidden")
      fabricanteInput.value = dadosPlacas[val].fabricante
      modeloInput.value = dadosPlacas[val].modelo
    } else {
      placaOutro.classList.add("hidden")
      infoVeiculo.classList.add("hidden")
      descricaoVeiculoDiv.classList.add("hidden")
    }
  }

  const cidade = document.getElementById("cidade")
  const cidadeOutro = document.getElementById("cidadeOutro")
  cidade.onchange = () => {
    cidadeOutro.classList.toggle("hidden", cidade.value !== "outro")
  }

  const iluminacao = document.getElementById("iluminacao")
  const problemaDiv = document.getElementById("problemaLuzDiv")
  const outroProblema = document.getElementById("outroProblema")

  iluminacao.onchange = () => {
    problemaDiv.classList.toggle("hidden", iluminacao.value !== "problema")
  }

  document.querySelectorAll('input[name="luz"]').forEach(cb => {
    cb.addEventListener("change", () => {
      const outroCb = document.querySelector('input[name="luz"][value="outro_luz"]')
      outroProblema.classList.toggle("hidden", !outroCb.checked)
    })
  })

  const avaria = document.getElementById("avaria")
  const campoAvaria = document.getElementById("campoAvaria")
  avaria.onchange = () => {
    campoAvaria.classList.toggle("hidden", avaria.value !== "sim")
  }

  const inputFotos = document.getElementById("foto")
  const preview = document.getElementById("previewFotos")
  const avisoLimite = document.getElementById("fotoLimiteAviso")
  const MAX_FOTOS = 5

  let arquivosSelecionados = []

  inputFotos.addEventListener("change", (e) => {
    for (let file of e.target.files) {

      if (arquivosSelecionados.length >= MAX_FOTOS) {
        avisoLimite.classList.remove("hidden")
        break
      }

      avisoLimite.classList.add("hidden")
      arquivosSelecionados.push(file)

      const reader = new FileReader()
      reader.onload = function (ev) {
        const div = document.createElement("div")
        div.classList.add("preview-item")

        const img = document.createElement("img")
        img.src = ev.target.result

        const btn = document.createElement("button")
        btn.innerHTML = "×"
        btn.classList.add("remover")
        btn.type = "button"

        btn.onclick = () => {
          preview.removeChild(div)
          arquivosSelecionados = arquivosSelecionados.filter(f => f !== file)
          if (arquivosSelecionados.length < MAX_FOTOS) {
            avisoLimite.classList.add("hidden")
          }
        }

        div.appendChild(img)
        div.appendChild(btn)
        preview.appendChild(div)
      }
      reader.readAsDataURL(file)
    }

    if (arquivosSelecionados.length >= MAX_FOTOS) {
      avisoLimite.classList.remove("hidden")
    }

    inputFotos.value = ""
  })

  const canvas = document.getElementById("assinatura")
  const ctx = canvas.getContext("2d")

  canvas.width = canvas.offsetWidth
  canvas.height = 200

  ctx.lineWidth = 2
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  let desenhando = false
  let assinou = false

  function getPos(e) {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    return { x: e.offsetX, y: e.offsetY }
  }

  function start(e) {
    desenhando = true
    assinou = true
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    if (e.cancelable) e.preventDefault()
  }

  function draw(e) {
    if (!desenhando) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    if (e.cancelable) e.preventDefault()
  }

  function end() { desenhando = false }

  canvas.addEventListener("mousedown", start)
  canvas.addEventListener("mousemove", draw)
  canvas.addEventListener("mouseup", end)
  canvas.addEventListener("mouseleave", end)
  canvas.addEventListener("touchstart", start, { passive: false })
  canvas.addEventListener("touchmove", draw, { passive: false })
  canvas.addEventListener("touchend", end)

  document.getElementById("limpar").onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    assinou = false
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!assinou) {
      alert("Por favor, assine antes de enviar.")
      return
    }

    loading.classList.remove("hidden")

    try {
      const fotos = await Promise.all(
        arquivosSelecionados.map(file => reduzirImagem(file))
      )

      const placaVal = selectPlaca.value
      const placaFinal = placaVal === "outro" ? placaOutro.value : placaVal
      const cidadeFinal = cidade.value === "outro" ? cidadeOutro.value : cidade.value

      const luzesSelecionadas = Array.from(document.querySelectorAll('input[name="luz"]:checked'))
        .map(cb => cb.value === "outro_luz" ? outroProblema.value : cb.value)
        .filter(Boolean)

      const dados = {
        motorista: document.getElementById("motorista").value,
        placa: placaFinal,
        fabricante: fabricanteInput.value,
        modelo: modeloInput.value,
        descricaoVeiculo: document.getElementById("descricaoVeiculo").value,
        km: document.getElementById("km").value,
        cidade: cidadeFinal,
        combustivel: document.getElementById("combustivel").value,
        pneus: document.getElementById("pneus").value,
        limpeza: document.getElementById("limpeza").value,
        iluminacao: iluminacao.value,
        problemaLuz: luzesSelecionadas.join(", "),
        avaria: avaria.value,
        descricaoAvaria: document.getElementById("descricaoAvaria").value,
        observacoes: document.getElementById("observacoes").value,
        assinatura: canvas.toDataURL(),
        fotos: fotos
      }

      if (!navigator.onLine) {
        salvarPendente(dados)
        atualizarBannerPendentes()
        loading.classList.add("hidden")
        alert("📵 Sem internet. Checklist salvo e será enviado automaticamente quando a conexão voltar.")
        resetarFormulario(form, ctx, preview)
        arquivosSelecionados = []
        assinou = false
        return
      }

      await Promise.race([
        fetch(URL_SCRIPT, {
          method: "POST",
          body: JSON.stringify(dados)
        }),
        new Promise((_, reject) => setTimeout(() => reject("timeout"), 20000))
      ])

      loading.classList.add("hidden")
      alert("✅ Checklist enviado com sucesso!")
      resetarFormulario(form, ctx, preview)
      arquivosSelecionados = []
      assinou = false

    } catch (err) {
      loading.classList.add("hidden")
      alert("❌ Erro ao enviar. Tente novamente.")
    }
  })

})

function resetarFormulario(form, ctx, preview) {
  form.reset()
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  preview.innerHTML = ""
  document.getElementById("infoVeiculo").classList.add("hidden")
  document.getElementById("placaOutro").classList.add("hidden")
  document.getElementById("descricaoVeiculoDiv").classList.add("hidden")
  document.getElementById("cidadeOutro").classList.add("hidden")
  document.getElementById("problemaLuzDiv").classList.add("hidden")
  document.getElementById("outroProblema").classList.add("hidden")
  document.getElementById("campoAvaria").classList.add("hidden")
  document.getElementById("fotoLimiteAviso").classList.add("hidden")
}

function reduzirImagem(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const img = new Image()
      img.src = e.target.result
      img.onload = function () {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const maxWidth = 300
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.3))
      }
    }
    reader.readAsDataURL(file)
  })
}
