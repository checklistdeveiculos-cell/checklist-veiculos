const scriptURL = "https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

const form = document.getElementById("formChecklist")
const canvas = document.getElementById("assinatura")
const ctx = canvas.getContext("2d")

let desenhando = false
let assinou = false

ctx.lineWidth = 1
ctx.lineCap = "round"
ctx.strokeStyle = "black"

function getPosMouse(e){
const rect = canvas.getBoundingClientRect()
return {
x: e.clientX - rect.left,
y: e.clientY - rect.top
}
}

function getPosTouch(e){
const rect = canvas.getBoundingClientRect()
const touch = e.touches[0]
return {
x: touch.clientX - rect.left,
y: touch.clientY - rect.top
}
}

function iniciar(e){
desenhando = true
assinou = true
const pos = getPosMouse(e)
ctx.beginPath()
ctx.moveTo(pos.x,pos.y)
}

function iniciarTouch(e){
e.preventDefault()
desenhando = true
assinou = true
const pos = getPosTouch(e)
ctx.beginPath()
ctx.moveTo(pos.x,pos.y)
}

function desenhar(e){
if(!desenhando) return
const pos = getPosMouse(e)
ctx.lineTo(pos.x,pos.y)
ctx.stroke()
}

function desenharTouch(e){
e.preventDefault()
if(!desenhando) return
const pos = getPosTouch(e)
ctx.lineTo(pos.x,pos.y)
ctx.stroke()
}

function parar(){
desenhando = false
}

canvas.addEventListener("mousedown", iniciar)
canvas.addEventListener("mousemove", desenhar)
canvas.addEventListener("mouseup", parar)

canvas.addEventListener("touchstart", iniciarTouch)
canvas.addEventListener("touchmove", desenharTouch)
canvas.addEventListener("touchend", parar)

document.getElementById("limparAssinatura").addEventListener("click", function(){
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou = false
})

const avariaSelect = document.getElementById("avaria")
const campoAvaria = document.getElementById("campoAvaria")

if(avariaSelect){
avariaSelect.addEventListener("change", function(){
if(this.value === "Sim"){
campoAvaria.style.display = "block"
}else{
campoAvaria.style.display = "none"
}
})
}

form.addEventListener("submit", async function(e){

e.preventDefault()

if(!assinou){
alert("Assinatura obrigatória!")
return
}

const dados = {
dataHora: new Date().toLocaleString("pt-BR"),
motorista: document.getElementById("motorista").value,
placa: document.getElementById("placa").value,
km: document.getElementById("km").value,
combustivel: document.getElementById("combustivel").value,
pneus: document.getElementById("pneus").value,
iluminacao: document.getElementById("iluminacao").value,
problemaLuz: document.getElementById("problemaLuz").value,
avaria: document.getElementById("avaria").value,
descricaoAvaria: document.getElementById("descricaoAvaria").value,
observacoes: document.getElementById("observacoes").value,
assinatura: canvas.toDataURL("image/png")
}

try{

await fetch(scriptURL,{
method:"POST",
body:JSON.stringify(dados)
})

alert("Checklist enviado!")
form.reset()
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou = false

}catch(err){

alert("Erro ao enviar para planilha")
console.error(err)

}

})
