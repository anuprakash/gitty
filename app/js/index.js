const {ipcRenderer} = require('electron');

const path = require('path');

setTimeout(() => {
    document.querySelector('#about-modal').classList.remove('is-shown');
},1000);

let refreshLocalReposBtn = document.getElementById('refresh-local-repos');

refreshLocalReposBtn.addEventListener('click', () => {
  ipcRenderer.send('refresh-local-repos');
});

ipcRenderer.on('local-repos', (event, localRepos) => {

  let repoNav = document.getElementById('local-repos');
  repoNav.innerHTML = ''

  localRepos.forEach((repo) => {
    let repoName = path.basename(repo);
    let repoDiv = document.createElement('div');
    let repoBtn = document.createElement('button');
    let repoPath = document.createElement('div');

    repoBtn.className += "nav-button local-repos";
    repoBtn.appendChild(document.createTextNode(repoName));
    repoPath.hidden = true;
    repoPath.appendChild(document.createTextNode(repo));
    repoDiv.appendChild(repoBtn);
    repoDiv.appendChild(repoPath);
    repoNav.appendChild(repoDiv);

    repoDiv.addEventListener('click', (event) => {
      let repoPath = event.path[1].childNodes[1].innerHTML;
      prepareRepo(repoPath);
      ipcRenderer.send('get-commits', repoPath);
      ipcRenderer.send('get-branches', repoPath);
    });
  });
});

function prepareRepo(repoPath){
  let repoName = path.basename(repoPath);
  document.querySelector(".section-title").innerHTML = repoName;
  document.querySelector("#commit-list").innerHTML = '';
}

ipcRenderer.on('commits', (event, allCommits) => {
  let content = document.querySelector('.content');

  allCommits.forEach((commit) => {
    /*
      Commit splitting
    */
    commit = commit.split(' | ')
    let hash = commit[0];
    let authorName = commit[1];
    let autherDate = commit[2];
    let commitMsg = commit[3];

    let card = document.querySelector('#commit-list');
    let cardWrapper = document.createElement('div');
    let toggleBtn = document.createElement('button');
    let cardMeta = document.createElement('div');
    cardWrapper.classList.add('card-wrapper');
    toggleBtn.classList.add('js-container-target', 'card-toggle-button');
    cardMeta.classList.add('card-meta', 'u-avoid-clicks');
    cardMeta.innerHTML = authorName + ', ' + autherDate;
    toggleBtn.innerHTML = commitMsg;
    toggleBtn.appendChild(cardMeta);
    cardWrapper.appendChild(toggleBtn);
    card.appendChild(cardWrapper);
  });
});

ipcRenderer.on('branches', (event, branches) => {
  let cardTitle =  document.querySelector(".section-title")

  branches.forEach((branch) => {
    if (branch.startsWith('*')) {
      let cardMeta = document.createElement('div');
      cardMeta.classList.add('card-meta', 'u-avoid-clicks');
      cardMeta.innerHTML = branch;
      cardTitle.appendChild(cardMeta);
    }
  });
});
