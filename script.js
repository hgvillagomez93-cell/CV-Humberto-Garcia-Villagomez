document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar data.json');
            return res.json();
        })
        .then(data => {
            renderizarCV(data);
            configurarBotones(data.personal);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('main').innerHTML = `<p style="color:red;">Error al cargar los datos. Intenta recargar.</p>`;
        });
});

function renderizarCV(data) {
    // Encabezado
    document.getElementById('nombre').textContent = data.personal.nombre;

    const main = document.getElementById('main');
    main.innerHTML = '';

    // Secciones definidas
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

        // Header
        const header = document.createElement('div');
        header.className = 'seccion-header';
        header.innerHTML = `
            <h2>${sec.titulo}</h2>
            <span class="icono">▼</span>
        `;
        header.addEventListener('click', () => {
            div.classList.toggle('abierta');
        });

        // Contenido
        const contenido = document.createElement('div');
        contenido.className = 'seccion-contenido';

        switch (sec.tipo) {
            case 'texto':
                contenido.innerHTML = `<div class="perfil-texto">${sec.contenido}</div>`;
                break;
            case 'lista':
                sec.items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'lista-item';
                    itemDiv.innerHTML = `
                        <div class="titulo-item">${item.titulo}</div>
                        <div class="subtitulo-item">${item.institucion} · ${item.periodo}</div>
                        ${item.nota ? `<p style="font-size:0.6rem;color:#b0b0c0;">${item.nota}</p>` : ''}
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

        // Abrir la primera sección por defecto (perfil)
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
        whatsapp.href = `https://wa.me/52${numero}`; // +52 para México
    } else {
        whatsapp.style.display = 'none';
    }

    if (personal.correo) {
        email.href = `mailto:${personal.correo}?subject=Contacto%20desde%20tu%20CV%20Arcade`;
    } else {
        email.style.display = 'none';
    }
}
