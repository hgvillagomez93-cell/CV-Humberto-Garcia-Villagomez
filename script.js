document.addEventListener('DOMContentLoaded', () => {
    // ===== BIENVENIDA =====
    const welcome = document.getElementById('welcome');
    const welcomeName = document.getElementById('welcome-name');
    const app = document.getElementById('app');
    
    // Primero cargamos el JSON para tener el nombre y luego animar
    fetch('data.json')
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar data.json');
            return res.json();
        })
        .then(data => {
            const nombreCompleto = data.personal.nombre;
            // Animación de escritura en la bienvenida
            escribirNombre(welcomeName, nombreCompleto, 120);
            
            // Una vez cargado, también rellenamos el resto de la interfaz
            renderizarCV(data);
            configurarBotones(data.personal);
            
            // Evento de clic para salir de bienvenida
            welcome.addEventListener('click', function salir() {
                welcome.classList.add('hidden');
                app.style.display = 'block';
                // Opcional: remover el listener para evitar múltiples ejecuciones
                welcome.removeEventListener('click', salir);
            });
        })
        .catch(err => {
            console.error(err);
            // Si falla, mostramos un mensaje y permitimos continuar
            welcomeName.textContent = 'HUMBERTO GARCÍA VILLAGÓMEZ';
            welcome.addEventListener('click', () => {
                welcome.classList.add('hidden');
                app.style.display = 'block';
            });
            document.getElementById('main').innerHTML = `<p style="color:red;">Error al cargar los datos. Intenta recargar.</p>`;
        });
});

// Función para animar escritura letra por letra
function escribirNombre(elemento, texto, velocidad = 100) {
    let index = 0;
    elemento.textContent = '';
    function escribir() {
        if (index < texto.length) {
            elemento.textContent += texto.charAt(index);
            index++;
            setTimeout(escribir, velocidad);
        }
    }
    escribir();
}

