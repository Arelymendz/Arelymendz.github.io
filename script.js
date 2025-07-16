let materias = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    materias = data;
    renderizarMalla();
    renderizarMateriasActivas();
  });

function renderizarMalla() {
  const contenedor = document.getElementById('malla');
  contenedor.innerHTML = '';
  materias.forEach(materia => {
    const div = document.createElement('div');
    div.className = `materia ${materia.area} ${estaAprobada(materia.codigo) ? 'marcada' : ''}`;
    div.textContent = `${materia.nombre}`;
    div.title = `Código: ${materia.codigo}\nUV: ${materia.uv}`;
    div.onclick = () => toggleAprobada(materia.codigo);
    contenedor.appendChild(div);
  });
}

function estaAprobada(codigo) {
  const aprobadas = JSON.parse(localStorage.getItem('materiasAprobadas') || '[]');
  return aprobadas.includes(codigo);
}

function toggleAprobada(codigo) {
  let aprobadas = JSON.parse(localStorage.getItem('materiasAprobadas') || '[]');
  if (aprobadas.includes(codigo)) {
    aprobadas = aprobadas.filter(c => c !== codigo);
  } else {
    aprobadas.push(codigo);
  }
  localStorage.setItem('materiasAprobadas', JSON.stringify(aprobadas));
  renderizarMalla();
  renderizarMateriasActivas();
}

function mostrarSeccion(id) {
  document.querySelectorAll('main > section').forEach(s => s.classList.add('oculto'));
  document.getElementById(id).classList.remove('oculto');
}

function calcularPrioridad() {
  const aprobadas = JSON.parse(localStorage.getItem('materiasAprobadas') || '[]');
  const resultado = materias.filter(m =>
    !aprobadas.includes(m.codigo) &&
    m.prerrequisitos.every(p => aprobadas.includes(p))
  );
  const ul = document.getElementById('resultadoPrioridad');
  ul.innerHTML = '';
  resultado.forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m.nombre} (${m.codigo})`;
    ul.appendChild(li);
  });
}

function renderizarMateriasActivas() {
  const contenedor = document.getElementById('materiasActivas');
  contenedor.innerHTML = '';
  const aprobadas = JSON.parse(localStorage.getItem('materiasAprobadas') || '[]');
  const activas = materias.filter(m => !aprobadas.includes(m.codigo) && m.prerrequisitos.every(p => aprobadas.includes(p)));
  activas.forEach(m => {
    const div = document.createElement('div');
    div.className = 'actividad';
    div.innerHTML = `<h3>${m.nombre}</h3><button onclick="agregarActividad('${m.codigo}')">Agregar Actividad</button><div id="actividades-${m.codigo}"></div>`;
    contenedor.appendChild(div);
    renderizarActividades(m.codigo);
  });
}

function agregarActividad(codigo) {
  const actividades = JSON.parse(localStorage.getItem('actividades') || '{}');
  if (!actividades[codigo]) actividades[codigo] = [];
  if (actividades[codigo].length >= 8) return alert('Máximo 8 actividades');
  const nombre = prompt('Nombre de la actividad:');
  const peso = parseFloat(prompt('Porcentaje (ej: 25):'));
  const nota = parseFloat(prompt('Nota (ej: 8.5):'));
  actividades[codigo].push({ nombre, peso, nota });
  localStorage.setItem('actividades', JSON.stringify(actividades));
  renderizarActividades(codigo);
}

function renderizarActividades(codigo) {
  const actividades = JSON.parse(localStorage.getItem('actividades') || '{}');
  const lista = document.getElementById(`actividades-${codigo}`);
  if (!actividades[codigo]) return;
  lista.innerHTML = '';
  let total = 0;
  actividades[codigo].forEach(a => {
    const div = document.createElement('div');
    div.textContent = `${a.nombre} - ${a.peso}% - Nota: ${a.nota}`;
    lista.appendChild(div);
    total += (a.nota * a.peso) / 100;
  });
  const prom = document.createElement('strong');
  prom.textContent = `Promedio: ${total.toFixed(2)}`;
  lista.appendChild(prom);
}
