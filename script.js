const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"


const dadosPlacas = {
  "CUI9G05": { fabricante: "Fiat",          modelo: "Strada" },
  "FCK9I84": { fabricante: "Chevrolet",     modelo: "Onix" },
  "FZB4I64": { fabricante: "Fiat",          modelo: "Strada" },
  "GED3859":  { fabricante: "Chevrolet",    modelo: "Montana LS" },
  "OKN4886":  { fabricante: "Volkswagen",   modelo: "Saveiro" },
  "PGY2J57":  { fabricante: "Chevrolet",    modelo: "Montana LS" },
  "PJK4140":  { fabricante: "Chevrolet",    modelo: "Montana LS" },
  "PKU1762":  { fabricante: "Chevrolet",    modelo: "Montana LS" },
  "PLJ0106":  { fabricante: "Honda",        modelo: "CG Start" },
  "QNP2895":  { fabricante: "Chevrolet",    modelo: "Montana LS" },
  "RDC7J81":  { fabricante: "Iveco",        modelo: "Daily 55" },
  "RDR7H80":  { fabricante: "Chevrolet",    modelo: "Onix" },
  "RPI1F38":  { fabricante: "Mercedes-Benz",modelo: "Sprinter" },
  "RPN9E03":  { fabricante: "Volkswagen",   modelo: "Express DRF 4x2" },
  "RPP2E64":  { fabricante: "Chevrolet",    modelo: "Onix Sedan" },
  "RPP6E14":  { fabricante: "Chevrolet",    modelo: "Onix Hatch" },
  "SJX0D93":  { fabricante: "Fiat",         modelo: "Strada Freedom DC 1.3 Flex" },
  "SJX0G54":  { fabricante: "Fiat",         modelo: "Strada Endurance CP 1.3 Flex" },
  "TGW9I45":  { fabricante: "Fiat",         modelo: "Strada EndurancE Cs 1.3 Flex" }
}


let ultimosDados = null


const OFFLINE_KEY = "checklist_pendentes"

