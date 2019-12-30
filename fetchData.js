const ALEXA_BASE_URL = 'https://data.alexa.com/data?cli=10&url='
const SIMILARWEB_BASE_URL = 'https://data.similarweb.com/api/v1/data?domain='
const show_Alexa_Link = document.querySelector('#alexa .row:nth-child(1) .link')
const show_Alexa_GLO_Number = document.querySelector('#alexa .row:nth-child(2) .left p')
const show_Alexa_LOC_Number = document.querySelector('#alexa .row:nth-child(2) .right')
const show_SimilarWeb_Link = document.querySelector('#similarWeb .row:nth-child(1) .link')
const show_SimilarWeb_GLO_Number = document.querySelector('#similarWeb .row:nth-child(2) .left p')
const show_SimilarWeb_LOC_Number = document.querySelector('#similarWeb .row:nth-child(2) .right p')
const inputUrl = document.querySelector('#url')

function fetchAlexa(inputAddress) {
  let result = {}
  return new Promise((resolve, reject) => {
    fetch("https://cors-anywhere.herokuapp.com/" + ALEXA_BASE_URL + inputAddress, {})
      .then((response) => {
        if (!response.ok) return resolve(result)
        return response.text();
      }).then((data) => {
        let idx1 = data.indexOf('TEXT')
        let idx2 = data.indexOf('" SOURCE')
        let idx3 = data.indexOf('NAME')
        let idx4 = data.indexOf('" RANK')
        let idx5 = data.indexOf('"/></SD>')
        let GlobalPopularity = data.slice(idx1, idx2).split('').filter((item) => {
          return Number(item) >= 0
        }).join('')
        let countryName = data.slice(idx3, idx4).split('').filter((item, index) => {
          return index > 5
        }).join('')
        let localPopularity = data.slice(idx4, idx5).split('').filter((item, index) => {
          return index > 7
        }).join('')

        result['GlobalPopularity'] = Number(GlobalPopularity)
        result['CountryName'] = countryName
        result['LocalPopularity'] = Number(localPopularity)

        resolve(result)
      }).catch(err => {
        console.log(err)
      })
  })
}

function fetchSimilarWeb(inputAddress) {
  let result = {}
  return new Promise((resolve, reject) => {
    fetch("https://cors-anywhere.herokuapp.com/" + SIMILARWEB_BASE_URL + inputAddress, {})
      .then((response) => {
        if (!response.ok) return resolve(result)
        return response.json();
      }).then((jsonData) => {
        result = jsonData
        resolve(result)
      }).catch((err) => {
        console.log(err);
      });
  })
}

function fetchURL() {
  let result = ''
  return new Promise((resolve, reject) => {
    chrome.tabs.getSelected((tab) => {
      let url = new URL(tab.url)
      result = url.hostname
      resolve(result)
    })
  })
}

(async () => {
  try {
    let inputAddress = await fetchURL()
    let alexaRes = await fetchAlexa(inputAddress)
    let similarWebRes = await fetchSimilarWeb(inputAddress)

    inputUrl.innerHTML = `<a target="_blank" class="btn btn-primary" href="https://${inputAddress}" role="button">${inputAddress}</a>`

    show_Alexa_Link.innerHTML = `
      <a target="_blank" class="btn btn-info" href="https://www.alexa.com/siteinfo/${inputAddress}" role="button">Link</a>
    `

    alexaRes.GlobalPopularity === 0 ? show_Alexa_GLO_Number.innerHTML = 'No Data' : show_Alexa_GLO_Number.innerHTML = `
      <p>${alexaRes.GlobalPopularity}</p>
    `

    alexaRes.LocalPopularity === 0 ? show_Alexa_LOC_Number.innerHTML = `
      <h5>Country/Region Rank</h5>
      <p>No Data</p>
    `:
      show_Alexa_LOC_Number.innerHTML = `
      <h5>${alexaRes.CountryName} Rank</h5>
      <p>${alexaRes.LocalPopularity}</p>
    `

    show_SimilarWeb_Link.innerHTML = `
      <a target="_blank" class="btn btn-info" href="https://www.similarweb.com/website/${inputAddress}" role="button">Link</a>
    `

    !similarWebRes["GlobalRank"] ? show_SimilarWeb_GLO_Number.innerHTML = 'No Data' : show_SimilarWeb_GLO_Number.innerHTML = `
      ${similarWebRes.GlobalRank.Rank}
    `

    !similarWebRes["CountryRank"] ? show_SimilarWeb_LOC_Number.innerHTML = 'No Data' : show_SimilarWeb_LOC_Number.innerHTML = `
      ${similarWebRes.CountryRank.Rank}
    `
  } catch (err) {
    console.log(err)
  }
})()


























