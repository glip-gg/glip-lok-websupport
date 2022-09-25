window.androidObj = function AndroidClass() { };

function callbackNativeSupportReady() {
    console.log('native support ready')
    init()
}

const CONTEST_END_TIME = 1664738855
const PACKAGE_NAME = 'com.nplusent.lok'
const PREF_LOK_IGN = 'lok_ign'

let ign
let selfData
let gameInstalled = false
let isSubmittingIgn = false


async function getLokUserInfo(ign) {
    let apiResponse = await fetch(`https://api-lok-live.leagueofkingdoms.com/api/stat/kingdom?name=${ign}`)
    let data = apiResponse.json()
    return data
}


function init() {
   contestEndCountdown()

   document.getElementById('wallet-winnings-container').addEventListener("click", function() {
    openDeeplink('https://glip.gg/wallet?source=lok-winnings')
    });

    document.getElementById('prize-pool-image').addEventListener("click", function() { 
        openDeeplink('https://glip.gg/openVideoDescription?url=https://android-hosted-assets.s3.ap-south-1.amazonaws.com/videos/PlayDapp_english.mp4&languages=hindi,english')
    });

    checkPackageInstalled(PACKAGE_NAME)

    setUserInfo()
}

function contestEndCountdown() {
    if (Date.now() / 1000 > CONTEST_END_TIME) {
        document.getElementById('contest-end-timer').innerHTML = 'Contest ended'
        return
    }
    document.getElementById('contest-end-timer').innerHTML = secondsToDhms(CONTEST_END_TIME - Date.now() / 1000)
    setTimeout(contestEndCountdown, 1000)
}

async function setUserInfo() {
    //todo check for winnings and show this accordingly
    document.getElementById('wallet-winnings-container').style.display = 'none'

    ign = localStorage.getItem(PREF_LOK_IGN)
    if (ign != null && ign != 'null') {
        console.log(ign)
        let data = await getLokUserInfo(ign)
        console.log(JSON.stringify(data))
        document.getElementById('user-level').innerHTML = data.level
        selfData = data
    }
    setCta()
    setLeaderboard()
}

async function setLeaderboard() {
    // temprary data, to be replaced with APi
    let leaderboardData = [
        {
            rank: 1,
            power: 6863,
            name: 'grylledbear',
            level: 16,
            prize: '$250 NFT'
        },
        {
            rank: 2,
            power: 56327,
            name: 'sh0x',
            level: 12,
            prize: '$150 NFT'
        }
    ]

    if (selfData) {
        document.getElementById('leaderboard-item-self').style.visibility = 'visible'
        document.getElementsByClassName('leaderboard-ign-self')[0].innerHTML = selfData.name + ' (you)'
        document.getElementsByClassName('leaderboard-power-self')[0].innerHTML = selfData.power
        document.getElementsByClassName('leaderboard-prize-self')[0].innerHTML = '$250 NFT'
        document.getElementsByClassName('leaderboard-rank-self')[0].innerHTML = '#123'
    }
 
    leaderboardData.forEach(function (item, index) {
        duplicateLeaderboardItem(`leaderboard-item-${index}`, item)
    })

    if (!selfData) {
        document.getElementById('leaderboard-item-self').style.display = 'none'
    }
}



