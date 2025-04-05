<p align="center">
  <img src="https://raw.githubusercontent.com/Xapixowy/arkham-horror-backend/refs/heads/main/public/assets/images/email/banner.webp" alt="logo" width="500"/>
</p>

<h1 align="center">Arkham Horror</h1>

<p align="center">Application to make Arkham Horror games easier.</p>
<p align="center">This repository is closely linked to <a href="https://github.com/Xapixowy/arkham-horror-frontend">another one</a>, which handles the <a href="https://github.com/Xapixowy/arkham-horror-frontend">frontend</a>, while this one is the <b><u>backend</b></u>.</p>

<h2>Table of contents</h2>
<ul>
  <li><a href="#description">Description</a></li>
  <li><a href="#tech-stack">Tech Stack</a>
    <ul>
      <li><a href="#nestjs">NestJS</a></li>
      <li><a href="#priemng">PrimeNg</a></li>
      <li><a href="#ngrx">NgRx</a></li>
      <li><a href="#socketio">Socket.IO</a></li>
    </ul>
  </li>
  <li><a href="#installation">Installation</a>
    <ul>
      <li><a href="#prerequisites">Prerequisites</a></li>
      <li><a href="#steps">Steps</a></li>
    </ul>
  </li>
</ul>

<h2 id="description">Description</h2>
<p>The application was designed to simplify managing characters and game elements during Arkham Horror board game sessions. It provides real-time updates on the game phase and allows easy management of items, spells, companions, and other resources directly through the interface.</p>

<h2 id="tech-stack">Tech Stack</h2>
<p align="center">
  <img src="https://nestjs.com/logo-small-gradient.d792062c.svg" alt="logo" width="130"/>
</p>
<h3 align="center" id="nestjs"><a href="https://nestjs.com/">NestJS</a></h3>
<p>NestJS is a progressive, open-source Node.js framework for building efficient and scalable server-side applications using TypeScript. It leverages modern JavaScript features and is built with a modular architecture, making it ideal for building enterprise-level applications.</p>

<p align="center">
  <img src="https://www.postgresql.org/media/img/about/press/elephant.png" alt="logo" width="100"/>
</p>
<h3 align="center" id="postgresql"><a href="https://www.postgresql.org/">PostgreSQL</a></h3>
<p>PostgreSQL is an open-source, reliable, and scalable relational database system known for its support of advanced SQL features and ability to handle large volumes of data.</p>

<p align="center">
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://socket.io/images/logo-dark.svg">
  <img src="https://socket.io/images/logo.svg" alt="logo" width="100"/>
  </picture>
</p>
<h3 align="center" id="socketio"><a href="https://socket.io">Socket.IO</a></h3>
<p>Socket.IO client is a JavaScript library for real-time, bidirectional communication between web clients and servers, allowing the frontend to easily connect to a Socket.IO server for features like chat, live updates, and real-time notifications.</p>

<p align="center">
  <img src="https://logos-world.net/wp-content/uploads/2021/02/Docker-Logo-700x394.png" alt="logo" width="200"/>
</p>
<h3 align="center" id="docker"><a href="https://www.docker.com/">Docker</a></h3>
<p>Docker is an open-source platform that automates the deployment and management of applications using containers, allowing for consistent environments across different systems.</p>

<h2 id="installation">Installation</h2>
<p>To simplify the installation process, the project uses a Docker.</p>
<p>Remember, this application is tightly linked to the <a href="https://github.com/Xapixowy/arkham-horror-backend">backend</a>, and you should also set up <a href="https://github.com/Xapixowy/arkham-horror-backend">that project</a> to get the full functionality.</p>

<h3 id="prerequisites">Prerequisites</h3>
<ul>
  <li><a href="https://www.docker.com/">Docker</a></li>
</ul>

<h3 id="steps">Steps</h3>
<h4>1. Environment variables</h4>

Copy `.env.example` file to `.env`. You don't need to make any changes there.
```bash
cp .env.example .env
```
<h4>2. Build Docker container</h4>

Just run the command to build the container and wait.
```bash
docker-compose up -d
```

<h4>3. Enjoy :)</h4>
