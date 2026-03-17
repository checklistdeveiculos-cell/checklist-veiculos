const URL_SCRIPT="https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

document.addEventListener("DOMContentLoaded",()=>{

const form=document.getElementById("checklistForm")
const loading=document.getElementById("loading")

const cidade=document.getElementById("cidade")
const cidadeOutro=document.getElementById("cidadeOutro")

cidade.onchange=()=>{
cidadeOutro.classList.toggle("hidden", cidade.value !== "outro")
}

const iluminacao=document.getElementById("iluminacao")
const problemaDiv=document.getElementById("problemaLuzDiv")

iluminacao.onchange=()=>{
problemaDiv.classList.toggle("hidden", iluminacao.value !== "problema")
}

const tipoLuz=document.getElementById("tipoLuz")
const outroProblema=document.getElementById("outroProblema")

tipoLuz.onchange=()=>{
outroProblema.classList.toggle("hidden", tipoLuz.value !== "outro")
}

const avaria=document.getElementById("avaria")
const campoAvaria=document.getElementById("campoAvaria")

avaria.onchange=()=>{
campoAvaria.classList.toggle("hidden", avaria.value !== "sim")
}

/* ✍️ ASSINATURA MELHORADA */

const canvas=document.getElementById("assinatura")
const ctx=canvas.getContext("2d")

canvas.width=canvas.offsetWidth
canvas.height=200

ctx.lineWidth = 2
ctx.lineCap = "round"
ctx.lineJoin = "round"

let desenhando=false
let assinou=false
let lastX=0
let lastY=0

function getPos(e){
const rect=canvas.getBoundingClientRect()

if(e.touches){
return {
x: e.touches[0].clientX - rect.left,
y: e.touches[0].clientY - rect.top
}
}

return {
x: e.offsetX,
y: e.offsetY
}
}

function start(e){
desenhando=true
assinou=true

const pos=getPos(e)
lastX=pos.x
lastY=pos.y
}

function draw(e){

if(!desenhando) return

// ⚠️ só desenha se estiver realmente tocando (evita bug de scroll)
if(e.touches && e.touches.length === 0) return

const pos=getPos(e)

// suavização
ctx.beginPath()
ctx.moveTo(lastX, lastY)
ctx.lineTo(pos.x, pos.y)
ctx.stroke()

lastX=pos.x
lastY=pos.y

if(e.cancelable) e.preventDefault()
}

function end(){
desenhando=false
}

canvas.addEventListener("mousedown",start)
canvas.addEventListener("mousemove",draw)
canvas.addEventListener("mouseup",end)
canvas.addEventListener("mouseleave",end)

canvas.addEventListener("touchstart",start, {passive:false})
canvas.addEventListener("touchmove",draw, {passive:false})
canvas.addEventListener("touchend",end)

document.getElementById("limpar").onclick=()=>{
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou=false
}

/* 🚀 ENVIO */

form.addEventListener("submit",async(e)=>{

e.preventDefault()

if(!assinou){
alert("Assine antes de enviar")
return
}

loading.classList.remove("hidden")

try{

const inputFotos = document.getElementById("foto")
let fotos=[]

for(let i=0;i<inputFotos.files.length;i++){
const base64=await reduzirImagem(inputFotos.files[i])
fotos.push(base64)
}

let cidadeFinal=cidade.value === "outro" ? cidadeOutro.value : cidade.value
let problemaFinal=tipoLuz.value === "outro" ? outroProblema.value : tipoLuz.value

const dados={
motorista:document.getElementById("motorista").value,
placa:document.getElementById("placa").value,
km:document.getElementById("km").value,
cidade:cidadeFinal,
combustivel:document.getElementById("combustivel").value,
pneus:document.getElementById("pneus").value,
iluminacao:iluminacao.value,
problemaLuz:problemaFinal,
avaria:avaria.value,
descricaoAvaria:document.getElementById("descricaoAvaria").value,
observacoes:document.getElementById("observacoes").value,
assinatura:canvas.toDataURL(),
fotos:fotos
}

await fetch(URL_SCRIPT,{
method:"POST",
body:JSON.stringify(dados)
})

loading.classList.add("hidden")
alert("Checklist enviado!")

form.reset()
ctx.clearRect(0,0,canvas.width,canvas.height)

}catch(err){
loading.classList.add("hidden")
alert("Erro ao enviar")
}

})

})

/* 📸 REDUZ IMAGEM */

function reduzirImagem(file){
return new Promise((resolve)=>{

const reader=new FileReader()

reader.onload=function(e){

const img=new Image()
img.src=e.target.result

img.onload=function(){

const canvas=document.createElement("canvas")
const ctx=canvas.getContext("2d")

const maxWidth=800

let width=img.width
let height=img.height

if(width>maxWidth){
height*=maxWidth/width
width=maxWidth
}

canvas.width=width
canvas.height=height

ctx.drawImage(img,0,0,width,height)

resolve(canvas.toDataURL("image/jpeg",0.7))

}

}

reader.readAsDataURL(file)

})
}
