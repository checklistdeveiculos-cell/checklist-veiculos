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

/*SISTEMA DE FOTOS COM REMOÇÃO */

const inputFotos = document.getElementById("foto")
const preview = document.getElementById("previewFotos")

let arquivosSelecionados = []

inputFotos.addEventListener("change",(e)=>{

for(let file of e.target.files){

arquivosSelecionados.push(file)

const reader = new FileReader()

reader.onload = function(ev){

const div = document.createElement("div")
div.classList.add("preview-item")

const img = document.createElement("img")
img.src = ev.target.result

const btn = document.createElement("button")
btn.innerText = "✕"
btn.classList.add("remover")

btn.onclick = ()=>{
preview.removeChild(div)
arquivosSelecionados = arquivosSelecionados.filter(f => f !== file)
}

div.appendChild(img)
div.appendChild(btn)
preview.appendChild(div)

}

reader.readAsDataURL(file)
}

inputFotos.value = "" 

})

/*ASSINATURA */

const canvas=document.getElementById("assinatura")
const ctx=canvas.getContext("2d")

canvas.width=canvas.offsetWidth
canvas.height=200

ctx.lineWidth = 2
ctx.lineCap = "round"

let desenhando=false
let assinou=false

canvas.addEventListener("mousedown",(e)=>{
desenhando=true
assinou=true
ctx.beginPath()
ctx.moveTo(e.offsetX,e.offsetY)
})

canvas.addEventListener("mousemove",(e)=>{
if(!desenhando)return
ctx.lineTo(e.offsetX,e.offsetY)
ctx.stroke()
})

canvas.addEventListener("mouseup",()=>desenhando=false)
canvas.addEventListener("mouseleave",()=>desenhando=false)

canvas.addEventListener("touchstart",(e)=>{
const rect=canvas.getBoundingClientRect()
const t=e.touches[0]

desenhando=true
assinou=true

ctx.beginPath()
ctx.moveTo(t.clientX-rect.left,t.clientY-rect.top)
})

canvas.addEventListener("touchmove",(e)=>{
if(!desenhando)return

const rect=canvas.getBoundingClientRect()
const t=e.touches[0]

ctx.lineTo(t.clientX-rect.left,t.clientY-rect.top)
ctx.stroke()
})

canvas.addEventListener("touchend",()=>desenhando=false)

document.getElementById("limpar").onclick=()=>{
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou=false
}

/*ENVIO */

form.addEventListener("submit",async(e)=>{

e.preventDefault()

if(!assinou){
alert("Assine antes de enviar")
return
}

loading.classList.remove("hidden")

try{

let fotos=[]

for(let file of arquivosSelecionados){
const base64=await reduzirImagem(file)
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

preview.innerHTML=""
arquivosSelecionados=[]

}catch(err){
loading.classList.add("hidden")
alert("Erro ao enviar")
}

})

})

/*REDUZ IMAGEM */

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
