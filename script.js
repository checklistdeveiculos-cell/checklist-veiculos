const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

// Placas fixas 
const dadosPlacas = {
 "CUI9G05": { fabricante: "Fiat", modelo: "Strada" },
 "FCK9I84": { fabricante: "Chevrolet", modelo: "Onix" },
 "FZB4I64": { fabricante: "Fiat", modelo: "Strada" },
 "GED3859": { fabricante: "Chevrolet", modelo: "Montana LS" },
 "OKN4886": { fabricante: "Volkswagen", modelo: "Saveiro" },
 "PGY2J57": { fabricante: "Chevrolet", modelo: "Montana LS" },
 "PJK4140": { fabricante: "Chevrolet", modelo: "Montana LS" },
 "PKU1762": { fabricante: "Chevrolet", modelo: "Montana LS" },
 "PLJ0106": { fabricante: "Honda", modelo: "CG Start" },
 "QNP2895": { fabricante: "Chevrolet", modelo: "Montana LS" },
 "RDC7J81": { fabricante: "Iveco", modelo: "Daily 55" },
 "RDR7H80": { fabricante: "Chevrolet", modelo: "Onix" },
 "RPI1F38": { fabricante: "Mercedes-Benz",modelo: "Sprinter" },
 "RPN9E03": { fabricante: "Volkswagen", modelo: "Express DRF 4x2" },
 "RPP2E64": { fabricante: "Chevrolet", modelo: "Onix Sedan" },
 "RPP6E14": { fabricante: "Chevrolet", modelo: "Onix Hatch" },
 "SJX0D93": { fabricante: "Fiat", modelo: "Strada Freedom DC 1.3 Flex" },
 "SJX0G54": { fabricante: "Fiat", modelo: "Strada Endurance CP 1.3 Flex" },
 "TGW9I45": { fabricante: "Fiat", modelo: "Strada EndurancE Cs 1.3 Flex" }
}

// Guarda dados do último envio para o PDF 
let ultimosDados = null

// OFFLINE 
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
 fetch(URL_SCRIPT, { method: "POST", body: JSON.stringify(lista[i].dados) })
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

