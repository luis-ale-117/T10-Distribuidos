//Obten las pantallas
const pantallaCapturaArticulo = document.getElementById('pantallaCapturaArticulo')
const pantallaCompraArticulo = document.getElementById('pantallaCompraArticulo')
const pantallaDescripcionArticulo = document.getElementById('pantallaDescripcionArticulo')
const pantallaCarrito = document.getElementById('pantallaCarrito')
const tituloBienvenida = document.getElementById('tituloBienvenida')
const menu = document.getElementById('menu')

//Oculta las pantallas al inicio
pantallaCapturaArticulo.style.display = 'none'
pantallaCompraArticulo.style.display = 'none'

pantallaCarrito.style.display = 'none'

const btnMuestraCapturaArticulo = document.getElementById('btnMuestraCapturaArticulo')
const btnMuestraCompraArticulo = document.getElementById('btnMuestraCompraArticulo')
const btnLimpiarCaptura = document.getElementById('btnLimpiarCaptura')
const btnRegresarDeCaptura = document.getElementById('btnRegresarDeCaptura')
const btnRegresarDeCompra = document.getElementById('btnRegresarDeCompra')
const btnRegresarDeCarrito = document.getElementById('btnRegresarDeCarrito')
const btnConsultaCarrito = document.getElementById('btnConsultaCarrito')
const btnVaciarCarrito = document.getElementById('btnVaciarCarrito')

const formCapturaArticulo = document.getElementById('formCapturaArticulo')
const formBuscaArticulo = document.getElementById('formBuscaArticulo')
const fileImagenArticulo = document.getElementById('fileImagenArticulo')
const imagenArticulo = document.getElementById('imagenArticulo')
const listaArticulos = document.getElementById('listaArticulos')
const articulosCarrito = document.getElementById('articulosCarrito')

let arrayArticulos = null
let arrayCarrito = null
let fotoBase64 = null

// Principalmente navegacion entre las vistas, para la SPA
btnMuestraCapturaArticulo.addEventListener('click', () => {
    menu.style.display = 'none'
    tituloBienvenida.style.display = 'none'
    pantallaCapturaArticulo.style.display = 'block'
    pantallaCompraArticulo.style.display = 'none'
    
    pantallaCarrito.style.display = 'none'
})
btnMuestraCompraArticulo.addEventListener('click', () => {
    menu.style.display = 'none'
    tituloBienvenida.style.display = 'none'
    pantallaCapturaArticulo.style.display = 'none'
    pantallaCompraArticulo.style.display = 'block'
    
    pantallaCarrito.style.display = 'none'
})
btnLimpiarCaptura.addEventListener('click', () => {
    formCapturaArticulo.capturaNombre.value = ''
    formCapturaArticulo.capturaDescripcion.value = ''
    formCapturaArticulo.capturaPrecio.value = '0.01'
    formCapturaArticulo.capturaCantidad.value = '1'
    imagenArticulo.setAttribute('src','./usuario_sin_foto.png')
    formCapturaArticulo.fileImagenArticulo.value = ''
    fotoBase64 = null
})
btnRegresarDeCaptura.addEventListener('click',() => {
    menu.style.display = 'block'
    tituloBienvenida.style.display = 'block'
    pantallaCapturaArticulo.style.display = 'none'
    pantallaCompraArticulo.style.display = 'none'
    
    pantallaCarrito.style.display = 'none'
})
btnRegresarDeCompra.addEventListener('click',() => {
    menu.style.display = 'block'
    tituloBienvenida.style.display = 'block'
    pantallaCapturaArticulo.style.display = 'none'
    pantallaCompraArticulo.style.display = 'none'
    
    pantallaCarrito.style.display = 'none'
})
btnRegresarDeCarrito.addEventListener('click',() => {
    menu.style.display = 'none'
    tituloBienvenida.style.display = 'none'
    pantallaCapturaArticulo.style.display = 'none'
    pantallaCompraArticulo.style.display = 'block'
    
    pantallaCarrito.style.display = 'none'
})
fileImagenArticulo.addEventListener('change', (e) => {
    const file = e.target.files[0]
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.addEventListener('load',(e) => {
        imagenArticulo.setAttribute('src',e.target.result)
        fotoBase64 = e.target.result.split(',')[1]
    })
})
// Aqui ya hay lógica de peticiones al servidor
listaArticulos.addEventListener('click',(e)=>{
    if(e.target.type != 'submit')
        return
    accion = e.target.dataset.tipo
    if(accion=='descripcion'){
        divArticuloBody = e.target.parentElement
        divDescripcion = divArticuloBody.children[4]
        divDescripcion.style.display = 'block'
    }
    else if(accion=='cerrar'){
        divDescripcion = e.target.parentElement
        divDescripcion.style.display = 'none'
    }
    else if(accion=='compra'){
        divArticuloBody = e.target.parentElement
        idArticulo = divArticuloBody.dataset.id
        cantidad = divArticuloBody.children[5].value
        console.log(`Compra id:${idArticulo}, cantidad: ${cantidad}`)
        fetch('/Servicio/rest/ws/compra_articulo', {
            method: 'POST',
            body: JSON.stringify({id: idArticulo,cantidad: cantidad}),
            headers : {'Content-Type': 'application/json'}
        })
        .then(res => res.ok?Promise.resolve(res):Promise.reject(res))
        .then(res => res.json())
        .then(data => {
            console.log("Solicitud exitosa ", data)
            swal("¡Articulo en el carrito!", {
                icon: "success",
                text: "¡Exito!"
            });
        })
        .catch(err => {
            console.log(err.status)
            err.json()
            .then(data => {
                console.log("Solicitud fallida ",data)
                swal("Oops ocurrio un error grave",{
                        icon: "error",
                        text: "Solicitud fallida: "+data.message
                })
            })
            .catch(_=>console.log("Error"))
        })
    }
    
})