function getPendentes() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]") }
  catch { return [] }
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
  const count  = document.getElementById("pendingCount")
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
        fetch(URL_SCRIPT, { method: "POST", body: JSON.stringify(lista[i].dados) }),
        new Promise((_, reject) => setTimeout(() => reject("timeout"), 20000))
      ])
      removerPendente(i)
      enviados++
    } catch (err) {}
  }
  atualizarBannerPendentes()
  if (enviados > 0) alert(` ${enviados} checklist(s) pendente(s) enviado(s) com sucesso!`)
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

  document.getElementById("btnEnviarPendentes").onclick = enviarPendentes
  document.getElementById("btnPDF").onclick = () => gerarPDF(ultimosDados)

  const form    = document.getElementById("checklistForm")
  const loading = document.getElementById("loading")


  const selectPlaca       = document.getElementById("placa")
  const placaOutro        = document.getElementById("placaOutro")
  const infoVeiculo       = document.getElementById("infoVeiculo")
  const descricaoVeiculoDiv = document.getElementById("descricaoVeiculoDiv")
  const fabricanteInput   = document.getElementById("fabricante")
  const modeloInput       = document.getElementById("modelo")

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
      modeloInput.value     = dadosPlacas[val].modelo
    } else {
      placaOutro.classList.add("hidden")
      infoVeiculo.classList.add("hidden")
      descricaoVeiculoDiv.classList.add("hidden")
    }
  }


  const cidade      = document.getElementById("cidade")
  const cidadeOutro = document.getElementById("cidadeOutro")
  cidade.onchange = () => {
    cidadeOutro.classList.toggle("hidden", cidade.value !== "outro")
  }


  const iluminacao   = document.getElementById("iluminacao")
  const problemaDiv  = document.getElementById("problemaLuzDiv")
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

  const avaria      = document.getElementById("avaria")
  const campoAvaria = document.getElementById("campoAvaria")
  avaria.onchange = () => {
    campoAvaria.classList.toggle("hidden", avaria.value !== "sim")
  }

  const inputFotos  = document.getElementById("foto")
  const preview     = document.getElementById("previewFotos")
  const avisoLimite = document.getElementById("fotoLimiteAviso")
  const MAX_FOTOS   = 5
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
          if (arquivosSelecionados.length < MAX_FOTOS) avisoLimite.classList.add("hidden")
        }
        div.appendChild(img)
        div.appendChild(btn)
        preview.appendChild(div)
      }
      reader.readAsDataURL(file)
    }
    if (arquivosSelecionados.length >= MAX_FOTOS) avisoLimite.classList.remove("hidden")
    inputFotos.value = ""
  })

  const canvas = document.getElementById("assinatura")
  const ctx    = canvas.getContext("2d")
  canvas.width  = canvas.offsetWidth
  canvas.height = 200
  ctx.lineWidth = 2
  ctx.lineCap   = "round"
  ctx.lineJoin  = "round"

  let desenhando = false
  let assinou    = false

  function getPos(e) {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    return { x: e.offsetX, y: e.offsetY }
  }
  function start(e) {
    desenhando = true; assinou = true
    const pos = getPos(e)
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
    if (e.cancelable) e.preventDefault()
  }
  function draw(e) {
    if (!desenhando) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y); ctx.stroke()
    if (e.cancelable) e.preventDefault()
  }
  function end() { desenhando = false }

  canvas.addEventListener("mousedown",  start)
  canvas.addEventListener("mousemove",  draw)
  canvas.addEventListener("mouseup",    end)
  canvas.addEventListener("mouseleave", end)
  canvas.addEventListener("touchstart", start, { passive: false })
  canvas.addEventListener("touchmove",  draw,  { passive: false })
  canvas.addEventListener("touchend",   end)

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
      const fotos = await Promise.all(arquivosSelecionados.map(file => reduzirImagem(file)))

      const placaVal    = selectPlaca.value
      const placaFinal  = placaVal === "outro" ? placaOutro.value : placaVal
      const cidadeFinal = cidade.value === "outro" ? cidadeOutro.value : cidade.value

      const luzesSelecionadas = Array.from(document.querySelectorAll('input[name="luz"]:checked'))
        .map(cb => cb.value === "outro_luz" ? outroProblema.value : cb.value)
        .filter(Boolean)

      const dados = {
        tipoChecklist:   document.getElementById("tipoChecklist").value,
        motorista:       document.getElementById("motorista").value,
        placa:           placaFinal,
        fabricante:      fabricanteInput.value,
        modelo:          modeloInput.value,
        descricaoVeiculo: document.getElementById("descricaoVeiculo").value,
        km:              document.getElementById("km").value,
        cidade:          cidadeFinal,
        combustivel:     document.getElementById("combustivel").value,
        pneus:           document.getElementById("pneus").value,
        limpeza:         document.getElementById("limpeza").value,
        iluminacao:      iluminacao.value,
        problemaLuz:     luzesSelecionadas.join(", "),
        avaria:          avaria.value,
        descricaoAvaria: document.getElementById("descricaoAvaria").value,
        observacoes:     document.getElementById("observacoes").value,
        assinatura:      canvas.toDataURL(),
        qtdFotos:        arquivosSelecionados.length,
        fotos:           fotos,
        dataHora:        new Date().toLocaleString("pt-BR")
      }

      if (!navigator.onLine) {
        salvarPendente(dados)
        atualizarBannerPendentes()
        loading.classList.add("hidden")
        alert(" Sem internet. Checklist salvo e será enviado automaticamente quando a conexão voltar.")
        resetarFormulario(form, ctx, preview)
        arquivosSelecionados = []
        assinou = false
        return
      }

      await Promise.race([
        fetch(URL_SCRIPT, { method: "POST", body: JSON.stringify(dados) }),
        new Promise((_, reject) => setTimeout(() => reject("timeout"), 20000))
      ])

      loading.classList.add("hidden")

      ultimosDados = dados
      document.getElementById("secaoPDF").classList.remove("hidden")
      document.getElementById("secaoPDF").scrollIntoView({ behavior: "smooth" })

      resetarFormulario(form, ctx, preview)
      arquivosSelecionados = []
      assinou = false

    } catch (err) {
      loading.classList.add("hidden")
      alert(" Erro ao enviar. Tente novamente.")
    }
  })

})

function resetarFormulario(form, ctx, preview) {
  form.reset()
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  preview.innerHTML = ""
  const ids = ["infoVeiculo","placaOutro","descricaoVeiculoDiv","cidadeOutro",
               "problemaLuzDiv","outroProblema","campoAvaria","fotoLimiteAviso"]
  ids.forEach(id => document.getElementById(id).classList.add("hidden"))
}