// INIT 
document.addEventListener("DOMContentLoaded", () => {

 monitorarConexao()
 atualizarBannerPendentes()



 document.getElementById("btnEnviarPendentes").onclick = enviarPendentes
 document.getElementById("btnPDF").onclick = () => gerarPDF(ultimosDados)

 const form = document.getElementById("checklistForm")
 const loading = document.getElementById("loading")

 // Placa 
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

 // Cidade 
 const cidade = document.getElementById("cidade")
 const cidadeOutro = document.getElementById("cidadeOutro")
 cidade.onchange = () => {
 cidadeOutro.classList.toggle("hidden", cidade.value !== "outro")
 }

 // Iluminação 
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

 // Avaria 
 const avaria = document.getElementById("avaria")
 const campoAvaria = document.getElementById("campoAvaria")
 avaria.onchange = () => {
 campoAvaria.classList.toggle("hidden", avaria.value !== "sim")
 }

 // Fotos 
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

 // Canvas assinatura 
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

 // Submit 
 form.addEventListener("submit", async (e) => {
 e.preventDefault()

 if (!assinou) {
 alert("Por favor, assine antes de enviar.")
 return
 }

 loading.classList.remove("hidden")

 try {
 const fotos = await Promise.all(arquivosSelecionados.map(file => reduzirImagem(file)))

 const placaVal = selectPlaca.value
 const placaFinal = placaVal === "outro" ? placaOutro.value : placaVal
 const cidadeFinal = cidade.value === "outro" ? cidadeOutro.value : cidade.value

 const luzesSelecionadas = Array.from(document.querySelectorAll('input[name="luz"]:checked'))
 .map(cb => cb.value === "outro_luz" ? outroProblema.value : cb.value)
 .filter(Boolean)

 const dados = {
 tipoChecklist: document.getElementById("tipoChecklist").value,
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
 qtdFotos: arquivosSelecionados.length,
 fotos: fotos,
 dataHora: new Date().toLocaleString("pt-BR")
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

 fetch(URL_SCRIPT, { method: "POST", body: JSON.stringify(dados) })

 loading.classList.add("hidden")

 // Guarda dados e mostra seção PDF
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

// Resetar formulário 
function resetarFormulario(form, ctx, preview) {
 form.reset()
 ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
 preview.innerHTML = ""
 const ids = ["infoVeiculo","placaOutro","descricaoVeiculoDiv","cidadeOutro",
 "problemaLuzDiv","outroProblema","campoAvaria","fotoLimiteAviso"]
 ids.forEach(id => document.getElementById(id).classList.add("hidden"))
}

// Gerar PDF comprovante (jsPDF download real) 
function gerarPDF(d) {
 if (!d) return

 const { jsPDF } = window.jspdf
 const doc = new jsPDF({ unit: "mm", format: "a4" })

 const tipo = d.tipoChecklist || ""
 const agora = d.dataHora || new Date().toLocaleString("pt-BR")
 const corTipo = tipo === "Entrada" ? [46, 158, 91] : [217, 48, 37]

 const veiculo = d.fabricante && d.modelo
 ? `${d.fabricante} ${d.modelo}`
 : (d.descricaoVeiculo || "")

 const iluminacaoTexto = d.iluminacao === "ok"
 ? "OK"
 : `Problema: ${d.problemaLuz || ""}`

 const avariaTexto = d.avaria === "sim"
 ? `Sim ${d.descricaoAvaria || "sem descrição"}${d.qtdFotos > 0 ? ` (${d.qtdFotos} foto(s) registrada(s))` : ""}`
 : "Não"

 const W = 210 // largura A4
 let y = 0

 doc.setFillColor(0, 84, 153)
 doc.rect(0, 0, W, 26, "F")

 doc.setFontSize(11)
 doc.setTextColor(255, 255, 255)
 doc.setFont("helvetica", "bold")
 doc.text("Comtrasil", 14, 12)

 doc.setFontSize(9)
 doc.setFont("helvetica", "normal")
 doc.text("Comprovante de Checklist", 14, 20)

 doc.setFillColor(...corTipo)
 doc.roundedRect(W - 46, 8, 34, 10, 3, 3, "F")
 doc.setFontSize(10)
 doc.setFont("helvetica", "bold")
 doc.text(tipo, W - 29, 15, { align: "center" })

 doc.setFillColor(240, 244, 248)
 doc.rect(0, 26, W, 10, "F")
 doc.setFontSize(9)
 doc.setTextColor(80, 80, 80)
 doc.setFont("helvetica", "normal")
 doc.text("Emitido em: " + agora, 14, 33)

 y = 48

 // Função para seção 
 function secao(titulo) {
 doc.setFillColor(240, 247, 255)
 doc.rect(10, y - 5, W - 20, 8, "F")
 doc.setDrawColor(0, 84, 153)
 doc.setLineWidth(0.8)
 doc.line(10, y - 5, 10, y + 3)
 doc.setFontSize(9)
 doc.setFont("helvetica", "bold")
 doc.setTextColor(0, 84, 153)
 doc.text(titulo, 14, y)
 y += 8
 }

 // Função para linha de dado 
 function dado(label, valor) {
 if (!valor) return
 doc.setFontSize(9)
 doc.setFont("helvetica", "bold")
 doc.setTextColor(80, 80, 80)
 doc.text(label + ":", 14, y)
 doc.setFont("helvetica", "normal")
 doc.setTextColor(30, 30, 30)
 const linhas = doc.splitTextToSize(String(valor), 110)
 doc.text(linhas, 75, y)
 y += linhas.length * 6
 // Linha separadora
 doc.setDrawColor(220, 220, 220)
 doc.setLineWidth(0.2)
 doc.line(14, y - 1, W - 14, y - 1)
 }

 // Identificação 
 secao("IDENTIFICAÇÃO")
 dado("Motorista", d.motorista)
 dado("Placa", d.placa)
 dado("Veículo", veiculo)
 dado("KM Atual", d.km)
 dado("Cidade de Origem", d.cidade)

 y += 4
 secao("CONDIÇÕES DO VEÍCULO")
 dado("Combustível", d.combustivel)
 dado("Pneus", d.pneus)
 dado("Limpeza", d.limpeza ? d.limpeza.charAt(0).toUpperCase() + d.limpeza.slice(1) : "")
 dado("Iluminação", iluminacaoTexto)

 y += 4
 secao("AVARIA")
 dado("Avaria", avariaTexto)

 if (d.observacoes) {
 y += 4
 secao("OBSERVAÇÕES")
 dado("Observações", d.observacoes)
 }

 // Assinatura 
 y += 6
 secao("ASSINATURA DO MOTORISTA")
 try {
 doc.addImage(d.assinatura, "PNG", 14, y, 80, 30)
 y += 34
 doc.setFontSize(9)
 doc.setTextColor(80, 80, 80)
 doc.setFont("helvetica", "normal")
 doc.text(d.motorista, 54, y, { align: "center" })
 y += 6
 } catch(e) {}

 // Rodapé 
 doc.setDrawColor(200, 200, 200)
 doc.setLineWidth(0.3)
 doc.line(14, 285, W - 14, 285)
 doc.setFontSize(8)
 doc.setTextColor(150, 150, 150)
 doc.text("Comtrasil Transportadora Documento gerado automaticamente pelo sistema de Checklist", W / 2, 290, { align: "center" })

 // Download 
 const nomeArquivo = `checklist_${tipo}_${d.placa}_${d.dataHora.replace(/[/:, ]/g, "-")}.pdf`
 doc.save(nomeArquivo)
}

// Reduzir imagem 
function reduzirImagem(file) {
 return new Promise((resolve) => {
 const reader = new FileReader()
 reader.onload = function (e) {
 const img = new Image()
 img.src = e.target.result
 img.onload = function () {
 const canvas = document.createElement("canvas")
 const ctx = canvas.getContext("2d")
 const maxWidth = 400
 let width = img.width, height = img.height
 if (width > maxWidth) { height *= maxWidth / width; width = maxWidth }
 canvas.width = width; canvas.height = height
 ctx.drawImage(img, 0, 0, width, height)
 resolve(canvas.toDataURL("image/jpeg", 0.5))
 }
 }
 reader.readAsDataURL(file)
 })
}
