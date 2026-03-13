const URL_SCRIPT="https://script.google.com/macros/s/AKfycbwbeMarnNVslGBkDA4kLpOMsXOpL-6OQmi0ur_nw8eZoQ_8zkwccdrlF0mA1pQlDyPw1g/exec"

document.addEventListener("DOMContentLoaded",()=>{

const form=document.getElementById("checklistForm")

const iluminacao=document.getElementById("iluminacao")
const problemaLuz=document.getElementById("problemaLuz")

const tipoLuz=document.getElementById("tipoLuz")
const outroProblema=document.getElementById("outroProblema")

const avaria=document.getElementById("avaria")
const campoAvaria=document.getElementById("campoAvaria")

const foto=document.getElementById("foto")

const canvas=document.getElementById("assinatura")
const limpar=document.getElementById("limpar")

const ctx=canvas.getContext("2d")

let desenhando=false
let assinou=false

canvas.width=canvas.offsetWidth
canvas.height=200

canvas.addEventListener("mousedown",()=>{
desenhando=true
assinou=true
ctx.beginPath()
})

canvas.addEventListener("mouseup",()=>desenhando=false)

canvas.addEventListener("mousemove",(e)=>{

if(!desenhando)return

const rect=canvas.getBoundingClientRect()

ctx.lineTo(
e.clientX-rect.left,
e.clientY-rect.top
)

ctx.stroke()

})

limpar.onclick=()=>{
ctx.clearRect(0,0,canvas.width,canvas.height)
assinou=false
}

iluminacao.onchange=()=>{
if(iluminacao.value==="problema")
problemaLuz.classList.remove("hidden")
else
problemaLuz.classList.add("hidden")
}

tipoLuz.onchange=()=>{
if(tipoLuz.value==="outro")
outroProblema.classList.remove("hidden")
else
outroProblema.classList.add("hidden")
}

avaria.onchange=()=>{
if(avaria.value==="sim")
campoAvaria.classList.remove("hidden")
else
campoAvaria.classList.add("hidden")
}

form.addEventListener("submit",async(e)=>{

e.preventDefault()

if(!assinou){
alert("Assinatura obrigatória")
return
}

let fotoBase64=""

const file=foto.files[0]

if(file){

const reader=new FileReader()

fotoBase64=await new Promise(resolve=>{
reader.onload=()=>resolve(reader.result)
reader.readAsDataURL(file)
})

}

let problemaFinal=tipoLuz.value

if(tipoLuz.value==="outro")
problemaFinal=outroProblema.value

const assinaturaBase64=canvas.toDataURL()

const dados={

motorista:document.getElementById("motorista").value,
placa:document.getElementById("placa").value,
km:document.getElementById("km").value,
combustivel:document.getElementById("combustivel").value,
pneus:document.getElementById("pneus").value,
iluminacao:iluminacao.value,
problemaLuz:problemaFinal,
avaria:avaria.value,
descricaoAvaria:document.getElementById("descricaoAvaria").value,
observacoes:document.getElementById("observacoes").value,
fotoAvaria:fotoBase64,
assinatura:assinaturaBase64

}

const formData = new FormData()

for (const chave in dados){
formData.append(chave, dados[chave])
}

await fetch(URL_SCRIPT,{
method:"POST",
mode:"no-cors",
body:formData
})

alert("Checklist enviado com sucesso!")

form.reset()

ctx.clearRect(0,0,canvas.width,canvas.height)

assinou=false

})

})
