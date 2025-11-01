// .eleventy.js
export default function(eleventyConfig) {
    // copy generated episodes.json to site root (so client can fetch /episodes.json)
    eleventyConfig.addPassthroughCopy({ "_data/episodes.json": "episodes.json" });
    eleventyConfig.addPassthroughCopy("src/assets");

    return {
        //pathPrefix: "/lustpodden/",  // Match repo name
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site"
        }
    };
}