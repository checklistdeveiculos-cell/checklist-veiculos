const scriptURL = "https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

const form = document.getElementById("formChecklist")
const canvas = document.getElementById("assinatura")
const ctx = canvas.getContext("2d")

let desenhando = false
let assinou = false

ctx.lineWidth = 1
ctx.lineCap = "round"
ctx.strokeStyle = "black"


function posicaoMouse(e){
const rect = canvas.getBoundingClientRect()
return {
x: e.clientX - rect.left,
y: e.clientY - rect.top
}
}

function posicaoTouch(e){
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
ctx.beginPath()
const pos = posicaoMouse(e)
ctx.moveTo(pos.x,pos.y)
}

function iniciarTouch(e){
e.preventDefault()
desenhando = true
assinou = true
ctx.beginPath()
const pos = posicaoTouch(e)
ctx.moveTo(pos.x,pos.y)
}

function desenhar(e){
if(!desenhando) return
const pos = posicaoMouse(e)
ctx.lineTo(pos.x,pos.y)
ctx.stroke()
}

function desenharTouch(e){
e.preventDefault()
if(!desenhando) return
const pos = posicaoTouch(e)
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

form.addEventListener("submit", async function(e){

e.preventDefault()

if(!assinou){
alert("Assinatura obrigatória!")
return
}

document.getElementById("limparAssinatura").addEventListener("click", function(){
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou = false
})

const dataHora = new Date().toLocaleString("pt-BR")

const motorista = document.getElementById("motorista").value
const placa = document.getElementById("placa").value
const km = document.getElementById("km").value
const combustivel = document.getElementById("combustivel").value
const pneus = document.getElementById("pneus").value
const iluminacao = document.getElementById("iluminacao").value
const problemaLuz = document.getElementById("problemaLuz").value
const avaria = document.getElementById("avaria").value
const descricaoAvaria = document.getElementById("descricaoAvaria").value
const observacoes = document.getElementById("observacoes").value

const assinatura = canvas.toDataURL("image/png")

let fotoAvariaBase64 = ""

const fotoInput = document.getElementById("fotoAvaria")

if(fotoInput.files.length > 0){

const file = fotoInput.files[0]

fotoAvariaBase64 = await new Promise((resolve)=>{

const reader = new FileReader()

reader.onload = () => resolve(reader.result)

reader.readAsDataURL(file)

})

const avariaSelect = document.getElementById("avaria")
const campoAvaria = document.getElementById("campoAvaria")

avariaSelect.addEventListener("change", function(){

if(this.value === "Sim"){
campoAvaria.style.display = "block"
}else{
campoAvaria.style.display = "none"
}

})

}

const dados = {
dataHora,
motorista,
placa,
km,
combustivel,
pneus,
iluminacao,
problemaLuz,
avaria,
descricaoAvaria,
observacoes,
assinatura,
fotoAvaria: fotoAvariaBase64
}

try{

await fetch(scriptURL,{
method:"POST",
body:JSON.stringify(dados)
})

alert("Checklist enviado com sucesso!")

form.reset()

ctx.clearRect(0,0,canvas.width,canvas.height)

assinou = false

}catch(error){

alert("Erro ao enviar checklist")

console.error(error)

}

})