function gerarPDF(d) {
  if (!d) return

  const tipo  = d.tipoChecklist || ""
  const cor   = tipo === "Entrada" ? "#2e9e5b" : "#d93025"
  const agora = d.dataHora || new Date().toLocaleString("pt-BR")


  function linha(label, valor) {
    if (!valor) return ""
    return `
      <tr>
        <td style="padding:8px 12px;font-weight:700;color:#444;width:40%;border-bottom:1px solid #eee;">${label}</td>
        <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;">${valor}</td>
      </tr>`
  }

  const veiculo = d.fabricante && d.modelo
    ? `${d.fabricante} ${d.modelo}`
    : (d.descricaoVeiculo || "—")

  const iluminacaoTexto = d.iluminacao === "ok"
    ? "OK"
    : `Problema: ${d.problemaLuz || "—"}`

  const avariaTexto = d.avaria === "sim"
    ? `Sim — ${d.descricaoAvaria || "sem descrição"}${d.qtdFotos > 0 ? ` (${d.qtdFotos} foto(s) registrada(s))` : ""}`
    : "Não"

  const html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comprovante Checklist</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; background:#fff; color:#222; }
        .header { background:#005499; padding:24px 32px; display:flex; align-items:center; justify-content:space-between; }
        .header h1 { color:#fff; font-size:16px; font-weight:700; }
        .header .tipo { background:${cor}; color:#fff; padding:6px 18px; border-radius:20px; font-weight:700; font-size:15px; }
        .subtitulo { background:#f0f4f8; padding:10px 32px; font-size:12px; color:#555; border-bottom:2px solid #005499; }
        .corpo { padding:24px 32px; }
        table { width:100%; border-collapse:collapse; margin-bottom:24px; }
        .secao { font-size:13px; font-weight:800; color:#005499; text-transform:uppercase; letter-spacing:0.05em;
                 padding:10px 12px; background:#f0f7ff; border-left:4px solid #005499; margin:20px 0 0; }
        .assinatura-box { border:1.5px solid #ccc; border-radius:8px; padding:12px; text-align:center; margin-top:8px; }
        .assinatura-box img { max-width:300px; max-height:120px; }
        .rodape { margin-top:32px; padding-top:12px; border-top:1px solid #ccc;
                  font-size:11px; color:#888; text-align:center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Comtrasil — Comprovante de Checklist</h1>
        <span class="tipo">${tipo}</span>
      </div>
      <div class="subtitulo">Emitido em: ${agora}</div>
      <div class="corpo">

        <div class="secao"> Identificação</div>
        <table>
          ${linha("Motorista", d.motorista)}
          ${linha("Placa", d.placa)}
          ${linha("Veículo", veiculo)}
          ${linha("KM Atual", d.km)}
          ${linha("Cidade de Origem", d.cidade)}
        </table>

        <div class="secao"> Condições do Veículo</div>
        <table>
          ${linha("Combustível", d.combustivel)}
          ${linha("Pneus", d.pneus)}
          ${linha("Limpeza", d.limpeza)}
          ${linha("Iluminação", iluminacaoTexto)}
        </table>

        <div class="secao"> Avaria</div>
        <table>
          ${linha("Avaria", avariaTexto)}
        </table>

        ${d.observacoes ? `
        <div class="secao"> Observações</div>
        <table>${linha("Observações", d.observacoes)}</table>` : ""}

        <div class="secao"> Assinatura do Motorista</div>
        <div class="assinatura-box">
          <img src="${d.assinatura}" alt="Assinatura">
          <p style="margin-top:8px;font-size:12px;color:#555;">${d.motorista}</p>
        </div>

        <div class="rodape">
          Comtrasil Transportadora · Documento gerado automaticamente pelo sistema de Checklist
        </div>
      </div>
    </body>
    </html>
  `

  const janela = window.open("", "_blank")
  janela.document.write(html)
  janela.document.close()
  janela.focus()
  setTimeout(() => janela.print(), 600)
}

function reduzirImagem(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const img = new Image()
      img.src = e.target.result
      img.onload = function () {
        const canvas = document.createElement("canvas")
        const ctx    = canvas.getContext("2d")
        const maxWidth = 300
        let width = img.width, height = img.height
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth }
        canvas.width = width; canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.3))
      }
    }
    reader.readAsDataURL(file)
  })
}
