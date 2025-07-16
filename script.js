let materias = [];
let areas = {
  "Matemáticas": "matematicas",
  "Ciencias básicas": "ciencias-basicas",
  "Ciencias de la ingeniería": "ciencias-ingenieria",
  "Diseños de ingeniería": "disenos-ingenieria",
  "Cursos complementarios": "complementarios"
};

window.onload = () => {
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      materias = data;
      renderizarMalla();
      renderizarCalculadora();
      renderizarActividades();
    });
};

function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculto'));
  document.getElementById(id).classList.remove('oculto');
}

function renderizarMalla() {
  const contenedor = document.getElementById("malla-contenedor");
  contenedor.innerHTML = "";

  let agrupadas = {};

  materias.forEach(m => {
    const key = `Año ${m.anio} - Semestre ${m.semestre}`;
    if (!agrupadas[key]) agrupadas[key] = [];
    agrupadas[key].push(m);
  });

  Object.entries(agrupadas).forEach(([semestre, lista]) => {
    const col = document.createElement("div");
    col.className = "semestre";
    col.innerHTML = `<h3>${semestre}</h3>`;

    lista.forEach(m => {
      const div = document.createElement("div");
      div.className = `materia ${areas[m.area]}`;
      div.innerText = `${m.nombre}`;
      div.onclick = () => mostrarDetalles(m);
      col.appendChild(div);
    });

    contenedor.appendChild(col);
  });
}

function mostrarDetalles(m) {
  document.getElementById("detalle-nombre").innerText = m.nombre;
  document.getElementById("detalle-codigo").innerText = m.codigo;
  document.getElementById("detalle-uv").innerText = m.uv;
  document.getElementById("detalle-area").innerText = m.area;

  const codigos = new Map(materias.map(m => [m.codigo, m.nombre]));
  document.getElementById("detalle-requisitos").innerText =
    m.requisitos.map(r => codigos.get(r)).join(", ") || "Ninguno";
  document.getElementById("detalle-abre").innerText =
    m.abre.map(r => codigos.get(r)).join(", ") || "Ninguna";

  document.getElementById("detalle-materia").style.display = "block";
}

function cerrarModal() {
  document.getElementById("detalle-materia").style.display = "none";
}

/* --- CALCULADORA DE PRIORIDADES --- */
function renderizarCalculadora() {
  const cont = document.getElementById("calculadora-prioridades");
  cont.innerHTML = "";
  let prioridades = JSON.parse(localStorage.getItem("prioridades")) || {};

  materias.forEach(m => {
    const wrap = document.createElement("div");
    wrap.className = "materia-prioridad";
    const label = document.createElement("label");
    label.innerText = m.nombre;

    const select = document.createElement("select");
    ["Alta", "Media", "Baja", "Ninguna"].forEach(op => {
      const option = document.createElement("option");
      option.value = op;
      option.text = op;
      if (prioridades[m.codigo] === op) option.selected = true;
      select.appendChild(option);
    });

    select.onchange = () => {
      prioridades[m.codigo] = select.value;
      localStorage.setItem("prioridades", JSON.stringify(prioridades));
    };

    label.appendChild(select);
    wrap.appendChild(label);
    cont.appendChild(wrap);
  });
}

/* --- SEGUIMIENTO DE ACTIVIDADES --- */
function renderizarActividades() {
  const cont = document.getElementById("actividades");
  cont.innerHTML = "";
  let actividades = JSON.parse(localStorage.getItem("actividades")) || {};
  let totalUV = 0, totalPuntos = 0;

  materias.forEach(m => {
    const wrap = document.createElement("div");
    wrap.className = "actividad-materia";
    const titulo = document.createElement("h4");
    titulo.innerText = m.nombre;
    wrap.appendChild(titulo);

    const lista = document.createElement("ul");

    (actividades[m.codigo] || []).forEach(act => {
      const li = document.createElement("li");
      li.innerText = `${act.nombre} - ${act.porcentaje}% - Nota: ${act.nota}`;
      lista.appendChild(li);
    });

    const form = document.createElement("div");
    form.innerHTML = `
      <input type="text" placeholder="Actividad" id="nombre-${m.codigo}">
      <input type="number" placeholder="%" min="0" max="100" id="porc-${m.codigo}">
      <input type="number" placeholder="Nota" step="0.01" min="0" max="10" id="nota-${m.codigo}">
      <button class="agregar-actividad" onclick="agregarActividad('${m.codigo}')">Agregar</button>
    `;

    const promedio = calcularPromedio(actividades[m.codigo] || []);
    if (!isNaN(promedio)) {
      const promEl = document.createElement("p");
      promEl.innerText = `Promedio actual: ${promedio.toFixed(2)}`;
      wrap.appendChild(promEl);
      totalUV += m.uv;
      totalPuntos += promedio * m.uv;
    }

    wrap.appendChild(lista);
    wrap.appendChild(form);
    cont.appendChild(wrap);
  });

  const cum = totalUV ? totalPuntos / totalUV : 0;
  document.getElementById("cum").innerText = cum.toFixed(2);
}

function agregarActividad(codigo) {
  let actividades = JSON.parse(localStorage.getItem("actividades")) || {};
  const nombre = document.getElementById(`nombre-${codigo}`).value;
  const porc = parseFloat(document.getElementById(`porc-${codigo}`).value);
  const nota = parseFloat(document.getElementById(`nota-${codigo}`).value);

  if (!nombre || isNaN(porc) || isNaN(nota)) return;

  actividades[codigo] = actividades[codigo] || [];
  actividades[codigo].push({ nombre, porcentaje: porc, nota });

  localStorage.setItem("actividades", JSON.stringify(actividades));
  renderizarActividades();
}

function calcularPromedio(lista) {
  let total = 0;
  let suma = 0;
  lista.forEach(act => {
    suma += act.nota * (act.porcentaje / 100);
    total += act.porcentaje;
  });
  return total ? suma : NaN;
}