formCapturaArticulo.addEventListener('submit', (e) => {
    e.preventDefault()
    nombre = formCapturaArticulo.capturaNombre.value
    descripcion = formCapturaArticulo.capturaDescripcion.value
    precio = formCapturaArticulo.capturaPrecio.value
    cantidad = formCapturaArticulo.capturaCantidad.value
    foto = fotoBase64
    let articulo = {
        id : 0,
        nombre,
        descripcion,
        precio,
        cantidad,
        foto
    }
    console.log(articulo)
    //TODO: send data
    swal({
        title: "¿Subir articulo?",
        text: "Asegurate de haber configurado bien los campos",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((ok) => {
        if (ok) {
            //Intenta la captura
            fetch('/Servicio/rest/ws/alta_articulo', {
                method: 'POST',
                body: JSON.stringify({articulo: articulo}),
                headers : {'Content-Type': 'application/json'}
            })
            .then(res => res.ok?Promise.resolve(res):Promise.reject(res))
            .then(res => res.json())
            .then(data => {
                console.log("Solicitud exitosa ", data)
                swal("¡Articulo capturado!", {
                    icon: "success",
                    text: "¡Exito!"
                });
            })
            .catch(err => {
                console.log(err.status)
                err.json()
                .then(data => {
                    console.log("Solicitud fallida ",data)
                    swal("Oops ocurrio un error grave",{
                            icon: "error",
                            text: "Solicitud fallida: "+data.message
                    })
                })
                .catch(_=>console.log("Error"))
            })
        }
    });
    btnLimpiarCaptura.click()
})

formBuscaArticulo.addEventListener('submit',(e) => {
    e.preventDefault()
    let primer = listaArticulos.firstElementChild;
    while (primer) {
        primer.remove();
        primer = listaArticulos.firstElementChild;
    }
    patron = formBuscaArticulo.buscaArticulo.value
    console.log({patron})
    //Obtener los articulos
    fetch('/Servicio/rest/ws/busca_articulos', {
        method: 'POST',
        body: JSON.stringify({patron: patron}),
        headers : {'Content-Type': 'application/json'}
    })
    .then(res => res.ok?Promise.resolve(res):Promise.reject(res))
    .then(res => res.json())
    .then(data => {
        console.log("Solicitud exitosa ", data)
        arrayArticulos = null
        if(data.length === 0){
            const mensaje = document.createElement('h4')
            mensaje.textContent = 'Sin resultados'
            listaArticulos.appendChild(mensaje)
        }
        else{
            arrayArticulos = data
            const fragment = document.createDocumentFragment()
            for(articulo of arrayArticulos){
                const divArt = document.createElement('div')
                const nombreArt = document.createElement('h5')
                const precioArt = document.createElement('p')
                const fotoArt = document.createElement('img')
                const cantidadArt = document.createElement('p')
                const btnDescripcion = document.createElement('button')
                const btnCompra = document.createElement('button')
                const inputCantidad = document.createElement('input')

                const divDescripcion = document.createElement('div')
                const btnCerrar = document.createElement('button')
                const pDescripcion = document.createElement('p')
                
                nombreArt.textContent = articulo.nombre
                precioArt.textContent = `Precio: $${articulo.precio}`
                cantidadArt.textContent = `Disponibles: ${articulo.cantidad}`
                if(articulo.foto != null){
                    fotoArt.setAttribute('src',`data:image/jpeg;base64,${articulo.foto}`)
                    fotoArt.setAttribute('alt',`foto ${articulo.nombre}`)
                }else{
                    fotoArt.setAttribute('src','./usuario_sin_foto.png')
                    fotoArt.setAttribute('alt','sin foto')
                }
                inputCantidad.setAttribute('type','number')
                inputCantidad.setAttribute('min','1')
                inputCantidad.setAttribute('step','1')
                inputCantidad.value = "1"
                btnDescripcion.dataset.tipo = 'descripcion'
                btnDescripcion.textContent = 'Descripcion'
                btnCompra.dataset.tipo = 'compra'
                btnCompra.textContent = 'Compra'
                btnCerrar.dataset.tipo = 'cerrar'
                btnCerrar.textContent = 'Cerrar'

                divArt.classList.add('card')
                fotoArt.style.width = '12rem'
                fotoArt.classList.add('card-img-top')
                const divCardBody = document.createElement('div')
                divCardBody.dataset.id = articulo.id
                divCardBody.classList.add('card-body')
                nombreArt.classList.add('card-title')
                precioArt.classList.add('card-text')
                cantidadArt.classList.add('card-text','text-muted')
                divCardBody.appendChild(nombreArt)
                divCardBody.appendChild(precioArt)
                divCardBody.appendChild(cantidadArt)

                btnCerrar.classList.add('btn','btn-secondary')
                pDescripcion.classList.add('card-text','text-muted')
                pDescripcion.textContent = articulo.descripcion
                divDescripcion.appendChild(pDescripcion)
                divDescripcion.appendChild(btnCerrar)
                divDescripcion.style.display = 'none'

                btnDescripcion.classList.add('btn','btn-primary')
                inputCantidad.classList.add('form-control')
                btnCompra.classList.add('btn','btn-primary')
                divCardBody.appendChild(btnDescripcion)
                divCardBody.appendChild(divDescripcion)
                divCardBody.appendChild(inputCantidad)
                divCardBody.appendChild(btnCompra)

                divArt.appendChild(fotoArt)
                divArt.appendChild(divCardBody)

                fragment.appendChild(divArt)
            }
            listaArticulos.appendChild(fragment)
        }
    })
    .catch(err => {
        console.log(err.status)
        err.json()
        .then(data => {
            console.log("Solicitud fallida ",data)
            swal("Oops ocurrio un error grave",{
                    icon: "error",
                    text: "Solicitud fallida: "+data.message
            })
        })
        .catch(_=>console.log("Error"))
    })
})

btnConsultaCarrito.addEventListener('click',(e) => {
    menu.style.display = 'none'
    pantallaCapturaArticulo.style.display = 'none'
    pantallaCompraArticulo.style.display = 'none'
    pantallaCarrito.style.display = 'block'

    let primer = articulosCarrito.firstElementChild;
    while (primer) {
        primer.remove();
        primer = articulosCarrito.firstElementChild;
    }
    //Obtener los articulos
    fetch('/Servicio/rest/ws/consulta_carrito', {
        method: 'POST',
        body: JSON.stringify({}),
        headers : {'Content-Type': 'application/json'}
    })
    .then(res => res.ok?Promise.resolve(res):Promise.reject(res))
    .then(res => res.json())
    .then(data => {
        console.log("Solicitud exitosa ", data)
        arrayCarrito = null
        if(data.length === 0){
            const mensaje = document.createElement('h4')
            mensaje.textContent = 'Carrito vacio'
            articulosCarrito.appendChild(mensaje)
        }
        else{
            totalCompra = 0
            arrayCarrito = data
            const fragment = document.createDocumentFragment()
            for(articulo of arrayCarrito){
                const divArt = document.createElement('div')
                const nombreArt = document.createElement('h5')
                const precioArt = document.createElement('p')
                const fotoArt = document.createElement('img')
                const cantidadArt = document.createElement('p')
                const costo = document.createElement('p')
                const btnBorra = document.createElement('button')
                
                nombreArt.textContent = articulo.nombre
                precioArt.textContent = `Precio por articulo: $${articulo.precio}`
                cantidadArt.textContent = `Cantidad: ${articulo.cantidad}`
                costo.textContent = `Costo: ${(articulo.precio * articulo.cantidad).toFixed(2)}`
                totalCompra = totalCompra + articulo.precio * articulo.cantidad
                if(articulo.foto != null){
                    fotoArt.setAttribute('src',`data:image/jpeg;base64,${articulo.foto}`)
                    fotoArt.setAttribute('alt',`foto ${articulo.nombre}`)
                }else{
                    fotoArt.setAttribute('src','./usuario_sin_foto.png')
                    fotoArt.setAttribute('alt','sin foto')
                }
                btnBorra.dataset.tipo = 'borrar'
                btnBorra.textContent = 'Eliminar articulo'

                divArt.classList.add('card')
                fotoArt.style.width = '12rem'
                fotoArt.classList.add('card-img-top')
                const divCardBody = document.createElement('div')
                divCardBody.dataset.id = articulo.id
                divCardBody.classList.add('card-body')
                nombreArt.classList.add('card-title')
                precioArt.classList.add('card-text')
                costo.classList.add('card-text')
                cantidadArt.classList.add('card-text','text-muted')
                btnBorra.classList.add('btn','btn-primary')
                divCardBody.appendChild(nombreArt)
                divCardBody.appendChild(precioArt)
                divCardBody.appendChild(cantidadArt)
                divCardBody.appendChild(costo)
                divCardBody.appendChild(btnBorra)

                divArt.appendChild(fotoArt)
                divArt.appendChild(divCardBody)

                fragment.appendChild(divArt)
            }
            articulosCarrito.appendChild(fragment)
            const total = document.createElement('h4')
            total.textContent = `Total de la compra: $${totalCompra.toFixed(2)}`
            articulosCarrito.appendChild(total)
        }
    })
    .catch(err => {
        console.log(err.status)
        err.json()
        .then(data => {
            console.log("Solicitud fallida ",data)
            swal("Oops ocurrio un error grave",{
                    icon: "error",
                    text: "Solicitud fallida: "+data.message
            })
        })
        .catch(_=>console.log("Error"))
    })
})

btnVaciarCarrito.addEventListener('click', (e) => {
    swal({
        title: "¿Vaciar el carrito?",
        text: "Eliminaras todos los articulos del carrito",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((ok) => {
        if (ok) {
            //Intenta la captura
            fetch('/Servicio/rest/ws/elimina_carrito', {
                method: 'POST',
                body: JSON.stringify({}),
                headers : {'Content-Type': 'application/json'}
            })
            .then(res => res.ok?Promise.resolve(res):Promise.reject(res))
            .then(res => res.json())
            .then(data => {
                console.log("Solicitud exitosa ", data)
                swal("¡Carrito vacio!", {
                    icon: "success",
                    text: "¡El carrito se vaceo correctamente!"
                });
            })
            .catch(err => {
                console.log(err.status)
                err.json()
                .then(data => {
                    console.log("Solicitud fallida ",data)
                    swal("Oops ocurrio un error grave",{
                            icon: "error",
                            text: "Solicitud fallida: "+data.message
                    })
                })
                .catch(_=>console.log("Error"))
            })
        }
    });
})

articulosCarrito.addEventListener('click',(e)=> {
    if(e.target.type != 'submit'){
        return
    }
    accion = e.target.dataset.tipo
    if(accion=='borrar'){
        divArticuloBody = e.target.parentElement
        idArticulo = divArticuloBody.dataset.id
        console.log(`Borrar del carrito id:${idArticulo}`)
        fetch('/Servicio/rest/ws/borra_articulo_carrito', {
            method: 'POST',
            body: JSON.stringify({id: idArticulo}),
            headers : {'Content-Type': 'application/json'}
        })
        .then(res => res.ok?Promise.resolve(res):Promise.reject(res))
        .then(res => res.json())
        .then(data => {
            console.log("Solicitud exitosa ", data)
            swal("¡Articulo borrado del carrito!", {
                icon: "success",
                text: "¡Exito!"
            });
        })
        .catch(err => {
            console.log(err.status)
            err.json()
            .then(data => {
                console.log("Solicitud fallida ",data)
                swal("Oops ocurrio un error grave",{
                        icon: "error",
                        text: "Solicitud fallida: "+data.message
                })
            })
            .catch(_=>console.log("Error"))
        })
    }
})