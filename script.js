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
                const textoDiv = document.createElement('div');
                
                if (sec.id === 'perfil') {
                    textoDiv.className = 'perfil-texto';
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
                        <button class="btn-pequeno" onclick="generarPDF()">📄 Descargar PDF</button>
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

// ===== FUNCIÓN PARA GENERAR PDF CON html2pdf.js =====
function generarPDF() {
    // Mostrar indicador de carga
    const btnPDF = document.querySelector('.btn-pequeno[onclick="generarPDF()"]');
    const textoOriginal = btnPDF ? btnPDF.textContent : '📄 Descargar PDF';
    if (btnPDF) {
        btnPDF.textContent = '⏳ Generando...';
        btnPDF.disabled = true;
    }

    // Obtener el elemento a convertir
    const app = document.getElementById('app');
    
    // Configuración del PDF
    const opt = {
        margin: [10, 10, 10, 10], // márgenes en mm [superior, izquierda, inferior, derecha]
        filename: 'CV_Humberto_Garcia_Villagomez.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // Mayor calidad
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#0a0e1a', // Fondo oscuro
            logging: false,
            windowWidth: 1200, // Ancho fijo para consistencia
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
        }
    };

    // Verificar si html2pdf está disponible
    if (typeof html2pdf === 'undefined') {
        console.error('La librería html2pdf no está cargada. Asegúrate de incluir el script en tu HTML.');
        alert('Error: La librería para generar PDF no está cargada. Por favor, recarga la página.');
        if (btnPDF) {
            btnPDF.textContent = textoOriginal;
            btnPDF.disabled = false;
        }
        return;
    }

    // Generar el PDF
    html2pdf()
        .set(opt)
        .from(app)
        .save()
        .then(() => {
            // Restaurar botón
            if (btnPDF) {
                btnPDF.textContent = textoOriginal;
                btnPDF.disabled = false;
            }
        })
        .catch((error) => {
            console.error('Error al generar PDF:', error);
            alert('Hubo un error al generar el PDF. Intenta de nuevo.');
            if (btnPDF) {
                btnPDF.textContent = textoOriginal;
                btnPDF.disabled = false;
            }
        });
}

// ===== FUNCIÓN ALTERNATIVA PARA GENERAR PDF CON jsPDF (SIN html2canvas) =====
// Esta es una versión más ligera que genera un PDF desde cero con texto estructurado
function generarPDFSimple() {
    // Verificar si jsPDF está disponible
    if (typeof jsPDF === 'undefined') {
        alert('La librería jsPDF no está cargada. Usando el método con html2canvas...');
        generarPDF();
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Obtener datos del perfil
        const nombre = document.getElementById('nombre')?.textContent || 'Humberto García';
        const perfil = document.querySelector('#sec-perfil .perfil-texto')?.textContent || '';
        
        // Configurar fuente (usar una fuente estándar)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(nombre, 20, 20);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Ingeniero en Automatización', 20, 30);
        
        // Línea separadora
        doc.setDrawColor(50, 50, 80);
        doc.line(20, 35, 190, 35);
        
        // Perfil
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Perfil Profesional', 20, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Dividir texto en líneas para que quepa
        const lineasPerfil = doc.splitTextToSize(perfil || 'No disponible', 170);
        doc.text(lineasPerfil, 20, 55);
        
        // Agregar más secciones...
        let y = 55 + (lineasPerfil.length * 5);
        
        // Obtener educación
        const educacionItems = document.querySelectorAll('#sec-educacion .lista-item');
        if (educacionItems.length > 0) {
            y += 10;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Educación', 20, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            educacionItems.forEach(item => {
                const titulo = item.querySelector('.titulo-item')?.textContent || '';
                const subtitulo = item.querySelector('.subtitulo-item')?.textContent || '';
                doc.text(titulo, 22, y);
                y += 5;
                doc.setFontSize(9);
                doc.text(subtitulo, 24, y);
                y += 6;
                doc.setFontSize(10);
            });
        }
        
        // Guardar PDF
        doc.save('CV_Humberto_Garcia_Simple.pdf');
        
    } catch (error) {
        console.error('Error al generar PDF simple:', error);
        alert('Error al generar PDF. Intentando con el método estándar...');
        generarPDF();
    }
}

// Exponer funciones globalmente para que los botones puedan llamarlas
window.generarPDF = generarPDF;
window.generarPDFSimple = generarPDFSimple;
