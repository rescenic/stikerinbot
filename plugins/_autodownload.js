const { igdl, tiktok, twitter, pin } = require('../lib/scrape')
const { facebook } = require('../lib/facebook')
const { servers, yta, ytv } = require('../lib/y2mate')
const fetch = require('node-fetch')
let yts = require('yt-search')
let handler = m => m

handler.all = async function (m, { isPrems, isOwner }) {

    if (m.chat.endsWith('broadcast')) return
    let buf = { thumbnail: Buffer.alloc(0) }

    if (/^.*tiktok/i.test(m.text)) {
        // tiktok(m.text).then(async res => {
        //     let tiktok = JSON.stringify(res)
        //     let json = JSON.parse(tiktok)
        //     // m.reply(require('util').format(json))
        //     await this.sendVideo(m.chat, json.nowm, '*© stikerin*', m, { thumbnail: buf })
        // }).catch(_ => _)
        let res = await fetch(global.API('hardianto', '/api/download/tiktok', { url: m.text.split` `[0] }, 'apikey'))
        if (!res.ok) throw await `${res.status} ${res.statusText}`
        let json = await res.json()
        await m.reply(global.wait)
        await this.sendVideo(m.chat, json.wm, '© stikerin', m)
    }

    if (/^.*cocofun/i.test(m.text)) {
        let res = await fetch(global.API('jojo', '/api/cocofun-no-wm', { url: m.text.split` `[0] }))
        if (!res.ok) throw await res.text()
        let json = await res.json()
        await m.reply(global.wait)
        await this.sendVideo(m.chat, json.download, `© stikerin`, m)
    }

    if (/^.*(fb.watch|facebook.com)/i.test(m.text)) {
        facebook(m.text.split` `[0]).then(async res => {
            let fb = JSON.stringify(res)
            let json = JSON.parse(fb)
            m.reply(require('util').format(json))
            if (!json.status) throw json
            await m.reply(global.wait)
            await this.sendVideo(m.chat, json.data[1] != undefined ? json.data[1].url : json.data[0].url, '© stikerin', m)
        }).catch(_ => _)
    }

    if (/^.*instagram.com\/(p|reel|tv)/i.test(m.text)) {
        igdl(m.text.split` `[0]).then(async res => {
            let igdl = JSON.stringify(res)
            let json = JSON.parse(igdl)
            await m.reply(global.wait)
            for (let { downloadUrl, type } of json) {
                this.sendFile(m.chat, downloadUrl, 'ig' + (type == 'image' ? '.jpg' : '.mp4'), '© stikerin', m, 0, buf)
            }
        }).catch(_ => _)
    }

    if (/^.*(pinterest.com\/pin|pin.it)/i.test(m.text)) {
        pin(m.text.split` `[0]).then(async res => {
            let pin = JSON.stringify(res)
            let json = JSON.parse(pin)
            if (!json.status) throw `Tidak dapat diunduh`
            await m.reply(global.wait)
            await this.sendVideo(m.chat, json.data.url, `© stikerin`, m)
        }).catch(_ => _)
    }

    if (/^.*twitter.com\//i.test(m.text)) {
        twitter(m.text.split` `[0]).then(async res => {
            let twit = JSON.stringify(res)
            let json = JSON.parse(twit)
            let pesan = json.data.map((v) => `Link: ${v.url}`).join('\n------------\n')
            await m.reply(global.wait)
            for (let { url } of json.data) {
                this.sendFile(m.chat, url, 'ig' + (/mp4/i.test(url) ? '.mp4' : '.jpg'), `© stikerin`, m, 0, buf)
            }
        }).catch(_ => _)
    }

    if (/^https?:\/\/.*youtu/i.test(m.text)) {
        let results = await yts(m.text.split` `[0])
        let vid = results.all.find(video => video.seconds < 3600)
        if (!vid) throw 'Video/Audio Tidak ditemukan'
        let yt = false
        let usedServer = servers[0]
        for (let i in servers) {
            let server = servers[i]
            try {
                yt = await (yta)(vid.url, server)
                yt2 = await ytv(vid.url, server)
                usedServer = server
                break
            } catch (e) {
                m.reply(`Server ${server} error!${servers.length >= i + 1 ? '' : '\nmencoba server lain...'}`)
            }
        }
        if (yt === false) throw 'Semua server tidak bisa t_t'
        if (yt2 === false) throw 'Semua server tidak bisa t_t'
        let { dl_link, thumb, title, filesize, filesizeF } = yt
        await this.send2ButtonImg(m.chat, `
*Judul:* ${title}
*Ukuran File Audio:* ${filesizeF}
*Ukuran File Video:* ${yt2.filesizeF}
*Server y2mate:* ${usedServer}
          `.trim(),
            thumb, '© stikerin', 'AUDIO', `.yta ${vid.url}`, 'VIDEO', `.yt ${vid.url}`)
    }

}

handler.limit = true
module.exports = handler