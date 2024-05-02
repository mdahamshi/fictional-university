
const KEY_S = "s", KEY_ESC = "Escape";
class Search {
  //1. describe and create our object
  constructor() {
    this.addSearchHTML();
    this.openButton = document.querySelectorAll(".js-search-trigger");
    this.closeButton = document.querySelector(".search-overlay__close");
    this.searchOverlay = document.querySelector(".search-overlay");
    this.searchField = document.querySelector("#search-term");
    this.searchResults = document.querySelector("#search-overlay__results");
    this.isSpinneVisible = false;
    this.isOpverlayOpen = false;
    this.prevValue;
    this.typingTimer;

    this.events();
  }

  //2. events

  events() {
    this.openButton.forEach(el => {
      el.onclick = this.openOverlay.bind(this);
    });
    this.closeButton.onclick = this.closeOverlay.bind(this);
    document.onkeydown = this.keyPressDispatcher.bind(this);
    this.searchField.onkeyup = this.typingLogic.bind(this);




  }


  //3. methods, functions actions

  typingLogic(event) {
    if(this.searchField.value == this.prevValue)
        return;
    clearTimeout(this.typingTimer);
    if(this.searchField.value){
      ! this.isSpinneVisible && (this.searchResults.innerHTML = '<div class="spinner-loader"></div>');
      this.isSpinneVisible = true;
      this.typingTimer = setTimeout(this.getResults.bind(this), 750);
      this.prevValue = this.searchField.value;
    }else {
      this.searchResults.innerHTML = '';
      this.isSpinneVisible = false;
    }

  }

  async getResults() {

    try {
      fetch(`${universityData.root_url}/wp-json/university/v1/search?term=${this.searchField.value}`)
      .then(res => res.json())
      .then(data => {
          this.searchResults.innerHTML = `
            <div class="row">
              <div class="one-third">
              <h2 class="search-overlay__section-title">General Information</h2>
              ${data.generalInfo.length ? '<ul class="link-list min-list">' : '<p>No general information matches that !'}
              ${data.generalInfo.map(item => {
                return `<li><a href="${item.permalink}">${item.title}</a>${item.postType == 'post' ?` by ${item.authorName}` : '' }</li>`;}).join('')
              }
              ${data.generalInfo.length ? '</ul>' : ''}
              </div>
              <div class="one-third">
              <h2 class="search-overlay__section-title">Programs</h2>
              ${data.programs.length ? '<ul class="link-list min-list">' : `<p>No programs matches that ! <a href="${universityData.root_url}/programs">View All Programs</a></p>`}
              ${data.programs.map(item => {
                return `<li><a href="${item.permalink}">${item.title}</a></li>`;}).join('')
              }
              ${data.programs.length ? '</ul>' : ''}


              <h2 class="search-overlay__section-title">Professors</h2>
              ${data.professors.length ? '<ul class="professor-cards">' : '<p>No professors matches that !'}
              ${data.professors.map(item => {
                return `
                <li class="professor-card__list-item">
                  <a class="professor-card" href="${item.permalink}">
                    <img class="professor-card__image" src="${item.image}">
                    <span class="professor-card__name">${item.title}</span>
                  </a>
                </li>
                `;}).join('')
              }
              ${data.professors.length ? '</ul>' : ''}
              </div>

              <div class="one-third">
              <h2 class="search-overlay__section-title">Campuses</h2>
              ${data.campuses.length ? '<ul class="link-list min-list">' : `<p>No campuses matches that ! <a href="${universityData.root_url}/campuses">View All Campuses</a></p>`}
              ${data.campuses.map(item => {
                return `<li><a href="${item.permalink}">${item.title}</a></li>`;}).join('')
              }
              ${data.campuses.length ? '</ul>' : ''}
              <h2 class="search-overlay__section-title">Events</h2>
              ${data.events.length ? '' : `<p>No events matches that ! <a href="${universityData.root_url}/events">View All Events</a></p>`}
              ${data.events.map(item => {
                return `
                <div class="event-summary">
                <a class="event-summary__date t-center" href="${item.permalink}">
                  <span class="event-summary__month">${item.month}</span>
                  <span class="event-summary__day">${item.day}</span>
                </a>
                <div class="event-summary__content">
                  <h5 class="event-summary__title headline headline--tiny"><a href="${item.permalink}">${item.title}</a></h5>
                  <p>${item.description}<a href="${item.permalink}" class="nu gray">Learn more</a></p>
                </div>
              </div>
                `;}).join('')
              }
              ${data.events.length ? '</ul>' : ''}

              </div>
            </div>
          `;

          this.isSpinneVisible = false;

      });

    }
    catch(err){
      this.searchResults.innerHTML = '<p>unexpected error try again !</p>';
      console.log(err);
    };


  }

    async getResultsOld() {

    try {
      let [posts, pages] = await Promise.all([
        fetch(`${universityData.root_url}/wp-json/wp/v2/posts?search=${this.searchField.value}`).then(res => res.json()),
        fetch(`${universityData.root_url}/wp-json/wp/v2/pages?search=${this.searchField.value}`).then(res => res.json())
      ]);
      let data = posts.concat(pages);

      this.searchResults.innerHTML = `
        <h2 class="search-overlay__section-title">General Information</h2>
        ${data.length ? '<ul class="link-list min-list">' : '<p>No general information matches that !'}
        ${data.map(item => {
          return `<li><a href="${item.link}">${item.title.rendered}</a>${item.type == 'post' ?` by ${item.authorName}` : '' }</li>`;}).join('')
        }
        ${data.length ? '</ul>' : ''}
        </ul>
      `;
      this.isSpinneVisible = false;
    }
    catch(err){
      this.searchResults.innerHTML = '<p>unexpected error try again !</p>';
      console.log(err);
    };


  }
  openOverlay(event) {
    this.isOpverlayOpen = true;
    this.searchOverlay.classList.add("search-overlay--active");
    document.body.classList.add("body-no-scroll");
    this.searchField.value = '';
    setTimeout(() => this.searchField.focus(), 301);
    event.preventDefault();
  }

  closeOverlay(event) {
    this.isOpverlayOpen = false;
    this.searchOverlay.classList.remove("search-overlay--active");
    document.body.classList.remove("body-no-scroll");
    this.searchResults.innerHTML = '';
    event.preventDefault();
  }

  keyPressDispatcher(event) {
    let key = event.key;
    switch(key) {
      case KEY_S: {
        if(! this.isOpverlayOpen && ! (["input","textarea"].includes(document.activeElement.tagName.toLowerCase())))
            this.openOverlay(event);
        break;
      }
      case KEY_ESC: {
        this.isOpverlayOpen && this.closeOverlay(event);
        break;
      }
      default:
        break;
    }
  }

  addSearchHTML(){

    document.body.insertAdjacentHTML('beforeend', `
      <div class="search-overlay ">
        <div class="search-overlay__top">
          <div class="container">
            <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
            <input type="text" class="search-term" placeholder="What are you looking for today ?" id="search-term">
            <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
          </div>
        </div>
        <div class="container">
          <div id="search-overlay__results">
          </div>
        </div>
    </div>
    `);
  }
}

export default Search;
