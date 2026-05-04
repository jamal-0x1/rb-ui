import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Popular",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Shop",
    newTab: false,
    path: "/shop",
  },
  {
    id: 3,
    title: "Contact",
    newTab: false,
    path: "/contact",
  },
  // {
  //   id: 7,
  //   title: "blogs",
  //   newTab: false,
  //   path: "/",
  //   submenu: [
  //     { id: 71, title: "Blog Grid with sidebar", newTab: false, path: "/blogs/blog-grid-with-sidebar" },
  //     { id: 72, title: "Blog Grid", newTab: false, path: "/blogs/blog-grid" },
  //     { id: 73, title: "Blog details with sidebar", newTab: false, path: "/blogs/blog-details-with-sidebar" },
  //     { id: 74, title: "Blog details", newTab: false, path: "/blogs/blog-details" },
  //   ],
  // },
];
