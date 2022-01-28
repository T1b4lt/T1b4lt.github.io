module.exports = {
  siteMetadata: {
    description: "Personal page of Guillermo Segovia",
    locale: "en",
    title: "Guillermo Segovia Fernandez",
  },
  plugins: [
    {
      resolve: "@wkocjan/gatsby-theme-intro",
      options: {
        basePath: "/",
        contentPath: "content/",
        showThemeLogo: false,
        theme: "gh-inspired",
      },
    },
  ],
};
