const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

// 一頁顯示電影的數量
const MOVIES_PER_PAGE = 12
// 電影列表
const dataPanel = document.querySelector("#data-panel")
// 搜尋表單按鈕
const searchForm = document.querySelector("#search-form")
// 搜尋關鍵字
const searchInput = document.querySelector("#search-input")
// 頁數
const paginator = document.querySelector("#paginator")
// 電影顯示模式
const dataDisplay = document.querySelector("#data-display")

// 處理資料相關功能
const model = {
  movies: [],// 所有電影
  filteredMovies: [],// 符合關鍵字電影
  displayState: { //所有狀態
    Cards: 'cards',
    List: 'list'
  },
  //新增電影到收藏清單
  addToFavorite(id) {
    const list = this.getFavoriteList()
    const movie = this.movies.find((movie) => movie.id === id)

    if (list.some((movie) => movie.id === id)) {
      return alert("此電影已經在收藏清單中！")
    }

    list.push(movie)
    localStorage.setItem("favoriteMovies", JSON.stringify(list))
  },
  //取得收藏電影清單
  getFavoriteList() {
    return JSON.parse(localStorage.getItem('favoriteMovies')) || []
  },
  //取得該頁數的電影
  getMoviesByPage(page) {
    const data = this.filteredMovies.length ? this.filteredMovies : this.movies

    const startIndex = (page - 1) * MOVIES_PER_PAGE

    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  },
}
// 處理畫面相關功能
const view = {
  //判斷以cards或list顯示電影清單到畫面
  renderMovies(state, page) {
    if (state === model.displayState.List) {
      this.renderMovieByList(model.getMoviesByPage(page))
      this.checkFavorite(model.getFavoriteList())
      return
    }
    this.renderMovieByCards(model.getMoviesByPage(page))
    this.checkFavorite(model.getFavoriteList())
  },
  //以list顯示電影清單到畫面
  renderMovieByList(data) {
    let rawHTML = ""
    data.forEach((item) => {
      rawHTML += `
      <tr>
        <th scope="row">${item.title}</th>
        <td class="text-end">
          <button 
            class="btn btn-primary 
            btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-info btn-add-favorite" 
            data-id="${item.id}"
          >
            +
          </button>
        </td>
      </tr>
      `
    })
    const movieTable = `
    <table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Movie name</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
      ${rawHTML}
      </tbody>
    </table>
    `
    dataPanel.innerHTML = movieTable
  },
  //以cards顯示電影清單到畫面
  renderMovieByCards(data) {
    let rawHTML = ""
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            POSTER_URL + item.image
          }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button 
              class="btn btn-primary 
              btn-show-movie" 
              data-bs-toggle="modal" 
              data-bs-target="#movie-modal" 
              data-id="${item.id}"
            >
              More
            </button>
            <button 
              class="btn btn-info btn-add-favorite" 
              data-id="${item.id}"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>`
    })
    dataPanel.innerHTML = rawHTML
  },
  //顯示該電影詳細資訊
  showMovieModal(id) {
    const modalTitle = document.querySelector("#movie-modal-title")
    const modalImage = document.querySelector("#movie-modal-image")
    const modalDate = document.querySelector("#movie-modal-date")
    const modalDescription = document.querySelector("#movie-modal-description")

    axios.get(INDEX_URL + id).then((response) => {
      const data = response.data.results

      modalTitle.innerText = data.title
      modalDate.innerText = "Release date: " + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${
        POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
    })
  },
  //顯示所有頁數到畫面
  renderPaginator() {
    const data = model.filteredMovies.length
      ? model.filteredMovies
      : model.movies

    const numberOfPages = Math.ceil(data.length / MOVIES_PER_PAGE)
    let rawHTML = ""

    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link btn ${page === 1 ? 'page-now text-light bg-primary':''}" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML
  },
  //標記已收藏的電影
  checkFavorite(favoriteMovies) {
    const favoriteBtn = document.querySelectorAll('.btn-add-favorite')
    favoriteBtn.forEach(item => {
      favoriteMovies.forEach(movie => {
        if (String(movie.id) === item.dataset.id) {
          item.classList.remove('btn-info')
          item.classList.add('btn-success')
          item.innerText = '★'
        }
      })
    })
  }
}
// 處理使用者互動相關功能
const controller = {
  //當前顯示狀態
  currentDisplayState: 'cards',
  //取得當前頁數
  getPageNow() {
    return document.querySelector('.page-now')
  },
  //改變電影顯示狀態
  onDataDisplayClicked(event) {
    event.preventDefault()
    const pageNow = this.getPageNow()
    const page = Number(pageNow.dataset.page)
    this.currentDisplayState = event.target.dataset.state
    view.renderMovies(this.currentDisplayState, page)
  },
  //電影清單內的顯示電影資訊和收藏按鈕
  onPanelClicked(event) {
    if (event.target.matches(".btn-show-movie")) {
      view.showMovieModal(event.target.dataset.id)
    } else if (event.target.matches(".btn-add-favorite")) {
      model.addToFavorite(Number(event.target.dataset.id))
      event.target.classList.remove('btn-info')
      event.target.classList.add('btn-success')
      event.target.innerText = '★'
    }
  },
  //電影關鍵字搜尋
  onSearchFormSubmitted(event) {
    event.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()

    model.filteredMovies = model.movies.filter((movie) =>
      movie.title.toLowerCase().includes(keyword)
    )

    if (model.filteredMovies.length === 0) {
      return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }

    view.renderMovies(this.currentDisplayState, 1)
    view.renderPaginator()
  },
  //依照所選頁數顯示電影清單
  onPaginatorClicked(event) {
    event.preventDefault()
    if (event.target.tagName !== "A") return
    const pageNow = this.getPageNow()
    pageNow.classList.remove('page-now','text-light','bg-primary')
    event.target.classList.add('page-now','text-light','bg-primary')
    view.renderMovies(this.currentDisplayState, event.target.dataset.page)
  },
}


// 初始化:取得所有使用者資料
axios
  .get(INDEX_URL)
  .then((response) => {
    model.movies.push(...response.data.results)
    view.renderPaginator()
    view.renderMovies(controller.currentDisplayState,1)
  })
  .catch((err) => console.log(err))

// 監聽click: 電影顯示的方式
dataDisplay.addEventListener("click", event => controller.onDataDisplayClicked(event))

// 監聽click: 顯示電影詳細資訊、加入收藏清單
dataPanel.addEventListener("click", event => controller.onPanelClicked(event))

// 監聽submit: 依照輸入關鍵字搜尋符合條件電影
searchForm.addEventListener("submit", event => controller.onSearchFormSubmitted(event))

// 監聽click: 依照選取頁數顯示該頁電影
paginator.addEventListener("click", event => controller.onPaginatorClicked(event))