async function setCta() {
    document.getElementById('type-ign-enabled').style.display = 'none'
    let buttonText = 'Install game'
    if (gameInstalled) {
        document.getElementById('type-ign-disabled').style.display = 'none'
         let ign = localStorage.getItem(PREF_LOK_IGN)
         if (!ign) {
             buttonText = 'Enter In game Name'
             document.getElementById('install-subtitle').innerHTML = '⚠️ Make sure that your in game name is new'
         } else {
            document.getElementById('install-subtitle').style.display = 'none'
            if (selfData) {
                if (selfData.level < 20) {
                    buttonText = `Cross ${20 - selfData.level} levels to win $10 NFT`
                } else {
                    buttonText = 'Congrats! Keep playing to win more'
                }
            } else {
                buttonText = 'Loading...'
            }
           
         }
    } else {
         buttonText = 'Install game'
    }

    document.getElementById('cta').innerHTML = buttonText

    document.getElementById('cta').addEventListener("click", async  function() { 
        if (isSubmittingIgn) {
            isSubmittingIgn = false
            let submittedIgn = document.getElementById("type-ign-enabled").value
            document.getElementById('cta').innerHTML = 'Verifying...'
            let info = await getLokUserInfo(submittedIgn)
            if (info.result) {
                // TODO need to add level/power zero check to make sure only new users are allowed
                localStorage.setItem(PREF_LOK_IGN, submittedIgn)
                setUserInfo()
                showToastMessage('In game name successfully added')
            } else {
                showToastMessage('Invalid in game name. Make sure that this IGN exists in game')
            }
            return
        }
        if (gameInstalled) {
            let ign = localStorage.getItem(PREF_LOK_IGN)
            if (!ign) {
                document.getElementById('type-ign-enabled').style.display = 'flex'
                document.getElementById("type-ign-enabled").focus();
                document.getElementById('cta').innerHTML = 'Submit'
                setTimeout(() => {
                    isSubmittingIgn = true
                }, 1000)
            }
        } else {
            openDeeplink('https://glip.gg/openExternal?url=aHR0cHM6Ly9wbGF5Lmdvb2dsZS5jb20vc3RvcmUvYXBwcy9kZXRhaWxzP2lkPWNvbS5ucGx1c2VudC5sb2smdXRtX3NvdXJjZT1nbGlw')
        }
    });
}

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    if( d == 0) {
      var hDisplay = h > 0 ? h + "h" : "";
      var mDisplay = m > 0 ? m + "m" : "";
      var sDisplay = s > 0 ? s + "s" : "";

      return hDisplay + mDisplay + sDisplay;
    } else {
      var dDisplay = d > 0 ? d + "d " : "";
      var hDisplay = h > 0 ? h + "h " : "";

      return dDisplay + hDisplay;
    }
  }

function duplicateLeaderboardItem(index, rankData) {
    var original = document.getElementById(`leaderboard-item-self`);

    var clone = original.cloneNode(true);
    clone.id = `leaderboard-item-${index}`

    clone.style.visibility = 'visible'

    let ignItem = clone.getElementsByClassName('leaderboard-ign-self')[0]
    ignItem.id = `leaderboard-ign-${index}`
    ignItem.innerHTML = rankData.name

    let prizeItem = clone.getElementsByClassName('leaderboard-prize-self')[0]
    prizeItem.id = `leaderboard-prize-${index}`
    prizeItem.innerHTML = rankData.prize

    let powerItem = clone.getElementsByClassName('leaderboard-power-self')[0]
    powerItem.id = `leaderboard-power-${index}`
    powerItem.innerHTML = rankData.power

    let rankItem = clone.getElementsByClassName('leaderboard-rank-self')[0]
    rankItem.id = `leaderboard-rank-${index}`
    rankItem.innerHTML = "#" + rankData.rank

    original.parentNode.appendChild(clone);

    return clone
}

function getUserTokenInfo() {
    var nativeData = {};
    nativeData['key'] = 3;
    window.androidObj.nativeSupport(JSON.stringify(nativeData));
}

function checkPackageInstalled(packageName) {
    var nativeData = {};
    nativeData['key'] = 13;
    nativeData['packageName'] = packageName
    window.androidObj.nativeSupport(JSON.stringify(nativeData));
}


function showToastMessage(message) {
    var nativeData = {};
    nativeData['key'] = 11;
    nativeData['message'] = message;
    window.androidObj.nativeSupport(JSON.stringify(nativeData));
}

function openDeeplink(deeplink) {
    var nativeData = {};
    nativeData['key'] = 7;
    nativeData['deeplink'] = deeplink
    window.androidObj.nativeSupport(JSON.stringify(nativeData));
}

function callbackUserInfo(userId, token) {
    
}

function callbackActivityResume() {
    checkPackageInstalled(PACKAGE_NAME)
}

function callbackPackageInstalled(packageName, isInstalled) {
    gameInstalled = (String(isInstalled).toLowerCase() == "true")
    setCta()
}