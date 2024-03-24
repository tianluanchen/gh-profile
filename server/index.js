import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { load } from "cheerio";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(
    "/",
    express.static(path.join(__dirname, "./dist"), {
        index: "index.html",
        setHeaders(res, path, stat) {
            if ([".js", ".css"].some((e) => path.endsWith(e))) {
                res.setHeader("Cache-Control", "public, max-age=7776000");
            }
        }
    })
);

app.get("/query/:username", async (req, res) => {
    const username = req.params.username;
    if (/[^\-a-zA-Z0-9]/.test(username)) {
        res.status(400);
        res.type("text/plain");
        res.send("invalid username: " + username);
        return;
    }
    getAvatarAndRepos(username)
        .then((r) => {
            res.send(r);
        })
        .catch((e) => {
            res.status(400);
            res.send(`${e}`);
        });
});
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log("listening on port " + port);
});

/**
 *
 * @param {string} username
 */
async function getAvatarAndRepos(username) {
    const link = `https://github.com/${username}`;
    const res = await fetch(link, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache"
        }
    });
    if (res.status !== 200) {
        throw new Error(`wrong fetch status: ${res.statusText} ${res.status}`);
    }
    const text = await res.text();
    const $ = load(text);
    const avatar = $(".avatar.avatar-user").attr("src") || null;
    const repoList = [];
    $(".pinned-item-list-item-content a span").each(function (index, el) {
        repoList.push($(el).text());
    });
    return {
        avatar,
        repoList: repoList.filter((r) => r !== "")
    };
}
