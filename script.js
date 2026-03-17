const URL_SCRIPT="https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

document.addEventListener("DOMContentLoaded",()=>{

const form=document.getElementById("checklistForm")
const loading=document.getElementById("loading")

const cidade=document.getElementById("cidade")
const cidadeOutro=document.getElementById("cidadeOutro")

cidade.onchange=()=>{
if(cidade.value==="outro"){
cidadeOutro.classList.remove("hidden")
}else{
cidadeOutro.classList.add("hidden")
}
}

const iluminacao=document.getElementById("iluminacao")
const problemaDiv=document.getElementById("problemaLuzDiv")

iluminacao.onchange=()=>{
if(iluminacao.value==="problema"){
problemaDiv.classList.remove("hidden")
}else{
problemaDiv.classList.add("hidden")
}
}

const tipoLuz=document.getElementById("tipoLuz")
const outroProblema=document.getElementById("outroProblema")

tipoLuz.onchange=()=>{
if(tipoLuz.value==="outro"){
outroProblema.classList.remove("hidden")
}else{
outroProblema.classList.add("hidden")
}
}

const avaria=document.getElementById("avaria")
const campoAvaria=document.getElementById("campoAvaria")

avaria.onchange=()=>{
if(avaria.value==="sim"){
campoAvaria.classList.remove("hidden")
}else{
campoAvaria.classList.add("hidden")
}
}

/* ASSINATURA */

const canvas=document.getElementById("assinatura")
const ctx=canvas.getContext("2d")

canvas.width=canvas.offsetWidth
canvas.height=200

let desenhando=false
let assinou=false

canvas.addEventListener("mousedown",start)
canvas.addEventListener("mousemove",draw)
canvas.addEventListener("mouseup",end)

canvas.addEventListener("touchstart",startTouch)
canvas.addEventListener("touchmove",drawTouch)
canvas.addEventListener("touchend",end)

function start(e){
desenhando=true
assinou=true
ctx.beginPath()
ctx.moveTo(e.offsetX,e.offsetY)
}

function draw(e){
if(!desenhando)return
ctx.lineTo(e.offsetX,e.offsetY)
ctx.stroke()
}

function startTouch(e){
e.preventDefault()
desenhando=true
assinou=true
const rect=canvas.getBoundingClientRect()
const t=e.touches[0]
ctx.beginPath()
ctx.moveTo(t.clientX-rect.left,t.clientY-rect.top)
}

function drawTouch(e){
e.preventDefault()
if(!desenhando)return
const rect=canvas.getBoundingClientRect()
const t=e.touches[0]
ctx.lineTo(t.clientX-rect.left,t.clientY-rect.top)
ctx.stroke()
}

function end(){
desenhando=false
}

document.getElementById("limpar").onclick=()=>{
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou=false
}

/* ENVIO */

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

if(inputFotos.files.length > 0){

for(let i=0;i<inputFotos.files.length;i++){

const file=inputFotos.files[i]
const base64=await reduzirImagem(file)
fotos.push(base64)

}

}

let cidadeFinal=cidade.value
if(cidade.value==="outro"){
cidadeFinal=cidadeOutro.value
}

let problemaFinal=tipoLuz.value
if(tipoLuz.value==="outro"){
problemaFinal=outroProblema.value
}

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

/* REDUZ IMAGEM (ESSENCIAL PRA NÃO TRAVAR) */

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
