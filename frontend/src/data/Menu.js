const dashboardMenu = [
  {
    label: "Verslo būsena",
    link: "/apps/dashboard",
    icon: "ri-suitcase-line",
  },
  {
    label: "Taisoma vietoje",
    link: "/services/all",
    icon: "ri-number-1",
  },
  {
    label: "Neišvežta",
    link: "/services/to-send",
    icon: "ri-number-2",
  },
  {
    label: "Taisoma kitur",
    link: "/services/elsewhere",
    icon: "ri-number-3",
  },
  {
    label: "Sutaisyta, pranešta",
    link: "/services/waiting",
    icon: "ri-number-4",
  },
];

const applicationsMenu = [
  {
    label: "Registruoti naują",
    link: "/add-service",
    icon: "ri-menu-add-line",
  },
  {
    label: "Greitas Pardavimas",
    link: "/quick-add",
    icon: "ri-add-circle-line",
  },
  {
    label: "Išankstinės sąskaitos",
    link: "/add-pre-invoice",
    icon: "ri-add-circle-line",
  },
  {
    label: "Archyvas",
    link: "/services/archive",
    icon: "ri-inbox-unarchive-line",
  },
  {
    label: "Neapmokėta",
    link: "/services/archive-notpaid",
    icon: "ri-archive-drawer-line",
  },
  {
    label: "JB",
    link: "/services/jb",
    icon: "ri-money-dollar-circle-line",
  },
  {
    label: "Statistika",
    link: "/apps/statistics",
    icon: "ri-bar-chart-box-line",
  },
];

const pagesMenu = [
  {
    label: "Atsijungti",
    link: "/apps/chat",
    icon: "ri-question-answer-line",
  },
];

const inventoryMenu = [
  {
    label: "Pridėti inventorių",
    link: "/inventory/add",
    icon: "ri-file-add-line",
  },
  {
    label: "Visas inventorius",
    link: "/inventory",
    icon: "ri-file-paper-2-line",
  },
];

const uiElementsMenu = [
  {
    label: "Getting Started",
    icon: "ri-pencil-ruler-2-line",
    submenu: [
      {
        label: "Grid System",
        link: "/docs/layout/grid",
      },
      {
        label: "Columns",
        link: "/docs/layout/columns",
      },
      {
        label: "Gutters",
        link: "/docs/layout/gutters",
      },
    ],
  },
  {
    label: "Components",
    icon: "ri-suitcase-line",
    submenu: [
      {
        label: "Accordion",
        link: "/docs/com/accordions",
      },
      {
        label: "Alerts",
        link: "/docs/com/alerts",
      },
      {
        label: "Avatars",
        link: "/docs/com/avatars",
      },
      {
        label: "Badge",
        link: "/docs/com/badge",
      },
      {
        label: "Breadcrumbs",
        link: "/docs/com/breadcrumbs",
      },
      {
        label: "Buttons",
        link: "/docs/com/buttons",
      },
      {
        label: "Cards",
        link: "/docs/com/cards",
      },
      {
        label: "Carousel",
        link: "/docs/com/carousel",
      },
      {
        label: "Dropdown",
        link: "/docs/com/dropdown",
      },
      {
        label: "Images",
        link: "/docs/com/images",
      },
      {
        label: "List Group",
        link: "/docs/com/listgroup",
      },
      {
        label: "Markers",
        link: "/docs/com/markers",
      },
      {
        label: "Modal",
        link: "/docs/com/modal",
      },
      {
        label: "Nav & Tabs",
        link: "/docs/com/navtabs",
      },
      {
        label: "Offcanvas",
        link: "/docs/com/offcanvas",
      },
      {
        label: "Pagination",
        link: "/docs/com/pagination",
      },
      {
        label: "Placeholders",
        link: "/docs/com/placeholders",
      },
      {
        label: "Popovers",
        link: "/docs/com/popovers",
      },
      {
        label: "Progress",
        link: "/docs/com/progress",
      },
      {
        label: "Spinners",
        link: "/docs/com/spinners",
      },
      {
        label: "Toast",
        link: "/docs/com/toasts",
      },
      {
        label: "Tooltips",
        link: "/docs/com/tooltips",
      },
      {
        label: "Tables",
        link: "/docs/com/tables",
      },
    ],
  },
  {
    label: "Forms",
    icon: "ri-list-check-2",
    submenu: [
      {
        label: "Text Elements",
        link: "/docs/form/elements",
      },
      {
        label: "Selects",
        link: "/docs/form/selects",
      },
      {
        label: "Checks & Radios",
        link: "/docs/form/checksradios",
      },
      {
        label: "Range",
        link: "/docs/form/range",
      },
      {
        label: "Pickers",
        link: "/docs/form/pickers",
      },
      {
        label: "Layouts",
        link: "/docs/form/layouts",
      },
    ],
  },
  {
    label: "Charts & Graphs",
    icon: "ri-bar-chart-2-line",
    submenu: [
      {
        label: "ApexCharts",
        link: "/docs/chart/apex",
      },
      {
        label: "Chartjs",
        link: "/docs/chart/chartjs",
      },
    ],
  },
  {
    label: "Maps & Icons",
    icon: "ri-stack-line",
    submenu: [
      {
        label: "Leaflet Maps",
        link: "/docs/map/leaflet",
      },
      {
        label: "Vector Maps",
        link: "/docs/map/vector",
      },
      {
        label: "Remixicon",
        link: "/docs/icon/remix",
      },
      {
        label: "Feathericons",
        link: "/docs/icon/feather",
      },
    ],
  },
  {
    label: "Utilities",
    icon: "ri-briefcase-4-line",
    submenu: [
      {
        label: "Background",
        link: "/docs/util/background",
      },
      {
        label: "Border",
        link: "/docs/util/border",
      },
      {
        label: "Colors",
        link: "/docs/util/colors",
      },
      {
        label: "Divider",
        link: "/docs/util/divider",
      },
      {
        label: "Flex",
        link: "/docs/util/flex",
      },
      {
        label: "Sizing",
        link: "/docs/util/sizing",
      },
      {
        label: "Spacing",
        link: "/docs/util/spacing",
      },
      {
        label: "Opacity",
        link: "/docs/util/opacity",
      },
      {
        label: "Position",
        link: "/docs/util/position",
      },
      {
        label: "Typography",
        link: "/docs/util/typography",
      },
      {
        label: "Shadows",
        link: "/docs/util/shadows",
      },
      {
        label: "Extras",
        link: "/docs/util/extras",
      },
    ],
  },
];

export {
  dashboardMenu,
  applicationsMenu,
  pagesMenu,
  inventoryMenu,
  uiElementsMenu,
};
