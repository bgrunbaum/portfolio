import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

projectsTitle.textContent = `${projects.length} Projects`;

function renderProjectList(list) {
  projectsContainer.innerHTML = '';
  for (const project of list) {
    renderProjects(project, projectsContainer, 'h2');
  }
}

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

const svg = d3.select('#projects-plot');
const legend = d3.select('.legend');

// state shared by the chart and the click handlers
let selectedIndex = -1;
let currentProjects = projects; // projects matching the search
let currentData = [];           // [{ value, label }] for the current pie

// Applies .selected to the wedge + legend item, then filters the project list
function updateSelection() {
  svg.selectAll('path')
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

  legend.selectAll('li')
    .attr('class', (_, idx) =>
      idx === selectedIndex ? 'legend-item selected' : 'legend-item');

  if (selectedIndex === -1) {
    renderProjectList(currentProjects);
  } else {
    const year = currentData[selectedIndex].label;
    renderProjectList(
      currentProjects.filter((p) => String(p.year) === year),
    );
  }
}

function toggle(idx) {
  selectedIndex = selectedIndex === idx ? -1 : idx;
  updateSelection();
}

function renderPieChart(projectsGiven) {
  currentProjects = projectsGiven;
  selectedIndex = -1; 

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => String(d.year),
  );

  currentData = rolledData
    .sort((a, b) => d3.ascending(a[0], b[0]))
    .map(([year, count]) => ({ value: count, label: year }));

  const arcData = d3.pie().value((d) => d.value)(currentData);
  const arcs = arcData.map((d) => arcGenerator(d));

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  arcs.forEach((arc, idx) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => toggle(idx));
  });

  currentData.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => toggle(idx));
  });
}

function setQuery(query) {
  return projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// initial render
renderPieChart(projects);
renderProjectList(projects);

searchInput.addEventListener('input', (event) => {
  const filtered = setQuery(event.target.value);
  renderPieChart(filtered);
  renderProjectList(filtered);
});