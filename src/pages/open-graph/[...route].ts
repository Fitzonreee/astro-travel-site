import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";

const articlesCollection = await getCollection("articles");
const pages = Object.fromEntries(
  articlesCollection.map(({ slug, data }) => [slug, data])
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "route",
  pages: pages,

  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.subtitle,
    bgGradient: [
      [255, 227, 160],
      [255, 255, 255],
    ],
    font: {
      title: {
        color: [2, 37, 71],
        size: 120,
        weight: "ExtraBold",
        lineHeight: 1,
      },
      description: {
        color: [2, 37, 71],
        size: 50,
        lineHeight: 1.2,
      },
    },
  }),
});