// ===== FUNCIONES DE RENDERIZADO (MEJORADAS) =====
function renderizarCV(data) {
    document.getElementById('nombre').textContent = data.personal.nombre;
    const main = document.getElementById('main');
    main.innerHTML = '';

    const secciones = [
        { id: 'perfil', titulo: '🎯 Perfil Profesional', tipo: 'texto', contenido: data.perfil },
        { id: 'educacion', titulo: '📘 Educación', tipo: 'lista', items: data.educacion },
        { id: 'experiencia', titulo: '💼 Experiencia Profesional', tipo: 'experiencia', items: data.experiencia },
        { id: 'programacion', titulo: '🧠 Conocimientos en Programación', tipo: 'claves', objeto: data.programacion },
        { id: 'habilidades', titulo: '⚙️ Habilidades', tipo: 'simple', items: data.habilidades },
        { id: 'tecnicos', titulo: '🔧 Conocimientos Técnicos', tipo: 'simple', items: data.conocimientos_tecnicos },
        { id: 'adicional', titulo: '📌 Información Adicional', tipo: 'claves', objeto: data.informacion_adicional },
        { id: 'objetivo', titulo: '🌟 Objetivo Personal', tipo: 'texto', contenido: data.objetivo }
    ];

    secciones.forEach(sec => {
        const div = document.createElement('div');
        div.className = 'seccion';
        div.id = `sec-${sec.id}`;

        const header = document.createElement('div');
        header.className = 'seccion-header';
        header.innerHTML = `
            <h2>${sec.titulo}</h2>
            <span class="icono">▼</span>
        `;
        header.addEventListener('click', () => {
            div.classList.toggle('abierta');
        });

        const contenido = document.createElement('div');
        contenido.className = 'seccion-contenido';

        switch (sec.tipo) {
            case 'texto':
                // Mejora: crear el elemento con la clase correcta
                const textoDiv = document.createElement('div');
                
                // Si es el perfil, usar clase específica
                if (sec.id === 'perfil') {
                    textoDiv.className = 'perfil-texto';
                    // Formatear el texto para respetar saltos de línea
                    const textoFormateado = sec.contenido.replace(/\n/g, '<br>');
                    textoDiv.innerHTML = `<strong>📌 Resumen</strong><br><br>${textoFormateado}`;
                } else if (sec.id === 'objetivo') {
                    textoDiv.className = 'objetivo-texto';
                    const textoFormateado = sec.contenido.replace(/\n/g, '<br>');
                    textoDiv.innerHTML = textoFormateado;
                } else {
                    textoDiv.className = 'perfil-texto';
                    const textoFormateado = sec.contenido.replace(/\n/g, '<br>');
                    textoDiv.innerHTML = textoFormateado;
                }
                
                contenido.appendChild(textoDiv);
                
                // Si es perfil, agregar botones de acción
                if (sec.id === 'perfil') {
                    const accionesDiv = document.createElement('div');
                    accionesDiv.className = 'acciones-perfil';
                    accionesDiv.innerHTML = `
                        <button class="btn-pequeno" onclick="window.print()">🖨️ Imprimir CV</button>
                        <button class="btn-pequeno" onclick="descargarCV()">📄 Descargar CV</button>
                        <a href="#footer" class="btn-pequeno" style="text-decoration:none;display:inline-block;">📧 Contactar</a>
                    `;
                    contenido.appendChild(accionesDiv);
                }
                break;
                
            case 'lista':
                sec.items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'lista-item';
                    itemDiv.innerHTML = `
                        <div class="titulo-item">${item.titulo}</div>
                        <div class="subtitulo-item">${item.institucion} · ${item.periodo}</div>
                        ${item.nota ? `<p style="font-size:0.6rem;color:#8ab3d0;">${item.nota}</p>` : ''}
                    `;
                    contenido.appendChild(itemDiv);
                });
                break;
                
            case 'experiencia':
                sec.items.forEach(exp => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'lista-item';
                    let html = `
                        <div class="titulo-item">${exp.puesto} · ${exp.empresa}</div>
                        <div class="subtitulo-item">${exp.ubicacion} · ${exp.periodo}</div>
                        <ul>
                    `;
                    exp.descripcion.forEach(line => {
                        html += `<li>${line}</li>`;
                    });
                    html += `</ul>`;
                    itemDiv.innerHTML = html;
                    contenido.appendChild(itemDiv);
                });
                break;
                
            case 'claves':
                const clavesDiv = document.createElement('div');
                clavesDiv.className = 'info-adicional';
                for (const [clave, valor] of Object.entries(sec.objeto)) {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${clave}:</strong> ${valor}`;
                    clavesDiv.appendChild(p);
                }
                contenido.appendChild(clavesDiv);
                break;
                
            case 'simple':
                const simpleDiv = document.createElement('div');
                simpleDiv.className = 'lista-simple';
                sec.items.forEach(item => {
                    const span = document.createElement('span');
                    span.textContent = item;
                    simpleDiv.appendChild(span);
                });
                contenido.appendChild(simpleDiv);
                break;
                
            default:
                contenido.innerHTML = '<p>Contenido no disponible</p>';
        }

        div.appendChild(header);
        div.appendChild(contenido);
        main.appendChild(div);

        // Abrir perfil por defecto
        if (sec.id === 'perfil') {
            div.classList.add('abierta');
        }
    });
}

function configurarBotones(personal) {
    const whatsapp = document.getElementById('btn-whatsapp');
    const email = document.getElementById('btn-email');

    if (personal.celular) {
        const numero = personal.celular.replace(/\s/g, '');
        whatsapp.href = `https://wa.me/52${numero}`;
    } else {
        whatsapp.style.display = 'none';
    }

    if (personal.correo) {
        email.href = `mailto:${personal.correo}?subject=Contacto%20desde%20tu%20CV%20Arcade`;
    } else {
        email.style.display = 'none';
    }
}

// ===== FUNCIÓN PARA DESCARGAR CV (OPCIONAL) =====
function descargarCV() {
    // Esta función podría generar un PDF o descargar el contenido
    alert('Función de descarga - Puedes implementar la generación de PDF aquí');
    // Ejemplo: window.location.href = 'ruta/al/cv.pdf';
}
