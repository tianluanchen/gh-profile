type GenerateOption = {
    username: string;
    repoList: string[];
    api: string;
    theme: string;
    topLangsCardLayout: string;
    excludedTopLangs: string[];
    pinnedCardAlign: boolean;
    pinnedCardLargeGap: boolean;
};
type KeyToValue = { [key: string]: string | number | boolean };
class ReadmeGenerator {
    constructor(public opt: GenerateOption) {
        this.opt.api = new URL(this.opt.api).origin;
    }
    getParams(obj: KeyToValue) {
        const p = new URLSearchParams();
        Object.keys(obj).forEach((k) => {
            p.set(k, String(obj[k]));
        });
        return p.toString();
    }
    generateComment(comment: string) {
        return `<!-- ${comment} -->`;
    }
    generateHTML(conf: { link: string; imgURL: string; wrap?: string; imgAttrs?: KeyToValue }) {
        const { wrap, link, imgURL, imgAttrs } = conf;
        const basic = `<a href="${link}">\n\t<img ${
            !imgAttrs
                ? ""
                : Object.keys(imgAttrs)
                      .map((key) => `${key}="${imgAttrs[key]}"`)
                      .join(" ")
        }  src="${imgURL}" />\n</a>`;
        if (wrap) {
            return `<${wrap}>\n\t${basic}\n</${wrap}>`;
        }
        return basic;
    }
    getTopLangsHTML() {
        const link =
            this.opt.api +
            "/api/top-langs/?" +
            this.getParams({
                username: this.opt.username,
                theme: this.opt.theme,
                hide_title: false,
                layout: this.opt.topLangsCardLayout,
                hide: this.opt.excludedTopLangs
                    .map((e) => e.trim().toLowerCase())
                    .filter((e) => e !== "")
                    .join(",")
            });
        return (
            this.generateComment(`${this.opt.username}'s Most Used Languages`) +
            "\n\n" +
            this.generateHTML({
                link,
                imgURL: link,
                wrap: "p",
                imgAttrs: {
                    alt: `${this.opt.username}'s Most Used Languages`
                }
            })
        );
    }
    getStatHTML() {
        const link =
            this.opt.api +
            "/api?" +
            this.getParams({
                username: this.opt.username,
                theme: this.opt.theme,
                count_private: false,
                show_icons: true
            });
        return (
            this.generateComment(`${this.opt.username}'s GitHub Stats`) +
            "\n\n" +
            this.generateHTML({
                link,
                imgURL: link,
                wrap: "p",
                imgAttrs: {
                    alt: `${this.opt.username}'s GitHub Stats`
                }
            })
        );
    }
    getPinnedReposHTML() {
        if (this.opt.repoList.length <= 0) {
            return "";
        }
        return (
            this.generateComment(`${this.opt.username}'s GitHub Pinned Repositories`) +
            "\n\n" +
            this.opt.repoList
                .map((repo, index) => {
                    const imgURL =
                        this.opt.api +
                        "/api/pin?" +
                        this.getParams({
                            username: this.opt.username,
                            theme: this.opt.theme,
                            show_owner: false,
                            repo: repo
                        });
                    const imgAttrs: KeyToValue = {
                        alt: `${this.opt.username}/${repo}`
                    };
                    this.opt.pinnedCardAlign &&
                        this.opt.pinnedCardLargeGap &&
                        index % 2 === 0 &&
                        (imgAttrs["align"] = "left");
                    return this.generateHTML({
                        link: `https://github.com/${this.opt.username}/${repo}`,
                        wrap: this.opt.pinnedCardAlign ? undefined : "p",
                        imgURL,
                        imgAttrs
                    });
                })
                .reduce((p, c, index, arr) => {
                    let separator = "\n\n";
                    if (index === 0 || index === arr.length - 1) {
                        separator = "";
                    } else if (
                        this.opt.pinnedCardAlign &&
                        this.opt.pinnedCardLargeGap &&
                        index > 0 &&
                        index % 2 === 0
                    ) {
                        separator = "\n\n<br><br>\n\n";
                    }
                    return p + separator + c;
                }, "")
        );
    }
    generate() {
        return `${this.getStatHTML()}\n\n\n${this.getTopLangsHTML()}\n\n${this.getPinnedReposHTML()}`;
    }
}

export default function generateReadmeHTML(opt: GenerateOption) {
    return new ReadmeGenerator(opt).generate();
}
export type { GenerateOption };
