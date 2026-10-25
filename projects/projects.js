import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

projectsContainer.innerHTML = '';

for (const project of projects) {
  renderProjects(project, projectsContainer, 'h2');
}

const projectsTitle = document.querySelector('.projects-title');

const count = projects.length;

projectsTitle.textContent = `${count} Projects`;